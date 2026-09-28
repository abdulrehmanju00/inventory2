// Prototype Platform Data for Platform Super Admin
// Isolated from individual restaurant operational inventory data

export const PLATFORM_STORAGE_KEY = 'restaurant_platform_data_v1';

export const INITIAL_PLATFORM_RESTAURANTS = [
  {
    id: "rest-001",
    name: "Demo Restaurant",
    legalName: "Demo Restaurant (Pvt.) Ltd.",
    code: "DEMO-001",
    ownerName: "Ahmed Raza",
    ownerEmail: "owner@restaurant.test",
    ownerPhone: "+92 300 1234567",
    phone: "+92 42 35789000",
    email: "contact@demorestaurant.pk",
    address: "Plot 14-C, Main Boulevard, Gulberg III",
    city: "Lahore",
    country: "Pakistan",
    status: "Active",
    plan: "Professional",
    currency: "PKR",
    timezone: "Asia/Karachi",
    dateFormat: "DD MMM YYYY",
    branches: 1,
    users: 2,
    createdAt: "2026-09-01",
    setupStatus: "Completed",
    setupSteps: {
      restaurantInfo: "Completed",
      branch: "Completed",
      storageLocations: "Completed",
      ownerUsers: "Completed",
      staff: "Completed",
      suppliers: "Completed",
      initialInventory: "Completed",
      complete: "Completed"
    }
  },
  {
    id: "rest-002",
    name: "Coco Cubano",
    legalName: "Coco Cubano Hospitality (Pvt.) Ltd.",
    code: "COCO-001",
    ownerName: "Usman Khan",
    ownerEmail: "owner@cococubano.test",
    ownerPhone: "+92 321 9876543",
    phone: "+92 42 35871234",
    email: "info@cococubano.test",
    address: "12-K, Block H, Gulberg II",
    city: "Lahore",
    country: "Pakistan",
    status: "Trial",
    plan: "Trial",
    currency: "PKR",
    timezone: "Asia/Karachi",
    dateFormat: "DD MMM YYYY",
    branches: 2,
    users: 4,
    createdAt: "2026-09-20",
    setupStatus: "In Progress",
    setupSteps: {
      restaurantInfo: "Completed",
      branch: "Completed",
      storageLocations: "In Progress",
      ownerUsers: "Not Started",
      staff: "Not Started",
      suppliers: "Not Started",
      initialInventory: "Not Started",
      complete: "Not Started"
    }
  },
  {
    id: "rest-003",
    name: "Restaurant XYZ",
    legalName: "XYZ Diners Group",
    code: "XYZ-001",
    ownerName: "Sara Ahmed",
    ownerEmail: "owner@xyz.test",
    ownerPhone: "+92 333 4567890",
    phone: "+92 21 35123456",
    email: "admin@xyz.test",
    address: "Khayaban-e-Shahbaz, Phase 6, DHA",
    city: "Karachi",
    country: "Pakistan",
    status: "Suspended",
    plan: "Professional",
    currency: "PKR",
    timezone: "Asia/Karachi",
    dateFormat: "DD MMM YYYY",
    branches: 1,
    users: 1,
    createdAt: "2026-08-15",
    setupStatus: "Completed",
    setupSteps: {
      restaurantInfo: "Completed",
      branch: "Completed",
      storageLocations: "Completed",
      ownerUsers: "Completed",
      staff: "Completed",
      suppliers: "Completed",
      initialInventory: "Completed",
      complete: "Completed"
    }
  }
];

export const INITIAL_PLATFORM_ACTIVITY = [
  {
    id: "pact-1",
    title: "Coco Cubano created",
    date: "2026-09-20",
    displayDate: "20 Sep 2026",
    type: "create",
    details: "New trial organization onboarded with 2 branch locations."
  },
  {
    id: "pact-2",
    title: "Demo Restaurant setup completed",
    date: "2026-09-05",
    displayDate: "05 Sep 2026",
    type: "setup",
    details: "Inventory categories, locations and master recipes configured."
  },
  {
    id: "pact-3",
    title: "Restaurant XYZ suspended",
    date: "2026-09-25",
    displayDate: "25 Sep 2026",
    type: "suspend",
    details: "Account access restricted pending billing review."
  }
];

export const INITIAL_PLATFORM_BRANCHES = [
  {
    id: "branch-001",
    restaurantId: "rest-001",
    code: "BR-MAIN",
    name: "Main Branch",
    phone: "+92 42 35789000",
    email: "gulberg@demorestaurant.pk",
    address: "Plot 14-C, Main Boulevard, Gulberg III",
    city: "Lahore",
    status: "Active",
    setupStatus: "Completed",
    createdAt: "2026-09-01"
  },
  {
    id: "branch-002",
    restaurantId: "rest-002",
    code: "BR-MAIN",
    name: "Main Branch",
    phone: "+92 42 35871234",
    email: "gulberg@cococubano.test",
    address: "12-K, Block H, Gulberg II",
    city: "Lahore",
    status: "Active",
    setupStatus: "Completed",
    createdAt: "2026-09-20"
  },
  {
    id: "branch-003",
    restaurantId: "rest-002",
    code: "BR-KIOSK",
    name: "Express Kiosk",
    phone: "+92 42 35871235",
    email: "express@cococubano.test",
    address: "Food Court, Packages Mall",
    city: "Lahore",
    status: "Active",
    setupStatus: "In Progress",
    createdAt: "2026-09-21"
  },
  {
    id: "branch-004",
    restaurantId: "rest-003",
    code: "BR-MAIN",
    name: "Main Branch",
    phone: "+92 21 35123456",
    email: "dha@xyz.test",
    address: "Khayaban-e-Shahbaz, Phase 6, DHA",
    city: "Karachi",
    status: "Active",
    setupStatus: "Completed",
    createdAt: "2026-08-15"
  }
];

export const INITIAL_PLATFORM_STORAGE_LOCATIONS = [
  { id: "loc-001", restaurantId: "rest-001", branchId: "branch-001", name: "Main Store", type: "General Store", status: "Active" },
  { id: "loc-002", restaurantId: "rest-001", branchId: "branch-001", name: "Walk-in Cooler", type: "Cold Storage", status: "Active" },
  { id: "loc-003", restaurantId: "rest-001", branchId: "branch-001", name: "Dry Store", type: "Dry Storage", status: "Active" },
  { id: "loc-004", restaurantId: "rest-001", branchId: "branch-001", name: "Kitchen Prep", type: "Kitchen / Prep", status: "Active" },
  { id: "loc-005", restaurantId: "rest-002", branchId: "branch-002", name: "Main Store", type: "General Store", status: "Active" },
  { id: "loc-006", restaurantId: "rest-002", branchId: "branch-002", name: "Walk-in Cooler", type: "Cold Storage", status: "Active" },
  { id: "loc-007", restaurantId: "rest-002", branchId: "branch-002", name: "Dry Store", type: "Dry Storage", status: "Active" },
  { id: "loc-008", restaurantId: "rest-002", branchId: "branch-002", name: "Kitchen Prep", type: "Kitchen / Prep", status: "Active" },
  { id: "loc-009", restaurantId: "rest-002", branchId: "branch-003", name: "Kiosk Storage", type: "General Store", status: "Active" },
  { id: "loc-010", restaurantId: "rest-002", branchId: "branch-003", name: "Beverage Cooler", type: "Cold Storage", status: "Active" },
  { id: "loc-011", restaurantId: "rest-003", branchId: "branch-004", name: "Main Store", type: "General Store", status: "Active" },
  { id: "loc-012", restaurantId: "rest-003", branchId: "branch-004", name: "Cold Storage", type: "Cold Storage", status: "Active" }
];

export const INITIAL_PLATFORM_MEMBERS = [
  {
    id: "mem-001",
    restaurantId: "rest-001",
    userId: "usr-001",
    name: "Ahmed Raza",
    email: "owner@restaurant.test",
    phone: "+92 300 1234567",
    role: "Restaurant Owner",
    status: "Active",
    branchAccess: ["all"],
    accountType: "restaurant_user",
    createdAt: "2026-09-01",
    lastUpdatedAt: "2026-09-01"
  },
  {
    id: "mem-002",
    restaurantId: "rest-001",
    userId: null,
    name: "Zayd Hassan",
    email: "zayd@demorestaurant.pk",
    phone: "+92 302 9988776",
    role: "Operations Lead",
    status: "Active",
    branchAccess: ["branch-001"],
    accountType: "restaurant_user",
    createdAt: "2026-09-03",
    lastUpdatedAt: "2026-09-03"
  },
  {
    id: "mem-003",
    restaurantId: "rest-002",
    userId: null,
    name: "Usman Khan",
    email: "owner@cococubano.test",
    phone: "+92 321 9876543",
    role: "Restaurant Owner",
    status: "Pending",
    branchAccess: ["all"],
    accountType: "restaurant_user",
    createdAt: "2026-09-20",
    lastUpdatedAt: "2026-09-20"
  },
  {
    id: "mem-004",
    restaurantId: "rest-002",
    userId: null,
    name: "Bilal Tariq",
    email: "bilal.tariq@cococubano.test",
    phone: "+92 322 4433221",
    role: "Operations Lead",
    status: "Active",
    branchAccess: ["all"],
    accountType: "restaurant_user",
    createdAt: "2026-09-21",
    lastUpdatedAt: "2026-09-21"
  },
  {
    id: "mem-005",
    restaurantId: "rest-002",
    userId: null,
    name: "Ayesha Malik",
    email: "ayesha.m@cococubano.test",
    phone: "+92 301 5566778",
    role: "Inventory Manager",
    status: "Active",
    branchAccess: ["branch-002"],
    accountType: "restaurant_user",
    createdAt: "2026-09-22",
    lastUpdatedAt: "2026-09-22"
  },
  {
    id: "mem-006",
    restaurantId: "rest-002",
    userId: null,
    name: "Farhan Ali",
    email: "farhan.k@cococubano.test",
    phone: "+92 334 7788990",
    role: "Kitchen Manager",
    status: "Inactive",
    branchAccess: ["branch-002", "branch-003"],
    accountType: "restaurant_user",
    createdAt: "2026-09-23",
    lastUpdatedAt: "2026-09-23"
  },
  {
    id: "mem-007",
    restaurantId: "rest-003",
    userId: null,
    name: "Sara Ahmed",
    email: "owner@xyz.test",
    phone: "+92 333 4567890",
    role: "Restaurant Owner",
    status: "Active",
    branchAccess: ["all"],
    accountType: "restaurant_user",
    createdAt: "2026-08-15",
    lastUpdatedAt: "2026-08-15"
  }
];

export const INITIAL_PLATFORM_STAFF = [
  { id: "pstf-001", restaurantId: "rest-001", branchId: "branch-001", name: "Hamza Malik", role: "Chef", department: "Kitchen", status: "Active", createdAt: "2026-09-02" },
  { id: "pstf-002", restaurantId: "rest-002", branchId: "branch-002", name: "Kashif Riaz", role: "General Manager", department: "Management", status: "Active", createdAt: "2026-09-20" },
  { id: "pstf-003", restaurantId: "rest-002", branchId: "branch-002", name: "Shahid Afridi", role: "Head Chef", department: "Kitchen", status: "Active", createdAt: "2026-09-21" },
  { id: "pstf-004", restaurantId: "rest-002", branchId: "branch-002", name: "Adeel Munir", role: "Storekeeper", department: "Inventory / Operations", status: "Active", createdAt: "2026-09-21" }
];

export const INITIAL_PLATFORM_ADMINS = [
  {
    id: "admin-001",
    name: "Platform Admin",
    email: "admin@platform.test",
    role: "Super Admin",
    status: "Active",
    accountType: "platform_admin",
    createdAt: "2026-08-01",
    lastUpdatedAt: "2026-08-01"
  }
];

export const INITIAL_PLATFORM_PLANS = [
  {
    id: "plan-trial",
    name: "Trial",
    description: "Starter evaluation plan with single-branch access and essential operational tools.",
    status: "Active",
    priceMonthly: 0,
    currency: "PKR",
    trialDays: 14,
    limits: {
      branches: 1,
      users: 3,
      storageLocations: 4
    },
    features: {
      inventory: true,
      stockCounts: true,
      wastage: true,
      transfers: true,
      purchases: true,
      suppliers: true,
      recipes: true,
      production: true,
      reports: true,
      staff: true
    },
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01"
  },
  {
    id: "plan-professional",
    name: "Professional",
    description: "Comprehensive multi-branch operations and advanced kitchen & purchasing management.",
    status: "Active",
    priceMonthly: 0,
    currency: "PKR",
    trialDays: 0,
    limits: {
      branches: 10,
      users: 50,
      storageLocations: 50
    },
    features: {
      inventory: true,
      stockCounts: true,
      wastage: true,
      transfers: true,
      purchases: true,
      suppliers: true,
      recipes: true,
      production: true,
      reports: true,
      staff: true
    },
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01"
  }
];

export const INITIAL_PLATFORM_SUPPLIERS = [];

export const INITIAL_PLATFORM_INITIAL_INVENTORY = [];

export function loadPlatformData() {
  try {
    const raw = localStorage.getItem(PLATFORM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.restaurants)) {
        return {
          restaurants: parsed.restaurants,
          branches: Array.isArray(parsed.branches) ? parsed.branches : INITIAL_PLATFORM_BRANCHES,
          storageLocations: (() => {
            if (!Array.isArray(parsed.storageLocations)) return INITIAL_PLATFORM_STORAGE_LOCATIONS;
            const existingIds = new Set(parsed.storageLocations.map(l => l.id));
            const missing = INITIAL_PLATFORM_STORAGE_LOCATIONS.filter(l => !existingIds.has(l.id));
            return [...parsed.storageLocations, ...missing];
          })(),
          restaurantMembers: (() => {
            if (!Array.isArray(parsed.restaurantMembers)) return INITIAL_PLATFORM_MEMBERS;
            // If parsed members have fewer items than initial template, ensure all initial members are available
            const existingIds = new Set(parsed.restaurantMembers.map(m => m.id));
            const missing = INITIAL_PLATFORM_MEMBERS.filter(m => !existingIds.has(m.id));
            return [...parsed.restaurantMembers, ...missing];
          })(),
          platformAdmins: Array.isArray(parsed.platformAdmins) && parsed.platformAdmins.length > 0
            ? parsed.platformAdmins
            : INITIAL_PLATFORM_ADMINS,
          plans: (() => {
            if (!Array.isArray(parsed.plans) || parsed.plans.length === 0) return INITIAL_PLATFORM_PLANS;
            const existingIds = new Set(parsed.plans.map(p => p.id));
            const missing = INITIAL_PLATFORM_PLANS.filter(p => !existingIds.has(p.id));
            return [...parsed.plans, ...missing];
          })(),
          staff: (() => {
            if (!Array.isArray(parsed.staff)) return INITIAL_PLATFORM_STAFF;
            const existingIds = new Set(parsed.staff.map(s => s.id));
            const missing = INITIAL_PLATFORM_STAFF.filter(s => !existingIds.has(s.id));
            return [...parsed.staff, ...missing];
          })(),
          suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : INITIAL_PLATFORM_SUPPLIERS,
          initialInventory: Array.isArray(parsed.initialInventory) ? parsed.initialInventory : INITIAL_PLATFORM_INITIAL_INVENTORY,
          activity: Array.isArray(parsed.activity) ? parsed.activity : INITIAL_PLATFORM_ACTIVITY,
          selectedRestaurantId: parsed.selectedRestaurantId || localStorage.getItem('platform_selected_restaurant_id') || 'rest-001',
          selectedBranchId: parsed.selectedBranchId || localStorage.getItem('platform_selected_branch_id') || 'branch-001'
        };
      }
    }
  } catch (err) {
    console.warn('[Platform Store] Could not read platform data from localStorage', err);
  }

  return {
    restaurants: INITIAL_PLATFORM_RESTAURANTS,
    branches: INITIAL_PLATFORM_BRANCHES,
    storageLocations: INITIAL_PLATFORM_STORAGE_LOCATIONS,
    restaurantMembers: INITIAL_PLATFORM_MEMBERS,
    platformAdmins: INITIAL_PLATFORM_ADMINS,
    plans: INITIAL_PLATFORM_PLANS,
    staff: INITIAL_PLATFORM_STAFF,
    suppliers: INITIAL_PLATFORM_SUPPLIERS,
    initialInventory: INITIAL_PLATFORM_INITIAL_INVENTORY,
    activity: INITIAL_PLATFORM_ACTIVITY,
    selectedRestaurantId: localStorage.getItem('platform_selected_restaurant_id') || 'rest-001',
    selectedBranchId: localStorage.getItem('platform_selected_branch_id') || 'branch-001'
  };
}

export function savePlatformData(data) {
  try {
    localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify(data));
    if (data.selectedRestaurantId) {
      localStorage.setItem('platform_selected_restaurant_id', data.selectedRestaurantId);
    }
    if (data.selectedBranchId) {
      localStorage.setItem('platform_selected_branch_id', data.selectedBranchId);
    }
  } catch (err) {
    console.warn('[Platform Store] Could not save platform data to localStorage', err);
  }
}

