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
import { BlockersView } from '../components/blockers/BlockersView';
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
import { AttendanceCalendar } from '../components/dashboard/AttendanceCalendar';
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
      case 'blockers':
        return <BlockersView />;
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

      <main className={`flex-1 overflow-y-auto max-w-full relative transition-colors ${
        isDarkMode ? 'bg-[#18191f]/95 text-slate-100' : 'bg-slate-100/80 text-slate-900'
      }`}>
        {/* Mobile app bar. Sticky and in normal flow rather than a floating overlay —
            as an overlay it sat on top of the page heading and hid it. */}
        {!isSidebarOpen && (
          <div
            className={`md:hidden sticky top-0 z-40 flex items-center gap-2.5 px-4 py-2.5 border-b backdrop-blur-md ${
              isDarkMode
                ? 'bg-[#18191f]/90 border-[#2e323e]'
                : 'bg-white/90 border-slate-200/90'
            }`}
          >
            <button
              onClick={() => toggleSidebar(true)}
              className={`w-11 h-11 -ml-1.5 shrink-0 flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer ${
                isDarkMode ? 'text-slate-200 hover:bg-[#282b36]' : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Open Navigation Menu"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-blue-600" />
            </button>
            <div className={`h-5 w-px shrink-0 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <AxionLogo className="w-5 h-5 shrink-0" />
            <span className={`font-extrabold text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              Axion<span className="text-blue-600">HR</span>
            </span>
          </div>
        )}

        <TopNavigationProgress />

        <div className="p-4 sm:p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            {isNavigating ? (
              <ViewSkeleton tab={activeTab} />
            ) : (
              <PageTransition transitionKey={activeTab}>
                {renderActiveView()}
              </PageTransition>
            )}
          </div>
        </div>
      </main>

      <Toast />
      <BatchedToast />
      <WellnessReminderToast />
      <ExerciseModal />
      <PomodoroOverlay />
      <PtoRequestModal />
      <AttendanceCalendar variant="modal" />
    </div>
  );
}
