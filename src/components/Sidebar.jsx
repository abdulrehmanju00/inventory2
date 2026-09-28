import React from 'react';
import { useAppStore } from '../store/AppStore';

export default function Sidebar({ currentRoute, onNavigate, mobileOpen, onCloseMobile }) {
  const { currentBranch, currentUser, logout } = useAppStore();

  const navSections = [
    {
      title: 'Operations',
      items: [
        { path: 'dashboard', label: 'Dashboard', icon: 'dashboard', activePrefixes: ['dashboard'] },
        { path: 'inventory', label: 'Inventory', icon: 'inventory_2', activePrefixes: ['inventory', 'ingredient-detail'] },
        { path: 'add-ingredient', label: 'Add Ingredient', icon: 'post_add', activePrefixes: ['add-ingredient'] },
        { path: 'add-stock', label: 'Add Stock', icon: 'library_add', activePrefixes: ['add-stock'] },
        { path: 'stock-counts', label: 'Stock Counts', icon: 'fact_check', activePrefixes: ['stock-counts', 'new-stock-count', 'stock-count-detail', 'stock-count-review'] },
        { path: 'wastage', label: 'Wastage', icon: 'delete_sweep', activePrefixes: ['wastage', 'new-wastage', 'wastage-detail'] },
        { path: 'transfers', label: 'Transfers', icon: 'swap_horiz', activePrefixes: ['transfers', 'new-transfer', 'transfer-detail'] }
      ]
    },
    {
      title: 'Purchasing',
      items: [
        { path: 'purchases', label: 'Purchases', icon: 'shopping_cart', activePrefixes: ['purchases', 'new-purchase', 'purchase-detail'] },
        { path: 'suppliers', label: 'Suppliers', icon: 'local_shipping', activePrefixes: ['suppliers', 'add-supplier', 'supplier-detail'] }
      ]
    },
    {
      title: 'Kitchen',
      items: [
        { path: 'recipes', label: 'Recipes', icon: 'menu_book', activePrefixes: ['recipes', 'add-recipe', 'recipe-detail'] },
        { path: 'production', label: 'Production', icon: 'skillet', activePrefixes: ['production', 'record-production'] }
      ]
    },
    {
      title: 'Management',
      items: [
        { path: 'reports', label: 'Reports', icon: 'bar_chart', activePrefixes: ['reports'] },
        { path: 'staff', label: 'Staff', icon: 'badge', activePrefixes: ['staff'] }
      ]
    },
    {
      title: 'System',
      items: [
        { path: 'settings', label: 'Settings', icon: 'settings', activePrefixes: ['settings'] }
      ]
    }
  ];

  const isItemActive = (item) => {
    if (currentRoute === item.path) return true;
    return item.activePrefixes.includes(currentRoute);
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

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/40 z-50 flex flex-col justify-between select-none transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Top Brand Header */}
          <div className="h-16 px-space-md flex items-center justify-between border-b border-outline-variant/30 shrink-0">
            <div
              className="flex items-center gap-space-sm cursor-pointer"
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-label-lg shadow-sm">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-[15px] font-semibold text-on-surface tracking-tight leading-tight">
                  Inventory & Operations
                </span>
                <span className="font-label-sm text-[11px] text-on-surface-variant font-normal">
                  Restaurant Portal
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
          <nav className="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-0.5">
            {navSections.map(section => (
              <div key={section.title}>
                <div className="px-space-md pt-2.5 pb-1 font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  {section.title}
                </div>
                {section.items.map(item => {
                  const active = isItemActive(item);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-space-sm px-space-md py-1.5 rounded-lg text-left transition-colors ${
                        active
                          ? 'bg-primary text-on-primary font-medium shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${active ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                        {item.icon}
                      </span>
                      <span className="font-label-md text-label-md">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User & Branch Info */}
        <div className="border-t border-outline-variant/30 p-space-sm space-y-space-xs bg-surface-container-lowest shrink-0">
          <div className="p-space-xs rounded-lg border border-outline-variant/30 bg-surface-container-low flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
              <span className="font-label-sm text-label-sm text-on-surface truncate font-medium">
                {currentUser?.branchName || currentBranch}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">unfold_more</span>
          </div>

          <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-low transition-colors">
            <div
              className="flex items-center gap-space-sm cursor-pointer flex-1 min-w-0"
              onClick={() => handleNavClick('staff')}
              title="View staff profile"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-label-md font-bold shrink-0">
                {currentUser?.initials || 'AR'}
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="font-label-md text-label-md text-on-surface font-medium leading-tight truncate">
                  {currentUser?.name || 'Ahmed Raza'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight truncate">
                  {currentUser?.role || 'Operations Lead'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
