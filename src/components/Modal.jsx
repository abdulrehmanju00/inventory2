import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/30 w-full ${maxWidth} z-10 overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Modal Header */}
        <div className="p-space-md border-b border-outline-variant/30 flex items-center justify-between shrink-0">
          <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">
            {title}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-space-md overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
