import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';

const PROTOTYPE_ROLES = [
  {
    role: 'Restaurant Owner',
    title: 'Restaurant Owner',
    desc: 'Full restaurant-level management access and organization ownership.',
    icon: 'badge'
  },
  {
    role: 'Operations Lead',
    title: 'Operations Lead',
    desc: 'Operations, inventory, purchasing, staff and reporting oversight.',
    icon: 'admin_panel_settings'
  },
  {
    role: 'Inventory Manager',
    title: 'Inventory Manager',
    desc: 'Inventory balances, stock counts, wastage, transfers and purchasing.',
    icon: 'inventory_2'
  },
  {
    role: 'Kitchen Manager',
    title: 'Kitchen Manager',
    desc: 'Master recipes, production runs, yields and kitchen operations.',
    icon: 'skillet'
  }
];

export default function AdminAddUser({ onNavigate }) {
  const {
    platformRestaurants,
    platformBranches,
    platformMembers,
    selectedRestaurantId,
    createPlatformMember,
    showToast
  } = useAppStore();

  // 1. Resolve selected restaurant
  const selectedRestaurant = useMemo(() => {
    if (!platformRestaurants || platformRestaurants.length === 0) return null;
    return platformRestaurants.find(r => r.id === selectedRestaurantId) || null;
  }, [platformRestaurants, selectedRestaurantId]);

  // 2. Resolve branches strictly belonging to this restaurant (tenant isolation)
  const restaurantBranches = useMemo(() => {
    if (!selectedRestaurant) return [];
    return (platformBranches || []).filter(b => b.restaurantId === selectedRestaurant.id);
  }, [platformBranches, selectedRestaurant]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Operations Lead',
    accessMode: 'all', // 'all' or 'specific'
    selectedBranches: [],
    status: 'Pending'
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    return Boolean(
      formData.name.trim() ||
      formData.email.trim() ||
      formData.phone.trim() ||
      formData.role !== 'Operations Lead' ||
      formData.accessMode !== 'all' ||
      formData.selectedBranches.length > 0 ||
      formData.status !== 'Pending'
    );
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submitError) setSubmitError('');
  };

  // Branch multi-select handler
  const handleToggleBranch = (branchId) => {
    setFormData(prev => {
      const exists = prev.selectedBranches.includes(branchId);
      const nextBranches = exists
        ? prev.selectedBranches.filter(id => id !== branchId)
        : [...prev.selectedBranches, branchId];
      return { ...prev, selectedBranches: nextBranches };
    });
    if (errors.branches) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.branches;
        return next;
      });
    }
  };

  const handleSelectAllSpecificBranches = () => {
    setFormData(prev => ({
      ...prev,
      selectedBranches: restaurantBranches.map(b => b.id)
    }));
    if (errors.branches) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.branches;
        return next;
      });
    }
  };

  const handleClearSpecificBranches = () => {
    setFormData(prev => ({ ...prev, selectedBranches: [] }));
  };

  // Cancel handler
  const handleCancelClick = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onNavigate('admin-restaurant-users');
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    onNavigate('admin-restaurant-users');
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Full Name
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full Name is required.';
    }

    // 2. Email Address
    const trimmedEmail = formData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    } else {
      // 3. Duplicate email check strictly within this restaurant
      const existingMembersForRestaurant = (platformMembers || []).filter(
        m => m.restaurantId === selectedRestaurant.id
      );
      const isDuplicate = existingMembersForRestaurant.some(
        m => (m.email || '').trim().toLowerCase() === trimmedEmail
      );
      if (isDuplicate) {
        newErrors.email = 'A user with this email already exists for this restaurant.';
      }
    }

    // 4. Role
    if (!formData.role) {
      newErrors.role = 'Role selection is required.';
    }

    // 5. Branch Access Validation
    if (formData.accessMode === 'specific') {
      if (formData.selectedBranches.length === 0) {
        newErrors.branches = 'At least one branch must be selected when Specific Branches is chosen.';
      } else {
        // Cross-tenant validation: ensure all selected branch IDs belong to selectedRestaurantId
        const validBranchIds = new Set(restaurantBranches.map(b => b.id));
        const hasInvalidBranch = formData.selectedBranches.some(id => !validBranchIds.has(id));
        if (hasInvalidBranch) {
          newErrors.branches = 'One or more selected branches do not belong to this restaurant.';
        }
      }
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedRestaurant) {
      setSubmitError('Cannot add a user without a valid restaurant context.');
      return;
    }

    const { isValid, errors: validationErrors } = validateForm();
    if (!isValid) {
      const firstError = Object.values(validationErrors)[0];
      setSubmitError(firstError || 'Please fix the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const trimmedName = formData.name.trim();
      const trimmedEmail = formData.email.trim().toLowerCase();
      const branchAccessPayload = formData.accessMode === 'all'
        ? ['all']
        : formData.selectedBranches;

      const res = createPlatformMember({
        restaurantId: selectedRestaurant.id,
        name: trimmedName,
        email: trimmedEmail,
        phone: formData.phone.trim(),
        role: formData.role,
        status: formData.status,
        branchAccess: branchAccessPayload
      });

      if (res && res.success) {
        onNavigate('admin-restaurant-users');
      } else {
        setSubmitError(res?.error || 'Failed to add restaurant user.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('[AdminAddUser] Error creating member:', err);
      setSubmitError('An unexpected error occurred while adding the user.');
      setIsSubmitting(false);
    }
  };

  // Fallback if restaurant is invalid or not resolved
  if (!selectedRestaurant) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[30px]">group_off</span>
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
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-colors"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-16 antialiased">
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
        <button
          type="button"
          onClick={() => onNavigate('admin-restaurant-users')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Users
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant font-medium">Add User</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-numeric-table tracking-wide bg-surface-container text-on-surface-variant border border-outline-variant/40">
              {selectedRestaurant.id}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary">
              User Provisioning
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface leading-tight">
            Add Restaurant User
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl mt-1">
            Create a prototype user profile and configure role and branch access for <span className="font-semibold text-on-surface">{selectedRestaurant.name}</span>.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={isSubmitting}
            className="px-space-md py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-space-md py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Adding User...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Add User</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RESTAURANT CONTEXT CARD */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">storefront</span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-secondary">
              Target Restaurant Organization
            </div>
            <div className="text-base font-bold text-on-surface flex items-center gap-2">
              <span>{selectedRestaurant.name}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-numeric-table font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/40">
                {selectedRestaurant.id}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-secondary font-medium">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{selectedRestaurant.status || 'Active'}</span>
          </div>
          <span className="text-outline-variant">·</span>
          <span>{restaurantBranches.length} {restaurantBranches.length === 1 ? 'branch' : 'branches'}</span>
          <span className="text-outline-variant">·</span>
          <span>{selectedRestaurant.city || 'Lahore'}, {selectedRestaurant.country || 'Pakistan'}</span>
        </div>
      </div>

      {/* SUBMISSION ERROR BANNER */}
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-error-container/40 border border-error/20 flex items-start gap-3 text-on-error-container">
          <span className="material-symbols-outlined text-error shrink-0 mt-0.5">error</span>
          <div className="text-sm font-medium">
            {submitError}
          </div>
        </div>
      )}

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* SECTION 1: USER INFORMATION */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              1. User Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Usman Ali"
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.name ? 'border-error ring-1 ring-error' : 'border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary'
                } bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors placeholder:text-secondary/50`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. usman@restaurant.test"
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.email ? 'border-error ring-1 ring-error' : 'border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary'
                } bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors placeholder:text-secondary/50`}
              />
              {errors.email ? (
                <p className="mt-1.5 text-xs text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {errors.email}
                </p>
              ) : (
                <p className="mt-1 text-xs text-secondary">
                  Must be unique within {selectedRestaurant.name}. Used for future platform login notifications.
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-label-md text-label-md font-semibold text-on-surface">
                  Phone Number
                </label>
                <span className="text-[11px] text-secondary font-medium">Optional</span>
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors placeholder:text-secondary/50"
              />
              <p className="mt-1 text-xs text-secondary">
                Optional contact number for operations coordination and branch alerts.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center gap-2.5 text-xs text-secondary">
            <span className="material-symbols-outlined text-[18px] text-primary">security</span>
            <span>No passwords, PINs, or credentials are collected. Authentication credentials will be configured once real Auth is connected.</span>
          </div>
        </div>

        {/* SECTION 2: ROLE */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                2. Operational Role
              </h2>
            </div>
            <span className="text-xs text-secondary">
              Select one primary role assignment
            </span>
          </div>

          <p className="text-xs text-secondary mb-4">
            Role permissions are prototype configuration until backend authorization is connected. Multiple owners and managers are supported.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {PROTOTYPE_ROLES.map((item) => {
              const isSelected = formData.role === item.role;
              return (
                <label
                  key={item.role}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={item.role}
                    checked={isSelected}
                    onChange={() => handleChange('role', item.role)}
                    className="mt-1 text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[20px] ${
                        isSelected ? 'text-primary' : 'text-secondary'
                      }`}>
                        {item.icon}
                      </span>
                      <span className={`text-sm font-bold ${
                        isSelected ? 'text-primary' : 'text-on-surface'
                      }`}>
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {errors.role && (
            <p className="mt-2 text-xs text-error font-medium">{errors.role}</p>
          )}
        </div>

        {/* SECTION 3: BRANCH ACCESS */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                3. Branch Access
              </h2>
            </div>
            <span className="text-xs text-secondary font-medium">
              Scoped strictly to {selectedRestaurant.name}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {/* All Branches option */}
            <label className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
              formData.accessMode === 'all'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-outline-variant/50 hover:bg-surface-container-low'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="accessMode"
                  value="all"
                  checked={formData.accessMode === 'all'}
                  onChange={() => handleChange('accessMode', 'all')}
                  className="text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="text-sm font-semibold text-on-surface">
                    All Branches
                  </div>
                  <div className="text-xs text-secondary">
                    User can view and manage inventory across all current and future branch locations for {selectedRestaurant.name}.
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/30">
                Default
              </span>
            </label>

            {/* Specific Branches option */}
            <label className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
              formData.accessMode === 'specific'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-outline-variant/50 hover:bg-surface-container-low'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="accessMode"
                  value="specific"
                  checked={formData.accessMode === 'specific'}
                  onChange={() => handleChange('accessMode', 'specific')}
                  className="text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="text-sm font-semibold text-on-surface">
                    Specific Branches
                  </div>
                  <div className="text-xs text-secondary">
                    Limit operational permissions to explicitly selected operating locations.
                  </div>
                </div>
              </div>
              <span className="text-xs text-secondary font-numeric-table">
                {formData.accessMode === 'specific' ? `${formData.selectedBranches.length} selected` : 'Restricted'}
              </span>
            </label>
          </div>

          {/* Specific Branches Selector */}
          {formData.accessMode === 'specific' && (
            <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/20 flex-wrap gap-2">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Available Branches for {selectedRestaurant.name}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllSpecificBranches}
                    className="text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-outline-variant">·</span>
                  <button
                    type="button"
                    onClick={handleClearSpecificBranches}
                    className="text-secondary hover:underline font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {restaurantBranches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {restaurantBranches.map((branch) => {
                    const isChecked = formData.selectedBranches.includes(branch.id);
                    return (
                      <label
                        key={branch.id}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                          isChecked
                            ? 'bg-surface-container-lowest border-primary/60 ring-1 ring-primary/40'
                            : 'bg-surface-container-lowest/70 border-outline-variant/40 hover:bg-surface-container-lowest'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleBranch(branch.id)}
                            className="rounded border-outline text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          />
                          <div className="truncate">
                            <div className="text-sm font-semibold text-on-surface truncate">
                              {branch.name}
                            </div>
                            <div className="text-[11px] text-secondary font-numeric-table">
                              {branch.code || branch.id} · {branch.city || 'Lahore'}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          branch.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-surface-container text-secondary'
                        }`}>
                          {branch.status || 'Active'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-secondary italic">
                  No branch locations found for this restaurant. Please create branches first.
                </div>
              )}

              {errors.branches && (
                <p className="mt-3 text-xs text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {errors.branches}
                </p>
              )}
            </div>
          )}
        </div>

        {/* SECTION 4: ACCESS STATUS */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[20px]">toggle_on</span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              4. Access Status
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Options */}
            <label className={`p-4 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
              formData.status === 'Pending'
                ? 'border-amber-400 bg-amber-500/5 ring-1 ring-amber-400'
                : 'border-outline-variant/50 hover:bg-surface-container-low'
            }`}>
              <input
                type="radio"
                name="status"
                value="Pending"
                checked={formData.status === 'Pending'}
                onChange={() => handleChange('status', 'Pending')}
                className="mt-1 text-primary focus:ring-primary cursor-pointer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">Pending</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-secondary mt-1">
                  Account profile created in pending state. Platform access has not yet been activated.
                </p>
              </div>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
              formData.status === 'Active'
                ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500'
                : 'border-outline-variant/50 hover:bg-surface-container-low'
            }`}>
              <input
                type="radio"
                name="status"
                value="Active"
                checked={formData.status === 'Active'}
                onChange={() => handleChange('status', 'Active')}
                className="mt-1 text-primary focus:ring-primary cursor-pointer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface">Active</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Immediate
                  </span>
                </div>
                <p className="text-xs text-secondary mt-1">
                  Mark prototype profile immediately active and eligible for simulated branch sessions.
                </p>
              </div>
            </label>
          </div>

          <p className="mt-4 text-xs text-secondary leading-relaxed">
            Pending indicates that platform access has not yet been activated. No invitation email is sent in this frontend prototype.
          </p>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Adding User...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Add User</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* DISCARD CONFIRMATION MODAL */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xl p-6 antialiased animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[26px]">warning</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
              Discard new user profile?
            </h3>
            <p className="font-body-md text-body-md text-secondary mb-6">
              You have unsaved changes. Leaving this screen will lose the entered user profile and branch access configuration.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container font-label-md text-xs font-semibold text-on-surface cursor-pointer transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 rounded-lg bg-error hover:bg-error/90 text-on-error font-label-md text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
