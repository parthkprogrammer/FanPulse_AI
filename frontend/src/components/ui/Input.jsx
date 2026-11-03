import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  id,
  className = '',
  required = false,
  disabled = false,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;
  const helperId = inputId ? `${inputId}-helper` : undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-gray-300"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`
            w-full rounded-lg bg-pitch-dark text-white placeholder-gray-500 text-sm
            border transition-colors duration-150
            focus:outline-none focus:ring-1
            disabled:opacity-50 disabled:cursor-not-allowed
            ${LeftIcon ? 'pl-9' : 'pl-3.5'}
            ${RightIcon || error ? 'pr-9' : 'pr-3.5'}
            py-2.5
            ${error
              ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/30'
              : 'border-pitch-border hover:border-gray-500 focus:border-cricket-green focus:ring-cricket-green/30'
            }
            ${className}
          `}
          {...props}
        />

        {error ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-red-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        ) : RightIcon ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
            <RightIcon className="w-4 h-4" />
          </div>
        ) : null}
      </div>

      {error && (
        <p id={errorId} className="text-xs text-red-400 flex items-center gap-1 mt-1">
          <span>{error}</span>
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="text-xs text-gray-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
