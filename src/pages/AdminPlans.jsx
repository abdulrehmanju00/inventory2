import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';

const AVAILABLE_CURRENCIES = ['PKR', 'USD', 'AED', 'GBP', 'EUR'];

const FEATURE_DEFINITIONS = [
  { key: 'inventory', label: 'Inventory Management', desc: 'Ingredient master list, par levels and unit conversions', icon: 'inventory_2' },
  { key: 'stockCounts', label: 'Stock Counts', desc: 'Physical audit sessions, variance calculations and auto-adjustments', icon: 'fact_check' },
  { key: 'wastage', label: 'Wastage Tracking', desc: 'Waste and spoilage logging with reason codes and value estimation', icon: 'delete_sweep' },
  { key: 'transfers', label: 'Branch Transfers', desc: 'Inter-branch stock requisitions, dispatch, and receipt confirmation', icon: 'swap_horiz' },
  { key: 'purchases', label: 'Purchase Orders', desc: 'PO creation, supplier pricing, approval workflow and receiving', icon: 'shopping_cart' },
  { key: 'suppliers', label: 'Suppliers Directory', desc: 'Vendor contacts, payment terms and item procurement catalogs', icon: 'local_shipping' },
  { key: 'recipes', label: 'Master Recipes', desc: 'Multi-layer recipe costing, batching, portions and allergens', icon: 'menu_book' },
  { key: 'production', label: 'Kitchen Production', desc: 'Prep logs, batch cooking, sub-recipe conversion and inventory depletion', icon: 'skillet' },
  { key: 'reports', label: 'Analytics & Reports', desc: 'COGS, stock valuation, inventory consumption and variance reports', icon: 'bar_chart' },
  { key: 'staff', label: 'Branch Staff', desc: 'Operational staff assignments, roles, and shift allocation', icon: 'badge' }
];

export default function AdminPlans({ onNavigate }) {
  const {
    platformPlans,
    platformRestaurants,
    createPlatformPlan,
    updatePlatformPlan,
    togglePlatformPlanStatus,
    formatDate,
    showToast
  } = useAppStore();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [addPlanForm, setAddPlanForm] = useState({
    name: '',
    description: '',
    priceMonthly: 0,
    currency: 'PKR',
    trialDays: 14,
    branchLimit: 1,
    userLimit: 3,
    storageLocationLimit: 4,
    status: 'Active',
    features: {
      inventory: true,
      stockCounts: true,
      wastage: true,
      transfers: true,
      purchases: true,
      suppliers: true,
      recipes: true,
      production: true,
      reports: true,
      staff: true
    }
  });
  const [addPlanError, setAddPlanError] = useState('');

  // Edit Plan Modal
  const [editingPlan, setEditingPlan] = useState(null);
  const [editPlanForm, setEditPlanForm] = useState({
    name: '',
    description: '',
    priceMonthly: 0,
    currency: 'PKR',
    trialDays: 0,
    branchLimit: 10,
    userLimit: 50,
    storageLocationLimit: 50,
    status: 'Active',
    features: {}
  });
  const [editPlanError, setEditPlanError] = useState('');

  // View Features Modal
  const [viewingFeaturesPlan, setViewingFeaturesPlan] = useState(null);

  // Deactivate Plan Confirmation Modal
  const [deactivatePlanModalTarget, setDeactivatePlanModalTarget] = useState(null);

  // Helper: count restaurants on each plan
  const getRestaurantCountForPlan = (planName) => {
    if (!platformRestaurants || !planName) return 0;
    return platformRestaurants.filter(
      r => (r.plan || '').trim().toLowerCase() === planName.trim().toLowerCase()
    ).length;
  };

  // Dynamic Summary Metrics
  const totalPlansCount = (platformPlans || []).length;
  const activePlansCount = (platformPlans || []).filter(p => p.status === 'Active').length;
  const inactivePlansCount = (platformPlans || []).filter(p => p.status === 'Inactive').length;
  const restaurantsOnTrialCount = (platformRestaurants || []).filter(
    r => (r.plan || '').trim().toLowerCase() === 'trial'
  ).length;
  const restaurantsOnProfessionalCount = (platformRestaurants || []).filter(
    r => (r.plan || '').trim().toLowerCase() === 'professional'
  ).length;

  // Filtered Plans List
  const filteredPlans = useMemo(() => {
    return (platformPlans || []).filter(plan => {
      // Status filter
      if (statusFilter !== 'All' && plan.status !== statusFilter) {
        return false;
      }

      // Search query across name and description
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (plan.name || '').toLowerCase().includes(query);
        const matchesDesc = (plan.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [platformPlans, statusFilter, searchTerm]);

  // Helper: Status badge
  const getStatusBadge = (status) => {
    return status === 'Active'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : 'bg-surface-container text-secondary border-outline-variant/40';
  };

  // Add Plan Handlers
  const handleOpenAddPlan = () => {
    setAddPlanForm({
      name: '',
      description: '',
      priceMonthly: 0,
      currency: 'PKR',
      trialDays: 14,
      branchLimit: 1,
      userLimit: 3,
      storageLocationLimit: 4,
      status: 'Active',
      features: {
        inventory: true,
        stockCounts: true,
        wastage: true,
        transfers: true,
        purchases: true,
        suppliers: true,
        recipes: true,
        production: true,
        reports: true,
        staff: true
      }
    });
    setAddPlanError('');
    setIsAddPlanOpen(true);
  };

  const handleSaveAddPlan = (e) => {
    e.preventDefault();
    const trimmedName = addPlanForm.name.trim();
    if (!trimmedName) {
      setAddPlanError('Plan Name is required.');
      return;
    }

    const price = parseFloat(addPlanForm.priceMonthly);
    if (isNaN(price) || price < 0) {
      setAddPlanError('Monthly price must be a valid number greater than or equal to 0.');
      return;
    }

    const trialDays = parseInt(addPlanForm.trialDays, 10);
    if (isNaN(trialDays) || trialDays < 0) {
      setAddPlanError('Trial days must be a valid number greater than or equal to 0.');
      return;
    }

    const branchLimit = parseInt(addPlanForm.branchLimit, 10);
    if (isNaN(branchLimit) || branchLimit < 1) {
      setAddPlanError('Branch limit must be at least 1.');
      return;
    }

    const userLimit = parseInt(addPlanForm.userLimit, 10);
    if (isNaN(userLimit) || userLimit < 1) {
      setAddPlanError('User limit must be at least 1.');
      return;
    }

    const storageLocationLimit = parseInt(addPlanForm.storageLocationLimit, 10);
    if (isNaN(storageLocationLimit) || storageLocationLimit < 1) {
      setAddPlanError('Storage location limit must be at least 1.');
      return;
    }

    const res = createPlatformPlan({
      name: trimmedName,
      description: addPlanForm.description.trim(),
      priceMonthly: price,
      currency: addPlanForm.currency,
      trialDays,
      limits: {
        branches: branchLimit,
        users: userLimit,
        storageLocations: storageLocationLimit
      },
      status: addPlanForm.status,
      features: addPlanForm.features
    });

    if (res && res.success) {
      setIsAddPlanOpen(false);
      setAddPlanError('');
    } else {
      setAddPlanError(res?.error || 'Failed to create plan.');
    }
  };

  // Edit Plan Handlers
  const handleOpenEditPlan = (plan) => {
    setEditingPlan(plan);
    setEditPlanForm({
      name: plan.name || '',
      description: plan.description || '',
      priceMonthly: plan.priceMonthly ?? 0,
      currency: plan.currency || 'PKR',
      trialDays: plan.trialDays ?? 0,
      branchLimit: plan.limits?.branches || 1,
      userLimit: plan.limits?.users || 1,
      storageLocationLimit: plan.limits?.storageLocations || 1,
      status: plan.status || 'Active',
      features: {
        inventory: plan.features?.inventory ?? true,
        stockCounts: plan.features?.stockCounts ?? true,
        wastage: plan.features?.wastage ?? true,
        transfers: plan.features?.transfers ?? true,
        purchases: plan.features?.purchases ?? true,
        suppliers: plan.features?.suppliers ?? true,
        recipes: plan.features?.recipes ?? true,
        production: plan.features?.production ?? true,
        reports: plan.features?.reports ?? true,
        staff: plan.features?.staff ?? true
      }
    });
    setEditPlanError('');
  };

  const handleSaveEditPlan = (e) => {
    e.preventDefault();
    if (!editingPlan) return;

    const trimmedName = editPlanForm.name.trim();
    if (!trimmedName) {
      setEditPlanError('Plan Name is required.');
      return;
    }

    const price = parseFloat(editPlanForm.priceMonthly);
    if (isNaN(price) || price < 0) {
      setEditPlanError('Monthly price must be a valid number greater than or equal to 0.');
      return;
    }

    const trialDays = parseInt(editPlanForm.trialDays, 10);
    if (isNaN(trialDays) || trialDays < 0) {
      setEditPlanError('Trial days must be a valid number greater than or equal to 0.');
      return;
    }

    const branchLimit = parseInt(editPlanForm.branchLimit, 10);
    if (isNaN(branchLimit) || branchLimit < 1) {
      setEditPlanError('Branch limit must be at least 1.');
      return;
    }

    const userLimit = parseInt(editPlanForm.userLimit, 10);
    if (isNaN(userLimit) || userLimit < 1) {
      setEditPlanError('User limit must be at least 1.');
      return;
    }

    const storageLocationLimit = parseInt(editPlanForm.storageLocationLimit, 10);
    if (isNaN(storageLocationLimit) || storageLocationLimit < 1) {
      setEditPlanError('Storage location limit must be at least 1.');
      return;
    }

    const res = updatePlatformPlan(editingPlan.id, {
      name: trimmedName,
      description: editPlanForm.description.trim(),
      priceMonthly: price,
      currency: editPlanForm.currency,
      trialDays,
      limits: {
        branches: branchLimit,
        users: userLimit,
        storageLocations: storageLocationLimit
      },
      status: editPlanForm.status,
      features: editPlanForm.features
    });

    if (res && res.success) {
      showToast(`Plan "${trimmedName}" updated successfully`, 'success', 'Plan Updated');
      setEditingPlan(null);
    } else {
      setEditPlanError(res?.error || 'Failed to update plan.');
    }
  };

  // Status toggle & confirmation handlers
  const handleToggleStatusClick = (plan) => {
    if (plan.status === 'Active') {
      // Check if any restaurant uses this plan
      const usedCount = getRestaurantCountForPlan(plan.name);
      if (usedCount > 0) {
        // Open confirmation modal
        setDeactivatePlanModalTarget({ plan, count: usedCount });
        return;
      }
    }

    // Direct toggle if activating or if 0 restaurants currently use it
    const res = togglePlatformPlanStatus(plan.id);
    if (res && res.success) {
      showToast(`Plan "${plan.name}" is now ${res.nextStatus}`, 'success', 'Status Updated');
    } else {
      showToast(res?.error || 'Could not update status', 'error', 'Action Failed');
    }
  };

  const handleConfirmDeactivatePlan = () => {
    if (!deactivatePlanModalTarget?.plan) return;
    const { plan } = deactivatePlanModalTarget;
    const res = togglePlatformPlanStatus(plan.id);
    if (res && res.success) {
      showToast(`Plan "${plan.name}" is now ${res.nextStatus}`, 'success', 'Status Updated');
    } else {
      showToast(res?.error || 'Could not update status', 'error', 'Action Failed');
    }
    setDeactivatePlanModalTarget(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredPlans.length === 0) {
      showToast('No plan definitions to export with current filters.', 'info', 'Export Empty');
      return;
    }

    const headers = [
      'Plan ID',
      'Plan Name',
      'Status',
      'Monthly Price',
      'Currency',
      'Trial Days',
      'Branch Limit',
      'User Limit',
      'Storage Location Limit',
      'Restaurant Count',
      'Created At',
      'Updated At'
    ];

    const rows = filteredPlans.map(p => [
      `"${p.id || ''}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.status || 'Active'}"`,
      p.priceMonthly ?? 0,
      `"${p.currency || 'PKR'}"`,
      p.trialDays ?? 0,
      p.limits?.branches ?? 1,
      p.limits?.users ?? 1,
      p.limits?.storageLocations ?? 1,
      getRestaurantCountForPlan(p.name),
      `"${p.createdAt || ''}"`,
      `"${p.updatedAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plans.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      `Exported ${filteredPlans.length} plan definitions to plans.csv`,
      'success',
      'CSV Download Complete'
    );
  };

  const hasActiveFilters = searchTerm.trim() !== '' || statusFilter !== 'All';

  return (
    <div className="w-full flex flex-col pb-16 antialiased">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm flex-wrap">
        <button
          type="button"
          onClick={() => onNavigate('super-admin')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Platform Administration
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant font-medium">Plans</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-numeric-table tracking-wide bg-surface-container text-on-surface-variant border border-outline-variant/40">
              Platform Tiers
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary">
              Subscription Definitions
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface leading-tight">
            Plans
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl mt-1">
            Manage restaurant plan definitions and prototype account limits.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
            title="Download real CSV of all platform plans"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Plans</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddPlan}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Add Plan</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC SUMMARY CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-md mb-6">
        {/* Total Plans */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Total Plans
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-on-surface">
              {totalPlansCount}
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
          </div>
        </div>

        {/* Active Plans */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-semibold">
            Active Plans
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-emerald-700">
              {activePlansCount}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        {/* Inactive Plans */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
            Inactive Plans
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-secondary">
              {inactivePlansCount}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-secondary/50"></span>
          </div>
        </div>

        {/* Restaurants on Trial */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold">
            Restaurants on Trial
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-amber-700">
              {restaurantsOnTrialCount}
            </span>
            <span className="material-symbols-outlined text-amber-600 text-[20px]">timer</span>
          </div>
        </div>

        {/* Restaurants on Professional */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-primary font-semibold">
            Restaurants on Pro
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-primary">
              {restaurantsOnProfessionalCount}
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
          </div>
        </div>
      </section>

      {/* SEARCH AND FILTERS BAR */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm transition-colors placeholder:text-secondary/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-0.5"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-xs font-medium cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                }}
                className="px-3 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-secondary hover:text-on-surface transition-colors cursor-pointer shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PLANS TABLE */}
      {filteredPlans.length > 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Monthly Price</th>
                  <th className="py-3 px-3">Trial Days</th>
                  <th className="py-3 px-3">Branch Limit</th>
                  <th className="py-3 px-3">User Limit</th>
                  <th className="py-3 px-3 text-center">Restaurants</th>
                  <th className="py-3 px-3">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredPlans.map((plan) => {
                  const restaurantCount = getRestaurantCountForPlan(plan.name);

                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-surface-container-low/40 transition-colors"
                    >
                      {/* PLAN NAME & DESCRIPTION */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-primary/20">
                            <span className="material-symbols-outlined text-[18px]">
                              {plan.name.toLowerCase().includes('trial') ? 'timer' : 'verified'}
                            </span>
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-semibold text-on-surface flex items-center gap-1.5">
                              <span>{plan.name}</span>
                              <span className="text-[10px] font-mono text-secondary">
                                ({plan.id})
                              </span>
                            </div>
                            <div className="text-xs text-secondary truncate mt-0.5">
                              {plan.description || 'No description provided'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(plan.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            plan.status === 'Active' ? 'bg-emerald-600' : 'bg-secondary'
                          }`} />
                          <span>{plan.status}</span>
                        </span>
                      </td>

                      {/* MONTHLY PRICE */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-numeric-table font-semibold text-on-surface">
                            {plan.currency || 'PKR'} {plan.priceMonthly ?? 0}
                          </span>
                          <span className="text-[10px] text-secondary font-medium tracking-tight">
                            Prototype pricing
                          </span>
                        </div>
                      </td>

                      {/* TRIAL DAYS */}
                      <td className="py-3 px-3 font-numeric-table text-on-surface text-xs">
                        {plan.trialDays > 0 ? `${plan.trialDays} days` : '0 days'}
                      </td>

                      {/* BRANCH LIMIT */}
                      <td className="py-3 px-3 font-numeric-table text-on-surface text-xs">
                        {plan.limits?.branches || 1} {plan.limits?.branches === 1 ? 'branch' : 'branches'}
                      </td>

                      {/* USER LIMIT */}
                      <td className="py-3 px-3 font-numeric-table text-on-surface text-xs">
                        {plan.limits?.users || 1} {plan.limits?.users === 1 ? 'user' : 'users'}
                      </td>

                      {/* RESTAURANTS USING PLAN */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold font-numeric-table bg-surface-container text-on-surface border border-outline-variant/30">
                          {restaurantCount}
                        </span>
                      </td>

                      {/* UPDATED DATE */}
                      <td className="py-3 px-3 text-xs font-numeric-table text-secondary">
                        {formatDate ? formatDate(plan.updatedAt || plan.createdAt) : (plan.updatedAt || plan.createdAt)}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Features Button */}
                          <button
                            type="button"
                            onClick={() => setViewingFeaturesPlan(plan)}
                            className="px-2.5 py-1 rounded text-xs font-medium text-primary hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
                            title="View Plan Features"
                          >
                            View Features
                          </button>

                          {/* Edit Plan Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditPlan(plan)}
                            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            title="Edit Plan"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          {/* Status Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatusClick(plan)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                              plan.status === 'Active'
                                ? 'text-secondary hover:text-error hover:bg-error-container/20 border-outline-variant/40'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                            title={plan.status === 'Active' ? 'Deactivate Plan' : 'Activate Plan'}
                          >
                            {plan.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-10 text-center shadow-2xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[28px]">layers_clear</span>
          </div>
          <h3 className="font-display-lg text-lg font-bold text-on-surface mb-1">
            {searchTerm || statusFilter !== 'All' ? 'No matching plans' : 'No plans configured'}
          </h3>
          <p className="font-body-md text-secondary max-w-sm mx-auto mb-4">
            {searchTerm || statusFilter !== 'All'
              ? 'Try adjusting your search query or status filter.'
              : 'Add a new restaurant subscription plan to configure prototype limits.'}
          </p>
          {searchTerm || statusFilter !== 'All' ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
              }}
              className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddPlan}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
            >
              + Add Plan
            </button>
          )}
        </div>
      )}

      {/* VIEW FEATURES MODAL */}
      {viewingFeaturesPlan && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    {viewingFeaturesPlan.name} Features
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusBadge(viewingFeaturesPlan.status)}`}>
                    {viewingFeaturesPlan.status}
                  </span>
                </div>
                <p className="text-xs text-secondary mt-0.5">
                  Enabled operational modules and resource caps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingFeaturesPlan(null)}
                className="text-secondary hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-space-md max-h-[70vh] overflow-y-auto space-y-4">
              {/* Resource Caps Card */}
              <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-2">
                  Resource Limits
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-surface-container-lowest rounded-md border border-outline-variant/30">
                    <span className="text-base font-bold font-numeric-table text-on-surface block">
                      {viewingFeaturesPlan.limits?.branches || 1}
                    </span>
                    <span className="text-[11px] text-secondary">Branches</span>
                  </div>
                  <div className="p-2 bg-surface-container-lowest rounded-md border border-outline-variant/30">
                    <span className="text-base font-bold font-numeric-table text-on-surface block">
                      {viewingFeaturesPlan.limits?.users || 1}
                    </span>
                    <span className="text-[11px] text-secondary">Users</span>
                  </div>
                  <div className="p-2 bg-surface-container-lowest rounded-md border border-outline-variant/30">
                    <span className="text-base font-bold font-numeric-table text-on-surface block">
                      {viewingFeaturesPlan.limits?.storageLocations || 1}
                    </span>
                    <span className="text-[11px] text-secondary">Locations</span>
                  </div>
                </div>
              </div>

              {/* Module Feature List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider block">
                  Enabled Modules
                </span>
                <div className="space-y-1.5">
                  {FEATURE_DEFINITIONS.map(feat => {
                    const isEnabled = viewingFeaturesPlan.features?.[feat.key] ?? true;
                    return (
                      <div
                        key={feat.key}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                          isEnabled
                            ? 'bg-surface-container-lowest border-outline-variant/30'
                            : 'bg-surface-container-low/50 border-outline-variant/20 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`material-symbols-outlined text-[18px] ${isEnabled ? 'text-primary' : 'text-secondary'}`}>
                            {feat.icon}
                          </span>
                          <div>
                            <span className="font-semibold text-on-surface block">
                              {feat.label}
                            </span>
                            <span className="text-[11px] text-secondary truncate block">
                              {feat.desc}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isEnabled
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-surface-container text-secondary border border-outline-variant/40'
                        }`}>
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prototype Notice */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-secondary leading-relaxed">
                Plan features are prototype configuration until backend authorization and billing are connected.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-space-md border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-xs text-secondary font-numeric-table">
                {getRestaurantCountForPlan(viewingFeaturesPlan.name)} active {getRestaurantCountForPlan(viewingFeaturesPlan.name) === 1 ? 'restaurant' : 'restaurants'}
              </span>
              <button
                type="button"
                onClick={() => setViewingFeaturesPlan(null)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PLAN MODAL */}
      {isAddPlanOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Add Plan
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Define a new subscription tier with operational limits and module access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPlanOpen(false)}
                className="text-secondary hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAddPlan} className="p-space-md space-y-4 max-h-[75vh] overflow-y-auto">
              {addPlanError && (
                <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                  <span>{addPlanError}</span>
                </div>
              )}

              {/* Plan Name & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Plan Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={addPlanForm.name}
                    onChange={(e) => {
                      setAddPlanForm(prev => ({ ...prev, name: e.target.value }));
                      if (addPlanError) setAddPlanError('');
                    }}
                    placeholder="e.g. Enterprise"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Status
                  </label>
                  <select
                    value={addPlanForm.status}
                    onChange={(e) => setAddPlanForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={addPlanForm.description}
                  onChange={(e) => setAddPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Multi-unit restaurant groups requiring unlimited branch management."
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm resize-none"
                />
              </div>

              {/* Pricing & Trial */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Monthly Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={addPlanForm.priceMonthly}
                    onChange={(e) => setAddPlanForm(prev => ({ ...prev, priceMonthly: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Currency
                  </label>
                  <select
                    value={addPlanForm.currency}
                    onChange={(e) => setAddPlanForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                  >
                    {AVAILABLE_CURRENCIES.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Trial Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addPlanForm.trialDays}
                    onChange={(e) => setAddPlanForm(prev => ({ ...prev, trialDays: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                  />
                </div>
              </div>

              {/* Resource Limits */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-2">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Resource Limits
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary mb-1">
                      Branch Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={addPlanForm.branchLimit}
                      onChange={(e) => setAddPlanForm(prev => ({ ...prev, branchLimit: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary mb-1">
                      User Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={addPlanForm.userLimit}
                      onChange={(e) => setAddPlanForm(prev => ({ ...prev, userLimit: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary mb-1">
                      Location Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={addPlanForm.storageLocationLimit}
                      onChange={(e) => setAddPlanForm(prev => ({ ...prev, storageLocationLimit: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">
                  Module Access
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FEATURE_DEFINITIONS.map(feat => {
                    const isChecked = addPlanForm.features[feat.key] ?? true;
                    return (
                      <label
                        key={feat.key}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-surface-container-lowest border-primary/40'
                            : 'bg-surface-container-low/50 border-outline-variant/30 text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAddPlanForm(prev => ({
                                ...prev,
                                features: { ...prev.features, [feat.key]: checked }
                              }));
                            }}
                            className="rounded border-outline text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-on-surface">
                            {feat.label}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAddPlanOpen(false)}
                  className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-secondary hover:text-on-surface rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Edit Plan: {editingPlan.name}
                  </h3>
                  <span className="text-xs font-mono text-secondary">
                    ({editingPlan.id})
                  </span>
                </div>
                <p className="text-xs text-secondary mt-0.5">
                  Update plan configuration, resource caps, and feature entitlements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-secondary hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditPlan} className="p-space-md space-y-4 max-h-[75vh] overflow-y-auto">
              {editPlanError && (
                <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                  <span>{editPlanError}</span>
                </div>
              )}

              {/* Plan Name & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Plan Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={editPlanForm.name}
                    onChange={(e) => {
                      setEditPlanForm(prev => ({ ...prev, name: e.target.value }));
                      if (editPlanError) setEditPlanError('');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Status
                  </label>
                  <select
                    value={editPlanForm.status}
                    onChange={(e) => setEditPlanForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editPlanForm.description}
                  onChange={(e) => setEditPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm resize-none"
                />
              </div>

              {/* Pricing & Trial */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Monthly Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editPlanForm.priceMonthly}
                    onChange={(e) => setEditPlanForm(prev => ({ ...prev, priceMonthly: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Currency
                  </label>
                  <select
                    value={editPlanForm.currency}
                    onChange={(e) => setEditPlanForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                  >
                    {AVAILABLE_CURRENCIES.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Trial Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editPlanForm.trialDays}
                    onChange={(e) => setEditPlanForm(prev => ({ ...prev, trialDays: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                  />
                </div>
              </div>

              {/* Resource Limits */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-2">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Resource Limits
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary mb-1">
                      Branch Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editPlanForm.branchLimit}
                      onChange={(e) => setEditPlanForm(prev => ({ ...prev, branchLimit: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary mb-1">
                      User Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editPlanForm.userLimit}
                      onChange={(e) => setEditPlanForm(prev => ({ ...prev, userLimit: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-secondary mb-1">
                      Location Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editPlanForm.storageLocationLimit}
                      onChange={(e) => setEditPlanForm(prev => ({ ...prev, storageLocationLimit: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface text-sm font-numeric-table"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div>
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">
                  Module Access
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FEATURE_DEFINITIONS.map(feat => {
                    const isChecked = editPlanForm.features[feat.key] ?? true;
                    return (
                      <label
                        key={feat.key}
                        className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-surface-container-lowest border-primary/40'
                            : 'bg-surface-container-low/50 border-outline-variant/30 text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditPlanForm(prev => ({
                                ...prev,
                                features: { ...prev.features, [feat.key]: checked }
                              }));
                            }}
                            className="rounded border-outline text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-on-surface">
                            {feat.label}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Read-Only System Details */}
              <div className="p-2.5 rounded-lg bg-surface-container-low text-[11px] text-secondary flex items-center justify-between">
                <span>Plan ID: <strong className="font-mono text-on-surface">{editingPlan.id}</strong></span>
                <span>Created: {formatDate ? formatDate(editingPlan.createdAt) : editingPlan.createdAt}</span>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-secondary hover:text-on-surface rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEACTIVATE PLAN CONFIRMATION MODAL */}
      {deactivatePlanModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl p-6 antialiased animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[26px]">warning</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
              Deactivate {deactivatePlanModalTarget.plan.name}?
            </h3>
            <p className="font-body-md text-body-md text-secondary mb-6 leading-relaxed">
              {deactivatePlanModalTarget.count} {deactivatePlanModalTarget.count === 1 ? 'restaurant currently uses' : 'restaurants currently use'} this plan. Existing restaurant plan labels will remain unchanged in this frontend prototype.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeactivatePlanModalTarget(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container font-label-md text-xs font-semibold text-on-surface cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivatePlan}
                className="px-4 py-2 rounded-lg bg-error hover:bg-error/90 text-on-error font-label-md text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                Deactivate Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
