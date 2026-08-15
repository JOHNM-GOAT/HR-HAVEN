'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { UserAccount, UserRole } from '../../types/wellness';
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
  Key
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
];

export const AccountManagementView: React.FC = () => {
  const { 
    accounts, 
    createAccount, 
    updateAccountRole, 
    toggleAccountStatus, 
    updateAccount, 
    deleteAccount,
    setToastNotification
  } = useWellness();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<UserAccount | null>(null);

  // New Account Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [newStatus, setNewStatus] = useState<'active' | 'disabled'>('active');
  const [newAvatar, setNewAvatar] = useState(PRESET_AVATARS[0]);

  // Edit Account Form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('employee');
  const [editStatus, setEditStatus] = useState<'active' | 'disabled'>('active');

  // Derive unique departments
  const departments = Array.from(new Set(accounts.map(a => a.department)));

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          account.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || account.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || account.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

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

    createAccount({
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword.trim(),
      department: newDepartment,
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

    updateAccount(editingAccount.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      password: editPassword.trim() || editingAccount.password || 'password123',
      department: editDepartment,
      role: editRole,
      status: editStatus
    });

    setEditingAccount(null);
  };

  const confirmDelete = () => {
    if (deletingAccount) {
      deleteAccount(deletingAccount.id);
      setDeletingAccount(null);
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
    <div className="space-y-6 pb-12">
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

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
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
            <span className="text-xs text-slate-500 font-semibold">Total Accounts</span>
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
          <p className="mt-2 text-[10px] text-slate-500">Enabled access to platform</p>
        </div>

        <div className="enterprise-card p-4 border border-slate-200/80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Disabled Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{disabledCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">restricted</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">Access revoked / offboarded</p>
        </div>

        <div className="enterprise-card p-4 border border-slate-200/80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Privileged Roles</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">{adminCount + hrCount}</span>
            <span className="text-[11px] text-purple-700 font-bold">Admins & HR</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">Elevated security access</p>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or email address..."
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Roles</option>
              <option value="admin">System Admin</option>
              <option value="hr_manager">HR Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>

          {/* Reset Filters button if any active */}
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
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Click role dropdown or status toggle for instant modifications</span>
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

                      {/* Department */}
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {account.department}
                        </span>
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
                            title="Delete Account"
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
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Customer Success">Customer Success</option>
                    <option value="Marketing & Growth">Marketing & Growth</option>
                    <option value="Sales Operations">Sales Operations</option>
                    <option value="Executive IT">Executive IT</option>
                  </select>
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

              {/* Initial Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Account Status</label>
                <div className="flex gap-3">
                  <label className={`flex-1 p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    newStatus === 'active' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input 
                      type="radio" 
                      name="status" 
                      checked={newStatus === 'active'} 
                      onChange={() => setNewStatus('active')}
                      className="hidden" 
                    />
                    <UserCheck className="w-4 h-4" /> Active (Enabled)
                  </label>

                  <label className={`flex-1 p-2.5 rounded-xl border cursor-pointer text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    newStatus === 'disabled' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input 
                      type="radio" 
                      name="status" 
                      checked={newStatus === 'disabled'} 
                      onChange={() => setNewStatus('disabled')}
                      className="hidden" 
                    />
                    <UserX className="w-4 h-4" /> Disabled
                  </label>
                </div>
              </div>

              {/* Buttons */}
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
                  Create Account
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
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={e => setEditDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                    required
                  />
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

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Delete Account?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to permanently delete the account for <strong className="text-slate-900">{deletingAccount.name}</strong> ({deletingAccount.email})? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
