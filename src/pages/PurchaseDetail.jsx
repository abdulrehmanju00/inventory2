import React from 'react';
import { useAppStore } from '../store/AppStore';

export default function PurchaseDetail({ onNavigate }) {
  const { purchases, selectedPurchaseId, receivePurchase, currentBranch, formatCurrency, formatDate } = useAppStore();

  const po = purchases.find(p => p.id === selectedPurchaseId) || purchases[0] || {
    id: "PO-8821",
    supplier: "Fresh Foods Supplier",
    totalAmount: 84500,
    itemCount: 3,
    status: "Awaiting Receiving",
    displayDate: "24 Sep 2026",
    expectedDelivery: "24 Sep 2026, 4:00 PM",
    createdBy: "Ahmed Raza",
    items: [
      { ingredient: "Chicken Breast", quantity: 50, unit: "kg", unitCost: 920, total: 46000 },
      { ingredient: "Beef Mince", quantity: 25, unit: "kg", unitCost: 1450, total: 36250 },
      { ingredient: "Chicken Wings", quantity: 15, unit: "kg", unitCost: 150, total: 2250 }
    ]
  };

  const handleReceive = () => {
    receivePurchase(po.id);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('purchases')} className="hover:text-on-surface transition-colors cursor-pointer">Purchases</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">{po.id}</span>
      </nav>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface">
              {po.id} · {po.supplier}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              po.status === 'Awaiting Receiving' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {po.status}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ordered on {formatDate(po.date || po.orderDate || po.displayDate)} by {po.createdBy}
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          {po.status === 'Awaiting Receiving' && (
            <button
              onClick={handleReceive}
              className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">inventory</span>
              <span>Receive Items & Update Stock</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('purchases')}
            className="h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors"
            type="button"
          >
            Back to Orders
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Order Amount</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1 font-numeric-table">
            {formatCurrency(po.totalAmount)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">{po.itemCount} line items</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Delivery Schedule</span>
          <span className="font-headline-md font-semibold text-on-surface mt-1">
            {po.expectedDelivery || 'Expected Today'}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">{currentBranch} receiving dock</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Authorized Buyer</span>
          <span className="font-headline-md font-semibold text-on-surface mt-1">
            {po.createdBy}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Operations Lead</span>
        </div>
      </div>

      {/* LINE ITEMS TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-space-lg">
        <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="font-headline-md font-semibold text-on-surface">Order Manifest Items</h2>
          <span className="text-xs text-on-surface-variant">{po.items?.length || 0} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase text-xs tracking-wider">
                <th className="py-3 px-4 font-semibold">Ingredient</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity Ordered</th>
                <th className="py-3 px-4 font-semibold text-right">Unit Cost</th>
                <th className="py-3 px-4 font-semibold text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {(po.items || []).map((it, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-semibold text-on-surface">{it.ingredient}</td>
                  <td className="py-3 px-4 text-right font-numeric-table font-semibold">{it.quantity} {it.unit}</td>
                  <td className="py-3 px-4 text-right font-numeric-table">{formatCurrency(it.unitCost)}</td>
                  <td className="py-3 px-4 text-right font-numeric-table font-bold text-on-surface">{formatCurrency(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
