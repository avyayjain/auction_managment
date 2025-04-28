'use client';

import { useState, useEffect } from 'react';
import { calculateTimeRemaining, formatTimeRemaining } from '../../lib/utils/time';

interface CountdownTimerProps {
  endTime: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export default function CountdownTimer({ 
  endTime, 
  size = 'md',
  showLabels = true
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(endTime));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatTimeRemaining(endTime));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endTime]);
  
  return (
    <div className="text-center">
      <span className={`font-medium ${
        size === 'sm' ? 'text-sm' :
        size === 'lg' ? 'text-lg' :
        'text-md'
      }`}>
        {timeLeft}
      </span>
    </div>
  );
} 