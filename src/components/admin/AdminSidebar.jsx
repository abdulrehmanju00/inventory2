import React from 'react';
import { useAppStore } from '../../store/AppStore';

export default function AdminSidebar({ currentRoute, onNavigate, mobileOpen, onCloseMobile }) {
  const { currentUser, logout } = useAppStore();

  const navItems = [
    {
      id: 'super-admin',
      label: 'Dashboard',
      icon: 'dashboard',
      path: 'super-admin'
    },
    {
      id: 'admin-restaurants',
      label: 'Restaurants',
      icon: 'storefront',
      path: 'admin-restaurants',
      activePrefixes: ['admin-restaurants', 'admin-add-restaurant', 'admin-restaurant-setup', 'admin-restaurant-detail', 'admin-branches', 'admin-branch-detail', 'admin-add-branch', 'admin-restaurant-users', 'admin-add-user']
    },
    {
      id: 'admin-users',
      label: 'Users',
      icon: 'group',
      path: 'admin-users'
    },
    {
      id: 'admin-plans',
      label: 'Plans',
      icon: 'layers',
      path: 'admin-plans'
    },
    {
      id: 'admin-settings',
      label: 'Platform Settings',
      icon: 'settings_suggest',
      path: 'admin-settings'
    }
  ];

  const isItemActive = (item) => {
    if (currentRoute === item.path) return true;
    if (item.activePrefixes && item.activePrefixes.includes(currentRoute)) return true;
    return false;
  };

  const handleNavClick = (path) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        id="admin-sidebar"
        className={`fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/40 z-50 flex flex-col justify-between select-none transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Top Admin Brand */}
          <div className="h-16 px-space-md flex items-center justify-between border-b border-outline-variant/30 shrink-0">
            <div
              className="flex items-center gap-space-sm cursor-pointer"
              onClick={() => handleNavClick('super-admin')}
            >
              <div className="w-8 h-8 rounded-lg bg-inverse-surface text-inverse-on-surface flex items-center justify-center font-bold text-label-lg shadow-sm">
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-[14px] font-bold text-on-surface tracking-tight leading-tight">
                  Restaurant Inventory & Operations
                </span>
                <span className="font-label-sm text-[11px] text-primary font-semibold">
                  Platform Administration
                </span>
              </div>
            </div>
            <button
              className="lg:hidden p-1 rounded-md text-on-surface-variant hover:bg-surface-container-low"
              onClick={onCloseMobile}
              type="button"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-1">
            <div className="px-space-md pt-2 pb-1 font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Platform Management
            </div>

            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-primary text-on-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Platform Admin Profile Card */}
        <div className="border-t border-outline-variant/30 p-space-sm bg-surface-container-lowest shrink-0">
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-space-sm truncate">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold font-label-sm shrink-0">
                {currentUser?.initials || 'PA'}
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight truncate">
                  {currentUser?.name || 'Platform Admin'}
                </span>
                <span className="text-[11px] text-primary font-medium leading-tight truncate">
                  Super Admin
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors cursor-pointer shrink-0"
              aria-label="Logout"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
