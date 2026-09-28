import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { exportToCsv } from '../utils/csv';

export default function Purchases({ onNavigate }) {
  const { currentBranch, purchases, setSelectedPurchaseId, receivePurchase, showToast, formatCurrency, formatDate, settings } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSpent = purchases.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);
  const pendingCount = purchases.filter(p => p.status === 'Awaiting Receiving').length;

  const handleExportCSV = () => {
    const headers = [
      'PO Number',
      'Order Date',
      'Supplier',
      'Item Count',
      'Items Summary',
      `Total Amount (${settings?.currency || 'PKR'})`,
      'Status',
      'Target Location',
      'Notes'
    ];
    const rows = purchases.map(p => [
      p.id,
      p.date ? formatDate(p.date) : (p.orderDate ? formatDate(p.orderDate) : (p.displayDate || '')),
      p.supplier,
      p.itemCount || (p.items ? p.items.length : 0),
      (p.items || []).map(i => `${i.name || i.ingredientName} (${i.quantity || i.qty})`).join('; '),
      p.totalAmount || 0,
      p.status,
      p.targetLocation || p.location || '',
      p.notes || ''
    ]);
    exportToCsv('purchase-orders.csv', headers, rows);
    showToast('Purchase orders exported to purchase-orders.csv', 'success');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Purchases</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
            Purchases Overview
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Manage purchase orders, supplier shipments, and receiving for {currentBranch}.
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
            onClick={() => onNavigate('new-purchase')}
            className="flex items-center gap-space-xs px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm transition-all font-label-md font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span>New Purchase</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Total Purchases Value</span>
          <span className="font-headline-xl font-bold text-on-surface tracking-tight mt-1 font-numeric-table">
            {formatCurrency(totalSpent)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Historical procurement</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Pending Receiving</span>
          <span className="font-headline-xl font-bold text-amber-700 tracking-tight mt-1 font-numeric-table">
            {pendingCount} Orders
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Ready to be checked in</span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Authorized Buyer</span>
          <span className="font-headline-xl font-bold text-on-surface tracking-tight mt-1">
            Ahmed Raza
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Operations Lead</span>
        </div>
      </div>

      {/* PURCHASES TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-space-md border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <h2 className="font-headline-md font-semibold text-on-surface">Purchase Orders</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search PO ID or supplier..."
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-on-surface text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 rounded-lg bg-surface-container-low text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Awaiting Receiving">Awaiting Receiving</option>
              <option value="Received">Received</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">PO Number</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Supplier</th>
                <th className="py-3 px-4 font-semibold text-center">Items</th>
                <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold">Created By</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm">
              {filteredPurchases.map(po => (
                <tr
                  key={po.id}
                  onClick={() => { setSelectedPurchaseId(po.id); onNavigate('purchase-detail'); }}
                  className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-primary">{po.id}</td>
                  <td className="py-3 px-4 text-on-surface-variant text-xs">{formatDate(po.date || po.orderDate || po.displayDate)}</td>
                  <td className="py-3 px-4 font-semibold text-on-surface">{po.supplier}</td>
                  <td className="py-3 px-4 text-center font-numeric-table">{po.itemCount} items</td>
                  <td className="py-3 px-4 text-right font-numeric-table font-bold text-on-surface">
                    {formatCurrency(po.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      po.status === 'Awaiting Receiving' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${po.status === 'Awaiting Receiving' ? 'bg-amber-500' : 'bg-emerald-600'}`}></span>
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant">{po.createdBy}</td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {po.status === 'Awaiting Receiving' ? (
                      <button
                        onClick={() => receivePurchase(po.id)}
                        className="px-2.5 py-1 text-xs rounded bg-primary text-on-primary hover:bg-primary/90 transition-colors font-medium shadow-xs"
                      >
                        Receive
                      </button>
                    ) : (
                      <button
                        onClick={() => { setSelectedPurchaseId(po.id); onNavigate('purchase-detail'); }}
                        className="px-2.5 py-1 text-xs rounded bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30"
                      >
                        View
                      </button>
                    )}
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
