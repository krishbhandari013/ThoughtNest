// client/src/components/common/SkeletonCard.jsx
import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      {/* Top Section - Writer Info Skeleton */}
      <div className="p-6 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar Skeleton */}
          <div className="w-11 h-11 rounded-full bg-gray-200"></div>
          
          {/* Writer Info Skeleton */}
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Middle Section - Content Skeleton */}
      <div className="px-6 pb-4">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
        
        {/* Content Preview Skeleton */}
        <div className="space-y-2 mt-3">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>

      {/* Bottom Section - Stats Skeleton */}
      <div className="px-6 pb-6 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;