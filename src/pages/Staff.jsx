import React, { useState } from 'react';
import { useAppStore } from '../store/AppStore';
import Modal from '../components/Modal';

export default function Staff({ onNavigate }) {
  const { currentBranch, staff, addStaff, updateStaffMember, showToast, formatDate } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Add modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Inventory Assistant',
    department: 'Storage & Receiving',
    email: '',
    phone: '+92 300 0000000',
    accessLevel: 'Count & Transfer'
  });

  // Edit modal state
  const [editingMember, setEditingMember] = useState(null);

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    addStaff(newMember);
    setIsAddOpen(false);
    setNewMember({
      name: '',
      role: 'Inventory Assistant',
      department: 'Storage & Receiving',
      email: '',
      phone: '+92 300 0000000',
      accessLevel: 'Count & Transfer'
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingMember) return;

    updateStaffMember(editingMember.id, {
      role: editingMember.role,
      department: editingMember.department,
      accessLevel: editingMember.accessLevel,
      phone: editingMember.phone,
      email: editingMember.email
    });
    setEditingMember(null);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant mb-space-sm">
        <span onClick={() => onNavigate('dashboard')} className="hover:text-on-surface transition-colors cursor-pointer">Management</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Staff & Permissions</span>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg font-semibold tracking-tight text-on-surface leading-tight mb-1">
            Staff Directory
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Manage inventory access roles, staff leads, and kitchen authorizations for {currentBranch}.
          </p>
        </div>
        <div className="flex items-center gap-space-sm shrink-0">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-space-xs px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg shadow-sm transition-all font-label-md font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Staff</span>
          <span className="font-headline-xl font-bold text-on-surface mt-1 font-numeric-table">{staff.length}</span>
          <span className="text-xs text-on-surface-variant mt-2">Registered profiles</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Active Members</span>
          <span className="font-headline-xl font-bold text-tertiary-container mt-1 font-numeric-table">
            {staff.filter(s => s.status === 'Active').length}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Authorized on duty</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Kitchen Team</span>
          <span className="font-headline-xl font-bold text-primary mt-1 font-numeric-table">
            {staff.filter(s => s.department === 'Kitchen Team' || s.department.toLowerCase().includes('kitchen')).length}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Prep & station cooks</span>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Pending Approval</span>
          <span className="font-headline-xl font-bold text-amber-700 mt-1 font-numeric-table">
            {staff.filter(s => s.status === 'Pending').length}
          </span>
          <span className="text-xs text-on-surface-variant mt-2">Requires lead review</span>
        </div>
      </div>

      {/* STAFF MEMBERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filtered.map(member => (
          <div
            key={member.id}
            className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base border border-primary/20">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-headline-md font-semibold text-on-surface leading-tight">{member.name}</h3>
                    <span className="text-xs text-primary font-semibold">{member.role}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {member.status}
                </span>
              </div>

              <div className="space-y-1.5 py-3 border-y border-outline-variant/20 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Department:</span>
                  <span className="text-on-surface font-medium">{member.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Email:</span>
                  <span className="text-on-surface truncate max-w-[180px]">{member.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Phone:</span>
                  <span className="font-mono text-on-surface">{member.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">System Access:</span>
                  <span className="font-semibold text-on-surface px-2 py-0.5 rounded bg-surface-container-low text-xs">
                    {member.accessLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between text-xs text-on-surface-variant mt-2">
              <span>Joined {formatDate(member.joinedDate)}</span>
              <button
                type="button"
                onClick={() => setEditingMember({ ...member })}
                className="text-primary font-semibold hover:underline"
              >
                Edit Role
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Team Member">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Full Name</label>
            <input
              type="text"
              required
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              placeholder="e.g., Tariq Mehmood"
              className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Role</label>
            <input
              type="text"
              required
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              placeholder="e.g., Inventory Assistant"
              className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Department</label>
            <select
              value={newMember.department}
              onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface"
            >
              <option value="Storage & Receiving">Storage & Receiving</option>
              <option value="Hot Kitchen">Hot Kitchen</option>
              <option value="Cold Station & Prep">Cold Station & Prep</option>
              <option value="Operations & Admin">Operations & Admin</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Email Address</label>
            <input
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              placeholder="e.g., tariq@restaurant.pk"
              className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">System Access Level</label>
            <select
              value={newMember.accessLevel}
              onChange={(e) => setNewMember({ ...newMember, accessLevel: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface"
            >
              <option value="Full Admin">Full Admin</option>
              <option value="Operations Lead">Operations Lead</option>
              <option value="Recipe & Production">Recipe & Production</option>
              <option value="Count & Transfer">Count & Transfer</option>
              <option value="View Only">View Only</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant/50 text-on-surface hover:bg-surface-container-low"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium"
            >
              Save Team Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      {editingMember && (
        <Modal isOpen={true} onClose={() => setEditingMember(null)} title={`Edit ${editingMember.name}`}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Role Title</label>
              <input
                type="text"
                value={editingMember.role}
                onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Department</label>
              <select
                value={editingMember.department}
                onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface"
              >
                <option value="Storage & Receiving">Storage & Receiving</option>
                <option value="Hot Kitchen">Hot Kitchen</option>
                <option value="Cold Station & Prep">Cold Station & Prep</option>
                <option value="Operations & Admin">Operations & Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Access Level</label>
              <select
                value={editingMember.accessLevel}
                onChange={(e) => setEditingMember({ ...editingMember, accessLevel: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface"
              >
                <option value="Full Admin">Full Admin</option>
                <option value="Operations Lead">Operations Lead</option>
                <option value="Recipe & Production">Recipe & Production</option>
                <option value="Count & Transfer">Count & Transfer</option>
                <option value="View Only">View Only</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 rounded-lg border border-outline-variant/50 text-on-surface hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-medium"
              >
                Update Member
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
