'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auctionService } from '../../../src/api/auctions';

// Mock data in case the API is not running
const MOCK_SEARCH_RESULTS = [
  {
    item_id: 1,
    name: "Vintage Watch",
    current_bid: 250,
    start_price: 100
  },
  {
    item_id: 2,
    name: "Antique Furniture",
    current_bid: 500,
    start_price: 300
  },
  {
    item_id: 3,
    name: "Collectible Trading Cards",
    current_bid: null,
    start_price: 75
  }
];

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle clicks outside of search results to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for items when the query changes
  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setIsSearching(true);
      setShowResults(true);
      
      if (useMockData) {
        // Use mock data if API is not available
        const filteredResults = MOCK_SEARCH_RESULTS.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredResults);
      } else {
        // Search for items that match the query
        try {
          const items = await auctionService.getItems({ search: searchQuery });
          setSearchResults(items.slice(0, 5)); // Limit to 5 results for dropdown
        } catch (apiError) {
          console.error('API error, falling back to mock data:', apiError);
          setUseMockData(true);
          const filteredResults = MOCK_SEARCH_RESULTS.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filteredResults);
        }
      }
    } catch (error) {
      console.error('Error searching for items:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting an item from search results
  const handleSelectItem = (itemId: number) => {
    setShowResults(false);
    router.push(`/auctions/${itemId}`);
  };

  // Handle submitting the search form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(false);
    if (query.trim()) {
      router.push(`/auctions?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search auctions..."
            className="w-full h-10 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {isSearching && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search results dropdown */}
      {showResults && searchResults.length > 0 && (
        <div 
          ref={searchResultsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden border border-gray-200"
        >
          <ul>
            {searchResults.map((item) => (
              <li key={item.item_id} className="border-b border-gray-100 last:border-0">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  onClick={() => handleSelectItem(item.item_id)}
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    Current bid: ${item.current_bid || item.start_price}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              See all results
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 