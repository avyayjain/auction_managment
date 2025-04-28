'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { auctionService } from '@/api/auctions';
import { useAuth } from '@/lib/hooks/useAuth';
import useWebSocket from '@/lib/hooks/useWebSocket';
import { formatPrice } from '@/lib/utils/time';

// Form validation schema
const bidSchema = z.object({
  amount: z
    .number()
    .min(0.01, 'Bid amount must be greater than 0')
    .refine((val) => !isNaN(val), {
      message: 'Please enter a valid number',
    }),
});

type BidFormData = z.infer<typeof bidSchema>;

interface BidFormProps {
  itemId: number;
  currentBid: number;
  minBid?: number;
  isEnded?: boolean;
  onBidPlaced?: (amount: number) => void;
}

export default function BidForm({
  itemId,
  currentBid,
  minBid,
  isEnded = false,
  onBidPlaced,
}: BidFormProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [lastBid, setLastBid] = useState<any>(null);
  
  // Calculate minimum bid (10% higher than current bid or custom minBid)
  const calculatedMinBid = minBid || Math.ceil(currentBid * 1.1);
  
  // Form setup with validation
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: calculatedMinBid,
    },
  });
  
  // Setup WebSocket connection for real-time bidding
  const { isConnected, error: wsError, send } = useWebSocket({
    path: `/ws/bid/${itemId}`,
    autoConnect: !isEnded && isAuthenticated,
    events: {
      'new_bid': (data) => {
        setBidHistory((prev) => [...prev, data]);
        setLastBid(data);
        toast.info(`New bid: ${formatPrice(data.amount)} by ${data.username}`);
      },
      'bid_error': (data) => {
        toast.error(data.message);
      }
    },
    dependencies: [itemId, isAuthenticated, isEnded],
  });

  // Update min bid when current bid changes
  useEffect(() => {
    setValue('amount', calculatedMinBid);
  }, [currentBid, calculatedMinBid, setValue]);

  // Handle bid submission
  const onSubmit = async (data: BidFormData) => {
    if (!isAuthenticated) {
      toast.error('Please log in to place a bid');
      router.push(`/login?redirect=/auction/${itemId}`);
      return;
    }
    
    if (isEnded) {
      toast.error('This auction has ended');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isConnected) {
        // Use WebSocket for real-time bidding
        send('place_bid', { amount: data.amount });
        reset();
      } else {
        // Fallback to REST API if WebSocket is not connected
        const result = await auctionService.placeBid(itemId, data.amount);
        
        if (result.success) {
          toast.success('Bid placed successfully!');
          onBidPlaced?.(data.amount);
          reset();
        } else {
          toast.error(result.message || 'Failed to place bid');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow quick bid with suggested amounts
  const placeSuggestedBid = (multiplier: number) => {
    const suggestedAmount = Math.ceil(currentBid * multiplier);
    setValue('amount', suggestedAmount);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Place Your Bid</h3>
      
      {/* Connection status */}
      {!isEnded && !isAuthenticated ? (
        <div className="mb-4 text-amber-600 dark:text-amber-400 text-sm">
          Please log in to place a bid
        </div>
      ) : isEnded ? (
        <div className="mb-4 text-red-600 dark:text-red-400 text-sm">
          This auction has ended
        </div>
      ) : !isConnected && !wsError ? (
        <div className="mb-4 text-blue-600 dark:text-blue-400 text-sm animate-pulse">
          Connecting to bidding system...
        </div>
      ) : wsError ? (
        <div className="mb-4 text-red-600 dark:text-red-400 text-sm">
          Connection error. Using fallback bidding method.
        </div>
      ) : (
        <div className="mb-4 text-green-600 dark:text-green-400 text-sm">
          Connected to real-time bidding
        </div>
      )}
      
      {/* Current bid info */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-300">Current bid:</span>
        <span className="font-semibold text-lg text-green-600 dark:text-green-400">
          {formatPrice(currentBid)}
        </span>
      </div>
      
      {/* Last bidder info */}
      {lastBid && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Last bid by: <span className="font-medium">{lastBid.username}</span>
        </div>
      )}
      
      {/* Bid form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your bid (min: {formatPrice(calculatedMinBid)})
          </label>
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              id="amount"
              type="number"
              step="0.01"
              min={calculatedMinBid}
              className={`pl-7 pr-3 py-2 w-full rounded-md border ${
                errors.amount
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-700'
              } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500`}
              disabled={isSubmitting || isEnded || !isAuthenticated}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          
          {errors.amount && (
            <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
          )}
        </div>
        
        {/* Suggested bid amounts */}
        {!isEnded && isAuthenticated && (
          <div className="flex gap-2 justify-between">
            <button
              type="button"
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => placeSuggestedBid(1.1)}
            >
              +10%
            </button>
            <button
              type="button"
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => placeSuggestedBid(1.25)}
            >
              +25%
            </button>
            <button
              type="button"
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => placeSuggestedBid(1.5)}
            >
              +50%
            </button>
          </div>
        )}
        
        {/* Submit button */}
        <motion.button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isEnded || !isAuthenticated}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
        </motion.button>
      </form>
    </div>
  );
} 