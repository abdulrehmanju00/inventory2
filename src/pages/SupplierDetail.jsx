import React from 'react';
import { useAppStore } from '../store/AppStore';

export default function SupplierDetail({ onNavigate }) {
  const { suppliers, selectedSupplierId, ingredients, formatCurrency } = useAppStore();

  const sup = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0] || {
    id: "sup-1",
    name: "Fresh Foods Supplier",
    category: "Proteins & Meats",
    contactPerson: "Tariq Mehmood",
    phone: "+92 300 1234567",
    email: "orders@freshfoods.pk",
    address: "Plot 42, Wholesale Meat Market, Lahore",
    leadTimeDays: 1,
    paymentTerms: "Net 15 Days",
    rating: 4.8,
    status: "Active"
  };

  const suppliedItems = ingredients.filter(i => i.supplier === sup.name);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('suppliers')} className="hover:text-on-surface transition-colors cursor-pointer">Suppliers</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">{sup.name}</span>
      </nav>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface">
              {sup.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {sup.status}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {sup.category} · Rating ★ {sup.rating}
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => onNavigate('new-purchase')}
            className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
            <span>Create Purchase Order</span>
          </button>
          <button
            onClick={() => onNavigate('suppliers')}
            className="h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors"
            type="button"
          >
            Back
          </button>
        </div>
      </div>

      {/* SUPPLIER INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-lg">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-3">
          <h2 className="font-headline-md font-semibold text-on-surface pb-2 border-b border-outline-variant/20">Contact Details</h2>
          <div className="space-y-2 text-body-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Representative:</span>
              <span className="font-semibold text-on-surface">{sup.contactPerson}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Phone:</span>
              <span className="font-mono text-on-surface">{sup.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Email:</span>
              <span className="text-primary">{sup.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Address:</span>
              <span className="text-on-surface text-right max-w-xs">{sup.address}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-3">
          <h2 className="font-headline-md font-semibold text-on-surface pb-2 border-b border-outline-variant/20">Terms & SLA</h2>
          <div className="space-y-2 text-body-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Payment Terms:</span>
              <span className="font-semibold text-on-surface">{sup.paymentTerms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Lead Time:</span>
              <span className="text-on-surface">{sup.leadTimeDays} business day(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Delivery Window:</span>
              <span className="text-on-surface">Morning (08:00 AM – 11:30 AM)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">On-Time Performance:</span>
              <span className="text-tertiary-container font-semibold">97.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUPPLIED INGREDIENTS LIST */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="font-headline-md font-semibold text-on-surface">Active Catalog Items Supplied</h2>
          <span className="text-xs text-on-surface-variant">{suppliedItems.length} items linked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-xs text-on-surface-variant uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Ingredient</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold text-right">In Stock</th>
                <th className="py-2.5 px-4 font-semibold text-right">Unit Price</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {suppliedItems.map(item => (
                <tr key={item.id} className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-semibold text-on-surface">{item.name}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{item.category}</td>
                  <td className="py-3 px-4 text-right font-numeric-table">{item.currentStock} {item.stockUnit}</td>
                  <td className="py-3 px-4 text-right font-numeric-table font-semibold">{formatCurrency(item.unitCost)}/{item.stockUnit}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-xs bg-surface-container text-on-surface">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {suppliedItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-on-surface-variant">
                    No active ingredients currently linked to this vendor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
