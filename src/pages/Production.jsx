import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { exportToCsv } from '../utils/csv';

export default function Production({ onNavigate }) {
  const { currentBranch, productions, showToast, formatDate } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = productions.filter(p => {
    const matchesSearch = p.recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft':
        return { bg: 'bg-surface-container text-secondary', dot: 'bg-secondary' };
      case 'Scheduled':
        return { bg: 'bg-blue-100 text-blue-800', dot: 'bg-blue-600' };
      case 'In Progress':
        return { bg: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' };
      case 'Quality Review':
        return { bg: 'bg-purple-100 text-purple-800', dot: 'bg-purple-600' };
      case 'Completed':
      default:
        return { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600' };
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Batch ID',
      'Recipe Formula',
      'Branch',
      'Station',
      'Planned Quantity',
      'Actual Output',
      'Wastage Units',
      'Yield (%)',
      'Destination Location',
      'Status',
      'Prepared By',
      'Date'
    ];
    const rows = productions.map(p => [
      p.id,
      p.recipeName,
      p.branch || currentBranch,
      p.station || 'Fryer Station',
      p.plannedQuantity || p.batchSize || '',
      p.actualOutput || p.yieldPortions || '',
      p.productionWastage || 0,
      p.yieldPct ? `${p.yieldPct}%` : '',
      p.location || '',
      p.status,
      p.producedBy || '',
      p.date ? formatDate(p.date) : (p.displayDate || '')
    ]);
    exportToCsv('production.csv', headers, rows);
    showToast('Production log exported to production.csv', 'success');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Production</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
            Kitchen Production
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Log prep batches, bulk marinades, sauces, and dough production in {currentBranch}.
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
            onClick={() => onNavigate('record-production')}
            className="flex items-center gap-space-xs px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm transition-all font-label-md font-medium cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">skillet</span>
            <span>Record Production</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-gutter mb-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Total Batches</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1 font-numeric-table">
            {productions.length}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">All kitchen runs</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">In Progress</span>
          <span className="font-headline-xl font-bold text-amber-700 mt-1 font-numeric-table">
            {productions.filter(p => p.status === 'In Progress').length}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Active kitchen batching</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Completed</span>
          <span className="font-headline-xl font-bold text-tertiary-container mt-1 font-numeric-table">
            {productions.filter(p => p.status === 'Completed').length}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Finalized batches</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Shift Supervisor</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1">Ahmed Raza</span>
          <span className="text-xs text-on-surface-variant mt-2">Operations Lead</span>
        </div>
      </div>

      {/* PRODUCTION TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-space-md border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-3">
            <h2 className="font-headline-md font-semibold text-on-surface">Batch Log</h2>
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {['All', 'Draft', 'Scheduled', 'In Progress', 'Quality Review', 'Completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === st ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-48 sm:w-60">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search batch..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-on-surface text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Batch ID</th>
                <th className="py-3 px-4 font-semibold">Recipe Formula</th>
                <th className="py-3 px-4 font-semibold text-right">Planned Goal</th>
                <th className="py-3 px-4 font-semibold text-right">Yield Portions</th>
                <th className="py-3 px-4 font-semibold">Storage Destination</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold">Prepared By</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm">
              {filtered.map(prd => {
                const badge = getStatusBadge(prd.status);
                return (
                  <tr key={prd.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-primary">{prd.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      {prd.recipeName}
                      <span className="block text-xs font-normal text-on-surface-variant">{formatDate(prd.date || prd.displayDate)}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric-table font-semibold text-on-surface">
                      {prd.plannedQuantity ? `${prd.plannedQuantity} pcs` : prd.batchSize}
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric-table text-on-surface font-medium">
                      {prd.actualOutput ? `${prd.actualOutput} pcs` : prd.yieldPortions}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{prd.location}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {prd.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{prd.producedBy}</td>
                    <td className="py-3.5 px-4 text-right">
                      {prd.status === 'In Progress' ? (
                        <button
                          type="button"
                          onClick={() => onNavigate('record-production')}
                          className="px-3 py-1 rounded bg-primary text-on-primary text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          Finalize
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant">Reconciled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
