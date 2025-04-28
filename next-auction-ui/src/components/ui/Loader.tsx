'use client';

import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'gray';
}

export default function Loader({ size = 'medium', color = 'blue' }: LoaderProps) {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-3',
    large: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-300',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
} 