import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';

const PROTOTYPE_RESTAURANT_ROLES = [
  'Restaurant Owner',
  'Operations Lead',
  'Inventory Manager',
  'Kitchen Manager'
];

export default function AdminUsers({ onNavigate }) {
  const {
    currentUser,
    platformRestaurants,
    platformBranches,
    platformMembers,
    platformAdmins,
    createPlatformAdmin,
    updatePlatformAdmin,
    togglePlatformAdminStatus,
    updatePlatformMember,
    togglePlatformMemberStatus,
    setSelectedRestaurantId,
    formatDate,
    showToast
  } = useAppStore();

  // 1. Restaurant map for quick lookup
  const restaurantMap = useMemo(() => {
    const map = new Map();
    (platformRestaurants || []).forEach(r => map.set(r.id, r));
    return map;
  }, [platformRestaurants]);

  // 2. Branch map for resolving names
  const branchMap = useMemo(() => {
    const map = new Map();
    (platformBranches || []).forEach(b => map.set(b.id, b));
    return map;
  }, [platformBranches]);

  // 3. Combine platform admins and restaurant members
  const allUsers = useMemo(() => {
    const admins = (platformAdmins || []).map(a => ({
      ...a,
      accountType: 'platform_admin',
      restaurantId: null,
      restaurantName: 'Platform',
      branchAccess: ['all_platform']
    }));

    const members = (platformMembers || []).map(m => {
      const rest = restaurantMap.get(m.restaurantId);
      return {
        ...m,
        accountType: 'restaurant_user',
        restaurantName: rest?.name || 'Unknown Restaurant'
      };
    });

    return [...admins, ...members];
  }, [platformAdmins, platformMembers, restaurantMap]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [restaurantFilter, setRestaurantFilter] = useState('All');

  // Modals state
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({
    name: '',
    email: '',
    role: 'Super Admin',
    status: 'Active'
  });
  const [addAdminError, setAddAdminError] = useState('');

  // Edit Admin Modal
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editAdminForm, setEditAdminForm] = useState({
    name: '',
    email: '',
    status: 'Active'
  });
  const [editAdminError, setEditAdminError] = useState('');

  // Edit Restaurant User Modal
  const [editingMember, setEditingMember] = useState(null);
  const [editMemberForm, setEditMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Operations Lead',
    status: 'Active',
    accessMode: 'all',
    selectedBranches: []
  });
  const [editMemberError, setEditMemberError] = useState('');

  // Status Change Confirmation Modal
  const [statusModalUser, setStatusModalUser] = useState(null);

  // Dynamic Summary Metrics
  const totalUsersCount = allUsers.length;
  const platformAdminsCount = allUsers.filter(u => u.accountType === 'platform_admin').length;
  const restaurantOwnersCount = allUsers.filter(u => u.role === 'Restaurant Owner').length;
  const managementUsersCount = allUsers.filter(u =>
    ['Operations Lead', 'Inventory Manager', 'Kitchen Manager'].includes(u.role)
  ).length;
  const activeCount = allUsers.filter(u => u.status === 'Active').length;
  const pendingCount = allUsers.filter(u => u.status === 'Pending').length;
  const inactiveCount = allUsers.filter(u => u.status === 'Inactive').length;

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      // Account Type filter
      if (accountTypeFilter === 'Platform Admins' && user.accountType !== 'platform_admin') {
        return false;
      }
      if (accountTypeFilter === 'Restaurant Users' && user.accountType !== 'restaurant_user') {
        return false;
      }

      // Role filter
      if (roleFilter !== 'All' && user.role !== roleFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'All' && user.status !== statusFilter) {
        return false;
      }

      // Restaurant filter
      if (restaurantFilter !== 'All') {
        // Platform admins do not belong to any specific restaurant filter
        if (user.accountType === 'platform_admin') {
          return false;
        }
        if (user.restaurantId !== restaurantFilter) {
          return false;
        }
      }

      // Search query across name, email, role, restaurant name
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (user.name || '').toLowerCase().includes(query);
        const matchesEmail = (user.email || '').toLowerCase().includes(query);
        const matchesRole = (user.role || '').toLowerCase().includes(query);
        const matchesRest = (user.restaurantName || '').toLowerCase().includes(query);
        const matchesId = (user.id || '').toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesRole && !matchesRest && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [allUsers, accountTypeFilter, roleFilter, statusFilter, restaurantFilter, searchTerm]);

  // Helper: Format branch access for display
  const getBranchAccessDisplay = (user) => {
    if (user.accountType === 'platform_admin') {
      return {
        label: 'All Platform',
        isAll: true,
        branches: []
      };
    }

    const access = user.branchAccess;
    if (!access || access.includes('all') || access.length === 0) {
      return {
        label: 'All Branches',
        isAll: true,
        branches: []
      };
    }

    const names = access
      .map(id => {
        const branch = branchMap.get(id);
        return branch ? { id, name: branch.name } : null;
      })
      .filter(Boolean);

    return {
      label: names.map(b => b.name).join(', ') || 'All Branches',
      isAll: false,
      branches: names
    };
  };

  // Helper: Format branch access for CSV
  const getBranchAccessForCSV = (user) => {
    if (user.accountType === 'platform_admin') {
      return 'All Platform';
    }
    const access = user.branchAccess;
    if (!access || access.includes('all') || access.length === 0) {
      return 'All Branches';
    }
    const names = access
      .map(id => branchMap.get(id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join('; ') : 'All Branches';
  };

  // Helper: Role badge styling
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      case 'Restaurant Owner':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Operations Lead':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Inventory Manager':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Kitchen Manager':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  // Helper: Status badge styling
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

  // Helper: Initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Navigation: View Restaurant for a restaurant user
  const handleViewRestaurant = (restaurantId) => {
    if (!restaurantId) return;
    if (setSelectedRestaurantId) {
      setSelectedRestaurantId(restaurantId);
    }
    onNavigate('admin-restaurant-detail');
  };

  // Open Edit Admin Modal
  const handleOpenEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setEditAdminForm({
      name: admin.name || '',
      email: admin.email || '',
      status: admin.status || 'Active'
    });
    setEditAdminError('');
  };

  // Save Edit Admin Modal
  const handleSaveEditAdmin = (e) => {
    e.preventDefault();
    if (!editingAdmin) return;

    const trimmedName = editAdminForm.name.trim();
    const trimmedEmail = editAdminForm.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      setEditAdminError('Full Name is required.');
      return;
    }
    if (!trimmedEmail) {
      setEditAdminError('Email address is required.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setEditAdminError('Please enter a valid email address.');
      return;
    }

    const res = updatePlatformAdmin(editingAdmin.id, {
      name: trimmedName,
      email: trimmedEmail,
      status: editAdminForm.status
    });

    if (res && res.success) {
      showToast(`${trimmedName} updated successfully`, 'success', 'Admin Updated');
      setEditingAdmin(null);
    } else {
      setEditAdminError(res?.error || 'Failed to update platform admin.');
    }
  };

  // Open Edit Restaurant User Modal
  const handleOpenEditMember = (member) => {
    const isAll = !member.branchAccess || member.branchAccess.includes('all') || member.branchAccess.length === 0;
    setEditingMember(member);
    setEditMemberForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'Operations Lead',
      status: member.status || 'Active',
      accessMode: isAll ? 'all' : 'specific',
      selectedBranches: isAll ? [] : member.branchAccess.filter(id => id !== 'all')
    });
    setEditMemberError('');
  };

  // Save Edit Restaurant User Modal
  const handleSaveEditMember = (e) => {
    e.preventDefault();
    if (!editingMember) return;

    const trimmedName = editMemberForm.name.trim();
    const trimmedEmail = editMemberForm.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      setEditMemberError('Full Name is required.');
      return;
    }
    if (!trimmedEmail) {
      setEditMemberError('Email address is required.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setEditMemberError('Please enter a valid email address.');
      return;
    }

    // Duplicate email within same restaurant
    const isDuplicateEmail = (platformMembers || []).some(
      m => m.restaurantId === editingMember.restaurantId &&
           m.id !== editingMember.id &&
           (m.email || '').trim().toLowerCase() === trimmedEmail
    );
    if (isDuplicateEmail) {
      setEditMemberError('A user with this email already exists for this restaurant.');
      return;
    }

    // Branch selection validation
    let finalBranchAccess = ['all'];
    if (editMemberForm.accessMode === 'specific') {
      if (editMemberForm.selectedBranches.length === 0) {
        setEditMemberError('Please select at least one branch for specific access.');
        return;
      }
      finalBranchAccess = editMemberForm.selectedBranches;
    }

    // Last-Owner Protection check
    const isCurrentlyOwner = editingMember.role === 'Restaurant Owner';
    const isChangingFromOwner = isCurrentlyOwner && editMemberForm.role !== 'Restaurant Owner';
    const isDeactivatingOwner = isCurrentlyOwner && editMemberForm.status === 'Inactive';

    if (isChangingFromOwner || isDeactivatingOwner) {
      const remainingActiveOwners = (platformMembers || []).filter(
        m => m.restaurantId === editingMember.restaurantId &&
             m.id !== editingMember.id &&
             m.role === 'Restaurant Owner' &&
             (m.status === 'Active' || m.status === 'Pending')
      );
      if (remainingActiveOwners.length === 0) {
        setEditMemberError('At least one Restaurant Owner is required.');
        return;
      }
    }

    const res = updatePlatformMember(editingMember.id, {
      name: trimmedName,
      email: trimmedEmail,
      phone: editMemberForm.phone.trim(),
      role: editMemberForm.role,
      status: editMemberForm.status,
      branchAccess: finalBranchAccess
    });

    if (res && res.success) {
      showToast(`${trimmedName} updated successfully`, 'success', 'User Updated');
      setEditingMember(null);
    } else {
      setEditMemberError(res?.error || 'Failed to update user.');
    }
  };

  // Status Change Confirmation Modal Handlers
  const handleOpenStatusModal = (user) => {
    // If platform admin and currently active: check last active Super Admin rule
    if (user.accountType === 'platform_admin' && user.status === 'Active') {
      const activeAdmins = (platformAdmins || []).filter(a => a.status === 'Active' && a.id !== user.id);
      if (activeAdmins.length === 0) {
        showToast('At least one active Super Admin is required.', 'error', 'Action Restricted');
        return;
      }
    }

    // If restaurant user and currently active/pending owner: check last owner rule
    if (user.accountType === 'restaurant_user' && user.role === 'Restaurant Owner' && user.status !== 'Inactive') {
      const activeOwners = (platformMembers || []).filter(
        m => m.restaurantId === user.restaurantId &&
             m.role === 'Restaurant Owner' &&
             (m.status === 'Active' || m.status === 'Pending') &&
             m.id !== user.id
      );
      if (activeOwners.length === 0) {
        showToast('At least one Restaurant Owner is required.', 'error', 'Action Restricted');
        return;
      }
    }

    setStatusModalUser(user);
  };

  const handleConfirmStatusToggle = () => {
    if (!statusModalUser) return;

    if (statusModalUser.accountType === 'platform_admin') {
      const res = togglePlatformAdminStatus(statusModalUser.id);
      if (res && res.success) {
        showToast(`${statusModalUser.name} is now ${res.nextStatus}`, 'success', 'Status Updated');
      } else {
        showToast(res?.error || 'Could not update status', 'error', 'Action Restricted');
      }
    } else {
      const res = togglePlatformMemberStatus(statusModalUser.id);
      if (res && res.success) {
        showToast(`${statusModalUser.name} is now ${res.nextStatus}`, 'success', 'Status Updated');
      } else {
        showToast(res?.error || 'Could not update status', 'error', 'Action Restricted');
      }
    }

    setStatusModalUser(null);
  };

  // Add Platform Admin Submit
  const handleAddAdminSubmit = (e) => {
    e.preventDefault();
    const trimmedName = addAdminForm.name.trim();
    const trimmedEmail = addAdminForm.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      setAddAdminError('Full Name is required.');
      return;
    }
    if (!trimmedEmail) {
      setAddAdminError('Email address is required.');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setAddAdminError('Please enter a valid email address.');
      return;
    }

    const res = createPlatformAdmin({
      name: trimmedName,
      email: trimmedEmail,
      role: 'Super Admin',
      status: addAdminForm.status
    });

    if (res && res.success) {
      setIsAddAdminOpen(false);
      setAddAdminForm({
        name: '',
        email: '',
        role: 'Super Admin',
        status: 'Active'
      });
      setAddAdminError('');
    } else {
      setAddAdminError(res?.error || 'Failed to add platform administrator.');
    }
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      showToast('No user records to export with current filters.', 'info', 'Export Empty');
      return;
    }

    const headers = [
      'User ID',
      'Name',
      'Email',
      'Account Type',
      'Role',
      'Restaurant',
      'Status',
      'Branch Access',
      'Created At'
    ];

    const rows = filteredUsers.map(u => [
      `"${u.id || ''}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${u.accountType === 'platform_admin' ? 'Platform Admin' : 'Restaurant User'}"`,
      `"${u.role || ''}"`,
      `"${(u.restaurantName || '').replace(/"/g, '""')}"`,
      `"${u.status || 'Active'}"`,
      `"${getBranchAccessForCSV(u).replace(/"/g, '""')}"`,
      `"${u.createdAt || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'platform-users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      `Exported ${filteredUsers.length} user records to platform-users.csv`,
      'success',
      'CSV Download Complete'
    );
  };

  // Branches belonging to the restaurant of the currently edited restaurant user
  const branchesForEditedMember = useMemo(() => {
    if (!editingMember) return [];
    return (platformBranches || []).filter(b => b.restaurantId === editingMember.restaurantId);
  }, [editingMember, platformBranches]);

  const hasActiveFilters = searchTerm.trim() !== '' ||
    accountTypeFilter !== 'All' ||
    roleFilter !== 'All' ||
    statusFilter !== 'All' ||
    restaurantFilter !== 'All';

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
        <span className="text-on-surface-variant font-medium">Users</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-numeric-table tracking-wide bg-surface-container text-on-surface-variant border border-outline-variant/40">
              Platform Directory
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary">
              Cross-Restaurant Access
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface leading-tight">
            Platform Users
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-3xl mt-1">
            Manage platform administrators and restaurant user access across all restaurants.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
            title="Download real CSV of all platform and restaurant users"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Users</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddAdminOpen(true);
              setAddAdminError('');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Add Platform User</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC SUMMARY CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-space-md mb-6">
        {/* Total Users */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Total Users
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-on-surface">
              {totalUsersCount}
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">group</span>
          </div>
        </div>

        {/* Platform Admins */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-purple-900 font-semibold">
            Platform Admins
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-purple-800">
              {platformAdminsCount}
            </span>
            <span className="material-symbols-outlined text-purple-700 text-[20px]">security</span>
          </div>
        </div>

        {/* Restaurant Owners */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
            Owners
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display-lg text-2xl font-bold font-numeric-table text-on-surface">
              {restaurantOwnersCount}
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
              {managementUsersCount}
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">supervisor_account</span>
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
              placeholder="Search users, email or restaurant..."
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
            {/* Account Type Filter */}
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-xs font-medium cursor-pointer"
            >
              <option value="All">All Users</option>
              <option value="Platform Admins">Platform Admins</option>
              <option value="Restaurant Users">Restaurant Users</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-xs font-medium cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Restaurant Owner">Restaurant Owner</option>
              <option value="Operations Lead">Operations Lead</option>
              <option value="Inventory Manager">Inventory Manager</option>
              <option value="Kitchen Manager">Kitchen Manager</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-xs font-medium cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Restaurant Filter */}
            <select
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-xs font-medium cursor-pointer max-w-[180px]"
            >
              <option value="All">All Restaurants</option>
              {(platformRestaurants || []).map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setAccountTypeFilter('All');
                  setRoleFilter('All');
                  setStatusFilter('All');
                  setRestaurantFilter('All');
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
      {filteredUsers.length > 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-3">Account Type</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Restaurant</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Branch Access</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredUsers.map((user) => {
                  const isPlatformAdmin = user.accountType === 'platform_admin';
                  const branchInfo = getBranchAccessDisplay(user);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-surface-container-low/40 transition-colors"
                    >
                      {/* USER */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isPlatformAdmin
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : user.role === 'Restaurant Owner'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-on-surface flex items-center gap-1.5 truncate">
                              <span>{user.name}</span>
                              {isPlatformAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                                  Admin
                                </span>
                              )}
                              {!isPlatformAdmin && user.role === 'Restaurant Owner' && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                  Owner
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-secondary truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ACCOUNT TYPE */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          isPlatformAdmin
                            ? 'bg-purple-50 text-purple-900 border-purple-200'
                            : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                        }`}>
                          {isPlatformAdmin ? 'Platform Admin' : 'Restaurant User'}
                        </span>
                      </td>

                      {/* ROLE */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* RESTAURANT */}
                      <td className="py-3 px-3">
                        {isPlatformAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-900">
                            <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                            Platform
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface text-xs truncate max-w-[160px]">
                              {user.restaurantName}
                            </span>
                            {user.restaurantId && (
                              <span className="text-[10px] font-mono text-secondary">
                                {user.restaurantId}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(user.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active'
                              ? 'bg-emerald-600'
                              : user.status === 'Pending'
                              ? 'bg-amber-600'
                              : 'bg-secondary'
                          }`} />
                          <span>{user.status === 'Pending' ? 'Pending Setup' : user.status}</span>
                        </span>
                      </td>

                      {/* BRANCH ACCESS */}
                      <td className="py-3 px-3">
                        {isPlatformAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-900 border border-purple-200">
                            <span className="material-symbols-outlined text-[14px]">public</span>
                            All Platform
                          </span>
                        ) : branchInfo.isAll ? (
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

                      {/* CREATED */}
                      <td className="py-3 px-3 text-xs font-numeric-table text-on-surface-variant">
                        {formatDate ? formatDate(user.createdAt) : user.createdAt}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Restaurant (restaurant users only) */}
                          {!isPlatformAdmin && user.restaurantId && (
                            <button
                              type="button"
                              onClick={() => handleViewRestaurant(user.restaurantId)}
                              className="px-2.5 py-1 rounded text-xs font-medium text-primary hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
                              title="Navigate to restaurant detail"
                            >
                              View Restaurant
                            </button>
                          )}

                          {/* Edit User Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isPlatformAdmin) {
                                handleOpenEditAdmin(user);
                              } else {
                                handleOpenEditMember(user);
                              }
                            }}
                            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            title={isPlatformAdmin ? 'Edit Admin' : 'Edit User'}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          {/* Quick Status Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(user)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                              user.status === 'Active'
                                ? 'text-secondary hover:text-error hover:bg-error-container/20 border-outline-variant/40'
                                : user.status === 'Pending'
                                ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                            title={
                              user.status === 'Active'
                                ? 'Deactivate User'
                                : user.status === 'Pending'
                                ? 'Mark User Active'
                                : 'Activate User'
                            }
                          >
                            {user.status === 'Active'
                              ? 'Deactivate'
                              : user.status === 'Pending'
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
            Try adjusting your filters or search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setAccountTypeFilter('All');
              setRoleFilter('All');
              setStatusFilter('All');
              setRestaurantFilter('All');
            }}
            className="px-4 py-2 border border-outline-variant/60 text-secondary hover:text-on-surface rounded-lg font-label-md font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ADD PLATFORM USER MODAL */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Add Platform User
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Provision a new Super Administrator account profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAdminOpen(false)}
                className="text-secondary hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddAdminSubmit} className="p-space-md space-y-4">
              {addAdminError && (
                <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                  <span>{addAdminError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={addAdminForm.name}
                  onChange={(e) => {
                    setAddAdminForm(prev => ({ ...prev, name: e.target.value }));
                    if (addAdminError) setAddAdminError('');
                  }}
                  placeholder="e.g. Platform Administrator"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={addAdminForm.email}
                  onChange={(e) => {
                    setAddAdminForm(prev => ({ ...prev, email: e.target.value }));
                    if (addAdminError) setAddAdminError('');
                  }}
                  placeholder="e.g. admin@platform.test"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* Role (Fixed to Super Admin) */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Role
                </label>
                <div className="px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm font-semibold flex items-center justify-between">
                  <span>Super Admin</span>
                  <span className="text-xs text-purple-800 font-normal">Platform Level</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Status
                </label>
                <select
                  value={addAdminForm.status}
                  onChange={(e) => setAddAdminForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-secondary">
                Platform admin access is prototype state until backend authorization is connected. No authentication account or email is generated.
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-secondary hover:text-on-surface rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Add Platform User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLATFORM ADMIN MODAL */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Edit Platform Admin
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Update administrator profile for {editingAdmin.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="text-secondary hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEditAdmin} className="p-space-md space-y-4">
              {editAdminError && (
                <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                  <span>{editAdminError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editAdminForm.name}
                  onChange={(e) => {
                    setEditAdminForm(prev => ({ ...prev, name: e.target.value }));
                    if (editAdminError) setEditAdminError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={editAdminForm.email}
                  onChange={(e) => {
                    setEditAdminForm(prev => ({ ...prev, email: e.target.value }));
                    if (editAdminError) setEditAdminError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* Role (Fixed) */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Role
                </label>
                <div className="px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm font-semibold flex items-center justify-between">
                  <span>Super Admin</span>
                  <span className="text-xs text-purple-800 font-normal">Fixed</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Status <span className="text-error">*</span>
                </label>
                <select
                  value={editAdminForm.status}
                  onChange={(e) => {
                    setEditAdminForm(prev => ({ ...prev, status: e.target.value }));
                    if (editAdminError) setEditAdminError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-secondary">
                Platform admin access is prototype state until backend authorization is connected.
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
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

      {/* EDIT RESTAURANT USER MODAL */}
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
                  Update role, contact details, and branch access for {editingMember.name} ({editingMember.restaurantName}).
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
            <form onSubmit={handleSaveEditMember} className="p-space-md space-y-4">
              {editMemberError && (
                <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                  <span>{editMemberError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editMemberForm.name}
                  onChange={(e) => {
                    setEditMemberForm(prev => ({ ...prev, name: e.target.value }));
                    if (editMemberError) setEditMemberError('');
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
                  value={editMemberForm.email}
                  onChange={(e) => {
                    setEditMemberForm(prev => ({ ...prev, email: e.target.value }));
                    if (editMemberError) setEditMemberError('');
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
                  value={editMemberForm.phone}
                  onChange={(e) => setEditMemberForm(prev => ({ ...prev, phone: e.target.value }))}
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
                    value={editMemberForm.role}
                    onChange={(e) => {
                      setEditMemberForm(prev => ({ ...prev, role: e.target.value }));
                      if (editMemberError) setEditMemberError('');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                  >
                    {PROTOTYPE_RESTAURANT_ROLES.map(role => (
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
                    value={editMemberForm.status}
                    onChange={(e) => {
                      setEditMemberForm(prev => ({ ...prev, status: e.target.value }));
                      if (editMemberError) setEditMemberError('');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Setup</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Branch Access Section */}
              <div className="pt-2 border-t border-outline-variant/20">
                <label className="block text-xs font-semibold text-on-surface mb-2">
                  Branch Access ({editingMember.restaurantName}) <span className="text-error">*</span>
                </label>

                {/* Radio: All vs Specific */}
                <div className="space-y-2 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="memberAccessMode"
                      value="all"
                      checked={editMemberForm.accessMode === 'all'}
                      onChange={() => {
                        setEditMemberForm(prev => ({ ...prev, accessMode: 'all' }));
                        if (editMemberError) setEditMemberError('');
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-on-surface">All Branches</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="memberAccessMode"
                      value="specific"
                      checked={editMemberForm.accessMode === 'specific'}
                      onChange={() => {
                        setEditMemberForm(prev => ({ ...prev, accessMode: 'specific' }));
                        if (editMemberError) setEditMemberError('');
                      }}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-on-surface">Specific Branches</span>
                  </label>
                </div>

                {/* Specific Branches Checklist */}
                {editMemberForm.accessMode === 'specific' && (
                  <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 space-y-2 max-h-40 overflow-y-auto">
                    {branchesForEditedMember.length > 0 ? (
                      branchesForEditedMember.map(branch => {
                        const isChecked = editMemberForm.selectedBranches.includes(branch.id);
                        return (
                          <label
                            key={branch.id}
                            className="flex items-center gap-2 text-xs font-medium text-on-surface cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setEditMemberForm(prev => {
                                  const exists = prev.selectedBranches.includes(branch.id);
                                  const nextBranches = exists
                                    ? prev.selectedBranches.filter(id => id !== branch.id)
                                    : [...prev.selectedBranches, branch.id];
                                  return { ...prev, selectedBranches: nextBranches };
                                });
                                if (editMemberError) setEditMemberError('');
                              }}
                              className="rounded border-outline text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <span>{branch.name}</span>
                            <span className="text-secondary font-mono text-[10px]">({branch.id})</span>
                          </label>
                        );
                      })
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
      {statusModalUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xl p-6 antialiased animate-in fade-in zoom-in-95 duration-150">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              statusModalUser.status === 'Active'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-emerald-500/10 text-emerald-600'
            }`}>
              <span className="material-symbols-outlined text-[26px]">
                {statusModalUser.status === 'Active' ? 'pause_circle' : 'play_circle'}
              </span>
            </div>

            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
              {statusModalUser.status === 'Active'
                ? `Deactivate ${statusModalUser.name}?`
                : statusModalUser.status === 'Pending'
                ? `Mark ${statusModalUser.name} Active?`
                : `Activate ${statusModalUser.name}?`}
            </h3>

            <p className="font-body-md text-body-md text-secondary mb-3">
              {statusModalUser.status === 'Active'
                ? `This user will no longer be able to access the platform or operational modules until re-activated.`
                : statusModalUser.status === 'Pending'
                ? `Confirming this will mark the user setup as active in the platform workspace.`
                : `This user will regain active operational status for assigned modules.`}
            </p>

            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs text-secondary mb-6">
              This changes frontend prototype access state only. No authentication account is modified.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container font-label-md text-xs font-semibold text-on-surface cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                className={`px-4 py-2 rounded-lg font-label-md text-xs font-semibold cursor-pointer shadow-sm transition-colors ${
                  statusModalUser.status === 'Active'
                    ? 'bg-error hover:bg-error/90 text-on-error'
                    : 'bg-primary hover:bg-primary/90 text-on-primary'
                }`}
              >
                {statusModalUser.status === 'Active'
                  ? 'Deactivate User'
                  : statusModalUser.status === 'Pending'
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
