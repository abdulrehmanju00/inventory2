import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';

// Default initial storage locations for any new branch
const DEFAULT_STORAGE_LOCATIONS = [
  { id: 'init-loc-1', name: 'Main Store', type: 'General Store', enabled: true },
  { id: 'init-loc-2', name: 'Walk-in Cooler', type: 'Cold Storage', enabled: true },
  { id: 'init-loc-3', name: 'Dry Store', type: 'Dry Storage', enabled: true },
  { id: 'init-loc-4', name: 'Kitchen Prep', type: 'Kitchen / Prep', enabled: true }
];

const STORAGE_LOCATION_TYPES = [
  'General Store',
  'Cold Storage',
  'Dry Storage',
  'Kitchen / Prep',
  'Other'
];

const COUNTRY_OPTIONS = [
  'Pakistan',
  'United Arab Emirates',
  'Saudi Arabia',
  'United Kingdom',
  'United States',
  'Other'
];

/**
 * Automatically generates a standard branch code if not provided by user.
 * Example: "Johar Town" -> "JHR-001"
 */
function generateBranchCode(name, existingBranchesForRest = []) {
  const clean = (name || '').trim();
  if (!clean) return 'BR-001';
  const upper = clean.toUpperCase();
  // Extract consonants (B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y, Z, 0-9)
  const consonants = upper.replace(/[^BCDFGHJKLMNPQRSTVWXYZ0-9]/g, '');
  let prefix = '';
  if (consonants.length >= 3) {
    prefix = consonants.slice(0, 3);
  } else {
    const letters = upper.replace(/[^A-Z0-9]/g, '');
    prefix = (letters + 'BRN').slice(0, 3);
  }
  
  // Find matching existing branch codes with this prefix to increment sequence
  const matchingCodes = (existingBranchesForRest || []).filter(
    b => (b.code || '').toUpperCase().startsWith(prefix)
  );
  const nextNum = matchingCodes.length + 1;
  return `${prefix}-${String(nextNum).padStart(3, '0')}`;
}

export default function AdminAddBranch({ onNavigate }) {
  const {
    platformRestaurants,
    platformBranches,
    selectedRestaurantId,
    createPlatformBranch,
    showToast
  } = useAppStore();

  // 1. Resolve selected restaurant
  const selectedRestaurant = useMemo(() => {
    if (!platformRestaurants || platformRestaurants.length === 0) return null;
    return platformRestaurants.find(r => r.id === selectedRestaurantId) || null;
  }, [platformRestaurants, selectedRestaurantId]);

  // 2. Existing branches for this restaurant (used for duplicate validation & code generation)
  const existingBranchesForRestaurant = useMemo(() => {
    if (!selectedRestaurant) return [];
    return (platformBranches || []).filter(b => b.restaurantId === selectedRestaurant.id);
  }, [platformBranches, selectedRestaurant]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: 'Active',
    phone: '',
    email: '',
    address: '',
    city: selectedRestaurant?.city || 'Lahore',
    country: selectedRestaurant?.country || 'Pakistan'
  });

  // Storage Locations State
  const [locations, setLocations] = useState(() =>
    DEFAULT_STORAGE_LOCATIONS.map(l => ({ ...l }))
  );

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Track if user entered any data (dirty state)
  const isDirty = useMemo(() => {
    return Boolean(
      formData.name.trim() ||
      formData.code.trim() ||
      formData.phone.trim() ||
      formData.email.trim() ||
      formData.address.trim() ||
      formData.city !== (selectedRestaurant?.city || 'Lahore') ||
      locations.some((l, idx) => {
        const def = DEFAULT_STORAGE_LOCATIONS[idx];
        return !def || l.name !== def.name || l.type !== def.type || l.enabled !== def.enabled;
      }) ||
      locations.length !== DEFAULT_STORAGE_LOCATIONS.length
    );
  }, [formData, locations, selectedRestaurant]);

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

  // Location handlers
  const handleToggleLocation = (id) => {
    setLocations(prev =>
      prev.map(loc => (loc.id === id ? { ...loc, enabled: !loc.enabled } : loc))
    );
    if (errors.locations) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.locations;
        return next;
      });
    }
  };

  const handleLocationNameChange = (id, newName) => {
    setLocations(prev =>
      prev.map(loc => (loc.id === id ? { ...loc, name: newName } : loc))
    );
    if (errors.locations) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.locations;
        return next;
      });
    }
  };

  const handleLocationTypeChange = (id, newType) => {
    setLocations(prev =>
      prev.map(loc => (loc.id === id ? { ...loc, type: newType } : loc))
    );
  };

  const handleAddLocation = () => {
    const newId = `custom-loc-${Date.now()}`;
    setLocations(prev => [
      ...prev,
      {
        id: newId,
        name: `Storage Room ${prev.length + 1}`,
        type: 'General Store',
        enabled: true
      }
    ]);
  };

  const handleRemoveLocation = (id) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  // Handle Cancel navigation
  const handleCancelClick = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onNavigate('admin-branches');
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    onNavigate('admin-branches');
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Branch Name validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Branch Name is required.';
    } else {
      // Check duplicate within the SAME restaurant
      const isDuplicate = existingBranchesForRestaurant.some(
        b => b.status === 'Active' && b.name.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        newErrors.name = 'A branch with this name already exists for this restaurant.';
      }
    }

    // 2. Email format validation (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid branch email address.';
    }

    // 3. Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Street Address is required.';
    }

    // 4. City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    // 5. Country validation
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required.';
    }

    // 6. Storage Locations validation
    const enabledLocs = locations.filter(l => l.enabled);
    if (enabledLocs.length === 0) {
      newErrors.locations = 'At least one active storage location is required.';
    } else {
      // Check for blank location names among enabled
      const hasBlankName = enabledLocs.some(l => !l.name.trim());
      if (hasBlankName) {
        newErrors.locations = 'All enabled storage locations must have a valid name.';
      } else {
        // Check for duplicate location names within branch
        const namesSet = new Set();
        let hasDuplicateLocName = false;
        for (const loc of enabledLocs) {
          const norm = loc.name.trim().toLowerCase();
          if (namesSet.has(norm)) {
            hasDuplicateLocName = true;
            break;
          }
          namesSet.add(norm);
        }
        if (hasDuplicateLocName) {
          newErrors.locations = 'Storage location names must be unique within the branch.';
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
      setSubmitError('Cannot create a branch without a valid restaurant context.');
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

      // Branch Code: generate if blank
      let finalCode = formData.code.trim();
      if (!finalCode) {
        finalCode = generateBranchCode(trimmedName, existingBranchesForRestaurant);
      } else {
        finalCode = finalCode.toUpperCase();
      }

      // Filter and format enabled storage locations
      const enabledLocations = locations
        .filter(l => l.enabled)
        .map(l => ({
          name: l.name.trim(),
          type: l.type,
          status: 'Active'
        }));

      // Create branch and storage locations atomically
      const result = createPlatformBranch(
        {
          restaurantId: selectedRestaurant.id,
          code: finalCode,
          name: trimmedName,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          country: formData.country.trim(),
          status: formData.status
        },
        enabledLocations
      );

      if (result && result.success) {
        // Navigate to branches list
        onNavigate('admin-branches');
      } else {
        setSubmitError(result?.error || 'Failed to create branch. Please check inputs.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('[AdminAddBranch] Error creating branch:', err);
      setSubmitError('An unexpected error occurred while creating the branch.');
      setIsSubmitting(false);
    }
  };

  // If selectedRestaurant is invalid or missing
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
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-colors"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  const enabledCount = locations.filter(l => l.enabled).length;

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
          onClick={() => onNavigate('admin-branches')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Branches
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant font-medium">Add Branch</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-numeric-table tracking-wide bg-surface-container text-on-surface-variant border border-outline-variant/40">
              {selectedRestaurant.id}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary">
              Branch Creation
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface leading-tight">
            Add Branch
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl mt-1">
            Create a new operating location for <span className="font-semibold text-on-surface">{selectedRestaurant.name}</span>.
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
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">add_location</span>
                <span>Create Branch</span>
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
              Parent Restaurant Organization
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
          <span>{existingBranchesForRestaurant.length} existing {existingBranchesForRestaurant.length === 1 ? 'branch' : 'branches'}</span>
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
        {/* SECTION 1: BRANCH INFORMATION */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[20px]">apartment</span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Branch Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Branch Name */}
            <div className="md:col-span-2">
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Branch Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Johar Town"
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.name ? 'border-error ring-1 ring-error' : 'border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary'
                } bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors placeholder:text-secondary/50`}
              />
              {errors.name ? (
                <p className="mt-1.5 text-xs text-error font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {errors.name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-secondary">
                  Distinct branch identifier within {selectedRestaurant.name}. Must be unique per restaurant.
                </p>
              )}
            </div>

            {/* Branch Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-label-md text-label-md font-semibold text-on-surface">
                  Branch Code
                </label>
                <span className="text-[11px] text-secondary font-medium">Optional (Auto-generated)</span>
              </div>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="e.g. JHR-001"
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface font-numeric-table text-body-md uppercase transition-colors placeholder:text-secondary/50"
              />
              <p className="mt-1 text-xs text-secondary">
                Leave empty to automatically generate code based on branch name (e.g. JHR-001).
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Status <span className="text-error">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors cursor-pointer"
              >
                <option value="Active">Active — Operating and enabled for inventory</option>
                <option value="Inactive">Inactive — Suspended or not currently operating</option>
              </select>
              <p className="mt-1 text-xs text-secondary">
                Active branches can participate in inventory workflows and transactions.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT & ADDRESS */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[20px]">pin_drop</span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Contact & Address
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-label-md text-label-md font-semibold text-on-surface">
                  Phone
                </label>
                <span className="text-[11px] text-secondary font-medium">Optional</span>
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+92 42 35871234"
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors placeholder:text-secondary/50"
              />
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-label-md text-label-md font-semibold text-on-surface">
                  Email
                </label>
                <span className="text-[11px] text-secondary font-medium">Optional</span>
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="branch@restaurant.test"
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.email ? 'border-error ring-1 ring-error' : 'border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary'
                } bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors placeholder:text-secondary/50`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-error font-medium">{errors.email}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Address <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g. 14-B Commercial Zone, Main Boulevard, Johar Town"
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.address ? 'border-error ring-1 ring-error' : 'border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary'
                } bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors placeholder:text-secondary/50`}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-error font-medium">{errors.address}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                City <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g. Lahore"
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.city ? 'border-error ring-1 ring-error' : 'border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary'
                } bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors placeholder:text-secondary/50`}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-error font-medium">{errors.city}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
                Country <span className="text-error">*</span>
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${
                  errors.country ? 'border-error ring-1 ring-error' : 'border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary'
                } bg-surface-container-lowest text-on-surface font-body-md text-body-md transition-colors cursor-pointer`}
              >
                {COUNTRY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.country && (
                <p className="mt-1 text-xs text-error font-medium">{errors.country}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: REGIONAL SETTINGS */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/20 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">public</span>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Regional Settings
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/40">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Inherited from Restaurant
            </span>
          </div>

          <p className="text-xs text-secondary mb-4">
            Operating currency, timezone, and date presentation formatting are inherited automatically from <span className="font-semibold text-on-surface">{selectedRestaurant.name}</span> to preserve accounting consistency.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Currency */}
            <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
              <div className="text-xs text-secondary font-medium mb-1">
                Currency
              </div>
              <div className="text-sm font-bold font-numeric-table text-on-surface flex items-center justify-between">
                <span>{selectedRestaurant.currency || 'PKR'}</span>
                <span className="text-[11px] font-normal text-secondary font-body-md">Inherited</span>
              </div>
            </div>

            {/* Timezone */}
            <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
              <div className="text-xs text-secondary font-medium mb-1">
                Timezone
              </div>
              <div className="text-sm font-bold font-numeric-table text-on-surface flex items-center justify-between">
                <span>{selectedRestaurant.timezone || 'Asia/Karachi'}</span>
                <span className="text-[11px] font-normal text-secondary font-body-md">Inherited</span>
              </div>
            </div>

            {/* Date Format */}
            <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
              <div className="text-xs text-secondary font-medium mb-1">
                Date Format
              </div>
              <div className="text-sm font-bold font-numeric-table text-on-surface flex items-center justify-between">
                <span>{selectedRestaurant.dateFormat || 'DD MMM YYYY'}</span>
                <span className="text-[11px] font-normal text-secondary font-body-md">Inherited</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: INITIAL STORAGE LOCATIONS */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-outline-variant/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">shelves</span>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Initial Storage Locations
                </h2>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Configure rooms, cold storage units, and kitchen prep staging areas for this branch. At least 1 active location is required.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                enabledCount > 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-error-container text-error border-error/30'
              }`}>
                {enabledCount} active {enabledCount === 1 ? 'location' : 'locations'}
              </span>
              <button
                type="button"
                onClick={handleAddLocation}
                className="flex items-center gap-1 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-xs font-semibold cursor-pointer border border-outline-variant/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Location</span>
              </button>
            </div>
          </div>

          {errors.locations && (
            <div className="mb-4 p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
              <span className="material-symbols-outlined text-error text-[18px]">warning</span>
              <span>{errors.locations}</span>
            </div>
          )}

          {/* Locations Table / List */}
          <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">Enable</th>
                  <th className="py-2.5 px-3">Location Name</th>
                  <th className="py-2.5 px-3 w-48">Type</th>
                  <th className="py-2.5 px-3 w-28 text-center">Status</th>
                  <th className="py-2.5 px-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                {locations.map((loc, idx) => (
                  <tr
                    key={loc.id}
                    className={`transition-colors ${
                      loc.enabled ? 'hover:bg-surface-container-lowest' : 'bg-surface-container-low/40 opacity-70'
                    }`}
                  >
                    {/* Enable Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={loc.enabled}
                        onChange={() => handleToggleLocation(loc.id)}
                        className="rounded border-outline text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        title={loc.enabled ? 'Click to disable' : 'Click to enable'}
                      />
                    </td>

                    {/* Location Name */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={loc.name}
                        onChange={(e) => handleLocationNameChange(loc.id, e.target.value)}
                        disabled={!loc.enabled}
                        placeholder="e.g. Main Store"
                        className={`w-full px-3 py-1.5 rounded-lg border ${
                          !loc.name.trim() && loc.enabled
                            ? 'border-error ring-1 ring-error'
                            : 'border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary'
                        } bg-surface-container-lowest text-on-surface text-sm transition-colors disabled:bg-surface-container-low disabled:text-secondary`}
                      />
                    </td>

                    {/* Location Type */}
                    <td className="py-3 px-3">
                      <select
                        value={loc.type}
                        onChange={(e) => handleLocationTypeChange(loc.id, e.target.value)}
                        disabled={!loc.enabled}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm transition-colors disabled:bg-surface-container-low disabled:text-secondary cursor-pointer"
                      >
                        {STORAGE_LOCATION_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        loc.enabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-surface-container text-secondary border border-outline-variant/40'
                      }`}>
                        {loc.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      {locations.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(loc.id)}
                          className="text-secondary hover:text-error transition-colors p-1 rounded cursor-pointer"
                          title="Remove Location"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      ) : (
                        <span className="text-outline-variant text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-secondary">
            <span>Locations are created in shared platform storage under this restaurant and branch.</span>
            <span>Initial inventory quantities are not seeded during branch setup.</span>
          </div>
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Creating Branch...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_location</span>
                  <span>Create Branch</span>
                </>
              )}
            </button>
          </div>
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
              Discard new branch?
            </h3>
            <p className="font-body-md text-body-md text-secondary mb-6">
              You have unsaved changes. Leaving this screen will lose the entered branch information and configured storage locations.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container-low font-label-md text-xs font-semibold text-on-surface cursor-pointer transition-colors"
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
