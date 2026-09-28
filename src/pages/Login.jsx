import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';

export default function Login({ onNavigate }) {
  const { login } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotNote, setShowForgotNote] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setShowForgotNote(false);

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      setErrorMsg('Email Address is required.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg('Password is required.');
      return;
    }

    setIsSubmitting(true);

    // Frontend-only prototype login
    const result = login(trimmedEmail, trimmedPass, rememberMe);

    if (!result.success) {
      setErrorMsg(result.error || 'Invalid email or password.');
      setIsSubmitting(false);
      return;
    }

    // Route based on accountType
    if (result.user.accountType === 'restaurant_user') {
      onNavigate('dashboard');
    } else if (result.user.accountType === 'platform_admin') {
      onNavigate('super-admin');
    } else {
      onNavigate('dashboard');
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
    setShowForgotNote(false);
  };

  return (
    <div className="min-h-screen w-full bg-surface flex flex-col lg:flex-row antialiased">
      {/* LEFT SIDE: Brand / Platform Introduction (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-[#004f49] to-[#013531] text-on-primary p-12 lg:p-16 flex-col justify-between relative overflow-hidden select-none">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-primary-fixed-dim/10 blur-3xl pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[26px]">restaurant</span>
          </div>
          <div>
            <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-white block leading-tight">
              Restaurant Inventory & Operations
            </span>
            <span className="text-xs uppercase tracking-widest text-primary-fixed font-semibold">
              Management Platform
            </span>
          </div>
        </div>

        {/* Center Copy */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <h1 className="font-display-lg text-display-lg font-bold text-white tracking-tight leading-tight mb-4">
            Manage inventory, purchasing, production and restaurant operations from one workspace.
          </h1>
          <p className="font-body-lg text-body-lg text-white/80 leading-relaxed mb-8">
            Secure access for restaurant owners, managers and operations teams.
          </p>

          {/* Operational Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-primary-fixed mt-0.5">inventory_2</span>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Multi-Location Stock</h4>
                <p className="text-xs text-white/70">Main Store, Walk-in Cooler & Kitchen Prep</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-primary-fixed mt-0.5">receipt_long</span>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Kitchen Production</h4>
                <p className="text-xs text-white/70">Recipe scaling, yield & ingredient deduction</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-primary-fixed mt-0.5">local_shipping</span>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Purchasing & Receiving</h4>
                <p className="text-xs text-white/70">Direct supplier POs and multi-location check-in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-primary-fixed mt-0.5">fact_check</span>
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Audits & Wastage</h4>
                <p className="text-xs text-white/70">Blind stock counts and variance reconciliation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 text-xs text-white/60">
          Restaurant Inventory & Operations Platform • Multi-branch enterprise ready
        </div>
      </div>

      {/* RIGHT SIDE: Login Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-surface min-h-screen">
        {/* Mobile Header Banner */}
        <div className="lg:hidden w-full max-w-md mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="material-symbols-outlined text-[28px]">restaurant</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">
            Restaurant Inventory & Operations
          </h1>
          <p className="text-body-sm text-secondary mt-1 max-w-sm mx-auto">
            Manage inventory, purchasing, production and restaurant operations from one workspace.
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">
            Secure access for restaurant owners, managers and operations teams.
          </p>
        </div>

        {/* Main Login Card */}
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm p-8 sm:p-10">
          <div className="mb-6">
            <h2 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">
              Welcome Back
            </h2>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Sign in to continue to your restaurant workspace.
            </p>
          </div>

          {/* Inline Error Message */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm font-medium flex items-center gap-2.5 border border-error/20"
            >
              <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
              <span className="flex-1">{errorMsg}</span>
            </div>
          )}

          {/* Inline Forgot Password Note */}
          {showForgotNote && (
            <div
              role="status"
              className="mb-5 p-3 rounded-lg bg-surface-container-high text-on-surface text-xs flex items-start gap-2 border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">info</span>
              <span className="flex-1">
                Password recovery is managed by your organization lead. Please contact your restaurant administrator or supervisor to reset credentials.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-on-surface"
              >
                Email Address <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                  mail
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="name@restaurant.test"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-on-surface"
                >
                  Password <span className="text-error">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNote(prev => !prev)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-10 pr-11 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs text-on-surface-variant font-medium">Remember me</span>
              </label>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-2 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Secondary / Supporting Text */}
          <div className="mt-6 pt-5 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant">
            <span>Need access? </span>
            <span className="text-on-surface font-medium">Contact your restaurant administrator.</span>
          </div>

          {/* Prototype Demo User Quick-Fill (Fast Testing) */}
          <div className="mt-6 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
              Prototype Demo Profiles
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoFill('operations@restaurant.test', 'operations123')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/20 transition-colors flex items-center justify-between group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface group-hover:text-primary">
                    Ahmed Raza · Operations Lead
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    operations@restaurant.test
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  Restaurant
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('owner@restaurant.test', 'owner123')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/20 transition-colors flex items-center justify-between group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface group-hover:text-primary">
                    Ahmed Raza · Restaurant Owner
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    owner@restaurant.test
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  Owner
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('admin@platform.test', 'admin123')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/20 transition-colors flex items-center justify-between group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface group-hover:text-primary">
                    Platform Admin · Super Admin
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    admin@platform.test
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-fixed">
                  Platform
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
