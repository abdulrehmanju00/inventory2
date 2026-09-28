import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { computeInventoryMetrics } from '../utils/inventory';
import { exportToCsv } from '../utils/csv';

export default function Reports({ onNavigate }) {
  const { currentBranch, ingredients, wastage, purchases, productions, formatCurrency, formatDate, getLocalDateKey, settings, showToast } = useAppStore();
  const [activeTab, setActiveTab] = useState('valuation');

  const metrics = computeInventoryMetrics(ingredients);
  const totalWastage = wastage.reduce((acc, w) => acc + (Number(w.cost) || 0), 0);
  const totalPurchases = purchases.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);

  // Production Metrics derived strictly from AppStore productions
  const totalProductionBatches = productions ? productions.length : 0;
  const draftBatches = productions ? productions.filter(p => p.status === 'Draft').length : 0;
  const scheduledBatches = productions ? productions.filter(p => p.status === 'Scheduled').length : 0;
  const inProgressBatches = productions ? productions.filter(p => p.status === 'In Progress').length : 0;
  const qualityReviewBatches = productions ? productions.filter(p => p.status === 'Quality Review').length : 0;
  const completedBatches = productions ? productions.filter(p => p.status === 'Completed').length : 0;

  const totalPlannedUnits = productions
    ? productions.reduce((acc, p) => acc + (Number(p.plannedQuantity) || 0), 0)
    : 0;
  const totalActualProducedUnits = productions
    ? productions.reduce((acc, p) => acc + (Number(p.actualOutput) || 0), 0)
    : 0;
  const totalProductionWastageUnits = productions
    ? productions.reduce((acc, p) => acc + (Number(p.productionWastage) || 0), 0)
    : 0;

  const averageYieldPct = totalPlannedUnits > 0
    ? Math.round((totalActualProducedUnits / totalPlannedUnits) * 1000) / 10
    : 0;

  // Category breakdown
  const categoryBreakdown = {};
  ingredients.forEach(item => {
    const val = item.currentStock * item.unitCost;
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + val;
  });

  const handleExportCSV = () => {
    if (activeTab === 'production') {
      const headers = ['Batch ID', 'Recipe Name', 'Station', 'Planned Quantity', 'Actual Produced', 'Wastage', 'Yield (%)', 'Status', 'Date'];
      const rows = (productions || []).map(p => [
        p.id,
        p.recipeName,
        p.station || '',
        p.plannedQuantity || 0,
        p.actualOutput || 0,
        p.productionWastage || 0,
        `${p.yieldPct || 0}%`,
        p.status || 'Completed',
        p.date ? formatDate(p.date) : ''
      ]);
      exportToCsv(`Production_Report_${getLocalDateKey(new Date(), settings?.timezone)}`, headers, rows);
      showToast('Production performance report downloaded', 'success');
      return;
    }

    const headers = ['Category', 'Item Name', 'SKU', 'Current Stock', 'Unit', 'Unit Cost', 'Valuation', 'Status'];
    const rows = ingredients.map(i => [
      i.category,
      i.name,
      i.sku,
      i.currentStock,
      i.stockUnit,
      i.unitCost,
      Math.round(i.currentStock * i.unitCost),
      i.status
    ]);
    exportToCsv(`Inventory_Valuation_Report_${getLocalDateKey(new Date(), settings?.timezone)}`, headers, rows);
    showToast('Inventory valuation report downloaded', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Management</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Reports & Analytics</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
            Operational Reports
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Financial analytics, stock valuation, shrinkage, and vendor spend for {currentBranch}.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-space-xs px-space-md py-2 bg-surface-container-lowest text-on-surface rounded-lg shadow-sm border border-outline-variant/40 hover:bg-surface-container-low transition-all font-label-md cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">print</span>
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-space-xs px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm transition-all font-label-md font-medium cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3 SUMMARY KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Current Inventory Value</span>
          <span className="font-headline-xl font-bold text-on-surface tracking-tight mt-1 font-numeric-table">
            {formatCurrency(metrics.totalValue)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">{metrics.totalItems} catalog items active</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Logged Food Wastage</span>
          <span className="font-headline-xl font-bold text-error tracking-tight mt-1 font-numeric-table">
            {formatCurrency(totalWastage)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">{wastage.length} recorded incidents</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Procurement Spend</span>
          <span className="font-headline-xl font-bold text-primary tracking-tight mt-1 font-numeric-table">
            {formatCurrency(totalPurchases)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">{purchases.length} total purchase orders</span>
        </div>
      </div>

      {/* REPORT TABS */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="border-b border-outline-variant/30 px-space-md pt-2 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('valuation')}
            className={`pb-3 font-label-md text-label-md font-semibold transition-colors border-b-2 ${
              activeTab === 'valuation' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Inventory Valuation by Category
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shrinkage')}
            className={`pb-3 font-label-md text-label-md font-semibold transition-colors border-b-2 ${
              activeTab === 'shrinkage' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Wastage & Loss Trends
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('production')}
            className={`pb-3 font-label-md text-label-md font-semibold transition-colors border-b-2 ${
              activeTab === 'production' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Production & Batch Yield
          </button>
        </div>

        <div className="p-space-md">
          {activeTab === 'valuation' ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-xs text-on-surface-variant uppercase tracking-wider">
                      <th className="py-2.5 px-4 font-semibold">Category Group</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Items Count</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Total Category Value</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Share of Inventory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {Object.entries(categoryBreakdown).map(([cat, val]) => {
                      const count = ingredients.filter(i => i.category === cat).length;
                      const share = metrics.totalValue > 0 ? Math.round((val / metrics.totalValue) * 100) : 0;
                      return (
                        <tr key={cat} className="hover:bg-surface-container-low/40">
                          <td className="py-3 px-4 font-semibold text-on-surface">{cat}</td>
                          <td className="py-3 px-4 text-right font-numeric-table">{count} items</td>
                          <td className="py-3 px-4 text-right font-numeric-table font-semibold text-on-surface">{formatCurrency(val)}</td>
                          <td className="py-3 px-4 text-right font-numeric-table text-primary font-bold">{share}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'shrinkage' ? (
            <div className="space-y-3">
              <p className="text-body-sm text-on-surface-variant">Breakdown of recent recorded losses by station area:</p>
              <div className="divide-y divide-outline-variant/20 font-body-sm">
                {wastage.map(w => (
                  <div key={w.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-on-surface">{w.ingredientName}</span>
                      <span className="text-xs text-on-surface-variant block">{w.reason} · {w.location}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-numeric-table font-bold text-error block">{formatCurrency(w.cost)}</span>
                      <span className="text-xs text-on-surface-variant">{w.quantity} {w.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PRODUCTION METRICS SECTION */}
              <div>
                <h3 className="font-headline-md font-semibold text-on-surface mb-1">
                  Kitchen Production & Batch Yield Performance
                </h3>
                <p className="text-xs text-on-surface-variant mb-4">
                  Calculated frontend metrics from shared kitchen production logs for {currentBranch}.
                </p>

                {/* 10 CALCULATED PRODUCTION METRICS */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Total Production Batches</span>
                    <span className="font-headline-md font-bold text-on-surface font-numeric-table mt-1">{totalProductionBatches}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Draft Batches</span>
                    <span className="font-headline-md font-bold text-on-surface-variant font-numeric-table mt-1">{draftBatches}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Scheduled Batches</span>
                    <span className="font-headline-md font-bold text-secondary font-numeric-table mt-1">{scheduledBatches}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">In Progress Batches</span>
                    <span className="font-headline-md font-bold text-amber-700 font-numeric-table mt-1">{inProgressBatches}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Quality Review Batches</span>
                    <span className="font-headline-md font-bold text-tertiary font-numeric-table mt-1">{qualityReviewBatches}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Completed Batches</span>
                    <span className="font-headline-md font-bold text-primary font-numeric-table mt-1">{completedBatches}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Total Planned Units</span>
                    <span className="font-headline-md font-bold text-on-surface font-numeric-table mt-1">{totalPlannedUnits}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Total Actual Produced Units</span>
                    <span className="font-headline-md font-bold text-emerald-700 font-numeric-table mt-1">{totalActualProducedUnits}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Total Production Wastage Units</span>
                    <span className="font-headline-md font-bold text-error font-numeric-table mt-1">{totalProductionWastageUnits}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Average Yield %</span>
                    <span className="font-headline-md font-bold text-primary font-numeric-table mt-1">{averageYieldPct}%</span>
                  </div>
                </div>
              </div>

              {/* BATCHES TABLE */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold mb-2">Production Batches Log</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-sm">
                    <thead>
                      <tr className="bg-surface-container-low text-xs text-on-surface-variant uppercase tracking-wider">
                        <th className="py-2.5 px-4 font-semibold">Batch ID</th>
                        <th className="py-2.5 px-4 font-semibold">Recipe Dish</th>
                        <th className="py-2.5 px-4 font-semibold">Station</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Planned</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Actual Output</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Wastage</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Yield</th>
                        <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {productions && productions.length > 0 ? (
                        productions.map(p => (
                          <tr key={p.id} className="hover:bg-surface-container-low/40">
                            <td className="py-3 px-4 font-semibold text-primary">{p.id}</td>
                            <td className="py-3 px-4 font-medium text-on-surface">{p.recipeName}</td>
                            <td className="py-3 px-4 text-on-surface-variant">{p.station || 'Prep Station'}</td>
                            <td className="py-3 px-4 text-right font-numeric-table">{p.plannedQuantity || 0}</td>
                            <td className="py-3 px-4 text-right font-numeric-table font-semibold text-on-surface">{p.actualOutput || 0}</td>
                            <td className="py-3 px-4 text-right font-numeric-table font-semibold text-error">{p.productionWastage || 0}</td>
                            <td className="py-3 px-4 text-right font-numeric-table font-bold text-primary">{p.yieldPct || 0}%</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container text-on-surface-variant'
                              }`}>
                                {p.status || 'Draft'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="py-6 text-center text-on-surface-variant">
                            No production batches logged.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
