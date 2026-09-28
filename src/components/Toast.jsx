import React from 'react';
import { useAppStore } from '../store/AppStore';

export default function Toast() {
  const { toast, hideToast } = useAppStore();

  if (!toast.show) return null;

  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div className="fixed top-20 right-6 z-50 transform transition-all duration-300 ease-out flex items-center gap-space-sm px-space-md py-space-sm rounded-xl shadow-xl max-w-md pointer-events-auto bg-inverse-surface text-inverse-on-surface">
      <span className={`material-symbols-outlined text-[20px] ${isError ? 'text-error' : isWarning ? 'text-amber-400' : 'text-primary-fixed'}`}>
        {isError ? 'error' : isWarning ? 'warning' : 'check_circle'}
      </span>
      <div className="flex flex-col min-w-0 pr-2">
        {toast.title && (
          <span className="font-label-md text-label-md font-semibold text-inverse-on-surface">
            {toast.title}
          </span>
        )}
        <span className="font-body-sm text-body-sm text-surface-container-high truncate">
          {toast.message}
        </span>
      </div>
      <button
        onClick={hideToast}
        type="button"
        className="p-1 text-surface-variant hover:text-inverse-on-surface ml-auto transition-colors"
        aria-label="Dismiss toast"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}
