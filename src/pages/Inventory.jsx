import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';
import { computeInventoryMetrics, getStatusBadgeClasses } from '../utils/inventory';
import { exportToCsv } from '../utils/csv';

export default function Inventory({ onNavigate }) {
  const { currentBranch, ingredients, setSelectedIngredientId, showToast, formatCurrency, settings } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All Suppliers');
  const [sortBy, setSortBy] = useState('criticality');
  const [showAdvFilters, setShowAdvFilters] = useState(false);

  const metrics = computeInventoryMetrics(ingredients);

  const categories = ['All', 'Proteins', 'Dairy', 'Dry Goods', 'Produce', 'Beverages', 'Packaging'];

  const filteredItems = useMemo(() => {
    let result = [...ingredients];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      result = result.filter(item => item.status === selectedStatus);
    }

    if (selectedLocation !== 'All') {
      result = result.filter(item => (item.locationBalances?.[selectedLocation] || 0) > 0);
    }

    if (selectedSupplier !== 'All Suppliers') {
      result = result.filter(item => item.supplier === selectedSupplier);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'criticality') {
        const order = { 'Critical': 1, 'Low Stock': 2, 'Out of Stock': 3, 'Healthy': 4 };
        return (order[a.status] || 5) - (order[b.status] || 5);
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'stock_ratio_asc') {
        const rA = a.minStock > 0 ? a.currentStock / a.minStock : 1;
        const rB = b.minStock > 0 ? b.currentStock / b.minStock : 1;
        return rA - rB;
      }
      if (sortBy === 'stock_ratio_desc') {
        const rA = a.minStock > 0 ? a.currentStock / a.minStock : 1;
        const rB = b.minStock > 0 ? b.currentStock / b.minStock : 1;
        return rB - rA;
      }
      if (sortBy === 'value_desc') {
        return (b.currentStock * b.unitCost) - (a.currentStock * a.unitCost);
      }
      return 0;
    });

    return result;
  }, [ingredients, searchTerm, selectedCategory, selectedStatus, selectedLocation, selectedSupplier, sortBy]);

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedLocation !== 'All' || selectedSupplier !== 'All Suppliers';

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedLocation('All');
    setSelectedSupplier('All Suppliers');
    setSortBy('criticality');
  };

  const handleExportCSV = () => {
    const headers = ['Ingredient', 'SKU', 'Category', 'Current Stock', 'Stock Unit', 'Min Stock', `Unit Cost (${settings?.currency || 'PKR'})`, `Total Value (${settings?.currency || 'PKR'})`, 'Location', 'Status', 'Supplier'];
    const rows = filteredItems.map(i => [
      i.name,
      i.sku,
      i.category,
      i.currentStock,
      i.stockUnit,
      i.minStock,
      i.unitCost,
      i.currentStock * i.unitCost,
      i.location,
      i.status,
      i.supplier
    ]);
    exportToCsv(`inventory_${currentBranch.replace(/\s+/g, '_')}`, headers, rows);
    showToast('Inventory exported to CSV', 'success');
  };

  return (
    <div className="flex flex-col w-full space-y-space-md">
      {/* Breadcrumbs & Quick Alerts Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
          <span>Operations</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium">Inventory Catalog</span>
        </div>
        <div className="flex items-center gap-space-sm text-label-sm font-label-sm flex-wrap">
          <span className="inline-flex items-center gap-1 text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-lg border border-outline-variant/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Inventory updated 2 min ago
          </span>
          <span className="text-on-surface-variant">
            Valuation: <strong className="font-numeric-table font-semibold text-on-surface">{formatCurrency(metrics.totalValue)}</strong>
          </span>
        </div>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-1">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-semibold">Inventory</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Manage your ingredients, stock levels, costs, and inventory status.
          </p>
        </div>
        {/* Action Group */}
        <div className="flex items-center gap-space-xs flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">download</span>
            Export CSV
          </button>
          <button
            onClick={() => onNavigate('add-stock')}
            className="h-9 px-3.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
            + Add Stock
          </button>
          <button
            onClick={() => onNavigate('add-ingredient')}
            className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            + Add Ingredient
          </button>
        </div>
      </div>

      {/* INVENTORY SUMMARY ROW: 5 Operational Horizontal Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-xs">
        <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Items</span>
            <span className="font-headline-md text-headline-md font-semibold text-on-surface mt-0.5 font-numeric-table">{metrics.totalItems}</span>
          </div>
          <div className="w-8 h-8 rounded-md bg-surface-container-low flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">category</span>
          </div>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Healthy</span>
            </div>
            <span className="font-headline-md text-headline-md font-semibold text-on-surface mt-0.5 font-numeric-table">{metrics.healthyCount}</span>
          </div>
          <span className="font-label-sm text-[11px] text-tertiary-container bg-tertiary-container/10 px-1.5 py-0.5 rounded font-medium">
            {Math.round((metrics.healthyCount / Math.max(1, metrics.totalItems)) * 100)}%
          </span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Low Stock</span>
            </div>
            <span className="font-headline-md text-headline-md font-semibold text-amber-700 mt-0.5 font-numeric-table">{metrics.lowStockCount}</span>
          </div>
          <span className="font-label-sm text-[11px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-medium">Reorder soon</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/40 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Critical</span>
            </div>
            <span className="font-headline-md text-headline-md font-semibold text-error mt-0.5 font-numeric-table">{metrics.criticalCount}</span>
          </div>
          <span className="font-label-sm text-[11px] text-error bg-error-container/60 px-1.5 py-0.5 rounded font-medium">Needs restock</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/40 flex items-center justify-between shadow-sm col-span-2 sm:col-span-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Out of Stock</span>
            </div>
            <span className="font-headline-md text-headline-md font-semibold text-secondary mt-0.5 font-numeric-table">{metrics.outOfStockCount}</span>
          </div>
          <span className="font-label-sm text-[11px] text-secondary bg-surface-container px-1.5 py-0.5 rounded font-medium">Needs attention</span>
        </div>
      </div>

      {/* MAIN INVENTORY CONTAINER CARD */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden flex flex-col">
        {/* Card Top Header & Global Controls */}
        <div className="p-space-md border-b border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm bg-surface-container-lowest">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight">Ingredients</h2>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant/30 font-medium">
              {filteredItems.length} across {currentBranch}
            </span>
          </div>

          {/* Search, Filter & Sort dropdown triggers */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ingredients..."
                className="w-full h-8 pl-8 pr-7 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>

            {/* Filter Trigger Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAdvFilters(prev => !prev)}
                className={`h-8 px-2.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors ${
                  selectedSupplier !== 'All Suppliers' ? 'border-primary text-primary font-semibold' : ''
                }`}
              >
                <span className="material-symbols-outlined text-[17px] text-on-surface-variant">tune</span>
                Filters
                {selectedSupplier !== 'All Suppliers' && (
                  <span className="bg-primary text-white rounded-full text-xs px-1.5 py-0.2 leading-none font-semibold">
                    1
                  </span>
                )}
              </button>

              {showAdvFilters && (
                <div className="absolute right-0 top-full mt-2 z-30 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-lg p-4 w-64 text-left">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-outline-variant/30">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Filter Options</span>
                    <button
                      type="button"
                      onClick={() => setShowAdvFilters(false)}
                      className="text-on-surface-variant hover:text-on-surface p-0.5 rounded"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                      Supplier
                    </label>
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="All Suppliers">All Suppliers</option>
                      <option value="Fresh Foods Supplier">Fresh Foods Supplier</option>
                      <option value="Metro Wholesale">Metro Wholesale</option>
                      <option value="Local Food Supplier">Local Food Supplier</option>
                      <option value="Dairy King Ltd">Dairy King Ltd</option>
                    </select>
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedSupplier('All Suppliers')}
                      className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdvFilters(false)}
                      className="h-7 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-medium transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 pl-2.5 pr-8 rounded-lg border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary cursor-pointer transition-colors appearance-none"
              >
                <option value="criticality">Sort: Criticality</option>
                <option value="name_asc">Sort: Ingredient Name A–Z</option>
                <option value="stock_ratio_asc">Sort: Stock Level Low–High</option>
                <option value="stock_ratio_desc">Sort: Stock Level High–Low</option>
                <option value="value_desc">Sort: Inventory Value High–Low</option>
              </select>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* COMPACT FILTER BAR DIRECTLY BENEATH */}
        <div className="px-space-md py-2.5 bg-surface-container-low/60 border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-space-sm text-body-sm">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-label-sm font-label-sm transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-outline-variant/50 hidden md:block"></div>

            {/* Stock Status Filter Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-7 px-2 text-label-sm font-label-sm rounded-md border border-outline-variant/50 bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Healthy">Healthy ({metrics.healthyCount})</option>
              <option value="Low Stock">Low Stock ({metrics.lowStockCount})</option>
              <option value="Critical">Critical ({metrics.criticalCount})</option>
              <option value="Out of Stock">Out of Stock ({metrics.outOfStockCount})</option>
            </select>

            {/* Storage Location Dropdown */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-7 px-2 text-label-sm font-label-sm rounded-md border border-outline-variant/50 bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="All">All Locations</option>
              <option value="Main Store">Main Store</option>
              <option value="Walk-in Cooler">Walk-in Cooler</option>
              <option value="Dry Store">Dry Store</option>
              <option value="Kitchen Prep">Kitchen Prep</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              type="button"
              className="text-label-sm font-label-sm text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Reset Filters
            </button>
          )}
        </div>

        {/* LIVE DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-surface-container-low/70 border-b border-outline-variant/40 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold w-64">Ingredient</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold text-right">Current Stock</th>
                <th className="py-2.5 px-3 font-semibold text-right">Min Stock</th>
                <th className="py-2.5 px-3 font-semibold text-right">Unit Cost</th>
                <th className="py-2.5 px-3 font-semibold text-right">Total Value</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                <th className="py-2.5 px-4 font-semibold text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredItems.map(item => {
                const badge = getStatusBadgeClasses(item.status);
                const totalValue = item.currentStock * item.unitCost;
                return (
                  <tr
                    key={item.id}
                    onClick={() => { setSelectedIngredientId(item.id); onNavigate('ingredient-detail'); }}
                    className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-medium text-on-surface group-hover:text-primary transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold text-body-md">{item.name}</span>
                        <span className="font-mono text-[11px] text-on-surface-variant">{item.sku} • {item.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">
                      {item.category}
                    </td>
                    <td className={`py-3 px-3 text-right font-numeric-table font-semibold ${
                      item.status === 'Critical' ? 'text-error' : item.status === 'Low Stock' ? 'text-amber-700' : 'text-on-surface'
                    }`}>
                      {item.currentStock} {item.stockUnit}
                    </td>
                    <td className="py-3 px-3 text-right font-numeric-table text-on-surface-variant">
                      {item.minStock} {item.stockUnit}
                    </td>
                    <td className="py-3 px-3 text-right font-numeric-table text-on-surface">
                      {formatCurrency(item.unitCost)}/{item.stockUnit}
                    </td>
                    <td className="py-3 px-3 text-right font-numeric-table font-semibold text-on-surface">
                      {formatCurrency(totalValue)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm ${badge.bg} ${badge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => { setSelectedIngredientId(item.id); onNavigate('add-stock'); }}
                        className={`px-2.5 py-1 rounded text-label-sm font-label-sm transition-colors shadow-xs ${
                          item.status === 'Critical' || item.status === 'Low Stock'
                            ? 'bg-primary text-on-primary hover:bg-primary/90'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/40'
                        }`}
                      >
                        {item.status === 'Critical' || item.status === 'Low Stock' ? 'Add Stock' : 'Adjust'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2">search_off</span>
              <p className="font-headline-md font-semibold text-on-surface">No ingredients found</p>
              <p className="font-body-sm text-on-surface-variant mt-1">Try adjusting your filters or search keywords.</p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-3 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Table footer info */}
        <div className="p-space-md bg-surface-container-low/50 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-label-sm text-on-surface-variant">
          <span>Showing {filteredItems.length} of {ingredients.length} total catalog ingredients</span>
          <div className="flex items-center gap-2">
            <span>Branch: <strong className="text-on-surface">{currentBranch}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
