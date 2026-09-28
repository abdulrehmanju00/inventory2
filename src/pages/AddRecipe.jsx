import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { calculateRecipeIngredientCost } from '../utils/units';

export default function AddRecipe({ onNavigate }) {
  const { ingredients, addRecipe, formatCurrency, formatRecipeCost } = useAppStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Burgers');
  const [prepTime, setPrepTime] = useState('15 min');
  const [yieldPortions, setYieldPortions] = useState('10');
  const [price, setPrice] = useState('950');

  const [recipeIngredients, setRecipeIngredients] = useState([
    { ingredientId: 'ing-1', name: 'Chicken Breast', quantity: '200 g', quantityPerPortion: 200, unit: 'g', cost: 184 },
    { ingredientId: 'ing-8', name: 'Burger Buns', quantity: '1 pcs', quantityPerPortion: 1, unit: 'pcs', cost: 45 }
  ]);

  const [selectedIng, setSelectedIng] = useState(ingredients[0]?.name || 'Chicken Breast');
  const [portionQty, setPortionQty] = useState('50');
  const [portionUnit, setPortionUnit] = useState('g');

  const computedCost = recipeIngredients.reduce((acc, it) => acc + (it.cost || 0), 0);
  const marginPct = Number(price) > 0 ? Math.round(((Number(price) - computedCost) / Number(price)) * 1000) / 10 : 0;

  const handleAddIngredient = () => {
    const matched = ingredients.find(i => i.name === selectedIng);
    const estCost = matched ? calculateRecipeIngredientCost(portionQty, portionUnit, matched) : 0;

    setRecipeIngredients([
      ...recipeIngredients,
      {
        ingredientId: matched ? matched.id : `ing-${Date.now()}`,
        name: selectedIng,
        quantity: `${portionQty} ${portionUnit}`,
        quantityPerPortion: Number(portionQty) || 0,
        unit: portionUnit,
        cost: estCost
      }
    ]);
  };

  const handleRemove = (index) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const yieldNum = Number(yieldPortions) || 10;

    addRecipe({
      name,
      category,
      prepTime,
      yieldPortions: yieldNum,
      yield: `${yieldNum} Portions`,
      cost: computedCost,
      price: Number(price) || 0,
      margin: marginPct,
      ingredients: recipeIngredients
    });

    onNavigate('recipes');
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('recipes')} className="hover:text-on-surface transition-colors cursor-pointer">Recipes</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Add Recipe</span>
      </nav>

      {/* HEADER */}
      <div className="mb-space-lg">
        <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
          Add Recipe Card
        </h1>
        <p className="font-body-lg text-body-lg text-secondary">
          Standardize food recipe portions and calculate production costs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Dish / Recipe Name <span className="text-error">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Crispy Chicken Burger"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Burgers">Burgers</option>
                <option value="Pizza">Pizza</option>
                <option value="Pasta">Pasta</option>
                <option value="Sides">Sides</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Prep Time</label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="e.g., 15 min"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Yield (Portions) <span className="text-error">*</span></label>
              <input
                type="number"
                min="1"
                required
                value={yieldPortions}
                onChange={(e) => setYieldPortions(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-numeric-table border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary text-center"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md font-semibold text-on-surface">Selling Menu Price <span className="text-error">*</span></label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-numeric-table border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-primary text-right"
              />
            </div>
          </div>

          {/* Portion Ingredients builder */}
          <div className="p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 space-y-3">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Standard Ingredients Portioning</span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6 space-y-1">
                <label className="text-xs text-on-surface-variant font-medium">Ingredient</label>
                <select
                  value={selectedIng}
                  onChange={(e) => setSelectedIng(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm border border-outline-variant/40"
                >
                  {ingredients.map(i => (
                    <option key={i.id} value={i.name}>{i.name} ({formatCurrency(i.unitCost)}/{i.stockUnit})</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-on-surface-variant font-medium">Qty</label>
                <input
                  type="number"
                  value={portionQty}
                  onChange={(e) => setPortionQty(e.target.value)}
                  className="w-full h-9 px-2 text-center rounded-lg bg-surface-container-lowest text-on-surface font-numeric-table text-body-sm border border-outline-variant/40"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-on-surface-variant font-medium">Unit</label>
                <select
                  value={portionUnit}
                  onChange={(e) => setPortionUnit(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm border border-outline-variant/40"
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full h-9 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-outline-variant/20 pt-2 font-body-sm">
              {recipeIngredients.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-on-surface">{item.name} ({item.quantity})</span>
                  <div className="flex items-center gap-3">
                    <span className="font-numeric-table font-semibold text-on-surface">{formatRecipeCost(item.cost)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="text-error hover:text-error/80"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center text-sm font-semibold">
              <span>Total Food Cost per Portion:</span>
              <span className="font-headline-md text-primary font-numeric-table">{formatRecipeCost(computedCost)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>Gross Profit Margin:</span>
              <span className="font-bold text-tertiary-container">{marginPct}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('recipes')}
            className="h-10 px-5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            Save Recipe Card
          </button>
        </div>
      </form>
    </div>
  );
}
