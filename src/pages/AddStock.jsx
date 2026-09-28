import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/AppStore';
import { getStatusBadgeClasses, calculateStockStatus } from '../utils/inventory';

export default function AddStock({ onNavigate }) {
  const { ingredients, selectedIngredientId, setSelectedIngredientId, addStock, formatCurrency, settings } = useAppStore();

  const [selectedId, setSelectedId] = useState(selectedIngredientId || 'ing-1');
  const [selectedLocation, setSelectedLocation] = useState('Main Store');
  const [receiptSource, setReceiptSource] = useState('Supplier Purchase');
  const [receiveAs, setReceiveAs] = useState('base');
  const [receivedQty, setReceivedQty] = useState('10');
  const [unitCost, setUnitCost] = useState('');
  const [batchNotes, setBatchNotes] = useState('');

  const currentIng = ingredients.find(i => i.id === selectedId) || ingredients[0];

  useEffect(() => {
    if (currentIng) {
      setUnitCost(currentIng.unitCost.toString());
    }
  }, [currentIng?.id]);

  const packageMultiplier = receiveAs === 'package' ? (currentIng?.packageSize || 10) : 1;
  const addedBaseQty = (Number(receivedQty) || 0) * packageMultiplier;
  const projectedStock = (Number(currentIng?.currentStock) || 0) + addedBaseQty;
  const totalCost = addedBaseQty * (Number(unitCost) || currentIng?.unitCost || 0);

  const badge = getStatusBadgeClasses(currentIng?.status);
  const projectedStatus = calculateStockStatus(projectedStock, currentIng?.minStock);
  const projectedBadge = getStatusBadgeClasses(projectedStatus);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addedBaseQty <= 0) return;

    addStock({
      ingredientId: currentIng.id,
      quantity: addedBaseQty,
      unit: currentIng.stockUnit,
      location: selectedLocation,
      source: receiptSource,
      notes: batchNotes
    });

    onNavigate('inventory');
  };

  return (
    <div className="w-full max-w-[920px] mx-auto flex flex-col space-y-space-lg pb-16">
      {/* BREADCRUMBS */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('inventory')} className="hover:text-on-surface transition-colors cursor-pointer">Inventory</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">{currentIng?.name}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Add Stock</span>
      </nav>

      {/* PAGE HERO HEADER */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-outline-variant/30">
        <div className="space-y-1">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">Add Stock</h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">
              <span className="material-symbols-outlined text-[14px] text-primary">restaurant</span>
              <span>{currentIng?.name} • {currentIng?.sku} • {currentIng?.location}</span>
            </div>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Record incoming stock for an existing ingredient.</p>
        </div>

        {/* Right-side stock state bin */}
        <div className="flex items-center gap-space-md p-space-sm bg-surface-container-low rounded-xl min-w-[210px] justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Current Stock</span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface tabular-nums">
              {currentIng?.currentStock} {currentIng?.stockUnit}
            </span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-label-sm font-label-sm font-semibold ${badge.bg} ${badge.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            <span>{currentIng?.status}</span>
          </div>
        </div>
      </div>

      {/* MAIN FORM BODY */}
      <form onSubmit={handleSubmit} className="space-y-space-lg">
        {/* SECTION 1: STOCK DESTINATION */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md border border-outline-variant/30">
          <div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-container">
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary font-semibold text-label-md">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">1. Stock Destination</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Choose the ingredient and destination storage location.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="ingredient-select">
                Ingredient <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  id="ingredient-select"
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setSelectedIngredientId(e.target.value);
                  }}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40 shadow-sm cursor-pointer appearance-none transition-colors"
                >
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.sku})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                  arrow_drop_down
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="storage-location">
                Destination Storage Location <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  id="storage-location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40 shadow-sm cursor-pointer appearance-none transition-colors"
                >
                  <option value="Walk-in Cooler">Walk-in Cooler</option>
                  <option value="Main Store">Main Store</option>
                  <option value="Dry Store">Dry Store</option>
                  <option value="Kitchen Prep">Kitchen Prep</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                  storefront
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-wrap items-center justify-between gap-2 font-label-sm text-label-sm text-on-surface">
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface-variant font-medium">Stock at {selectedLocation}:</span>
              <span className="font-bold text-primary font-numeric-table">{currentIng?.locationBalances?.[selectedLocation] || 0} {currentIng?.stockUnit}</span>
            </div>
            <span className="text-outline-variant/60">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface-variant">Total Company Stock:</span>
              <span className="font-semibold text-on-surface font-numeric-table">{currentIng?.currentStock} {currentIng?.stockUnit}</span>
            </div>
            <span className="text-outline-variant/60">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface-variant">Minimum Stock:</span>
              <span className="font-semibold text-on-surface">{currentIng?.minStock} {currentIng?.stockUnit}</span>
            </div>
            <span className="text-outline-variant/60">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface-variant">Current Cost:</span>
              <span className="font-semibold text-primary">{formatCurrency(currentIng?.unitCost)} / {currentIng?.stockUnit}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: QUANTITY RECEIVED */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md border border-outline-variant/30">
          <div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-container">
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary font-semibold text-label-md">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">2. Quantity Received</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Enter how much stock was received.</p>
            </div>
          </div>

          <div className="space-y-space-md">
            {/* Receipt Source radio */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface font-medium">Receipt Source <span className="text-error">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <label className={`flex items-start gap-space-sm p-space-sm rounded-lg cursor-pointer border transition-colors ${
                  receiptSource === 'Supplier Purchase' ? 'border-primary/40 bg-surface-container' : 'border-outline-variant/30 bg-surface-container-low'
                }`}>
                  <input
                    type="radio"
                    name="receipt-source"
                    value="Supplier Purchase"
                    checked={receiptSource === 'Supplier Purchase'}
                    onChange={() => setReceiptSource('Supplier Purchase')}
                    className="mt-0.5 text-primary focus:ring-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Supplier Purchase</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Stock received from an authorized vendor.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-space-sm p-space-sm rounded-lg cursor-pointer border transition-colors ${
                  receiptSource === 'Other Stock Receipt' ? 'border-primary/40 bg-surface-container' : 'border-outline-variant/30 bg-surface-container-low'
                }`}>
                  <input
                    type="radio"
                    name="receipt-source"
                    value="Other Stock Receipt"
                    checked={receiptSource === 'Other Stock Receipt'}
                    onChange={() => setReceiptSource('Other Stock Receipt')}
                    className="mt-0.5 text-primary focus:ring-0"
                  />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Other Stock Receipt</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Direct intake or emergency replenishment.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface font-medium">Receive As <span className="text-error">*</span></label>
                <select
                  value={receiveAs}
                  onChange={(e) => setReceiveAs(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40 shadow-sm cursor-pointer"
                >
                  <option value="package">{currentIng?.packageUnit || 'Bag'} ({currentIng?.packageSize || 10} {currentIng?.stockUnit})</option>
                  <option value="base">{currentIng?.stockUnit} (Base Stock Unit)</option>
                </select>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  1 {currentIng?.packageUnit || 'Package'} = {currentIng?.packageSize || 10} {currentIng?.stockUnit}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block font-label-md text-label-md text-on-surface font-medium">Quantity Received <span className="text-error">*</span></label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(e.target.value)}
                  className="w-full h-10 px-3 font-numeric-table rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40 shadow-sm text-right"
                />
                <p className="font-body-sm text-body-sm text-on-surface-variant">Physical verified amount received.</p>
              </div>

              {/* Calculated Stock Impact */}
              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Projected New Stock</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg font-bold text-on-surface font-numeric-table">
                    {projectedStock} {currentIng?.stockUnit}
                  </span>
                  <span className="font-label-sm text-tertiary-container font-semibold">
                    (+{addedBaseQty} {currentIng?.stockUnit})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${projectedBadge.dot}`}></span>
                  <span className="font-label-sm text-label-sm text-on-surface font-medium">New Status: {projectedStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: COSTING & SUPPLIER */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md border border-outline-variant/30">
          <div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-container">
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary font-semibold text-label-md">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">3. Cost & Valuation</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Verify purchase cost per stock unit.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface font-medium">Supplier</label>
              <input
                type="text"
                readOnly
                value={currentIng?.supplier || 'Fresh Foods Supplier'}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/40"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface font-medium">Unit Cost ({settings?.currency || 'PKR'} / {currentIng?.stockUnit})</label>
              <input
                type="number"
                min="0"
                step="any"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full h-10 px-3 font-numeric-table rounded-lg bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40 text-right"
              />
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low flex flex-col justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Receipt Value</span>
              <span className="font-headline-lg font-bold text-primary font-numeric-table">
                {formatCurrency(totalCost)}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {addedBaseQty} {currentIng?.stockUnit} × {formatCurrency(unitCost || currentIng?.unitCost)}
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="block font-label-md text-label-md text-on-surface font-medium">Batch / Delivery Notes (Optional)</label>
            <input
              type="text"
              value={batchNotes}
              onChange={(e) => setBatchNotes(e.target.value)}
              placeholder="e.g., Delivery Challan #DC-4891, temperature checked at 3°C"
              className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-space-sm pt-4">
          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="h-10 px-5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Receive Stock
          </button>
        </div>
      </form>
    </div>
  );
}
