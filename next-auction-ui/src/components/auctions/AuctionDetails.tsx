'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import BidHistoryItem, { Bid } from './BidHistoryItem';
import { User } from '@/types/user';

export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startingPrice: number;
  currentPrice: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  seller: User;
  bids: Bid[];
  categories: string[];
}

interface AuctionDetailsProps {
  auction: Auction;
  currentUser?: User | null;
  onPlaceBid?: (amount: number) => Promise<void>;
}

const AuctionDetails: React.FC<AuctionDetailsProps> = ({
  auction,
  currentUser,
  onPlaceBid,
}) => {
  const [bidAmount, setBidAmount] = useState<string>((auction.currentPrice + 10).toString());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = auction.status === 'active';
  const isEnded = auction.status === 'ended';
  const timeRemaining = new Date(auction.endDate).getTime() - Date.now();
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  const formattedStartDate = format(new Date(auction.startDate), 'MMM d, yyyy');
  const formattedEndDate = format(new Date(auction.endDate), 'MMM d, yyyy');

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    
    if (isNaN(amount)) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    if (amount <= auction.currentPrice) {
      setError(`Bid must be higher than current price: $${auction.currentPrice}`);
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (onPlaceBid) {
        await onPlaceBid(amount);
        setBidAmount((amount + 10).toString()); // Increment for next bid
      }
    } catch (err) {
      setError('Failed to place bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image and Seller Info */}
        <div>
          <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
            <Image
              src={auction.imageUrl || '/images/placeholder.png'}
              alt={auction.title}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex items-center mt-4 p-4 bg-gray-50 rounded-lg">
            <Image
              src={auction.seller.avatarUrl || '/images/default-avatar.png'}
              alt={auction.seller.name}
              width={50}
              height={50}
              className="rounded-full mr-4"
            />
            <div>
              <h3 className="font-medium">Seller</h3>
              <p className="text-gray-700">{auction.seller.name}</p>
            </div>
          </div>
        </div>
        
        {/* Right Column - Details and Bidding */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{auction.title}</h1>
          
          <div className="flex items-center space-x-2 mb-4">
            {auction.categories.map((category) => (
              <span key={category} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {category}
              </span>
            ))}
          </div>
          
          <div className="border-t border-b py-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Current Bid:</span>
              <span className="font-bold text-xl">${auction.currentPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Starting Price:</span>
              <span>${auction.startingPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                isActive ? 'text-green-600' : 
                isEnded ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Start Date:</span>
              <span>{formattedStartDate}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">End Date:</span>
              <span>{formattedEndDate}</span>
            </div>
            
            {isActive && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-blue-800 font-medium">Time Remaining:</p>
                <p className="text-lg font-bold">{daysRemaining}d {hoursRemaining}h</p>
              </div>
            )}
          </div>
          
          {isActive && currentUser && (
            <form onSubmit={handleBidSubmit} className="mb-8">
              <h3 className="font-medium mb-2">Place Your Bid</h3>
              
              {error && (
                <p className="text-red-600 text-sm mb-2">{error}</p>
              )}
              
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter bid amount"
                    min={auction.currentPrice + 1}
                    step="0.01"
                    disabled={isSubmitting}
                  />
                </div>
                
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
                </motion.button>
              </div>
            </form>
          )}
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 mb-6">{auction.description}</p>
          </div>
        </div>
      </div>
      
      {/* Bid History Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Bid History ({auction.bids.length})</h2>
        
        {auction.bids.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bids have been placed yet.</p>
        ) : (
          <div className="space-y-2">
            {auction.bids.map((bid, index) => (
              <BidHistoryItem 
                key={bid.id} 
                bid={bid}
                isLatest={index === 0}
                isCurrentUserBid={currentUser?.id === bid.bidder.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetails; 