import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';

export default function ReviewFinalize({ onNavigate }) {
  const { stockCounts, selectedStockCountId, finalizeStockCount, formatCurrency } = useAppStore();
  const [finalNotes, setFinalNotes] = useState('');

  const count = stockCounts.find(c => c.id === selectedStockCountId) || stockCounts[0];

  if (!count) {
    return (
      <div className="p-8 text-center">
        <p>No active stock count to review.</p>
        <button onClick={() => onNavigate('stock-counts')} className="mt-4 px-4 py-2 bg-primary text-white rounded">Back</button>
      </div>
    );
  }

  const items = count.items || [];
  const isCompleted = count.status === 'Completed';
  const uncountedItems = items.filter(it => it.countedStock === null || it.countedStock === undefined || it.countedStock === '' || Number(it.countedStock) < 0 || isNaN(it.countedStock));
  const canFinalize = !isCompleted && items.length > 0 && uncountedItems.length === 0;
  const varianceItems = items.filter(it => it.diff !== null && it.diff !== 0);

  const netFinancialImpact = varianceItems.reduce((acc, it) => acc + (it.diff * it.unitCost), 0);

  const handleCommit = () => {
    if (isCompleted) return;
    finalizeStockCount(count.id, finalNotes);
    onNavigate('stock-counts');
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('stock-counts')} className="hover:text-on-surface transition-colors cursor-pointer">Stock Counts</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('stock-count-detail')} className="hover:text-on-surface transition-colors cursor-pointer">{count.id}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Review & Finalize</span>
      </nav>

      {/* HEADER */}
      <div className="mb-space-lg">
        <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
          Review & Finalize Count
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Review variances before adjusting inventory balances for {count.location}.
        </p>
      </div>

      {/* SUMMARY BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Audited</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1 font-numeric-table">{items.length} items</span>
          <span className="text-xs text-on-surface-variant mt-2">{count.location}</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Items with Variance</span>
          <span className="font-headline-xl font-bold text-amber-700 mt-1 font-numeric-table">{varianceItems.length} items</span>
          <span className="text-xs text-on-surface-variant mt-2">Adjustments will be applied</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Net Financial Variance</span>
          <span className={`font-headline-xl font-bold mt-1 font-numeric-table ${netFinancialImpact < 0 ? 'text-error' : 'text-primary'}`}>
            {formatCurrency(netFinancialImpact)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Valuation adjustment</span>
        </div>
      </div>

      {/* VARIANCE ITEMS TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-space-lg">
        <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="font-headline-md font-semibold text-on-surface">Differences To Reconcile</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
            {varianceItems.length} adjustment(s)
          </span>
        </div>

        {varianceItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant uppercase text-xs tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Ingredient</th>
                  <th className="py-2.5 px-4 font-semibold text-right">System Stock</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Counted Physical</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Variance</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Cost Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {varianceItems.map(it => {
                  const impact = it.diff * it.unitCost;
                  return (
                    <tr key={it.id} className="hover:bg-surface-container-low/40">
                      <td className="py-3 px-4 font-semibold text-on-surface">{it.name}</td>
                      <td className="py-3 px-4 text-right font-numeric-table">{it.systemStock} {it.unit}</td>
                      <td className="py-3 px-4 text-right font-numeric-table font-semibold text-on-surface">{it.countedStock} {it.unit}</td>
                      <td className={`py-3 px-4 text-right font-numeric-table font-bold ${it.diff < 0 ? 'text-error' : 'text-primary'}`}>
                        {it.diff > 0 ? `+${it.diff}` : it.diff} {it.unit}
                      </td>
                      <td className={`py-3 px-4 text-right font-numeric-table font-bold ${impact < 0 ? 'text-error' : 'text-primary'}`}>
                        {formatCurrency(impact)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[36px] text-tertiary-container mb-2">check_circle</span>
            <p className="font-semibold text-on-surface">No stock variances!</p>
            <p className="text-xs text-on-surface-variant mt-1">All counted items perfectly matched current records.</p>
          </div>
        )}
      </div>

      {/* FINAL NOTES & COMMIT */}
      {isCompleted ? (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-start gap-3 mb-space-lg">
          <span className="material-symbols-outlined text-[20px] text-emerald-600 mt-0.5">check_circle</span>
          <div className="flex-1 text-body-sm font-medium">
            This physical stock count has already been finalized and reconciled. Inventory balances are locked and cannot be adjusted again from this historical session.
          </div>
        </div>
      ) : !canFinalize ? (
        <div className="p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 flex items-start gap-3 mb-space-lg">
          <span className="material-symbols-outlined text-[20px] text-amber-600 mt-0.5">warning</span>
          <div className="flex-1 text-body-sm font-medium">
            Cannot finalize count: {uncountedItems.length} item(s) remain uncounted or have invalid values. All items must be counted before finalization is enabled.
          </div>
          <button
            type="button"
            onClick={() => onNavigate('stock-count-detail')}
            className="text-xs font-semibold underline hover:no-underline text-amber-800"
          >
            Count Remaining Items
          </button>
        </div>
      ) : null}

      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 space-y-4 mb-space-lg">
        <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="finalize-notes">
          Reconciliation Notes / Explanation
        </label>
        <textarea
          id="finalize-notes"
          rows="3"
          disabled={isCompleted}
          value={finalNotes || count.notes || ''}
          onChange={(e) => setFinalNotes(e.target.value)}
          placeholder="e.g., Shortage due to end-of-week prep wastage not recorded in batch prep logs."
          className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
        ></textarea>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onNavigate('stock-count-detail')}
          className="h-10 px-5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md transition-colors cursor-pointer"
        >
          {isCompleted ? 'View Item Counts' : 'Back to Counting'}
        </button>
        <button
          type="button"
          onClick={handleCommit}
          disabled={!canFinalize}
          className={`h-10 px-6 rounded-lg font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5 ${
            canFinalize
              ? 'bg-primary hover:bg-primary/90 text-on-primary cursor-pointer'
              : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed border border-outline-variant/30 shadow-none'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          {isCompleted ? 'Reconciliation Finalized' : 'Finalize & Update Inventory'}
        </button>
      </div>
    </div>
  );
}
