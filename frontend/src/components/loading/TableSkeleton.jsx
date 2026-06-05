import React from 'react';

/**
 * Table Loading Skeleton
 * Professional loading state for tables
 */
export default function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center p-4 space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-200 rounded ${
                i === 0 ? 'w-32' : 'flex-1'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center p-4 space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`h-4 bg-gray-200 rounded ${
                  colIndex === 0 ? 'w-32' : 'flex-1'
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
