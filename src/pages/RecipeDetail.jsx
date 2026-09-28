import React from 'react';
import { useAppStore } from '../store/AppStore';

export default function RecipeDetail({ onNavigate }) {
  const { recipes, selectedRecipeId, formatCurrency, formatRecipeCost } = useAppStore();

  const recipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0] || {
    id: "rcp-1",
    name: "Grilled Chicken Burger",
    category: "Burgers",
    prepTime: "15 min",
    cost: 420,
    price: 950,
    margin: 55.8,
    status: "Active",
    yield: "10 Portions",
    yieldPortions: 10,
    ingredients: [
      { name: "Chicken Breast", quantity: "200 g", cost: 184 },
      { name: "Burger Buns", quantity: "1 pcs", cost: 45 },
      { name: "Mozzarella Cheese", quantity: "40 g", cost: 50 },
      { name: "Cooking Oil", quantity: "20 ml", cost: 8 },
      { name: "Tomatoes", quantity: "50 g", cost: 7 },
      { name: "Packaging Box", quantity: "1 pcs", cost: 22 }
    ]
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-16">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span onClick={() => onNavigate('recipes')} className="hover:text-on-surface transition-colors cursor-pointer">Recipes</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">{recipe.name}</span>
      </nav>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface">
              {recipe.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {recipe.status}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {recipe.category} · Yield: {recipe.yield || (recipe.yieldPortions ? `${recipe.yieldPortions} Portions` : '10 Portions')} · Standard Kitchen Prep: {recipe.prepTime}
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => onNavigate('record-production')}
            className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md font-medium transition-colors shadow-sm flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">skillet</span>
            <span>Record Batch Production</span>
          </button>
          <button
            onClick={() => onNavigate('recipes')}
            className="h-10 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors"
            type="button"
          >
            Back
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Standard Cost / Portion</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1 font-numeric-table">
            {formatRecipeCost(recipe.cost)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Sum of ingredients</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Menu Retail Price</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1 font-numeric-table">
            {formatCurrency(recipe.price)}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Dine-in & Takeaway</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Gross Profit Margin</span>
          <span className="font-headline-xl font-bold text-tertiary-container mt-1 font-numeric-table">
            {recipe.margin}%
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Target &gt; 50%</span>
        </div>
      </div>

      {/* INGREDIENTS RECIPE CARD */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="font-headline-md font-semibold text-on-surface">Standard Recipe Ingredients</h2>
          <span className="text-xs text-on-surface-variant">{recipe.ingredients?.length || 0} ingredients</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase text-xs tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Ingredient Component</th>
                <th className="py-2.5 px-4 font-semibold text-right">Standard Portion Quantity</th>
                <th className="py-2.5 px-4 font-semibold text-right">Portion Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {(recipe.ingredients || []).map((it, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-semibold text-on-surface">{it.name}</td>
                  <td className="py-3 px-4 text-right font-numeric-table font-medium text-on-surface">{it.quantity}</td>
                  <td className="py-3 px-4 text-right font-numeric-table font-semibold text-on-surface">
                    {formatRecipeCost(it.portionCost || it.cost)}
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
