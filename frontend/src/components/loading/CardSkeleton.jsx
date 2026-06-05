import React from 'react';

/**
 * Card Loading Skeleton
 * Professional loading state for card components
 */
export default function CardSkeleton({ count = 1, className = '' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg p-6 shadow-sm animate-pulse ${className}`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>

          {/* Card Body */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>

          {/* Card Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </>
  );
}
