'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getUserBids, getUserWonItems } from '../../../src/api/user';
import { getUser } from '../../../src/utils/auth';
import { formatPrice, formatDateDDMMYYHHMM } from '../../../src/lib/utils/time';
import Loader from '../../../src/components/ui/Loader';

interface Bid {
  item_name: string;
  bid_amount: number;
  timestamp: string;
  item_id?: number;
}

interface WonItem {
  item_id: number;
  name: string;
  end_time: string;
  winning_bid: number;
  image_url?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [wonItems, setWonItems] = useState<WonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBids: 0,
    wonAuctions: 0,
    activeBids: 0,
    totalSpent: 0
  });

  useEffect(() => {
    // Check if user is authenticated
    const user = getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    async function fetchUserData() {
      try {
        setLoading(true);
        
        // Fetch user's bids and won items in parallel
        const [bids, won] = await Promise.all([
          getUserBids(),
          getUserWonItems()
        ]);
        
        setUserBids(bids);
        setWonItems(won);
        
        // Calculate stats
        const activeBidsCount = 5; // This would need to be calculated from the API response
        const totalSpent = won.reduce((sum, item) => sum + item.winning_bid, 0);
        
        setStats({
          totalBids: bids.length,
          wonAuctions: won.length,
          activeBids: activeBidsCount,
          totalSpent: totalSpent
        });
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load your data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
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
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <Link 
          href="/auctions" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Browse Auctions
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-gray-500 text-sm mb-1">Total Bids</p>
          <h3 className="text-2xl font-bold">{stats.totalBids}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-gray-500 text-sm mb-1">Active Bids</p>
          <h3 className="text-2xl font-bold text-green-600">{stats.activeBids}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-gray-500 text-sm mb-1">Won Auctions</p>
          <h3 className="text-2xl font-bold text-blue-600">{stats.wonAuctions}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-gray-500 text-sm mb-1">Total Spent</p>
          <h3 className="text-2xl font-bold text-purple-600">${stats.totalSpent.toFixed(2)}</h3>
        </div>
      </div>
      
      {/* Won Items */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Won Auctions</h2>
          <Link 
            href="/dashboard/user/won" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {wonItems.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No Won Auctions</h3>
            <p className="text-gray-600 mb-6">You haven't won any auctions yet.</p>
            <Link 
              href="/auctions" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Browse Auctions
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wonItems.slice(0, 3).map((item) => (
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
                  <h3 className="font-bold text-lg line-clamp-2 leading-tight min-h-[3.5rem] mb-3">
                    {item.name}
                  </h3>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-sm text-gray-500">Winning Bid</span>
                      <p className="font-bold text-lg text-blue-600">
                        ${item.winning_bid.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Ended On</span>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDateDDMMYYHHMM(item.end_time)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm font-medium inline-block mb-3">
                    Won
                  </div>
                  
                  <Link 
                    href={`/auctions/${item.item_id}`} 
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Recent Bids */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Bids</h2>
          <Link 
            href="/dashboard/user/bids" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {userBids.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No Bids Found</h3>
            <p className="text-gray-600 mb-6">You haven't placed any bids yet.</p>
            <Link 
              href="/auctions" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Browse Auctions
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Bid Amount</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userBids.slice(0, 5).map((bid, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{bid.item_name}</td>
                    <td className="px-4 py-3 text-blue-600 font-bold">${bid.bid_amount.toFixed(2)}</td>
                    <td className="px-4 py-3">{formatDateDDMMYYHHMM(bid.timestamp)}</td>
                    <td className="px-4 py-3">
                      {bid.item_id && (
                        <Link 
                          href={`/auctions/${bid.item_id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Auction
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 