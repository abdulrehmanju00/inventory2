import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { exportToCsv } from '../utils/csv';

export default function Transfers({ onNavigate }) {
  const { currentBranch, transfers, setSelectedTransferId, showToast, formatDate } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransfers = transfers.filter(t =>
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = [
      'Transfer ID',
      'Date',
      'From Location',
      'To Location',
      'Item Count',
      'Items',
      'Status',
      'Requested By',
      'Notes'
    ];
    const rows = transfers.map(t => [
      t.id,
      t.date ? formatDate(t.date) : (t.displayDate || ''),
      t.fromLocation,
      t.toLocation,
      t.itemCount || (t.items ? t.items.length : 0),
      (t.items || []).map(i => `${i.name} (${i.qty})`).join('; '),
      t.status,
      t.requestedBy || '',
      t.notes || ''
    ]);
    exportToCsv('transfers.csv', headers, rows);
    showToast('Transfers log exported to transfers.csv', 'success');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Transfers</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
            Transfers Overview
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Manage internal stock movements between storage areas in {currentBranch}.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-space-xs px-space-md py-2 bg-surface-container-lowest text-on-surface rounded-lg shadow-sm border border-outline-variant/40 hover:bg-surface-container-low transition-all font-label-md cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            <span>Export</span>
          </button>
          <button
            onClick={() => onNavigate('new-transfer')}
            className="flex items-center gap-space-xs px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm transition-all font-label-md font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Active In Transit</span>
          <span className="font-headline-xl font-bold text-amber-700 mt-1 font-numeric-table">
            {transfers.filter(t => t.status === 'In Transit').length}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Awaiting station acceptance</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Completed Transfers</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1 font-numeric-table">
            {transfers.filter(t => t.status === 'Completed').length}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Internal station fulfillment</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Primary Origin</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1">Main Store</span>
          <span className="text-xs text-on-surface-variant mt-2">Central distribution hub</span>
        </div>
      </div>

      {/* TRANSFERS TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-space-md border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <h2 className="font-headline-md font-semibold text-on-surface">Transfer Movements</h2>
          <div className="relative w-48 sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transfer..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-on-surface text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Transfer ID</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">From Origin</th>
                <th className="py-3 px-4 font-semibold">To Destination</th>
                <th className="py-3 px-4 font-semibold text-center">Items</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold">Requested By</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm">
              {filteredTransfers.map(trf => (
                <tr
                  key={trf.id}
                  onClick={() => { setSelectedTransferId(trf.id); onNavigate('transfer-detail'); }}
                  className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-primary">{trf.id}</td>
                  <td className="py-3 px-4 text-on-surface-variant text-xs">{formatDate(trf.date || trf.displayDate)}</td>
                  <td className="py-3 px-4 font-medium text-on-surface">{trf.fromLocation}</td>
                  <td className="py-3 px-4 font-medium text-on-surface">{trf.toLocation}</td>
                  <td className="py-3 px-4 text-center font-numeric-table font-semibold">{trf.itemCount} items</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      trf.status === 'In Transit' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${trf.status === 'In Transit' ? 'bg-amber-500' : 'bg-emerald-600'}`}></span>
                      {trf.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">{trf.requestedBy}</td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setSelectedTransferId(trf.id); onNavigate('transfer-detail'); }}
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
