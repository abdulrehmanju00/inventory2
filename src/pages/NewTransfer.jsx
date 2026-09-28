import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';

export default function NewTransfer({ onNavigate }) {
  const { ingredients, createTransfer, showToast, getLocationStock } = useAppStore();

  const [fromLoc, setFromLoc] = useState('Main Store');
  const [toLoc, setToLoc] = useState('Kitchen Prep');
  const [selectedIngredient, setSelectedIngredient] = useState(ingredients[0]?.name || 'Rice (Basmati)');
  const [transferQty, setTransferQty] = useState('5');
  const [transferItems, setTransferItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currentIng = ingredients.find(i => i.name === selectedIngredient) || ingredients[0];
  const availableSourceStock = currentIng ? (currentIng.locationBalances?.[fromLoc] || 0) : 0;
  const numQty = parseFloat(transferQty) || 0;

  const handleAddItem = () => {
    setErrorMessage('');
    if (!selectedIngredient || numQty <= 0) return;

    const currentTotalAdded = transferItems
      .filter(it => it.ingredientId === currentIng.id || it.name === selectedIngredient)
      .reduce((sum, it) => sum + (parseFloat(it.qty) || 0), 0);

    if (currentTotalAdded + numQty > availableSourceStock) {
      setErrorMessage(
        `Cannot add ${selectedIngredient}: Total requested across lines (${currentTotalAdded + numQty} ${currentIng?.stockUnit || ''}) exceeds available stock (${availableSourceStock} ${currentIng?.stockUnit || ''}) at ${fromLoc}.`
      );
      return;
    }

    const unit = currentIng ? currentIng.stockUnit : 'kg';
    setTransferItems(prev => [
      ...prev,
      {
        ingredientId: currentIng.id,
        name: selectedIngredient,
        qty: `${numQty} ${unit}`
      }
    ]);
    setTransferQty('5');
  };

  const handleRemoveItem = (index) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (fromLoc === toLoc) {
      const msg = 'Source and destination locations must be different.';
      setErrorMessage(msg);
      showToast(msg, 'warning');
      return;
    }
    if (transferItems.length === 0) {
      setErrorMessage('Please add at least one item to the transfer.');
      return;
    }

    // Validate aggregated items against source stock before submitting
    const aggregated = {};
    for (const item of transferItems) {
      const q = parseFloat(item.qty) || 0;
      aggregated[item.ingredientId] = (aggregated[item.ingredientId] || 0) + q;
    }
    for (const [ingId, totalReq] of Object.entries(aggregated)) {
      const available = getLocationStock(ingId, fromLoc);
      if (totalReq > available) {
        const ing = ingredients.find(i => i.id === ingId);
        const name = ing ? ing.name : 'Ingredient';
        const unit = ing ? ing.stockUnit : '';
        const msg = `Transfer rejected: Total requested for ${name} (${totalReq} ${unit}) exceeds available stock (${available} ${unit}) at ${fromLoc}.`;
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }
    }

    try {
      createTransfer({
        fromLocation: fromLoc,
        toLocation: toLoc,
        itemCount: transferItems.length,
        items: transferItems,
        notes
      });
      onNavigate('transfers');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('transfers')} className="hover:text-on-surface transition-colors cursor-pointer">Transfers</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">New Transfer</span>
      </nav>

      {/* HEADER */}
      <div className="mb-space-lg">
        <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
          New Internal Transfer
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Dispatch stock items between store rooms and kitchen stations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Source Location</label>
              <select
                value={fromLoc}
                onChange={(e) => setFromLoc(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Main Store">Main Store</option>
                <option value="Dry Store">Dry Store</option>
                <option value="Walk-in Cooler">Walk-in Cooler</option>
                <option value="Kitchen Prep">Kitchen Prep</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Destination Location</label>
              <select
                value={toLoc}
                onChange={(e) => setToLoc(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Walk-in Cooler">Walk-in Cooler</option>
                <option value="Kitchen Prep">Kitchen Prep</option>
                <option value="Dry Store">Dry Store</option>
                <option value="Main Store">Main Store</option>
              </select>
            </div>
          </div>

          {/* Transfer item picker */}
          <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 space-y-3">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Add Items To Transfer</span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-7 space-y-1">
                <label className="text-xs text-on-surface-variant font-medium">Select Ingredient</label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm border border-outline-variant/40"
                >
                  {ingredients.map(i => (
                    <option key={i.id} value={i.name}>{i.name} ({i.stockUnit})</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs text-on-surface-variant font-medium">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-numeric-table text-body-sm border border-outline-variant/40 text-right"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full h-9 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* List of items in transfer */}
            <div className="divide-y divide-outline-variant/20 pt-2">
              {transferItems.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-body-sm">
                  <span className="font-semibold text-on-surface">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-numeric-table text-on-surface font-medium">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-error hover:text-error/80"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-label-md text-label-md font-semibold text-on-surface">
              Transfer Reason / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Dinner prep replenishment"
              className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm border border-outline-variant/40"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('transfers')}
            className="h-10 px-5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            Dispatch Transfer
          </button>
        </div>
      </form>
    </div>
  );
}
