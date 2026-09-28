import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { exportToCsv } from '../utils/csv';

export default function Suppliers({ onNavigate }) {
  const { currentBranch, suppliers, setSelectedSupplierId, showToast } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = [
      'Supplier ID',
      'Supplier Name',
      'Category',
      'Contact Person',
      'Phone',
      'Email',
      'Lead Time (Days)',
      'Payment Terms',
      'Rating',
      'Status'
    ];
    const rows = suppliers.map(s => [
      s.id,
      s.name,
      s.category,
      s.contactPerson,
      s.phone,
      s.email,
      s.leadTimeDays,
      s.paymentTerms,
      s.rating,
      s.status
    ]);
    exportToCsv('suppliers.csv', headers, rows);
    showToast('Suppliers list exported to suppliers.csv', 'success');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Suppliers</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
            Suppliers Overview
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Manage restaurant vendor contacts, supply terms, and procurement for {currentBranch}.
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
            onClick={() => onNavigate('add-supplier')}
            className="flex items-center gap-space-xs px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm transition-all font-label-md font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* SUPPLIERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {filteredSuppliers.map(sup => (
          <div
            key={sup.id}
            onClick={() => { setSelectedSupplierId(sup.id); onNavigate('supplier-detail'); }}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary font-bold">
                    <span className="material-symbols-outlined text-[22px]">store</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md font-semibold text-on-surface">{sup.name}</h3>
                    <span className="text-xs text-on-surface-variant font-medium">{sup.category}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {sup.status}
                </span>
              </div>

              <div className="space-y-1.5 py-3 border-y border-outline-variant/20 text-body-sm">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Contact Person:</span>
                  <span className="font-semibold text-on-surface">{sup.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Phone:</span>
                  <span className="font-mono text-on-surface">{sup.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Credit Terms:</span>
                  <span className="text-on-surface">{sup.paymentTerms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Lead Time:</span>
                  <span className="text-on-surface">{sup.leadTimeDays} day(s)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Rating: <strong className="text-amber-700">★ {sup.rating}</strong></span>
              <button
                type="button"
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Details</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
