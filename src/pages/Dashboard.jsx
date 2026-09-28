import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { computeInventoryMetrics, getStatusBadgeClasses } from '../utils/inventory';

export default function Dashboard({ onNavigate }) {
  const { currentBranch, ingredients, wastage, purchases, activity, setSelectedIngredientId, formatCurrency, getLocalDateKey, settings } = useAppStore();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  const metrics = computeInventoryMetrics(ingredients);

  // Filter only wastage records that match today's restaurant timezone date
  const todayStr = getLocalDateKey(new Date(), settings?.timezone);
  const todayWastageRecords = wastage.filter(w => {
    if (!w.date && !w.displayDate) return false;
    if (w.date && getLocalDateKey(w.date, settings?.timezone) === todayStr) return true;
    if (w.displayDate && String(w.displayDate).toLowerCase().startsWith('today')) return true;
    return false;
  });

  const todayWastageTotal = todayWastageRecords.reduce((acc, w) => acc + (Number(w.cost) || 0), 0);
  const todayWastageQty = todayWastageRecords.reduce((acc, w) => acc + (Number(w.quantity) || 0), 0);
  const pendingPurchases = purchases.filter(p => p.status === 'Awaiting Receiving');
  const pendingPurchasesCount = pendingPurchases.length;

  const criticalItems = ingredients.filter(i => i.status === 'Critical');
  const lowStockItems = ingredients.filter(i => i.status === 'Low Stock' || i.status === 'Low');
  const attentionActionCount = criticalItems.length + (lowStockItems.length > 0 ? 1 : 0) + (todayWastageTotal > 0 ? 1 : 0) + pendingPurchasesCount;

  const filteredIngredients = ingredients.filter(item => {
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ['All', 'Proteins', 'Produce', 'Dairy', 'Dry Goods', 'Beverages', 'Packaging'];

  return (
    <div className="flex flex-col w-full">
      {/* Top Context & Global Kitchen Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-space-xs mb-1">
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              Good morning
            </h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {currentBranch} · Monitor your stock, purchases, and daily inventory activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={() => onNavigate('add-stock')}
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">add</span>
            <span>Add Stock</span>
          </button>
          <button
            onClick={() => onNavigate('new-wastage')}
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">scale</span>
            <span>Record Wastage</span>
          </button>
          <button
            onClick={() => onNavigate('stock-counts')}
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">fact_check</span>
            <span>Stock Count</span>
          </button>
          <button
            onClick={() => onNavigate('new-purchase')}
            className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary/90 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            <span>New Purchase</span>
          </button>
        </div>
      </div>

      {/* Key Operational Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter mb-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
            <span className="font-label-md text-label-md">Inventory Value</span>
            <span className="material-symbols-outlined text-[18px] text-primary">account_balance_wallet</span>
          </div>
          <div className="space-y-1">
            <div className="font-headline-xl text-headline-xl font-semibold text-on-surface tracking-tight font-numeric-table">
              {formatCurrency(metrics.totalValue)}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">
              {metrics.totalItems} active items
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
            <span className="font-label-md text-label-md">Low Stock</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">warning_amber</span>
          </div>
          <div className="space-y-1">
            <div className="font-headline-xl text-headline-xl font-semibold text-on-surface tracking-tight font-numeric-table">
              {metrics.lowStockCount + metrics.criticalCount} items
            </div>
            <div className="font-label-sm text-label-sm text-amber-700 font-medium">
              {metrics.criticalCount} critical items
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
            <span className="font-label-md text-label-md">Today's Wastage</span>
            <span className="material-symbols-outlined text-[18px] text-error">delete_outline</span>
          </div>
          <div className="space-y-1">
            <div className="font-headline-xl text-headline-xl font-semibold text-on-surface tracking-tight font-numeric-table">
              {formatCurrency(todayWastageTotal)}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">
              {todayWastageQty > 0 ? `${Math.round(todayWastageQty * 10) / 10} kg/units logged` : '0 units recorded today'}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
            <span className="font-label-md text-label-md">Pending Purchases</span>
            <span className="material-symbols-outlined text-[18px] text-primary">local_shipping</span>
          </div>
          <div className="space-y-1">
            <div className="font-headline-xl text-headline-xl font-semibold text-on-surface tracking-tight font-numeric-table">
              {pendingPurchasesCount}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">
              Awaiting receiving
            </div>
          </div>
        </div>
      </div>

      {/* Needs Attention Operational Callouts */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-lg">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-md text-headline-md font-semibold text-on-surface">Needs Attention</span>
            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
              {attentionActionCount} action item{attentionActionCount === 1 ? '' : 's'}
            </span>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-primary font-label-md text-label-md hover:underline inline-flex items-center gap-0.5"
            type="button"
          >
            <span>View all</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="divide-y divide-outline-variant/30 border border-outline-variant/30 rounded-lg overflow-hidden">
          {criticalItems.map(item => (
            <div key={item.id} className="p-space-sm bg-surface-container-lowest flex items-center justify-between hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-space-sm">
                <span className="w-2 h-2 rounded-full bg-error flex-shrink-0"></span>
                <div>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">{item.name}</span>
                  <span className="mx-2 text-on-surface-variant/50">·</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Critical stock ({item.currentStock} {item.stockUnit} remaining · Min {item.minStock} {item.stockUnit})
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedIngredientId(item.id); onNavigate('add-stock'); }}
                className="px-3 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors"
                type="button"
              >
                Add Stock
              </button>
            </div>
          ))}

          {lowStockItems.slice(0, 2).map(item => (
            <div key={item.id} className="p-space-sm bg-surface-container-lowest flex items-center justify-between hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-space-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                <div>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">{item.name}</span>
                  <span className="mx-2 text-on-surface-variant/50">·</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Low stock ({item.currentStock} {item.stockUnit} remaining · Min {item.minStock} {item.stockUnit})
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedIngredientId(item.id); onNavigate('add-stock'); }}
                className="px-3 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors"
                type="button"
              >
                Add Stock
              </button>
            </div>
          ))}

          {todayWastageTotal > 0 && (
            <div className="p-space-sm bg-surface-container-lowest flex items-center justify-between hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-space-sm">
                <span className="w-2 h-2 rounded-full bg-error flex-shrink-0"></span>
                <div>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Wastage Alert</span>
                  <span className="mx-2 text-on-surface-variant/50">·</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {formatCurrency(todayWastageTotal)} recorded in kitchen waste ({Math.round(todayWastageQty * 10) / 10} units)
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('wastage')}
                className="px-3 py-1 rounded bg-surface-container-low text-on-surface border border-outline-variant/40 font-label-sm text-label-sm hover:bg-surface-container transition-colors"
                type="button"
              >
                Review
              </button>
            </div>
          )}

          {pendingPurchases.map(po => (
            <div key={po.id} className="p-space-sm bg-surface-container-lowest flex items-center justify-between hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-space-sm">
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                <div>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">{po.id} Pending Receiving</span>
                  <span className="mx-2 text-on-surface-variant/50">·</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {po.supplier} · {po.itemCount} line items ({formatCurrency(po.totalAmount)})
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('purchases')}
                className="px-3 py-1 rounded bg-surface-container-low text-on-surface border border-outline-variant/40 font-label-sm text-label-sm hover:bg-surface-container transition-colors"
                type="button"
              >
                Receive
              </button>
            </div>
          ))}

          {attentionActionCount === 0 && (
            <div className="p-space-md text-center text-on-surface-variant text-body-sm">
              All systems normal · No immediate operational action required.
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
        {/* Left Column: Inventory Overview (approx 70%) */}
        <div className="xl:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="p-space-md space-y-space-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div>
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">
                  Inventory Overview
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Current stock levels across your inventory
                </p>
              </div>
              <div className="flex items-center gap-space-xs">
                <div className="relative w-48 sm:w-60">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter ingredients..."
                    className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('inventory')}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-md font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-on-secondary-fixed text-on-secondary font-medium'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {cat === 'All' ? `All Items (${ingredients.length})` : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-2.5 px-space-md font-semibold">Ingredient</th>
                  <th scope="col" className="py-2.5 px-space-sm font-semibold">Category</th>
                  <th scope="col" className="py-2.5 px-space-sm font-semibold text-right">Current Stock</th>
                  <th scope="col" className="py-2.5 px-space-sm font-semibold text-right">Min Stock</th>
                  <th scope="col" className="py-2.5 px-space-sm font-semibold text-right">Unit Cost</th>
                  <th scope="col" className="py-2.5 px-space-sm font-semibold text-right">Total Value</th>
                  <th scope="col" className="py-2.5 px-space-sm font-semibold text-center">Status</th>
                  <th scope="col" className="py-2.5 px-space-md font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {filteredIngredients.slice(0, 7).map((item) => {
                  const badge = getStatusBadgeClasses(item.status);
                  const itemValue = item.currentStock * item.unitCost;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                      onClick={() => { setSelectedIngredientId(item.id); onNavigate('ingredient-detail'); }}
                    >
                      <td className="py-3 px-space-md font-medium text-on-surface">
                        {item.name}
                      </td>
                      <td className="py-3 px-space-sm text-on-surface-variant">
                        {item.category}
                      </td>
                      <td className={`py-3 px-space-sm text-right font-numeric-table font-semibold ${
                        item.status === 'Critical' ? 'text-error' : item.status === 'Low Stock' ? 'text-amber-700' : 'text-on-surface'
                      }`}>
                        {item.currentStock} {item.stockUnit}
                      </td>
                      <td className="py-3 px-space-sm text-right font-numeric-table text-on-surface-variant">
                        {item.minStock} {item.stockUnit}
                      </td>
                      <td className="py-3 px-space-sm text-right font-numeric-table text-on-surface">
                        {formatCurrency(item.unitCost)}/{item.stockUnit}
                      </td>
                      <td className="py-3 px-space-sm text-right font-numeric-table font-semibold text-on-surface">
                        {formatCurrency(itemValue)}
                      </td>
                      <td className="py-3 px-space-sm text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-space-md text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => { setSelectedIngredientId(item.id); onNavigate('add-stock'); }}
                          className={`px-2.5 py-1 rounded text-label-sm font-label-sm transition-colors ${
                            item.status === 'Critical' || item.status === 'Low Stock'
                              ? 'bg-primary text-on-primary hover:bg-primary/90'
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          {item.status === 'Critical' || item.status === 'Low Stock' ? 'Add Stock' : 'Adjust'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-space-md py-3 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <span className="font-numeric-table text-on-surface-variant text-label-md">
              Showing 1–{Math.min(7, filteredIngredients.length)} of {ingredients.length} items
            </span>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-primary font-label-md text-label-md hover:underline inline-flex items-center gap-0.5"
              type="button"
            >
              <span>View full inventory</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right Column: Recent Activity & Station Breakdown (approx 30%) */}
        <div className="xl:col-span-4 flex flex-col gap-gutter">
          {/* Section 1: Recent Activity Timeline */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">Recent Activity</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Local activity</span>
            </div>
            <div className="space-y-space-sm">
              {activity && activity.length > 0 ? (
                activity.slice(0, 5).map(act => (
                  <div key={act.id} className="flex items-start gap-space-xs">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      act.type === 'primary' ? 'bg-primary' : act.type === 'amber' ? 'bg-amber-500' : act.type === 'error' ? 'bg-error' : 'bg-secondary'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-sm text-body-sm text-on-surface leading-tight">{act.text}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-on-surface-variant py-2">No recent operations logged.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="w-full mt-space-sm pt-2 text-center text-primary font-label-md text-label-md hover:underline block"
            >
              View full audit trail
            </button>
          </div>

          {/* Section 2: Inventory Health */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">analytics</span>
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">Inventory Health</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{ingredients.length} items</span>
            </div>

            <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden flex mb-space-md">
              <div className="bg-tertiary-container h-full" style={{ width: `${(metrics.healthyCount / ingredients.length) * 100}%` }}></div>
              <div className="bg-amber-500 h-full" style={{ width: `${(metrics.lowStockCount / ingredients.length) * 100}%` }}></div>
              <div className="bg-error h-full" style={{ width: `${(metrics.criticalCount / ingredients.length) * 100}%` }}></div>
              <div className="bg-secondary h-full" style={{ width: `${(metrics.outOfStockCount / ingredients.length) * 100}%` }}></div>
            </div>

            <div className="space-y-space-sm">
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                  <span className="text-on-surface">Healthy</span>
                </div>
                <span className="font-numeric-table font-semibold text-on-surface">{metrics.healthyCount} items</span>
              </div>
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-on-surface">Low Stock</span>
                </div>
                <span className="font-numeric-table font-semibold text-amber-700">{metrics.lowStockCount} items</span>
              </div>
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <span className="text-on-surface">Critical</span>
                </div>
                <span className="font-numeric-table font-semibold text-error">{metrics.criticalCount} items</span>
              </div>
              <div className="flex items-center justify-between font-label-sm text-label-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="text-on-surface-variant">Out of Stock</span>
                </div>
                <span className="font-numeric-table font-semibold text-on-surface-variant">{metrics.outOfStockCount} items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
