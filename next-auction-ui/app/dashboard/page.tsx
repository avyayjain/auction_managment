'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getUserItems } from '../../src/api/user';
import { formatPrice, formatDateDDMMYYHHMM } from '../../src/lib/utils/time';
import Loader from '../../src/components/ui/Loader';

interface AuctionItem {
  item_id: number;
  name: string;
  start_time: string;
  end_time: string;
  current_bid: number | null;
  start_price: number;
  status: string | boolean;
  user_id: number;
  image_url?: string;
}

export default function Dashboard() {
  const [userItems, setUserItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to determine status text and color
  const getStatusDisplay = (status: string | boolean, startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Handle string status
    if (typeof status === 'string') {
      if (status === 'active') return { text: 'Active', color: 'text-green-600' };
      if (status === 'completed') return { text: 'Completed', color: 'text-red-600' };
      if (status === 'upcoming') return { text: 'Upcoming', color: 'text-yellow-600' };
    } 
    // Handle boolean status
    else if (typeof status === 'boolean') {
      if (status === true) return { text: 'Active', color: 'text-green-600' };
      if (status === false) return { text: 'Completed', color: 'text-red-600' };
    }
    
    // Fallback time-based calculation
    if (now < start) return { text: 'Upcoming', color: 'text-yellow-600' };
    if (now > end) return { text: 'Completed', color: 'text-red-600' };
    return { text: 'Active', color: 'text-green-600' };
  };

  useEffect(() => {
    async function fetchUserItems() {
      try {
        setLoading(true);
        const items = await getUserItems();
        setUserItems(items);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user items:', err);
        setError('Failed to load your auctions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserItems();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center h-[70vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-white border rounded-lg p-8 text-center shadow-md">
          <svg 
            className="w-16 h-16 mx-auto mb-4 text-blue-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          
          <h2 className="text-xl font-semibold mb-4">Sign In or Create an Account</h2>
          <p className="text-gray-600 mb-6">
            To view your auctions and place bids, please sign in to your account or create a new one.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Auctions</h1>
        <Link 
          href="/auctions/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Create New Auction
        </Link>
      </div>

      {userItems.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold mb-2">No Auctions Found</h2>
          <p className="text-gray-600 mb-6">You haven't created any auctions yet.</p>
          <Link 
            href="/auctions/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Create Your First Auction
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userItems.map((item) => {
            const { text: statusText, color: statusColor } = getStatusDisplay(
              item.status, 
              item.start_time, 
              item.end_time
            );
            
            return (
              <motion.div 
                key={item.item_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 font-medium">No Image</div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex flex-col mb-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-medium ${statusColor} ml-auto`}>
                        {statusText}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg line-clamp-2 leading-tight min-h-[3.5rem]">
                      {item.name}
                    </h3>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-sm text-gray-500">Current Bid</span>
                      <p className="font-bold text-lg text-blue-600">
                        {formatPrice(item.current_bid || item.start_price)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Ends At</span>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDateDDMMYYHHMM(item.end_time)}
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/auctions/${item.item_id}`} 
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    View Auction
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
} 