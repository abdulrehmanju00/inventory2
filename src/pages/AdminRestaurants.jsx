import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';
import { exportToCsv } from '../utils/csv';

export default function AdminRestaurants({ onNavigate }) {
  const {
    platformRestaurants,
    platformBranches,
    platformMembers,
    selectedRestaurantId,
    setSelectedRestaurantId,
    updatePlatformRestaurantStatus,
    formatDate
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [setupFilter, setSetupFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Confirmation Modal state for prototype status transitions
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    restaurant: null,
    targetStatus: ''
  });

  // Calculate dynamic platform metrics
  const totalCount = platformRestaurants.length;
  const activeCount = platformRestaurants.filter(r => r.status === 'Active').length;
  const trialCount = platformRestaurants.filter(r => r.status === 'Trial').length;
  const suspendedCount = platformRestaurants.filter(r => r.status === 'Suspended').length;
  const inProgressSetupCount = platformRestaurants.filter(r => r.setupStatus === 'In Progress').length;

  // Filtered and sorted restaurants
  const filteredRestaurants = useMemo(() => {
    return platformRestaurants
      .filter((restaurant) => {
        // Search query filter (name, ownerName, ownerEmail)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = (restaurant.name || '').toLowerCase().includes(q);
          const matchOwner = (restaurant.ownerName || '').toLowerCase().includes(q);
          const matchEmail = (restaurant.ownerEmail || '').toLowerCase().includes(q);
          const matchId = (restaurant.id || '').toLowerCase().includes(q);
          if (!matchName && !matchOwner && !matchEmail && !matchId) {
            return false;
          }
        }

        // Status filter
        if (statusFilter !== 'All' && restaurant.status !== statusFilter) {
          return false;
        }

        // Setup status filter
        if (setupFilter !== 'All' && restaurant.setupStatus !== setupFilter) {
          return false;
        }

        // Plan filter
        if (planFilter !== 'All' && restaurant.plan !== planFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'name_asc') {
          return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'name_desc') {
          return (b.name || '').localeCompare(a.name || '');
        }
        if (sortBy === 'status') {
          return (a.status || '').localeCompare(b.status || '');
        }
        return 0;
      });
  }, [platformRestaurants, searchQuery, statusFilter, setupFilter, planFilter, sortBy]);

  // Handle View Details
  const handleViewDetails = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    onNavigate('admin-restaurant-detail');
  };

  // Open Status Confirmation Modal
  const openStatusConfirm = (restaurant, targetStatus) => {
    setStatusModal({
      isOpen: true,
      restaurant,
      targetStatus
    });
  };

  // Confirm Status Change
  const handleConfirmStatusChange = () => {
    if (statusModal.restaurant && statusModal.targetStatus) {
      updatePlatformRestaurantStatus(statusModal.restaurant.id, statusModal.targetStatus);
    }
    setStatusModal({ isOpen: false, restaurant: null, targetStatus: '' });
  };

  // Real client-side CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Restaurant ID',
      'Restaurant Name',
      'Owner Name',
      'Owner Email',
      'Status',
      'Plan',
      'Branches',
      'Users',
      'Setup Status',
      'Currency',
      'Timezone',
      'Created At'
    ];

    const rows = filteredRestaurants.map(r => [
      r.id,
      r.name,
      r.ownerName,
      r.ownerEmail,
      r.status,
      r.plan,
      (platformBranches || []).filter(b => b.restaurantId === r.id).length || r.branches || 0,
      (platformMembers || []).filter(m => m.restaurantId === r.id).length || r.users || 0,
      r.setupStatus,
      r.currency,
      r.timezone,
      r.createdAt
    ]);

    exportToCsv('restaurants.csv', headers, rows);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'All' || setupFilter !== 'All' || planFilter !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSetupFilter('All');
    setPlanFilter('All');
    setSortBy('newest');
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col pb-16 antialiased">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span
          onClick={() => onNavigate('super-admin')}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Platform Administration
        </span>
        <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
        <span className="text-on-surface font-semibold">Restaurants</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface">
            Restaurants
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Manage restaurant accounts, owners, branches, setup progress and platform access.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-10 px-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
            title="Download real CSV file of currently filtered restaurants"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Restaurants</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-add-restaurant')}
            className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            <span>Add Restaurant</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-space-lg">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <span className="font-label-sm text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
            Total Restaurants
          </span>
          <span className="font-headline-xl text-3xl font-bold text-on-surface font-numeric-table mt-1 block">
            {totalCount}
          </span>
          <span className="text-[11px] text-on-surface-variant mt-0.5 block">Tenant accounts</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <span className="font-label-sm text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            Active
          </span>
          <span className="font-headline-xl text-3xl font-bold text-emerald-800 font-numeric-table mt-1 block">
            {activeCount}
          </span>
          <span className="text-[11px] text-on-surface-variant mt-0.5 block">Operational access</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <span className="font-label-sm text-xs font-semibold text-sky-700 uppercase tracking-wider block">
            Trial
          </span>
          <span className="font-headline-xl text-3xl font-bold text-sky-800 font-numeric-table mt-1 block">
            {trialCount}
          </span>
          <span className="text-[11px] text-on-surface-variant mt-0.5 block">Evaluation status</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <span className="font-label-sm text-xs font-semibold text-error uppercase tracking-wider block">
            Suspended
          </span>
          <span className="font-headline-xl text-3xl font-bold text-error font-numeric-table mt-1 block">
            {suspendedCount}
          </span>
          <span className="text-[11px] text-on-surface-variant mt-0.5 block">Access disabled</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs col-span-2 sm:col-span-1">
          <span className="font-label-sm text-xs font-semibold text-amber-700 uppercase tracking-wider block">
            Setup In Progress
          </span>
          <span className="font-headline-xl text-3xl font-bold text-amber-800 font-numeric-table mt-1 block">
            {inProgressSetupCount}
          </span>
          <span className="text-[11px] text-on-surface-variant mt-0.5 block">Onboarding checklist</span>
        </div>
      </div>

      {/* CONTROLS: SEARCH, FILTERS & SORT */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs mb-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants, owners or email..."
              className="w-full h-10 pl-9 pr-8 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Filter: Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor="filter-status" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider shrink-0">
              Status:
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Filter: Setup Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor="filter-setup" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider shrink-0">
              Setup:
            </label>
            <select
              id="filter-setup"
              value={setupFilter}
              onChange={(e) => setSetupFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="All">All Setup Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Filter: Plan */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor="filter-plan" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider shrink-0">
              Plan:
            </label>
            <select
              id="filter-plan"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="All">All Plans</option>
              <option value="Trial">Trial</option>
              <option value="Professional">Professional</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor="filter-sort" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider shrink-0">
              Sort:
            </label>
            <select
              id="filter-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="newest">Newest Created</option>
              <option value="oldest">Oldest Created</option>
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-10 px-3 rounded-lg text-primary hover:bg-primary/5 text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-xs text-on-surface-variant">
          <span>
            Showing <strong className="text-on-surface font-semibold">{filteredRestaurants.length}</strong> of{' '}
            <strong className="text-on-surface font-semibold">{platformRestaurants.length}</strong> restaurant accounts
          </span>
          <span className="text-[11px] text-on-surface-variant">
            Platform prototype data • changes persist in browser storage
          </span>
        </div>
      </div>

      {/* RESTAURANTS TABLE */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-2xs overflow-hidden">
        {filteredRestaurants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-xs font-semibold text-on-surface-variant uppercase tracking-wider select-none">
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3 text-right">Branches</th>
                  <th className="py-3 px-3 text-right">Users</th>
                  <th className="py-3 px-3">Setup</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredRestaurants.map((restaurant) => {
                  const isSelected = selectedRestaurantId === restaurant.id;
                  return (
                    <tr
                      key={restaurant.id}
                      className={`hover:bg-surface-container-low/50 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Restaurant Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                            <span className="material-symbols-outlined text-[18px]">storefront</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface leading-tight">
                              {restaurant.name}
                            </span>
                            <span className="text-xs font-mono text-on-surface-variant">
                              {restaurant.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Owner Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface leading-tight">
                            {restaurant.ownerName}
                          </span>
                          <span className="text-xs text-on-surface-variant font-mono">
                            {restaurant.ownerEmail}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            restaurant.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : restaurant.status === 'Trial'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-error-container/70 text-on-error-container border-error/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              restaurant.status === 'Active'
                                ? 'bg-emerald-600'
                                : restaurant.status === 'Trial'
                                ? 'bg-sky-600'
                                : 'bg-error'
                            }`}
                          />
                          <span>{restaurant.status}</span>
                        </span>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-surface-container-high text-on-surface border border-outline-variant/30">
                          {restaurant.plan}
                        </span>
                      </td>

                      {/* Branches */}
                      <td className="py-3.5 px-3 text-right font-numeric-table font-semibold text-on-surface">
                        {(platformBranches || []).filter(b => b.restaurantId === restaurant.id).length || restaurant.branches || 0}
                      </td>

                      {/* Users */}
                      <td className="py-3.5 px-3 text-right font-numeric-table font-semibold text-on-surface">
                        {(platformMembers || []).filter(m => m.restaurantId === restaurant.id).length || restaurant.users || 0}
                      </td>

                      {/* Setup Progress */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            restaurant.setupStatus === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : restaurant.setupStatus === 'In Progress'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {restaurant.setupStatus === 'Completed'
                              ? 'check_circle'
                              : restaurant.setupStatus === 'In Progress'
                              ? 'pending'
                              : 'radio_button_unchecked'}
                          </span>
                          <span>{restaurant.setupStatus}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 font-numeric-table text-on-surface-variant text-xs">
                        {formatDate ? formatDate(restaurant.createdAt) : restaurant.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(restaurant.id)}
                            className="px-3 py-1.5 rounded-lg border border-outline-variant/60 hover:bg-surface-container-high text-primary hover:text-primary/90 font-label-md text-xs font-semibold transition-colors cursor-pointer"
                          >
                            View Details
                          </button>

                          {/* Quick Status Transition Toggle */}
                          {restaurant.status === 'Active' && (
                            <button
                              type="button"
                              onClick={() => openStatusConfirm(restaurant, 'Suspended')}
                              className="px-2.5 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error-container/40 text-xs font-semibold transition-colors cursor-pointer"
                              title="Suspend account access"
                            >
                              Suspend
                            </button>
                          )}

                          {restaurant.status === 'Suspended' && (
                            <button
                              type="button"
                              onClick={() => openStatusConfirm(restaurant, 'Active')}
                              className="px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer"
                              title="Restore account access"
                            >
                              Activate
                            </button>
                          )}

                          {restaurant.status === 'Trial' && (
                            <button
                              type="button"
                              onClick={() => openStatusConfirm(restaurant, 'Active')}
                              className="px-2.5 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/5 text-xs font-semibold transition-colors cursor-pointer"
                              title="Promote trial to active"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : platformRestaurants.length === 0 ? (
          /* Zero platform records */
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[36px]">storefront</span>
            </div>
            <h3 className="font-headline-md font-bold text-on-surface mb-1">
              No restaurants yet
            </h3>
            <p className="text-body-sm text-secondary max-w-sm mx-auto mb-6">
              Start by onboarding the first restaurant tenant to the platform.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('admin-add-restaurant')}
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              Add Your First Restaurant
            </button>
          </div>
        ) : (
          /* Filter match zero */
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[30px]">search_off</span>
            </div>
            <h3 className="font-headline-md font-bold text-on-surface mb-1">
              No restaurants found
            </h3>
            <p className="text-body-sm text-secondary max-w-sm mx-auto mb-5">
              Try adjusting your search or filters to locate restaurant accounts.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL FOR STATUS TRANSITION */}
      {statusModal.isOpen && statusModal.restaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl p-6 sm:p-7"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  statusModal.targetStatus === 'Suspended'
                    ? 'bg-error-container text-error'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {statusModal.targetStatus === 'Suspended' ? 'lock' : 'lock_open'}
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">
                  {statusModal.targetStatus === 'Suspended'
                    ? `Suspend ${statusModal.restaurant.name}?`
                    : `Activate ${statusModal.restaurant.name}?`}
                </h3>
                <p className="text-xs text-on-surface-variant font-mono">
                  Account ID: {statusModal.restaurant.id}
                </p>
              </div>
            </div>

            <p className="text-body-sm text-secondary mb-6 leading-relaxed">
              This changes only the frontend prototype account status. No backend account or user access is modified.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusModal({ isOpen: false, restaurant: null, targetStatus: '' })}
                className="h-10 px-4 rounded-lg border border-outline-variant/50 hover:bg-surface-container-low text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className={`h-10 px-5 rounded-lg text-white font-label-md text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
                  statusModal.targetStatus === 'Suspended'
                    ? 'bg-error hover:bg-error/90'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {statusModal.targetStatus === 'Suspended' ? 'Suspend Restaurant' : 'Activate Restaurant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
