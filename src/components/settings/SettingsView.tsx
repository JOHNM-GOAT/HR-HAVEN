'use client';

import React, { useState, useRef } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { ThemeMode } from '../../types/wellness';
import {
  User,
  Lock,
  Sun,
  Moon,
  Monitor,
  Camera,
  Upload,
  Check,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Building,
  Mail,
  Shield,
  KeyRound,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bell,
  Volume2
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
];

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    changePassword,
    theme,
    setTheme,
    isDarkMode,
    userRole
  } = useWellness();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'appearance' | 'preferences'>('profile');

  // Form State - Profile
  const [name, setName] = useState(userProfile.name);
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '');
  const [street, setStreet] = useState(userProfile.address.street || '');
  const [city, setCity] = useState(userProfile.address.city || '');
  const [state, setState] = useState(userProfile.address.state || '');
  const [zipCode, setZipCode] = useState(userProfile.address.zipCode || '');
  const [country, setCountry] = useState(userProfile.address.country || 'United States');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State - Security / Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phoneNumber,
      avatarUrl,
      address: {
        street,
        city,
        state,
        zipCode,
        country
      }
    });
    setProfileSuccessMsg('Your profile has been saved successfully!');
    setTimeout(() => setProfileSuccessMsg(null), 4000);
  };

  // Password Strength Calculation
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = calculateStrength(newPassword);

  // Handle Password Update
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setIsUpdatingPass(true);
    setTimeout(() => {
      const res = changePassword(currentPassword, newPassword);
      setIsUpdatingPass(false);
      if (res.success) {
        setPasswordSuccess(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.message);
      }
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className={`enterprise-card p-6 sm:p-7 border ${isDarkMode ? 'border-slate-800 bg-slate-900/90 text-white' : 'border-slate-200 bg-white'} shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-blue-500 object-cover shadow-md"
            />
            <button
              onClick={() => {
                setActiveSubTab('profile');
                fileInputRef.current?.click();
              }}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors"
              title="Change Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {userProfile.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                {userRole === 'admin' ? 'Administrator' : userRole === 'hr_manager' ? 'HR Executive' : 'Employee'}
              </span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {userProfile.jobTitle} • {userProfile.department}
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Employee ID: <strong className="font-mono text-blue-600">{userProfile.employeeId}</strong> • Member since {userProfile.joinDate}
            </p>
          </div>
        </div>

        {/* Quick Tab Selector Pills */}
        <div className={`flex flex-wrap p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-white text-blue-600 shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveSubTab('security')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'security'
                ? 'bg-white text-blue-600 shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>

          <button
            onClick={() => setActiveSubTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'appearance'
                ? 'bg-white text-blue-600 shadow-xs'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: PERSONAL PROFILE (Name, Photo, Phone, Address) */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {profileSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Section: Profile Photo */}
          <div className={`enterprise-card p-6 border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h3 className={`text-base font-bold mb-1 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Camera className="w-4 h-4 text-blue-600" />
              Profile Photo
            </h3>
            <p className={`text-xs mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Upload your custom photo or pick from preset enterprise avatars.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative group shrink-0">
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-2xl border-2 border-blue-500 object-cover shadow-md"
                />
              </div>

              <div className="space-y-3 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarUrl(PRESET_AVATARS[0])}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Reset to Default
                  </button>
                </div>

                {/* Preset Avatar Gallery */}
                <div className="pt-2">
                  <p className={`text-[11px] font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Or choose a preset avatar:
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatarUrl(url)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          avatarUrl === url ? 'border-blue-600 scale-105 shadow-md ring-2 ring-blue-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Basic Information & Name */}
          <div className={`enterprise-card p-6 border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h3 className={`text-base font-bold mb-1 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <User className="w-4 h-4 text-blue-600" />
              Personal Information
            </h3>
            <p className={`text-xs mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Update your display name and contact details across AxionHR.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name / Display Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="e.g. Alex Mercer"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address (AxionHR ID)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={userProfile.email}
                    disabled
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium opacity-70 cursor-not-allowed ${
                      isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Work email managed by corporate IT.</span>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Department & Role
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={`${userProfile.department} (${userProfile.jobTitle})`}
                    disabled
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium opacity-70 cursor-not-allowed ${
                      isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Residential / Mailing Address */}
          <div className={`enterprise-card p-6 border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h3 className={`text-base font-bold mb-1 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <MapPin className="w-4 h-4 text-blue-600" />
              Residential & Work Location Address
            </h3>
            <p className={`text-xs mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Your registered location for remote work telemetry & health kit deliveries.
            </p>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="e.g. 742 Innovation Way, Suite 400"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="San Francisco"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="CA"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    placeholder="94107"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="United States"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit / Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: SECURITY & PASSWORD CHANGE */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handlePasswordSubmit} className={`enterprise-card p-6 sm:p-7 border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Change Account Password
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Ensure your account is protected with a strong, secure passphrase.
                </p>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {passwordError && (
              <div className="my-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="my-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="space-y-4 my-6 max-w-lg">
              {/* Current Password */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Default demo password is: <code className="font-mono text-blue-600">password123</code></span>
              </div>

              {/* New Password */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${passStrength >= 1 ? 'w-1/4 bg-rose-500' : 'w-0'}`} />
                      <div className={`h-full transition-all ${passStrength >= 2 ? 'w-1/4 bg-amber-500' : 'w-0'}`} />
                      <div className={`h-full transition-all ${passStrength >= 3 ? 'w-1/4 bg-blue-500' : 'w-0'}`} />
                      <div className={`h-full transition-all ${passStrength >= 4 ? 'w-1/4 bg-emerald-500' : 'w-0'}`} />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Strength: {passStrength <= 1 ? 'Weak' : passStrength <= 3 ? 'Medium' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPass}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingPass ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Update Password</span>
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: APPEARANCE & THEME PREFERENCE */}
      {activeSubTab === 'appearance' && (
        <div className="space-y-6">
          <div className={`enterprise-card p-6 sm:p-7 border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h3 className={`text-base font-bold mb-1 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Sun className="w-4 h-4 text-blue-600" />
              Interface Theme & Appearance
            </h3>
            <p className={`text-xs mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Select your preferred color scheme for a comfortable viewing experience.
            </p>

            {/* Theme Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative group ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : isDarkMode ? 'border-slate-700 bg-slate-800/80 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {theme === 'light' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <Sun className="w-5 h-5" />
                </div>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Light Mode
                </h4>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Clean, high-clarity crisp white palette with blue highlights.
                </p>
                <div className="mt-4 p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-mono">
                  #FFFFFF Canvas
                </div>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative group ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                    : isDarkMode ? 'border-slate-700 bg-slate-800/80 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {theme === 'dark' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-indigo-900/60 text-indigo-400 flex items-center justify-center mb-3">
                  <Moon className="w-5 h-5" />
                </div>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Dark Mode
                </h4>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Deep midnight palette designed to reduce eye strain in dim light.
                </p>
                <div className="mt-4 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                  #090F1D Midnight
                </div>
              </button>

              {/* System Default Card */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative group ${
                  theme === 'system'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : isDarkMode ? 'border-slate-700 bg-slate-800/80 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {theme === 'system' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Monitor className="w-5 h-5" />
                </div>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  System Sync
                </h4>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Automatically adapt to your device operating system theme.
                </p>
                <div className="mt-4 p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-mono">
                  Auto OS Preference
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
