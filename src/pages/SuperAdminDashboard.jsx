import React from 'react';
import { useAppStore } from '../store/AppStore';

export default function SuperAdminDashboard({ onNavigate }) {
  const {
    platformRestaurants,
    platformBranches,
    platformMembers,
    setSelectedRestaurantId,
    platformActivity,
    formatDate
  } = useAppStore();

  const restaurants = platformRestaurants || [];

  // Dynamically derived KPI metrics from platform prototype data
  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(r => r.status === 'Active').length;
  const trialRestaurants = restaurants.filter(r => r.status === 'Trial').length;
  const suspendedRestaurants = restaurants.filter(r => r.status === 'Suspended').length;
  const totalBranches = (platformBranches && platformBranches.length > 0)
    ? platformBranches.length
    : restaurants.reduce((sum, r) => sum + (Number(r.branches) || 0), 0);
  const totalUsers = (platformMembers && platformMembers.length > 0)
    ? platformMembers.length
    : restaurants.reduce((sum, r) => sum + (Number(r.users) || 0), 0);

  // Attention Required items calculated dynamically from platform records
  const attentionItems = restaurants.filter(
    r => r.status === 'Suspended' || r.status === 'Trial' || r.setupStatus !== 'Completed'
  );

  const handleViewRestaurant = (restaurantId) => {
    if (setSelectedRestaurantId) {
      setSelectedRestaurantId(restaurantId);
    }
    onNavigate('admin-restaurant-detail');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Trial':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Suspended':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  const getSetupBadge = (setup) => {
    switch (setup) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  return (
    <div className="w-full flex flex-col pb-16 antialiased">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span className="text-primary font-semibold">Platform Overview</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">Global Dashboard</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface leading-tight mb-1">
            Platform Overview
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-3xl">
            Manage restaurants, platform users and account activity across the Restaurant Inventory & Operations platform.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('admin-add-restaurant')}
            className="flex items-center gap-space-xs px-space-md py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg shadow-sm transition-all font-label-md font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            <span>Add Restaurant</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS (Calculated from Platform Data) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md mb-space-lg">
        {/* Total Restaurants */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Total Restaurants
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-2 font-numeric-table">
            {totalRestaurants}
          </span>
          <span className="text-xs text-on-surface-variant mt-1">Platform tenant accounts</span>
        </div>

        {/* Active Restaurants */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-semibold">
            Active Restaurants
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-emerald-700 mt-2 font-numeric-table">
            {activeRestaurants}
          </span>
          <span className="text-xs text-on-surface-variant mt-1">Operational & in good standing</span>
        </div>

        {/* Trial Restaurants */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-blue-800 font-semibold">
            Trial Restaurants
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-blue-700 mt-2 font-numeric-table">
            {trialRestaurants}
          </span>
          <span className="text-xs text-on-surface-variant mt-1">Evaluation periods active</span>
        </div>

        {/* Suspended Restaurants */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-rose-800 font-semibold">
            Suspended
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-rose-700 mt-2 font-numeric-table">
            {suspendedRestaurants}
          </span>
          <span className="text-xs text-on-surface-variant mt-1">Access restricted</span>
        </div>

        {/* Total Branches */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Total Branches
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-primary mt-2 font-numeric-table">
            {totalBranches}
          </span>
          <span className="text-xs text-on-surface-variant mt-1">Physical locations</span>
        </div>

        {/* Total Restaurant Users */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Restaurant Users
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-2 font-numeric-table">
            {totalUsers}
          </span>
          <span className="text-xs text-on-surface-variant mt-1">Authorized staff accounts</span>
        </div>
      </section>

      {/* QUICK ACTIONS BANNER */}
      <section className="mb-space-lg p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">bolt</span>
          <span className="font-label-md text-label-md font-semibold text-on-surface">Platform Quick Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('admin-add-restaurant')}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/30 font-label-sm font-semibold text-on-surface transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">add</span>
            <span>Add Restaurant</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-restaurants')}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/30 font-label-sm font-semibold text-on-surface transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">storefront</span>
            <span>View All Restaurants</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-users')}
            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/30 font-label-sm font-semibold text-on-surface transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">group</span>
            <span>Manage Users</span>
          </button>
        </div>
      </section>

      {/* MAIN TWO-COLUMN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-lg">
        {/* LEFT COLUMN: RECENT RESTAURANTS (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
              <div>
                <h2 className="font-headline-md font-bold text-on-surface leading-tight">
                  Recent Restaurants
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Current platform accounts and onboarding status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('admin-restaurants')}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View All ({totalRestaurants})</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm">
                <thead>
                  <tr className="bg-surface-container-low text-xs text-on-surface-variant uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Restaurant</th>
                    <th className="py-2.5 px-3 font-semibold">Owner</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Plan</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Branches</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Users</th>
                    <th className="py-2.5 px-3 font-semibold">Setup</th>
                    <th className="py-2.5 px-3 font-semibold">Created</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {restaurants.map((rest) => (
                    <tr key={rest.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{rest.name}</span>
                          <span className="font-mono text-[11px] text-on-surface-variant">{rest.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface">{rest.ownerName}</span>
                          <span className="text-[11px] text-on-surface-variant truncate max-w-[150px]">{rest.ownerEmail}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(rest.status)}`}>
                          {rest.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs font-medium text-on-surface">
                        {rest.plan}
                      </td>
                      <td className="py-3 px-3 text-center font-numeric-table font-semibold text-on-surface">
                        {(platformBranches || []).filter(b => b.restaurantId === rest.id).length || rest.branches || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-numeric-table font-semibold text-on-surface">
                        {(platformMembers || []).filter(m => m.restaurantId === rest.id).length || rest.users || 0}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSetupBadge(rest.setupStatus)}`}>
                          {rest.setupStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-on-surface-variant whitespace-nowrap">
                        {formatDate ? formatDate(rest.createdAt) : rest.createdAt}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewRestaurant(rest.id)}
                          className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors cursor-pointer"
                        >
                          View Restaurant
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ATTENTION REQUIRED & RECENT ACTIVITY (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Attention Required Panel */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-amber-600">warning</span>
                <h3 className="font-headline-md font-bold text-on-surface leading-tight">
                  Attention Required
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                {attentionItems.length} Items
              </span>
            </div>

            <div className="space-y-2.5">
              {attentionItems.length > 0 ? (
                attentionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleViewRestaurant(item.id)}
                    className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-on-surface">{item.name}</span>
                      <span className="text-[11px] text-secondary mt-0.5">
                        {item.status === 'Suspended'
                          ? 'Account Suspended'
                          : item.setupStatus !== 'Completed'
                          ? `Setup ${item.setupStatus}`
                          : `Status: ${item.status}`}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">
                      chevron_right
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[24px] text-emerald-600 block mb-1">check_circle</span>
                  All restaurants healthy and setup completed.
                </div>
              )}
            </div>
          </div>

          {/* Recent Platform Activity Panel */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">history</span>
                <h3 className="font-headline-md font-bold text-on-surface leading-tight">
                  Recent Platform Activity
                </h3>
              </div>
              <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                Prototype activity
              </span>
            </div>

            <div className="divide-y divide-outline-variant/20">
              {(platformActivity || []).map((act) => (
                <div key={act.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      act.type === 'suspend' ? 'bg-error' : act.type === 'setup' ? 'bg-emerald-600' : 'bg-primary'
                    }`} />
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-on-surface">{act.title}</span>
                      <span className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                        {act.details}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-mono whitespace-nowrap shrink-0">
                    {formatDate ? formatDate(act.date) : act.displayDate || act.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
