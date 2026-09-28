import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';

const PROTOTYPE_ROLES = [
  'Restaurant Owner',
  'Operations Lead',
  'Inventory Manager',
  'Kitchen Manager'
];

const STATUS_OPTIONS = [
  'Active',
  'Pending',
  'Inactive'
];

export default function AdminRestaurantUsers({ onNavigate }) {
  const {
    platformRestaurants,
    platformBranches,
    platformMembers,
    selectedRestaurantId,
    updatePlatformMember,
    togglePlatformMemberStatus,
    formatDate,
    showToast
  } = useAppStore();

  // 1. Resolve selected restaurant
  const selectedRestaurant = useMemo(() => {
    if (!platformRestaurants || platformRestaurants.length === 0) return null;
    return platformRestaurants.find(r => r.id === selectedRestaurantId) || null;
  }, [platformRestaurants, selectedRestaurantId]);

  // 2. Resolve branches strictly belonging to this restaurant (tenant isolation)
  const restaurantBranches = useMemo(() => {
    if (!selectedRestaurant) return [];
    return (platformBranches || []).filter(b => b.restaurantId === selectedRestaurant.id);
  }, [platformBranches, selectedRestaurant]);

  // Branch ID -> Branch Name lookup map
  const branchMap = useMemo(() => {
    const map = new Map();
    restaurantBranches.forEach(b => map.set(b.id, b.name));
    return map;
  }, [restaurantBranches]);

  // 3. Resolve and ensure members strictly belonging to this restaurant (tenant isolation)
  const restaurantMembers = useMemo(() => {
    if (!selectedRestaurant) return [];
    const directMembers = (platformMembers || []).filter(
      m => m.restaurantId === selectedRestaurant.id
    );

    // Ensure the primary restaurant owner from onboarding appears if not already in store
    const hasOwner = directMembers.some(m => m.role === 'Restaurant Owner');
    if (!hasOwner && selectedRestaurant.ownerName) {
      const fallbackOwner = {
        id: `mem-${selectedRestaurant.id}-owner`,
        restaurantId: selectedRestaurant.id,
        userId: null,
        name: selectedRestaurant.ownerName,
        email: selectedRestaurant.ownerEmail || 'owner@restaurant.test',
        phone: selectedRestaurant.ownerPhone || '',
        role: 'Restaurant Owner',
        status: selectedRestaurant.setupStatus === 'Completed' ? 'Active' : 'Pending',
        branchAccess: ['all'],
        accountType: 'restaurant_user',
        createdAt: selectedRestaurant.createdAt || '2026-09-01',
        lastUpdatedAt: selectedRestaurant.createdAt || '2026-09-01'
      };
      return [fallbackOwner, ...directMembers];
    }

    return directMembers;
  }, [platformMembers, selectedRestaurant]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');

  // Modal states
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Operations Lead',
    status: 'Active',
    accessMode: 'all', // 'all' or 'specific'
    selectedBranches: []
  });
  const [editError, setEditError] = useState('');

  // Status Change Confirmation Modal
  const [statusModalMember, setStatusModalMember] = useState(null);

  // Dynamic Summary Metrics
  const totalUsers = restaurantMembers.length;
  const activeCount = restaurantMembers.filter(m => m.status === 'Active').length;
  const pendingCount = restaurantMembers.filter(m => m.status === 'Pending').length;
  const inactiveCount = restaurantMembers.filter(m => m.status === 'Inactive').length;
  const ownersCount = restaurantMembers.filter(m => m.role === 'Restaurant Owner').length;
  const managementCount = restaurantMembers.filter(m => m.role !== 'Restaurant Owner').length;

  // Filtered members
  const filteredMembers = useMemo(() => {
    return restaurantMembers.filter(member => {
      // Role filter
      if (roleFilter !== 'All' && member.role !== roleFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && member.status !== statusFilter) {
        return false;
      }
      // Branch filter
      if (branchFilter !== 'All') {
        if (branchFilter === 'all_branches') {
          if (!member.branchAccess || !member.branchAccess.includes('all')) {
            return false;
          }
        } else {
          // Specific branch ID selected
          const access = member.branchAccess || [];
          if (!access.includes('all') && !access.includes(branchFilter)) {
            return false;
          }
        }
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (member.name || '').toLowerCase().includes(query);
        const matchesEmail = (member.email || '').toLowerCase().includes(query);
        const matchesPhone = (member.phone || '').toLowerCase().includes(query);
        const matchesId = (member.id || '').toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [restaurantMembers, roleFilter, statusFilter, branchFilter, searchTerm]);

  // Helper to format branch access
  const getBranchAccessDisplay = (branchAccess) => {
    if (!branchAccess || branchAccess.includes('all') || branchAccess.length === 0) {
      return {
        label: 'All Branches',
        isAll: true,
        branches: []
      };
    }
    const names = branchAccess
      .map(id => ({ id, name: branchMap.get(id) || id }))
      .filter(b => b.name);
    return {
      label: names.map(b => b.name).join(', '),
      isAll: false,
      branches: names
    };
  };

  // Helper to format branch access for CSV
  const getBranchAccessForCSV = (branchAccess) => {
    if (!branchAccess || branchAccess.includes('all') || branchAccess.length === 0) {
      return 'All Branches';
    }
    const names = branchAccess.map(id => branchMap.get(id) || id);
    return names.join('; ');
  };

  // Open Edit Modal
  const handleOpenEdit = (member) => {
    const isAll = !member.branchAccess || member.branchAccess.includes('all') || member.branchAccess.length === 0;
    setEditingMember(member);
    setEditForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'Operations Lead',
      status: member.status || 'Active',
      accessMode: isAll ? 'all' : 'specific',
      selectedBranches: isAll ? [] : member.branchAccess.filter(id => id !== 'all')
    });
    setEditError('');
  };

  // Save Edit Modal
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingMember) return;

    const trimmedName = editForm.name.trim();
    const trimmedEmail = editForm.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      setEditError('Full Name is required.');
      return;
    }

    if (!trimmedEmail) {
      setEditError('Email address is required.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setEditError('Please enter a valid email address.');
      return;
    }

    // Duplicate email within same restaurant
    const isDuplicateEmail = restaurantMembers.some(
      m => m.id !== editingMember.id && (m.email || '').trim().toLowerCase() === trimmedEmail
    );
    if (isDuplicateEmail) {
      setEditError('A user with this email already exists for this restaurant.');
      return;
    }

    // Branch selection validation
    let finalBranchAccess = ['all'];
    if (editForm.accessMode === 'specific') {
      if (editForm.selectedBranches.length === 0) {
        setEditError('Please select at least one branch for specific access.');
        return;
      }
      finalBranchAccess = editForm.selectedBranches;
    }

    // Last-Owner Protection check
    const isCurrentlyOwner = editingMember.role === 'Restaurant Owner';
    const isChangingFromOwner = isCurrentlyOwner && editForm.role !== 'Restaurant Owner';
    const isDeactivatingOwner = isCurrentlyOwner && editForm.status === 'Inactive';

    if (isChangingFromOwner || isDeactivatingOwner) {
      const remainingActiveOwners = restaurantMembers.filter(
        m => m.id !== editingMember.id &&
             m.role === 'Restaurant Owner' &&
             (m.status === 'Active' || m.status === 'Pending')
      );
      if (remainingActiveOwners.length === 0) {
        setEditError('At least one Restaurant Owner is required.');
        return;
      }
    }

    const res = updatePlatformMember(editingMember.id, {
      name: trimmedName,
      email: trimmedEmail,
      phone: editForm.phone.trim(),
      role: editForm.role,
      status: editForm.status,
      branchAccess: finalBranchAccess
    });

    if (res && res.success) {
      showToast(`${trimmedName} updated successfully`, 'success', 'User Updated');
      setEditingMember(null);
    } else {
      setEditError(res?.error || 'Failed to update user.');
    }
  };

  // Status Modal Handlers
  const handleOpenStatusModal = (member) => {
    // If user is owner and active/pending, check if deactivating would remove last owner
    if (member.role === 'Restaurant Owner' && member.status !== 'Inactive') {
      const activeOwners = restaurantMembers.filter(
        m => m.role === 'Restaurant Owner' &&
             (m.status === 'Active' || m.status === 'Pending') &&
             m.id !== member.id
      );
      if (activeOwners.length === 0) {
        showToast('At least one Restaurant Owner is required.', 'error', 'Action Restricted');
        return;
      }
    }
    setStatusModalMember(member);
  };

  const handleConfirmStatusToggle = () => {
    if (!statusModalMember) return;
    const res = togglePlatformMemberStatus(statusModalMember.id);
    if (res && res.success) {
      showToast(
        `${statusModalMember.name} is now ${res.nextStatus}`,
        'success',
        'Status Updated'
      );
    } else {
      showToast(res?.error || 'Could not update status', 'error', 'Action Restricted');
    }
    setStatusModalMember(null);
  };

  // Branch checkbox toggle in edit modal
  const handleToggleBranchSelection = (branchId) => {
    setEditForm(prev => {
      const exists = prev.selectedBranches.includes(branchId);
      const nextBranches = exists
        ? prev.selectedBranches.filter(id => id !== branchId)
        : [...prev.selectedBranches, branchId];
      return { ...prev, selectedBranches: nextBranches };
    });
    if (editError) setEditError('');
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredMembers.length === 0) {
      showToast('No user records to export with current filters.', 'info', 'Export Empty');
      return;
    }

    const headers = [
      'Member ID',
      'Restaurant ID',
      'Name',
      'Email',
      'Phone',
      'Role',
      'Status',
      'Branch Access',
      'Created At'
    ];

    const rows = filteredMembers.map(m => [
      `"${m.id || ''}"`,
      `"${m.restaurantId || selectedRestaurant?.id || ''}"`,
      `"${(m.name || '').replace(/"/g, '""')}"`,
      `"${(m.email || '').replace(/"/g, '""')}"`,
      `"${(m.phone || '').replace(/"/g, '""')}"`,
      `"${m.role || ''}"`,
      `"${m.status || 'Active'}"`,
      `"${getBranchAccessForCSV(m.branchAccess).replace(/"/g, '""')}"`,
      `"${m.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'restaurant-users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      `Exported ${filteredMembers.length} user records to restaurant-users.csv`,
      'success',
      'CSV Download Complete'
    );
  };

  // Render Role Badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Restaurant Owner':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Operations Lead':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Inventory Manager':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Kitchen Manager':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  // Render Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Inactive':
        return 'bg-surface-container text-secondary border-outline-variant/40';
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  // Render Avatar Initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // If selectedRestaurant is invalid or missing
  if (!selectedRestaurant) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[30px]">group_off</span>
          </div>
          <h2 className="font-display-lg text-2xl font-bold text-on-surface mb-2">
            Restaurant Not Found
          </h2>
          <p className="font-body-md text-secondary max-w-md mx-auto mb-6">
            The requested restaurant could not be resolved or was removed from platform state.
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

  const hasActiveFilters = searchTerm.trim() !== '' || roleFilter !== 'All' || statusFilter !== 'All' || branchFilter !== 'All';

  return (
    <div className="w-full flex flex-col pb-16 antialiased">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm flex-wrap">
        <button
          type="button"
          onClick={() => onNavigate('super-admin')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Platform Administration
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
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
        <span className="text-on-surface-variant font-medium">Users</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-numeric-table tracking-wide bg-surface-container text-on-surface-variant border border-outline-variant/40">
              {selectedRestaurant.id}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary">
              Team & Access
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface leading-tight">
            Restaurant Users
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-3xl mt-1">
            Manage owners, managers and operational access for <span className="font-semibold text-on-surface">{selectedRestaurant.name}</span>.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
            title="Download real CSV of restaurant users"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Users</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-restaurant-detail')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Restaurant</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-add-user')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Add User</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC SUMMARY CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-md mb-6">
        {/* Total Users */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Total Users
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-on-surface">
              {totalUsers}
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">group</span>
          </div>
        </div>

        {/* Active */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-semibold">
            Active
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-emerald-700">
              {activeCount}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold">
            Pending
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-amber-700">
              {pendingCount}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
        </div>

        {/* Inactive */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
            Inactive
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-secondary">
              {inactiveCount}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-secondary/50"></span>
          </div>
        </div>

        {/* Owners */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Owners
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-on-surface">
              {ownersCount}
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
          </div>
        </div>

        {/* Management Users */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Management
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-on-surface">
              {managementCount}
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">supervisor_account</span>
          </div>
        </div>
      </section>

      {/* SEARCH AND FILTERS BAR */}
      <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm transition-colors placeholder:text-secondary/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface p-0.5"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-xs font-medium cursor-pointer"
            >
              <option value="All">All Roles</option>
              {PROTOTYPE_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-xs font-medium cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {/* Branch Access Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-xs font-medium cursor-pointer"
            >
              <option value="All">All Branch Access</option>
              <option value="all_branches">All Branches</option>
              {restaurantBranches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('All');
                  setStatusFilter('All');
                  setBranchFilter('All');
                }}
                className="px-3 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-secondary hover:text-on-surface transition-colors cursor-pointer shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      {filteredMembers.length > 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Branch Access</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredMembers.map((member) => {
                  const branchInfo = getBranchAccessDisplay(member.branchAccess);
                  const isOwner = member.role === 'Restaurant Owner';

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-surface-container-low/40 transition-colors"
                    >
                      {/* USER COLUMN */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isOwner
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-on-surface flex items-center gap-1.5 truncate">
                              <span>{member.name}</span>
                              {isOwner && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                  Owner
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-secondary truncate">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${getRoleBadge(member.role)}`}>
                          {member.role}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(member.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            member.status === 'Active'
                              ? 'bg-emerald-600'
                              : member.status === 'Pending'
                              ? 'bg-amber-600'
                              : 'bg-secondary'
                          }`} />
                          <span>{member.status === 'Pending' ? 'Pending Setup' : member.status}</span>
                        </span>
                      </td>

                      {/* BRANCH ACCESS */}
                      <td className="py-3 px-3">
                        {branchInfo.isAll ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
                            <span className="material-symbols-outlined text-[14px]">storefront</span>
                            All Branches
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {branchInfo.branches.map(b => (
                              <span
                                key={b.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container-high text-on-surface border border-outline-variant/30"
                              >
                                {b.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* PHONE */}
                      <td className="py-3 px-3 text-xs font-numeric-table text-on-surface-variant">
                        {member.phone || '—'}
                      </td>

                      {/* CREATED */}
                      <td className="py-3 px-3 text-xs font-numeric-table text-on-surface-variant">
                        {formatDate ? formatDate(member.createdAt) : member.createdAt}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit User Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          {/* Quick Status Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(member)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                              member.status === 'Active'
                                ? 'text-secondary hover:text-error hover:bg-error-container/20 border-outline-variant/40'
                                : member.status === 'Pending'
                                ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                            title={
                              member.status === 'Active'
                                ? 'Deactivate User'
                                : member.status === 'Pending'
                                ? 'Mark User Active'
                                : 'Activate User'
                            }
                          >
                            {member.status === 'Active'
                              ? 'Deactivate'
                              : member.status === 'Pending'
                              ? 'Mark Active'
                              : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : restaurantMembers.length === 0 ? (
        /* Empty State: No users at all */
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center shadow-2xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px]">group</span>
          </div>
          <h3 className="font-display-lg text-xl font-bold text-on-surface mb-1">
            No restaurant users yet
          </h3>
          <p className="font-body-md text-secondary max-w-sm mx-auto mb-6">
            Configure the first administrator or operational manager for {selectedRestaurant.name}.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('admin-add-user')}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-all"
          >
            + Add User
          </button>
        </div>
      ) : (
        /* Empty State: Search or filter mismatch */
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-10 text-center shadow-2xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <h3 className="font-display-lg text-lg font-bold text-on-surface mb-1">
            No users found
          </h3>
          <p className="font-body-md text-secondary max-w-sm mx-auto mb-4">
            Try adjusting your search or filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('All');
              setStatusFilter('All');
              setBranchFilter('All');
            }}
            className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Edit Restaurant User
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Update role, contact details, and branch access for {editingMember.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-secondary hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} className="p-space-md space-y-4">
              {editError && (
                <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                  <span>{editError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, name: e.target.value }));
                    if (editError) setEditError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm(prev => ({ ...prev, email: e.target.value }));
                    if (editError) setEditError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+92 300 0000000"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* Role & Status Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Role <span className="text-error">*</span>
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, role: e.target.value }));
                      if (editError) setEditError('');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                  >
                    {PROTOTYPE_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Status <span className="text-error">*</span>
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, status: e.target.value }));
                      if (editError) setEditError('');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>
                        {status === 'Pending' ? 'Pending Setup' : status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch Access Section */}
              <div className="pt-2 border-t border-outline-variant/20">
                <label className="block text-xs font-semibold text-on-surface mb-2">
                  Branch Access <span className="text-error">*</span>
                </label>

                {/* Radio: All vs Specific */}
                <div className="space-y-2 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accessMode"
                      value="all"
                      checked={editForm.accessMode === 'all'}
                      onChange={() => {
                        setEditForm(prev => ({ ...prev, accessMode: 'all' }));
                        if (editError) setEditError('');
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-on-surface">All Branches</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accessMode"
                      value="specific"
                      checked={editForm.accessMode === 'specific'}
                      onChange={() => {
                        setEditForm(prev => ({ ...prev, accessMode: 'specific' }));
                        if (editError) setEditError('');
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-on-surface">Specific Branches</span>
                  </label>
                </div>

                {/* Specific Branches Checklist */}
                {editForm.accessMode === 'specific' && (
                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 space-y-2 max-h-40 overflow-y-auto">
                    {restaurantBranches.length > 0 ? (
                      restaurantBranches.map(branch => (
                        <label
                          key={branch.id}
                          className="flex items-center gap-2 text-xs font-medium text-on-surface cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editForm.selectedBranches.includes(branch.id)}
                            onChange={() => handleToggleBranchSelection(branch.id)}
                            className="rounded border-outline text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>{branch.name}</span>
                          <span className="text-secondary font-mono text-[10px]">({branch.id})</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-secondary italic">
                        No branches available for this restaurant yet.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Helper text */}
              <p className="text-[11px] text-secondary">
                Role permissions are prototype configuration until backend authorization is connected.
              </p>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-secondary hover:text-on-surface rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS CHANGE CONFIRMATION MODAL */}
      {statusModalMember && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xl p-6 antialiased animate-in fade-in zoom-in-95 duration-150">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              statusModalMember.status === 'Active'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-emerald-500/10 text-emerald-600'
            }`}>
              <span className="material-symbols-outlined text-[26px]">
                {statusModalMember.status === 'Active' ? 'pause_circle' : 'play_circle'}
              </span>
            </div>

            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
              {statusModalMember.status === 'Active'
                ? `Deactivate ${statusModalMember.name}?`
                : statusModalMember.status === 'Pending'
                ? `Mark ${statusModalMember.name} Active?`
                : `Activate ${statusModalMember.name}?`}
            </h3>

            <p className="font-body-md text-body-md text-secondary mb-3">
              {statusModalMember.status === 'Active'
                ? `This user will no longer be able to access operational modules or branch records until re-activated.`
                : statusModalMember.status === 'Pending'
                ? `Confirming this will mark the user setup as active in the platform workspace.`
                : `This user will regain active operational status for assigned branch locations.`}
            </p>

            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-secondary mb-6">
              This changes frontend prototype access state only. No authentication account is modified.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusModalMember(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container font-label-md text-xs font-semibold text-on-surface cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                className={`px-4 py-2 rounded-lg font-label-md text-xs font-semibold cursor-pointer shadow-sm transition-colors ${
                  statusModalMember.status === 'Active'
                    ? 'bg-error hover:bg-error/90 text-on-error'
                    : 'bg-primary hover:bg-primary/90 text-on-primary'
                }`}
              >
                {statusModalMember.status === 'Active'
                  ? 'Deactivate User'
                  : statusModalMember.status === 'Pending'
                  ? 'Confirm Active'
                  : 'Activate User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
