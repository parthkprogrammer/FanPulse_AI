import React from 'react';

const badgeVariants = {
  live: 'bg-red-500/10 text-red-400 border-red-500/30',
  upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  gold: 'bg-cricket-gold/10 text-cricket-gold border-cricket-gold/30',
  silver: 'bg-slate-400/10 text-slate-300 border-slate-400/30',
  success: 'bg-cricket-green/10 text-cricket-green border-cricket-green/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  neutral: 'bg-pitch-elevated text-gray-300 border-pitch-border',
};

const badgeSizes = {
  xs: 'px-2 py-0.5 text-[10px] rounded',
  sm: 'px-2.5 py-0.5 text-xs rounded-md',
  md: 'px-3 py-1 text-sm rounded-lg',
};

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold border tracking-wide uppercase
        ${badgeVariants[variant] || badgeVariants.neutral}
        ${badgeSizes[size] || badgeSizes.sm}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {variant === 'live' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              variant === 'live'
                ? 'bg-red-500'
                : variant === 'gold'
                ? 'bg-amber-400'
                : variant === 'upcoming'
                ? 'bg-blue-400'
                : 'bg-cricket-green'
            }`}
          ></span>
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
