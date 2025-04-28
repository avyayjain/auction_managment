'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getUserBids } from '../../src/api/user';
import { formatPrice } from '../../src/lib/utils/time';

interface BidHistory {
  item_name: string;
  bid_amount: number;
  timestamp: string;
}

export default function ProfilePage() {
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isServerDown, setIsServerDown] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/profile');
      return;
    }
    
    const fetchBidHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const bids = await getUserBids();
        setBidHistory(bids);
        
        // If we got here, server is up
        if (isServerDown) {
          setIsServerDown(false);
        }
      } catch (err: any) {
        console.error('Error fetching bid history:', err);
        if (err.message.includes('Cannot connect to the server')) {
          setError('Cannot connect to auction server. Please try again later.');
          setIsServerDown(true);
        } else {
          setError('Failed to load bid history. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBidHistory();
  }, [user, router, isServerDown]);
  
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setIsServerDown(false); // This will trigger the useEffect to run again
  };
  
  if (!user) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">User Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Name:</span>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{user.email_id}</p>
              </div>
              <div>
                <span className="text-gray-500">Account Type:</span>
                <p className="font-medium capitalize">{user.user_type}</p>
              </div>
            </div>
          </div>
          
          <div className="md:border-l md:pl-6">
            <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/change-password')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Bid History</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded"
            >
              Retry Connection
            </button>
          </div>
        ) : bidHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You haven't placed any bids yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bid Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bidHistory.map((bid, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="font-medium text-gray-900 break-words max-w-xs">{bid.item_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-blue-600 font-medium">{formatPrice(bid.bid_amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-500">
                        {new Date(bid.timestamp).toLocaleString()}
                      </div>
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