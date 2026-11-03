import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) => {
  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content Container */}
      <div
        className={`
          relative w-full ${maxWidth} bg-pitch-card border border-pitch-border rounded-2xl
          shadow-2xl shadow-black/60 p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto
          animate-in fade-in zoom-in-95 duration-200
          ${className}
        `}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-pitch-elevated transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        {(title || description) && (
          <div className="mb-5 pr-8">
            {title && (
              <h2 id="modal-title" className="text-xl font-bold text-white tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export const ModalFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-pitch-border flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);

Modal.Footer = ModalFooter;

export default Modal;
