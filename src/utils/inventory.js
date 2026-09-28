// Inventory calculation and status utilities

/**
 * Calculates stock health status dynamically based on current and minimum thresholds
 * Rules:
 * - currentStock === 0: Out of Stock
 * - currentStock > 0 AND currentStock <= 50% of minStock: Critical
 * - currentStock > 50% of minStock AND currentStock <= minStock: Low Stock
 * - currentStock > minStock: Healthy
 */
export function calculateStockStatus(currentStock, minStock) {
  const current = Number(currentStock) || 0;
  const min = Number(minStock) || 0;

  if (current <= 0) return 'Out of Stock';
  if (min > 0 && current <= min * 0.5) return 'Critical';
  if (min > 0 && current <= min) return 'Low';
  return 'Healthy';
}

export function getStatusBadgeClasses(status) {
  switch (status) {
    case 'Critical':
      return {
        bg: 'bg-error-container',
        text: 'text-on-error-container',
        dot: 'bg-error',
        border: 'border-error/20'
      };
    case 'Low':
    case 'Low Stock':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        dot: 'bg-amber-500',
        border: 'border-amber-300'
      };
    case 'Out of Stock':
      return {
        bg: 'bg-surface-container',
        text: 'text-secondary',
        dot: 'bg-secondary',
        border: 'border-secondary/20'
      };
    case 'Healthy':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-tertiary-container',
        dot: 'bg-tertiary-container',
        border: 'border-emerald-200'
      };
  }
}

export function computeInventoryMetrics(ingredients) {
  let totalValue = 0;
  let healthyCount = 0;
  let lowStockCount = 0;
  let criticalCount = 0;
  let outOfStockCount = 0;

  ingredients.forEach(item => {
    const stock = Number(item.currentStock) || 0;
    const cost = Number(item.unitCost) || 0;
    totalValue += stock * cost;

    const status = calculateStockStatus(stock, item.minStock);
    if (status === 'Critical') criticalCount++;
    else if (status === 'Low Stock' || status === 'Low') lowStockCount++;
    else if (status === 'Out of Stock') outOfStockCount++;
    else healthyCount++;
  });

  return {
    totalItems: ingredients.length,
    totalValue: Math.round(totalValue * 100) / 100,
    healthyCount,
    lowStockCount,
    criticalCount,
    outOfStockCount
  };
}
