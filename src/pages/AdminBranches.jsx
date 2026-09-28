import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';

export default function AdminBranches({ onNavigate }) {
  const {
    platformRestaurants,
    platformBranches,
    platformStorageLocations,
    platformStaff,
    selectedRestaurantId,
    setSelectedBranchId,
    updatePlatformBranch,
    togglePlatformBranchStatus,
    formatDate,
    showToast
  } = useAppStore();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [setupFilter, setSetupFilter] = useState('All');

  // Edit Modal state
  const [editingBranch, setEditingBranch] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    status: 'Active'
  });
  const [editError, setEditError] = useState('');

  // Status Change Confirmation Modal state
  const [statusModalBranch, setStatusModalBranch] = useState(null);

  // 1. Resolve selected restaurant
  const selectedRestaurant = useMemo(() => {
    if (!platformRestaurants || platformRestaurants.length === 0) return null;
    return platformRestaurants.find(r => r.id === selectedRestaurantId) || null;
  }, [platformRestaurants, selectedRestaurantId]);

  // 2. Filter branches strictly for this restaurant
  const restaurantBranches = useMemo(() => {
    if (!selectedRestaurant) return [];
    return (platformBranches || []).filter(b => b.restaurantId === selectedRestaurant.id);
  }, [platformBranches, selectedRestaurant]);

  // 3. Dynamic Summary Card Metrics
  const totalBranches = restaurantBranches.length;
  const activeBranches = restaurantBranches.filter(b => b.status === 'Active').length;
  const inactiveBranches = restaurantBranches.filter(b => b.status === 'Inactive').length;
  const setupCompleteBranches = restaurantBranches.filter(b => (b.setupStatus || 'Completed') === 'Completed').length;
  const setupInProgressBranches = restaurantBranches.filter(b => b.setupStatus === 'In Progress').length;

  // 4. Derived & Filtered Branches
  const filteredBranches = useMemo(() => {
    return restaurantBranches.filter(branch => {
      // Status filter
      if (statusFilter !== 'All' && branch.status !== statusFilter) {
        return false;
      }
      // Setup status filter
      const bSetup = branch.setupStatus || 'Completed';
      if (setupFilter !== 'All' && bSetup !== setupFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          (branch.name && branch.name.toLowerCase().includes(query)) ||
          (branch.code && branch.code.toLowerCase().includes(query)) ||
          (branch.city && branch.city.toLowerCase().includes(query)) ||
          (branch.email && branch.email.toLowerCase().includes(query)) ||
          (branch.phone && branch.phone.toLowerCase().includes(query)) ||
          (branch.id && branch.id.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    });
  }, [restaurantBranches, statusFilter, setupFilter, searchTerm]);

  // Helpers to derive relational counts
  const getStorageLocationCount = (branchId) => {
    return (platformStorageLocations || []).filter(
      l => l.restaurantId === selectedRestaurant?.id && l.branchId === branchId
    ).length;
  };

  const getStaffCount = (branchId) => {
    return (platformStaff || []).filter(
      s => s.restaurantId === selectedRestaurant?.id && s.branchId === branchId
    ).length;
  };

  // View Branch handler
  const handleViewBranch = (branchId) => {
    if (setSelectedBranchId) {
      setSelectedBranchId(branchId);
    }
    onNavigate('admin-branch-detail');
  };

  // Edit Branch Open handler
  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setEditForm({
      name: branch.name || '',
      code: branch.code || '',
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
      city: branch.city || '',
      status: branch.status || 'Active'
    });
    setEditError('');
  };

  // Edit Branch Save handler
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setEditError('');

    const name = editForm.name.trim();
    if (!name) {
      setEditError('Branch Name is required.');
      return;
    }

    if (editForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email.trim())) {
        setEditError('Please enter a valid email address.');
        return;
      }
    }

    // Protection rule: cannot change status to Inactive if it's the last active branch
    if (editingBranch.status === 'Active' && editForm.status === 'Inactive' && activeBranches <= 1) {
      setEditError('At least one active branch is required. You cannot deactivate this branch.');
      return;
    }

    updatePlatformBranch(editingBranch.id, {
      name,
      code: editForm.code.trim().toUpperCase(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      address: editForm.address.trim(),
      city: editForm.city.trim(),
      status: editForm.status
    });

    showToast(`${name} updated successfully`, 'success', 'Branch Updated');
    setEditingBranch(null);
  };

  // Toggle status initiation
  const handleOpenStatusModal = (branch) => {
    if (branch.status === 'Active' && activeBranches <= 1) {
      showToast('At least one active branch is required.', 'error', 'Action Restricted');
      return;
    }
    setStatusModalBranch(branch);
  };

  // Toggle status confirmation
  const handleConfirmToggleStatus = () => {
    if (!statusModalBranch) return;
    togglePlatformBranchStatus(statusModalBranch.id);
    setStatusModalBranch(null);
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredBranches.length === 0) {
      showToast('No branch records to export with current filters.', 'info', 'Export Empty');
      return;
    }

    const headers = [
      'Branch ID',
      'Restaurant ID',
      'Branch Name',
      'Branch Code',
      'City',
      'Status',
      'Setup Status',
      'Storage Locations',
      'Staff',
      'Created At'
    ];

    const rows = filteredBranches.map(b => [
      `"${b.id || ''}"`,
      `"${b.restaurantId || ''}"`,
      `"${(b.name || '').replace(/"/g, '""')}"`,
      `"${(b.code || '').replace(/"/g, '""')}"`,
      `"${(b.city || '').replace(/"/g, '""')}"`,
      `"${b.status || 'Active'}"`,
      `"${b.setupStatus || 'Completed'}"`,
      getStorageLocationCount(b.id),
      getStaffCount(b.id),
      `"${b.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'branches.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredBranches.length} branch records to branches.csv`, 'success', 'CSV Download Complete');
  };

  if (!selectedRestaurant) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[30px]">storefront</span>
          </div>
          <h2 className="font-display-lg text-2xl font-bold text-on-surface mb-2">
            Restaurant Not Found
          </h2>
          <p className="font-body-md text-secondary max-w-md mx-auto mb-6">
            The requested restaurant could not be resolved or was removed from platform state.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('admin-restaurants')}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col pb-16 antialiased">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <button
          type="button"
          onClick={() => onNavigate('super-admin')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Platform Administration
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <button
          type="button"
          onClick={() => onNavigate('admin-restaurants')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Restaurants
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <button
          type="button"
          onClick={() => onNavigate('admin-restaurant-detail')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          {selectedRestaurant.name}
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">Branches</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-numeric-table tracking-wide bg-surface-container text-on-surface-variant border border-outline-variant/40">
              {selectedRestaurant.id}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary">
              Branch Management
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface leading-tight">
            Branches
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-3xl mt-1">
            Manage locations and branch-level account setup for <span className="font-semibold text-on-surface">{selectedRestaurant.name}</span>.
          </p>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('admin-restaurant-detail')}
            className="flex items-center gap-space-xs px-space-md py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Restaurant</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-add-branch')}
            className="flex items-center gap-space-xs px-space-md py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
            <span>+ Add Branch</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC SUMMARY CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Total Branches
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-on-surface mt-2 font-numeric-table">
            {totalBranches}
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
            Active Branches
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-emerald-800 mt-2 font-numeric-table">
            {activeBranches}
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Inactive Branches
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-secondary mt-2 font-numeric-table">
            {inactiveBranches}
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Setup Complete
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-primary mt-2 font-numeric-table">
            {setupCompleteBranches}
          </span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">pending</span>
            Setup In Progress
          </span>
          <span className="font-headline-xl text-headline-xl font-bold text-amber-800 mt-2 font-numeric-table">
            {setupInProgressBranches}
          </span>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md mb-space-md shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/50 rounded-lg text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 rounded cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Controls & CSV Export */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-surface border border-outline-variant/50 rounded-lg text-label-md font-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Setup Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Setup:</span>
            <select
              value={setupFilter}
              onChange={(e) => setSetupFilter(e.target.value)}
              className="px-3 py-2 bg-surface border border-outline-variant/50 rounded-lg text-label-md font-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="All">All Setup Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Export Branches CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-2 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
            title="Download CSV"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Branches</span>
          </button>
        </div>
      </div>

      {/* BRANCHES DATA TABLE */}
      {filteredBranches.length > 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant/30 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="px-space-md py-3">Branch</th>
                  <th className="px-space-md py-3">Code</th>
                  <th className="px-space-md py-3">City</th>
                  <th className="px-space-md py-3">Status</th>
                  <th className="px-space-md py-3">Setup</th>
                  <th className="px-space-md py-3 text-center">Storage Locations</th>
                  <th className="px-space-md py-3 text-center">Staff</th>
                  <th className="px-space-md py-3">Created</th>
                  <th className="px-space-md py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-body-md font-body-md">
                {filteredBranches.map((branch) => {
                  const locCount = getStorageLocationCount(branch.id);
                  const staffCount = getStaffCount(branch.id);
                  const bSetup = branch.setupStatus || 'Completed';

                  return (
                    <tr
                      key={branch.id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      {/* Branch Name & ID */}
                      <td className="px-space-md py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface leading-snug">
                            {branch.name}
                          </span>
                          <span className="text-[11px] text-secondary font-numeric-table">
                            {branch.id}
                          </span>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-space-md py-3.5 text-xs font-numeric-table font-semibold text-on-surface-variant">
                        {branch.code || '—'}
                      </td>

                      {/* City */}
                      <td className="px-space-md py-3.5 text-secondary">
                        {branch.city || '—'}
                      </td>

                      {/* Status Badge */}
                      <td className="px-space-md py-3.5">
                        {branch.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-semibold bg-surface-container text-secondary border border-outline-variant/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Setup Status Badge */}
                      <td className="px-space-md py-3.5">
                        {bSetup === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Completed
                          </span>
                        ) : bSetup === 'In Progress' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="material-symbols-outlined text-[13px]">pending</span>
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-secondary border border-outline-variant/40">
                            Not Started
                          </span>
                        )}
                      </td>

                      {/* Storage Locations Count */}
                      <td className="px-space-md py-3.5 text-center font-numeric-table font-semibold text-on-surface">
                        {locCount}
                      </td>

                      {/* Staff Count */}
                      <td className="px-space-md py-3.5 text-center font-numeric-table text-secondary">
                        {staffCount}
                      </td>

                      {/* Created Date */}
                      <td className="px-space-md py-3.5 text-secondary text-xs">
                        {formatDate ? formatDate(branch.createdAt) : branch.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="px-space-md py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Branch */}
                          <button
                            type="button"
                            onClick={() => handleViewBranch(branch.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-container/10 border border-primary/20 rounded-md cursor-pointer transition-colors"
                          >
                            View
                          </button>

                          {/* Edit Branch */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(branch)}
                            className="px-2.5 py-1 text-xs font-semibold text-on-surface hover:bg-surface-container border border-outline-variant/50 rounded-md cursor-pointer transition-colors"
                          >
                            Edit
                          </button>

                          {/* Activate / Deactivate */}
                          {branch.status === 'Active' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(branch)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md cursor-pointer transition-colors"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(branch)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-md cursor-pointer transition-colors"
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
        </div>
      ) : restaurantBranches.length === 0 ? (
        /* Empty State: No branches yet for this restaurant */
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center shadow-2xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">apartment</span>
          </div>
          <h3 className="font-display-lg text-xl font-bold text-on-surface mb-1">
            No branches yet
          </h3>
          <p className="font-body-md text-secondary max-w-sm mx-auto mb-6">
            Add the first branch for this restaurant.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('admin-add-branch')}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
          >
            Add Branch
          </button>
        </div>
      ) : (
        /* Empty State: Search / filter mismatch */
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-10 text-center shadow-2xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <h3 className="font-display-lg text-lg font-bold text-on-surface mb-1">
            No branches found
          </h3>
          <p className="font-body-md text-secondary max-w-sm mx-auto mb-4">
            Try adjusting your search or filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setSetupFilter('All');
            }}
            className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* EDIT BRANCH MODAL */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-display-lg text-lg font-bold text-on-surface">
                  Edit Branch: {editingBranch.name}
                </h3>
                <span className="text-xs font-numeric-table text-secondary">
                  Branch ID: {editingBranch.id} • Restaurant ID: {selectedRestaurant.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingBranch(null)}
                className="text-secondary hover:text-on-surface p-1 rounded cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-space-md flex flex-col gap-space-md">
              {editError && (
                <div className="p-3 bg-error-container/40 border border-error/20 rounded-lg text-xs text-on-error-container flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-error">error</span>
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Branch Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface font-numeric-table focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface font-numeric-table focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-outline-variant/20 pt-space-md flex items-center justify-end gap-space-sm">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVATE / DEACTIVATE CONFIRMATION MODAL */}
      {statusModalBranch && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-fadeIn p-space-lg">
            <div className="flex items-center gap-3 mb-space-sm">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  statusModalBranch.status === 'Active'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {statusModalBranch.status === 'Active' ? 'location_off' : 'add_location_alt'}
                </span>
              </div>
              <h3 className="font-display-lg text-lg font-bold text-on-surface">
                {statusModalBranch.status === 'Active'
                  ? `Deactivate ${statusModalBranch.name}?`
                  : `Activate ${statusModalBranch.name}?`}
              </h3>
            </div>

            <p className="font-body-md text-secondary text-sm mb-space-lg leading-relaxed">
              This changes the branch status in the frontend prototype only. No backend user or inventory access is modified.
            </p>

            <div className="flex items-center justify-end gap-space-sm">
              <button
                type="button"
                onClick={() => setStatusModalBranch(null)}
                className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleStatus}
                className={`px-5 py-2 rounded-lg font-label-md font-semibold text-white cursor-pointer shadow-sm ${
                  statusModalBranch.status === 'Active'
                    ? 'bg-rose-700 hover:bg-rose-800'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {statusModalBranch.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
