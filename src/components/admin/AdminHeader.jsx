import React, { useState } from 'react';
import { useAppStore } from '../../store/AppStore';

export default function AdminHeader({ onOpenMobile, onNavigate }) {
  const { currentUser, logout } = useAppStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/95 backdrop-blur border-b border-outline-variant/40 z-30 px-4 lg:px-gutter-lg flex items-center justify-between select-none">
      {/* Left side: Mobile menu toggle + Context badge */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        <button
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          onClick={onOpenMobile}
          type="button"
          aria-label="Open admin menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-md text-label-md font-semibold text-primary">
              Platform Administration
            </span>
          </div>
          <span className="hidden sm:inline-block text-xs text-on-surface-variant">
            • Enterprise Control Plane
          </span>
        </div>
      </div>

      {/* Right side: Current Super Admin User & Logout */}
      <div className="flex items-center gap-space-sm">
        {/* User Identity Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(prev => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-left cursor-pointer group"
            title={`${currentUser?.name || 'Platform Admin'} (Super Admin)`}
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary font-bold font-label-sm">
              {currentUser?.initials || 'PA'}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-on-surface leading-tight">
                {currentUser?.name || 'Platform Admin'}
              </span>
              <span className="text-[11px] text-primary font-medium leading-tight">
                Super Admin
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-on-surface transition-colors hidden sm:inline">
              expand_more
            </span>
          </button>

          {/* User Popover Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-outline-variant/30">
                <p className="font-label-md font-semibold text-on-surface truncate">
                  {currentUser?.name || 'Platform Admin'}
                </p>
                <p className="text-[11px] text-on-surface-variant font-mono truncate">
                  {currentUser?.email || 'admin@platform.test'}
                </p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-wide">
                  Platform Super Admin
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate('admin-settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings</span>
                  <span>Platform Settings</span>
                </button>
              </div>

              <div className="pt-1 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-error">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Direct Logout CTA */}
        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-error-container/30 text-xs font-semibold text-error hover:border-error/40 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
