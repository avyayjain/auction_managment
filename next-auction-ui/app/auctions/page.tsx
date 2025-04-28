'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuctionItem, auctionService } from '../../src/api/auctions';
import AuctionList from '../../src/components/auctions/AuctionList';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AuctionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery || '');

  useEffect(() => {
    // Update search term when URL parameters change
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        
        // Prepare filter parameters
        const params: any = {};
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        const items = await auctionService.getItems(params);
        setAuctions(items);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch auctions', err);
        setError('Failed to load auctions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [searchTerm]);

  // Filter auctions by status
  const filteredAuctions = filter === 'all' 
    ? auctions 
    : auctions.filter(auction => 
        typeof auction.status === 'string' 
          ? auction.status === filter
          : (filter === 'active' && auction.status === true) || 
            (filter === 'completed' && auction.status === false)
      );

  const clearSearch = () => {
    setSearchTerm('');
    router.push('/auctions');
  };

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {searchTerm ? `Search Results: "${searchTerm}"` : 'Available Auctions'}
            </h1>
            
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Clear Search
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All Auctions
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full ${
                filter === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-full ${
                filter === 'upcoming' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('ended')}
              className={`px-4 py-2 rounded-full ${
                filter === 'ended' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Ended
            </button>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Error State - Changed to Login/Signup Prompt */}
          {error && !loading && (
            <div className="text-center py-20 max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">Ready to join our auction community?</h2>
              <p className="text-gray-600 mb-6">
                Sign up or log in to browse available auctions or create your own!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/login"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!loading && !error && filteredAuctions.length === 0 && (
            <div className="text-center py-20 max-w-xl mx-auto">
              <svg 
                className="w-16 h-16 mx-auto mb-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              
              <h2 className="text-xl font-semibold mb-2">No Auctions Available</h2>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `No auctions match the search term "${searchTerm}".` 
                  : filter === 'all' 
                    ? 'There are no auctions available at the moment. Check back soon!' 
                    : `There are no ${filter} auctions at the moment.`}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Show All Auctions
                  </button>
                )}
                
                {!searchTerm && filter === 'all' && (
                  <Link
                    href="/auctions/create"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create an Auction
                  </Link>
                )}
              </div>
            </div>
          )}
          
          {/* Auction List */}
          {!loading && !error && filteredAuctions.length > 0 && (
            <AuctionList auctions={filteredAuctions} />
          )}
        </motion.div>
      </div>
    </main>
  );
} 