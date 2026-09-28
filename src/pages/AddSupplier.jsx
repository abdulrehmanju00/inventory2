import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';

export default function AddSupplier({ onNavigate }) {
  const { addSupplier } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Proteins & Meats',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    leadTimeDays: '1',
    paymentTerms: 'Net 15 Days'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addSupplier({
      ...formData,
      leadTimeDays: Number(formData.leadTimeDays) || 1
    });

    onNavigate('suppliers');
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('suppliers')} className="hover:text-on-surface transition-colors cursor-pointer">Suppliers</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Add Supplier</span>
      </nav>

      {/* HEADER */}
      <div className="mb-space-lg">
        <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
          Add Vendor / Supplier
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Register an approved food, beverage, or packaging distributor.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Company / Vendor Name <span className="text-error">*</span></label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Al-Madina Fresh Poultry"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Category Classification</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Proteins & Meats">Proteins & Meats</option>
                <option value="Dry Goods & Packaging">Dry Goods & Packaging</option>
                <option value="Fresh Produce & Vegetables">Fresh Produce & Vegetables</option>
                <option value="Dairy & Cheese">Dairy & Cheese</option>
                <option value="Beverages & Syrups">Beverages & Syrups</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Contact Person <span className="text-error">*</span></label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g., Tariq Mehmood"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Phone Number <span className="text-error">*</span></label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., +92 300 1234567"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., orders@vendor.pk"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Payment / Credit Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Cash On Delivery">Cash On Delivery</option>
                <option value="Advance Payment">Advance Payment</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">Physical Warehouse / Dispatch Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g., Sector 14, Commercial Market, Lahore"
              className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('suppliers')}
            className="h-10 px-5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            Save Supplier
          </button>
        </div>
      </form>
    </div>
  );
}
