import { format, formatDistanceToNow, formatDistance, isAfter, isBefore } from 'date-fns';

/**
 * Format date to human-readable format
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format countdown string (e.g., "2d 5h 30m 15s")
 */
export function formatCountdown(endTimeStr: string | Date): string {
  const endDate = typeof endTimeStr === 'string' ? new Date(endTimeStr) : endTimeStr;
  const now = new Date();
  
  // If auction has ended
  if (isBefore(endDate, now)) {
    return 'Ended';
  }
  
  const diffMs = endDate.getTime() - now.getTime();
  
  // Calculate time components
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  // Format the time
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Check if an auction is active
 */
export function isAuctionActive(endTimeStr: string | Date): boolean {
  const endDate = typeof endTimeStr === 'string' ? new Date(endTimeStr) : endTimeStr;
  const now = new Date();
  return isAfter(endDate, now);
}

/**
 * Format time remaining in a more readable form
 */
export function formatRemainingReadable(endTimeStr: string | Date): string {
  const endDate = typeof endTimeStr === 'string' ? new Date(endTimeStr) : endTimeStr;
  const now = new Date();
  
  if (isBefore(endDate, now)) {
    return 'Auction has ended';
  }
  
  return `Ends ${formatDistance(endDate, now)} from now`;
}

/**
 * Format a price to display as currency
 * @param price - The price to format
 * @param currency - The currency symbol to use (default: $)
 * @returns Formatted price string
 */
export const formatPrice = (price: number | null | undefined, currency: string = '$'): string => {
  if (price === null || price === undefined) {
    return `${currency}0`;
  }
  
  return `${currency}${price.toLocaleString()}`;
};

/**
 * Calculate remaining time from now to a future date
 */
export const calculateTimeRemaining = (endTime: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} => {
  const endTimeDate = typeof endTime === 'string' ? new Date(endTime) : endTime;
  const now = new Date();
  const difference = endTimeDate.getTime() - now.getTime();
  
  // If time is already passed
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  return {
    total: difference,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() < Date.now();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
};

/**
 * Format time remaining in a human-readable string
 */
export const formatTimeRemaining = (
  endTime: string | Date,
  format: 'long' | 'short' | 'compact' = 'long'
): string => {
  const remaining = calculateTimeRemaining(endTime);
  
  if (remaining.total <= 0) {
    return 'Ended';
  }
  
  if (format === 'compact') {
    if (remaining.days > 0) {
      return `${remaining.days}d ${remaining.hours}h`;
    }
    if (remaining.hours > 0) {
      return `${remaining.hours}h ${remaining.minutes}m`;
    }
    return `${remaining.minutes}m ${remaining.seconds}s`;
  }
  
  if (format === 'short') {
    if (remaining.days > 0) {
      return `${remaining.days}d ${remaining.hours}h ${remaining.minutes}m`;
    }
    if (remaining.hours > 0) {
      return `${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s`;
    }
    return `${remaining.minutes}m ${remaining.seconds}s`;
  }
  
  // Long format
  let parts = [];
  if (remaining.days > 0) {
    parts.push(`${remaining.days} day${remaining.days !== 1 ? 's' : ''}`);
  }
  if (remaining.hours > 0) {
    parts.push(`${remaining.hours} hour${remaining.hours !== 1 ? 's' : ''}`);
  }
  if (remaining.minutes > 0) {
    parts.push(`${remaining.minutes} minute${remaining.minutes !== 1 ? 's' : ''}`);
  }
  if (remaining.seconds > 0 && parts.length < 2) {
    parts.push(`${remaining.seconds} second${remaining.seconds !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
};

/**
 * Format date in DD/MM/YY HH:MM format
 * @param date The date to format
 * @returns Formatted date string in DD/MM/YY HH:MM format
 */
export function formatDateDDMMYYHHMM(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Get day, month, year, hours and minutes
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
  const year = dateObj.getFullYear().toString().slice(-2); // Get last 2 digits of year
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatCountdown,
  isAuctionActive,
  formatRemainingReadable,
  formatTimeRemaining,
  formatPrice,
  calculateTimeRemaining,
  isPast,
  isFuture,
  formatDateDDMMYYHHMM
}; 