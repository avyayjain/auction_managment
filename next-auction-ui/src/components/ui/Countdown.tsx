'use client';

import React, { useState, useEffect } from 'react';

interface CountdownProps {
  endTime: string | Date;
  className?: string;
  onComplete?: () => void;
}

export default function Countdown({ endTime, className = '', onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = end - now;
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true });
        
        if (onComplete) {
          onComplete();
        }
        return;
      }
      
      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds, isComplete: false });
    };
    
    // Calculate immediately on mount
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Clean up on unmount
    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  // Format the time values as two digits
  const formatNumber = (num: number): string => num.toString().padStart(2, '0');
  
  if (timeLeft.isComplete) {
    return <span className={className}>Ended</span>;
  }
  
  // Format as DD/HH/MM/SS
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {timeLeft.days > 0 && (
        <>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold">{formatNumber(timeLeft.days)}</span>
            <span className="text-xs opacity-70">days</span>
          </div>
          <span className="opacity-50">:</span>
        </>
      )}
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold">{formatNumber(timeLeft.hours)}</span>
        <span className="text-xs opacity-70">hrs</span>
      </div>
      <span className="opacity-50">:</span>
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold">{formatNumber(timeLeft.minutes)}</span>
        <span className="text-xs opacity-70">min</span>
      </div>
      <span className="opacity-50">:</span>
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold">{formatNumber(timeLeft.seconds)}</span>
        <span className="text-xs opacity-70">sec</span>
      </div>
    </div>
  );
} 