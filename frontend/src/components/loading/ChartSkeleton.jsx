import React from 'react';

/**
 * Chart Loading Skeleton
 * Professional loading state for charts and graphs
 */
export default function ChartSkeleton({ height = 'h-64' }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
      {/* Chart Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Chart Area */}
      <div className={`${height} bg-gray-100 rounded flex items-end justify-around p-4`}>
        {/* Animated bars */}
        {[60, 80, 50, 90, 70, 85, 65].map((height, i) => (
          <div
            key={i}
            className="bg-gray-200 rounded-t w-full mx-1"
            style={{
              height: `${height}%`,
              animationDelay: `${i * 100}ms`
            }}
          ></div>
        ))}
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
