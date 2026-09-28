import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/AppStore';

const STORAGE_TYPES = [
  'General Store',
  'Cold Storage',
  'Dry Storage',
  'Kitchen / Prep',
  'Other'
];

export default function AdminBranchDetail({ onNavigate }) {
  const {
    platformRestaurants,
    platformBranches,
    platformStorageLocations,
    platformStaff,
    platformMembers,
    platformActivity,
    selectedRestaurantId,
    selectedBranchId,
    updatePlatformBranch,
    togglePlatformBranchStatus,
    createPlatformStorageLocation,
    updatePlatformStorageLocation,
    togglePlatformStorageLocationStatus,
    formatDate,
    showToast
  } = useAppStore();

  // 1. Resolve selected restaurant
  const selectedRestaurant = useMemo(() => {
    if (!platformRestaurants || platformRestaurants.length === 0) return null;
    return platformRestaurants.find(r => r.id === selectedRestaurantId) || null;
  }, [platformRestaurants, selectedRestaurantId]);

  // 2. Resolve selected branch strictly for this restaurant (tenant safety)
  const branch = useMemo(() => {
    if (!platformBranches || platformBranches.length === 0) return null;
    return platformBranches.find(
      b => b.id === selectedBranchId && b.restaurantId === selectedRestaurantId
    ) || null;
  }, [platformBranches, selectedBranchId, selectedRestaurantId]);

  // Active branches count for last active branch protection
  const activeBranchesCount = useMemo(() => {
    if (!selectedRestaurant) return 0;
    return (platformBranches || []).filter(
      b => b.restaurantId === selectedRestaurant.id && b.status === 'Active'
    ).length;
  }, [platformBranches, selectedRestaurant]);

  // 3. Storage locations strictly for this branch and restaurant
  const branchStorageLocations = useMemo(() => {
    if (!selectedRestaurant || !branch) return [];
    return (platformStorageLocations || []).filter(
      l => l.restaurantId === selectedRestaurant.id && l.branchId === branch.id
    );
  }, [platformStorageLocations, selectedRestaurant, branch]);

  // Active storage locations count for this branch
  const activeStorageLocationsCount = useMemo(() => {
    return branchStorageLocations.filter(l => l.status === 'Active').length;
  }, [branchStorageLocations]);

  // 4. Staff strictly for this branch and restaurant
  const branchStaff = useMemo(() => {
    if (!selectedRestaurant || !branch) return [];
    return (platformStaff || []).filter(
      s => s.restaurantId === selectedRestaurant.id && s.branchId === branch.id
    );
  }, [platformStaff, selectedRestaurant, branch]);

  // 5. User access summary for this branch
  const branchUsersSummary = useMemo(() => {
    if (!selectedRestaurant || !branch) {
      return { total: 0, allBranchUsers: 0, branchSpecificUsers: 0 };
    }
    const restaurantUsers = (platformMembers || []).filter(
      m => m.restaurantId === selectedRestaurant.id
    );

    let allBranchUsers = 0;
    let branchSpecificUsers = 0;

    restaurantUsers.forEach(u => {
      const access = u.branchAccess || [];
      if (access.includes('all') || access.length === 0) {
        allBranchUsers++;
      } else if (access.includes(branch.id)) {
        branchSpecificUsers++;
      }
    });

    return {
      total: allBranchUsers + branchSpecificUsers,
      allBranchUsers,
      branchSpecificUsers
    };
  }, [platformMembers, selectedRestaurant, branch]);

  // 6. Recent Platform Activity for this branch
  const recentBranchActivity = useMemo(() => {
    if (!branch || !selectedRestaurant) return [];
    const bId = branch.id.toLowerCase();
    const bName = branch.name.toLowerCase();
    const rId = selectedRestaurant.id.toLowerCase();

    return (platformActivity || []).filter(act => {
      const t = (act.title || '').toLowerCase();
      const d = (act.details || '').toLowerCase();
      return (
        t.includes(bId) ||
        t.includes(bName) ||
        d.includes(bId) ||
        d.includes(bName) ||
        (t.includes(rId) && d.includes('branch'))
      );
    }).slice(0, 5);
  }, [platformActivity, branch, selectedRestaurant]);

  // Modals state
  // Edit Branch Modal
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false);
  const [editBranchForm, setEditBranchForm] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: ''
  });
  const [editBranchError, setEditBranchError] = useState('');

  // Branch Status Modal
  const [isBranchStatusModalOpen, setIsBranchStatusModalOpen] = useState(false);

  // Storage Location Modals
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [addLocationForm, setAddLocationForm] = useState({
    name: '',
    type: 'General Store',
    status: 'Active'
  });
  const [addLocationError, setAddLocationError] = useState('');

  const [editingLocation, setEditingLocation] = useState(null);
  const [editLocationForm, setEditLocationForm] = useState({
    name: '',
    type: 'General Store',
    status: 'Active'
  });
  const [editLocationError, setEditLocationError] = useState('');

  const [locationStatusModalTarget, setLocationStatusModalTarget] = useState(null);

  // Helper: Status badge
  const getStatusBadge = (status) => {
    return status === 'Active'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : 'bg-surface-container text-secondary border-outline-variant/40';
  };

  const getSetupBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
    }
  };

  // Branch Edit Handlers
  const handleOpenEditBranch = () => {
    if (!branch) return;
    setEditBranchForm({
      name: branch.name || '',
      code: branch.code || '',
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
      city: branch.city || '',
      country: branch.country || selectedRestaurant?.country || 'Pakistan'
    });
    setEditBranchError('');
    setIsEditBranchOpen(true);
  };

  const handleSaveEditBranch = (e) => {
    e.preventDefault();
    if (!branch) return;

    const trimmedName = editBranchForm.name.trim();
    if (!trimmedName) {
      setEditBranchError('Branch Name is required.');
      return;
    }

    if (editBranchForm.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editBranchForm.email.trim())) {
        setEditBranchError('Please enter a valid email address.');
        return;
      }
    }

    // Duplicate branch name check within the same restaurant
    const isDuplicate = (platformBranches || []).some(
      b => b.restaurantId === selectedRestaurant.id &&
           b.id !== branch.id &&
           (b.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setEditBranchError('A branch with this name already exists for this restaurant.');
      return;
    }

    updatePlatformBranch(branch.id, {
      name: trimmedName,
      code: editBranchForm.code.trim().toUpperCase(),
      phone: editBranchForm.phone.trim(),
      email: editBranchForm.email.trim(),
      address: editBranchForm.address.trim(),
      city: editBranchForm.city.trim(),
      country: editBranchForm.country.trim()
    });

    showToast(`${trimmedName} updated successfully`, 'success', 'Branch Updated');
    setIsEditBranchOpen(false);
  };

  // Branch Status Handlers
  const handleOpenBranchStatusModal = () => {
    if (!branch) return;
    if (branch.status === 'Active' && activeBranchesCount <= 1) {
      showToast('At least one active branch is required.', 'error', 'Action Restricted');
      return;
    }
    setIsBranchStatusModalOpen(true);
  };

  const handleConfirmBranchStatusToggle = () => {
    if (!branch) return;
    const res = togglePlatformBranchStatus(branch.id);
    if (!res || !res.success) {
      showToast(res?.error || 'Could not update branch status', 'error', 'Action Restricted');
    }
    setIsBranchStatusModalOpen(false);
  };

  // Add Location Handlers
  const handleSaveAddLocation = (e) => {
    e.preventDefault();
    if (!branch || !selectedRestaurant) return;

    const trimmedName = addLocationForm.name.trim();
    if (!trimmedName) {
      setAddLocationError('Location Name is required.');
      return;
    }

    const res = createPlatformStorageLocation({
      restaurantId: selectedRestaurant.id,
      branchId: branch.id,
      name: trimmedName,
      type: addLocationForm.type,
      status: addLocationForm.status
    });

    if (res && res.success) {
      setIsAddLocationOpen(false);
      setAddLocationForm({
        name: '',
        type: 'General Store',
        status: 'Active'
      });
      setAddLocationError('');
    } else {
      setAddLocationError(res?.error || 'Failed to create storage location.');
    }
  };

  // Edit Location Handlers
  const handleOpenEditLocation = (loc) => {
    setEditingLocation(loc);
    setEditLocationForm({
      name: loc.name || '',
      type: loc.type || 'General Store',
      status: loc.status || 'Active'
    });
    setEditLocationError('');
  };

  const handleSaveEditLocation = (e) => {
    e.preventDefault();
    if (!editingLocation) return;

    const trimmedName = editLocationForm.name.trim();
    if (!trimmedName) {
      setEditLocationError('Location Name is required.');
      return;
    }

    const res = updatePlatformStorageLocation(editingLocation.id, {
      name: trimmedName,
      type: editLocationForm.type,
      status: editLocationForm.status
    });

    if (res && res.success) {
      showToast(`Storage location "${trimmedName}" updated`, 'success', 'Location Updated');
      setEditingLocation(null);
    } else {
      setEditLocationError(res?.error || 'Failed to update storage location.');
    }
  };

  // Location Status Toggle Handlers
  const handleOpenLocationStatusModal = (loc) => {
    if (loc.status === 'Active' && activeStorageLocationsCount <= 1) {
      showToast('At least one active storage location is required.', 'error', 'Action Restricted');
      return;
    }
    setLocationStatusModalTarget(loc);
  };

  const handleConfirmLocationStatusToggle = () => {
    if (!locationStatusModalTarget) return;
    const res = togglePlatformStorageLocationStatus(locationStatusModalTarget.id);
    if (res && res.success) {
      showToast(
        `Storage location "${locationStatusModalTarget.name}" is now ${res.nextStatus}`,
        'success',
        'Status Updated'
      );
    } else {
      showToast(res?.error || 'Could not update status', 'error', 'Action Restricted');
    }
    setLocationStatusModalTarget(null);
  };

  // Fallback: Branch not found or tenant mismatch
  if (!selectedRestaurant || !branch) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <div className="p-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[30px]">store_mall_directory</span>
          </div>
          <h2 className="font-display-lg text-2xl font-bold text-on-surface mb-2">
            Branch Not Found
          </h2>
          <p className="font-body-md text-secondary max-w-md mx-auto mb-6">
            The requested branch could not be resolved, does not belong to the selected restaurant organization, or was removed from platform state.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('admin-branches')}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-colors"
            >
              Back to Branches
            </button>
            <button
              type="button"
              onClick={() => onNavigate('admin-restaurant-detail')}
              className="px-5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              Back to Restaurant
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <button
          type="button"
          onClick={() => onNavigate('admin-branches')}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Branches
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant font-medium">{branch.name}</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-6">
        <div>
          {/* Metadata Badges Row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-numeric-table tracking-wide bg-surface-container text-on-surface-variant border border-outline-variant/40">
              {branch.id}
            </span>
            {branch.code && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold font-numeric-table tracking-wide bg-surface-container-high text-on-surface border border-outline-variant/40">
                {branch.code}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(branch.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${branch.status === 'Active' ? 'bg-emerald-600' : 'bg-secondary'}`} />
              <span>{branch.status}</span>
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSetupBadge(branch.setupStatus || 'Completed')}`}>
              {branch.setupStatus === 'Completed' ? 'Setup Complete' : branch.setupStatus || 'Completed'}
            </span>
            <span className="text-xs text-secondary font-numeric-table">
              Created {formatDate ? formatDate(branch.createdAt) : branch.createdAt}
            </span>
          </div>

          <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-surface leading-tight">
            {branch.name}
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl mt-1">
            Branch account, storage locations and setup overview for <span className="font-semibold text-on-surface">{selectedRestaurant.name}</span>.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('admin-branches')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Branches</span>
          </button>

          <button
            type="button"
            onClick={handleOpenEditBranch}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-lg font-label-md font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Edit Branch</span>
          </button>

          <button
            type="button"
            onClick={handleOpenBranchStatusModal}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-label-md font-semibold cursor-pointer shadow-sm transition-all ${
              branch.status === 'Active'
                ? 'bg-surface-container hover:bg-error-container/20 text-error border border-outline-variant/40'
                : 'bg-primary hover:bg-primary/90 text-on-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {branch.status === 'Active' ? 'pause_circle' : 'play_circle'}
            </span>
            <span>{branch.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}</span>
          </button>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: MAIN (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: BRANCH INFORMATION */}
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">store</span>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Branch Information
                </h2>
              </div>
              <button
                type="button"
                onClick={handleOpenEditBranch}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-secondary block mb-1">
                  Branch Name
                </span>
                <span className="font-semibold text-on-surface">{branch.name}</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-secondary block mb-1">
                  Branch Code
                </span>
                <span className="font-semibold font-mono text-on-surface">{branch.code || '—'}</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-secondary block mb-1">
                  Phone
                </span>
                <span className="font-numeric-table text-on-surface">{branch.phone || '—'}</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-secondary block mb-1">
                  Email
                </span>
                <span className="text-on-surface truncate">{branch.email || '—'}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-secondary block mb-1">
                  Address
                </span>
                <span className="text-on-surface">{branch.address || '—'}</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-secondary block mb-1">
                  City
                </span>
                <span className="text-on-surface">{branch.city || '—'}</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-secondary block mb-1">
                  Country
                </span>
                <span className="text-on-surface">{branch.country || selectedRestaurant.country || 'Pakistan'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: STORAGE LOCATIONS */}
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Storage Locations
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold font-numeric-table bg-surface-container text-on-surface-variant">
                  {branchStorageLocations.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddLocationForm({
                    name: '',
                    type: 'General Store',
                    status: 'Active'
                  });
                  setAddLocationError('');
                  setIsAddLocationOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>+ Add Location</span>
              </button>
            </div>

            {branchStorageLocations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-xs font-label-md text-on-surface-variant uppercase tracking-wider">
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15">
                    {branchStorageLocations.map(loc => (
                      <tr key={loc.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-on-surface flex items-center gap-2">
                            <span>{loc.name}</span>
                            <span className="text-[10px] font-mono text-secondary">({loc.id})</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/30">
                            {loc.type}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(loc.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${loc.status === 'Active' ? 'bg-emerald-600' : 'bg-secondary'}`} />
                            <span>{loc.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditLocation(loc)}
                              className="p-1 rounded text-secondary hover:text-primary hover:bg-surface-container cursor-pointer"
                              title="Edit Storage Location"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenLocationStatusModal(loc)}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer border ${
                                loc.status === 'Active'
                                  ? 'text-secondary hover:text-error border-outline-variant/40'
                                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              }`}
                            >
                              {loc.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-secondary bg-surface-container-low rounded-lg border border-dashed border-outline-variant/50">
                <span className="material-symbols-outlined text-[32px] text-secondary/40 block mb-1">inventory_2</span>
                No storage locations defined for this branch yet.
              </div>
            )}
          </div>

          {/* SECTION 6: STAFF SUMMARY */}
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Branch Staff
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('admin-restaurant-detail')}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                View Restaurant Staff
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold block">
                  Total Staff
                </span>
                <span className="text-xl font-bold font-numeric-table text-on-surface">
                  {branchStaff.length}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <span className="text-[11px] uppercase tracking-wider text-emerald-800 font-semibold block">
                  Active
                </span>
                <span className="text-xl font-bold font-numeric-table text-emerald-700">
                  {branchStaff.filter(s => s.status === 'Active').length}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold block">
                  Kitchen
                </span>
                <span className="text-xl font-bold font-numeric-table text-on-surface">
                  {branchStaff.filter(s => (s.department || '').toLowerCase().includes('kitchen') || (s.role || '').toLowerCase().includes('chef')).length}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold block">
                  Operations
                </span>
                <span className="text-xl font-bold font-numeric-table text-on-surface">
                  {branchStaff.filter(s => (s.department || '').toLowerCase().includes('operations') || (s.department || '').toLowerCase().includes('inventory')).length}
                </span>
              </div>
            </div>

            {branchStaff.length > 0 ? (
              <div className="divide-y divide-outline-variant/20">
                {branchStaff.map(st => (
                  <div key={st.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-on-surface">{st.name}</span>
                      <span className="text-secondary ml-2 font-mono text-[10px]">({st.id})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                        {st.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold border ${getStatusBadge(st.status)}`}>
                        {st.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary italic">
                No staff members currently assigned to this branch location.
              </p>
            )}
          </div>

          {/* SECTION 7: USER ACCESS SUMMARY */}
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">group</span>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Branch User Access
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('admin-restaurant-users')}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                Manage Restaurant Users
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold block">
                  Users With Access
                </span>
                <span className="text-xl font-bold font-numeric-table text-on-surface">
                  {branchUsersSummary.total}
                </span>
                <span className="text-[11px] text-secondary block mt-0.5">
                  Eligible for branch operations
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold block">
                  All-Branch Users
                </span>
                <span className="text-xl font-bold font-numeric-table text-on-surface">
                  {branchUsersSummary.allBranchUsers}
                </span>
                <span className="text-[11px] text-secondary block mt-0.5">
                  Owners & platform leads
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold block">
                  Branch-Specific Users
                </span>
                <span className="text-xl font-bold font-numeric-table text-on-surface">
                  {branchUsersSummary.branchSpecificUsers}
                </span>
                <span className="text-[11px] text-secondary block mt-0.5">
                  Scoped strictly to this location
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR DETAILS (1 Col) */}
        <div className="space-y-6">
          {/* SECTION 2: RESTAURANT INFORMATION */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
                <h3 className="font-bold text-sm text-on-surface">Parent Restaurant</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('admin-restaurant-detail')}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                View Restaurant
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Restaurant Name</span>
                <span className="font-semibold text-on-surface">{selectedRestaurant.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Restaurant ID</span>
                <span className="font-mono font-semibold text-on-surface">{selectedRestaurant.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(selectedRestaurant.status)}`}>
                  {selectedRestaurant.status}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: BRANCH STATUS */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">toggle_on</span>
                <h3 className="font-bold text-sm text-on-surface">Branch Status</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Operational Status</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(branch.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${branch.status === 'Active' ? 'bg-emerald-600' : 'bg-secondary'}`} />
                  <span>{branch.status}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Setup Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded font-semibold border ${getSetupBadge(branch.setupStatus || 'Completed')}`}>
                  {branch.setupStatus === 'Completed' ? 'Setup Complete' : branch.setupStatus || 'Completed'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenBranchStatusModal}
              className={`w-full py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                branch.status === 'Active'
                  ? 'text-error hover:bg-error-container/20 border-outline-variant/40'
                  : 'bg-primary hover:bg-primary/90 text-on-primary'
              }`}
            >
              {branch.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
            </button>
          </div>

          {/* SECTION 3: REGIONAL SETTINGS */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">public</span>
                <h3 className="font-bold text-sm text-on-surface">Regional Settings</h3>
              </div>
              <span className="text-[10px] text-secondary font-medium">
                Inherited
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low text-[11px] text-secondary mb-3">
              Inherited from Restaurant ({selectedRestaurant.name}). Overrides are not supported in prototype mode.
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Currency</span>
                <span className="font-semibold text-on-surface">{selectedRestaurant.currency || 'PKR (Rs)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Timezone</span>
                <span className="font-semibold text-on-surface">{selectedRestaurant.timezone || 'Asia/Karachi'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary font-medium">Date Format</span>
                <span className="font-semibold text-on-surface">{selectedRestaurant.dateFormat || 'DD/MM/YYYY'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 8: SETUP OVERVIEW */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">checklist</span>
                <h3 className="font-bold text-sm text-on-surface">Setup Overview</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSetupBadge(branch.setupStatus || 'Completed')}`}>
                {branch.setupStatus === 'Completed' ? 'Setup Complete' : 'Setup In Progress'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                  Branch Information
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">Completed</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-on-surface font-medium flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[16px] ${
                    activeStorageLocationsCount > 0 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {activeStorageLocationsCount > 0 ? 'check_circle' : 'pending'}
                  </span>
                  Storage Locations
                </span>
                <span className={`text-[11px] font-semibold ${
                  activeStorageLocationsCount > 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {activeStorageLocationsCount > 0 ? `${activeStorageLocationsCount} Active` : 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-on-surface font-medium flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[16px] ${
                    branchStaff.length > 0 ? 'text-emerald-600' : 'text-secondary'
                  }`}>
                    {branchStaff.length > 0 ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  Branch Staff
                </span>
                <span className="text-[11px] font-semibold text-secondary">
                  {branchStaff.length > 0 ? `${branchStaff.length} Assigned` : 'Optional'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-on-surface font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                  User Access
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {branchUsersSummary.total} Users
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <span className="text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                  Ready for Operations
                </span>
                <span className="text-[11px] font-bold text-primary">
                  {branch.setupStatus === 'Completed' ? 'Yes' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 9: RECENT PLATFORM ACTIVITY */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                <h3 className="font-bold text-sm text-on-surface">Recent Activity</h3>
              </div>
              <span className="text-[10px] text-secondary font-medium">Prototype activity</span>
            </div>

            {recentBranchActivity.length > 0 ? (
              <div className="space-y-3">
                {recentBranchActivity.map(act => (
                  <div key={act.id} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface truncate">{act.title}</span>
                      <span className="text-[10px] text-secondary font-numeric-table shrink-0 ml-1">
                        {act.displayDate || act.date}
                      </span>
                    </div>
                    {act.details && (
                      <p className="text-[11px] text-secondary mt-0.5 line-clamp-2">
                        {act.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary italic">
                No recent activity recorded for this branch.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* EDIT BRANCH MODAL */}
      {isEditBranchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Edit Branch
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Update location and contact details for {branch.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditBranchOpen(false)}
                className="text-secondary hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditBranch} className="p-space-md space-y-4">
              {editBranchError && (
                <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                  <span>{editBranchError}</span>
                </div>
              )}

              {/* Branch Name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Branch Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editBranchForm.name}
                  onChange={(e) => {
                    setEditBranchForm(prev => ({ ...prev, name: e.target.value }));
                    if (editBranchError) setEditBranchError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* Branch Code & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={editBranchForm.code}
                    onChange={(e) => setEditBranchForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g. BR-MAIN"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editBranchForm.phone}
                    onChange={(e) => setEditBranchForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+92 42 35871234"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editBranchForm.email}
                  onChange={(e) => setEditBranchForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="branch@restaurant.test"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editBranchForm.address}
                  onChange={(e) => setEditBranchForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street / Block address"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editBranchForm.city}
                    onChange={(e) => setEditBranchForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Lahore"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={editBranchForm.country}
                    onChange={(e) => setEditBranchForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                  />
                </div>
              </div>

              {/* Readonly Metadata note */}
              <div className="p-2.5 rounded-lg bg-surface-container-low text-[11px] text-secondary">
                Branch ID ({branch.id}) and Restaurant ID ({selectedRestaurant.id}) are immutable relational identifiers.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsEditBranchOpen(false)}
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

      {/* BRANCH STATUS CONFIRMATION MODAL */}
      {isBranchStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xl p-6 antialiased animate-in fade-in zoom-in-95 duration-150">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              branch.status === 'Active'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-emerald-500/10 text-emerald-600'
            }`}>
              <span className="material-symbols-outlined text-[26px]">
                {branch.status === 'Active' ? 'pause_circle' : 'play_circle'}
              </span>
            </div>

            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
              {branch.status === 'Active' ? `Deactivate ${branch.name}?` : `Activate ${branch.name}?`}
            </h3>

            <p className="font-body-md text-body-md text-secondary mb-6">
              {branch.status === 'Active'
                ? 'This branch location will be marked inactive. Users assigned to this branch specifically will have restricted access.'
                : 'This branch location will be restored to active operational status.'}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBranchStatusModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container font-label-md text-xs font-semibold text-on-surface cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBranchStatusToggle}
                className={`px-4 py-2 rounded-lg font-label-md text-xs font-semibold cursor-pointer shadow-sm transition-colors ${
                  branch.status === 'Active'
                    ? 'bg-error hover:bg-error/90 text-on-error'
                    : 'bg-primary hover:bg-primary/90 text-on-primary'
                }`}
              >
                {branch.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STORAGE LOCATION MODAL */}
      {isAddLocationOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Add Storage Location
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Define an inventory storage location for {branch.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddLocationOpen(false)}
                className="text-secondary hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddLocation} className="p-space-md space-y-4">
              {addLocationError && (
                <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                  <span>{addLocationError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Location Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={addLocationForm.name}
                  onChange={(e) => {
                    setAddLocationForm(prev => ({ ...prev, name: e.target.value }));
                    if (addLocationError) setAddLocationError('');
                  }}
                  placeholder="e.g. Walk-in Cooler"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Storage Type <span className="text-error">*</span>
                </label>
                <select
                  value={addLocationForm.type}
                  onChange={(e) => setAddLocationForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                >
                  {STORAGE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Status
                </label>
                <select
                  value={addLocationForm.status}
                  onChange={(e) => setAddLocationForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAddLocationOpen(false)}
                  className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container text-xs font-semibold text-secondary hover:text-on-surface rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STORAGE LOCATION MODAL */}
      {editingLocation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Edit Storage Location
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Update location details for {editingLocation.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingLocation(null)}
                className="text-secondary hover:text-on-surface p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditLocation} className="p-space-md space-y-4">
              {editLocationError && (
                <div className="p-3 rounded-lg bg-error-container/40 border border-error/20 flex items-center gap-2 text-on-error-container text-xs font-medium">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                  <span>{editLocationError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Location Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editLocationForm.name}
                  onChange={(e) => {
                    setEditLocationForm(prev => ({ ...prev, name: e.target.value }));
                    if (editLocationError) setEditLocationError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Storage Type <span className="text-error">*</span>
                </label>
                <select
                  value={editLocationForm.type}
                  onChange={(e) => setEditLocationForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                >
                  {STORAGE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Status
                </label>
                <select
                  value={editLocationForm.status}
                  onChange={(e) => setEditLocationForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest text-on-surface text-sm cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setEditingLocation(null)}
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

      {/* STORAGE LOCATION STATUS CONFIRMATION MODAL */}
      {locationStatusModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xl p-6 antialiased animate-in fade-in zoom-in-95 duration-150">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              locationStatusModalTarget.status === 'Active'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-emerald-500/10 text-emerald-600'
            }`}>
              <span className="material-symbols-outlined text-[26px]">
                {locationStatusModalTarget.status === 'Active' ? 'pause_circle' : 'play_circle'}
              </span>
            </div>

            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
              {locationStatusModalTarget.status === 'Active'
                ? `Deactivate ${locationStatusModalTarget.name}?`
                : `Activate ${locationStatusModalTarget.name}?`}
            </h3>

            <p className="font-body-md text-body-md text-secondary mb-6">
              {locationStatusModalTarget.status === 'Active'
                ? 'This storage area will be marked inactive. Items assigned here will not be available for new inventory placements.'
                : 'This storage area will be restored to active status.'}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setLocationStatusModalTarget(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant/60 hover:bg-surface-container font-label-md text-xs font-semibold text-on-surface cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLocationStatusToggle}
                className={`px-4 py-2 rounded-lg font-label-md text-xs font-semibold cursor-pointer shadow-sm transition-colors ${
                  locationStatusModalTarget.status === 'Active'
                    ? 'bg-error hover:bg-error/90 text-on-error'
                    : 'bg-primary hover:bg-primary/90 text-on-primary'
                }`}
              >
                {locationStatusModalTarget.status === 'Active' ? 'Deactivate Location' : 'Activate Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
