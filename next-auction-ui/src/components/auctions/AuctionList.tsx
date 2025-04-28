'use client';

import { AuctionItem } from '../../api/auctions';
import Link from 'next/link';
import { formatPrice, formatDateDDMMYYHHMM } from '../../lib/utils/time';
import Countdown from '../ui/Countdown';

interface AuctionListProps {
  auctions: AuctionItem[];
}

export default function AuctionList({ auctions }: AuctionListProps) {
  // Get status text and color
  const getStatusDisplay = (auction: AuctionItem) => {
    const now = new Date();
    const startTime = new Date(auction.start_time);
    const endTime = new Date(auction.end_time);
    
    // Default display based on status
    if (typeof auction.status === 'string') {
      if (auction.status === 'active') return { text: 'Active', color: 'text-green-600' };
      if (auction.status === 'completed') return { text: 'Completed', color: 'text-red-600' };
      if (auction.status === 'upcoming') return { text: 'Upcoming', color: 'text-yellow-600' };
    } else {
      // Boolean status (from API)
      if (auction.status === true) return { text: 'Active', color: 'text-green-600' };
      if (auction.status === false) return { text: 'Completed', color: 'text-red-600' };
    }
    
    // Fallback time-based calculation
    if (now < startTime) return { text: 'Upcoming', color: 'text-yellow-600' };
    if (now > endTime) return { text: 'Completed', color: 'text-red-600' };
    return { text: 'Active', color: 'text-green-600' };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions.map((auction) => {
        const { text: statusText, color: statusColor } = getStatusDisplay(auction);
        const isActive = statusText === 'Active';
        
        return (
          <div 
            key={auction.item_id} 
            className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {auction.image_url ? (
                <img 
                  src={auction.image_url} 
                  alt={auction.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 font-medium">No Image</div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex flex-col mb-3">
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${statusColor} ml-auto`}>{statusText}</span>
                </div>
                <h3 className="font-bold text-lg line-clamp-2 leading-tight min-h-[3.5rem]">{auction.name}</h3>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-sm text-gray-500">Current Bid</span>
                  <p className="font-bold text-lg text-blue-600">
                    {formatPrice(auction.current_bid || auction.start_price)}
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="text-sm text-gray-500">
                    {isActive ? 'Ends In' : 'Ends At'}
                  </span>
                  
                  {isActive ? (
                    <Countdown 
                      endTime={auction.end_time} 
                      className="text-right mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {formatDateDDMMYYHHMM(auction.end_time)}
                    </p>
                  )}
                </div>
              </div>
              
              <Link 
                href={`/auctions/${auction.item_id}`}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                View Auction
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
} 