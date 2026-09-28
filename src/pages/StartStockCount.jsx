import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';

export default function StartStockCount({ onNavigate }) {
  const { currentBranch, currentUser, ingredients, startStockCount } = useAppStore();

  const [location, setLocation] = useState('Walk-in Cooler');
  const [countScope, setCountScope] = useState('full');
  const [notes, setNotes] = useState('');

  const itemsInLocation = ingredients.filter(i => location === 'All' || i.location === location);

  const handleSubmit = (e) => {
    e.preventDefault();
    startStockCount({
      location,
      scope: countScope === 'full' ? `All active items (${location})` : 'Critical & High-Value Only',
      countScope,
      notes
    });
    onNavigate('stock-count-detail');
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col pb-16">
      {/* BREADCRUMBS */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('stock-counts')} className="hover:text-on-surface transition-colors cursor-pointer">Stock Counts</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Start New Count</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="mb-space-lg">
        <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
          Start Stock Count
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Initiate a physical count session for {currentBranch} inventory verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-6">
          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="count-location">
              Select Storage Location <span className="text-error">*</span>
            </label>
            <select
              id="count-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="Walk-in Cooler">Walk-in Cooler ({ingredients.filter(i => i.location === 'Walk-in Cooler').length} items)</option>
              <option value="Main Store">Main Store ({ingredients.filter(i => i.location === 'Main Store').length} items)</option>
              <option value="Dry Store">Dry Store ({ingredients.filter(i => i.location === 'Dry Store').length} items)</option>
              <option value="Kitchen Prep">Kitchen Prep ({ingredients.filter(i => i.location === 'Kitchen Prep').length} items)</option>
              <option value="All">All Locations ({ingredients.length} items)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">Count Scope</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-4 rounded-xl border flex flex-col gap-1 cursor-pointer transition-colors ${
                countScope === 'full' ? 'border-primary bg-primary/5' : 'border-outline-variant/40 bg-surface-container-lowest'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Complete Location Count</span>
                  <input
                    type="radio"
                    name="scope"
                    value="full"
                    checked={countScope === 'full'}
                    onChange={() => setCountScope('full')}
                    className="text-primary focus:ring-0"
                  />
                </div>
                <span className="text-body-sm text-on-surface-variant">
                  Audit all {itemsInLocation.length} active items mapped to {location}.
                </span>
              </label>

              <label className={`p-4 rounded-xl border flex flex-col gap-1 cursor-pointer transition-colors ${
                countScope === 'high_value' ? 'border-primary bg-primary/5' : 'border-outline-variant/40 bg-surface-container-lowest'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Critical & High-Value Only</span>
                  <input
                    type="radio"
                    name="scope"
                    value="high_value"
                    checked={countScope === 'high_value'}
                    onChange={() => setCountScope('high_value')}
                    className="text-primary focus:ring-0"
                  />
                </div>
                <span className="text-body-sm text-on-surface-variant">
                  Fast count cycle for high-shrink proteins and dairy items.
                </span>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface font-label-md">
                {currentUser.initials}
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">Counted By</span>
                <span className="text-body-sm text-on-surface-variant">{currentUser.name} ({currentUser.role})</span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/30 font-medium">
              Verified Session
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="count-notes">
              Session Objective / Notes (Optional)
            </label>
            <textarea
              id="count-notes"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Weekly routine audit prior to Sunday night kitchen orders."
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('stock-counts')}
            className="h-10 px-5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Start Stock Count
          </button>
        </div>
      </form>
    </div>
  );
}
