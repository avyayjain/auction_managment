'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auctionService, AuctionItem, Bid as AuctionBid } from '../../../src/api/auctions';
import { useAuth } from '../../context/AuthContext';
import WebSocketService from '../../../src/services/WebSocketService';
import { formatDateDDMMYYHHMM } from '../../../src/lib/utils/time';
import Countdown from '../../../src/components/ui/Countdown';

// Types moved to proper location
export interface Bid {
  user_email: string;
  bid_amount: number;
  timestamp: string;
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { user } = useAuth();
  
  const [item, setItem] = useState<AuctionItem | null>(null);
  const [bidHistory, setBidHistory] = useState<AuctionBid[]>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidStatus, setBidStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bidError, setBidError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [winner, setWinner] = useState<{name: string, email: string} | null>(null);
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  
  // Setup WebSocket for real-time bidding
  useEffect(() => {
    if (!itemId || !user) return;
    
    let ws: WebSocketService | null = null;
    
    try {
      // Initialize WebSocket connection for this auction
      const wsUrl = `ws://localhost:8000/ws/bid/${itemId}?token=${localStorage.getItem('token')}`;
      ws = new WebSocketService(wsUrl);
      setWsService(ws);
      
      ws.onConnect(() => {
        console.log('Connected to bid WebSocket');
        setWsConnected(true);
      });
      
      ws.onMessage((data) => {
        console.log('Received WebSocket message:', data);
        if (data.error) {
          setBidError(data.error);
          setBidStatus('error');
          return;
        }
        
        // Update auction with new bid
        if (data.item_id && data.new_bid) {
          setItem(prev => {
            if (!prev) return null;
            return {
              ...prev,
              current_bid: data.new_bid
            };
          });
          
          // Refresh bid history
          fetchBidHistory();
          
          if (data.user_id === user.user_id) {
            setBidStatus('success');
          }
        }
      });
      
      ws.onDisconnect(() => {
        console.log('Disconnected from bid WebSocket');
        setWsConnected(false);
      });
      
      ws.onError((error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      });
      
      // Connect to WebSocket
      ws.connect();
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
    
    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.disconnect();
      }
    };
  }, [itemId, user]);
  
  // Fetch auction details and bid history
  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setLoading(true);
        const auctionItem = await auctionService.getItem(Number(itemId));
        setItem(auctionItem);
        setBidAmount(auctionItem.current_bid ? auctionItem.current_bid + 1 : auctionItem.start_price);
        setError(null);
        await fetchBidHistory();
        
        // If auction has ended and there's a winner, fetch winner details
        const now = new Date();
        const endTime = new Date(auctionItem.end_time);
        
        if (now > endTime && auctionItem.won_by) {
          try {
            const winnerDetails = await auctionService.getAuctionWinner(Number(itemId));
            if (winnerDetails) {
              setWinner(winnerDetails);
            }
          } catch (winnerErr) {
            console.error('Failed to load winner details', winnerErr);
          }
        }
      } catch (err) {
        console.error('Failed to load auction details', err);
        setError('Failed to load auction details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (itemId) {
      fetchAuctionDetails();
    }
  }, [itemId]);
  
  const fetchBidHistory = async () => {
    if (!itemId) return;
    
    try {
      const history = await auctionService.getItemBids(Number(itemId));
      setBidHistory(history);
    } catch (err) {
      console.error('Failed to load bid history', err);
    }
  };
  
  const handlePlaceBid = async () => {
    if (!user) {
      router.push('/login?redirect=/auctions/' + itemId);
      return;
    }
    
    if (!bidAmount || (item?.current_bid && bidAmount <= item.current_bid)) {
      setBidError('Bid amount must be higher than the current bid');
      setBidStatus('error');
      return;
    }
    
    try {
      setBidStatus('loading');
      setBidError(null);
      
      if (wsConnected && wsService) {
        // Send bid through WebSocket
        wsService.send(JSON.stringify({
          amount: bidAmount
        }));
      } else {
        // Fallback to REST API if WebSocket is not connected
        await auctionService.placeBid(Number(itemId), bidAmount);
        setBidStatus('success');
        
        // Refresh item and bid history
        const updatedItem = await auctionService.getItem(Number(itemId));
        setItem(updatedItem);
        await fetchBidHistory();
        
        // Set next bid amount
        if (updatedItem.current_bid) {
          setBidAmount(updatedItem.current_bid + 1);
        }
      }
    } catch (err: any) {
      console.error('Error placing bid', err);
      setBidError(err.message || 'Failed to place bid');
      setBidStatus('error');
    }
  };
  
  const getAuctionStatus = (): 'active' | 'ended' | 'upcoming' => {
    if (!item) return 'ended';
    
    const now = new Date();
    const endTime = new Date(item.end_time);
    const startTime = new Date(item.start_time);
    
    if (now > endTime) return 'ended';
    if (now < startTime) return 'upcoming';
    return 'active';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error || 'Auction not found'}</p>
        <button 
          onClick={() => router.push('/auctions')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Auctions
        </button>
      </div>
    );
  }
  
  const auctionStatus = getAuctionStatus();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white shadow-md rounded-lg overflow-hidden border">
        <div className="md:flex">
          {/* Left column - Item Image and Details */}
          <div className="md:w-2/3 p-8">
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  auctionStatus === 'active' ? 'bg-green-100 text-green-800' :
                  auctionStatus === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {auctionStatus.charAt(0).toUpperCase() + auctionStatus.slice(1)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-1 break-words">{item.name}</h1>
              <p className="text-sm text-gray-500">Item #{item.item_id}</p>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between border-b pb-4">
                <span className="text-gray-600">Starting Price:</span>
                <span className="font-medium">${item.start_price}</span>
              </div>
              
              <div className="flex justify-between border-b py-4">
                <span className="text-gray-600">Current Bid:</span>
                <span className="font-bold text-xl">${item.current_bid || item.start_price}</span>
              </div>
              
              <div className="flex justify-between py-4">
                <span className="text-gray-600">Auction Ends:</span>
                {auctionStatus === 'active' ? (
                  <Countdown 
                    endTime={item.end_time}
                    className="font-medium"
                    onComplete={() => router.refresh()}
                  />
                ) : (
                  <span className="font-medium">{formatDateDDMMYYHHMM(item.end_time)}</span>
                )}
              </div>
              
              {/* Display Winner Section */}
              {auctionStatus === 'ended' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Auction Ended</h3>
                  {winner ? (
                    <div>
                      <p className="text-blue-700">
                        Winner: <span className="font-medium">{winner.name}</span>
                      </p>
                      <p className="text-blue-700 text-sm mt-1">
                        Winning Bid: <span className="font-medium">${item.current_bid}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-blue-700">
                      This auction has ended with no winner.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Bid Form */}
            {auctionStatus === 'active' && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
                <div className="flex items-center">
                  <span className="text-gray-700 mr-2">$</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="border rounded-md px-4 py-2 w-32 mr-4"
                    min={item.current_bid ? item.current_bid + 1 : item.start_price}
                    step="1"
                  />
                  <button
                    onClick={handlePlaceBid}
                    disabled={bidStatus === 'loading'}
                    className={`px-6 py-2 rounded-md ${
                      bidStatus === 'loading' 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {bidStatus === 'loading' ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                </div>
                
                {bidStatus === 'success' && (
                  <p className="mt-2 text-green-600">Your bid was placed successfully!</p>
                )}
                
                {bidStatus === 'error' && bidError && (
                  <p className="mt-2 text-red-600">{bidError}</p>
                )}
                
                {!user && (
                  <p className="mt-2 text-sm text-gray-600">
                    You must be logged in to place a bid.{' '}
                    <a 
                      href={`/login?redirect=/auctions/${itemId}`}
                      className="text-blue-600 hover:underline"
                    >
                      Log in now
                    </a>
                  </p>
                )}
              </div>
            )}
            
            {auctionStatus === 'ended' && (
              <div className="mt-6 bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800">Auction Ended</h3>
                <p className="text-red-600">
                  This auction has ended. {item.won_by 
                    ? `The winner is user #${item.won_by}.` 
                    : 'There was no winner for this item.'}
                </p>
              </div>
            )}
            
            {auctionStatus === 'upcoming' && (
              <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800">Auction Upcoming</h3>
                <p className="text-yellow-600">
                  This auction hasn't started yet. It will begin on {new Date(item.start_time).toLocaleString()}.
                </p>
              </div>
            )}
          </div>
          
          {/* Right column - Bid History */}
          <div className="md:w-1/3 bg-gray-50 p-8 border-l">
            <h2 className="text-xl font-semibold mb-4">Bid History</h2>
            
            {bidHistory.length === 0 ? (
              <p className="text-gray-600">No bids yet. Be the first to bid!</p>
            ) : (
              <ul className="space-y-4">
                {bidHistory.map((bid, index) => (
                  <li key={index} className="border-b pb-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">${bid.bid_amount}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(bid.timestamp || bid.bid_time || '').toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm truncate">
                      {bid.user_email || bid.user_name}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/auctions')}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          ← Back to All Auctions
        </button>
      </div>
    </motion.div>
  );
} 