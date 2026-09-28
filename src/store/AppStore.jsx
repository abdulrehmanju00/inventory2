import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_BRANCH,
  CURRENT_USER,
  STORAGE_LOCATIONS,
  INITIAL_INGREDIENTS,
  INITIAL_BALANCES,
  INITIAL_MOVEMENTS,
  INITIAL_STOCK_COUNTS,
  INITIAL_WASTAGE,
  INITIAL_TRANSFERS,
  INITIAL_PURCHASES,
  INITIAL_SUPPLIERS,
  INITIAL_RECIPES,
  INITIAL_PRODUCTIONS,
  INITIAL_STAFF,
  INITIAL_SETTINGS
} from '../data/mockData';
import {
  DEMO_USERS,
  SESSION_STORAGE_KEY,
  getStoredSession,
  saveStoredSession,
  clearStoredSession
} from '../data/mockAuth';
import {
  loadPlatformData,
  savePlatformData
} from '../data/mockPlatform';
import { calculateStockStatus } from '../utils/inventory';
import { convertUnits, calculateRecipeIngredientCost } from '../utils/units';
import {
  setFormattingConfig,
  formatCurrency as utilFormatCurrency,
  formatRecipeCost as utilFormatRecipeCost,
  formatDate as utilFormatDate,
  getLocalDateKey as utilGetLocalDateKey,
  getLocalTime as utilGetLocalTime
} from '../utils/formatting';

const STORAGE_KEY = 'restaurant_inventory_state_v2';

const AppContext = createContext(null);

function validateAndMigrateState(saved) {
  try {
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return null;

    // Check if location-aware balances exist and have items with location
    const validBalances = Array.isArray(parsed.balances) &&
      parsed.balances.length >= 4 &&
      parsed.balances.every(b => b && b.ingredientId && b.location && typeof b.quantity === 'number');

    if (!validBalances) {
      console.info('[Store Migration] Incompatible or legacy balances detected. Initializing canonical location balances.');
      return null;
    }

    // Ensure canonical recipe RCP-1026 exists
    let recipes = Array.isArray(parsed.recipes) ? parsed.recipes : INITIAL_RECIPES;
    if (!recipes.some(r => r.id === 'RCP-1026')) {
      recipes = INITIAL_RECIPES;
    }

    // Ensure canonical staff (8 items)
    let staff = Array.isArray(parsed.staff) && parsed.staff.length === 8 ? parsed.staff : INITIAL_STAFF;

    // Ensure canonical suppliers
    let suppliers = Array.isArray(parsed.suppliers) && parsed.suppliers.length >= 5 ? parsed.suppliers : INITIAL_SUPPLIERS;

    return {
      ingredients: Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0 ? parsed.ingredients : INITIAL_INGREDIENTS,
      balances: parsed.balances,
      movements: Array.isArray(parsed.movements) ? parsed.movements : INITIAL_MOVEMENTS,
      stockCounts: Array.isArray(parsed.stockCounts) ? parsed.stockCounts : INITIAL_STOCK_COUNTS,
      wastage: Array.isArray(parsed.wastage) ? parsed.wastage : INITIAL_WASTAGE,
      transfers: Array.isArray(parsed.transfers) ? parsed.transfers : INITIAL_TRANSFERS,
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : INITIAL_PURCHASES,
      suppliers,
      recipes,
      productions: Array.isArray(parsed.productions) ? parsed.productions : INITIAL_PRODUCTIONS,
      staff,
      settings: (() => {
        let st = parsed.settings && parsed.settings.currency ? parsed.settings : INITIAL_SETTINGS;
        if (st && st.timezone && typeof st.timezone === 'string' && st.timezone.includes('(')) {
          st = { ...st, timezone: st.timezone.split('(')[0].trim() || 'Asia/Karachi' };
        }
        return st;
      })(),
      activity: Array.isArray(parsed.activity) ? parsed.activity : [
        { id: 'act-1', text: 'Stock added · Chicken Breast (20 kg)', time: '12 min ago', type: 'primary' },
        { id: 'act-2', text: 'Wastage recorded · Cooking Oil (2 L)', time: '34 min ago', type: 'amber' },
        { id: 'act-3', text: 'Purchase created · Fresh Foods Supplier', time: '1 hr ago', type: 'primary' },
        { id: 'act-4', text: 'Stock count completed · Main Store', time: '2 hrs ago', type: 'secondary' }
      ]
    };
  } catch (e) {
    console.warn('[Store Migration] Corrupted storage, loading canonical prototype data', e);
    return null;
  }
}

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const migrated = validateAndMigrateState(saved);
      if (migrated) return migrated;
    }
  } catch (e) {
    console.warn('Could not read from localStorage', e);
  }

  return {
    ingredients: INITIAL_INGREDIENTS,
    balances: INITIAL_BALANCES,
    movements: INITIAL_MOVEMENTS,
    stockCounts: INITIAL_STOCK_COUNTS,
    wastage: INITIAL_WASTAGE,
    transfers: INITIAL_TRANSFERS,
    purchases: INITIAL_PURCHASES,
    suppliers: INITIAL_SUPPLIERS,
    recipes: INITIAL_RECIPES,
    productions: INITIAL_PRODUCTIONS,
    staff: INITIAL_STAFF,
    settings: INITIAL_SETTINGS,
    activity: [
      { id: 'act-1', text: 'Stock added · Chicken Breast (20 kg)', time: '12 min ago', type: 'primary' },
      { id: 'act-2', text: 'Wastage recorded · Cooking Oil (2 L)', time: '34 min ago', type: 'amber' },
      { id: 'act-3', text: 'Purchase created · Fresh Foods Supplier', time: '1 hr ago', type: 'primary' },
      { id: 'act-4', text: 'Stock count completed · Main Store', time: '2 hrs ago', type: 'secondary' }
    ]
  };
}

export function AppProvider({ children }) {
  const initialState = loadInitialState();

  const [currentUser, setCurrentUser] = useState(() => getStoredSession());
  const [settings, setSettings] = useState(initialState.settings);
  const currentBranch = currentUser?.branchName || settings?.branchName || INITIAL_BRANCH;

  // Core Location-Aware Data Store
  const [rawIngredients, setRawIngredients] = useState(initialState.ingredients);
  const [balances, setBalances] = useState(initialState.balances);
  const [movements, setMovements] = useState(initialState.movements);

  // Workflows
  const [stockCounts, setStockCounts] = useState(initialState.stockCounts);
  const [wastage, setWastage] = useState(initialState.wastage);
  const [transfers, setTransfers] = useState(initialState.transfers);
  const [purchases, setPurchases] = useState(initialState.purchases);
  const [suppliers, setSuppliers] = useState(initialState.suppliers);
  const [recipes, setRecipes] = useState(initialState.recipes);
  const [productions, setProductions] = useState(initialState.productions);
  const [staff, setStaff] = useState(initialState.staff);
  const [activity, setActivity] = useState(initialState.activity);

  // Active navigation selection
  const [selectedIngredientId, setSelectedIngredientId] = useState('ing-1');
  const [selectedStockCountId, setSelectedStockCountId] = useState('CNT-1047');
  const [selectedWastageId, setSelectedWastageId] = useState('WST-2041');
  const [selectedTransferId, setSelectedTransferId] = useState('TRF-5011');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState('PO-8821');
  const [selectedSupplierId, setSelectedSupplierId] = useState('SUP-1001');
  const [selectedRecipeId, setSelectedRecipeId] = useState('RCP-1026');

  // Platform Super Admin Prototype Store (isolated from restaurant inventory)
  const initialPlatform = useMemo(() => loadPlatformData(), []);
  const [platformRestaurants, setPlatformRestaurants] = useState(initialPlatform.restaurants);
  const [platformBranches, setPlatformBranches] = useState(initialPlatform.branches || []);
  const [platformStorageLocations, setPlatformStorageLocations] = useState(initialPlatform.storageLocations || []);
  const [platformMembers, setPlatformMembers] = useState(initialPlatform.restaurantMembers || []);
  const [platformAdmins, setPlatformAdmins] = useState(initialPlatform.platformAdmins || []);
  const [platformPlans, setPlatformPlans] = useState(initialPlatform.plans || []);
  const [platformStaff, setPlatformStaff] = useState(initialPlatform.staff || []);
  const [platformSuppliers, setPlatformSuppliers] = useState(initialPlatform.suppliers || []);
  const [platformInitialInventory, setPlatformInitialInventory] = useState(initialPlatform.initialInventory || []);
  const [platformActivity, setPlatformActivity] = useState(initialPlatform.activity);
  const [selectedRestaurantId, setSelectedRestaurantIdState] = useState(
    () => initialPlatform.selectedRestaurantId || localStorage.getItem('platform_selected_restaurant_id') || 'rest-001'
  );
  const [selectedBranchId, setSelectedBranchIdState] = useState(
    () => initialPlatform.selectedBranchId || localStorage.getItem('platform_selected_branch_id') || 'branch-001'
  );

  const setSelectedRestaurantId = useCallback((id) => {
    setSelectedRestaurantIdState(id);
    if (id) {
      localStorage.setItem('platform_selected_restaurant_id', id);
    } else {
      localStorage.removeItem('platform_selected_restaurant_id');
    }
  }, []);

  const setSelectedBranchId = useCallback((id) => {
    setSelectedBranchIdState(id);
    if (id) {
      localStorage.setItem('platform_selected_branch_id', id);
    } else {
      localStorage.removeItem('platform_selected_branch_id');
    }
  }, []);

  useEffect(() => {
    savePlatformData({
      restaurants: platformRestaurants,
      branches: platformBranches,
      storageLocations: platformStorageLocations,
      restaurantMembers: platformMembers,
      platformAdmins,
      plans: platformPlans,
      staff: platformStaff,
      suppliers: platformSuppliers,
      initialInventory: platformInitialInventory,
      activity: platformActivity,
      selectedRestaurantId,
      selectedBranchId
    });
  }, [
    platformRestaurants,
    platformBranches,
    platformStorageLocations,
    platformMembers,
    platformAdmins,
    platformPlans,
    platformStaff,
    platformSuppliers,
    platformInitialInventory,
    platformActivity,
    selectedRestaurantId,
    selectedBranchId
  ]);

  // Global Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', title: '' });

  const showToast = useCallback((message, type = 'success', title = '') => {
    setToast({ show: true, message, type, title });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const addActivity = useCallback((text, type = 'primary') => {
    setActivity(prev => [
      { id: `act-${Date.now()}`, text, time: 'Just now', type },
      ...prev.slice(0, 9)
    ]);
  }, []);

  const updatePlatformRestaurantStatus = useCallback((restaurantId, newStatus) => {
    setPlatformRestaurants(prev =>
      prev.map(r => (r.id === restaurantId ? { ...r, status: newStatus } : r))
    );
    const matched = platformRestaurants.find(r => r.id === restaurantId);
    const rName = matched?.name || restaurantId;
    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `${rName} ${newStatus === 'Suspended' ? 'suspended' : 'activated'}`,
        date: new Date().toISOString().split('T')[0],
        displayDate: 'Today',
        type: newStatus === 'Suspended' ? 'suspend' : 'status',
        details: `Platform account status transitioned to ${newStatus}.`
      },
      ...prev
    ]);
    showToast(`${rName} status updated to ${newStatus}`, 'success', 'Restaurant Status Updated');
  }, [platformRestaurants, showToast]);

  const createPlatformRestaurant = useCallback((restaurantData, initialBranchName = 'Main Branch') => {
    // 1. Duplicate check (case-insensitive restaurant name + owner email)
    const exists = platformRestaurants.some(
      r => (r.name || '').trim().toLowerCase() === (restaurantData.name || '').trim().toLowerCase() &&
           (r.ownerEmail || '').trim().toLowerCase() === (restaurantData.ownerEmail || '').trim().toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'A restaurant with this name and owner email already exists.' };
    }

    // 2. Generate stable restaurant ID (rest-004, etc.)
    const existingRestNums = platformRestaurants
      .map(r => {
        const m = (r.id || '').match(/^rest-(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextRestNum = (existingRestNums.length > 0 ? Math.max(...existingRestNums) : 3) + 1;
    const newRestaurantId = `rest-${String(nextRestNum).padStart(3, '0')}`;

    // 3. Generate restaurant code if not provided
    let finalCode = (restaurantData.code || '').trim().toUpperCase();
    if (!finalCode) {
      const cleanPrefix = (restaurantData.name || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'REST';
      finalCode = `${cleanPrefix}-${String(nextRestNum).padStart(3, '0')}`;
    }

    // 4. Generate stable branch ID (branch-005, etc.)
    const existingBranchNums = platformBranches
      .map(b => {
        const m = (b.id || '').match(/^branch-(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextBranchNum = (existingBranchNums.length > 0 ? Math.max(...existingBranchNums) : 4) + 1;
    const newBranchId = `branch-${String(nextBranchNum).padStart(3, '0')}`;

    const createdAtDate = new Date().toISOString().split('T')[0];

    // 5. Build restaurant record
    const newRestaurant = {
      id: newRestaurantId,
      code: finalCode,
      name: (restaurantData.name || '').trim(),
      legalName: (restaurantData.legalName || '').trim(),
      ownerName: (restaurantData.ownerName || '').trim(),
      ownerEmail: (restaurantData.ownerEmail || '').trim().toLowerCase(),
      ownerPhone: (restaurantData.ownerPhone || '').trim(),
      phone: (restaurantData.phone || '').trim(),
      email: (restaurantData.email || '').trim().toLowerCase(),
      address: (restaurantData.address || '').trim(),
      city: (restaurantData.city || '').trim(),
      country: restaurantData.country || 'Pakistan',
      currency: restaurantData.currency || 'PKR',
      timezone: restaurantData.timezone || 'Asia/Karachi',
      dateFormat: restaurantData.dateFormat || 'DD MMM YYYY',
      status: restaurantData.status || 'Trial',
      plan: restaurantData.plan || 'Trial',
      setupStatus: 'Not Started',
      branches: 1,
      users: 0,
      createdAt: createdAtDate
    };

    // 6. Build initial branch record
    const newBranch = {
      id: newBranchId,
      restaurantId: newRestaurantId,
      name: (initialBranchName || 'Main Branch').trim(),
      status: 'Active',
      createdAt: createdAtDate
    };

    // 7. Update platform stores
    setPlatformRestaurants(prev => [newRestaurant, ...prev]);
    setPlatformBranches(prev => [...prev, newBranch]);
    setSelectedRestaurantId(newRestaurantId);

    // 8. Add platform activity entry
    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `${newRestaurant.name} created`,
        date: createdAtDate,
        displayDate: 'Today',
        type: 'create',
        details: `New ${newRestaurant.status.toLowerCase()} restaurant created with initial branch "${newBranch.name}".`
      },
      ...prev
    ]);

    showToast('Restaurant created. Continue with initial setup.', 'success', 'Restaurant Workspace Created');
    return { success: true, restaurant: newRestaurant, branch: newBranch };
  }, [platformRestaurants, platformBranches, showToast]);

  const updatePlatformRestaurant = useCallback((restaurantId, updatedFields) => {
    setPlatformRestaurants(prev =>
      prev.map(r => (r.id === restaurantId ? { ...r, ...updatedFields } : r))
    );
    const matched = platformRestaurants.find(r => r.id === restaurantId);
    const rName = updatedFields.name || matched?.name || restaurantId;
    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `${rName} updated`,
        date: new Date().toISOString().split('T')[0],
        displayDate: 'Today',
        type: 'edit',
        details: 'Restaurant account and regional details updated.'
      },
      ...prev
    ]);
    showToast(`${rName} updated successfully`, 'success', 'Restaurant Updated');
  }, [platformRestaurants, showToast]);

  const updatePlatformBranch = useCallback((branchId, updatedFields) => {
    setPlatformBranches(prev =>
      prev.map(b => (b.id === branchId ? { ...b, ...updatedFields } : b))
    );
  }, []);

  const togglePlatformBranchStatus = useCallback((branchId) => {
    const branchToToggle = platformBranches.find(b => b.id === branchId);
    if (!branchToToggle) return { success: false, error: 'Branch not found' };

    if (branchToToggle.status === 'Active') {
      const activeBranches = platformBranches.filter(
        b => b.restaurantId === branchToToggle.restaurantId && b.status === 'Active'
      );
      if (activeBranches.length <= 1) {
        showToast('At least one active branch is required.', 'error', 'Action Restricted');
        return { success: false, error: 'At least one active branch is required.' };
      }
    }

    const newStatus = branchToToggle.status === 'Active' ? 'Inactive' : 'Active';
    setPlatformBranches(prev =>
      prev.map(b => (b.id === branchId ? { ...b, status: newStatus } : b))
    );

    const matchedRest = platformRestaurants.find(r => r.id === branchToToggle.restaurantId);
    const restName = matchedRest?.name || 'Restaurant';
    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `${branchToToggle.name} (${restName}) ${newStatus.toLowerCase()}`,
        date: new Date().toISOString().split('T')[0],
        displayDate: 'Today',
        type: newStatus === 'Active' ? 'status' : 'suspend',
        details: `Branch location status changed to ${newStatus}.`
      },
      ...prev
    ]);

    showToast(`${branchToToggle.name} is now ${newStatus}`, 'success', 'Branch Status Updated');
    return { success: true, newStatus };
  }, [platformBranches, platformRestaurants, showToast]);

  const createPlatformBranch = useCallback((branchData, initialLocations = []) => {
    // 1. Generate sequential branch ID
    const existingBranchIds = platformBranches
      .map(b => parseInt(b.id?.replace('branch-', ''), 10))
      .filter(n => !isNaN(n));
    const nextBranchNum = existingBranchIds.length > 0 ? Math.max(...existingBranchIds) + 1 : 1;
    const newBranchId = `branch-${String(nextBranchNum).padStart(3, '0')}`;

    const createdAtDate = new Date().toISOString().split('T')[0];

    const newBranch = {
      id: newBranchId,
      restaurantId: branchData.restaurantId,
      code: branchData.code,
      name: branchData.name,
      phone: branchData.phone || '',
      email: branchData.email || '',
      address: branchData.address,
      city: branchData.city,
      country: branchData.country || 'Pakistan',
      status: branchData.status || 'Active',
      setupStatus: 'In Progress',
      createdAt: createdAtDate
    };

    // 2. Generate sequential location IDs
    const existingLocIds = platformStorageLocations
      .map(l => parseInt(l.id?.replace('loc-', ''), 10))
      .filter(n => !isNaN(n));
    let nextLocNum = existingLocIds.length > 0 ? Math.max(...existingLocIds) + 1 : 1;

    const newLocations = (initialLocations || []).map(loc => {
      const locId = `loc-${String(nextLocNum++).padStart(3, '0')}`;
      return {
        id: locId,
        restaurantId: branchData.restaurantId,
        branchId: newBranchId,
        name: loc.name,
        type: loc.type || 'General Store',
        status: 'Active',
        createdAt: createdAtDate
      };
    });

    // 3. Atomically update branches & locations in frontend state
    setPlatformBranches(prev => [...prev, newBranch]);
    if (newLocations.length > 0) {
      setPlatformStorageLocations(prev => [...prev, ...newLocations]);
    }

    // 4. Update selectedBranchId without modifying selectedRestaurantId
    setSelectedBranchId(newBranchId);

    // 5. Add platform activity
    const matchedRest = platformRestaurants.find(r => r.id === branchData.restaurantId);
    const restName = matchedRest?.name || 'Restaurant';
    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `${newBranch.name} added to ${restName}`,
        date: createdAtDate,
        displayDate: 'Today',
        type: 'branch',
        details: `New operating branch created in ${newBranch.city || 'unspecified city'} with ${newLocations.length} storage locations.`
      },
      ...prev
    ]);

    showToast('Branch created.', 'success', 'Branch Created');
    return { success: true, branch: newBranch, locations: newLocations };
  }, [platformBranches, platformStorageLocations, platformRestaurants, setSelectedBranchId, showToast]);

  const saveRestaurantStorageLocations = useCallback((restaurantId, branchId, locationsList) => {
    setPlatformStorageLocations(prev => {
      const filtered = prev.filter(l => !(l.restaurantId === restaurantId && l.branchId === branchId));
      return [...filtered, ...locationsList];
    });
  }, []);

  const createPlatformStorageLocation = useCallback((locationData) => {
    const { restaurantId, branchId, name, type, status } = locationData;
    const trimmedName = (name || '').trim();
    if (!trimmedName) {
      return { success: false, error: 'Location Name is required.' };
    }

    // Duplicate check within same branch (active locations)
    const isDuplicate = platformStorageLocations.some(
      l => l.restaurantId === restaurantId &&
           l.branchId === branchId &&
           l.status === 'Active' &&
           (l.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      return { success: false, error: 'An active storage location with this name already exists in this branch.' };
    }

    const existingNums = platformStorageLocations
      .map(l => {
        const match = (l.id || '').match(/^(?:loc)-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    const newLocId = `loc-${String(nextNum).padStart(3, '0')}`;
    const todayDate = new Date().toISOString().split('T')[0];

    const newLocation = {
      id: newLocId,
      restaurantId,
      branchId,
      name: trimmedName,
      type: type || 'General Store',
      status: status || 'Active',
      createdAt: todayDate
    };

    setPlatformStorageLocations(prev => [...prev, newLocation]);

    // Platform activity
    const matchedBranch = platformBranches.find(b => b.id === branchId);
    const branchName = matchedBranch?.name || 'Branch';
    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `Storage location "${trimmedName}" added to ${branchName}`,
        date: todayDate,
        displayDate: 'Today',
        type: 'location',
        details: `New ${newLocation.type} storage area created (${newLocation.status}).`
      },
      ...prev
    ]);

    showToast(`Storage location "${trimmedName}" created`, 'success', 'Location Created');
    return { success: true, location: newLocation };
  }, [platformStorageLocations, platformBranches, showToast]);

  const updatePlatformStorageLocation = useCallback((locationId, updatedFields) => {
    let result = { success: false, error: '' };
    setPlatformStorageLocations(prev => {
      const target = prev.find(l => l.id === locationId);
      if (!target) {
        result = { success: false, error: 'Storage location not found.' };
        return prev;
      }

      // Check last-active location protection if changing status to Inactive
      if (target.status === 'Active' && updatedFields.status === 'Inactive') {
        const remainingActive = prev.filter(
          l => l.restaurantId === target.restaurantId &&
               l.branchId === target.branchId &&
               l.status === 'Active' &&
               l.id !== locationId
        );
        if (remainingActive.length === 0) {
          result = { success: false, error: 'At least one active storage location is required.' };
          return prev;
        }
      }

      // Check duplicate name within the branch if name is being changed
      if (updatedFields.name) {
        const trimmedName = updatedFields.name.trim().toLowerCase();
        const willBeActive = updatedFields.status ? updatedFields.status === 'Active' : target.status === 'Active';
        if (willBeActive) {
          const duplicate = prev.some(
            l => l.restaurantId === target.restaurantId &&
                 l.branchId === target.branchId &&
                 l.id !== locationId &&
                 l.status === 'Active' &&
                 (l.name || '').trim().toLowerCase() === trimmedName
          );
          if (duplicate) {
            result = { success: false, error: 'An active storage location with this name already exists in this branch.' };
            return prev;
          }
        }
      }

      result = { success: true };
      return prev.map(l => (l.id === locationId ? { ...l, ...updatedFields } : l));
    });
    return result;
  }, []);

  const togglePlatformStorageLocationStatus = useCallback((locationId) => {
    let result = { success: false, error: '', nextStatus: '' };
    setPlatformStorageLocations(prev => {
      const target = prev.find(l => l.id === locationId);
      if (!target) {
        result = { success: false, error: 'Storage location not found.' };
        return prev;
      }

      // If active, it will become Inactive -> check last active location rule
      if (target.status === 'Active') {
        const remainingActive = prev.filter(
          l => l.restaurantId === target.restaurantId &&
               l.branchId === target.branchId &&
               l.status === 'Active' &&
               l.id !== locationId
        );
        if (remainingActive.length === 0) {
          result = { success: false, error: 'At least one active storage location is required.' };
          return prev;
        }
      } else {
        // If inactive, it will become Active -> check duplicate name with existing active locations
        const duplicate = prev.some(
          l => l.restaurantId === target.restaurantId &&
               l.branchId === target.branchId &&
               l.id !== locationId &&
               l.status === 'Active' &&
               (l.name || '').trim().toLowerCase() === (target.name || '').trim().toLowerCase()
        );
        if (duplicate) {
          result = { success: false, error: 'An active storage location with this name already exists in this branch.' };
          return prev;
        }
      }

      const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';
      result = { success: true, nextStatus, location: target };
      return prev.map(l => (l.id === locationId ? { ...l, status: nextStatus } : l));
    });
    return result;
  }, []);

  const saveRestaurantMembers = useCallback((restaurantId, membersList) => {
    setPlatformMembers(prev => {
      const filtered = prev.filter(m => m.restaurantId !== restaurantId);
      return [...filtered, ...membersList];
    });
  }, []);

  const updatePlatformMember = useCallback((memberId, updatedFields) => {
    let result = { success: false, error: '' };
    setPlatformMembers(prev => {
      const target = prev.find(m => m.id === memberId);
      if (!target) {
        result = { success: false, error: 'User not found.' };
        return prev;
      }

      // Check last-owner protection if changing role or status
      const willDemoteOwner = target.role === 'Restaurant Owner' && updatedFields.role && updatedFields.role !== 'Restaurant Owner';
      const willDeactivateOwner = target.role === 'Restaurant Owner' && updatedFields.status === 'Inactive';
      if (willDemoteOwner || willDeactivateOwner) {
        const remainingActiveOwners = prev.filter(
          m => m.restaurantId === target.restaurantId &&
               m.role === 'Restaurant Owner' &&
               (m.status === 'Active' || m.status === 'Pending') &&
               m.id !== memberId
        );
        if (remainingActiveOwners.length === 0) {
          result = { success: false, error: 'At least one Restaurant Owner is required.' };
          return prev;
        }
      }

      result = { success: true };
      return prev.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            ...updatedFields,
            lastUpdatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return m;
      });
    });
    return result;
  }, []);

  const togglePlatformMemberStatus = useCallback((memberId) => {
    let result = { success: false, error: '', nextStatus: '' };
    setPlatformMembers(prev => {
      const target = prev.find(m => m.id === memberId);
      if (!target) {
        result = { success: false, error: 'User not found.' };
        return prev;
      }

      // If active or pending, target will become inactive -> check last-owner rule
      if (target.role === 'Restaurant Owner' && target.status !== 'Inactive') {
        const remainingActiveOwners = prev.filter(
          m => m.restaurantId === target.restaurantId &&
               m.role === 'Restaurant Owner' &&
               (m.status === 'Active' || m.status === 'Pending') &&
               m.id !== memberId
        );
        if (remainingActiveOwners.length === 0) {
          result = { success: false, error: 'At least one Restaurant Owner is required.' };
          return prev;
        }
      }

      const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';
      result = { success: true, nextStatus, member: target };
      return prev.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            status: nextStatus,
            lastUpdatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return m;
      });
    });
    return result;
  }, []);

  const createPlatformMember = useCallback((memberData) => {
    // 1. Generate sequential member ID (e.g. member-008)
    const existingMemberNums = platformMembers
      .map(m => {
        const match = (m.id || '').match(/^(?:mem|member)-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextNum = existingMemberNums.length > 0 ? Math.max(...existingMemberNums) + 1 : 8;
    const newMemberId = `member-${String(nextNum).padStart(3, '0')}`;

    const todayDate = new Date().toISOString().split('T')[0];

    const newMember = {
      id: newMemberId,
      restaurantId: memberData.restaurantId,
      name: (memberData.name || '').trim(),
      email: (memberData.email || '').trim().toLowerCase(),
      phone: (memberData.phone || '').trim(),
      role: memberData.role || 'Operations Lead',
      status: memberData.status || 'Pending',
      branchAccess: Array.isArray(memberData.branchAccess) && memberData.branchAccess.length > 0
        ? memberData.branchAccess
        : ['all'],
      accountType: 'restaurant_user',
      createdAt: todayDate,
      lastUpdatedAt: todayDate
    };

    // Update shared platform members state
    setPlatformMembers(prev => [...prev, newMember]);

    // Add platform activity
    const matchedRest = platformRestaurants.find(r => r.id === memberData.restaurantId);
    const restName = matchedRest?.name || 'Restaurant';
    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `${newMember.name} added to ${restName} as ${newMember.role}`,
        date: todayDate,
        displayDate: 'Today',
        type: 'member',
        details: `New prototype user added with ${newMember.branchAccess.includes('all') ? 'All Branches' : newMember.branchAccess.length + ' branch(es)'} access (${newMember.status}).`
      },
      ...prev
    ]);

    showToast('Restaurant user added.', 'success', 'Restaurant User Added');
    return { success: true, member: newMember };
  }, [platformMembers, platformRestaurants, showToast]);

  const createPlatformAdmin = useCallback((adminData) => {
    const trimmedEmail = (adminData.email || '').trim().toLowerCase();
    const trimmedName = (adminData.name || '').trim();

    if (!trimmedName) {
      return { success: false, error: 'Full Name is required.' };
    }
    if (!trimmedEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    // Duplicate check across platform admins
    const exists = platformAdmins.some(
      a => (a.email || '').trim().toLowerCase() === trimmedEmail
    );
    if (exists) {
      return { success: false, error: 'A platform admin with this email already exists.' };
    }

    const existingNums = platformAdmins
      .map(a => {
        const match = (a.id || '').match(/^(?:admin)-(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 2;
    const newAdminId = `admin-${String(nextNum).padStart(3, '0')}`;
    const todayDate = new Date().toISOString().split('T')[0];

    const newAdmin = {
      id: newAdminId,
      name: trimmedName,
      email: trimmedEmail,
      role: 'Super Admin',
      status: adminData.status || 'Active',
      accountType: 'platform_admin',
      createdAt: todayDate,
      lastUpdatedAt: todayDate
    };

    setPlatformAdmins(prev => [...prev, newAdmin]);

    // Add platform activity
    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `${newAdmin.name} added as Platform Super Admin`,
        date: todayDate,
        displayDate: 'Today',
        type: 'admin',
        details: `New platform administrator account created (${newAdmin.status}).`
      },
      ...prev
    ]);

    showToast('Platform admin added.', 'success', 'Admin Added');
    return { success: true, admin: newAdmin };
  }, [platformAdmins, showToast]);

  const updatePlatformAdmin = useCallback((adminId, updatedFields) => {
    let result = { success: false, error: '' };
    setPlatformAdmins(prev => {
      const target = prev.find(a => a.id === adminId);
      if (!target) {
        result = { success: false, error: 'Admin not found.' };
        return prev;
      }

      // Check if deactivating target would remove the last active Super Admin
      if (target.status === 'Active' && updatedFields.status === 'Inactive') {
        const activeAdmins = prev.filter(a => a.status === 'Active' && a.id !== adminId);
        if (activeAdmins.length === 0) {
          result = { success: false, error: 'At least one active Super Admin is required.' };
          return prev;
        }
      }

      // Duplicate email check
      if (updatedFields.email) {
        const trimmedEmail = updatedFields.email.trim().toLowerCase();
        const isDuplicate = prev.some(
          a => a.id !== adminId && (a.email || '').trim().toLowerCase() === trimmedEmail
        );
        if (isDuplicate) {
          result = { success: false, error: 'A platform admin with this email already exists.' };
          return prev;
        }
      }

      result = { success: true };
      return prev.map(a => {
        if (a.id === adminId) {
          return {
            ...a,
            ...updatedFields,
            lastUpdatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return a;
      });
    });
    return result;
  }, []);

  const togglePlatformAdminStatus = useCallback((adminId) => {
    let result = { success: false, error: '', nextStatus: '' };
    setPlatformAdmins(prev => {
      const target = prev.find(a => a.id === adminId);
      if (!target) {
        result = { success: false, error: 'Admin not found.' };
        return prev;
      }

      // If currently Active, it will become Inactive -> check last active Super Admin rule
      if (target.status === 'Active') {
        const activeAdmins = prev.filter(a => a.status === 'Active' && a.id !== adminId);
        if (activeAdmins.length === 0) {
          result = { success: false, error: 'At least one active Super Admin is required.' };
          return prev;
        }
      }

      const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';
      result = { success: true, nextStatus, admin: target };
      return prev.map(a => {
        if (a.id === adminId) {
          return {
            ...a,
            status: nextStatus,
            lastUpdatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return a;
      });
    });
    return result;
  }, []);

  const saveRestaurantStaff = useCallback((restaurantId, branchId, staffList) => {
    setPlatformStaff(prev => {
      const filtered = prev.filter(s => !(s.restaurantId === restaurantId && s.branchId === branchId));
      return [...filtered, ...staffList];
    });
  }, []);

  const saveRestaurantSuppliers = useCallback((restaurantId, suppliersList) => {
    setPlatformSuppliers(prev => {
      const filtered = prev.filter(s => s.restaurantId !== restaurantId);
      return [...filtered, ...suppliersList];
    });
  }, []);

  const saveRestaurantInitialInventory = useCallback((restaurantId, branchId, inventoryList) => {
    setPlatformInitialInventory(prev => {
      const filtered = prev.filter(item => !(item.restaurantId === restaurantId && item.branchId === branchId));
      return [...filtered, ...inventoryList];
    });
  }, []);

  const updateRestaurantSetupStep = useCallback((restaurantId, stepKey, stepStatus) => {
    setPlatformRestaurants(prev =>
      prev.map(r => {
        if (r.id !== restaurantId) return r;
        const currentSteps = r.setupSteps || {
          restaurantInfo: 'Completed',
          branch: 'Completed',
          storageLocations: 'Not Started',
          ownerUsers: 'Not Started',
          staff: 'Not Started',
          suppliers: 'Not Started',
          initialInventory: 'Not Started',
          complete: 'Not Started'
        };
        const newSteps = { ...currentSteps, [stepKey]: stepStatus };

        const requiredDone = newSteps.restaurantInfo === 'Completed' &&
                             newSteps.branch === 'Completed' &&
                             newSteps.storageLocations === 'Completed' &&
                             newSteps.ownerUsers === 'Completed' &&
                             newSteps.complete === 'Completed';
        const anyActive = Object.values(newSteps).some(v => v === 'Completed' || v === 'In Progress');

        let newSetupStatus = r.setupStatus;
        if (requiredDone) {
          newSetupStatus = 'Completed';
        } else if (anyActive) {
          newSetupStatus = 'In Progress';
        } else {
          newSetupStatus = 'Not Started';
        }

        return {
          ...r,
          setupSteps: newSteps,
          setupStatus: newSetupStatus
        };
      })
    );
  }, []);

  const completeRestaurantSetup = useCallback((restaurantId) => {
    setPlatformRestaurants(prev =>
      prev.map(r => {
        if (r.id !== restaurantId) return r;
        const currentSteps = r.setupSteps || {};
        return {
          ...r,
          setupStatus: 'Completed',
          setupSteps: {
            ...currentSteps,
            restaurantInfo: 'Completed',
            branch: 'Completed',
            storageLocations: 'Completed',
            ownerUsers: 'Completed',
            complete: 'Completed'
          }
        };
      })
    );
    const matched = platformRestaurants.find(r => r.id === restaurantId);
    const rName = matched?.name || restaurantId;
    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `${rName} setup completed`,
        date: new Date().toISOString().split('T')[0],
        displayDate: 'Today',
        type: 'setup',
        details: 'Initial restaurant setup completed via Setup Wizard.'
      },
      ...prev
    ]);
    showToast('Restaurant setup completed.', 'success', 'Setup Completed');
  }, [platformRestaurants, showToast]);

  const createPlatformPlan = useCallback((planData) => {
    const trimmedName = (planData.name || '').trim();
    if (!trimmedName) {
      return { success: false, error: 'Plan Name is required.' };
    }

    const isDuplicate = platformPlans.some(
      p => (p.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      return { success: false, error: 'A plan with this name already exists.' };
    }

    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let planId = `plan-${slug || 'custom'}`;
    if (platformPlans.some(p => p.id === planId)) {
      planId = `${planId}-${Date.now().toString(36)}`;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    const newPlan = {
      id: planId,
      name: trimmedName,
      description: (planData.description || '').trim(),
      status: planData.status || 'Active',
      priceMonthly: Math.max(0, parseFloat(planData.priceMonthly || 0)),
      currency: planData.currency || 'PKR',
      trialDays: Math.max(0, parseInt(planData.trialDays || 0, 10)),
      limits: {
        branches: Math.max(1, parseInt(planData.limits?.branches || 1, 10)),
        users: Math.max(1, parseInt(planData.limits?.users || 1, 10)),
        storageLocations: Math.max(1, parseInt(planData.limits?.storageLocations || 1, 10))
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
        staff: true,
        ...(planData.features || {})
      },
      createdAt: todayDate,
      updatedAt: todayDate
    };

    setPlatformPlans(prev => [...prev, newPlan]);

    setPlatformActivity(prev => [
      {
        id: `pact-${Date.now()}`,
        title: `Plan "${trimmedName}" created`,
        date: todayDate,
        displayDate: 'Today',
        type: 'plan',
        details: `New platform plan definition created with ${newPlan.currency} ${newPlan.priceMonthly}/mo.`
      },
      ...prev
    ]);

    showToast(`Plan "${trimmedName}" created successfully`, 'success', 'Plan Created');
    return { success: true, plan: newPlan };
  }, [platformPlans, showToast]);

  const updatePlatformPlan = useCallback((planId, updatedFields) => {
    let result = { success: false, error: '' };
    setPlatformPlans(prev => {
      const target = prev.find(p => p.id === planId);
      if (!target) {
        result = { success: false, error: 'Plan not found.' };
        return prev;
      }

      if (updatedFields.name) {
        const trimmedName = updatedFields.name.trim();
        if (!trimmedName) {
          result = { success: false, error: 'Plan Name is required.' };
          return prev;
        }
        const duplicate = prev.some(
          p => p.id !== planId && (p.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (duplicate) {
          result = { success: false, error: 'A plan with this name already exists.' };
          return prev;
        }
      }

      const todayDate = new Date().toISOString().split('T')[0];
      result = { success: true };
      return prev.map(p => {
        if (p.id === planId) {
          return {
            ...p,
            ...updatedFields,
            limits: updatedFields.limits ? { ...p.limits, ...updatedFields.limits } : p.limits,
            features: updatedFields.features ? { ...p.features, ...updatedFields.features } : p.features,
            updatedAt: todayDate
          };
        }
        return p;
      });
    });
    return result;
  }, []);

  const togglePlatformPlanStatus = useCallback((planId) => {
    let result = { success: false, error: '', nextStatus: '' };
    setPlatformPlans(prev => {
      const target = prev.find(p => p.id === planId);
      if (!target) {
        result = { success: false, error: 'Plan not found.' };
        return prev;
      }

      const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';
      const todayDate = new Date().toISOString().split('T')[0];
      result = { success: true, nextStatus, plan: target };
      return prev.map(p => {
        if (p.id === planId) {
          return {
            ...p,
            status: nextStatus,
            updatedAt: todayDate
          };
        }
        return p;
      });
    });
    return result;
  }, []);

  // Helper: query stock for exact ingredientId and location
  const getLocationStock = useCallback((ingredientId, location) => {
    const item = balances.find(b => b.ingredientId === ingredientId && b.location === location);
    return item ? Number(item.quantity) || 0 : 0;
  }, [balances]);

  // Helper: query total stock for exact ingredientId across all locations
  const getTotalIngredientStock = useCallback((ingredientId) => {
    return balances
      .filter(b => b.ingredientId === ingredientId)
      .reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
  }, [balances]);

  // Helper: get dictionary of location balances for an ingredient
  const getIngredientBalances = useCallback((ingredientId) => {
    const map = {};
    STORAGE_LOCATIONS.forEach(loc => {
      map[loc] = getLocationStock(ingredientId, loc);
    });
    return map;
  }, [getLocationStock]);

  // Computed ingredients: Total Stock = sum of all location balances for that ingredient
  const ingredients = useMemo(() => {
    return rawIngredients.map(ing => {
      const locBals = {};
      let totalStock = 0;
      STORAGE_LOCATIONS.forEach(loc => {
        const found = balances.find(b => b.ingredientId === ing.id && b.location === loc);
        const qty = found ? Number(found.quantity) || 0 : 0;
        locBals[loc] = qty;
        totalStock += qty;
      });
      const roundedStock = Math.round(totalStock * 1000) / 1000;
      const status = calculateStockStatus(roundedStock, ing.minStock);

      return {
        ...ing,
        currentStock: roundedStock,
        status,
        locationBalances: locBals
      };
    });
  }, [rawIngredients, balances]);

  // Reset to initial canonical state
  const resetToCanonicalState = useCallback(() => {
    setRawIngredients(INITIAL_INGREDIENTS);
    setBalances(INITIAL_BALANCES);
    setMovements(INITIAL_MOVEMENTS);
    setStockCounts(INITIAL_STOCK_COUNTS);
    setWastage(INITIAL_WASTAGE);
    setTransfers(INITIAL_TRANSFERS);
    setPurchases(INITIAL_PURCHASES);
    setSuppliers(INITIAL_SUPPLIERS);
    setRecipes(INITIAL_RECIPES);
    setProductions(INITIAL_PRODUCTIONS);
    setStaff(INITIAL_STAFF);
    setSettings(INITIAL_SETTINGS);
    setFormattingConfig(INITIAL_SETTINGS);
    setSelectedIngredientId('ing-1');
    setSelectedStockCountId('CNT-1047');
    setSelectedRecipeId('RCP-1026');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear localStorage', e);
    }
    showToast('Prototype state reset to canonical starting data', 'success', 'Reset Complete');
  }, [showToast]);

  // Keep formattingConfig in sync with current settings
  useEffect(() => {
    if (settings) {
      setFormattingConfig(settings);
    }
  }, [settings]);

  // Sync to browser localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        ingredients: rawIngredients,
        balances,
        movements,
        stockCounts,
        wastage,
        transfers,
        purchases,
        suppliers,
        recipes,
        productions,
        staff,
        settings,
        activity
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }
  }, [rawIngredients, balances, movements, stockCounts, wastage, transfers, purchases, suppliers, recipes, productions, staff, settings, activity]);

  // 1. Add Ingredient
  const addIngredient = useCallback((ingredientData) => {
    const id = `ing-${Date.now()}`;
    const startingStock = Number(ingredientData.currentStock || ingredientData.openingStock) || 0;
    const min = Number(ingredientData.minStock) || 0;
    const primaryLocation = ingredientData.location || 'Main Store';

    const newIng = {
      id,
      name: ingredientData.name,
      sku: ingredientData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: ingredientData.category || 'Dry Goods',
      minStock: min,
      unitCost: Number(ingredientData.unitCost) || 0,
      stockUnit: ingredientData.stockUnit || 'kg',
      recipeUnit: ingredientData.recipeUnit || 'g',
      conversionRate: Number(ingredientData.conversionRate) || 1000,
      location: primaryLocation,
      supplier: ingredientData.supplier || 'City Grocery Wholesale',
      preferredSupplierId: ingredientData.preferredSupplierId || 'SUP-1003',
      shelfLifeDays: Number(ingredientData.shelfLifeDays) || 30,
      packageUnit: ingredientData.packageUnit || 'Pack',
      packageSize: Number(ingredientData.packageSize) || 1
    };

    setRawIngredients(prev => [newIng, ...prev]);

    // Initialize location balances for all locations
    setBalances(prev => {
      const newEntries = STORAGE_LOCATIONS.map(loc => ({
        ingredientId: id,
        location: loc,
        quantity: loc === primaryLocation ? startingStock : 0
      }));
      return [...newEntries, ...prev];
    });

    if (startingStock > 0) {
      const mov = {
        id: `mov-${Date.now()}`,
        type: 'STOCK_IN',
        ingredientId: id,
        location: primaryLocation,
        quantity: startingStock,
        date: new Date().toISOString(),
        reference: 'INITIAL_REGISTRATION',
        notes: `Initial opening stock setup for ${newIng.name}`
      };
      setMovements(prev => [mov, ...prev]);
    }

    showToast(`${newIng.name} created successfully`, 'success', 'Ingredient Added');
    addActivity(`New ingredient created · ${newIng.name}`, 'primary');
    return newIng;
  }, [showToast, addActivity]);

  const updateIngredient = useCallback((id, updates) => {
    setRawIngredients(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    showToast('Ingredient updated successfully', 'success');
  }, [showToast]);

  // 2. Add Stock -> increases ONLY the selected location's balance
  const addStock = useCallback(({ ingredientId, quantity, unit, location, source, notes, reference }) => {
    const qty = Number(quantity);
    if (qty <= 0) return;

    const targetLoc = location || 'Main Store';
    const ing = rawIngredients.find(i =>
      i.id === ingredientId ||
      i.name.toLowerCase() === String(ingredientId).toLowerCase()
    );

    const finalIngId = ing ? ing.id : ingredientId;
    const ingName = ing ? ing.name : 'Ingredient';

    // Update ONLY that location's balance
    setBalances(prev => {
      let found = false;
      const updated = prev.map(b => {
        if (b.ingredientId === finalIngId && b.location === targetLoc) {
          found = true;
          const newQty = Math.round(((Number(b.quantity) || 0) + qty) * 1000) / 1000;
          return { ...b, quantity: newQty };
        }
        return b;
      });

      if (!found) {
        updated.push({
          ingredientId: finalIngId,
          location: targetLoc,
          quantity: qty
        });
      }
      return updated;
    });

    // Create inventory movement record
    const ref = reference || `STK-${Date.now().toString().slice(-6)}`;
    const movement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'STOCK_IN',
      ingredientId: finalIngId,
      location: targetLoc,
      quantity: qty,
      date: new Date().toISOString(),
      reference: ref,
      notes: notes || `Stock in from ${source || 'direct receipt'}`
    };
    setMovements(prev => [movement, ...prev]);

    showToast(`${qty} ${unit || ing?.stockUnit || 'units'} added to ${targetLoc}`, 'success', 'Stock Received');
    addActivity(`Stock added · ${ingName} (${qty} ${unit || ing?.stockUnit || ''}) at ${targetLoc}`, 'primary');
  }, [rawIngredients, showToast, addActivity]);

  // 3. Record Wastage -> verifies sufficient location quantity, rejects if insufficient, deducts ONLY from selected location
  const recordWastage = useCallback((data) => {
    const qty = Number(data.quantity) || 0;
    const loc = data.location;
    const ingId = data.ingredientId || (rawIngredients.find(i => i.name.toLowerCase() === (data.ingredientName || '').toLowerCase())?.id);
    const ing = rawIngredients.find(i => i.id === ingId);
    const ingName = ing ? ing.name : (data.ingredientName || 'Item');

    if (!ingId) {
      const err = 'Ingredient is required to record wastage.';
      showToast(err, 'error', 'Validation Error');
      throw new Error(err);
    }
    if (!loc) {
      const err = 'Location is required to record wastage.';
      showToast(err, 'error', 'Validation Error');
      throw new Error(err);
    }
    if (qty <= 0) {
      const err = 'Wastage quantity must be greater than zero.';
      showToast(err, 'error', 'Validation Error');
      throw new Error(err);
    }

    // Verify selected location has sufficient stock
    const currentLocStock = balances.find(b => b.ingredientId === ingId && b.location === loc)?.quantity || 0;
    if (qty > currentLocStock) {
      const err = `Insufficient stock at ${loc}. Available: ${currentLocStock} ${data.unit || ing?.stockUnit || 'units'}, requested: ${qty} ${data.unit || ing?.stockUnit || 'units'}. Negative stock is not allowed.`;
      showToast(err, 'error', 'Wastage Rejected');
      throw new Error(err);
    }

    const id = `WST-${2042 + wastage.length}`;
    const newWastage = {
      id,
      ...data,
      ingredientId: ingId,
      ingredientName: ingName,
      quantity: qty,
      location: loc,
      recordedBy: currentUser?.name || 'Ahmed Raza',
      date: new Date().toISOString(),
      displayDate: 'Today, Just now'
    };

    // Deduct ONLY from selected location
    setBalances(prev =>
      prev.map(b => {
        if (b.ingredientId === ingId && b.location === loc) {
          const newQty = Math.round((b.quantity - qty) * 1000) / 1000;
          return { ...b, quantity: Math.max(0, newQty) };
        }
        return b;
      })
    );

    setWastage(prev => [newWastage, ...prev]);

    // Create inventory movement
    const movement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'WASTAGE',
      ingredientId: ingId,
      location: loc,
      quantity: -qty,
      date: new Date().toISOString(),
      reference: id,
      notes: data.notes || data.reason || 'Recorded spoilage / waste'
    };
    setMovements(prev => [movement, ...prev]);

    showToast(`Wastage record ${id} logged (${qty} ${data.unit || ing?.stockUnit || ''}) deducted from ${loc}`, 'error', 'Wastage Recorded');
    addActivity(`Wastage recorded · ${ingName} (${qty} ${data.unit || ing?.stockUnit || ''}) from ${loc}`, 'amber');
    return newWastage;
  }, [rawIngredients, balances, wastage.length, currentUser?.name, showToast, addActivity]);

  // 4. Transfers -> atomic verification & transfer between exact locations
  const createTransfer = useCallback((transferData) => {
    const { fromLocation, toLocation, items, notes } = transferData;
    if (fromLocation === toLocation) {
      const err = 'Source and destination locations must be different.';
      showToast(err, 'warning', 'Invalid Transfer');
      throw new Error(err);
    }
    if (!items || !items.length) {
      const err = 'At least one item is required to dispatch transfer.';
      showToast(err, 'warning', 'No Items');
      throw new Error(err);
    }

    // 1. Group / aggregate transfer lines by ingredientId BEFORE any state mutation
    const aggregated = new Map(); // ingredientId -> { ing, totalQty, lines: [] }

    for (const item of items) {
      const qtyStr = typeof item.qty === 'string' ? item.qty : String(item.quantity || item.qty || '');
      const rawQty = parseFloat(qtyStr.split(/\s+/)[0]) || 0;
      if (rawQty <= 0 || isNaN(rawQty) || !isFinite(rawQty)) {
        const err = `Invalid transfer quantity for ${item.name || 'item'}. Must be greater than zero.`;
        showToast(err, 'error', 'Validation Error');
        throw new Error(err);
      }

      // Validation must be strictly against ingredientId. Do not use ingredient name fallback.
      const ingId = item.ingredientId || (item.id && rawIngredients.find(i => i.id === item.id)?.id);
      const ing = rawIngredients.find(i => i.id === ingId);
      if (!ing) {
        const err = `Ingredient ID "${item.ingredientId || item.id || ''}" not found in inventory.`;
        showToast(err, 'error', 'Validation Error');
        throw new Error(err);
      }

      if (!aggregated.has(ing.id)) {
        aggregated.set(ing.id, {
          ing,
          totalQty: 0
        });
      }

      const entry = aggregated.get(ing.id);
      entry.totalQty = Math.round((entry.totalQty + rawQty) * 1000) / 1000;
    }

    // 2. Validate aggregated quantity against exact source location balance
    for (const [ingId, agg] of aggregated.entries()) {
      const sourceBal = balances.find(b => b.ingredientId === ingId && b.location === fromLocation);
      const availableSourceQty = sourceBal ? Number(sourceBal.quantity) || 0 : 0;

      if (availableSourceQty < agg.totalQty) {
        const err = `Transfer rejected: Insufficient stock for ${agg.ing.name} at ${fromLocation}. Available: ${availableSourceQty} ${agg.ing.stockUnit}, requested: ${agg.totalQty} ${agg.ing.stockUnit}.`;
        showToast(err, 'error', 'Transfer Rejected');
        throw new Error(err);
      }
    }

    // 3. Validated: perform atomic state update
    const id = `TRF-${5012 + transfers.length}`;
    const newTrf = {
      id,
      fromLocation,
      toLocation,
      itemCount: items.length,
      items: items.map(it => {
        const qtyStr = typeof it.qty === 'string' ? it.qty : String(it.quantity || it.qty || '');
        const num = parseFloat(qtyStr.split(/\s+/)[0]) || 0;
        const ing = rawIngredients.find(i => i.id === (it.ingredientId || it.id));
        const unit = ing ? ing.stockUnit : 'kg';
        return {
          ingredientId: ing ? ing.id : it.ingredientId,
          name: ing ? ing.name : it.name,
          qty: `${num} ${unit}`
        };
      }),
      status: 'In Transit',
      requestedBy: currentUser?.name || 'Ahmed Raza',
      date: utilGetLocalDateKey(new Date(), settings?.timezone),
      displayDate: 'Today',
      notes: notes || ''
    };

    setBalances(prev => {
      let updated = [...prev];

      for (const [ingId, agg] of aggregated.entries()) {
        // Decrease source by exact aggregated total (no Math.max hiding shortages)
        updated = updated.map(b => {
          if (b.ingredientId === ingId && b.location === fromLocation) {
            const newQty = Math.round((Number(b.quantity) - agg.totalQty) * 1000) / 1000;
            return { ...b, quantity: newQty };
          }
          return b;
        });

        // Increase destination by exact aggregated total
        let foundDest = false;
        updated = updated.map(b => {
          if (b.ingredientId === ingId && b.location === toLocation) {
            foundDest = true;
            const newQty = Math.round(((Number(b.quantity) || 0) + agg.totalQty) * 1000) / 1000;
            return { ...b, quantity: newQty };
          }
          return b;
        });

        if (!foundDest) {
          updated.push({
            ingredientId: ingId,
            location: toLocation,
            quantity: agg.totalQty
          });
        }
      }
      return updated;
    });

    // 4. Create TRANSFER_OUT and TRANSFER_IN movements with the same transfer reference
    const nowIso = new Date().toISOString();
    const newMovements = [];
    for (const [ingId, agg] of aggregated.entries()) {
      newMovements.push({
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 10000)}-out`,
        type: 'TRANSFER_OUT',
        ingredientId: ingId,
        location: fromLocation,
        quantity: -agg.totalQty,
        date: nowIso,
        reference: id,
        notes: `Transfer ${id} dispatched to ${toLocation}`
      });
      newMovements.push({
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 10000)}-in`,
        type: 'TRANSFER_IN',
        ingredientId: ingId,
        location: toLocation,
        quantity: agg.totalQty,
        date: nowIso,
        reference: id,
        notes: `Transfer ${id} received from ${fromLocation}`
      });
    }
    setMovements(prev => [...newMovements, ...prev]);

    setTransfers(prev => [newTrf, ...prev]);
    showToast(`Transfer ${id} dispatched from ${fromLocation} to ${toLocation}`, 'success', 'Transfer Dispatched');
    addActivity(`Transfer dispatched · ${id} (${fromLocation} → ${toLocation})`, 'primary');
    return newTrf;
  }, [rawIngredients, balances, transfers.length, currentUser?.name, showToast, addActivity]);

  const updateTransferStatus = useCallback((id, newStatus) => {
    setTransfers(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
    );
    showToast(`Transfer ${id} status updated to ${newStatus}`, 'success');
    addActivity(`Transfer completed · ${id}`, 'secondary');
  }, [showToast, addActivity]);

  // 5. Stock Count Finalization -> operates by ingredientId + location, requires countedItems === totalItems
  const startStockCount = useCallback(({ location, scope, countScope, notes }) => {
    const id = `CNT-${1048 + stockCounts.length}`;
    const targetLoc = location || 'Walk-in Cooler';

    // Filter ingredients if Critical & High-Value scope was chosen
    const targetIngredients = countScope === 'high_value'
      ? rawIngredients.filter(ing => {
          const total = getTotalIngredientStock(ing.id);
          const status = calculateStockStatus(total, ing.minStock);
          const isCriticalOrLow = status === 'Critical' || status === 'Low' || status === 'Out of Stock';
          const isHighValue = (Number(ing.unitCost) || 0) >= 400 || ing.category === 'Proteins' || ing.category === 'Dairy';
          return isCriticalOrLow || isHighValue;
        })
      : rawIngredients;

    // Generate location-specific rows. If All Locations, generate separate rows for ALL approved storage locations!
    const countItems = [];
    const isAllLocations = targetLoc === 'All' || targetLoc === 'All Locations';
    if (isAllLocations) {
      targetIngredients.forEach(ing => {
        STORAGE_LOCATIONS.forEach(loc => {
          const sysStock = getLocationStock(ing.id, loc);
          countItems.push({
            id: `${ing.id}-${loc}`,
            ingredientId: ing.id,
            location: loc,
            systemQuantity: sysStock,
            systemStock: sysStock,
            countedQuantity: null,
            countedStock: null,
            name: ing.name,
            unit: ing.stockUnit,
            unitCost: ing.unitCost,
            diff: null,
            status: 'Uncounted'
          });
        });
      });
    } else {
      targetIngredients.forEach(ing => {
        const sysStock = getLocationStock(ing.id, targetLoc);
        countItems.push({
          id: `${ing.id}-${targetLoc}`,
          ingredientId: ing.id,
          location: targetLoc,
          systemQuantity: sysStock,
          systemStock: sysStock,
          countedQuantity: null,
          countedStock: null,
          name: ing.name,
          unit: ing.stockUnit,
          unitCost: ing.unitCost,
          diff: null,
          status: 'Uncounted'
        });
      });
    }

    const newCount = {
      id,
      date: new Date().toISOString(),
      displayDate: 'Today, Just now',
      location: targetLoc,
      scope: scope || (countScope === 'high_value' ? `Critical & High-Value (${countItems.length} items)` : `${countItems.length} location items`),
      countScope: countScope || 'full',
      countedItemsCount: 0,
      totalItemsCount: countItems.length,
      progress: 0,
      differencesCount: 0,
      status: 'In Progress',
      countedBy: currentUser?.name || 'Ahmed Raza',
      notes: notes || '',
      items: countItems
    };

    setStockCounts(prev => [newCount, ...prev]);
    setSelectedStockCountId(id);
    showToast(`Stock count ${id} initialized for ${targetLoc}`, 'success', 'Stock Count Started');
    addActivity(`Stock count started · ${id} (${targetLoc})`, 'secondary');
    return newCount;
  }, [stockCounts.length, rawIngredients, getTotalIngredientStock, getLocationStock, currentUser?.name, showToast, addActivity]);

  const updateStockCountItem = useCallback((countId, itemId, countedVal) => {
    setStockCounts(prev =>
      prev.map(count => {
        if (count.id === countId) {
          // Completed stock counts must be read-only!
          if (count.status === 'Completed') {
            return count;
          }

          const items = count.items.map(it => {
            if (it.id === itemId) {
              if (countedVal === '' || countedVal === null || countedVal === undefined) {
                return { ...it, countedStock: null, countedQuantity: null, diff: null, status: 'Uncounted' };
              }
              const num = Number(countedVal);
              // Reject negative numbers, NaN, and non-finite
              if (isNaN(num) || num < 0 || !isFinite(num)) {
                return it;
              }
              const counted = Math.round(num * 1000) / 1000;
              const diff = Math.round((counted - it.systemStock) * 1000) / 1000;
              const status = diff === 0 ? 'Match' : 'Variance';
              return { ...it, countedStock: counted, countedQuantity: counted, diff, status };
            }
            return it;
          });
          const countedCount = items.filter(it => it.countedStock !== null).length;
          const diffCount = items.filter(it => it.diff !== null && it.diff !== 0).length;
          const progress = items.length > 0 ? Math.round((countedCount / items.length) * 100) : 0;
          return {
            ...count,
            items,
            countedItemsCount: countedCount,
            differencesCount: diffCount,
            progress
          };
        }
        return count;
      })
    );
  }, []);

  const finalizeStockCount = useCallback((countId, notes = '') => {
    const count = stockCounts.find(c => c.id === countId);
    if (!count) {
      showToast('Stock count record not found.', 'error');
      return;
    }

    // Completed stock counts must never be re-finalized
    if (count.status === 'Completed') {
      const err = `Stock count ${countId} is already completed and cannot be re-finalized.`;
      showToast(err, 'warning', 'Already Finalized');
      throw new Error(err);
    }

    if (!count.items || count.items.length === 0) {
      showToast('No items in stock count.', 'error');
      return;
    }

    // Enforce: countedItems === totalItems, no uncounted, no negative/invalid numbers
    const uncounted = count.items.filter(it =>
      it.countedStock === null ||
      it.countedStock === undefined ||
      isNaN(it.countedStock) ||
      Number(it.countedStock) < 0
    );
    if (uncounted.length > 0) {
      const err = `Cannot finalize count ${countId}: ${uncounted.length} item(s) remain uncounted or invalid. All items must have valid non-negative physical counts.`;
      showToast(err, 'error', 'Uncounted Items');
      throw new Error(err);
    }

    const adjustments = [];
    const newMovements = [];
    const nowIso = new Date().toISOString();

    // Calculate finalized adjustments first by stable ID and exact item location
    count.items.forEach(it => {
      const ingredientId = it.ingredientId || it.id;
      const targetLocation = it.location || count.location;
      const currentBalObj = balances.find(b => b.ingredientId === ingredientId && b.location === targetLocation);
      const systemQuantity = currentBalObj ? Number(currentBalObj.quantity) || 0 : 0;
      const countedQuantity = Number(it.countedStock) || 0;
      const variance = Math.round((countedQuantity - systemQuantity) * 1000) / 1000;

      adjustments.push({
        ingredientId,
        location: targetLocation,
        countedQuantity,
        variance
      });

      if (variance !== 0) {
        newMovements.push({
          id: `mov-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          type: 'STOCK_COUNT_ADJUSTMENT',
          ingredientId,
          location: targetLocation,
          quantity: variance,
          date: nowIso,
          reference: countId,
          notes: `Stock count adjustment for ${it.name} at ${targetLocation} (Variance: ${variance > 0 ? '+' : ''}${variance} ${it.unit})`
        });
      }
    });

    // Clean state updates (no nested setters)
    setBalances(prev => {
      let updated = [...prev];
      adjustments.forEach(adj => {
        let found = false;
        updated = updated.map(b => {
          if (b.ingredientId === adj.ingredientId && b.location === adj.location) {
            found = true;
            return { ...b, quantity: adj.countedQuantity };
          }
          return b;
        });
        if (!found) {
          updated.push({
            ingredientId: adj.ingredientId,
            location: adj.location,
            quantity: adj.countedQuantity
          });
        }
      });
      return updated;
    });

    if (newMovements.length > 0) {
      setMovements(prev => [...newMovements, ...prev]);
    }

    setStockCounts(prev =>
      prev.map(c => {
        if (c.id === countId) {
          return {
            ...c,
            status: 'Completed',
            progress: 100,
            notes: notes || c.notes
          };
        }
        return c;
      })
    );

    showToast(`Stock count ${countId} finalized and ${adjustments.length} items reconciled`, 'success', 'Stock Count Completed');
    addActivity(`Stock count completed · ${countId} (${count.location})`, 'secondary');
  }, [stockCounts, balances, showToast, addActivity]);

  // 6. Purchases & Receiving -> prevents double receiving, adds items to receiving location, creates STOCK_IN movements
  const createPurchase = useCallback((purchaseData) => {
    const id = `PO-${8822 + purchases.length}`;
    const newPO = {
      id,
      ...purchaseData,
      status: 'Awaiting Receiving',
      createdBy: currentUser?.name || 'Ahmed Raza',
      orderDate: utilGetLocalDateKey(new Date(), settings?.timezone),
      displayDate: 'Today'
    };
    setPurchases(prev => [newPO, ...prev]);
    showToast(`Purchase Order ${id} created for ${purchaseData.supplier}`, 'success', 'Purchase Created');
    addActivity(`Purchase created · ${purchaseData.supplier} (${id})`, 'primary');
    return newPO;
  }, [purchases.length, currentUser?.name, showToast, addActivity]);

  const receivePurchase = useCallback((poId, receivingLocation = 'Main Store') => {
    const po = purchases.find(p => p.id === poId);
    if (!po) {
      showToast('Purchase Order not found.', 'error');
      return;
    }

    // Validate purchase status - prevent double receiving
    if (po.status === 'Received') {
      showToast(`Purchase Order ${poId} has already been received. Second receipt is disabled.`, 'warning', 'Already Received');
      return;
    }

    if (!po.items || po.items.length === 0) {
      showToast('PO has no line items to receive.', 'error');
      return;
    }

    const targetLoc = receivingLocation || 'Main Store';
    const nowIso = new Date().toISOString();
    const additions = [];
    const newMovements = [];

    po.items.forEach(line => {
      const addedQty = Number(line.quantity) || 0;
      if (addedQty <= 0) return;

      const ing = rawIngredients.find(i =>
        i.name.toLowerCase() === String(line.ingredient).toLowerCase() ||
        i.id === line.ingredientId
      );

      const ingredientId = ing ? ing.id : `ing-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      additions.push({
        ingredientId,
        name: line.ingredient,
        qty: addedQty,
        unit: line.unit || 'kg',
        unitCost: line.unitCost || 100,
        supplier: po.supplier,
        location: targetLoc
      });

      newMovements.push({
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: 'STOCK_IN',
        ingredientId,
        location: targetLoc,
        quantity: addedQty,
        date: nowIso,
        reference: poId,
        notes: `PO ${poId} Received into ${targetLoc} from ${po.supplier}`
      });
    });

    // Update balances
    setBalances(prev => {
      let updated = [...prev];
      additions.forEach(item => {
        let found = false;
        updated = updated.map(b => {
          if (b.ingredientId === item.ingredientId && b.location === targetLoc) {
            found = true;
            const newQty = Math.round(((Number(b.quantity) || 0) + item.qty) * 1000) / 1000;
            return { ...b, quantity: newQty };
          }
          return b;
        });
        if (!found) {
          updated.push({
            ingredientId: item.ingredientId,
            location: targetLoc,
            quantity: item.qty
          });
        }
      });
      return updated;
    });

    // Add new ingredients to catalog if not previously present
    setRawIngredients(prev => {
      let updated = [...prev];
      additions.forEach(item => {
        if (!updated.some(i => i.id === item.ingredientId)) {
          updated.push({
            id: item.ingredientId,
            name: item.name,
            sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
            category: 'Dry Goods',
            minStock: Math.round(item.qty * 0.3),
            stockUnit: item.unit,
            recipeUnit: item.unit,
            conversionRate: 1,
            unitCost: item.unitCost,
            location: targetLoc,
            supplier: item.supplier,
            status: 'Healthy'
          });
        }
      });
      return updated;
    });

    setMovements(prev => [...newMovements, ...prev]);

    // Mark PO Received only once
    setPurchases(prev =>
      prev.map(p => (p.id === poId ? { ...p, status: 'Received' } : p))
    );

    showToast(`Purchase Order ${poId} received into ${targetLoc}!`, 'success', 'PO Received');
    addActivity(`Purchase received · ${poId} (${po.supplier})`, 'primary');
  }, [purchases, rawIngredients, showToast, addActivity]);

  // 7. Suppliers & Recipes
  const addSupplier = useCallback((supplierData) => {
    const id = `SUP-${1006 + suppliers.length}`;
    const newSup = {
      id,
      ...supplierData,
      rating: 5.0,
      activeItemCount: 0,
      status: 'Active'
    };
    setSuppliers(prev => [newSup, ...prev]);
    showToast(`Supplier ${newSup.name} added to approved vendor list`, 'success', 'Supplier Registered');
    addActivity(`New supplier added · ${newSup.name}`, 'primary');
    return newSup;
  }, [suppliers.length, showToast, addActivity]);

  const addRecipe = useCallback((recipeData) => {
    const id = `RCP-${2000 + recipes.length}`;
    const standardizedIngredients = (recipeData.ingredients || []).map(ing => {
      let qtyPerPortion = 0;
      let unit = 'g';
      if (ing.quantityPerPortion !== undefined) {
        qtyPerPortion = Number(ing.quantityPerPortion) || 0;
        unit = ing.unit || 'g';
      } else {
        const parts = String(ing.portionQuantity || ing.quantity || '0 g').trim().split(/\s+/);
        qtyPerPortion = parseFloat(parts[0]) || 0;
        unit = parts[1] || 'g';
      }
      return {
        ...ing,
        quantityPerPortion: qtyPerPortion,
        unit,
        portionQuantity: `${qtyPerPortion} ${unit}`,
        quantity: `${qtyPerPortion} ${unit}`
      };
    });

    const newRcp = {
      id,
      ...recipeData,
      yieldPortions: recipeData.yieldPortions || 1,
      ingredients: standardizedIngredients,
      status: 'Active'
    };
    setRecipes(prev => [newRcp, ...prev]);
    showToast(`Recipe ${newRcp.name} saved to recipe master`, 'success', 'Recipe Saved');
    addActivity(`Recipe added · ${newRcp.name}`, 'primary');
    return newRcp;
  }, [recipes.length, showToast, addActivity]);

  // 8. Production -> enforces Actual + Wastage = Planned, checks all recipe ingredients stock, blocks if insufficient, deducts cleanly
  const recordProduction = useCallback((prodData) => {
    const planned = Number(prodData.plannedQuantity) || 0;
    const actual = Number(prodData.actualOutput) || 0;
    const waste = Number(prodData.productionWastage) || 0;
    const batchId = prodData.id || prodData.batchNumber || 'PB-1025';

    // 0. Double finalization guard: If batch is already Completed, REJECT immediately
    const existingBatch = productions.find(p => p.id === batchId);
    if (existingBatch && existingBatch.status === 'Completed') {
      const err = `Production batch ${batchId} has already been completed. Duplicate finalization is rejected.`;
      showToast(err, 'warning', 'Already Finalized');
      throw new Error(err);
    }

    // 1. Validation: Actual Output + Production Wastage = Planned Quantity
    if (Math.abs((actual + waste) - planned) > 0.001) {
      const err = `Validation failed: Actual Produced (${actual}) + Production Wastage (${waste}) = ${actual + waste}, which does not match Planned Quantity (${planned}).`;
      showToast(err, 'error', 'Production Balancing Error');
      throw new Error(err);
    }

    // 2. Find recipe
    const matchedRecipe = recipes.find(r =>
      r.name.toLowerCase() === String(prodData.recipeName).toLowerCase() ||
      (prodData.recipeId && r.id === prodData.recipeId)
    ) || recipes[0];

    if (!matchedRecipe || !matchedRecipe.ingredients || matchedRecipe.ingredients.length === 0) {
      const err = `Recipe formula not found for ${prodData.recipeName}.`;
      showToast(err, 'error', 'Recipe Error');
      throw new Error(err);
    }

    // 3. AGGREGATE DUPLICATE RECIPE INGREDIENTS BEFORE PRODUCTION
    // Group requirements by ingredientId, convert every line to base inventory unit, and sum required quantities.
    const aggregatedRequirements = {};
    const shortages = [];

    for (const formulaIng of matchedRecipe.ingredients) {
      const ing = rawIngredients.find(i =>
        (formulaIng.ingredientId && i.id === formulaIng.ingredientId) ||
        (i.name.toLowerCase() === formulaIng.name.toLowerCase())
      );

      if (!ing) {
        shortages.push(`${formulaIng.name}: Ingredient not tracked in inventory.`);
        continue;
      }

      // Quantity per portion semantics (portionQty * planned, no dividing by recipe yield)
      let portionQty = 0;
      let portionUnit = ing.stockUnit;

      if (formulaIng.quantityPerPortion !== undefined) {
        portionQty = Number(formulaIng.quantityPerPortion) || 0;
        portionUnit = formulaIng.unit || ing.stockUnit;
      } else if (formulaIng.portionQuantity) {
        const parts = String(formulaIng.portionQuantity).trim().split(/\s+/);
        portionQty = parseFloat(parts[0]) || 0;
        portionUnit = parts[1] || ing.stockUnit;
      } else if (formulaIng.quantity) {
        const parts = String(formulaIng.quantity).trim().split(/\s+/);
        portionQty = parseFloat(parts[0]) || 0;
        portionUnit = parts[1] || ing.stockUnit;
      }

      // Convert portion quantity to ingredient's base stockUnit
      let lineQtyInStockUnit = 0;
      try {
        const qtyPerPortionInStockUnit = convertUnits(portionQty, portionUnit, ing.stockUnit);
        lineQtyInStockUnit = qtyPerPortionInStockUnit * planned;
      } catch (err) {
        shortages.push(`${ing.name}: ${err.message}`);
        continue;
      }

      if (!aggregatedRequirements[ing.id]) {
        aggregatedRequirements[ing.id] = {
          ingredientId: ing.id,
          name: ing.name,
          stockUnit: ing.stockUnit,
          totalRequiredQuantity: 0
        };
      }
      aggregatedRequirements[ing.id].totalRequiredQuantity += lineQtyInStockUnit;
    }

    // Validate the aggregated requirement against total available stock
    const requirements = Object.values(aggregatedRequirements).map(req => ({
      ...req,
      totalRequiredQuantity: Math.round(req.totalRequiredQuantity * 1000) / 1000
    }));

    for (const req of requirements) {
      const totalAvailable = getTotalIngredientStock(req.ingredientId);
      if (totalAvailable < req.totalRequiredQuantity) {
        const shortageAmount = Math.round((req.totalRequiredQuantity - totalAvailable) * 1000) / 1000;
        shortages.push(
          `${req.name}\nRequired: ${req.totalRequiredQuantity} ${req.stockUnit}\nAvailable: ${totalAvailable} ${req.stockUnit}\nShortage: ${shortageAmount} ${req.stockUnit}`
        );
      }
    }

    // If ANY required ingredient is insufficient: DO NOT finalize production!
    // No stock deduction, no movements, no production completion, no wastage record.
    if (shortages.length > 0) {
      const shortageMessage = `Cannot finalize production due to stock shortages:\n\n${shortages.join('\n\n')}`;
      showToast(`Cannot finalize production: ${shortages.length} shortage(s) detected.`, 'error', 'Stock Shortage');
      const err = new Error(shortageMessage);
      err.shortages = shortages;
      throw err;
    }

    // 4. Pure Transaction Calculation BEFORE state updates:
    const prodLocation = prodData.location || 'Kitchen Prep';
    const nowIso = new Date().toISOString();
    const productionMovements = [];
    let nextBalances = [...balances];

    requirements.forEach(req => {
      let remainingToDeduct = req.totalRequiredQuantity;

      // Deduct prioritizing production location, then any location with stock
      const locPriority = [
        prodLocation,
        ...STORAGE_LOCATIONS.filter(l => l !== prodLocation)
      ];

      for (const loc of locPriority) {
        if (remainingToDeduct <= 0) break;
        const idx = nextBalances.findIndex(b => b.ingredientId === req.ingredientId && b.location === loc);
        if (idx >= 0 && nextBalances[idx].quantity > 0) {
          const currentLocStock = Number(nextBalances[idx].quantity) || 0;
          const deduct = Math.min(currentLocStock, remainingToDeduct);
          if (deduct > 0) {
            const newQty = Math.round((currentLocStock - deduct) * 1000) / 1000;
            nextBalances[idx] = { ...nextBalances[idx], quantity: newQty };
            remainingToDeduct = Math.round((remainingToDeduct - deduct) * 1000) / 1000;

            productionMovements.push({
              id: `mov-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              type: 'PRODUCTION_CONSUMPTION',
              ingredientId: req.ingredientId,
              location: loc,
              quantity: -deduct,
              date: nowIso,
              reference: batchId,
              notes: `Batch ${batchId} consumed for ${prodData.recipeName}`
            });
          }
        }
      }
    });

    // 5. Record production record in productions master
    const yieldPct = planned > 0 ? Math.round((actual / planned) * 1000) / 10 : 100;
    const newPrd = {
      id: batchId,
      recipeName: prodData.recipeName,
      recipeId: matchedRecipe.id,
      station: prodData.station || 'Fryer Station',
      branch: currentBranch,
      plannedQuantity: planned,
      actualOutput: actual,
      productionWastage: waste,
      unaccountedQuantity: 0,
      yieldPct,
      batchSize: `${planned} pcs`,
      yieldPortions: `${actual} pcs`,
      location: prodLocation,
      producedBy: prodData.producedBy || currentUser?.name || 'Ahmed Raza',
      qualityResult: prodData.qualityResult || 'Pass',
      qualityNotes: prodData.qualityNotes || '',
      estimatedBatchCost: prodData.estimatedBatchCost || 35000,
      date: utilGetLocalDateKey(new Date(), settings?.timezone),
      displayDate: 'Today, Just now',
      status: 'Completed',
      notes: prodData.notes || ''
    };

    // 6. Calculate optional wastage record
    let wasteEntry = null;
    if (waste > 0) {
      const wasteCost = Math.round(waste * (matchedRecipe.cost || 289.9));
      wasteEntry = {
        id: `WST-${2042 + wastage.length}`,
        ingredientName: `${prodData.recipeName} (Batch Loss)`,
        ingredientId: `prod-loss-${batchId}`,
        quantity: waste,
        unit: 'pcs',
        reason: 'Kitchen production yield shortfall',
        category: 'Kitchen Prep',
        cost: wasteCost,
        location: prodLocation,
        recordedBy: currentUser?.name || 'Ahmed Raza',
        date: nowIso,
        displayDate: 'Today, Just now',
        notes: `Production batch ${batchId} recorded ${waste} pcs wastage during cooking.`
      };
    }

    // 7. Atomic state application - only after all calculations succeed
    setBalances(nextBalances);
    if (productionMovements.length > 0) {
      setMovements(prev => [...productionMovements, ...prev]);
    }
    setProductions(prev => [newPrd, ...prev.filter(p => p.id !== batchId)]);
    if (wasteEntry) {
      setWastage(prev => [wasteEntry, ...prev]);
    }

    showToast(`Production batch ${batchId} recorded successfully!`, 'success', 'Production Logged');
    addActivity(`Production batch recorded · ${prodData.recipeName} (${actual} pcs)`, 'primary');
    return newPrd;
  }, [productions, recipes, rawIngredients, getTotalIngredientStock, balances, currentBranch, currentUser?.name, settings?.timezone, wastage.length, showToast, addActivity]);

  // 9. Staff Directory
  const addStaff = useCallback((staffData) => {
    const id = `stf-${Date.now()}`;
    const initials = (staffData.name || '')
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'ST';

    const newStaff = {
      id,
      ...staffData,
      initials,
      joinedDate: 'Just now',
      status: staffData.status || 'Active'
    };

    setStaff(prev => [newStaff, ...prev]);
    showToast(`Team member ${newStaff.name} added`, 'success');
    addActivity(`Staff member added · ${newStaff.name}`, 'primary');
    return newStaff;
  }, [showToast, addActivity]);

  const updateStaffMember = useCallback((id, updates) => {
    setStaff(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Staff member updated successfully', 'success');
  }, [showToast]);

  // Reactive formatting helpers that automatically re-render when settings change
  const formatCurrency = useCallback((amount) => {
    return utilFormatCurrency(amount, settings?.currency);
  }, [settings?.currency]);

  const formatRecipeCost = useCallback((amount) => {
    return utilFormatRecipeCost(amount, settings?.recipeCostPrecision, settings?.currency);
  }, [settings?.recipeCostPrecision, settings?.currency]);

  const formatDate = useCallback((dateString, formatStr) => {
    return utilFormatDate(dateString, formatStr || settings?.dateFormat, settings?.timezone);
  }, [settings?.dateFormat, settings?.timezone]);

  const getLocalDateKey = useCallback((date = new Date()) => {
    return utilGetLocalDateKey(date, settings?.timezone);
  }, [settings?.timezone]);

  const getLocalTime = useCallback((date = new Date()) => {
    return utilGetLocalTime(date, settings?.timezone);
  }, [settings?.timezone]);

  // Prototype Authentication & Session Methods
  const login = useCallback((email, password, rememberMe = true) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    const matchedUser = DEMO_USERS.find(
      u => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPass
    );

    if (!matchedUser) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const sessionUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      accountType: matchedUser.accountType,
      role: matchedUser.role,
      restaurantId: matchedUser.restaurantId,
      restaurantName: matchedUser.restaurantName,
      branchId: matchedUser.branchId,
      branchName: matchedUser.branchName,
      initials: matchedUser.initials || 'AR'
    };

    setCurrentUser(sessionUser);
    saveStoredSession(sessionUser);

    return { success: true, user: sessionUser };
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setCurrentUser(null);
    window.location.hash = 'login';
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentBranch,
        currentUser,
        setCurrentUser,
        login,
        logout,
        ingredients,
        rawIngredients,
        setRawIngredients,
        setIngredients: setRawIngredients,
        inventoryBalances: balances,
        balances,
        setBalances,
        inventoryMovements: movements,
        movements,
        STORAGE_LOCATIONS,
        getLocationStock,
        getTotalIngredientStock,
        getIngredientBalances,
        stockCounts,
        wastage,
        transfers,
        purchases,
        suppliers,
        recipes,
        productions,
        staff,
        settings,
        setSettings,
        activity,
        selectedIngredientId,
        setSelectedIngredientId,
        selectedStockCountId,
        setSelectedStockCountId,
        selectedWastageId,
        setSelectedWastageId,
        selectedTransferId,
        setSelectedTransferId,
        selectedPurchaseId,
        setSelectedPurchaseId,
        selectedSupplierId,
        setSelectedSupplierId,
        selectedRecipeId,
        setSelectedRecipeId,
        platformRestaurants,
        setPlatformRestaurants,
        platformBranches,
        setPlatformBranches,
        platformStorageLocations,
        setPlatformStorageLocations,
        platformMembers,
        setPlatformMembers,
        platformStaff,
        setPlatformStaff,
        platformSuppliers,
        setPlatformSuppliers,
        platformInitialInventory,
        setPlatformInitialInventory,
        platformActivity,
        setPlatformActivity,
        selectedRestaurantId,
        setSelectedRestaurantId,
        selectedBranchId,
        setSelectedBranchId,
        updatePlatformRestaurantStatus,
        createPlatformRestaurant,
        updatePlatformRestaurant,
        updatePlatformBranch,
        createPlatformBranch,
        togglePlatformBranchStatus,
        saveRestaurantStorageLocations,
        createPlatformStorageLocation,
        updatePlatformStorageLocation,
        togglePlatformStorageLocationStatus,
        saveRestaurantMembers,
        updatePlatformMember,
        togglePlatformMemberStatus,
        createPlatformMember,
        platformAdmins,
        setPlatformAdmins,
        createPlatformAdmin,
        updatePlatformAdmin,
        togglePlatformAdminStatus,
        platformPlans,
        setPlatformPlans,
        createPlatformPlan,
        updatePlatformPlan,
        togglePlatformPlanStatus,
        saveRestaurantStaff,
        saveRestaurantSuppliers,
        saveRestaurantInitialInventory,
        updateRestaurantSetupStep,
        completeRestaurantSetup,
        toast,
        showToast,
        hideToast,
        resetToCanonicalState,
        addIngredient,
        updateIngredient,
        addStock,
        recordWastage,
        startStockCount,
        updateStockCountItem,
        finalizeStockCount,
        createTransfer,
        updateTransferStatus,
        createPurchase,
        receivePurchase,
        addSupplier,
        addRecipe,
        recordProduction,
        addStaff,
        updateStaffMember,
        formatCurrency,
        formatRecipeCost,
        formatDate,
        getLocalDateKey,
        getLocalTime
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}

export function useCurrencyFormatter() {
  const { formatCurrency, formatRecipeCost } = useAppStore();
  return { formatCurrency, formatRecipeCost };
}
