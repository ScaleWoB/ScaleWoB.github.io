import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
};

// Skeleton for environment card
export const EnvironmentCardSkeleton: React.FC = () => {
  return (
    <div className="border-2 border-gray-200 bg-white p-4">
      <div className="flex items-start space-x-4">
        {/* Icon skeleton */}
        <Skeleton className="w-12 h-12 flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Title and badge */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>
              {/* Description */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Buttons skeleton */}
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton for loading state - shows grid of cards
interface EnvironmentGridSkeletonProps {
  count?: number;
}

export const EnvironmentGridSkeleton: React.FC<
  EnvironmentGridSkeletonProps
> = ({ count = 20 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <EnvironmentCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default Skeleton;
