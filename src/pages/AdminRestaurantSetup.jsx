import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/AppStore';

const STEP_DEFINITIONS = [
  { id: 1, key: 'restaurantInfo', label: 'Restaurant Information', isRequired: true, icon: 'storefront' },
  { id: 2, key: 'branch', label: 'Initial Branch', isRequired: true, icon: 'apartment' },
  { id: 3, key: 'storageLocations', label: 'Storage Locations', isRequired: true, icon: 'inventory_2' },
  { id: 4, key: 'ownerUsers', label: 'Owner & Users', isRequired: true, icon: 'group' },
  { id: 5, key: 'staff', label: 'Initial Staff', isRequired: false, icon: 'badge' },
  { id: 6, key: 'suppliers', label: 'Suppliers', isRequired: false, icon: 'local_shipping' },
  { id: 7, key: 'initialInventory', label: 'Initial Inventory', isRequired: false, icon: 'category' },
  { id: 8, key: 'complete', label: 'Review & Complete', isRequired: true, icon: 'verified' }
];

const CURRENCY_OPTIONS = ['PKR', 'USD', 'AED', 'GBP', 'EUR'];
const TIMEZONE_OPTIONS = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT, UTC+5)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+0/+1)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT, UTC-5/-4)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST, UTC+3)' }
];
const DATE_FORMAT_OPTIONS = ['DD MMM YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];

const LOCATION_TYPES = ['General Store', 'Cold Storage', 'Dry Storage', 'Kitchen / Prep', 'Other'];
const USER_ROLES = ['Restaurant Owner', 'Operations Lead', 'Inventory Manager', 'Kitchen Manager'];
const STAFF_ROLES = ['General Manager', 'Operations Lead', 'Kitchen Manager', 'Inventory Manager', 'Chef', 'Store Keeper'];
const DEPARTMENTS = ['Management', 'Operations', 'Kitchen', 'Inventory'];
const INGREDIENT_CATEGORIES = ['Proteins', 'Dairy', 'Produce', 'Dry Goods', 'Beverages', 'Bakery', 'Packaging'];
const UNITS = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'box', 'tray'];

export default function AdminRestaurantSetup({ onNavigate }) {
  const {
    platformRestaurants,
    platformBranches,
    platformStorageLocations,
    platformMembers,
    platformStaff,
    platformSuppliers,
    platformInitialInventory,
    selectedRestaurantId,
    updatePlatformRestaurant,
    updatePlatformBranch,
    saveRestaurantStorageLocations,
    saveRestaurantMembers,
    saveRestaurantStaff,
    saveRestaurantSuppliers,
    saveRestaurantInitialInventory,
    updateRestaurantSetupStep,
    completeRestaurantSetup,
    showToast
  } = useAppStore();

  const [currentStep, setCurrentStep] = useState(1);

  // 1. Resolve selected restaurant
  const selectedRestaurant = useMemo(() => {
    if (!platformRestaurants || platformRestaurants.length === 0) return null;
    return platformRestaurants.find(r => r.id === selectedRestaurantId) || null;
  }, [platformRestaurants, selectedRestaurantId]);

  // Fallback initial branch for this restaurant
  const initialBranch = useMemo(() => {
    if (!selectedRestaurant) return null;
    const branches = (platformBranches || []).filter(b => b.restaurantId === selectedRestaurant.id);
    return branches[0] || null;
  }, [platformBranches, selectedRestaurant]);

  // Local state for Step 1: Restaurant Info
  const [restForm, setRestForm] = useState({
    name: '',
    legalName: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Pakistan',
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    dateFormat: 'DD MMM YYYY'
  });

  // Local state for Step 2: Branch Info
  const [branchForm, setBranchForm] = useState({
    name: 'Main Branch',
    code: 'BR-MAIN',
    phone: '',
    email: '',
    address: '',
    city: 'Lahore',
    status: 'Active'
  });

  // Local state for Step 3: Storage Locations
  const [storageLocs, setStorageLocs] = useState([]);
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('General Store');

  // Local state for Step 4: Owner & Users
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [membersList, setMembersList] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Operations Lead');

  // Local state for Step 5: Staff
  const [staffList, setStaffList] = useState([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Chef');
  const [newStaffDept, setNewStaffDept] = useState('Kitchen');

  // Local state for Step 6: Suppliers
  const [suppliersList, setSuppliersList] = useState([]);
  const [newSupName, setNewSupName] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupCategory, setNewSupCategory] = useState('Produce');

  // Local state for Step 7: Initial Inventory
  const [inventoryList, setInventoryList] = useState([]);
  const [newInvName, setNewInvName] = useState('');
  const [newInvCategory, setNewInvCategory] = useState('Proteins');
  const [newInvUnit, setNewInvUnit] = useState('kg');
  const [newInvMinStock, setNewInvMinStock] = useState('10');
  const [newInvCost, setNewInvCost] = useState('500');
  const [newInvLocation, setNewInvLocation] = useState('');
  const [newInvOpeningQty, setNewInvOpeningQty] = useState('5');

  // Validation / Error Messages per step
  const [stepError, setStepError] = useState('');

  // Hydrate local state when selectedRestaurant or related collections change
  useEffect(() => {
    if (!selectedRestaurant) return;

    // Hydrate Step 1
    setRestForm({
      name: selectedRestaurant.name || '',
      legalName: selectedRestaurant.legalName || '',
      code: selectedRestaurant.code || '',
      email: selectedRestaurant.email || '',
      phone: selectedRestaurant.phone || '',
      address: selectedRestaurant.address || '',
      city: selectedRestaurant.city || 'Lahore',
      country: selectedRestaurant.country || 'Pakistan',
      currency: selectedRestaurant.currency || 'PKR',
      timezone: selectedRestaurant.timezone || 'Asia/Karachi',
      dateFormat: selectedRestaurant.dateFormat || 'DD MMM YYYY'
    });

    // Hydrate Step 2
    if (initialBranch) {
      setBranchForm({
        name: initialBranch.name || 'Main Branch',
        code: initialBranch.code || 'BR-MAIN',
        phone: initialBranch.phone || '',
        email: initialBranch.email || '',
        address: initialBranch.address || '',
        city: initialBranch.city || selectedRestaurant.city || 'Lahore',
        status: initialBranch.status || 'Active'
      });
    }

    // Hydrate Step 3 (Storage Locations)
    const existingLocs = (platformStorageLocations || []).filter(
      l => l.restaurantId === selectedRestaurant.id
    );
    if (existingLocs.length > 0) {
      setStorageLocs(existingLocs);
    } else {
      // Default 4 locations
      const branchId = initialBranch?.id || 'branch-default';
      setStorageLocs([
        { id: `loc-${Date.now()}-1`, restaurantId: selectedRestaurant.id, branchId, name: 'Main Store', type: 'General Store', status: 'Active' },
        { id: `loc-${Date.now()}-2`, restaurantId: selectedRestaurant.id, branchId, name: 'Walk-in Cooler', type: 'Cold Storage', status: 'Active' },
        { id: `loc-${Date.now()}-3`, restaurantId: selectedRestaurant.id, branchId, name: 'Dry Store', type: 'Dry Storage', status: 'Active' },
        { id: `loc-${Date.now()}-4`, restaurantId: selectedRestaurant.id, branchId, name: 'Kitchen Prep', type: 'Kitchen / Prep', status: 'Active' }
      ]);
    }

    // Hydrate Step 4 (Owner & Members)
    setOwnerForm({
      name: selectedRestaurant.ownerName || '',
      email: selectedRestaurant.ownerEmail || '',
      phone: selectedRestaurant.ownerPhone || ''
    });

    const existingMembers = (platformMembers || []).filter(
      m => m.restaurantId === selectedRestaurant.id
    );
    setMembersList(existingMembers);

    // Hydrate Step 5 (Staff)
    const existingStaff = (platformStaff || []).filter(
      s => s.restaurantId === selectedRestaurant.id
    );
    setStaffList(existingStaff);

    // Hydrate Step 6 (Suppliers)
    const existingSuppliers = (platformSuppliers || []).filter(
      s => s.restaurantId === selectedRestaurant.id
    );
    setSuppliersList(existingSuppliers);

    // Hydrate Step 7 (Inventory)
    const existingInventory = (platformInitialInventory || []).filter(
      i => i.restaurantId === selectedRestaurant.id
    );
    setInventoryList(existingInventory);

  }, [selectedRestaurant, initialBranch]);

  // Set default inventory location once storageLocs are loaded
  useEffect(() => {
    if (storageLocs.length > 0 && !newInvLocation) {
      setNewInvLocation(storageLocs[0].name);
    }
  }, [storageLocs, newInvLocation]);

  if (!selectedRestaurant) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[30px]">store_mall_directory</span>
          </div>
          <h2 className="font-display-lg text-2xl font-bold text-on-surface mb-2">
            Restaurant Not Found
          </h2>
          <p className="font-body-md text-secondary max-w-md mx-auto mb-6">
            The requested restaurant setup session could not be resolved or was removed.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('admin-restaurants')}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  // Derive setup step statuses
  const setupSteps = selectedRestaurant.setupSteps || {
    restaurantInfo: 'Completed',
    branch: 'Completed',
    storageLocations: 'In Progress',
    ownerUsers: 'Not Started',
    staff: 'Not Started',
    suppliers: 'Not Started',
    initialInventory: 'Not Started',
    complete: 'Not Started'
  };

  // Calculate overall progress from completed steps
  const completedCount = STEP_DEFINITIONS.filter(step => setupSteps[step.key] === 'Completed').length;
  const progressPercent = Math.round((completedCount / STEP_DEFINITIONS.length) * 100);

  // Helper: Save & Exit to Restaurant Detail
  const handleSaveAndExit = () => {
    // Save current step data softly before exiting
    persistCurrentStep();
    showToast('Setup progress saved.', 'info', 'Progress Saved');
    onNavigate('admin-restaurant-detail');
  };

  // Helper: Persist current step's changes into AppStore
  const persistCurrentStep = () => {
    const rId = selectedRestaurant.id;
    const bId = initialBranch?.id || 'branch-default';

    if (currentStep === 1) {
      updatePlatformRestaurant(rId, {
        name: restForm.name.trim(),
        legalName: restForm.legalName.trim(),
        code: restForm.code.trim(),
        email: restForm.email.trim(),
        phone: restForm.phone.trim(),
        address: restForm.address.trim(),
        city: restForm.city.trim(),
        country: restForm.country.trim(),
        currency: restForm.currency,
        timezone: restForm.timezone,
        dateFormat: restForm.dateFormat
      });
    } else if (currentStep === 2) {
      if (initialBranch) {
        updatePlatformBranch(initialBranch.id, {
          name: branchForm.name.trim(),
          code: branchForm.code.trim(),
          phone: branchForm.phone.trim(),
          email: branchForm.email.trim(),
          address: branchForm.address.trim(),
          city: branchForm.city.trim(),
          status: branchForm.status
        });
      }
    } else if (currentStep === 3) {
      saveRestaurantStorageLocations(rId, bId, storageLocs);
    } else if (currentStep === 4) {
      updatePlatformRestaurant(rId, {
        ownerName: ownerForm.name.trim(),
        ownerEmail: ownerForm.email.trim(),
        ownerPhone: ownerForm.phone.trim()
      });
      // Save members
      const ownerMember = {
        id: `mem-${rId}-owner`,
        restaurantId: rId,
        userId: null,
        name: ownerForm.name.trim() || selectedRestaurant.ownerName,
        email: ownerForm.email.trim() || selectedRestaurant.ownerEmail,
        role: 'Restaurant Owner',
        status: 'Pending',
        branchAccess: ['all'],
        createdAt: selectedRestaurant.createdAt || '2026-09-20'
      };
      const finalMembers = [
        ownerMember,
        ...membersList.filter(m => m.id !== ownerMember.id)
      ];
      saveRestaurantMembers(rId, finalMembers);
    } else if (currentStep === 5) {
      saveRestaurantStaff(rId, bId, staffList);
    } else if (currentStep === 6) {
      saveRestaurantSuppliers(rId, suppliersList);
    } else if (currentStep === 7) {
      saveRestaurantInitialInventory(rId, bId, inventoryList);
    }
  };

  // STEP 1 HANDLER
  const handleSaveStep1 = (e) => {
    e.preventDefault();
    setStepError('');

    if (!restForm.name.trim()) {
      setStepError('Restaurant Name is required.');
      return;
    }
    if (!restForm.currency) {
      setStepError('Currency is required.');
      return;
    }
    if (!restForm.timezone) {
      setStepError('Timezone is required.');
      return;
    }

    persistCurrentStep();
    updateRestaurantSetupStep(selectedRestaurant.id, 'restaurantInfo', 'Completed');
    setCurrentStep(2);
  };

  // STEP 2 HANDLER
  const handleSaveStep2 = (e) => {
    e.preventDefault();
    setStepError('');

    if (!branchForm.name.trim()) {
      setStepError('Branch Name is required.');
      return;
    }

    persistCurrentStep();
    updateRestaurantSetupStep(selectedRestaurant.id, 'branch', 'Completed');
    setCurrentStep(3);
  };

  // STEP 3 HANDLERS
  const handleAddLocation = () => {
    setStepError('');
    const trimmed = newLocName.trim();
    if (!trimmed) {
      setStepError('Location name cannot be empty.');
      return;
    }

    const duplicate = storageLocs.some(l => l.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setStepError(`A location named "${trimmed}" already exists for this branch.`);
      return;
    }

    const bId = initialBranch?.id || 'branch-default';
    const newLoc = {
      id: `loc-${Date.now()}`,
      restaurantId: selectedRestaurant.id,
      branchId: bId,
      name: trimmed,
      type: newLocType,
      status: 'Active'
    };
    setStorageLocs([...storageLocs, newLoc]);
    setNewLocName('');
  };

  const handleRemoveLocation = (id) => {
    if (storageLocs.length <= 1) {
      setStepError('At least one storage location is required.');
      return;
    }
    setStorageLocs(storageLocs.filter(l => l.id !== id));
  };

  const handleSaveStep3 = () => {
    setStepError('');
    if (storageLocs.length === 0) {
      setStepError('At least one storage location is required.');
      return;
    }
    persistCurrentStep();
    updateRestaurantSetupStep(selectedRestaurant.id, 'storageLocations', 'Completed');
    setCurrentStep(4);
  };

  // STEP 4 HANDLERS
  const handleAddMember = () => {
    setStepError('');
    const name = newMemberName.trim();
    const email = newMemberEmail.trim();

    if (!name || !email) {
      setStepError('Name and Email are required to add a management user.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStepError('Please enter a valid email address.');
      return;
    }

    if (email.toLowerCase() === (ownerForm.email || selectedRestaurant.ownerEmail).toLowerCase()) {
      setStepError('This email is already assigned to the Restaurant Owner.');
      return;
    }

    const duplicate = membersList.some(m => m.email.toLowerCase() === email.toLowerCase());
    if (duplicate) {
      setStepError(`User with email "${email}" already exists.`);
      return;
    }

    const newMember = {
      id: `mem-${Date.now()}`,
      restaurantId: selectedRestaurant.id,
      userId: null,
      name,
      email,
      role: newMemberRole,
      status: 'Pending',
      branchAccess: ['all'],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setMembersList([...membersList, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleRemoveMember = (id) => {
    setMembersList(membersList.filter(m => m.id !== id));
  };

  const handleSaveStep4 = (e) => {
    e.preventDefault();
    setStepError('');

    if (!ownerForm.name.trim()) {
      setStepError('Owner Name is required.');
      return;
    }
    if (!ownerForm.email.trim()) {
      setStepError('Owner Email is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerForm.email.trim())) {
      setStepError('Please enter a valid Owner email address.');
      return;
    }

    persistCurrentStep();
    updateRestaurantSetupStep(selectedRestaurant.id, 'ownerUsers', 'Completed');
    setCurrentStep(5);
  };

  // STEP 5 HANDLERS (Staff)
  const handleAddStaff = () => {
    setStepError('');
    const name = newStaffName.trim();
    if (!name) {
      setStepError('Staff name cannot be empty.');
      return;
    }

    const bId = initialBranch?.id || 'branch-default';
    const newStaff = {
      id: `pstf-${Date.now()}`,
      restaurantId: selectedRestaurant.id,
      branchId: bId,
      name,
      role: newStaffRole,
      department: newStaffDept,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStaffList([...staffList, newStaff]);
    setNewStaffName('');
  };

  const handleRemoveStaff = (id) => {
    setStaffList(staffList.filter(s => s.id !== id));
  };

  const handleSaveStep5 = () => {
    persistCurrentStep();
    updateRestaurantSetupStep(selectedRestaurant.id, 'staff', 'Completed');
    setCurrentStep(6);
  };

  // STEP 6 HANDLERS (Suppliers)
  const handleAddSupplier = () => {
    setStepError('');
    const name = newSupName.trim();
    if (!name) {
      setStepError('Supplier name is required.');
      return;
    }

    const duplicate = suppliersList.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setStepError(`Supplier "${name}" already added.`);
      return;
    }

    const newSup = {
      id: `sup-${Date.now()}`,
      restaurantId: selectedRestaurant.id,
      name,
      contactPerson: newSupContact.trim() || '—',
      email: newSupEmail.trim() || '—',
      phone: newSupPhone.trim() || '—',
      category: newSupCategory,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSuppliersList([...suppliersList, newSup]);
    setNewSupName('');
    setNewSupContact('');
    setNewSupEmail('');
    setNewSupPhone('');
  };

  const handleRemoveSupplier = (id) => {
    setSuppliersList(suppliersList.filter(s => s.id !== id));
  };

  const handleSaveStep6 = () => {
    persistCurrentStep();
    updateRestaurantSetupStep(selectedRestaurant.id, 'suppliers', 'Completed');
    setCurrentStep(7);
  };

  const handleSkipStep6 = () => {
    updateRestaurantSetupStep(selectedRestaurant.id, 'suppliers', 'Completed');
    setCurrentStep(7);
  };

  // STEP 7 HANDLERS (Initial Inventory)
  const handleAddInventoryItem = () => {
    setStepError('');
    const name = newInvName.trim();
    if (!name) {
      setStepError('Ingredient Name is required.');
      return;
    }

    const minStock = parseFloat(newInvMinStock);
    const cost = parseFloat(newInvCost);
    const openingQty = parseFloat(newInvOpeningQty);

    if (isNaN(minStock) || minStock < 0) {
      setStepError('Minimum Stock must be a positive number.');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setStepError('Cost Per Unit must be a positive number.');
      return;
    }
    if (isNaN(openingQty) || openingQty < 0) {
      setStepError('Opening Quantity must be a positive number.');
      return;
    }

    const bId = initialBranch?.id || 'branch-default';
    const newItem = {
      id: `inv-${Date.now()}`,
      restaurantId: selectedRestaurant.id,
      branchId: bId,
      name,
      category: newInvCategory,
      unit: newInvUnit,
      minStock,
      cost,
      location: newInvLocation || (storageLocs[0]?.name || 'Main Store'),
      quantity: openingQty
    };

    setInventoryList([...inventoryList, newItem]);
    setNewInvName('');
    setNewInvOpeningQty('5');
  };

  const handleRemoveInventoryItem = (id) => {
    setInventoryList(inventoryList.filter(i => i.id !== id));
  };

  const handleSaveStep7 = () => {
    persistCurrentStep();
    updateRestaurantSetupStep(selectedRestaurant.id, 'initialInventory', 'Completed');
    setCurrentStep(8);
  };

  const handleSkipStep7 = () => {
    updateRestaurantSetupStep(selectedRestaurant.id, 'initialInventory', 'Completed');
    setCurrentStep(8);
  };

  // STEP 8: COMPLETE SETUP
  const isRequiredStepsComplete =
    setupSteps.restaurantInfo === 'Completed' &&
    setupSteps.branch === 'Completed' &&
    setupSteps.storageLocations === 'Completed' &&
    setupSteps.ownerUsers === 'Completed';

  const handleCompleteSetup = () => {
    if (!isRequiredStepsComplete) {
      setStepError('Please complete all required setup steps before finalizing setup.');
      return;
    }

    persistCurrentStep();
    completeRestaurantSetup(selectedRestaurant.id);
    onNavigate('admin-restaurant-detail');
  };

  return (
    <div className="w-full flex flex-col pb-16 antialiased">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <button
          type="button"
          onClick={() => onNavigate('admin-restaurants')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Restaurants
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <button
          type="button"
          onClick={() => onNavigate('admin-restaurant-detail')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          {selectedRestaurant.name}
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">Setup Wizard</span>
      </nav>

      {/* TOP HEADER & RESTAURANT CONTEXT */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md mb-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-numeric-table tracking-wide bg-surface-container text-on-surface-variant border border-outline-variant/40">
              {selectedRestaurant.id}
            </span>
            <span className="font-label-sm uppercase tracking-wider text-secondary font-semibold">
              Restaurant Setup Wizard
            </span>
          </div>
          <h1 className="font-display-lg text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
            Setting up: {selectedRestaurant.name}
          </h1>
          <p className="font-body-md text-secondary mt-0.5">
            Configure branches, storage locations, management access and operational foundations.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            type="button"
            onClick={handleSaveAndExit}
            className="px-4 py-2 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            Save & Exit
          </button>
          <div className="text-right pl-3 border-l border-outline-variant/30">
            <div className="text-[11px] uppercase tracking-wider text-secondary font-semibold">Status</div>
            <div className="font-label-md font-bold text-primary">
              {selectedRestaurant.setupStatus || 'In Progress'}
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS TRACKER BAR */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md mb-space-lg shadow-sm">
        <div className="flex items-center justify-between font-label-md mb-2">
          <span className="text-on-surface font-semibold">
            Setup Progress: <span className="font-numeric-table text-primary">{completedCount} of 8 steps completed</span>
          </span>
          <span className="font-numeric-table font-bold text-primary">{progressPercent}%</span>
        </div>
        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ERROR BANNER */}
      {stepError && (
        <div className="mb-space-md p-space-md bg-error-container/40 border border-error/20 rounded-xl flex items-start gap-space-sm text-on-error-container">
          <span className="material-symbols-outlined text-[20px] text-error shrink-0">error</span>
          <div className="font-body-sm flex-1">{stepError}</div>
          <button
            type="button"
            onClick={() => setStepError('')}
            className="text-error hover:opacity-75 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* WIZARD WORKSPACE (2-COLUMN ON DESKTOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* LEFT COLUMN: STEP NAVIGATION (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md shadow-sm">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant mb-space-sm">
              Setup Steps
            </h2>
            <nav className="flex flex-col gap-1.5" aria-label="Wizard Steps">
              {STEP_DEFINITIONS.map((step) => {
                const isCurrent = currentStep === step.id;
                const status = setupSteps[step.key] || 'Not Started';
                const isCompleted = status === 'Completed';

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setStepError('');
                      persistCurrentStep();
                      setCurrentStep(step.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-primary-container/10 border-primary text-primary font-semibold'
                        : isCompleted
                        ? 'bg-surface-container-lowest border-outline-variant/20 hover:bg-surface-container-low text-on-surface'
                        : 'bg-surface-container-lowest border-transparent hover:bg-surface-container-low text-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-numeric-table font-bold ${
                          isCurrent
                            ? 'bg-primary text-on-primary'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        ) : (
                          step.id
                        )}
                      </div>
                      <div>
                        <div className="font-label-md text-sm">{step.label}</div>
                        <div className="text-[11px] text-secondary font-normal">
                          {step.isRequired ? 'Required' : 'Optional'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCurrent
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Tip Box */}
          <div className="bg-surface-container-low/60 border border-outline-variant/30 rounded-xl p-space-md text-xs text-secondary leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-on-surface mb-1">
              <span className="material-symbols-outlined text-[16px] text-primary">info</span>
              <span>Prototype Isolation</span>
            </div>
            Data recorded in this wizard prepares the restaurant structure. Operational inventory and POS integration remain disabled until the setup is finalized.
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE STEP CONTENT PANEL (8 COLS) */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
            {/* STEP 1: RESTAURANT INFORMATION */}
            {currentStep === 1 && (
              <form onSubmit={handleSaveStep1} className="flex flex-col gap-space-md">
                <div className="border-b border-outline-variant/20 pb-space-sm mb-space-xs">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Step 1 of 8</span>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mt-0.5">
                    Restaurant Information
                  </h3>
                  <p className="font-body-sm text-secondary">
                    Review and confirm master restaurant corporate and regional parameters.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Restaurant Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={restForm.name}
                      onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Legal / Business Name
                    </label>
                    <input
                      type="text"
                      value={restForm.legalName}
                      onChange={(e) => setRestForm({ ...restForm, legalName: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Restaurant Code
                    </label>
                    <input
                      type="text"
                      value={restForm.code}
                      onChange={(e) => setRestForm({ ...restForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-numeric-table"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={restForm.phone}
                      onChange={(e) => setRestForm({ ...restForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-numeric-table"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={restForm.email}
                      onChange={(e) => setRestForm({ ...restForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={restForm.city}
                      onChange={(e) => setRestForm({ ...restForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={restForm.address}
                      onChange={(e) => setRestForm({ ...restForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Currency <span className="text-error">*</span>
                    </label>
                    <select
                      value={restForm.currency}
                      onChange={(e) => setRestForm({ ...restForm, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Timezone <span className="text-error">*</span>
                    </label>
                    <select
                      value={restForm.timezone}
                      onChange={(e) => setRestForm({ ...restForm, timezone: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {TIMEZONE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-md mt-space-sm">
                  <button
                    type="button"
                    onClick={handleSaveAndExit}
                    className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                  >
                    Save & Exit
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
                  >
                    Save & Continue
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: INITIAL BRANCH */}
            {currentStep === 2 && (
              <form onSubmit={handleSaveStep2} className="flex flex-col gap-space-md">
                <div className="border-b border-outline-variant/20 pb-space-sm mb-space-xs">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Step 2 of 8</span>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mt-0.5">
                    Initial Branch Details
                  </h3>
                  <p className="font-body-sm text-secondary">
                    Configure the primary operating location for this restaurant.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Branch Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={branchForm.name}
                      onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Branch Code
                    </label>
                    <input
                      type="text"
                      value={branchForm.code}
                      onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-numeric-table"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Branch Phone
                    </label>
                    <input
                      type="tel"
                      value={branchForm.phone}
                      onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-numeric-table"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Branch Email
                    </label>
                    <input
                      type="email"
                      value={branchForm.email}
                      onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Branch Address
                    </label>
                    <input
                      type="text"
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={branchForm.city}
                      onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Status
                    </label>
                    <select
                      value={branchForm.status}
                      onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-md mt-space-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndExit}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Save & Exit
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
                  >
                    Save & Continue
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: STORAGE LOCATIONS */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-space-md">
                <div className="border-b border-outline-variant/20 pb-space-sm mb-space-xs">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Step 3 of 8</span>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mt-0.5">
                    Storage Locations
                  </h3>
                  <p className="font-body-sm text-secondary">
                    Define inventory holding zones for <span className="font-semibold text-on-surface">{branchForm.name}</span>. At least one storage zone is required.
                  </p>
                </div>

                {/* Locations Table / List */}
                <div className="border border-outline-variant/30 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                      <tr>
                        <th className="px-4 py-3">Location Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {storageLocs.map((loc) => (
                        <tr key={loc.id} className="hover:bg-surface-container-lowest/50">
                          <td className="px-4 py-3 font-semibold text-on-surface">{loc.name}</td>
                          <td className="px-4 py-3 text-secondary text-xs">{loc.type}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLocation(loc.id)}
                              className="text-error hover:opacity-75 p-1 rounded cursor-pointer"
                              title="Remove location"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Location Subform */}
                <div className="p-4 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      New Location Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Freezers, Beverage Cellar"
                      value={newLocName}
                      onChange={(e) => setNewLocName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                      Storage Type
                    </label>
                    <select
                      value={newLocType}
                      onChange={(e) => setNewLocType(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="w-full sm:w-auto px-4 py-2 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer shrink-0"
                  >
                    + Add Zone
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-md mt-space-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndExit}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Save & Exit
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveStep3}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: OWNER & USERS */}
            {currentStep === 4 && (
              <form onSubmit={handleSaveStep4} className="flex flex-col gap-space-md">
                <div className="border-b border-outline-variant/20 pb-space-sm mb-space-xs">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Step 4 of 8</span>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mt-0.5">
                    Owner & Management Users
                  </h3>
                  <p className="font-body-sm text-secondary">
                    Specify platform access members for this restaurant account.
                  </p>
                </div>

                {/* Primary Owner Box */}
                <div className="p-4 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                    <span className="font-label-md font-bold text-on-surface">Restaurant Owner (Primary Account)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                        Owner Full Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={ownerForm.name}
                        onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                        Owner Email <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        value={ownerForm.email}
                        onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                        Owner Phone
                      </label>
                      <input
                        type="tel"
                        value={ownerForm.phone}
                        onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-numeric-table"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-secondary">
                    User access will become active when authentication is connected. No invitation is sent in this frontend prototype.
                  </div>
                </div>

                {/* Additional Members List */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                    Additional Management Users (Optional)
                  </h4>
                  {membersList.length > 0 && (
                    <div className="border border-outline-variant/30 rounded-xl overflow-hidden mb-3">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                          <tr>
                            <th className="px-4 py-2.5">Name</th>
                            <th className="px-4 py-2.5">Email</th>
                            <th className="px-4 py-2.5">Role</th>
                            <th className="px-4 py-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          {membersList.map((m) => (
                            <tr key={m.id} className="hover:bg-surface-container-lowest/50">
                              <td className="px-4 py-2.5 font-semibold text-on-surface">{m.name}</td>
                              <td className="px-4 py-2.5 text-secondary">{m.email}</td>
                              <td className="px-4 py-2.5 text-xs text-on-surface">{m.role}</td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(m.id)}
                                  className="text-error hover:opacity-75 p-1 rounded cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add Member Row */}
                  <div className="p-3 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Name</label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="colleague@domain.test"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Role</label>
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                      >
                        {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold text-sm cursor-pointer"
                    >
                      + Add Member
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-md mt-space-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndExit}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Save & Exit
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
                  >
                    Save & Continue
                  </button>
                </div>
              </form>
            )}

            {/* STEP 5: INITIAL STAFF */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-space-md">
                <div className="border-b border-outline-variant/20 pb-space-sm mb-space-xs">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Step 5 of 8 (Optional)</span>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mt-0.5">
                    Initial Kitchen & Operations Staff
                  </h3>
                  <p className="font-body-sm text-secondary">
                    Preload key operational personnel (chefs, managers, inventory leads).
                  </p>
                </div>

                {staffList.length > 0 && (
                  <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                        <tr>
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5">Role</th>
                          <th className="px-4 py-2.5">Department</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {staffList.map((st) => (
                          <tr key={st.id} className="hover:bg-surface-container-lowest/50">
                            <td className="px-4 py-2.5 font-semibold text-on-surface">{st.name}</td>
                            <td className="px-4 py-2.5 text-secondary">{st.role}</td>
                            <td className="px-4 py-2.5 text-xs text-on-surface">{st.department}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveStaff(st.id)}
                                className="text-error hover:opacity-75 p-1 rounded cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Staff Row */}
                <div className="p-3 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Asad Naveed"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Role</label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                    >
                      {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Department</label>
                    <select
                      value={newStaffDept}
                      onChange={(e) => setNewStaffDept(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStaff}
                    className="px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold text-sm cursor-pointer"
                  >
                    + Add Staff
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-md mt-space-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndExit}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Save & Exit
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveStep5}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: SUPPLIERS */}
            {currentStep === 6 && (
              <div className="flex flex-col gap-space-md">
                <div className="border-b border-outline-variant/20 pb-space-sm mb-space-xs">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Step 6 of 8 (Optional)</span>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mt-0.5">
                    Suppliers Setup
                  </h3>
                  <p className="font-body-sm text-secondary">
                    Add initial food, beverage or packaging vendors. You can also skip this step.
                  </p>
                </div>

                {suppliersList.length > 0 && (
                  <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                        <tr>
                          <th className="px-4 py-2.5">Supplier</th>
                          <th className="px-4 py-2.5">Category</th>
                          <th className="px-4 py-2.5">Contact Person</th>
                          <th className="px-4 py-2.5">Phone / Email</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {suppliersList.map((sup) => (
                          <tr key={sup.id} className="hover:bg-surface-container-lowest/50">
                            <td className="px-4 py-2.5 font-semibold text-on-surface">{sup.name}</td>
                            <td className="px-4 py-2.5 text-xs text-secondary">{sup.category}</td>
                            <td className="px-4 py-2.5 text-xs text-on-surface">{sup.contactPerson}</td>
                            <td className="px-4 py-2.5 text-xs text-secondary">{sup.phone}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveSupplier(sup.id)}
                                className="text-error hover:opacity-75 p-1 rounded cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Supplier Form */}
                <div className="p-3 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Metro Wholesale"
                      value={newSupName}
                      onChange={(e) => setNewSupName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Category</label>
                    <select
                      value={newSupCategory}
                      onChange={(e) => setNewSupCategory(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                    >
                      {INGREDIENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={newSupContact}
                      onChange={(e) => setNewSupContact(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="+92 300 0000000"
                      value={newSupPhone}
                      onChange={(e) => setNewSupPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm font-numeric-table"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSupplier}
                    className="px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold text-sm cursor-pointer"
                  >
                    + Add Supplier
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-md mt-space-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndExit}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Save & Exit
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipStep6}
                      className="px-4 py-2 text-secondary hover:underline font-label-md font-semibold cursor-pointer"
                    >
                      Skip for Now
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveStep6}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: INITIAL INVENTORY */}
            {currentStep === 7 && (
              <div className="flex flex-col gap-space-md">
                <div className="border-b border-outline-variant/20 pb-space-sm mb-space-xs">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Step 7 of 8 (Optional)</span>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mt-0.5">
                    Initial Master Inventory
                  </h3>
                  <p className="font-body-sm text-secondary">
                    Configure initial stock holding records. You may also skip this step and add items later.
                  </p>
                </div>

                {inventoryList.length > 0 && (
                  <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                        <tr>
                          <th className="px-4 py-2.5">Item</th>
                          <th className="px-4 py-2.5">Category</th>
                          <th className="px-4 py-2.5">Unit</th>
                          <th className="px-4 py-2.5">Location</th>
                          <th className="px-4 py-2.5 font-numeric-table">Opening Qty</th>
                          <th className="px-4 py-2.5 font-numeric-table">Cost</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {inventoryList.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-container-lowest/50">
                            <td className="px-4 py-2.5 font-semibold text-on-surface">{item.name}</td>
                            <td className="px-4 py-2.5 text-xs text-secondary">{item.category}</td>
                            <td className="px-4 py-2.5 text-xs text-secondary">{item.unit}</td>
                            <td className="px-4 py-2.5 text-xs text-on-surface">{item.location}</td>
                            <td className="px-4 py-2.5 font-numeric-table font-semibold text-on-surface">{item.quantity}</td>
                            <td className="px-4 py-2.5 font-numeric-table text-secondary">{item.cost}</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveInventoryItem(item.id)}
                                className="text-error hover:opacity-75 p-1 rounded cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Inventory Item Subform */}
                <div className="p-3 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Item Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Chicken Breast"
                        value={newInvName}
                        onChange={(e) => setNewInvName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Category</label>
                      <select
                        value={newInvCategory}
                        onChange={(e) => setNewInvCategory(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                      >
                        {INGREDIENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Unit</label>
                      <select
                        value={newInvUnit}
                        onChange={(e) => setNewInvUnit(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                      >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Storage Zone</label>
                      <select
                        value={newInvLocation}
                        onChange={(e) => setNewInvLocation(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm"
                      >
                        {storageLocs.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Opening Quantity</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={newInvOpeningQty}
                        onChange={(e) => setNewInvOpeningQty(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm font-numeric-table"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Cost Per Unit</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={newInvCost}
                        onChange={(e) => setNewInvCost(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm font-numeric-table"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-secondary uppercase mb-1">Min Stock</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={newInvMinStock}
                        onChange={(e) => setNewInvMinStock(e.target.value)}
                        className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm font-numeric-table"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddInventoryItem}
                      className="px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold text-sm cursor-pointer"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-md mt-space-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndExit}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Save & Exit
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipStep7}
                      className="px-4 py-2 text-secondary hover:underline font-label-md font-semibold cursor-pointer"
                    >
                      Skip Inventory Setup
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveStep7}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 8: REVIEW & COMPLETE */}
            {currentStep === 8 && (
              <div className="flex flex-col gap-space-md">
                <div className="border-b border-outline-variant/20 pb-space-sm mb-space-xs">
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Step 8 of 8</span>
                  <h3 className="font-display-lg text-xl font-bold text-on-surface mt-0.5">
                    Review & Complete Setup
                  </h3>
                  <p className="font-body-sm text-secondary">
                    Review the initialized setup data before finalizing the restaurant profile.
                  </p>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  {/* Restaurant Summary */}
                  <div className="p-4 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Restaurant Profile
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary">Name:</span>
                        <span className="font-semibold text-on-surface">{restForm.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Code:</span>
                        <span className="font-numeric-table text-on-surface">{restForm.code || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Currency:</span>
                        <span className="font-semibold text-on-surface">{restForm.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Timezone:</span>
                        <span className="text-on-surface">{restForm.timezone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Branch Summary */}
                  <div className="p-4 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Operating Branch
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary">Branch Name:</span>
                        <span className="font-semibold text-on-surface">{branchForm.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">City:</span>
                        <span className="text-on-surface">{branchForm.city || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Storage Zones:</span>
                        <span className="font-numeric-table font-semibold text-primary">{storageLocs.length} zones</span>
                      </div>
                    </div>
                  </div>

                  {/* Users & Staff Summary */}
                  <div className="p-4 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Personnel Initialized
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary">Owner:</span>
                        <span className="font-semibold text-on-surface">{ownerForm.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Additional Managers:</span>
                        <span className="font-numeric-table text-on-surface">{membersList.length} users</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Operational Staff:</span>
                        <span className="font-numeric-table text-on-surface">{staffList.length} staff</span>
                      </div>
                    </div>
                  </div>

                  {/* Suppliers & Inventory Summary */}
                  <div className="p-4 bg-surface-container-low/40 border border-outline-variant/30 rounded-xl">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                      Operations Data
                    </h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary">Suppliers:</span>
                        <span className="font-numeric-table text-on-surface">{suppliersList.length} registered</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Initial Inventory:</span>
                        <span className="font-numeric-table text-on-surface">{inventoryList.length} items</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checklist Verification */}
                <div className="p-4 border border-outline-variant/30 rounded-xl bg-surface-container-lowest">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
                    Setup Readiness Verification
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[18px] ${setupSteps.restaurantInfo === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {setupSteps.restaurantInfo === 'Completed' ? 'check_circle' : 'pending'}
                      </span>
                      <span>1. Restaurant Information ({setupSteps.restaurantInfo || 'Pending'})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[18px] ${setupSteps.branch === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {setupSteps.branch === 'Completed' ? 'check_circle' : 'pending'}
                      </span>
                      <span>2. Initial Branch ({setupSteps.branch || 'Pending'})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[18px] ${setupSteps.storageLocations === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {setupSteps.storageLocations === 'Completed' ? 'check_circle' : 'pending'}
                      </span>
                      <span>3. Storage Locations ({setupSteps.storageLocations || 'Pending'})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[18px] ${setupSteps.ownerUsers === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {setupSteps.ownerUsers === 'Completed' ? 'check_circle' : 'pending'}
                      </span>
                      <span>4. Owner & Users ({setupSteps.ownerUsers || 'Pending'})</span>
                    </div>
                  </div>
                </div>

                {!isRequiredStepsComplete && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>Required setup steps (1 through 4) must be completed before finalizing setup.</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-space-md mt-space-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(7)}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndExit}
                      className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
                    >
                      Save & Exit
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompleteSetup}
                    disabled={!isRequiredStepsComplete}
                    className={`px-8 py-2.5 rounded-lg font-label-md font-semibold shadow-sm transition-all flex items-center gap-2 ${
                      isRequiredStepsComplete
                        ? 'bg-primary hover:bg-primary/90 text-on-primary cursor-pointer'
                        : 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed border border-outline-variant/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    <span>Complete Setup</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
