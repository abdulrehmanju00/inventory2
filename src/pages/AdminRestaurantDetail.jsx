import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';

export default function AdminRestaurantDetail({ onNavigate }) {
  const {
    platformRestaurants,
    platformBranches,
    platformMembers,
    platformActivity,
    selectedRestaurantId,
    updatePlatformRestaurantStatus,
    updatePlatformRestaurant,
    formatDate
  } = useAppStore();

  // Find the selected restaurant from shared store
  const restaurant = useMemo(() => {
    return platformRestaurants.find(r => r.id === selectedRestaurantId);
  }, [platformRestaurants, selectedRestaurantId]);

  // Associated branches from shared collection
  const restaurantBranches = useMemo(() => {
    if (!restaurant) return [];
    return platformBranches.filter(b => b.restaurantId === restaurant.id);
  }, [platformBranches, restaurant]);

  // Dynamic branch count
  const branchCount = restaurantBranches.length > 0 ? restaurantBranches.length : (restaurant?.branches || 1);

  // Associated members from shared collection
  const restaurantMembers = useMemo(() => {
    if (!restaurant) return [];
    return (platformMembers || []).filter(m => m.restaurantId === restaurant.id);
  }, [platformMembers, restaurant]);

  const userCount = restaurantMembers.length > 0 ? restaurantMembers.length : (restaurant?.users || 0);
  const ownerCount = restaurantMembers.filter(m => m.role === 'Restaurant Owner').length;
  const managerCount = restaurantMembers.filter(m => m.role !== 'Restaurant Owner').length;
  const pendingCount = restaurantMembers.filter(m => m.status === 'Pending').length;

  // Platform-level prototype activity for this restaurant
  const relatedActivity = useMemo(() => {
    if (!restaurant) return [];
    const rName = restaurant.name.toLowerCase();
    const rId = restaurant.id.toLowerCase();
    const filtered = (platformActivity || []).filter(act => {
      const title = (act.title || '').toLowerCase();
      const details = (act.details || '').toLowerCase();
      return title.includes(rName) || title.includes(rId) || details.includes(rName);
    });

    if (filtered.length > 0) return filtered;
    // Fallback: show latest 3 platform events
    return (platformActivity || []).slice(0, 3);
  }, [platformActivity, restaurant]);

  // Modal State: Status confirmation
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    targetStatus: ''
  });

  // Modal State: Edit Restaurant
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    legalName: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Pakistan',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    dateFormat: 'DD MMM YYYY',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: ''
  });
  const [editErrors, setEditErrors] = useState({});

  // Setup Steps definition
  const setupSteps = useMemo(() => {
    if (!restaurant) return [];
    const sStatus = restaurant.setupStatus || 'Not Started';

    if (sStatus === 'Completed') {
      return [
        { id: 1, name: 'Restaurant Information', status: 'Completed' },
        { id: 2, name: 'Initial Branch', status: 'Completed' },
        { id: 3, name: 'Storage Locations', status: 'Completed' },
        { id: 4, name: 'Owner / Users', status: 'Completed' },
        { id: 5, name: 'Staff', status: 'Completed' },
        { id: 6, name: 'Suppliers', status: 'Completed' },
        { id: 7, name: 'Initial Inventory', status: 'Completed' },
        { id: 8, name: 'Setup Complete', status: 'Completed' }
      ];
    }

    if (sStatus === 'In Progress') {
      return [
        { id: 1, name: 'Restaurant Information', status: 'Completed' },
        { id: 2, name: 'Initial Branch', status: 'Completed' },
        { id: 3, name: 'Storage Locations', status: 'In Progress' },
        { id: 4, name: 'Owner / Users', status: 'Not Started' },
        { id: 5, name: 'Staff', status: 'Not Started' },
        { id: 6, name: 'Suppliers', status: 'Not Started' },
        { id: 7, name: 'Initial Inventory', status: 'Not Started' },
        { id: 8, name: 'Setup Complete', status: 'Not Started' }
      ];
    }

    // Not Started
    return [
      { id: 1, name: 'Restaurant Information', status: 'In Progress' },
      { id: 2, name: 'Initial Branch', status: 'Not Started' },
      { id: 3, name: 'Storage Locations', status: 'Not Started' },
      { id: 4, name: 'Owner / Users', status: 'Not Started' },
      { id: 5, name: 'Staff', status: 'Not Started' },
      { id: 6, name: 'Suppliers', status: 'Not Started' },
      { id: 7, name: 'Initial Inventory', status: 'Not Started' },
      { id: 8, name: 'Setup Complete', status: 'Not Started' }
    ];
  }, [restaurant]);

  // Open Edit Modal with current values
  const handleOpenEdit = () => {
    if (!restaurant) return;
    setEditForm({
      name: restaurant.name || '',
      legalName: restaurant.legalName || '',
      code: restaurant.code || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      address: restaurant.address || '',
      city: restaurant.city || '',
      country: restaurant.country || 'Pakistan',
      currency: restaurant.currency || 'PKR',
      timezone: restaurant.timezone || 'Asia/Karachi',
      dateFormat: restaurant.dateFormat || 'DD MMM YYYY',
      ownerName: restaurant.ownerName || '',
      ownerEmail: restaurant.ownerEmail || '',
      ownerPhone: restaurant.ownerPhone || ''
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  // Validate & Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!editForm.name.trim()) errors.name = 'Restaurant Name is required.';
    if (!editForm.ownerName.trim()) errors.ownerName = 'Owner Name is required.';
    if (!editForm.ownerEmail.trim()) {
      errors.ownerEmail = 'Owner Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.ownerEmail.trim())) {
      errors.ownerEmail = 'Please provide a valid email address.';
    }
    if (editForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      errors.email = 'Please provide a valid restaurant email address.';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    updatePlatformRestaurant(restaurant.id, {
      name: editForm.name.trim(),
      legalName: editForm.legalName.trim(),
      code: editForm.code.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim().toLowerCase(),
      address: editForm.address.trim(),
      city: editForm.city.trim(),
      country: editForm.country,
      currency: editForm.currency,
      timezone: editForm.timezone,
      dateFormat: editForm.dateFormat,
      ownerName: editForm.ownerName.trim(),
      ownerEmail: editForm.ownerEmail.trim().toLowerCase(),
      ownerPhone: editForm.ownerPhone.trim()
    });

    setEditModalOpen(false);
  };

  // Open Status Confirmation
  const handleOpenStatusConfirm = (targetStatus) => {
    setStatusModal({
      isOpen: true,
      targetStatus
    });
  };

  // Confirm Status Change
  const handleConfirmStatusChange = () => {
    if (restaurant && statusModal.targetStatus) {
      updatePlatformRestaurantStatus(restaurant.id, statusModal.targetStatus);
    }
    setStatusModal({ isOpen: false, targetStatus: '' });
  };

  // Handle Continue Setup
  const handleContinueSetup = () => {
    onNavigate('admin-restaurant-setup');
  };

  // SAFE FALLBACK: If no valid restaurant can be resolved
  if (!restaurant) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 px-4 text-center antialiased">
        <div className="p-8 sm:p-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-on-surface-variant flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[36px]">storefront</span>
          </div>
          <h2 className="font-headline-xl text-headline-xl font-bold text-on-surface mb-2">
            Restaurant not found
          </h2>
          <p className="text-body-md text-secondary max-w-md mx-auto mb-6">
            The selected restaurant could not be located in the platform registry. It may have been removed or the ID is invalid.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('admin-restaurants')}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-label-md font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

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
        <span
          onClick={() => onNavigate('admin-restaurants')}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Restaurants
        </span>
        <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
        <span className="text-on-surface font-semibold truncate max-w-xs">{restaurant.name}</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface">
              {restaurant.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-surface-container-high border border-outline-variant/40 font-numeric-table font-mono text-xs text-on-surface font-semibold">
              {restaurant.id}
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Restaurant account, ownership, branches and setup overview.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenEdit}
            className="h-10 px-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Edit Restaurant</span>
          </button>

          <button
            type="button"
            onClick={handleContinueSetup}
            className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {restaurant.setupStatus === 'Completed' ? 'visibility' : 'play_arrow'}
            </span>
            <span>{restaurant.setupStatus === 'Completed' ? 'View Setup' : 'Continue Setup'}</span>
          </button>
        </div>
      </div>

      {/* COMPACT METADATA STRIP */}
      <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs mb-space-lg flex flex-wrap items-center gap-4 sm:gap-8 text-xs">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface-variant uppercase tracking-wider">Status:</span>
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
        </div>

        {/* Plan */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface-variant uppercase tracking-wider">Plan:</span>
          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-surface-container-high text-on-surface border border-outline-variant/30">
            {restaurant.plan}
          </span>
        </div>

        {/* Setup Status */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface-variant uppercase tracking-wider">Setup:</span>
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
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface-variant uppercase tracking-wider">Created:</span>
          <span className="font-numeric-table text-on-surface font-medium">
            {formatDate ? formatDate(restaurant.createdAt) : restaurant.createdAt}
          </span>
        </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT (Main Column + Side Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* MAIN COLUMN (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-space-lg">
          {/* CARD 1: RESTAURANT INFORMATION */}
          <div className="p-5 sm:p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                <span>Restaurant Information</span>
              </h2>
              {restaurant.code && (
                <span className="text-xs font-mono text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                  {restaurant.code}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Restaurant Name
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">{restaurant.name}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Legal / Business Name
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {restaurant.legalName || '—'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Restaurant Code
                </span>
                <span className="font-medium text-on-surface mt-0.5 font-mono block">
                  {restaurant.code || '—'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {restaurant.email || '—'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Phone Number
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {restaurant.phone || '—'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Address
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {restaurant.address || '—'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  City
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {restaurant.city || '—'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Country
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {restaurant.country || 'Pakistan'}
                </span>
              </div>
            </div>
          </div>

          {/* CARD 2: OWNER INFORMATION */}
          <div className="p-5 sm:p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="pb-3 mb-4 border-b border-outline-variant/20">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                <span>Owner Information</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm mb-4">
              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Owner Full Name
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {restaurant.ownerName || '—'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Owner Email
                </span>
                <span className="font-medium text-on-surface mt-0.5 font-mono block">
                  {restaurant.ownerEmail || '—'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Owner Phone
                </span>
                <span className="font-medium text-on-surface mt-0.5 block">
                  {restaurant.ownerPhone || '—'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">info</span>
              <span>
                Owner access is currently prototype data. Real authentication and invitations will be added during backend integration.
              </span>
            </div>
          </div>

          {/* CARD 3: BRANCHES (Filtered from shared collection) */}
          <div className="p-5 sm:p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                  <span>Branches</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-xs font-bold font-numeric-table text-on-surface">
                  {branchCount}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('admin-add-branch')}
                className="h-8 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/50 text-primary hover:text-primary/90 font-label-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Branch</span>
              </button>
            </div>

            {restaurantBranches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      <th className="py-2.5 px-3">Branch</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Created</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {restaurantBranches.map((br) => (
                      <tr key={br.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                              store
                            </span>
                            <div>
                              <span className="font-semibold text-on-surface block leading-tight">
                                {br.name}
                              </span>
                              <span className="text-[11px] font-mono text-on-surface-variant block">
                                {br.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>{br.status || 'Active'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs font-numeric-table text-on-surface-variant">
                          {formatDate ? formatDate(br.createdAt) : br.createdAt}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onNavigate('admin-branches')}
                              className="px-2.5 py-1 rounded text-xs font-medium text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-on-surface-variant text-xs">
                <span>No branches configured yet for this restaurant.</span>
              </div>
            )}
          </div>

          {/* CARD 4: SETUP PROGRESS */}
          <div className="p-5 sm:p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
                  <span>Setup Progress</span>
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  Platform onboarding checklist and configuration steps.
                </p>
              </div>

              <button
                type="button"
                onClick={handleContinueSetup}
                className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>{restaurant.setupStatus === 'Completed' ? 'View Setup' : 'Continue Setup'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {setupSteps.map((step) => {
                const isDone = step.status === 'Completed';
                const isInProgress = step.status === 'In Progress';
                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                      isDone
                        ? 'bg-surface-container-lowest border-outline-variant/30'
                        : isInProgress
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-surface-container-low/40 border-outline-variant/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className={`font-medium truncate ${isDone ? 'text-on-surface' : isInProgress ? 'text-amber-950 font-semibold' : 'text-on-surface-variant'}`}>
                        {step.name}
                      </span>
                    </div>

                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 uppercase tracking-wider ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDE COLUMN (1 col on desktop) */}
        <div className="space-y-space-lg">
          {/* CARD A: ACCOUNT STATUS & PROTOTYPE ACTIONS */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface pb-3 mb-4 border-b border-outline-variant/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
              <span>Account Status</span>
            </h3>

            <div className="space-y-3.5 mb-5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Account Status</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border ${
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
              </div>

              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Plan</span>
                <span className="font-semibold text-on-surface">{restaurant.plan}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Setup Status</span>
                <span className="font-semibold text-on-surface">{restaurant.setupStatus}</span>
              </div>
            </div>

            {/* Status Management Actions */}
            <div className="space-y-2 pt-3 border-t border-outline-variant/20">
              {restaurant.status === 'Active' && (
                <button
                  type="button"
                  onClick={() => handleOpenStatusConfirm('Suspended')}
                  className="w-full h-9 rounded-lg border border-error/40 text-error hover:bg-error-container/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Suspend Restaurant</span>
                </button>
              )}

              {restaurant.status === 'Trial' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOpenStatusConfirm('Active')}
                    className="w-full h-9 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Convert Trial to Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenStatusConfirm('Suspended')}
                    className="w-full h-9 rounded-lg border border-error/40 text-error hover:bg-error-container/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <span>Suspend Restaurant</span>
                  </button>
                </div>
              )}

              {restaurant.status === 'Suspended' && (
                <button
                  type="button"
                  onClick={() => handleOpenStatusConfirm('Active')}
                  className="w-full h-9 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">lock_open</span>
                  <span>Activate Restaurant</span>
                </button>
              )}

              <p className="text-[11px] text-on-surface-variant/80 pt-1 leading-normal text-center">
                This changes only frontend prototype account status. No backend access or billing is modified.
              </p>
            </div>
          </div>

          {/* CARD B: REGIONAL SETTINGS */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface pb-3 mb-4 border-b border-outline-variant/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">public</span>
              <span>Regional Settings</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Currency</span>
                <span className="font-semibold text-on-surface font-mono">{restaurant.currency || 'PKR'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Timezone</span>
                <span className="font-semibold text-on-surface">{restaurant.timezone || 'Asia/Karachi'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Date Format</span>
                <span className="font-semibold text-on-surface font-mono">{restaurant.dateFormat || 'DD MMM YYYY'}</span>
              </div>
            </div>
          </div>

          {/* CARD C: RESTAURANT USERS SUMMARY */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">group</span>
                <span>Restaurant Users</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('admin-restaurant-users')}
                className="text-xs text-primary hover:text-primary/90 font-semibold cursor-pointer"
              >
                Manage Users
              </button>
            </div>

            <div className="space-y-2.5 text-xs mb-3">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Total Users</span>
                <span className="font-bold text-on-surface font-numeric-table">{userCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Owners</span>
                <span className="font-semibold text-on-surface font-numeric-table">
                  {ownerCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Managers / Operations</span>
                <span className="font-semibold text-on-surface font-numeric-table">
                  {managerCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Pending Invitations</span>
                <span className="font-semibold text-on-surface font-numeric-table">{pendingCount}</span>
              </div>
            </div>
          </div>

          {/* CARD D: RECENT PLATFORM ACTIVITY */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                <span>Recent Activity</span>
              </h3>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Prototype activity
              </span>
            </div>

            {relatedActivity.length > 0 ? (
              <div className="space-y-3">
                {relatedActivity.map((act) => (
                  <div key={act.id} className="text-xs flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-on-surface block leading-tight">
                        {act.title}
                      </span>
                      <span className="text-[11px] text-secondary mt-0.5 block leading-normal">
                        {act.details}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-numeric-table block mt-0.5">
                        {act.displayDate || act.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-on-surface-variant py-4 text-center">
                No recent activity logged for this restaurant.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR STATUS TRANSITION */}
      {statusModal.isOpen && (
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
                    ? `Suspend ${restaurant.name}?`
                    : `Activate ${restaurant.name}?`}
                </h3>
                <p className="text-xs text-on-surface-variant font-mono">
                  Account ID: {restaurant.id}
                </p>
              </div>
            </div>

            <p className="text-body-sm text-secondary mb-6 leading-relaxed">
              This changes only the frontend prototype account status. No backend user access is currently modified.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusModal({ isOpen: false, targetStatus: '' })}
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

      {/* EDIT RESTAURANT MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-outline-variant/20">
              <div>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">
                  Edit Restaurant
                </h3>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                  Internal ID: {restaurant.id} • Created: {restaurant.createdAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Section 1: Core Restaurant Info */}
              <div>
                <h4 className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider mb-2.5">
                  Restaurant Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Restaurant Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {editErrors.name && (
                      <span className="text-[11px] text-error mt-0.5 block">{editErrors.name}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Legal / Business Name
                    </label>
                    <input
                      type="text"
                      value={editForm.legalName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, legalName: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Restaurant Code
                    </label>
                    <input
                      type="text"
                      value={editForm.code}
                      onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Restaurant Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {editErrors.email && (
                      <span className="text-[11px] text-error mt-0.5 block">{editErrors.email}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Owner Info */}
              <div className="pt-3 border-t border-outline-variant/20">
                <h4 className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider mb-2.5">
                  Owner Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Owner Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.ownerName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {editErrors.ownerName && (
                      <span className="text-[11px] text-error mt-0.5 block">{editErrors.ownerName}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Owner Email <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      value={editForm.ownerEmail}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {editErrors.ownerEmail && (
                      <span className="text-[11px] text-error mt-0.5 block">{editErrors.ownerEmail}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Owner Phone
                    </label>
                    <input
                      type="text"
                      value={editForm.ownerPhone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Regional Settings */}
              <div className="pt-3 border-t border-outline-variant/20">
                <h4 className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider mb-2.5">
                  Regional Settings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Currency
                    </label>
                    <select
                      value={editForm.currency}
                      onChange={(e) => setEditForm(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="PKR">PKR - Pakistani Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="AED">AED - UAE Dirham</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Timezone
                    </label>
                    <select
                      value={editForm.timezone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">
                      Date Format
                    </label>
                    <select
                      value={editForm.dateFormat}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dateFormat: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="DD MMM YYYY">DD MMM YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="h-9 px-4 rounded-lg border border-outline-variant/50 hover:bg-surface-container-low text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
