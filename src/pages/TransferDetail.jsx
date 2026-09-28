import React from 'react';
import { useAppStore } from '../store/AppStore';

export default function TransferDetail({ onNavigate }) {
  const { transfers, selectedTransferId, updateTransferStatus, showToast, formatDate } = useAppStore();

  const trf = transfers.find(t => t.id === selectedTransferId) || transfers[0] || {
    id: "TRF-5011",
    fromLocation: "Main Store",
    toLocation: "Walk-in Cooler",
    itemCount: 4,
    status: "In Transit",
    requestedBy: "Ahmed Raza",
    displayDate: "24 Sep 2026",
    items: [
      { name: "Chicken Breast", qty: "20 kg" },
      { name: "Heavy Cream", qty: "10 L" },
      { name: "Mozzarella Cheese", qty: "15 kg" },
      { name: "Beef Mince", qty: "10 kg" }
    ]
  };

  const handleComplete = () => {
    updateTransferStatus(trf.id, 'Completed');
    showToast(`Transfer ${trf.id} marked as completed and received.`, 'success');
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('transfers')} className="hover:text-on-surface transition-colors cursor-pointer">Transfers</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">{trf.id}</span>
      </nav>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface">
              {trf.id} · {trf.fromLocation} → {trf.toLocation}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              trf.status === 'In Transit' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {trf.status}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Dispatched by {trf.requestedBy} · {formatDate(trf.date || trf.displayDate)}
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          {trf.status === 'In Transit' && (
            <button
              onClick={handleComplete}
              className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Accept & Complete Transfer</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('transfers')}
            className="h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors"
            type="button"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* TRANSFER ITEMS TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden mb-space-lg">
        <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="font-headline-md font-semibold text-on-surface">Transferred Items Manifest</h2>
          <span className="text-xs text-on-surface-variant">{trf.items?.length || trf.itemCount} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase text-xs tracking-wider">
                <th className="py-3 px-4 font-semibold">Item Description</th>
                <th className="py-3 px-4 font-semibold text-right">Transfer Quantity</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {(trf.items || [{ name: 'Chicken Breast', qty: '20 kg' }]).map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-semibold text-on-surface">{item.name}</td>
                  <td className="py-3 px-4 text-right font-numeric-table font-semibold text-primary">{item.qty}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-xs bg-surface-container text-on-surface font-medium">
                      {trf.status}
                    </span>
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
