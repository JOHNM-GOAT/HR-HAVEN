'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { teamBurnoutOverview } from '../../data/initialData';
import { 
  Users, 
  Lock
} from 'lucide-react';

export const HrExecutiveView: React.FC = () => {
  const { setToastNotification } = useWellness();

  const handleIntervention = (dept: string, action: string) => {
    setToastNotification(`HR Intervention triggered for ${dept}: ${action}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-block mb-2">
            HR Executive Dashboard
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Anonymized Organization Well-Being Heatmap
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated telemetry insights for HR Leadership. Individual employee identity is 100% protected.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
          <Lock className="w-4 h-4 text-blue-600" />
          <span>Strict Privacy & Anonymity Active</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="enterprise-card p-4 border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Total Organization Health Index</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">59/100</span>
            <span className="text-xs text-amber-700 font-bold">Moderate Risk</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Engineering & Sales show highest overtime</p>
        </div>

        <div className="enterprise-card p-4 border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Anonymized Mood Check-In Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">88.4%</span>
            <span className="text-xs text-emerald-700 font-bold">+12% vs last month</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Replaced 100% of quarterly surveys</p>
        </div>

        <div className="enterprise-card p-4 border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold">Active Boundary Shields Engaged</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">42 / 60</span>
            <span className="text-xs text-blue-700 font-bold">70% Adoption</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Employees actively protecting quiet hours</p>
        </div>
      </div>

      {/* Department Burnout Heatmap Table */}
      <div className="enterprise-card p-6 border border-slate-200">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Department Burnout Risk Heatmap & Interventions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3">Department</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Total Team</th>
                <th className="p-3">Overworking Alert</th>
                <th className="p-3 text-right">Recommended HR Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamBurnoutOverview.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{item.department}</td>
                  <td className="p-3 font-extrabold text-slate-900">{item.riskScore}/100</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      item.status === 'moderate' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">{item.totalMembers} Employees</td>
                  <td className="p-3 font-semibold text-rose-600">{item.overworkingCount} Members Over 50h/wk</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleIntervention(item.department, 'Scheduled Meeting-Free Focus Friday')}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition-all"
                    >
                      Trigger Team Focus Day
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
