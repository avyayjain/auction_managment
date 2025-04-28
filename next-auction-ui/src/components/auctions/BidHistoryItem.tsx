'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { format } from 'date-fns';
import { User } from '@/types/user';

export interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  bidder: User;
  isWinning?: boolean;
}

interface BidHistoryItemProps {
  bid: Bid;
  isLatest?: boolean;
  isCurrentUserBid?: boolean;
}

const BidHistoryItem: React.FC<BidHistoryItemProps> = ({
  bid,
  isLatest = false,
  isCurrentUserBid = false,
}) => {
  const formattedDate = format(new Date(bid.createdAt), 'MMM d, yyyy h:mm a');
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center p-3 mb-2 rounded-lg ${
        isLatest ? 'bg-green-50 border border-green-200' : 
        isCurrentUserBid ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
      }`}
    >
      <div className="flex-shrink-0 mr-3">
        <Image
          src={bid.bidder.avatarUrl || '/images/default-avatar.png'}
          alt={bid.bidder.name}
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>
      
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <p className="font-medium text-sm">
            {isCurrentUserBid ? 'You' : bid.bidder.name}
            {isLatest && <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Latest</span>}
          </p>
          <p className="font-bold text-base">${bid.amount.toLocaleString()}</p>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">{formattedDate}</p>
          {bid.isWinning && (
            <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
              Winning Bid
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BidHistoryItem; 