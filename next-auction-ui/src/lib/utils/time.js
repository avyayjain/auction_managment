/**
 * Format price with currency symbol
 */
export function formatPrice(price) {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return '$0';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericPrice);
}

/**
 * Calculate remaining time from now to a future date
 */
export const calculateTimeRemaining = (endTime) => {
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
 * Format time remaining in a human-readable string
 */
export const formatTimeRemaining = (endTime) => {
  const remaining = calculateTimeRemaining(endTime);
  
  if (remaining.total <= 0) {
    return 'Ended';
  }
  
  if (remaining.days > 0) {
    return `${remaining.days}d ${remaining.hours}h`;
  }
  
  if (remaining.hours > 0) {
    return `${remaining.hours}h ${remaining.minutes}m`;
  }
  
  return `${remaining.minutes}m ${remaining.seconds}s`;
};

export default {
  formatPrice,
  calculateTimeRemaining,
  formatTimeRemaining
}; 