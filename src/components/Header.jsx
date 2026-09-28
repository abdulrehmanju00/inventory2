import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';

export default function Header({ onOpenMobile, onNavigate }) {
  const { currentBranch, currentUser, ingredients, setSelectedIngredientId, showToast, logout } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredQuickResults = searchTerm.trim()
    ? ingredients.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectResult = (ing) => {
    if (ing && ing.id) {
      setSelectedIngredientId(ing.id);
    }
    setSearchTerm('');
    setSearchFocused(false);
    onNavigate('ingredient-detail');
  };

  const criticalIngredients = ingredients.filter(i => i.status === 'Critical');
  const criticalCount = criticalIngredients.length;

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/95 backdrop-blur border-b border-outline-variant/40 z-30 px-4 lg:px-gutter-lg flex items-center justify-between">
      {/* Left side: Mobile menu toggle + Branch Selector + Updated status */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        <button
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          onClick={onOpenMobile}
          type="button"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div
          className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors"
          onClick={() => onNavigate('settings')}
          title="Branch settings"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">storefront</span>
          <span className="font-label-md text-label-md text-on-surface font-medium">{currentUser?.branchName || currentBranch}</span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-sm text-label-sm">Updated 2 min ago</span>
        </div>
      </div>

      {/* Right side: Search, Notifications, Help, User Profile */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-96">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Search ingredients, purchases, suppliers (⌘K)"
            className="w-full h-9 pl-9 pr-12 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-low border border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm pointer-events-none">
            ⌘K
          </div>

          {/* Quick Search Popover */}
          {searchFocused && filteredQuickResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg p-2 z-50">
              <div className="text-[11px] font-semibold text-on-surface-variant uppercase px-2 py-1">
                Ingredients Matching "{searchTerm}"
              </div>
              {filteredQuickResults.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">{item.name}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{item.category} • {item.location}</span>
                  </div>
                  <span className="font-numeric-table font-semibold text-body-sm text-on-surface">
                    {item.currentStock} {item.stockUnit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications and Help */}
        <div className="flex items-center gap-space-xs relative">
          <button
            type="button"
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {criticalCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-container-lowest">
                {criticalCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                <span className="font-label-md text-label-md font-semibold text-on-surface">Active Alerts</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  criticalCount > 0 ? 'bg-error-container text-on-error-container' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {criticalCount > 0 ? `${criticalCount} Critical` : 'All Healthy'}
                </span>
              </div>
              <div className="divide-y divide-outline-variant/20 max-h-64 overflow-y-auto mt-2">
                {criticalIngredients.length > 0 ? (
                  criticalIngredients.map(item => (
                    <div
                      key={item.id}
                      className="py-2 cursor-pointer hover:bg-surface-container-low px-1 rounded transition-colors"
                      onClick={() => { setShowNotifications(false); onNavigate('inventory'); }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-error"></span>
                        <span className="font-label-md text-label-md font-medium text-on-surface">{item.name} is Critical</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {item.currentStock} {item.stockUnit} remaining · Min required is {item.minStock} {item.stockUnit}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px] text-tertiary-container block mb-1">check_circle</span>
                    All stock levels healthy. No critical shortages.
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => showToast('Help documentation: Restaurant Operations Guide v2.4', 'success', 'Documentation')}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
            title="Help & Documentation"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
        </div>

        <div className="h-6 w-px bg-outline-variant/40 hidden sm:block"></div>

        {/* User identity & Menu Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(prev => !prev)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-container-low transition-colors group text-left cursor-pointer"
            title={`${currentUser?.name || 'Ahmed Raza'} (${currentUser?.role || 'Operations Lead'})`}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-label-sm font-bold">
              {currentUser?.initials || 'AR'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-label-md text-label-md font-semibold text-on-surface leading-tight">
                {currentUser?.name || 'Ahmed Raza'}
              </span>
              <span className="text-[11px] text-secondary leading-tight">
                {currentUser?.role || 'Operations Lead'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-on-surface transition-colors hidden sm:inline">
              expand_more
            </span>
          </button>

          {/* User Dropdown Menu with Logout */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-outline-variant/30">
                <p className="font-label-md font-semibold text-on-surface truncate">
                  {currentUser?.name || 'Ahmed Raza'}
                </p>
                <p className="text-[11px] text-secondary truncate">
                  {currentUser?.email || 'operations@restaurant.test'}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-primary font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>{currentUser?.role || 'Operations Lead'}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate('staff');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">badge</span>
                  <span>Staff Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings</span>
                  <span>Workspace Settings</span>
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
      </div>
    </header>
  );
}
