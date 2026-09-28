import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';
import { convertUnits } from '../utils/units';

export default function RecordProduction({ onNavigate }) {
  const { currentBranch, currentUser, recipes, ingredients, productions, recordProduction, formatCurrency, getLocalDateKey, formatDate, getLocalTime, settings } = useAppStore();

  const [batchId, setBatchId] = useState('PB-1025');
  const [station, setStation] = useState('Fryer Station');
  const [plannedQty, setPlannedQty] = useState('100');
  const [actualOutput, setActualOutput] = useState('95');
  const [wastageQty, setWastageQty] = useState('5');
  const [location, setLocation] = useState('Kitchen Prep');
  const [qualityResult, setQualityResult] = useState('Pass');
  const [qualityNotes, setQualityNotes] = useState('');
  const [completedBy, setCompletedBy] = useState('Ahmed Raza');
  const [completedRole] = useState('General Manager');
  const [completionDate, setCompletionDate] = useState(() => getLocalDateKey ? getLocalDateKey(new Date(), settings?.timezone) : '2026-09-28');
  const [completionTime, setCompletionTime] = useState(
    () => getLocalTime(new Date())
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Canonical Recipe: RCP-1026 Chicken Zinger Burger
  const selectedRecipe = recipes.find(r => r.id === 'RCP-1026' || r.name === 'Chicken Zinger Burger') || recipes[0] || {
    id: 'RCP-1026',
    name: 'Chicken Zinger Burger',
    ingredients: []
  };

  const plannedNum = parseFloat(plannedQty) || 0;
  const actualNum = parseFloat(actualOutput) || 0;
  const wasteNum = parseFloat(wastageQty) || 0;

  // Formulas specified:
  // Unaccounted Quantity: 100 - Actual Produced - Production Wastage
  const unaccountedQty = Math.round((plannedNum - actualNum - wasteNum) * 1000) / 1000;
  // Yield %: Actual Produced / 100 × 100
  const yieldPct = plannedNum > 0 ? Math.round((actualNum / plannedNum) * 1000) / 10 : 0;

  // Finalization allowed only when: Actual Produced + Production Wastage = 100
  const isBalanced = unaccountedQty === 0 && (actualNum + wasteNum === plannedNum);

  // Check if batch is already completed in store
  const existingBatch = productions.find(p => p.id === batchId.trim());
  const isAlreadyCompleted = existingBatch?.status === 'Completed';

  // Planned ingredient requirements calculation - aggregates duplicate recipe ingredients
  const plannedRequirements = useMemo(() => {
    const aggregated = {};
    for (const formulaIng of (selectedRecipe.ingredients || [])) {
      const rawIng = ingredients.find(i => (formulaIng.ingredientId && i.id === formulaIng.ingredientId) || i.name.toLowerCase() === formulaIng.name.toLowerCase());
      const unit = formulaIng.unit || rawIng?.stockUnit || 'g';
      let qtyPerPortion = Number(formulaIng.quantityPerPortion);
      if (isNaN(qtyPerPortion) || qtyPerPortion <= 0) {
        qtyPerPortion = parseFloat(String(formulaIng.quantity || '0').split(/\s+/)[0]) || 0;
      }

      const totalInRecipeUnit = qtyPerPortion * plannedNum;
      const baseUnit = rawIng?.stockUnit || unit;
      let lineInBaseUnit = totalInRecipeUnit;
      try {
        lineInBaseUnit = convertUnits(totalInRecipeUnit, unit, baseUnit);
      } catch {
        lineInBaseUnit = totalInRecipeUnit;
      }

      const key = rawIng?.id || formulaIng.ingredientId || formulaIng.name.toLowerCase();
      if (!aggregated[key]) {
        aggregated[key] = {
          name: rawIng?.name || formulaIng.name,
          sku: rawIng?.sku || 'SKU-0000',
          baseUnit,
          totalInBaseUnit: 0,
          availableStock: rawIng?.currentStock || 0,
          portionParts: []
        };
      }
      aggregated[key].totalInBaseUnit += lineInBaseUnit;
      aggregated[key].portionParts.push(`${qtyPerPortion} ${unit}`);
    }

    return Object.values(aggregated).map(item => ({
      ...item,
      totalInBaseUnit: Math.round(item.totalInBaseUnit * 1000) / 1000,
      qtyPerPortion: item.portionParts.join(' + ')
    }));
  }, [selectedRecipe, ingredients, plannedNum]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isAlreadyCompleted) {
      setErrorMsg(`Batch ${batchId} has already been completed. Second finalization is disabled.`);
      return;
    }

    if (plannedNum <= 0) {
      setErrorMsg('Planned quantity must be greater than zero.');
      return;
    }

    // Finalization allowed only when: Actual Produced + Production Wastage = planned
    if (!isBalanced) {
      setErrorMsg(
        `Finalization rejected: Actual Produced (${actualNum}) + Production Wastage (${wasteNum}) = ${actualNum + wasteNum}. Must exactly equal Planned Quantity (${plannedNum}). Unaccounted quantity is ${unaccountedQty}.`
      );
      return;
    }

    // If Needs Review: require quality notes
    if (qualityResult === 'Needs Review' && !qualityNotes.trim()) {
      setErrorMsg('Quality notes are required when Quality Result is set to "Needs Review".');
      return;
    }

    try {
      recordProduction({
        id: batchId.trim() || 'PB-1025',
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.name,
        station,
        plannedQuantity: plannedNum,
        actualOutput: actualNum,
        productionWastage: wasteNum,
        unaccountedQuantity: unaccountedQty,
        yieldPct,
        location,
        producedBy: `${completedBy} (${completedRole})`,
        qualityResult,
        qualityNotes,
        completionDate,
        completionTime,
        estimatedBatchCost: 35000,
        notes
      });
      onNavigate('production');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('production')} className="hover:text-on-surface transition-colors cursor-pointer">Production</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">{batchId}</span>
      </nav>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight">
              Batch: {batchId}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isAlreadyCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {isAlreadyCompleted ? 'Completed' : 'In Progress'}
            </span>
          </div>
          <p className="font-body-lg text-body-lg text-secondary">
            Kitchen production batch finalization and raw ingredient reconciliation.
          </p>
        </div>

        <div className="text-right sm:text-left bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold block">Estimated Batch Cost</span>
          <span className="font-headline-md font-bold text-on-surface font-numeric-table">
            {formatCurrency(35000)}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-space-md p-4 rounded-xl bg-error-container/80 text-on-error-container flex items-start gap-3 border border-error/30">
          <span className="material-symbols-outlined text-[20px] text-error mt-0.5">error</span>
          <div className="flex-1 text-body-sm font-medium">{errorMsg}</div>
          <button onClick={() => setErrorMsg('')} type="button" className="text-on-error-container/70 hover:text-on-error-container">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {isAlreadyCompleted && (
        <div className="mb-space-md p-4 rounded-xl bg-emerald-50 text-emerald-900 flex items-start gap-3 border border-emerald-300">
          <span className="material-symbols-outlined text-[20px] text-emerald-600 mt-0.5">check_circle</span>
          <div className="flex-1 text-body-sm font-medium">
            Batch {batchId} has already been completed and finalized. Raw ingredients have been consumed. Duplicate finalization is rejected.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: BATCH & PRODUCT CONTEXT */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
          <h2 className="font-headline-md font-semibold text-on-surface pb-2 border-b border-outline-variant/20 flex items-center justify-between">
            <span>Batch Metadata & Station</span>
            <span className="text-xs font-mono text-primary font-normal">Recipe: {selectedRecipe.id}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">Batch ID</span>
              <input
                type="text"
                readOnly
                value={batchId}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low font-mono font-semibold text-on-surface border border-outline-variant/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">Product / Recipe</span>
              <input
                type="text"
                readOnly
                value="Chicken Zinger Burger"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low font-semibold text-on-surface border border-outline-variant/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">Branch</span>
              <input
                type="text"
                readOnly
                value={currentBranch}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">Station</span>
              <input
                type="text"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant/40 focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">Planned Quantity</span>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-numeric-table font-bold border border-outline-variant/40 focus:ring-1 focus:ring-primary text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">pcs</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">Destination</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant/40 focus:ring-1 focus:ring-primary"
              >
                <option value="Kitchen Prep">Kitchen Prep Station</option>
                <option value="Walk-in Cooler">Walk-in Cooler</option>
                <option value="Main Store">Main Store</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCTION QUANTITY INPUT & RECONCILIATION */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <h2 className="font-headline-md font-semibold text-on-surface">
              Input & Output Reconciliation
            </h2>
            <span className="text-xs font-mono text-on-surface-variant">
              Actual Produced + Wastage = 100
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-tertiary-container block uppercase tracking-wider">
                Actual Produced <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  disabled={isAlreadyCompleted}
                  value={actualOutput}
                  onChange={(e) => setActualOutput(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-numeric-table font-bold border border-outline-variant/40 focus:ring-1 focus:ring-primary text-right disabled:opacity-60"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">pcs</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-error block uppercase tracking-wider">
                Production Wastage <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  disabled={isAlreadyCompleted}
                  value={wastageQty}
                  onChange={(e) => setWastageQty(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-numeric-table font-bold border border-outline-variant/40 focus:ring-1 focus:ring-primary text-right disabled:opacity-60"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">pcs</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                Unaccounted Quantity
              </span>
              <div className={`w-full h-10 px-3 rounded-lg flex items-center justify-between font-numeric-table font-bold border ${
                unaccountedQty === 0
                  ? 'bg-surface-container-low text-tertiary-container border-emerald-200'
                  : 'bg-error-container text-on-error-container border-error/30'
              }`}>
                <span>{unaccountedQty}</span>
                <span className="text-xs font-normal">pcs</span>
              </div>
              <span className="text-[11px] text-on-surface-variant block">Formula: 100 - Actual - Wastage</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                Yield %
              </span>
              <div className="w-full h-10 px-3 rounded-lg bg-surface-container-low flex items-center justify-between font-numeric-table font-bold text-on-surface border border-outline-variant/30">
                <span>{yieldPct}%</span>
                <span className="text-xs font-normal text-on-surface-variant">efficiency</span>
              </div>
              <span className="text-[11px] text-on-surface-variant block">Formula: Actual / 100 × 100</span>
            </div>
          </div>

          <div className={`p-3 rounded-lg flex items-center justify-between text-xs font-semibold ${
            isBalanced
              ? 'bg-emerald-50 text-tertiary-container border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                {isBalanced ? 'check_circle' : 'warning'}
              </span>
              <span>
                {isBalanced
                  ? `Balanced: ${actualNum} (Produced) + ${wasteNum} (Wastage) = ${plannedNum} (Planned). Finalization allowed.`
                  : `Unbalanced: ${actualNum} + ${wasteNum} = ${actualNum + wasteNum} (Must equal 100). Finalization disabled until balanced.`
                }
              </span>
            </div>
            {!isAlreadyCompleted && (
              <button
                type="button"
                onClick={() => setWastageQty(String(Math.max(0, plannedNum - actualNum)))}
                className="underline hover:no-underline cursor-pointer"
              >
                Auto-balance
              </button>
            )}
          </div>
        </div>

        {/* SECTION 3: QUALITY RESULT & NOTES */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
          <h2 className="font-headline-md font-semibold text-on-surface pb-2 border-b border-outline-variant/20">
            Quality Inspection
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                Quality Result <span className="text-error">*</span>
              </label>
              <div className="flex items-center gap-3">
                <label className={`flex-1 p-3 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                  qualityResult === 'Pass' ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface'
                }`}>
                  <input
                    type="radio"
                    name="quality"
                    value="Pass"
                    checked={qualityResult === 'Pass'}
                    onChange={() => setQualityResult('Pass')}
                    className="text-primary focus:ring-0"
                  />
                  <span>Pass</span>
                </label>

                <label className={`flex-1 p-3 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                  qualityResult === 'Needs Review' ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold' : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface'
                }`}>
                  <input
                    type="radio"
                    name="quality"
                    value="Needs Review"
                    checked={qualityResult === 'Needs Review'}
                    onChange={() => setQualityResult('Needs Review')}
                    className="text-amber-600 focus:ring-0"
                  />
                  <span>Needs Review</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                Quality Notes {qualityResult === 'Needs Review' && <span className="text-error">(Required for review)</span>}
              </label>
              <input
                type="text"
                value={qualityNotes}
                onChange={(e) => setQualityNotes(e.target.value)}
                placeholder={qualityResult === 'Needs Review' ? 'Specify defect or check reasons...' : 'Optional quality observation'}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant/40 focus:ring-1 focus:ring-primary text-body-sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PLANNED INGREDIENT REQUIREMENTS (VISIBLE) */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <h2 className="font-headline-md font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
              Planned Ingredient Requirements
            </h2>
            <span className="text-xs font-mono text-on-surface-variant">Recipe Reference: RCP-1026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-xs text-on-surface-variant uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Ingredient</th>
                  <th className="py-2.5 px-3 font-semibold">SKU</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Per Portion</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Batch Requirement (100 pcs)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Available Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {plannedRequirements.map((req, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/40">
                    <td className="py-2.5 px-3 font-semibold text-on-surface">{req.name}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-on-surface-variant">{req.sku}</td>
                    <td className="py-2.5 px-3 text-right font-numeric-table">{req.qtyPerPortion} {req.portionUnit}</td>
                    <td className="py-2.5 px-3 text-right font-numeric-table font-bold text-primary">
                      {req.totalInBaseUnit} {req.baseUnit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-numeric-table text-on-surface-variant">
                      {req.availableStock} {req.baseUnit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 5: COMPLETION DETAILS */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
          <h2 className="font-headline-md font-semibold text-on-surface pb-2 border-b border-outline-variant/20">
            Completion Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                Completed By
              </label>
              <input
                type="text"
                value={`${completedBy} · ${completedRole}`}
                readOnly
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-medium border border-outline-variant/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                Completion Date
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant/40 focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
                Completion Time
              </label>
              <input
                type="time"
                value={completionTime}
                onChange={(e) => setCompletionTime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant/40 focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider">
              Optional Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fryer temperature 175°C calibrated. Crispy texture standard met."
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm border border-outline-variant/40 focus:ring-1 focus:ring-primary"
            ></textarea>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('production')}
            className="h-10 px-5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md transition-colors cursor-pointer"
          >
            Back to List
          </button>
          <button
            type="submit"
            disabled={!isBalanced || isAlreadyCompleted}
            className={`h-10 px-6 rounded-lg font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5 ${
              isBalanced && !isAlreadyCompleted
                ? 'bg-primary hover:bg-primary/90 text-on-primary cursor-pointer'
                : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Finalize Production & Deduct Ingredients
          </button>
        </div>
      </form>
    </div>
  );
}
