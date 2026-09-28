import React from 'react';
import { useAppStore } from '../store/AppStore';

export default function WastageDetail({ onNavigate }) {
  const { wastage, selectedWastageId, showToast, currentBranch, formatCurrency, formatDate } = useAppStore();

  const record = wastage.find(w => w.id === selectedWastageId) || wastage[0] || {
    id: "WST-2041",
    ingredientName: "Cooking Oil",
    quantity: 2,
    unit: "L",
    reason: "Deep frying burn / overheated",
    category: "Dry Goods",
    cost: 820,
    location: "Kitchen Prep",
    recordedBy: "Ahmed Raza",
    displayDate: "Today, 11:30 AM",
    notes: "Oil temperature sensor malfunctioned causing scorch."
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('wastage')} className="hover:text-on-surface transition-colors cursor-pointer">Wastage</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">{record.id}</span>
      </nav>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface">
              {record.id} · {record.ingredientName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container">
              Logged & Reconciled
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Recorded by {record.recordedBy} · {formatDate(record.date || record.displayDate)}
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => showToast('Printing wastage slip...', 'success')}
            className="h-9 px-4 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors font-label-md flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print Slip</span>
          </button>
          <button
            onClick={() => onNavigate('wastage')}
            className="h-9 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors"
            type="button"
          >
            Back to Log
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Discarded Amount</span>
          <span className="font-headline-xl font-bold text-error mt-1 font-numeric-table">
            {record.quantity} {record.unit}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">{record.category}</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Financial Loss</span>
          <span className="font-headline-xl font-bold text-error mt-1 font-numeric-table">
            {formatCurrency(record.cost)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Inventory deduction applied</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Location Area</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1">
            {record.location}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Station log</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Authorized By</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1">
            {record.recordedBy}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Operations Lead</span>
        </div>
      </div>

      {/* DETAIL SPEC CARD */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 space-y-4">
        <h3 className="font-headline-md font-semibold text-on-surface">Incident Description & Root Cause</h3>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <p className="text-body-md text-on-surface font-semibold mb-1">
            Reported Reason: <span className="text-error">{record.reason}</span>
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {record.notes || 'Routine kitchen discard during prep operations.'}
          </p>
        </div>

        <div className="pt-2 text-xs text-on-surface-variant flex items-center justify-between border-t border-outline-variant/20">
          <span>Audit record verified for {currentBranch}</span>
          <span>Logged into permanent ERP journal</span>
        </div>
      </div>
    </div>
  );
}
