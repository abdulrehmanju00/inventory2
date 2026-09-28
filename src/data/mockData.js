// Canonical Mock Data for Restaurant Inventory & Operations
// Aligned with location-aware inventory, canonical recipes, canonical suppliers, and KPIs

import { getLocalDateKey } from '../utils/dateUtils';

export const INITIAL_BRANCH = "Main Branch";

export const STORAGE_LOCATIONS = [
  "Main Store",
  "Walk-in Cooler",
  "Dry Store",
  "Kitchen Prep"
];

export const CURRENT_USER = {
  name: "Ahmed Raza",
  role: "General Manager",
  department: "Operations & Management",
  initials: "GM",
  email: "ahmed.raza@restaurant.internal",
  phone: "+92 300 5551234"
};

export const INITIAL_SUPPLIERS = [
  {
    id: "SUP-1001",
    name: "Fresh Foods Supplier",
    category: "Proteins & Meats",
    contactPerson: "Tariq Mehmood",
    phone: "+92 300 1234567",
    email: "orders@freshfoods.pk",
    address: "Plot 42, Wholesale Meat Market, Lahore",
    leadTimeDays: 1,
    paymentTerms: "Net 15 Days",
    rating: 4.9,
    activeItemCount: 14,
    status: "Active"
  },
  {
    id: "SUP-1002",
    name: "Dairy House",
    category: "Dairy & Cheese",
    contactPerson: "Kamran Ali",
    phone: "+92 345 6789012",
    email: "sales@dairyhouse.pk",
    address: "Industrial Estate Kot Lakhpat, Lahore",
    leadTimeDays: 1,
    paymentTerms: "Net 15 Days",
    rating: 4.8,
    activeItemCount: 9,
    status: "Active"
  },
  {
    id: "SUP-1003",
    name: "City Grocery Wholesale",
    category: "Dry Goods & Spices",
    contactPerson: "Sarah Khan",
    phone: "+92 321 9876543",
    email: "orders@citygrocery.pk",
    address: "Thokar Niaz Baig, Commercial Area, Lahore",
    leadTimeDays: 2,
    paymentTerms: "Net 30 Days",
    rating: 4.7,
    activeItemCount: 38,
    status: "Active"
  },
  {
    id: "SUP-1004",
    name: "Bakers Supply Co.",
    category: "Bakery & Packaging",
    contactPerson: "Irfan Sheikh",
    phone: "+92 312 4455667",
    email: "info@bakersupply.pk",
    address: "Sector C, Industrial Zone, Lahore",
    leadTimeDays: 2,
    paymentTerms: "Net 15 Days",
    rating: 4.8,
    activeItemCount: 16,
    status: "Active"
  },
  {
    id: "SUP-1005",
    name: "Oil & Pantry Traders",
    category: "Cooking Oils & Condiments",
    contactPerson: "Bilal Farooq",
    phone: "+92 333 4567890",
    email: "bilal@oilpantry.pk",
    address: "Circular Road Oil Market, Lahore",
    leadTimeDays: 1,
    paymentTerms: "Weekly Cash",
    rating: 4.6,
    activeItemCount: 12,
    status: "Active"
  }
];

export const INITIAL_INGREDIENTS = [
  {
    id: "ing-1",
    name: "Chicken Breast",
    sku: "SKU-9021",
    category: "Proteins",
    minStock: 20,
    stockUnit: "kg",
    recipeUnit: "g",
    conversionRate: 1000,
    unitCost: 920,
    location: "Walk-in Cooler",
    supplier: "Fresh Foods Supplier",
    preferredSupplierId: "SUP-1001",
    shelfLifeDays: 5,
    packageUnit: "Bag",
    packageSize: 10
  },
  {
    id: "ing-2",
    name: "Mozzarella Cheese",
    sku: "SKU-4012",
    category: "Dairy",
    minStock: 15,
    stockUnit: "kg",
    recipeUnit: "g",
    conversionRate: 1000,
    unitCost: 1250,
    location: "Walk-in Cooler",
    supplier: "Dairy House",
    preferredSupplierId: "SUP-1002",
    shelfLifeDays: 14,
    packageUnit: "Block",
    packageSize: 5
  },
  {
    id: "ing-3",
    name: "Cooking Oil",
    sku: "SKU-1084",
    category: "Dry Goods",
    minStock: 15,
    stockUnit: "L",
    recipeUnit: "ml",
    conversionRate: 1000,
    unitCost: 410,
    location: "Dry Store",
    supplier: "Oil & Pantry Traders",
    preferredSupplierId: "SUP-1005",
    shelfLifeDays: 90,
    packageUnit: "Tin",
    packageSize: 16
  },
  {
    id: "ing-4",
    name: "Rice (Basmati)",
    sku: "SKU-2091",
    category: "Dry Goods",
    minStock: 30,
    stockUnit: "kg",
    recipeUnit: "g",
    conversionRate: 1000,
    unitCost: 230,
    location: "Main Store",
    supplier: "City Grocery Wholesale",
    preferredSupplierId: "SUP-1003",
    shelfLifeDays: 180,
    packageUnit: "Sack",
    packageSize: 25
  },
  {
    id: "ing-5",
    name: "Tomatoes",
    sku: "SKU-5501",
    category: "Produce",
    minStock: 15,
    stockUnit: "kg",
    recipeUnit: "g",
    conversionRate: 1000,
    unitCost: 140,
    location: "Walk-in Cooler",
    supplier: "City Grocery Wholesale",
    preferredSupplierId: "SUP-1003",
    shelfLifeDays: 7,
    packageUnit: "Crate",
    packageSize: 15
  },
  {
    id: "ing-6",
    name: "Heavy Cream",
    sku: "SKU-4089",
    category: "Dairy",
    minStock: 10,
    stockUnit: "L",
    recipeUnit: "ml",
    conversionRate: 1000,
    unitCost: 580,
    location: "Walk-in Cooler",
    supplier: "Dairy House",
    preferredSupplierId: "SUP-1002",
    shelfLifeDays: 10,
    packageUnit: "Pack",
    packageSize: 1
  },
  {
    id: "ing-7",
    name: "Potatoes",
    sku: "SKU-3320",
    category: "Produce",
    minStock: 25,
    stockUnit: "kg",
    recipeUnit: "g",
    conversionRate: 1000,
    unitCost: 95,
    location: "Main Store",
    supplier: "City Grocery Wholesale",
    preferredSupplierId: "SUP-1003",
    shelfLifeDays: 20,
    packageUnit: "Sack",
    packageSize: 20
  },
  {
    id: "ing-8",
    name: "Burger Buns",
    sku: "SKU-7710",
    category: "Packaging",
    minStock: 50,
    stockUnit: "pcs",
    recipeUnit: "pcs",
    conversionRate: 1,
    unitCost: 45,
    location: "Main Store",
    supplier: "Bakers Supply Co.",
    preferredSupplierId: "SUP-1004",
    shelfLifeDays: 4,
    packageUnit: "Tray",
    packageSize: 12
  },
  {
    id: "ing-9",
    name: "Mayonnaise",
    sku: "SKU-1085",
    category: "Dry Goods",
    minStock: 5,
    stockUnit: "kg",
    recipeUnit: "g",
    conversionRate: 1000,
    unitCost: 380,
    location: "Dry Store",
    supplier: "Oil & Pantry Traders",
    preferredSupplierId: "SUP-1005",
    shelfLifeDays: 60,
    packageUnit: "Tub",
    packageSize: 5
  },
  {
    id: "ing-10",
    name: "Beef Mince",
    sku: "SKU-9025",
    category: "Proteins",
    minStock: 12,
    stockUnit: "kg",
    recipeUnit: "g",
    conversionRate: 1000,
    unitCost: 1450,
    location: "Walk-in Cooler",
    supplier: "Fresh Foods Supplier",
    preferredSupplierId: "SUP-1001",
    shelfLifeDays: 4,
    packageUnit: "Pack",
    packageSize: 5
  },
  {
    id: "ing-11",
    name: "Takeaway Boxes",
    sku: "SKU-8801",
    category: "Packaging",
    minStock: 100,
    stockUnit: "pcs",
    recipeUnit: "pcs",
    conversionRate: 1,
    unitCost: 22,
    location: "Main Store",
    supplier: "Bakers Supply Co.",
    preferredSupplierId: "SUP-1004",
    shelfLifeDays: 365,
    packageUnit: "Carton",
    packageSize: 100
  },
  {
    id: "ing-12",
    name: "Black Pepper",
    sku: "SKU-1090",
    category: "Dry Goods",
    minStock: 2,
    stockUnit: "kg",
    recipeUnit: "g",
    conversionRate: 1000,
    unitCost: 950,
    location: "Dry Store",
    supplier: "City Grocery Wholesale",
    preferredSupplierId: "SUP-1003",
    shelfLifeDays: 365,
    packageUnit: "Pouch",
    packageSize: 1
  },
  {
    id: "ing-13",
    name: "Fresh Basil",
    sku: "SKU-5520",
    category: "Produce",
    minStock: 1,
    stockUnit: "kg",
    recipeUnit: "g",
    conversionRate: 1000,
    unitCost: 450,
    location: "Walk-in Cooler",
    supplier: "City Grocery Wholesale",
    preferredSupplierId: "SUP-1003",
    shelfLifeDays: 3,
    packageUnit: "Bunch",
    packageSize: 0.5
  }
];

export const INITIAL_BALANCES = [
  // Chicken Breast (SKU-9021): Main Store = 0, Walk-in Cooler = 8, Dry Store = 0, Kitchen Prep = 2 (Total = 10 kg, Min = 20 kg -> Critical)
  { ingredientId: "ing-1", location: "Main Store", quantity: 0 },
  { ingredientId: "ing-1", location: "Walk-in Cooler", quantity: 8 },
  { ingredientId: "ing-1", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-1", location: "Kitchen Prep", quantity: 2 },

  // Mozzarella Cheese (SKU-4012): Main Store = 0, Walk-in Cooler = 18, Dry Store = 0, Kitchen Prep = 3 (Total = 21 kg, Min = 15 kg -> Healthy)
  { ingredientId: "ing-2", location: "Main Store", quantity: 0 },
  { ingredientId: "ing-2", location: "Walk-in Cooler", quantity: 18 },
  { ingredientId: "ing-2", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-2", location: "Kitchen Prep", quantity: 3 },

  // Cooking Oil (SKU-1084): Main Store = 0, Walk-in Cooler = 0, Dry Store = 10, Kitchen Prep = 2 (Total = 12 L, Min = 15 L -> Low Stock)
  { ingredientId: "ing-3", location: "Main Store", quantity: 0 },
  { ingredientId: "ing-3", location: "Walk-in Cooler", quantity: 0 },
  { ingredientId: "ing-3", location: "Dry Store", quantity: 10 },
  { ingredientId: "ing-3", location: "Kitchen Prep", quantity: 2 },

  // Rice (Basmati) (SKU-2091): Main Store = 42, Dry Store = 0, Walk-in Cooler = 0, Kitchen Prep = 0
  { ingredientId: "ing-4", location: "Main Store", quantity: 42 },
  { ingredientId: "ing-4", location: "Walk-in Cooler", quantity: 0 },
  { ingredientId: "ing-4", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-4", location: "Kitchen Prep", quantity: 0 },

  // Tomatoes (SKU-5501): Walk-in Cooler = 12, Main Store = 0, Dry Store = 0, Kitchen Prep = 0 (Total = 12 kg, Min = 15 kg -> Low Stock)
  { ingredientId: "ing-5", location: "Main Store", quantity: 0 },
  { ingredientId: "ing-5", location: "Walk-in Cooler", quantity: 12 },
  { ingredientId: "ing-5", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-5", location: "Kitchen Prep", quantity: 0 },

  // Heavy Cream (SKU-4089): Walk-in Cooler = 14, Main Store = 0, Dry Store = 0, Kitchen Prep = 0 (Total = 14 L, Min = 10 L -> Healthy)
  { ingredientId: "ing-6", location: "Main Store", quantity: 0 },
  { ingredientId: "ing-6", location: "Walk-in Cooler", quantity: 14 },
  { ingredientId: "ing-6", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-6", location: "Kitchen Prep", quantity: 0 },

  // Potatoes (SKU-3320): Main Store = 25, Kitchen Prep = 5, Walk-in Cooler = 0, Dry Store = 0 (Total = 30 kg, Min = 25 kg -> Healthy)
  { ingredientId: "ing-7", location: "Main Store", quantity: 25 },
  { ingredientId: "ing-7", location: "Walk-in Cooler", quantity: 0 },
  { ingredientId: "ing-7", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-7", location: "Kitchen Prep", quantity: 5 },

  // Burger Buns (SKU-7710): Main Store = 120, Kitchen Prep = 20, Walk-in Cooler = 0, Dry Store = 0 (Total = 140 pcs, Min = 50 pcs -> Healthy)
  { ingredientId: "ing-8", location: "Main Store", quantity: 120 },
  { ingredientId: "ing-8", location: "Walk-in Cooler", quantity: 0 },
  { ingredientId: "ing-8", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-8", location: "Kitchen Prep", quantity: 20 },

  // Mayonnaise (SKU-1085): Dry Store = 6, Kitchen Prep = 1, Main Store = 0, Walk-in Cooler = 0 (Total = 7 kg, Min = 5 kg -> Healthy)
  { ingredientId: "ing-9", location: "Main Store", quantity: 0 },
  { ingredientId: "ing-9", location: "Walk-in Cooler", quantity: 0 },
  { ingredientId: "ing-9", location: "Dry Store", quantity: 6 },
  { ingredientId: "ing-9", location: "Kitchen Prep", quantity: 1 },

  // Beef Mince (SKU-9025): Walk-in Cooler = 15, Main Store = 0, Dry Store = 0, Kitchen Prep = 0
  { ingredientId: "ing-10", location: "Main Store", quantity: 0 },
  { ingredientId: "ing-10", location: "Walk-in Cooler", quantity: 15 },
  { ingredientId: "ing-10", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-10", location: "Kitchen Prep", quantity: 0 },

  // Takeaway Boxes (SKU-8801): Main Store = 240, Walk-in Cooler = 0, Dry Store = 0, Kitchen Prep = 0
  { ingredientId: "ing-11", location: "Main Store", quantity: 240 },
  { ingredientId: "ing-11", location: "Walk-in Cooler", quantity: 0 },
  { ingredientId: "ing-11", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-11", location: "Kitchen Prep", quantity: 0 },

  // Black Pepper (SKU-1090): All 0 (Total = 0 -> Out of Stock)
  { ingredientId: "ing-12", location: "Main Store", quantity: 0 },
  { ingredientId: "ing-12", location: "Walk-in Cooler", quantity: 0 },
  { ingredientId: "ing-12", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-12", location: "Kitchen Prep", quantity: 0 },

  // Fresh Basil (SKU-5520): All 0 (Total = 0 -> Out of Stock)
  { ingredientId: "ing-13", location: "Main Store", quantity: 0 },
  { ingredientId: "ing-13", location: "Walk-in Cooler", quantity: 0 },
  { ingredientId: "ing-13", location: "Dry Store", quantity: 0 },
  { ingredientId: "ing-13", location: "Kitchen Prep", quantity: 0 }
];

export const INITIAL_MOVEMENTS = [
  {
    id: "mov-1",
    type: "STOCK_IN",
    ingredientId: "ing-1",
    location: "Walk-in Cooler",
    quantity: 8,
    date: "2026-09-24T08:00:00Z",
    reference: "PO-8820",
    notes: "Initial inventory setup"
  },
  {
    id: "mov-2",
    type: "STOCK_IN",
    ingredientId: "ing-2",
    location: "Walk-in Cooler",
    quantity: 18,
    date: "2026-09-24T08:00:00Z",
    reference: "PO-8820",
    notes: "Initial inventory setup"
  }
];

export const INITIAL_STOCK_COUNTS = [
  {
    id: "CNT-1047",
    date: "2026-09-27 10:00",
    displayDate: "Today, 10:00 AM",
    location: "Walk-in Cooler",
    scope: "Walk-in Cooler ingredients",
    countedItemsCount: 5,
    totalItemsCount: 6,
    progress: 83,
    differencesCount: 1,
    status: "In Progress",
    countedBy: "Ahmed Raza",
    notes: "Weekly physical audit for Walk-in Cooler",
    items: [
      { id: "ing-1-Walk-in-Cooler", ingredientId: "ing-1", location: "Walk-in Cooler", name: "Chicken Breast", systemStock: 8, countedStock: 8, unit: "kg", unitCost: 920, diff: 0, status: "Match" },
      { id: "ing-2-Walk-in-Cooler", ingredientId: "ing-2", location: "Walk-in Cooler", name: "Mozzarella Cheese", systemStock: 18, countedStock: 18, unit: "kg", unitCost: 1250, diff: 0, status: "Match" },
      { id: "ing-5-Walk-in-Cooler", ingredientId: "ing-5", location: "Walk-in Cooler", name: "Tomatoes", systemStock: 12, countedStock: 10, unit: "kg", unitCost: 140, diff: -2, status: "Variance" },
      { id: "ing-6-Walk-in-Cooler", ingredientId: "ing-6", location: "Walk-in Cooler", name: "Heavy Cream", systemStock: 14, countedStock: 14, unit: "L", unitCost: 580, diff: 0, status: "Match" },
      { id: "ing-10-Walk-in-Cooler", ingredientId: "ing-10", location: "Walk-in Cooler", name: "Beef Mince", systemStock: 15, countedStock: 15, unit: "kg", unitCost: 1450, diff: 0, status: "Match" },
      { id: "ing-13-Walk-in-Cooler", ingredientId: "ing-13", location: "Walk-in Cooler", name: "Fresh Basil", systemStock: 0, countedStock: null, unit: "kg", unitCost: 450, diff: null, status: "Uncounted" }
    ]
  },
  {
    id: "CNT-1046",
    date: "2026-09-21 10:00",
    displayDate: "21 Sep 2026, 10:00 AM",
    location: "Dry Store",
    scope: "Dry Store ingredients",
    countedItemsCount: 4,
    totalItemsCount: 4,
    progress: 100,
    differencesCount: 0,
    status: "Completed",
    countedBy: "Ahmed Raza",
    notes: "All dry spices reconciled"
  }
];

export const INITIAL_WASTAGE = [
  {
    id: "WST-2041",
    ingredientName: "Cooking Oil",
    ingredientId: "ing-3",
    quantity: 2,
    unit: "L",
    reason: "Deep frying burn / overheated",
    category: "Dry Goods",
    cost: 820,
    location: "Kitchen Prep",
    recordedBy: "Ahmed Raza",
    date: `${getLocalDateKey(new Date(), 'Asia/Karachi')} 11:30`,
    displayDate: "Today, 11:30 AM",
    notes: "Oil temperature sensor malfunctioned causing scorch."
  },
  {
    id: "WST-2040",
    ingredientName: "Chicken Breast",
    ingredientId: "ing-1",
    quantity: 0.5,
    unit: "kg",
    reason: "Expired prep batch",
    category: "Proteins",
    cost: 460,
    location: "Walk-in Cooler",
    recordedBy: "Ahmed Raza",
    date: "2026-09-24 09:15",
    displayDate: "24 Sep 2026, 09:15 AM",
    notes: "Batch reached shelf life past marination."
  }
];

export const INITIAL_TRANSFERS = [
  {
    id: "TRF-5011",
    fromLocation: "Main Store",
    toLocation: "Kitchen Prep",
    itemCount: 2,
    status: "In Transit",
    requestedBy: "Ahmed Raza",
    date: getLocalDateKey(new Date(), 'Asia/Karachi'),
    displayDate: "Today",
    items: [
      { ingredientId: "ing-7", name: "Potatoes", qty: "5 kg" },
      { ingredientId: "ing-8", name: "Burger Buns", qty: "20 pcs" }
    ],
    notes: "Daily kitchen prep dispatch"
  },
  {
    id: "TRF-5010",
    fromLocation: "Dry Store",
    toLocation: "Kitchen Prep",
    itemCount: 1,
    status: "Completed",
    requestedBy: "Ahmed Raza",
    date: "2026-09-23",
    displayDate: "23 Sep 2026",
    items: [
      { ingredientId: "ing-3", name: "Cooking Oil", qty: "2 L" }
    ],
    notes: "Fryer station refill"
  }
];

export const INITIAL_PURCHASES = [
  {
    id: "PO-8821",
    supplier: "Fresh Foods Supplier",
    totalAmount: 84500,
    itemCount: 2,
    status: "Awaiting Receiving",
    orderDate: getLocalDateKey(new Date(), 'Asia/Karachi'),
    displayDate: "Today",
    expectedDelivery: "Today, 4:00 PM",
    createdBy: "Ahmed Raza",
    items: [
      { ingredientId: "ing-1", ingredient: "Chicken Breast", quantity: 50, unit: "kg", unitCost: 920, total: 46000 },
      { ingredientId: "ing-10", ingredient: "Beef Mince", quantity: 25, unit: "kg", unitCost: 1450, total: 36250 }
    ]
  },
  {
    id: "PO-8820",
    supplier: "Oil & Pantry Traders",
    totalAmount: 32800,
    itemCount: 1,
    status: "Received",
    orderDate: "2026-09-21",
    displayDate: "21 Sep 2026",
    expectedDelivery: "21 Sep 2026",
    createdBy: "Ahmed Raza",
    items: [
      { ingredientId: "ing-3", ingredient: "Cooking Oil", quantity: 80, unit: "L", unitCost: 410, total: 32800 }
    ]
  }
];

export const INITIAL_RECIPES = [
  {
    id: "RCP-1026",
    name: "Chicken Zinger Burger",
    category: "Burgers",
    type: "Finished Menu Item",
    status: "Active",
    yield: "10 Portions",
    yieldPortions: 10,
    prepTime: "15 min",
    ingredientCost: 2499,
    packagingCost: 150,
    labourCost: 250,
    totalBatchCost: 2899,
    costPerPortion: 289.90,
    sellingPrice: 550,
    foodCostPct: 52.7,
    margin: 47.3,
    cost: 289.90,
    price: 550,
    ingredients: [
      { ingredientId: "ing-1", name: "Chicken Breast", quantity: "200 g", portionQuantity: "200 g", quantityPerPortion: 200, unit: "g", cost: 1840, portionCost: 184 },
      { ingredientId: "ing-8", name: "Burger Buns", quantity: "1 pcs", portionQuantity: "1 pcs", quantityPerPortion: 1, unit: "pcs", cost: 450, portionCost: 45 },
      { ingredientId: "ing-2", name: "Mozzarella Cheese", quantity: "40 g", portionQuantity: "40 g", quantityPerPortion: 40, unit: "g", cost: 500, portionCost: 50 },
      { ingredientId: "ing-3", name: "Cooking Oil", quantity: "20 ml", portionQuantity: "20 ml", quantityPerPortion: 20, unit: "ml", cost: 82, portionCost: 8.2 },
      { ingredientId: "ing-9", name: "Mayonnaise", quantity: "15 g", portionQuantity: "15 g", quantityPerPortion: 15, unit: "g", cost: 57, portionCost: 5.7 },
      { ingredientId: "ing-5", name: "Tomatoes", quantity: "21.4 g", portionQuantity: "21.4 g", quantityPerPortion: 21.4, unit: "g", cost: 30, portionCost: 3 }
    ]
  },
  {
    id: "rcp-2",
    name: "Crispy Fries (Large)",
    category: "Sides",
    type: "Side Dish",
    status: "Active",
    yield: "5 Portions",
    yieldPortions: 5,
    prepTime: "8 min",
    ingredientCost: 425,
    packagingCost: 75,
    labourCost: 100,
    totalBatchCost: 600,
    costPerPortion: 120,
    sellingPrice: 280,
    foodCostPct: 42.9,
    margin: 57.1,
    cost: 120,
    price: 280,
    ingredients: [
      { ingredientId: "ing-7", name: "Potatoes", quantity: "350 g", portionQuantity: "350 g", quantityPerPortion: 350, unit: "g", cost: 157.5, portionCost: 31.5 },
      { ingredientId: "ing-3", name: "Cooking Oil", quantity: "80 ml", portionQuantity: "80 ml", quantityPerPortion: 80, unit: "ml", cost: 164, portionCost: 32.8 },
      { ingredientId: "ing-11", name: "Takeaway Boxes", quantity: "1 pcs", portionQuantity: "1 pcs", quantityPerPortion: 1, unit: "pcs", cost: 110, portionCost: 22 }
    ]
  }
];

export const INITIAL_PRODUCTIONS = [
  {
    id: "PB-1025",
    recipeName: "Chicken Zinger Burger",
    recipeId: "RCP-1026",
    station: "Fryer Station",
    branch: "Main Branch",
    plannedQuantity: 100,
    actualOutput: 95,
    productionWastage: 5,
    unaccountedQuantity: 0,
    yieldPct: 95.0,
    batchSize: "100 pcs",
    yieldPortions: "95 pcs",
    location: "Kitchen Prep",
    producedBy: "Ahmed Raza",
    qualityResult: "Pass",
    qualityNotes: "",
    estimatedBatchCost: 35000,
    date: getLocalDateKey(new Date(), 'Asia/Karachi'),
    displayDate: "Today, In Progress",
    status: "In Progress",
    notes: "Signature crispy chicken fillets with house spicy glaze."
  }
];

export const INITIAL_STAFF = [
  {
    id: "stf-1",
    name: "Ahmed Raza",
    role: "General Manager",
    department: "Operations & Management",
    email: "ahmed.raza@restaurant.internal",
    phone: "+92 300 5551234",
    status: "Active",
    initials: "AR",
    joinedDate: "15 Jan 2024",
    accessLevel: "Manager"
  },
  {
    id: "stf-2",
    name: "Tariq Jameel",
    role: "Head Chef",
    department: "Kitchen Team",
    email: "tariq.chef@restaurant.internal",
    phone: "+92 321 4445566",
    status: "Active",
    initials: "TJ",
    joinedDate: "01 Mar 2024",
    accessLevel: "Kitchen Lead"
  },
  {
    id: "stf-3",
    name: "Zainab Noor",
    role: "Inventory Supervisor",
    department: "Receiving & Inventory",
    email: "zainab.noor@restaurant.internal",
    phone: "+92 333 8889900",
    status: "Active",
    initials: "ZN",
    joinedDate: "10 Jun 2024",
    accessLevel: "Supervisor"
  },
  {
    id: "stf-4",
    name: "Hamza Malik",
    role: "Line Cook",
    department: "Kitchen Team",
    email: "hamza.cook@restaurant.internal",
    phone: "+92 345 1112233",
    status: "Active",
    initials: "HM",
    joinedDate: "20 Aug 2024",
    accessLevel: "Staff"
  },
  {
    id: "stf-5",
    name: "Bilal Siddiqui",
    role: "Storekeeper",
    department: "Main Store & Warehousing",
    email: "bilal.store@restaurant.internal",
    phone: "+92 312 3337788",
    status: "Active",
    initials: "BS",
    joinedDate: "05 Nov 2024",
    accessLevel: "Staff"
  },
  {
    id: "stf-6",
    name: "Zubair Khan",
    role: "Sous Chef",
    department: "Kitchen Team",
    email: "zubair.sous@restaurant.internal",
    phone: "+92 333 7771122",
    status: "Active",
    initials: "ZK",
    joinedDate: "12 Dec 2024",
    accessLevel: "Staff"
  },
  {
    id: "stf-7",
    name: "Farhan Akhtar",
    role: "Kitchen Prep Assistant",
    department: "Kitchen Team",
    email: "farhan.prep@restaurant.internal",
    phone: "+92 344 8882233",
    status: "Pending",
    initials: "FA",
    joinedDate: "25 Sep 2026",
    accessLevel: "Staff"
  },
  {
    id: "stf-8",
    name: "Usman Ghani",
    role: "Junior Stock Clerk",
    department: "Receiving & Inventory",
    email: "usman.ghani@restaurant.internal",
    phone: "+92 311 9993344",
    status: "Inactive",
    initials: "UG",
    joinedDate: "10 Feb 2024",
    accessLevel: "Staff"
  }
];

export const INITIAL_SETTINGS = {
  restaurantName: "Restaurant Inventory & Operations",
  branchName: "Main Branch",
  currency: "PKR",
  timezone: "Asia/Karachi",
  recipeCostPrecision: "2 decimals",
  purchaseVarianceThreshold: "5%",
  lowStockAlertThreshold: 20,
  emailNotifications: true,
  autoReorderSuggestions: false,
  dateFormat: "DD MMM YYYY",
  defaultLanguage: "English (US)"
};
