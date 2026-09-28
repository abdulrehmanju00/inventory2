import React from 'react';
import { useAppStore } from '../store/AppStore';
import { getStatusBadgeClasses } from '../utils/inventory';

export default function IngredientDetail({ onNavigate }) {
  const { ingredients, selectedIngredientId, setSelectedIngredientId, wastage, stockCounts, formatCurrency, formatDate } = useAppStore();

  const item = ingredients.find(i => i.id === selectedIngredientId) || ingredients[0] || {
    id: "ing-1",
    name: "Chicken Breast",
    sku: "SKU-9021",
    category: "Proteins",
    currentStock: 8,
    minStock: 20,
    stockUnit: "kg",
    recipeUnit: "g",
    unitCost: 920,
    location: "Walk-in Cooler",
    supplier: "Fresh Foods Supplier",
    shelfLifeDays: 5,
    packageUnit: "Bag",
    packageSize: 10,
    status: "Critical"
  };

  const badge = getStatusBadgeClasses(item.status);
  const totalValue = item.currentStock * item.unitCost;
  const stockRatio = item.minStock > 0 ? (item.currentStock / item.minStock) : 1;
  const pct = Math.round(stockRatio * 100);
  const shortage = Math.max(0, item.minStock - item.currentStock);

  // Filter recent wastage for this ingredient
  const relatedWastage = wastage.filter(w => w.ingredientName === item.name || w.ingredientId === item.id);
  const relatedStockCount = stockCounts?.find(
    c => c.status === 'Completed' && (c.items?.some(i => i.ingredientId === item.id) || c.location === item.location)
  );

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto pb-16">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-label-md font-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-primary transition-colors cursor-pointer">Operations</span>
        <span className="text-outline-variant">/</span>
        <span onClick={() => onNavigate('inventory')} className="hover:text-primary transition-colors cursor-pointer">Inventory</span>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface font-semibold">{item.name}</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              {item.name}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${badge.bg} ${badge.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
              <span>{item.status}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-label-md font-label-md text-on-surface-variant">
            <span className="font-mono text-on-surface font-medium">{item.sku}</span>
            <span>•</span>
            <span>{item.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">storefront</span>
              <span>{item.location}</span>
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant/80 mt-0.5">
            Inventory details, purchasing information, and stock activity.
          </p>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => onNavigate('new-wastage')}
            className="h-9 px-3.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors shadow-sm font-label-md text-label-md flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px] text-error">delete_outline</span>
            Record Wastage
          </button>
          <button
            onClick={() => onNavigate('add-stock')}
            className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md font-semibold transition-colors shadow-sm flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Stock
          </button>
        </div>
      </div>

      {/* SECTION 1: KEY METRIC KPI TILES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        {/* Card 1: Total Stock */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
          <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${badge.dot}`}></div>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Total Stock</span>
            <span className={`p-1 rounded-md ${badge.bg} ${badge.text} material-symbols-outlined text-[18px]`}>
              {item.status === 'Critical' ? 'warning' : 'inventory_2'}
            </span>
          </div>
          <div className="my-2">
            <div className={`font-display-lg text-display-lg font-bold leading-none tracking-tight ${
              item.status === 'Critical' ? 'text-error' : item.status === 'Low' || item.status === 'Low Stock' ? 'text-amber-700' : 'text-on-surface'
            }`}>
              {item.currentStock} <span className="font-headline-md text-headline-md font-normal text-on-surface-variant">{item.stockUnit}</span>
            </div>
          </div>
          <div className="text-label-sm font-label-sm text-on-surface-variant">Sum of all storage locations</div>
        </div>

        {/* Card 2: Minimum Stock Level */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Minimum Stock Level</span>
            <span className="p-1 rounded-md bg-surface-container text-secondary material-symbols-outlined text-[18px]">flag</span>
          </div>
          <div className="my-2">
            <div className="font-display-lg text-display-lg text-on-surface font-bold leading-none tracking-tight">
              {item.minStock} <span className="font-headline-md text-headline-md font-normal text-on-surface-variant">{item.stockUnit}</span>
            </div>
          </div>
          <div className="text-label-sm font-label-sm text-on-surface-variant">Reorder threshold</div>
        </div>

        {/* Card 3: Unit Cost */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Unit Cost</span>
            <span className="p-1 rounded-md bg-surface-container text-secondary material-symbols-outlined text-[18px]">sell</span>
          </div>
          <div className="my-2">
            <div className="font-headline-xl text-headline-xl text-on-surface font-bold leading-none tracking-tight font-numeric-table">
              {formatCurrency(item.unitCost)} <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">/ {item.stockUnit}</span>
            </div>
          </div>
          <div className="text-label-sm font-label-sm text-on-surface-variant">Current inventory cost</div>
        </div>

        {/* Card 4: Total Value */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Total Stock Value</span>
            <span className="p-1 rounded-md bg-surface-container text-secondary material-symbols-outlined text-[18px]">account_balance_wallet</span>
          </div>
          <div className="my-2">
            <div className="font-headline-xl text-headline-xl text-on-surface font-bold leading-none tracking-tight font-numeric-table">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="text-label-sm font-label-sm text-on-surface-variant">Total asset valuation</div>
        </div>
      </section>

      {/* LOCATION BREAKDOWN SECTION */}
      <section className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30 shadow-sm mb-space-lg">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">warehouse</span>
            <h2 className="font-headline-md font-semibold text-on-surface">Location Breakdown</h2>
          </div>
          <span className="text-label-md font-semibold text-on-surface-variant">
            Total Stock: <strong className="text-on-surface font-numeric-table">{item.currentStock} {item.stockUnit}</strong>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Main Store', 'Walk-in Cooler', 'Dry Store', 'Kitchen Prep'].map(loc => {
            const locStock = item.locationBalances?.[loc] !== undefined ? item.locationBalances[loc] : 0;
            return (
              <div key={loc} className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
                <span className="text-xs text-on-surface-variant font-medium">{loc}</span>
                <div className="mt-1">
                  <span className="font-headline-md font-bold font-numeric-table text-on-surface">
                    {locStock}
                  </span>
                  <span className="text-xs text-on-surface-variant ml-1 font-medium">{item.stockUnit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: STOCK LEVEL VISUALIZATION */}
      <section className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm mb-space-lg border border-outline-variant/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div className="flex items-center gap-space-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${badge.dot} ${item.status === 'Critical' ? 'animate-pulse' : ''}`}></span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Stock Level Analysis</h2>
            <span className={`px-2 py-0.5 rounded text-label-sm font-label-sm font-semibold ${badge.bg} ${badge.text}`}>
              {pct}% of minimum
            </span>
          </div>
          <p className={`text-label-sm font-label-sm font-medium ${item.status === 'Critical' ? 'text-error' : item.status === 'Low Stock' ? 'text-amber-700' : 'text-tertiary-container'}`}>
            {item.status === 'Critical' ? 'Critical — stock is below 50% of minimum level.' : item.status === 'Low Stock' ? 'Low stock — consider issuing purchase order.' : 'Healthy — inventory is above minimum threshold.'}
          </p>
        </div>

        {/* Visual Progress Scale */}
        <div className="flex flex-col gap-2">
          <div className="w-full bg-surface-container-high h-3.5 rounded-full overflow-hidden flex relative">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                item.status === 'Critical' ? 'bg-error' : item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-tertiary-container'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant">
            <span>0 {item.stockUnit}</span>
            <span className="font-semibold text-on-surface">{item.currentStock} {item.stockUnit} ({pct}%)</span>
            <span className="font-medium text-on-surface">{item.minStock} {item.stockUnit} (Minimum)</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-space-md pt-space-md bg-surface-container-low/50 rounded-lg p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md w-full md:w-auto flex-1">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Current Stock</span>
              <span className={`font-headline-md text-headline-md font-bold ${item.status === 'Critical' ? 'text-error' : 'text-on-surface'}`}>
                {item.currentStock} {item.stockUnit}
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Minimum Stock</span>
              <span className="font-headline-md text-headline-md font-semibold text-on-surface">
                {item.minStock} {item.stockUnit}
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Shortage</span>
              <span className="font-headline-md text-headline-md font-bold text-error">
                {shortage > 0 ? `${shortage} ${item.stockUnit}` : 'None'}
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Storage Area</span>
              <span className="font-headline-md text-headline-md font-semibold text-on-surface">
                {item.location}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4: INFORMATION & PURCHASING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-lg">
        {/* Ingredient Information */}
        <div className="lg:col-span-6 p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-space-md pb-2 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-[20px]">nutrition</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Ingredient Information</h3>
          </div>
          <dl className="divide-y divide-outline-variant/20 text-body-sm font-body-sm">
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">Ingredient Name</dt>
              <dd className="text-on-surface font-semibold">{item.name}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">SKU / Item Code</dt>
              <dd className="font-mono text-on-surface font-medium px-2 py-0.5 rounded bg-surface-container-low">{item.sku}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">Category</dt>
              <dd><span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-medium bg-primary/10 text-primary">{item.category}</span></dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">Stock Unit</dt>
              <dd className="font-numeric-table font-semibold text-on-surface">{item.stockUnit}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">Recipe Unit</dt>
              <dd className="font-numeric-table font-semibold text-on-surface">{item.recipeUnit || 'g'}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">Shelf Life</dt>
              <dd className="text-on-surface">{item.shelfLifeDays || 5} days</dd>
            </div>
          </dl>
        </div>

        {/* Purchasing Information */}
        <div className="lg:col-span-6 p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-space-md pb-2 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Purchasing Information</h3>
          </div>
          <dl className="divide-y divide-outline-variant/20 text-body-sm font-body-sm">
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">Preferred Supplier</dt>
              <dd className="text-on-surface font-semibold">{item.supplier}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">Package Format</dt>
              <dd className="text-on-surface">{item.packageUnit || 'Bag'} ({item.packageSize || 10} {item.stockUnit})</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">Unit Cost</dt>
              <dd className="font-numeric-table font-bold text-on-surface">{formatCurrency(item.unitCost)} / {item.stockUnit}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-on-surface-variant font-label-md font-medium">Package Cost</dt>
              <dd className="font-numeric-table font-semibold text-on-surface">{formatCurrency(item.unitCost * (item.packageSize || 10))}</dd>
            </div>
          </dl>

          <div className="mt-4 pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-2">
            <button
              onClick={() => onNavigate('new-purchase')}
              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
              type="button"
            >
              Order from {item.supplier}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT STOCK ACTIVITY */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-3">Recent Stock Activity</h3>
        <div className="divide-y divide-outline-variant/20 text-body-sm">
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-medium text-on-surface">Stock Received</span>
              <span className="text-on-surface-variant">· 20 {item.stockUnit} received from {item.supplier}</span>
            </div>
            <span className="text-on-surface-variant font-label-sm text-label-sm">2 days ago</span>
          </div>
          {relatedWastage.map(w => (
            <div key={w.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="font-medium text-on-surface">Wastage Logged ({w.id})</span>
                <span className="text-on-surface-variant">· {w.quantity} {w.unit} ({w.reason})</span>
              </div>
              <span className="text-on-surface-variant font-label-sm text-label-sm">{formatDate(w.date || w.displayDate)}</span>
            </div>
          ))}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-medium text-on-surface">Physical Count Checked</span>
              <span className="text-on-surface-variant">· Walk-in Cooler stock count reconciled</span>
            </div>
            <span className="text-on-surface-variant font-label-sm text-label-sm">
              {relatedStockCount?.date ? formatDate(relatedStockCount.date) : formatDate('2026-09-23')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
