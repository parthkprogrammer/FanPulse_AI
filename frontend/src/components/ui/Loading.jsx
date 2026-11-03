import React from 'react';
import { Loader2 } from 'lucide-react';

const spinnerColors = {
  green: 'text-cricket-green',
  gold: 'text-cricket-gold',
  white: 'text-white',
  gray: 'text-gray-400',
};

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export const Spinner = ({
  size = 'md',
  color = 'green',
  className = '',
  label = 'Loading...',
}) => {
  return (
    <div role="status" className={`inline-flex items-center gap-2 ${className}`}>
      <Loader2
        className={`animate-spin ${spinnerSizes[size] || spinnerSizes.md} ${spinnerColors[color] || spinnerColors.green}`}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
};

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-pitch-elevated/70 ${className}`}
      {...props}
    />
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`p-6 rounded-2xl bg-pitch-card border border-pitch-border space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
};

export const SkeletonTable = ({ rows = 4, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
};

export default Spinner;
