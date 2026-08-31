'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { UserAccount, UserRole, DeletedUserAccount } from '../../types/wellness';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  RefreshCw, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Key,
  RotateCcw,
  Archive,
  History,
  Lock,
  Clock,
  Shield
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
];

export const DEFAULT_DEPARTMENTS = [
  'Engineering',
  'Product Design & UX',
  'Human Resources',
  'Customer Success',
  'Marketing & Growth',
  'Sales Operations',
  'Finance & Legal',
  'Operations & IT'
];

export const AccountManagementView: React.FC = () => {
  const { 
    accounts, 
    deletedAccounts,
    createAccount, 
    updateAccountRole, 
    toggleAccountStatus, 
    updateAccount, 
    deleteAccount,
    recoverAccount,
    permanentlyPurgeAccount,
    restoreAllDeletedAccounts,
    setToastNotification
  } = useWellness();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals & Drawers state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<UserAccount | null>(null);
  const [deletionReason, setDeletionReason] = useState<string>('Offboarding / Department Restructuring');
  const [showRecoveryDrawer, setShowRecoveryDrawer] = useState(false);
  const [recoverySearch, setRecoverySearch] = useState('');
  const [purgeCandidate, setPurgeCandidate] = useState<DeletedUserAccount | null>(null);

  // New Account Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [customNewDepartment, setCustomNewDepartment] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [newStatus, setNewStatus] = useState<'active' | 'disabled'>('active');
  const [newAvatar, setNewAvatar] = useState(PRESET_AVATARS[0]);

  // Edit Account Form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editDepartment, setEditDepartment] = useState('');
  const [isCustomEditDept, setIsCustomEditDept] = useState(false);
  const [editRole, setEditRole] = useState<UserRole>('employee');
  const [editStatus, setEditStatus] = useState<'active' | 'disabled'>('active');

  // Derive unique departments
  const allDepartments = Array.from(new Set([...DEFAULT_DEPARTMENTS, ...accounts.map(a => a.department)]));
  const departments = allDepartments;

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          account.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || account.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || account.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  // Filter deleted accounts for recovery drawer
  const filteredDeletedAccounts = deletedAccounts.filter(account => 
    account.name.toLowerCase().includes(recoverySearch.toLowerCase()) ||
    account.email.toLowerCase().includes(recoverySearch.toLowerCase()) ||
    account.department.toLowerCase().includes(recoverySearch.toLowerCase())
  );

  // Calculate statistics
  const totalCount = accounts.length;
  const activeCount = accounts.filter(a => a.status === 'active').length;
  const disabledCount = accounts.filter(a => a.status === 'disabled').length;
  const adminCount = accounts.filter(a => a.role === 'admin').length;
  const hrCount = accounts.filter(a => a.role === 'hr_manager').length;
  const employeeCount = accounts.filter(a => a.role === 'employee').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setToastNotification('Please fill in all required fields.');
      return;
    }
    // Check duplicate email
    if (accounts.some(a => a.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setToastNotification('An account with this email address already exists.');
      return;
    }

    const finalDept = newDepartment === 'custom' && customNewDepartment.trim()
      ? customNewDepartment.trim()
      : newDepartment;

    createAccount({
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword.trim(),
      department: finalDept,
      role: newRole,
      status: newStatus,
      avatarUrl: newAvatar
    });

    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewPassword('password123');
    setShowNewPassword(false);
    setNewDepartment('Engineering');
    setCustomNewDepartment('');
    setNewRole('employee');
    setNewStatus('active');
    setIsCreateModalOpen(false);
  };

  const openEditModal = (account: UserAccount) => {
    setEditingAccount(account);
    setEditName(account.name);
    setEditEmail(account.email);
    setEditPassword(account.password || 'password123');
    setEditDepartment(account.department);
    setIsCustomEditDept(!allDepartments.includes(account.department));
    setEditRole(account.role);
    setEditStatus(account.status);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    if (!editName.trim() || !editEmail.trim()) {
      setToastNotification('Please fill in all required fields.');
      return;
    }

    const finalDept = editDepartment.trim() || editingAccount.department || 'Engineering';

    updateAccount(editingAccount.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      password: editPassword.trim() || editingAccount.password || 'password123',
      department: finalDept,
      role: editRole,
      status: editStatus
    });

    setEditingAccount(null);
  };

  const confirmDelete = () => {
    if (deletingAccount) {
      deleteAccount(deletingAccount.id, deletionReason);
      setDeletingAccount(null);
      setDeletionReason('Offboarding / Department Restructuring');
    }
  };

  const confirmHardPurge = () => {
    if (purgeCandidate) {
      permanentlyPurgeAccount(purgeCandidate.id);
      setPurgeCandidate(null);
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-extrabold';
      case 'hr_manager':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold';
      case 'employee':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Administrative Control Center
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Management & Roles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Create user credentials, manage role privileges, toggle active/disabled states, and monitor employee access across departments.
          </p>
        </div>

        {/* Primary Action Buttons & Recovery Vault Nav Icon */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Recovery Vault Navigation Icon Button */}
          <button
            onClick={() => setShowRecoveryDrawer(true)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 group ${
              deletedAccounts.length > 0
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Security Recovery Vault: View and restore deleted accounts"
          >
            <div className="relative">
              <RotateCcw className={`w-4 h-4 transition-transform group-hover:-rotate-45 ${
                deletedAccounts.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-500'
              }`} />
              {deletedAccounts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <span>Deleted Users Vault</span>
            {deletedAccounts.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white shadow-2xs">
                {deletedAccounts.length}
              </span>
            )}
          </button>

          {/* Create New Account Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Account</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="enterprise-card p-4 border border-slate-200/80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Active Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">registered</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>{adminCount} Admins</span> • <span>{hrCount} HR</span> • <span>{employeeCount} Staff</span>
          </div>
        </div>

        <div className="enterprise-card p-4 border border-slate-200/80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Active Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
            <span className="text-[11px] text-emerald-700 font-bold">
              {Math.round((activeCount / (totalCount || 1)) * 100)}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Active login access granted</p>
        </div>

        <div className="enterprise-card p-4 border border-slate-200/80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Disabled Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">{disabledCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">suspended</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Temporary access revocation</p>
        </div>

        {/* Recovery Vault Stat Card */}
        <div 
          onClick={() => setShowRecoveryDrawer(true)}
          className="enterprise-card p-4 border border-amber-200 bg-amber-50/50 hover:bg-amber-50 backdrop-blur-sm rounded-2xl shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 font-bold flex items-center gap-1">
              <span>Security Recovery Vault</span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 group-hover:rotate-180 transition-transform duration-500">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-800">{deletedAccounts.length}</span>
            <span className="text-[11px] text-amber-700 font-bold">recoverable</span>
          </div>
          <p className="text-[10px] text-amber-700 mt-2 flex items-center gap-1 font-semibold">
            <span>Click to view & restore deleted users ➔</span>
          </p>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by full name, email, or employee ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">System Admins</option>
              <option value="hr_manager">HR Managers</option>
              <option value="employee">Employees</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || departmentFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('all');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Account Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900">User Accounts Directory</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredAccounts.length}
            </span>
          </div>

          {deletedAccounts.length > 0 && (
            <button
              onClick={() => setShowRecoveryDrawer(true)}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{deletedAccounts.length} Deleted Account(s) in Vault ➔</span>
            </button>
          )}
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No matching user accounts found</h4>
            <p className="text-xs text-slate-400 mt-1">Try broadening your search query or reset active filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[11px] uppercase font-bold text-slate-400 bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="p-3.5 pl-4">User Details</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5">Last Active</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map(account => {
                  const isActive = account.status === 'active';
                  return (
                    <tr 
                      key={account.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${!isActive ? 'bg-slate-50/40 opacity-75' : ''}`}
                    >
                      {/* User Avatar + Name + Email */}
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={account.avatarUrl || PRESET_AVATARS[0]}
                            alt={account.name}
                            className={`w-9 h-9 rounded-full object-cover border-2 ${
                              isActive ? 'border-blue-500' : 'border-slate-300 grayscale'
                            }`}
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              {account.name}
                              {!isActive && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold uppercase">
                                  Disabled
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">{account.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department (Quick Interactive Switcher) */}
                      <td className="p-3.5">
                        <div className="relative inline-block group">
                          <select
                            value={account.department}
                            onChange={e => updateAccount(account.id, { department: e.target.value })}
                            className="appearance-none cursor-pointer text-[11px] font-bold px-3 py-1 pr-6 rounded-lg bg-slate-100 dark:bg-[#20222a] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                            title="Click to edit or switch department"
                          >
                            {allDepartments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 top-2 pointer-events-none opacity-50 text-slate-500" />
                        </div>
                      </td>

                      {/* Interactive Role Switcher Dropdown */}
                      <td className="p-3.5">
                        <div className="relative inline-block">
                          <select
                            value={account.role}
                            onChange={e => updateAccountRole(account.id, e.target.value as UserRole)}
                            className={`appearance-none cursor-pointer text-[11px] px-3 py-1 pr-6 rounded-full border transition-all ${getRoleBadgeClass(account.role)}`}
                          >
                            <option value="admin">System Admin</option>
                            <option value="hr_manager">HR Manager</option>
                            <option value="employee">Employee</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Account Status Switch & Badge */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAccountStatus(account.id)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            title={isActive ? 'Click to disable account' : 'Click to enable account'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                isActive ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                            isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </td>

                      {/* Last Active / Created */}
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        <p className="font-semibold text-slate-700">{account.lastActive}</p>
                        <p className="text-[10px] text-slate-400">Created: {account.createdAt}</p>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(account)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Account Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingAccount(account)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Account (Move to Recovery Vault)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ACCOUNT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div>
                  <h3 className="text-base font-extrabold">Create New User Account</h3>
                  <p className="text-[11px] text-blue-100">Provision credentials & permissions</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Avatar Preset</label>
                <div className="flex items-center gap-3">
                  {PRESET_AVATARS.map((avatar, idx) => (
                    <img
                      key={idx}
                      src={avatar}
                      alt="Preset Avatar"
                      onClick={() => setNewAvatar(avatar)}
                      className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        newAvatar === avatar ? 'border-blue-600 scale-110 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="jordan.smith@axionhr.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Account Password *</label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(Math.random().toString(36).slice(-8) + 'A1!')}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Set login password..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">User will use this password to sign into AxionHR.</p>
              </div>

              {/* Department & Role Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    {allDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="custom">+ Custom Department...</option>
                  </select>
                  {newDepartment === 'custom' && (
                    <input
                      type="text"
                      value={customNewDepartment}
                      onChange={e => setCustomNewDepartment(e.target.value)}
                      placeholder="Enter department name..."
                      className="w-full mt-2 bg-slate-50 border border-blue-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Role</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
                <div className="flex gap-3">
                  <label className={`flex-1 p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    newStatus === 'active' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input 
                      type="radio" 
                      name="newStatus" 
                      checked={newStatus === 'active'} 
                      onChange={() => setNewStatus('active')}
                      className="hidden" 
                    />
                    Active
                  </label>

                  <label className={`flex-1 p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    newStatus === 'disabled' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input 
                      type="radio" 
                      name="newStatus" 
                      checked={newStatus === 'disabled'} 
                      onChange={() => setNewStatus('disabled')}
                      className="hidden" 
                    />
                    Disabled
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-extrabold">Edit Account Details</h3>
                  <p className="text-[11px] text-slate-400">{editingAccount.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingAccount(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              {/* Edit Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password / Reset Password</label>
                  <button
                    type="button"
                    onClick={() => setEditPassword(Math.random().toString(36).slice(-8) + 'A1!')}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Reset Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="New password..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={allDepartments.includes(editDepartment) && !isCustomEditDept ? editDepartment : 'custom'}
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setIsCustomEditDept(true);
                      } else {
                        setIsCustomEditDept(false);
                        setEditDepartment(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    {allDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="custom">+ Custom Department...</option>
                  </select>
                  {(isCustomEditDept || !allDepartments.includes(editDepartment)) && (
                    <input
                      type="text"
                      value={editDepartment}
                      onChange={e => setEditDepartment(e.target.value)}
                      placeholder="Type custom department..."
                      className="w-full mt-2 bg-slate-50 border border-blue-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                <div className="flex gap-3">
                  <label className={`flex-1 p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    editStatus === 'active' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input 
                      type="radio" 
                      name="editStatus" 
                      checked={editStatus === 'active'} 
                      onChange={() => setEditStatus('active')}
                      className="hidden" 
                    />
                    Active
                  </label>

                  <label className={`flex-1 p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    editStatus === 'disabled' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input 
                      type="radio" 
                      name="editStatus" 
                      checked={editStatus === 'disabled'} 
                      onChange={() => setEditStatus('disabled')}
                      className="hidden" 
                    />
                    Disabled
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL (Moves to Recovery Vault) */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h3 className="text-lg font-extrabold text-slate-900 text-center">Move to Security Recovery Vault?</h3>
            <p className="text-xs text-slate-500 mt-2 text-center leading-relaxed">
              You are deactivating the account for <strong className="text-slate-900">{deletingAccount.name}</strong> ({deletingAccount.email}).
            </p>

            <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Admin Security Feature:</strong> This account will be safely archived in the <strong>Recovery Vault</strong>. You can restore it anytime with 1-click.
              </span>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Deprovisioning (Optional)</label>
              <input
                type="text"
                value={deletionReason}
                onChange={e => setDeletionReason(e.target.value)}
                placeholder="e.g. Offboarding, Department restructuring..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Move to Recovery Vault</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER DRAWER: Security Recovery Vault & Deleted Accounts */}
      {showRecoveryDrawer && (
        <>
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setShowRecoveryDrawer(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
          />

          {/* Drawer Container (Slides In From Right) */}
          <div 
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200"
          >
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold tracking-tight">
                      Security Recovery Vault
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
                      {deletedAccounts.length} Recoverable
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Deprovisioned & deleted accounts archive
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowRecoveryDrawer(false)}
                className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Close Vault"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Security Banner & Quick Actions */}
            <div className="p-4 bg-amber-50/80 border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-tight">
                  Deleted accounts are held securely. You can restore access instantly with all historical credentials preserved.
                </p>
              </div>

              {deletedAccounts.length > 1 && (
                <button
                  onClick={restoreAllDeletedAccounts}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 shadow-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore All ({deletedAccounts.length})</span>
                </button>
              )}
            </div>

            {/* Search Bar inside Drawer */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={recoverySearch}
                  onChange={e => setRecoverySearch(e.target.value)}
                  placeholder="Filter deleted users by name, email, or department..."
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Scrollable Deleted Accounts List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/30">
              {filteredDeletedAccounts.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white p-6">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-slate-700">Recovery Vault Clean</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {deletedAccounts.length === 0 
                      ? 'No deleted accounts in vault. All users are currently active or provisioned.'
                      : 'No deleted accounts match your search query.'}
                  </p>
                </div>
              ) : (
                filteredDeletedAccounts.map(account => (
                  <div 
                    key={account.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-amber-300 transition-all space-y-3"
                  >
                    {/* User Info Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={account.avatarUrl || PRESET_AVATARS[0]}
                          alt={account.name}
                          className="w-10 h-10 rounded-full object-cover grayscale border-2 border-slate-300"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">{account.name}</span>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              Deleted Record
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{account.email}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${getRoleBadgeClass(account.role)}`}>
                        {account.role.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Metadata & Audit Trail Box */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> Deleted: {account.deletedAt}
                        </span>
                        <span className="text-slate-500 font-medium">Dept: {account.department}</span>
                      </div>
                      <p className="text-slate-500">
                        <strong className="text-slate-700">Archived By:</strong> {account.deletedBy}
                      </p>
                      {account.deletionReason && (
                        <p className="text-slate-600 italic">
                          &ldquo;{account.deletionReason}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <button
                        onClick={() => setPurgeCandidate(account)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        title="Permanently erase from vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hard Purge</span>
                      </button>

                      <button
                        onClick={() => recoverAccount(account.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Account Access</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* HARD PURGE CONFIRMATION MODAL */}
      {purgeCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <h3 className="text-lg font-extrabold text-slate-900">Permanently Purge Record?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This will permanently expunge <strong className="text-slate-900">{purgeCandidate.name}</strong> ({purgeCandidate.email}) from the Security Recovery Vault. Once purged, this record cannot be recovered.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPurgeCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmHardPurge}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                Confirm Hard Purge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
