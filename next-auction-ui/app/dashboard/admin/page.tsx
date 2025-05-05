'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '../../../src/utils/auth';
import Loader from '../../../src/components/ui/Loader';

interface User {
  user_id: number;
  name: string;
  email_id: string;
  user_type: string;
}

interface AuctionItem {
  item_id: number;
  name: string;
  start_time: string;
  end_time: string;
  current_bid: number | null;
  start_price: number;
  status: string | boolean;
  user_id: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    const user = getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.user_type !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // These endpoints would need to be implemented in the backend
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        
        // For now, using mock data
        setUsers([
          { user_id: 1, name: 'John Doe', email_id: 'john@example.com', user_type: 'user' },
          { user_id: 2, name: 'Jane Smith', email_id: 'jane@example.com', user_type: 'seller' },
          { user_id: 3, name: 'Admin User', email_id: 'admin@example.com', user_type: 'admin' }
        ]);
        
        setItems([
          {
            item_id: 1,
            name: "Vintage Watch Collection",
            start_time: new Date(Date.now() - 3600000).toISOString(),
            end_time: new Date(Date.now() + 86400000).toISOString(),
            current_bid: 250,
            start_price: 200,
            status: 'active',
            user_id: 1
          },
          {
            item_id: 2,
            name: "Antique Wooden Furniture",
            start_time: new Date(Date.now() - 86400000).toISOString(),
            end_time: new Date(Date.now() + 172800000).toISOString(),
            current_bid: 500,
            start_price: 400,
            status: 'active',
            user_id: 2
          }
        ]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
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
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Management */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Users Management</h2>
            <Link 
              href="/dashboard/admin/users" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.user_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{user.user_id}</td>
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email_id}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.user_type === 'admin' 
                          ? 'bg-blue-100 text-blue-800' 
                          : user.user_type === 'seller'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Auctions Management */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Auctions Management</h2>
            <Link 
              href="/dashboard/admin/auctions" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Item Name</th>
                  <th className="px-4 py-2">Current Bid</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.item_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{item.item_id}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">
                      ${(item.current_bid || item.start_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'active' || item.status === true
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'completed' || item.status === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {typeof item.status === 'string' 
                          ? item.status.charAt(0).toUpperCase() + item.status.slice(1) 
                          : item.status ? 'Active' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 