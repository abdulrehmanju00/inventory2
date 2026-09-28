import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { exportToCsv } from '../utils/csv';

export default function StockCounts({ onNavigate }) {
  const { stockCounts, setSelectedStockCountId, showToast, currentBranch, formatDate } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  const openCounts = stockCounts.filter(c => c.status === 'In Progress');
  const activeOpenCount = openCounts[0];

  const filteredCounts = stockCounts.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesLoc = locationFilter === 'All' || c.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLoc;
  });

  const handleExportCSV = () => {
    const headers = [
      'Count ID',
      'Date',
      'Location',
      'Scope',
      'Total Items',
      'Counted Items',
      'Differences',
      'Progress (%)',
      'Status',
      'Counted By',
      'Notes'
    ];
    const rows = stockCounts.map(c => [
      c.id,
      c.date ? formatDate(c.date) : (c.displayDate || ''),
      c.location,
      c.scope || '',
      c.totalItemsCount || (c.items ? c.items.length : 0),
      c.countedItemsCount || 0,
      c.differencesCount || 0,
      c.progress || 0,
      c.status,
      c.countedBy || '',
      c.notes || ''
    ]);
    exportToCsv('stock-counts.csv', headers, rows);
    showToast('Stock counts exported to stock-counts.csv', 'success');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMBS */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Stock Counts</span>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col max-w-2xl">
          <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
            Stock Counts
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Compare physical inventory with recorded stock and review count history.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-space-xs px-space-md py-2 bg-surface-container-lowest text-on-surface rounded-lg shadow-sm border border-outline-variant/40 hover:bg-surface-container-low transition-all font-label-md text-label-md font-medium cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onNavigate('new-stock-count')}
            className="flex items-center gap-space-xs px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm transition-all font-label-md text-label-md font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Start New Count</span>
          </button>
        </div>
      </div>

      {/* 3 METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-space-lg">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Open Counts</span>
          <span className="font-display-lg text-display-lg text-on-surface font-semibold tracking-tight mt-1">
            {openCounts.length}
          </span>
          <div className="flex items-center gap-space-xs mt-space-md pt-space-xs text-secondary">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-body-sm text-body-sm">Currently in progress</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Completed This Month</span>
          <span className="font-display-lg text-display-lg text-on-surface font-semibold tracking-tight mt-1">8</span>
          <div className="flex items-center gap-space-xs mt-space-md pt-space-xs text-secondary">
            <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
            <span className="font-body-sm text-body-sm">Finalized stock counts</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Adjustments This Month</span>
          <span className="font-display-lg text-display-lg text-on-surface font-semibold tracking-tight mt-1">12</span>
          <div className="flex items-center gap-space-xs mt-space-md pt-space-xs text-secondary">
            <span className="material-symbols-outlined text-[16px] text-secondary">sync_alt</span>
            <span className="font-body-sm text-body-sm">Inventory differences recorded</span>
          </div>
        </div>
      </div>

      {/* OPEN STOCK COUNT CALLOUT (If open count exists) */}
      {activeOpenCount && (
        <section className="mb-space-xl">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm border border-outline-variant/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500"></div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg pl-space-xs">
              <div className="flex flex-col gap-space-xs max-w-xl">
                <div className="flex flex-wrap items-center gap-space-sm mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-label-sm text-label-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>In Progress</span>
                  </span>
                  <span className="font-numeric-table font-semibold text-on-surface bg-surface-container-low px-2 py-0.5 rounded">
                    {activeOpenCount.id}
                  </span>
                  <span className="text-secondary text-[12px]">•</span>
                  <span className="font-label-md text-label-md text-secondary">
                    {formatDate(activeOpenCount.date || activeOpenCount.displayDate)}
                  </span>
                </div>
                <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-semibold">
                  Open Stock Count
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md pt-space-xs text-secondary">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider block text-secondary">Location</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">{activeOpenCount.location}</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider block text-secondary">Started By</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">{activeOpenCount.countedBy}</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider block text-secondary">Scope</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">{activeOpenCount.scope}</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider block text-secondary">Differences</span>
                    <span className="font-body-md text-body-md text-amber-700 font-medium">
                      {activeOpenCount.differencesCount} recorded
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center min-w-[280px] lg:max-w-xs w-full bg-surface-container-low/60 p-space-md rounded-xl border border-outline-variant/30">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    {activeOpenCount.countedItemsCount} of {activeOpenCount.totalItemsCount} counted
                  </span>
                  <span className="font-numeric-table font-bold text-primary">
                    {activeOpenCount.progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden flex">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${activeOpenCount.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-secondary mt-2">
                  <span className="font-label-sm text-label-sm">
                    {activeOpenCount.totalItemsCount - activeOpenCount.countedItemsCount} items remaining
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-secondary">kitchen</span>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <button
                    onClick={() => { setSelectedStockCountId(activeOpenCount.id); onNavigate('stock-count-detail'); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-space-md bg-primary hover:bg-primary-container text-on-primary rounded-lg transition-all font-label-md text-label-md font-medium shadow-sm"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    <span>Resume Count</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RECENT STOCK COUNTS TABLE SECTION */}
      <section className="flex flex-col w-full">
        <div className="mb-space-md">
          <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">Recent Stock Counts</h3>
          <p className="font-body-md text-body-md text-secondary">Recent physical inventory checks across {currentBranch}.</p>
        </div>

        {/* Filter Control Bar */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 mb-space-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-space-sm">
            <div className="relative w-full sm:max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search count ID or location"
                className="w-full bg-surface-container-low pl-9 pr-space-md py-2 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/40 transition-all"
              />
            </div>
            <div className="w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2 rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/40 transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-surface-container-low px-space-md py-2 rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/40 transition-all cursor-pointer"
              >
                <option value="All">All Locations</option>
                <option value="Main Store">Main Store</option>
                <option value="Walk-in Cooler">Walk-in Cooler</option>
                <option value="Dry Store">Dry Store</option>
                <option value="Kitchen Prep">Kitchen Prep</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('All'); setLocationFilter('All'); }}
            className="self-end md:self-center font-label-md text-label-md text-secondary hover:text-primary transition-colors flex items-center gap-1 py-1 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Data Table Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                  <th scope="col" className="py-3 px-space-md font-semibold">Count ID</th>
                  <th scope="col" className="py-3 px-space-md font-semibold">Date</th>
                  <th scope="col" className="py-3 px-space-md font-semibold">Location</th>
                  <th scope="col" className="py-3 px-space-md font-semibold">Scope</th>
                  <th scope="col" className="py-3 px-space-md font-semibold">Progress</th>
                  <th scope="col" className="py-3 px-space-md font-semibold">Differences</th>
                  <th scope="col" className="py-3 px-space-md font-semibold">Status</th>
                  <th scope="col" className="py-3 px-space-md font-semibold">Counted By</th>
                  <th scope="col" className="py-3 px-space-md font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
                {filteredCounts.map(count => (
                  <tr
                    key={count.id}
                    onClick={() => { setSelectedStockCountId(count.id); onNavigate(count.status === 'In Progress' ? 'stock-count-detail' : 'stock-count-review'); }}
                    className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-space-md font-mono font-semibold text-primary">
                      {count.id}
                    </td>
                    <td className="py-3.5 px-space-md text-on-surface-variant font-label-md">
                      {formatDate(count.date || count.displayDate)}
                    </td>
                    <td className="py-3.5 px-space-md font-medium text-on-surface">
                      {count.location}
                    </td>
                    <td className="py-3.5 px-space-md text-on-surface-variant">
                      {count.scope}
                    </td>
                    <td className="py-3.5 px-space-md">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-surface-container-high overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${count.progress}%` }}></div>
                        </div>
                        <span className="font-numeric-table font-semibold text-xs">{count.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-space-md font-numeric-table">
                      {count.differencesCount > 0 ? (
                        <span className="text-amber-700 font-semibold">{count.differencesCount} items</span>
                      ) : (
                        <span className="text-tertiary-container font-medium">None (0)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-space-md">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        count.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${count.status === 'In Progress' ? 'bg-amber-500' : 'bg-emerald-600'}`}></span>
                        {count.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-space-md text-on-surface-variant font-label-md">
                      {count.countedBy}
                    </td>
                    <td className="py-3.5 px-space-md text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { setSelectedStockCountId(count.id); onNavigate(count.status === 'In Progress' ? 'stock-count-detail' : 'stock-count-review'); }}
                        className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors border border-outline-variant/40"
                        type="button"
                      >
                        {count.status === 'In Progress' ? 'Resume' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
