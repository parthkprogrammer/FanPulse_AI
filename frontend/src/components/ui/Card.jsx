import React from 'react';

const cardVariants = {
  default: 'bg-pitch-card border-pitch-border',
  elevated: 'bg-pitch-elevated border-pitch-border shadow-lg shadow-black/20',
  interactive: 'bg-pitch-card border-pitch-border hover:border-cricket-green/50 hover:shadow-glow-green transition-all duration-200 cursor-pointer',
  glow: 'bg-pitch-card border-cricket-green/30 shadow-glow-green',
};

const paddingSizes = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl border ${cardVariants[variant] || cardVariants.default}
        ${paddingSizes[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-base sm:text-lg font-bold text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-xs sm:text-sm text-gray-400 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`pt-4 mt-4 border-t border-pitch-border flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
