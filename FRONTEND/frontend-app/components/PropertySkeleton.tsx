'use client';

import React from 'react';

export const PropertySkeleton: React.FC = () => {
  return (
    <div className="px-2">
      <div className="bg-white rounded-lg shadow-md h-full border border-gray-100 animate-pulse">
        <div className="h-48 rounded-t-lg bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};

export const PropertySkeletonLoader: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, index) => (
        <PropertySkeleton key={index} />
      ))}
    </div>
  );
};
