'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuctionDetails, { Auction } from '@/components/auctions/AuctionDetails';
import { User } from '@/types/user';

// Mock data for demonstration purposes
const mockAuction: Auction = {
  id: '1',
  title: 'Vintage Camera Collection',
  description: 'A rare collection of vintage cameras from the 1950s. This collection includes 5 cameras in excellent condition, all fully functional. The collection includes a Leica M3, Rolleiflex 2.8F, Nikon S2, Canon P, and a Contax IIa. These are perfect for display or for use by photography enthusiasts.',
  imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000',
  startingPrice: 500,
  currentPrice: 750,
  startDate: '2023-11-01T10:00:00Z',
  endDate: '2023-12-30T23:59:59Z',
  status: 'active',
  seller: {
    id: '101',
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  bids: [
    {
      id: 'bid1',
      amount: 750,
      createdAt: '2023-11-20T14:35:22Z',
      bidder: {
        id: '102',
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg'
      }
    },
    {
      id: 'bid2',
      amount: 700,
      createdAt: '2023-11-19T10:12:45Z',
      bidder: {
        id: '103',
        name: 'Bob Williams',
        email: 'bob.w@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
      }
    },
    {
      id: 'bid3',
      amount: 650,
      createdAt: '2023-11-18T09:22:10Z',
      bidder: {
        id: '104',
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg'
      }
    },
    {
      id: 'bid4',
      amount: 600,
      createdAt: '2023-11-15T16:45:30Z',
      bidder: {
        id: '105',
        name: 'Michael Brown',
        email: 'michael.b@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg'
      }
    },
    {
      id: 'bid5',
      amount: 550,
      createdAt: '2023-11-10T11:30:15Z',
      bidder: {
        id: '103',
        name: 'Bob Williams',
        email: 'bob.w@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
      }
    }
  ],
  categories: ['Electronics', 'Vintage', 'Photography']
};

// Mock current user for demonstration
const mockCurrentUser: User = {
  id: '103',
  name: 'Bob Williams',
  email: 'bob.w@example.com',
  avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg'
};

export default function AuctionPage() {
  const params = useParams();
  const router = useRouter();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, you would fetch the auction data from an API
    // For this demo, we'll use the mock data
    const fetchAuction = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real app: const response = await fetch(`/api/auctions/${params.id}`);
        // const data = await response.json();
        
        setAuction(mockAuction);
        setLoading(false);
      } catch (err) {
        setError('Failed to load auction details');
        setLoading(false);
      }
    };

    fetchAuction();
  }, [params.id]);

  const handlePlaceBid = async (amount: number): Promise<void> => {
    // In a real application, you would send the bid to your API
    // For this demo, we'll simulate a successful bid
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a new bid
    const newBid = {
      id: `bid${Date.now()}`,
      amount,
      createdAt: new Date().toISOString(),
      bidder: mockCurrentUser
    };
    
    // Update the auction with the new bid
    if (auction) {
      setAuction({
        ...auction,
        currentPrice: amount,
        bids: [newBid, ...auction.bids]
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !auction) {
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

  return (
    <main className="min-h-screen py-8 bg-gray-50">
      <AuctionDetails 
        auction={auction} 
        currentUser={mockCurrentUser} 
        onPlaceBid={handlePlaceBid}
      />
    </main>
  );
} 