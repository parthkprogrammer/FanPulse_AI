import React from 'react';
import { Skeleton, SkeletonCard } from '../ui';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Featured Match Hero Skeleton */}
      <div className="p-6 sm:p-8 rounded-2xl bg-pitch-card border border-pitch-border space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Two Column Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-pitch-card border border-pitch-border space-y-4">
            <Skeleton className="h-6 w-52 rounded-md" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
