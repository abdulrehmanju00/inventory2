import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/AppStore';
import { INITIAL_SETTINGS } from '../data/mockData';

export default function Settings({ onNavigate }) {
  const { currentBranch, settings, setSettings, resetToCanonicalState, showToast } = useAppStore();

  const [form, setForm] = useState({ ...settings });

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(form);
    showToast('Branch settings saved successfully', 'success');
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col pb-16">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">System</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Settings</span>
      </div>

      {/* HEADER */}
      <div className="mb-space-lg">
        <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
          Branch Settings
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Configure operations parameters, local currency, inventory thresholds, and notifications for {currentBranch}.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: BRANCH PROFILE */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
          <h2 className="font-headline-md font-semibold text-on-surface pb-2 border-b border-outline-variant/20">
            Branch Profile & Localization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Branch Designation</label>
              <input
                type="text"
                value={form.branchName}
                onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Accounting Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Regional Timezone</label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (AST, UTC+3)</option>
                <option value="Europe/London">Europe/London (GMT/BST, UTC+0/+1)</option>
                <option value="America/New_York">America/New_York (EST/EDT, UTC-5/-4)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Date Display Format</label>
              <select
                value={form.dateFormat}
                onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="DD MMM YYYY">DD MMM YYYY (e.g. 28 Sep 2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/28/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-28)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Recipe Cost Precision</label>
              <select
                value={form.recipeCostPrecision || '2 decimals'}
                onChange={(e) => setForm({ ...form, recipeCostPrecision: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="2 decimals">2 decimals (Standard, e.g. 289.90)</option>
                <option value="3 decimals">3 decimals (High precision, e.g. 289.900)</option>
                <option value="4 decimals">4 decimals (Strict portioning, e.g. 289.9000)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Purchase Variance Threshold</label>
              <select
                value={form.purchaseVarianceThreshold || '5%'}
                onChange={(e) => setForm({ ...form, purchaseVarianceThreshold: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="2%">2% (Strict receiving)</option>
                <option value="5%">5% (Standard variance)</option>
                <option value="10%">10% (Flexible threshold)</option>
              </select>
              <p className="text-xs text-on-surface-variant">
                Reserved for future purchase variance validation. This setting is not enforced in the current frontend prototype.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: INVENTORY THRESHOLDS & ALERTS */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
          <h2 className="font-headline-md font-semibold text-on-surface pb-2 border-b border-outline-variant/20">
            Inventory Automation & Alerts
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low cursor-pointer">
              <input
                type="checkbox"
                checked={form.emailNotifications}
                onChange={(e) => setForm({ ...form, emailNotifications: e.target.checked })}
                className="mt-1 text-primary focus:ring-0 rounded"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-body-md text-on-surface">Critical Stock Alerts</span>
                <span className="text-xs text-on-surface-variant">
                  Notify Operations Lead (Ahmed Raza) when items fall below 50% of minimum threshold.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoReorderSuggestions}
                onChange={(e) => setForm({ ...form, autoReorderSuggestions: e.target.checked })}
                className="mt-1 text-primary focus:ring-0 rounded"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-body-md text-on-surface">Auto-Suggest Purchase Orders</span>
                <span className="text-xs text-on-surface-variant">
                  Generate draft POs automatically when stock levels hit reorder flag.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 3: SYSTEM DATA & EXPORT */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
          <h2 className="font-headline-md font-semibold text-on-surface pb-2 border-b border-outline-variant/20">
            Data Management & Export
          </h2>

          <p className="text-body-sm text-on-surface-variant">
            Export current operational settings and configurations as a backup, or restore system defaults.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const settingsJson = JSON.stringify(form, null, 2);
                const blob = new Blob([settingsJson], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `system_settings_${form.branchName.replace(/\s+/g, '_')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Settings configuration exported', 'success');
              }}
              className="h-9 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md transition-colors border border-outline-variant/40 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Settings JSON
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset prototype state to canonical starting data?')) {
                  resetToCanonicalState();
                  setForm({ ...INITIAL_SETTINGS });
                }
              }}
              className="h-9 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md transition-colors border border-outline-variant/40 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              Reset Defaults
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
