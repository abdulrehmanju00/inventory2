// Reusable unit conversion and recipe costing utilities
// Strict unit awareness - does NOT divide discrete units (pcs) by 1000

const MASS_UNITS = {
  mg: 0.000001,
  g: 0.001,
  kg: 1
};

const VOLUME_UNITS = {
  ml: 0.001,
  l: 1
};

const DISCRETE_UNITS = new Set(['pcs', 'pc', 'piece', 'pieces', 'unit', 'units', 'box', 'boxes', 'bag', 'bags', 'tin', 'tins', 'block', 'blocks', 'tray', 'trays', 'carton', 'cartons']);

export function normalizeUnit(unit) {
  if (!unit) return '';
  const clean = String(unit).trim().toLowerCase();
  if (clean === 'piece' || clean === 'pieces' || clean === 'pc') return 'pcs';
  if (clean === 'unit' || clean === 'units') return 'pcs';
  if (clean === 'liter' || clean === 'liters') return 'l';
  if (clean === 'milliliter' || clean === 'milliliters') return 'ml';
  if (clean === 'gram' || clean === 'grams') return 'g';
  if (clean === 'kilogram' || clean === 'kilograms') return 'kg';
  return clean;
}

export function isCompatibleUnit(fromUnit, toUnit) {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (from === to) return true;
  if (MASS_UNITS[from] && MASS_UNITS[to]) return true;
  if (VOLUME_UNITS[from] && VOLUME_UNITS[to]) return true;
  if (DISCRETE_UNITS.has(from) && DISCRETE_UNITS.has(to)) return true;

  return false;
}

export function convertUnits(quantity, fromUnit, toUnit) {
  const qty = Number(quantity);
  if (isNaN(qty)) {
    throw new Error(`Invalid numeric quantity: ${quantity}`);
  }

  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (from === to || !from || !to) {
    return qty;
  }

  // Mass conversions
  if (MASS_UNITS[from] && MASS_UNITS[to]) {
    const qtyInKg = qty * MASS_UNITS[from];
    return qtyInKg / MASS_UNITS[to];
  }

  // Volume conversions
  if (VOLUME_UNITS[from] && VOLUME_UNITS[to]) {
    const qtyInL = qty * VOLUME_UNITS[from];
    return qtyInL / VOLUME_UNITS[to];
  }

  // Discrete units (pcs, boxes, etc.) - 1 to 1 without division by 1000
  if (DISCRETE_UNITS.has(from) && DISCRETE_UNITS.has(to)) {
    return qty;
  }

  throw new Error(`Incompatible unit conversion from "${fromUnit}" to "${toUnit}".`);
}

/**
 * Calculates ingredient cost in a recipe based on recipe portion quantity and ingredient unit cost
 * @param {number|string} quantity - recipe component quantity (e.g. 150 or "150 g")
 * @param {string} recipeUnit - unit used in recipe (e.g. "g", "pcs", "ml")
 * @param {object} ingredient - ingredient object with unitCost and stockUnit
 * @returns {number} cost in currency
 */
export function calculateRecipeIngredientCost(quantity, recipeUnit, ingredient) {
  if (!ingredient) return 0;

  let numQty = typeof quantity === 'number' ? quantity : parseFloat(String(quantity).split(/\s+/)[0]) || 0;
  let unit = recipeUnit;

  if (typeof quantity === 'string' && !recipeUnit) {
    const parts = quantity.trim().split(/\s+/);
    numQty = parseFloat(parts[0]) || 0;
    unit = parts[1] || ingredient.stockUnit;
  }

  if (numQty <= 0) return 0;

  try {
    const convertedQty = convertUnits(numQty, unit || ingredient.recipeUnit || ingredient.stockUnit, ingredient.stockUnit);
    const unitPrice = Number(ingredient.unitCost) || 0;
    return Math.round(convertedQty * unitPrice * 100) / 100;
  } catch (err) {
    console.warn(`Unit conversion failed for ${ingredient.name}:`, err.message);
    // Safe fallback if units mismatch
    return 0;
  }
}
