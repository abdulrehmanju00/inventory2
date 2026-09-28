import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { exportToCsv } from '../utils/csv';

export default function Wastage({ onNavigate }) {
  const { currentBranch, wastage, setSelectedWastageId, formatCurrency, formatDate, settings, showToast } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');

  const totalCost = wastage.reduce((sum, w) => sum + (Number(w.cost) || 0), 0);

  const filteredWastage = wastage.filter(w => {
    const matchesSearch = w.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = reasonFilter === 'All' || w.reason.toLowerCase().includes(reasonFilter.toLowerCase());
    return matchesSearch && matchesReason;
  });

  const handleExportCSV = () => {
    const headers = [
      'Wastage ID',
      'Date',
      'Ingredient Name',
      'Quantity',
      'Unit',
      `Cost (${settings?.currency || 'PKR'})`,
      'Storage Location',
      'Category',
      'Reason',
      'Recorded By',
      'Notes'
    ];
    const rows = wastage.map(w => [
      w.id,
      w.date ? formatDate(w.date) : (w.displayDate || ''),
      w.ingredientName,
      w.quantity,
      w.unit,
      w.cost,
      w.location,
      w.category,
      w.reason,
      w.recordedBy,
      w.notes || ''
    ]);
    exportToCsv('wastage.csv', headers, rows);
    showToast('Wastage log exported to wastage.csv', 'success');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Wastage</span>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
            Wastage Overview
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Track spoiled, damaged, expired, and discarded stock across {currentBranch}.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-space-xs px-space-md py-2 bg-surface-container-lowest text-on-surface rounded-lg shadow-sm border border-outline-variant/40 hover:bg-surface-container-low transition-all font-label-md cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onNavigate('new-wastage')}
            className="flex items-center gap-space-xs px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm transition-all font-label-md font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            <span>Record Wastage</span>
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Total Wastage Cost</span>
          <span className="font-headline-xl font-bold text-error tracking-tight mt-1 font-numeric-table">
            {formatCurrency(totalCost)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Recorded incidents: {wastage.length}</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Primary Waste Factor</span>
          <span className="font-headline-xl font-bold text-on-surface tracking-tight mt-1">
            Shelf-life Expiry
          </span>
          <span className="text-xs text-on-surface-variant mt-2">48% of total losses</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Reporting Staff Lead</span>
          <span className="font-headline-xl font-bold text-on-surface tracking-tight mt-1">
            Ahmed Raza
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Operations Lead verified</span>
        </div>
      </div>

      {/* WASTAGE LOGS TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-space-md border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md font-semibold text-on-surface">Wastage Log</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant">
              {filteredWastage.length} entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search incident..."
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-on-surface text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="h-8 px-2 rounded-lg bg-surface-container-low text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="All">All Reasons</option>
              <option value="burn">Cooking burn</option>
              <option value="expired">Expired</option>
              <option value="spoiled">Spoiled</option>
              <option value="curdled">Curdled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Incident ID</th>
                <th className="py-3 px-4 font-semibold">Date & Time</th>
                <th className="py-3 px-4 font-semibold">Ingredient</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                <th className="py-3 px-4 font-semibold">Reason / Cause</th>
                <th className="py-3 px-4 font-semibold text-right">Financial Loss</th>
                <th className="py-3 px-4 font-semibold">Recorded By</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm">
              {filteredWastage.map(w => (
                <tr
                  key={w.id}
                  onClick={() => { setSelectedWastageId(w.id); onNavigate('wastage-detail'); }}
                  className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-primary">{w.id}</td>
                  <td className="py-3 px-4 text-on-surface-variant text-xs">{formatDate(w.date || w.displayDate)}</td>
                  <td className="py-3 px-4 font-semibold text-on-surface">
                    {w.ingredientName}
                    <span className="block text-xs font-normal text-on-surface-variant">{w.location}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-numeric-table font-semibold text-error">
                    {w.quantity} {w.unit}
                  </td>
                  <td className="py-3 px-4 text-on-surface">{w.reason}</td>
                  <td className="py-3 px-4 text-right font-numeric-table font-bold text-error">
                    {formatCurrency(w.cost)}
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">{w.recordedBy}</td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setSelectedWastageId(w.id); onNavigate('wastage-detail'); }}
                      className="px-2.5 py-1 text-xs rounded bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
