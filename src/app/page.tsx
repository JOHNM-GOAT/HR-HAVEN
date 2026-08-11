'use client';

import React from 'react';
import { useWellness } from '../context/WellnessContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Toast } from '../components/layout/Toast';
import { ExerciseModal } from '../components/health/ExerciseModal';
import { LoginPage } from '../components/auth/LoginPage';

import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { PredictiveAnalyticsView } from '../components/analytics/PredictiveAnalyticsView';
import { PhysicalHealthView } from '../components/health/PhysicalHealthView';
import { MentalWellbeingView } from '../components/mental/MentalWellbeingView';
import { SocialConnectivityView } from '../components/social/SocialConnectivityView';
import { CognitiveInclusivityView } from '../components/inclusive/CognitiveInclusivityView';
import { BoundaryGuardView } from '../components/boundary/BoundaryGuardView';
import { HrExecutiveView } from '../components/hr/HrExecutiveView';

export default function Home() {
  const { isAuthenticated, activeTab, accessibility } = useWellness();

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen bg-slate-100 transition-all ${accessibility.dyslexiaFont ? 'dyslexia-font' : ''
          } ${accessibility.highContrast ? 'high-contrast' : ''
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
      case 'hr':
        return <HrExecutiveView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div
      className={`h-screen overflow-hidden bg-slate-100 flex flex-col transition-all ${
        accessibility.dyslexiaFont ? 'dyslexia-font' : ''
      } ${
        accessibility.highContrast ? 'high-contrast' : ''
      }`}
    >
      <Navbar />

      <div className="flex-1 flex w-full overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-full bg-slate-100/80">
          <div className="max-w-[1600px] mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      <Toast />
      <ExerciseModal />
    </div>
  );
}
