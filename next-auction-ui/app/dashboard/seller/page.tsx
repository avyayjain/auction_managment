'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getUser } from '../../../src/utils/auth';
import { getUserItems } from '../../../src/api/user';
import { formatPrice, formatDateDDMMYYHHMM } from '../../../src/lib/utils/time';
import Loader from '../../../src/components/ui/Loader';

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

export default function SellerDashboard() {
  const router = useRouter();
  const [userItems, setUserItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    totalRevenue: 0
  });

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
    // Check if user is seller or admin
    const user = getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.user_type !== 'seller' && user.user_type !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    async function fetchSellerData() {
      try {
        setLoading(true);
        const items = await getUserItems();
        setUserItems(items);
        
        // Calculate stats
        const active = items.filter(item => 
          item.status === 'active' || item.status === true
        ).length;
        
        const completed = items.filter(item => 
          item.status === 'completed' || item.status === false
        ).length;
        
        const revenue = items
          .filter(item => item.status === 'completed' || item.status === false)
          .reduce((sum, item) => sum + (item.current_bid || 0), 0);
        
        setStats({
          totalAuctions: items.length,
          activeAuctions: active,
          completedAuctions: completed,
          totalRevenue: revenue
        });
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch seller data:', err);
        setError('Failed to load your auctions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchSellerData();
  }, [router]);

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
          <h2 className="text-xl font-semibold mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <Link 
          href="/dashboard/seller/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Create New Auction
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-gray-500 text-sm mb-1">Total Auctions</p>
          <h3 className="text-2xl font-bold">{stats.totalAuctions}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-gray-500 text-sm mb-1">Active Auctions</p>
          <h3 className="text-2xl font-bold text-green-600">{stats.activeAuctions}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-gray-500 text-sm mb-1">Completed Auctions</p>
          <h3 className="text-2xl font-bold text-blue-600">{stats.completedAuctions}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
          <h3 className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toFixed(2)}</h3>
        </div>
      </div>

      {/* My Auctions */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Auctions</h2>
          <Link 
            href="/dashboard/seller/auctions" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {userItems.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No Auctions Found</h3>
            <p className="text-gray-600 mb-6">You haven't created any auctions yet.</p>
            <Link 
              href="/dashboard/seller/create" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Create Your First Auction
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userItems.slice(0, 3).map((item) => {
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
    </div>
  );
} 