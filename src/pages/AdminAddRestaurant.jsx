import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';

const CURRENCY_OPTIONS = [
  { code: 'PKR', label: 'PKR — Pakistani Rupee (Rs)' },
  { code: 'USD', label: 'USD — US Dollar ($)' },
  { code: 'AED', label: 'AED — UAE Dirham (د.إ)' },
  { code: 'GBP', label: 'GBP — British Pound (£)' },
  { code: 'EUR', label: 'EUR — Euro (€)' }
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT, UTC+5)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST, UTC+3)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+0/+1)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT, UTC-5/-4)' }
];

const DATE_FORMAT_OPTIONS = [
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g. 28 Sep 2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-09-28)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 09/28/2026)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 28/09/2026)' }
];

const COUNTRY_OPTIONS = [
  'Pakistan',
  'United Arab Emirates',
  'Saudi Arabia',
  'United Kingdom',
  'United States',
  'Other'
];

export default function AdminAddRestaurant({ onNavigate }) {
  const { createPlatformRestaurant } = useAppStore();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Pakistan',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    dateFormat: 'DD MMM YYYY',
    status: 'Trial',
    plan: 'Trial',
    initialBranchName: 'Main Branch'
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Track if user modified any field
  const isDirty = Boolean(
    formData.name.trim() ||
    formData.ownerName.trim() ||
    formData.ownerEmail.trim() ||
    formData.code.trim() ||
    formData.phone.trim() ||
    formData.address.trim() ||
    formData.city.trim() ||
    logoPreview
  );

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

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Logo image must be smaller than 2MB.' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        // Session-only display preview (not persisted to localStorage)
        setLogoPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant Name is required.';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner Full Name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Owner Email is required.';
    } else if (!emailRegex.test(formData.ownerEmail.trim())) {
      newErrors.ownerEmail = 'Please enter a valid owner email address.';
    }

    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid restaurant email address.';
    }

    if (!formData.initialBranchName.trim()) {
      newErrors.initialBranchName = 'Initial Branch Name is required.';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required.';
    }

    if (!formData.currency) {
      newErrors.currency = 'Currency is required.';
    }

    if (!formData.timezone) {
      newErrors.timezone = 'Timezone is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      // Scroll to top of form smoothly on error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = createPlatformRestaurant(
        {
          name: formData.name,
          legalName: formData.legalName,
          code: formData.code,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          ownerPhone: formData.ownerPhone,
          currency: formData.currency,
          timezone: formData.timezone,
          dateFormat: formData.dateFormat,
          status: formData.status,
          plan: formData.plan
        },
        formData.initialBranchName
      );

      if (!result.success) {
        setSubmitError(result.error || 'Failed to create restaurant.');
        setIsSubmitting(false);
        return;
      }

      // Successful creation -> navigate to setup wizard placeholder
      onNavigate('admin-restaurant-setup');
    } catch (err) {
      console.error('[Add Restaurant] Error creating restaurant', err);
      setSubmitError('An unexpected error occurred while creating the restaurant record.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onNavigate('admin-restaurants');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col pb-16 antialiased">
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
        <span className="text-on-surface font-semibold">Add Restaurant</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface">
            Add Restaurant
          </h1>
          <p className="font-body-md text-body-md text-secondary mt-1">
            Create a restaurant workspace and enter the information required to begin setup.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">add_business</span>
                <span>Create Restaurant</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* GLOBAL ERROR BANNER */}
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-error-container/60 border border-error/30 text-on-error-container flex items-start gap-3 animate-in fade-in">
          <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
          <div className="text-body-sm text-sm">
            <span className="font-semibold block mb-0.5">Unable to Create Restaurant</span>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {/* FORM CONTAINER */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: RESTAURANT INFORMATION */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-outline-variant/20">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
            </div>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                1. Restaurant Information
              </h2>
              <p className="text-xs text-on-surface-variant">
                Core identity and contact details for the restaurant workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Restaurant Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Restaurant Name <span className="text-error">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Coco Cubano"
                className={`w-full h-10 px-3 rounded-lg border bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:ring-1 transition-all ${
                  errors.name
                    ? 'border-error focus:border-error focus:ring-error'
                    : 'border-outline-variant/50 focus:border-primary focus:ring-primary'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-error mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Legal / Business Name */}
            <div>
              <label htmlFor="legalName" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Legal / Business Name
              </label>
              <input
                id="legalName"
                type="text"
                value={formData.legalName}
                onChange={(e) => handleChange('legalName', e.target.value)}
                placeholder="e.g. Coco Cubano (Pvt.) Ltd."
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Restaurant Code */}
            <div>
              <label htmlFor="code" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Restaurant Code
              </label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="Optional (auto-generated if empty)"
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-mono text-sm uppercase focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <span className="text-[11px] text-on-surface-variant mt-1 block">
                Short code prefix for invoices and purchase orders.
              </span>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@cococubano.test"
                className={`w-full h-10 px-3 rounded-lg border bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:ring-1 transition-all ${
                  errors.email
                    ? 'border-error focus:border-error focus:ring-error'
                    : 'border-outline-variant/50 focus:border-primary focus:ring-primary'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-error mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Address
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="14-C, Main Boulevard, Gulberg III"
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Lahore"
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Country <span className="text-error">*</span>
              </label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Logo Upload Preview */}
            <div className="sm:col-span-2 pt-2">
              <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Restaurant Logo (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-low flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[24px]">image</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="logo-upload"
                      className="px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low text-xs font-semibold text-on-surface transition-colors cursor-pointer"
                    >
                      Choose File
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-error hover:bg-error-container/30 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    PNG, JPG, or SVG up to 2MB. Browser preview only.
                  </span>
                </div>
              </div>
              {errors.logo && (
                <p className="text-xs text-error mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>{errors.logo}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: OWNER INFORMATION */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-outline-variant/20">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                2. Owner Information
              </h2>
              <p className="text-xs text-on-surface-variant">
                Primary authorized administrator and executive contact for the restaurant.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Owner Full Name */}
            <div>
              <label htmlFor="ownerName" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Owner Full Name <span className="text-error">*</span>
              </label>
              <input
                id="ownerName"
                type="text"
                value={formData.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                placeholder="e.g. Usman Khan"
                className={`w-full h-10 px-3 rounded-lg border bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:ring-1 transition-all ${
                  errors.ownerName
                    ? 'border-error focus:border-error focus:ring-error'
                    : 'border-outline-variant/50 focus:border-primary focus:ring-primary'
                }`}
              />
              {errors.ownerName && (
                <p className="text-xs text-error mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>{errors.ownerName}</span>
                </p>
              )}
            </div>

            {/* Owner Email */}
            <div>
              <label htmlFor="ownerEmail" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Owner Email <span className="text-error">*</span>
              </label>
              <input
                id="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => handleChange('ownerEmail', e.target.value)}
                placeholder="owner@cococubano.test"
                className={`w-full h-10 px-3 rounded-lg border bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:ring-1 transition-all ${
                  errors.ownerEmail
                    ? 'border-error focus:border-error focus:ring-error'
                    : 'border-outline-variant/50 focus:border-primary focus:ring-primary'
                }`}
              />
              {errors.ownerEmail && (
                <p className="text-xs text-error mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  <span>{errors.ownerEmail}</span>
                </p>
              )}
            </div>

            {/* Owner Phone */}
            <div className="sm:col-span-2">
              <label htmlFor="ownerPhone" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Owner Phone
              </label>
              <input
                id="ownerPhone"
                type="tel"
                value={formData.ownerPhone}
                onChange={(e) => handleChange('ownerPhone', e.target.value)}
                placeholder="+92 300 7654321"
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Helper note */}
          <div className="mt-4 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              The owner account will be created during the user onboarding stage. No invitation is sent in this frontend prototype.
            </p>
          </div>
        </div>

        {/* SECTION 3: REGIONAL SETTINGS */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-outline-variant/20">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">public</span>
            </div>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                3. Regional Settings
              </h2>
              <p className="text-xs text-on-surface-variant">
                Currency, time zone, and date conventions applied to ledger balances and reports.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Currency <span className="text-error">*</span>
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label htmlFor="timezone" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Timezone <span className="text-error">*</span>
              </label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label htmlFor="dateFormat" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                Date Format <span className="text-error">*</span>
              </label>
              <select
                id="dateFormat"
                value={formData.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {DATE_FORMAT_OPTIONS.map((df) => (
                  <option key={df.value} value={df.value}>
                    {df.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: ACCOUNT SETUP & INITIAL BRANCH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Setup */}
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-outline-variant/20">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <h2 className="font-headline-md text-base font-bold text-on-surface">
                  4. Account Setup
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Initial access tier and subscription profile.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Account Status */}
              <div>
                <label htmlFor="status" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  Account Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="Trial">Trial (14-day evaluation access)</option>
                  <option value="Active">Active (Full platform tenant)</option>
                </select>
              </div>

              {/* Plan */}
              <div>
                <label htmlFor="plan" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  Plan Tier
                </label>
                <select
                  id="plan"
                  value={formData.plan}
                  onChange={(e) => handleChange('plan', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="Trial">Trial</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              {/* Setup Status (Read-only badge) */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  Initial Setup Status
                </label>
                <div className="h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-[16px]">radio_button_unchecked</span>
                  <span className="text-xs font-semibold text-on-surface">Not Started</span>
                  <span className="text-[11px] text-on-surface-variant ml-auto">Begins during wizard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Initial Branch */}
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-outline-variant/20">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  <span className="material-symbols-outlined text-[18px]">domain</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-base font-bold text-on-surface">
                    Initial Branch
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Primary operational location for this restaurant.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="initialBranchName" className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1.5">
                  Branch Name <span className="text-error">*</span>
                </label>
                <input
                  id="initialBranchName"
                  type="text"
                  value={formData.initialBranchName}
                  onChange={(e) => handleChange('initialBranchName', e.target.value)}
                  placeholder="e.g. Main Branch"
                  className={`w-full h-10 px-3 rounded-lg border bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-sm text-sm focus:outline-none focus:ring-1 transition-all ${
                    errors.initialBranchName
                      ? 'border-error focus:border-error focus:ring-error'
                      : 'border-outline-variant/50 focus:border-primary focus:ring-primary'
                  }`}
                />
                {errors.initialBranchName && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{errors.initialBranchName}</span>
                  </p>
                )}
                <span className="text-xs text-on-surface-variant mt-2 block leading-relaxed">
                  You can configure additional branch details during restaurant setup.
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-outline text-[16px]">pin_drop</span>
              <span>Default location registered upon creation</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant">
            Fields marked with <span className="text-error">*</span> are required to create the restaurant workspace.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none h-10 px-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">add_business</span>
                  <span>Create Restaurant</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* DISCARD CHANGES CONFIRMATION MODAL */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">
                  Discard restaurant setup?
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Unsaved restaurant details will be lost.
                </p>
              </div>
            </div>

            <p className="text-body-sm text-secondary mb-6 leading-relaxed">
              You have entered restaurant information that has not yet been saved. Are you sure you want to discard your changes and return to the restaurants directory?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="h-10 px-4 rounded-lg border border-outline-variant/50 hover:bg-surface-container-low text-on-surface font-label-md text-xs font-semibold transition-colors cursor-pointer"
              >
                Keep Editing
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  onNavigate('admin-restaurants');
                }}
                className="h-10 px-5 rounded-lg bg-error hover:bg-error/90 text-white font-label-md text-xs font-semibold transition-colors cursor-pointer shadow-sm"
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
