import React from 'react';

export const ToolCardSkeleton: React.FC = () => {
  return (
    <div className="relative overflow-hidden block bg-dark-secondary rounded-lg border border-border-dark p-6 animate-pulse shimmer">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 rounded-md bg-gray-700 flex-shrink-0 mt-1"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-4 bg-gray-700 rounded-full w-16"></div>
        <div className="h-4 bg-gray-700 rounded-full w-20"></div>
        <div className="h-4 bg-gray-700 rounded-full w-12"></div>
      </div>
    </div>
  );
};

export const ResultListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <div className="space-y-3 animate-pulse">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="relative overflow-hidden h-12 bg-dark-secondary rounded-md shimmer"></div>
            ))}
        </div>
    );
};

export const PageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-700 h-12 w-12"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
