import React from 'react';
import Card from './Card';

export const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'text-cricket-green',
  badgeText,
  badgeVariant = 'neutral',
  className = '',
}) => {
  return (
    <Card
      variant="interactive"
      padding="sm"
      className={`p-5 transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl bg-pitch-elevated ${color} border border-pitch-border/60`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
          {value}
        </span>

        {change && (
          <p className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1">
            <span>{change}</span>
          </p>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
