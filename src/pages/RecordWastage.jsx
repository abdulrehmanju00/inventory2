import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';

export default function RecordWastage({ onNavigate }) {
  const { currentBranch, currentUser, ingredients, recordWastage, formatCurrency } = useAppStore();

  const [selectedIngredientId, setSelectedIngredientId] = useState(ingredients[0]?.id || '');
  const [quantity, setQuantity] = useState('0.8');
  const [reason, setReason] = useState('Expired prep batch');
  const [location, setLocation] = useState('Walk-in Cooler');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const ing = ingredients.find(i => i.id === selectedIngredientId) || ingredients[0];
  const numQty = parseFloat(quantity) || 0;
  const currentLocStock = ing?.locationBalances?.[location] || 0;
  const isOverStock = numQty > currentLocStock;
  const calculatedCost = ing ? numQty * ing.unitCost : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!ing || numQty <= 0) return;

    if (numQty > currentLocStock) {
      setFormError(`Insufficient stock at ${location}. Available: ${currentLocStock} ${ing.stockUnit}, requested: ${numQty} ${ing.stockUnit}. Cannot record wastage exceeding available location stock.`);
      return;
    }

    try {
      recordWastage({
        ingredientId: ing.id,
        ingredientName: ing.name,
        quantity: numQty,
        unit: ing.stockUnit,
        reason,
        category: ing.category,
        cost: calculatedCost,
        location,
        notes
      });

      onNavigate('wastage');
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('wastage')} className="hover:text-on-surface transition-colors cursor-pointer">Wastage</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Record Wastage</span>
      </nav>

      {/* HEADER */}
      <div className="mb-space-lg">
        <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
          Record Wastage
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Log food spoilage, expired batches, or preparation errors for {currentBranch}.
        </p>
      </div>

      {formError && (
        <div className="mb-space-md p-4 rounded-xl bg-error-container text-on-error-container flex items-start gap-3 border border-error/30">
          <span className="material-symbols-outlined text-[20px] text-error mt-0.5">error</span>
          <div className="flex-1 text-body-sm font-medium">{formError}</div>
          <button onClick={() => setFormError('')} type="button" className="text-on-error-container/70 hover:text-on-error-container">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-6">
          {/* Ingredient select */}
          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="waste-ingredient">
              Ingredient Discarded <span className="text-error">*</span>
            </label>
            <select
              id="waste-ingredient"
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {ingredients.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} (Total Stock: {i.currentStock} {i.stockUnit} · {formatCurrency(i.unitCost)}/{i.stockUnit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="waste-qty">
                Discarded Quantity <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="waste-qty"
                  type="number"
                  min="0.1"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full h-10 pl-3 pr-14 rounded-lg bg-surface-container-lowest text-on-surface font-numeric-table border ${
                    isOverStock ? 'border-error focus:ring-error' : 'border-outline-variant/40 focus:ring-primary'
                  } focus:outline-none focus:ring-1 text-right`}
                />
                <span className="absolute right-3 text-xs font-semibold text-on-surface-variant pointer-events-none">
                  {ing?.stockUnit}
                </span>
              </div>
              {isOverStock && (
                <span className="text-xs text-error font-medium block">
                  Exceeds available stock at {location} ({currentLocStock} {ing?.stockUnit})
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="waste-loc">
                Discarded From Location <span className="text-error">*</span>
              </label>
              <select
                id="waste-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Walk-in Cooler">Walk-in Cooler ({ing?.locationBalances?.['Walk-in Cooler'] || 0} {ing?.stockUnit} available)</option>
                <option value="Main Store">Main Store ({ing?.locationBalances?.['Main Store'] || 0} {ing?.stockUnit} available)</option>
                <option value="Dry Store">Dry Store ({ing?.locationBalances?.['Dry Store'] || 0} {ing?.stockUnit} available)</option>
                <option value="Kitchen Prep">Kitchen Prep ({ing?.locationBalances?.['Kitchen Prep'] || 0} {ing?.stockUnit} available)</option>
              </select>
            </div>
          </div>

          {/* Reason selection */}
          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="waste-reason">
              Root Cause / Reason <span className="text-error">*</span>
            </label>
            <select
              id="waste-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="Expired prep batch">Expired prep batch (passed shelf life)</option>
              <option value="Deep frying burn / overheated">Deep frying burn / overheated</option>
              <option value="Spoiled in crate on delivery">Spoiled in crate on delivery / damaged</option>
              <option value="Curdled / temperature fault">Curdled / chiller temperature fault</option>
              <option value="Dropped / contamination">Dropped / contaminated on prep table</option>
              <option value="Customer return / mistake">Customer complaint / order error</option>
            </select>
          </div>

          {/* Cost impact calculation card */}
          <div className="p-4 rounded-xl bg-error-container/20 border border-error/20 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-error font-semibold">Financial Loss Calculation</span>
              <span className="text-body-sm text-on-surface">
                {quantity} {ing?.stockUnit} × {formatCurrency(ing?.unitCost)}
              </span>
            </div>
            <span className="font-headline-xl font-bold text-error font-numeric-table">
              {formatCurrency(calculatedCost)}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="waste-notes">
              Incident Notes & Corrective Action
            </label>
            <textarea
              id="waste-notes"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Oil sensor recalibrated by maintenance team."
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('wastage')}
            className="h-10 px-5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-error hover:bg-error/90 text-white font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Record Wastage & Deduct Stock
          </button>
        </div>
      </form>
    </div>
  );
}
