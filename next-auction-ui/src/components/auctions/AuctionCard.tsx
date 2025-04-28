'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AuctionItem } from '@/api/auctions';
import CountdownTimer from './CountdownTimer';
import { formatPrice } from '@/lib/utils/time';

interface AuctionCardProps {
  item: AuctionItem;
  featured?: boolean;
}

export default function AuctionCard({ item, featured = false }: AuctionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    item_id,
    name,
    description,
    image_url,
    current_bid,
    start_price,
    end_time,
    category,
  } = item;

  // Calculate current price
  const currentPrice = current_bid || start_price;
  
  // Placeholder image if none provided
  const imageSrc = image_url || '/images/placeholder.jpg';

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${
        featured ? 'border-2 border-blue-500 dark:border-blue-400' : ''
      }`}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/auction/${item_id}`} className="block">
        <div className="relative w-full h-36 overflow-hidden">
          {/* Image with hover zoom effect */}
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            priority={featured}
          />
          
          {/* Category tag */}
          {category && (
            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {category}
            </span>
          )}
          
          {/* Featured badge */}
          {featured && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>
        
        <div className="p-3">
          {/* Item Title */}
          <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
            {name}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-2">
            {description}
          </p>
          
          {/* Current bid */}
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Current bid:</span>
            <span className="font-medium text-green-600 dark:text-green-400 text-sm">
              {formatPrice(currentPrice)}
            </span>
          </div>
          
          {/* Countdown timer */}
          <div className="mb-3">
            <CountdownTimer endTime={end_time} size="sm" />
          </div>
          
          {/* Action button */}
          <div className="flex justify-center items-center">
            <motion.span
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs text-center py-1.5 px-2 rounded cursor-pointer"
              whileTap={{ scale: 0.97 }}
            >
              View & Bid
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 