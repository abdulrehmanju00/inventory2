import React from 'react';
import { useAppStore } from '../store/AppStore';

export default function StockCountDetail({ onNavigate }) {
  const { stockCounts, selectedStockCountId, updateStockCountItem, formatCurrency, formatDate } = useAppStore();

  const count = stockCounts.find(c => c.id === selectedStockCountId) || stockCounts[0];

  if (!count) {
    return (
      <div className="p-8 text-center">
        <p>No active stock count selected.</p>
        <button onClick={() => onNavigate('stock-counts')} className="mt-4 px-4 py-2 bg-primary text-white rounded">Back</button>
      </div>
    );
  }

  const items = count.items || [];
  const countedCount = items.filter(it => it.countedStock !== null).length;
  const varianceCount = items.filter(it => it.diff !== null && it.diff !== 0).length;

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('stock-counts')} className="hover:text-on-surface transition-colors cursor-pointer">Stock Counts</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">{count.id}</span>
      </nav>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface">
              {count.id} · {count.location}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              count.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {count.status}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Count started by {count.countedBy} · {formatDate(count.date || count.displayDate)}
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => onNavigate('stock-counts')}
            className="h-10 px-4 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors font-label-md cursor-pointer"
            type="button"
          >
            Back to List
          </button>
          <button
            onClick={() => onNavigate('stock-count-review')}
            className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            type="button"
          >
            <span>{count.status === 'Completed' ? 'View Final Reconciliation' : 'Review & Finalize'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* PROGRESS TRACKER BAR */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 mb-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Counting Progress</span>
            <span className="font-headline-md font-bold text-on-surface font-numeric-table">
              {countedCount} of {items.length} counted ({count.progress}%)
            </span>
          </div>
          <div className="h-8 w-px bg-outline-variant/30 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Differences Found</span>
            <span className={`font-headline-md font-bold font-numeric-table ${varianceCount > 0 ? 'text-amber-700' : 'text-tertiary-container'}`}>
              {varianceCount} items
            </span>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${count.progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* COUNTING TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Ingredient</th>
                <th className="py-3 px-4 font-semibold text-right">Expected Stock</th>
                <th className="py-3 px-4 font-semibold text-center w-52">Counted Physical Stock</th>
                <th className="py-3 px-4 font-semibold text-right">Difference</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Quick Fill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm">
              {items.map(item => {
                const isVariance = item.diff !== null && item.diff !== 0;
                const isMatch = item.diff === 0;

                return (
                  <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-on-surface">
                      <div className="flex flex-col">
                        <span className="font-semibold text-body-md">{item.name}</span>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span>Cost: {formatCurrency(item.unitCost)}/{item.unit}</span>
                          {item.location && (
                            <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface font-medium">
                              {item.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-numeric-table font-semibold text-on-surface">
                      {item.systemStock} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          disabled={count.status === 'Completed'}
                          value={item.countedStock !== null ? item.countedStock : ''}
                          onChange={(e) => updateStockCountItem(count.id, item.id, e.target.value)}
                          placeholder="Enter count"
                          className="w-28 h-9 text-center font-numeric-table font-semibold rounded-lg bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                        <span className="text-xs font-semibold text-on-surface-variant">{item.unit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-numeric-table font-bold">
                      {item.diff !== null ? (
                        <span className={item.diff < 0 ? 'text-error' : item.diff > 0 ? 'text-primary' : 'text-on-surface-variant'}>
                          {item.diff > 0 ? `+${item.diff}` : item.diff} {item.unit}
                        </span>
                      ) : (
                        <span className="text-outline-variant">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.countedStock === null ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-surface-container text-on-surface-variant">
                          Pending
                        </span>
                      ) : isVariance ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 font-semibold">
                          Variance
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 font-semibold">
                          Match
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        disabled={count.status === 'Completed'}
                        onClick={() => updateStockCountItem(count.id, item.id, item.systemStock)}
                        className="px-2.5 py-1 text-xs rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Match ({item.systemStock})
                      </button>
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
