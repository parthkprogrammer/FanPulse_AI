import React from 'react';
import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary: 'bg-cricket-green hover:bg-cricket-green-dark text-pitch-dark font-semibold shadow-md shadow-cricket-green/20 focus-visible:ring-cricket-green',
  secondary: 'bg-pitch-elevated hover:bg-pitch-border text-gray-100 font-medium border border-pitch-border focus-visible:ring-gray-400',
  gold: 'bg-cricket-gold hover:bg-cricket-gold-dark text-pitch-dark font-semibold shadow-md shadow-cricket-gold/20 focus-visible:ring-cricket-gold',
  outline: 'bg-transparent hover:bg-pitch-elevated text-gray-300 hover:text-white border border-pitch-border hover:border-gray-500 focus-visible:ring-gray-400',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 focus-visible:ring-red-400',
  ghost: 'bg-transparent hover:bg-pitch-elevated text-gray-400 hover:text-gray-100 focus-visible:ring-gray-400',
};

const sizeStyles = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-lg gap-2.5',
};

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`
        inline-flex items-center justify-center select-none transition-all duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-dark
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4 flex-shrink-0" />
      ) : null}

      <span>{children}</span>

      {!isLoading && RightIcon ? (
        <RightIcon className="w-4 h-4 flex-shrink-0" />
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
