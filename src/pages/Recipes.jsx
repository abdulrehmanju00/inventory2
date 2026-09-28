import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import { exportToCsv } from '../utils/csv';

export default function Recipes({ onNavigate }) {
  const { currentBranch, recipes, setSelectedRecipeId, formatCurrency, formatRecipeCost, showToast, settings } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = recipes.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = [
      'Recipe ID',
      'Recipe Name',
      'Category',
      'Prep Time',
      'Yield Portions',
      `Estimated Cost (${settings?.currency || 'PKR'})`,
      `Selling Price (${settings?.currency || 'PKR'})`,
      'Margin (%)',
      'Ingredients Count',
      'Ingredients Summary'
    ];
    const rows = recipes.map(r => [
      r.id,
      r.name,
      r.category,
      r.prepTime,
      r.yieldPortions || 1,
      r.cost || 0,
      r.price || 0,
      r.margin ? `${r.margin}%` : '',
      r.ingredients ? r.ingredients.length : 0,
      (r.ingredients || []).map(i => `${i.name} (${i.portionQuantity || i.quantity || ''})`).join('; ')
    ]);
    exportToCsv('recipes.csv', headers, rows);
    showToast('Recipe catalog exported to recipes.csv', 'success');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Operations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Recipes</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
            Recipes & Formulas
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Standardized menu formulas, ingredient usage, and margin analysis for {currentBranch}.
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
            onClick={() => onNavigate('add-recipe')}
            className="flex items-center gap-space-xs px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm transition-all font-label-md font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Recipe</span>
          </button>
        </div>
      </div>

      {/* RECIPES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filteredRecipes.map(recipe => (
          <div
            key={recipe.id}
            onClick={() => { setSelectedRecipeId(recipe.id); onNavigate('recipe-detail'); }}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-headline-md font-semibold text-on-surface">{recipe.name}</h3>
                  <span className="text-xs text-on-surface-variant font-medium">{recipe.category} · Prep: {recipe.prepTime}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {recipe.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-lg bg-surface-container-low text-center font-numeric-table">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">Recipe Cost</span>
                  <span className="font-bold text-on-surface text-sm">{formatRecipeCost(recipe.cost)}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">Menu Price</span>
                  <span className="font-bold text-on-surface text-sm">{formatCurrency(recipe.price)}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant block">Margin</span>
                  <span className="font-bold text-tertiary-container text-sm">{recipe.margin}%</span>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant">
                Standardized ingredients: {recipe.ingredients?.length || 5} components
              </p>
            </div>

            <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant mt-2">
              <span>Updated this month</span>
              <span className="text-primary font-semibold flex items-center gap-0.5">
                View Card <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
