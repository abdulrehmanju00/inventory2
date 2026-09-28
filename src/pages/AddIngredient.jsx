import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';

export default function AddIngredient({ onNavigate }) {
  const { addIngredient, suppliers, settings } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    stockUnit: 'kg',
    recipeUnit: 'g',
    conversionRate: 1000,
    openingStock: '',
    minStock: '',
    location: '',
    preferredSupplierId: suppliers[0]?.id || 'SUP-1001',
    supplier: suppliers[0]?.name || 'Fresh Foods Supplier',
    packageUnit: 'Bag',
    packageSize: '',
    unitCost: '',
    shelfLifeDays: ''
  });

  const [errors, setErrors] = useState({});

  const handleStockUnitChange = (unit) => {
    let recipeU = 'g';
    let rate = 1000;
    if (unit === 'kg') { recipeU = 'g'; rate = 1000; }
    else if (unit === 'L') { recipeU = 'ml'; rate = 1000; }
    else if (unit === 'pcs') { recipeU = 'pcs'; rate = 1; }
    else if (unit === 'g') { recipeU = 'g'; rate = 1; }
    else if (unit === 'ml') { recipeU = 'ml'; rate = 1; }

    setFormData(prev => ({
      ...prev,
      stockUnit: unit,
      recipeUnit: recipeU,
      conversionRate: rate
    }));
  };

  const generateSku = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, sku: `SKU-${random}` }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Ingredient name is required.';
    if (!formData.category) newErrors.category = 'Please select a category.';
    if (!formData.minStock || Number(formData.minStock) < 0) newErrors.minStock = 'Enter a valid minimum stock level (≥ 0).';
    if (!formData.location) newErrors.location = 'Please choose a storage location.';
    if (!formData.unitCost || Number(formData.unitCost) < 0) newErrors.unitCost = 'Enter a valid cost per unit (≥ 0).';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addIngredient({
      name: formData.name.trim(),
      category: formData.category,
      sku: formData.sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stockUnit: formData.stockUnit,
      recipeUnit: formData.recipeUnit,
      conversionRate: Number(formData.conversionRate) || 1000,
      currentStock: Number(formData.openingStock) || 0,
      minStock: Number(formData.minStock) || 0,
      unitCost: Number(formData.unitCost) || 0,
      location: formData.location,
      preferredSupplierId: formData.preferredSupplierId || suppliers[0]?.id || 'SUP-1001',
      supplier: formData.supplier || 'Local Food Supplier',
      packageUnit: formData.packageUnit,
      packageSize: Number(formData.packageSize) || 1,
      shelfLifeDays: Number(formData.shelfLifeDays) || 7
    });

    onNavigate('inventory');
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-space-sm text-on-surface-variant font-label-md text-label-md">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface cursor-pointer transition-colors">
          Operations
        </span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('inventory')} className="hover:text-on-surface cursor-pointer transition-colors">
          Inventory
        </span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Add Ingredient</span>
      </nav>

      {/* Page Header */}
      <div className="mb-space-lg">
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-semibold">
          Add Ingredient
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Create an ingredient and configure how it is stocked, purchased, and used.
        </p>
      </div>

      {/* Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-space-lg p-space-md rounded-lg bg-error-container/70 text-on-error-container flex items-start gap-space-sm">
          <span className="material-symbols-outlined text-[20px] text-error shrink-0 mt-0.5">error</span>
          <div className="flex-1">
            <p className="font-label-md text-label-md font-semibold text-error">
              Unable to create ingredient. Please review the highlighted fields below.
            </p>
          </div>
          <button onClick={() => setErrors({})} type="button" className="text-on-error-container/70 hover:text-on-error-container">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Basic Information */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-6 sm:p-7 space-y-6 border border-outline-variant/30">
          <div className="border-b pb-4 border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">1. Basic Information</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Identify the ingredient in your inventory.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-1">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="ingredient-name">
                Ingredient Name <span className="text-error">*</span>
              </label>
              <input
                id="ingredient-name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="e.g., Chicken Breast"
                className={`w-full h-9 px-3 rounded-md bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 font-body-md text-body-md border focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                  errors.name ? 'border-error ring-1 ring-error' : 'border-outline-variant/40'
                }`}
              />
              {errors.name && <p className="text-error font-label-sm text-label-sm mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="category">
                Category <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (errors.category) setErrors({ ...errors, category: null });
                  }}
                  className={`w-full h-9 px-3 pr-8 rounded-md bg-surface-container-lowest text-on-surface font-body-md text-body-md appearance-none border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all ${
                    errors.category ? 'border-error' : 'border-outline-variant/40'
                  }`}
                >
                  <option value="">Select Category</option>
                  <option value="Proteins">Proteins</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Dry Goods">Dry Goods</option>
                  <option value="Produce">Produce</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Packaging">Packaging</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>
              {errors.category && <p className="text-error font-label-sm text-label-sm mt-1">{errors.category}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="sku">
                  SKU / Item Code <span className="font-normal text-on-surface-variant text-label-sm">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={generateSku}
                  className="font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">autorenew</span> Generate automatically
                </button>
              </div>
              <input
                id="sku"
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., SKU-9021"
                className="w-full md:w-1/2 h-9 px-3 rounded-md bg-surface-container-lowest text-on-surface font-mono text-body-sm border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Internal reference code for inventory counting and tagging.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Units & Consumption */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-6 sm:p-7 space-y-6 border border-outline-variant/30">
          <div className="border-b pb-4 border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">2. Units & Consumption</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Define how this ingredient is measured in inventory and recipes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="stock-unit">
                Stock Unit <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  id="stock-unit"
                  value={formData.stockUnit}
                  onChange={(e) => handleStockUnitChange(e.target.value)}
                  className="w-full h-9 px-3 pr-8 rounded-md bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/40 appearance-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="g">g (Grams)</option>
                  <option value="L">L (Liters)</option>
                  <option value="ml">ml (Milliliters)</option>
                  <option value="pcs">pcs (Pieces)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Main inventory measurement unit used in reports.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="recipe-unit">
                Recipe / Usage Unit <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  id="recipe-unit"
                  value={formData.recipeUnit}
                  onChange={(e) => setFormData({ ...formData, recipeUnit: e.target.value })}
                  className="w-full h-9 px-3 pr-8 rounded-md bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/40 appearance-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
                >
                  <option value="g">g (Grams)</option>
                  <option value="kg">kg (Kilograms)</option>
                  <option value="ml">ml (Milliliters)</option>
                  <option value="L">L (Liters)</option>
                  <option value="pcs">pcs (Pieces)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Unit selected by kitchen team when assembling recipes.</p>
            </div>

            <div className="md:col-span-2">
              <div className="p-3 rounded-lg bg-surface-container-low text-on-surface flex items-center gap-2.5 transition-all">
                <span className="material-symbols-outlined text-primary text-[20px]">sync_alt</span>
                <span className="font-label-md text-label-md">
                  Conversion: 1 {formData.stockUnit} = {formData.conversionRate} {formData.recipeUnit} (Standard recipe conversion applied automatically)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Stock Settings */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-6 sm:p-7 space-y-6 border border-outline-variant/30">
          <div className="border-b pb-4 border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">3. Stock Settings</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Set opening stock and reorder alert thresholds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="opening-stock">
                Opening Stock
              </label>
              <div className="relative flex items-center">
                <input
                  id="opening-stock"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.openingStock}
                  onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                  placeholder="0"
                  className="w-full h-9 pl-3 pr-14 rounded-md bg-surface-container-lowest text-on-surface font-numeric-table text-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                />
                <span className="absolute right-2 px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm pointer-events-none">
                  {formData.stockUnit}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Initial count in branch store.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="min-stock">
                Minimum Stock Level <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="min-stock"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.minStock}
                  onChange={(e) => {
                    setFormData({ ...formData, minStock: e.target.value });
                    if (errors.minStock) setErrors({ ...errors, minStock: null });
                  }}
                  placeholder="e.g., 10"
                  className={`w-full h-9 pl-3 pr-14 rounded-md bg-surface-container-lowest text-on-surface font-numeric-table text-body-md border focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right ${
                    errors.minStock ? 'border-error' : 'border-outline-variant/40'
                  }`}
                />
                <span className="absolute right-2 px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm pointer-events-none">
                  {formData.stockUnit}
                </span>
              </div>
              {errors.minStock && <p className="text-error font-label-sm text-label-sm mt-1">{errors.minStock}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="storage-location">
                Storage Location <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  id="storage-location"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    if (errors.location) setErrors({ ...errors, location: null });
                  }}
                  className={`w-full h-9 px-3 pr-8 rounded-md bg-surface-container-lowest text-on-surface font-body-md text-body-md border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all ${
                    errors.location ? 'border-error' : 'border-outline-variant/40'
                  }`}
                >
                  <option value="">Select Location</option>
                  <option value="Main Store">Main Store</option>
                  <option value="Walk-in Cooler">Walk-in Cooler</option>
                  <option value="Dry Store">Dry Store</option>
                  <option value="Kitchen Prep">Kitchen Prep</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>
              {errors.location && <p className="text-error font-label-sm text-label-sm mt-1">{errors.location}</p>}
            </div>
          </div>
        </section>

        {/* SECTION 4: Purchasing & Costing */}
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-6 sm:p-7 space-y-6 border border-outline-variant/30">
          <div className="border-b pb-4 border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">4. Purchasing & Costing</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Default supplier and costing information.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="supplier">
                Preferred Supplier
              </label>
              <div className="relative">
                <select
                  id="supplier"
                  value={formData.preferredSupplierId || suppliers[0]?.id}
                  onChange={(e) => {
                    const supId = e.target.value;
                    const matched = suppliers.find(s => s.id === supId);
                    setFormData({
                      ...formData,
                      preferredSupplierId: supId,
                      supplier: matched ? matched.name : ''
                    });
                  }}
                  className="w-full h-9 px-3 pr-8 rounded-md bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="unit-cost">
                Cost Per Stock Unit ({settings?.currency || 'PKR'}) <span className="text-error">*</span>
              </label>
              <input
                id="unit-cost"
                type="number"
                min="0"
                step="any"
                value={formData.unitCost}
                onChange={(e) => {
                  setFormData({ ...formData, unitCost: e.target.value });
                  if (errors.unitCost) setErrors({ ...errors, unitCost: null });
                }}
                placeholder="e.g., 920"
                className={`w-full h-9 px-3 rounded-md bg-surface-container-lowest text-on-surface font-numeric-table text-body-md border focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right ${
                  errors.unitCost ? 'border-error' : 'border-outline-variant/40'
                }`}
              />
              {errors.unitCost && <p className="text-error font-label-sm text-label-sm mt-1">{errors.unitCost}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-medium text-on-surface" htmlFor="shelf-life">
                Shelf Life (Days)
              </label>
              <input
                id="shelf-life"
                type="number"
                min="1"
                value={formData.shelfLifeDays}
                onChange={(e) => setFormData({ ...formData, shelfLifeDays: e.target.value })}
                placeholder="e.g., 5"
                className="w-full h-9 px-3 rounded-md bg-surface-container-lowest text-on-surface font-numeric-table text-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-right"
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant">Recommended max storage time.</p>
            </div>
          </div>
        </section>

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
            className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-medium transition-colors shadow-sm"
          >
            Create Ingredient
          </button>
        </div>
      </form>
    </div>
  );
}
