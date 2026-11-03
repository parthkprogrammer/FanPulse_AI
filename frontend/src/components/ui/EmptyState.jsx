import React from 'react';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center p-8 sm:p-12
        rounded-2xl bg-pitch-card border border-pitch-border max-w-lg mx-auto my-8
        ${className}
      `}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-pitch-elevated border border-pitch-border flex items-center justify-center mb-4 text-cricket-green shadow-inner">
          <Icon className="w-7 h-7" />
        </div>
      )}

      {title && (
        <h3 className="text-lg font-bold text-white tracking-tight">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
