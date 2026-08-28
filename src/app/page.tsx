'use client';

import React from 'react';
import { useWellness } from '../context/WellnessContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Toast } from '../components/layout/Toast';
import { BatchedToast } from '../components/layout/BatchedToast';
import { ExerciseModal } from '../components/health/ExerciseModal';
import { LoginPage } from '../components/auth/LoginPage';
import { AxionLogo } from '../components/common/AxionLogo';
import { Menu } from 'lucide-react';

import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { PredictiveAnalyticsView } from '../components/analytics/PredictiveAnalyticsView';
import { PhysicalHealthView } from '../components/health/PhysicalHealthView';
import { MentalWellbeingView } from '../components/mental/MentalWellbeingView';
import { SocialConnectivityView } from '../components/social/SocialConnectivityView';
import { CognitiveInclusivityView } from '../components/inclusive/CognitiveInclusivityView';
import { BoundaryGuardView } from '../components/boundary/BoundaryGuardView';
import { PtoHealthHubView } from '../components/pto/PtoHealthHubView';
import { HrExecutiveView } from '../components/hr/HrExecutiveView';
import { AccountManagementView } from '../components/admin/AccountManagementView';
import { SettingsView } from '../components/settings/SettingsView';
import { PomodoroOverlay } from '../components/focus/PomodoroOverlay';
import { WellnessReminderToast } from '../components/health/WellnessReminderToast';
import { PtoRequestModal } from '../components/pto/PtoRequestModal';
import { AttendanceCalendarModal } from '../components/dashboard/AttendanceCalendarModal';
import { TopNavigationProgress } from '../components/common/TopNavigationProgress';
import { PageTransition } from '../components/common/PageTransition';
import { ViewSkeleton } from '../components/common/ViewSkeleton';

export default function Home() {
  const { isAuthenticated, isAuthLoading, activeTab, isNavigating, accessibility, isSidebarOpen, toggleSidebar, isDarkMode } = useWellness();

  if (isAuthLoading) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center transition-colors ${
        isDarkMode ? 'bg-[#14151a]' : 'bg-slate-100'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-xl border border-slate-200/80 flex items-center justify-center animate-pulse">
            <AxionLogo className="w-8 h-8" />
          </div>
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen bg-slate-100 transition-all ${
          accessibility.dyslexiaFont ? 'dyslexia-font' : ''
        } ${
          accessibility.highContrast ? 'high-contrast' : ''
        } ${
          accessibility.reducedMotion ? 'clutter-reduced' : ''
        }`}
      >
        <LoginPage />
        <Toast />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'analytics':
        return <PredictiveAnalyticsView />;
      case 'physical':
        return <PhysicalHealthView />;
      case 'mental':
        return <MentalWellbeingView />;
      case 'social':
        return <SocialConnectivityView />;
      case 'inclusive':
        return <CognitiveInclusivityView />;
      case 'boundary':
        return <BoundaryGuardView />;
      case 'pto':
        return <PtoHealthHubView />;
      case 'hr':
        return <HrExecutiveView />;
      case 'accounts':
        return <AccountManagementView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div
      className={`h-screen overflow-hidden ${isDarkMode ? 'bg-[#14151a] text-slate-100' : 'bg-slate-100 text-slate-900'} flex w-full transition-all ${
        accessibility.dyslexiaFont ? 'dyslexia-font' : ''
      } ${
        accessibility.highContrast ? 'high-contrast' : ''
      } ${
        accessibility.reducedMotion ? 'clutter-reduced' : ''
      }`}
    >
      <Sidebar />

      <main className={`flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-full relative transition-colors ${
        isDarkMode ? 'bg-[#18191f]/95 text-slate-100' : 'bg-slate-100/80 text-slate-900'
      }`}>
        {/* Floating Menu Reopen Button when Sidebar is closed (Mobile View) */}
        {!isSidebarOpen && (
          <button
            onClick={() => toggleSidebar(true)}
            className="md:hidden fixed top-4 left-4 z-40 px-3 py-2 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-lg transition-all active:scale-95 flex items-center gap-2.5 font-bold text-xs cursor-pointer group"
            title="Open Navigation Menu"
          >
            <Menu className="w-4.5 h-4.5 text-blue-600" />
            <div className="h-4 w-px bg-slate-200" />
            <AxionLogo className="w-5 h-5 group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-slate-800 text-sm">Axion<span className="text-blue-600">HR</span></span>
          </button>
        )}

        <TopNavigationProgress />

        <div className="max-w-[1600px] mx-auto">
          {isNavigating ? (
            <ViewSkeleton tab={activeTab} />
          ) : (
            <PageTransition transitionKey={activeTab}>
              {renderActiveView()}
            </PageTransition>
          )}
        </div>
      </main>

      <Toast />
      <BatchedToast />
      <WellnessReminderToast />
      <ExerciseModal />
      <PomodoroOverlay />
      <PtoRequestModal />
      <AttendanceCalendarModal />
    </div>
  );
}
