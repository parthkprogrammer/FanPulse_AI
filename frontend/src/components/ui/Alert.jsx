import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const alertVariants = {
  error: {
    container: 'bg-red-500/10 border-red-500/30 text-red-300',
    iconColor: 'text-red-400',
    defaultIcon: AlertCircle,
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    iconColor: 'text-amber-400',
    defaultIcon: AlertTriangle,
  },
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    iconColor: 'text-emerald-400',
    defaultIcon: CheckCircle2,
  },
  info: {
    container: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    iconColor: 'text-blue-400',
    defaultIcon: Info,
  },
};

export const Alert = ({
  variant = 'error',
  title,
  children,
  onClose,
  className = '',
}) => {
  const config = alertVariants[variant] || alertVariants.error;
  const Icon = config.defaultIcon;

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 p-4 rounded-xl border text-xs sm:text-sm
        ${config.container}
        ${className}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />

      <div className="flex-1 space-y-1">
        {title && <h4 className="font-semibold text-white tracking-tight">{title}</h4>}
        <div className="leading-relaxed">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="p-1 -mr-1 -mt-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
