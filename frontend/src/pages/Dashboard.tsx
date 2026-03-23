import React, { useEffect, useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import SensorCard from '../components/dashboard/SensorCard';
import AlertCard from '../components/dashboard/AlertCard';
import ActivityStream from '../components/dashboard/ActivityStream';
import HerdGrowthChart from '../components/dashboard/HerdGrowthChart';
import QuickActions from '../components/dashboard/QuickActions';
import ChatPanel from '../components/chat/ChatPanel';
import VetPanel from '../components/consult/VetPanel';
import { fetchDashboardSummary, fetchVets } from '../services/farm2vets';
import { MOCK_DASHBOARD, MOCK_VETS } from '../data/mockData';
import type { DashboardSummary, Vet } from '../types';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary>(MOCK_DASHBOARD);
  const [vets, setVets] = useState<Vet[]>(MOCK_VETS);
  const [loading, setLoading] = useState(true);
  const [vetsLoading, setVetsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then(setSummary)
      .catch(() => {/* use mock data if backend unavailable */})
      .finally(() => setLoading(false));

    fetchVets()
      .then(setVets)
      .catch(() => {/* use mock data */})
      .finally(() => setVetsLoading(false));
  }, []);

  const healthScoreColor =
    summary.herd_health_score >= 80
      ? 'text-green-400'
      : summary.herd_health_score >= 60
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <div className="flex flex-1 gap-6 p-6 overflow-hidden">
      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto space-y-6 min-w-0">
        {/* Top stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Overall Herd Health Score"
            value={loading ? '...' : `${summary.herd_health_score}`}
            subtitle={`${summary.total_livestock} livestock registered`}
            icon="💚"
            accentColor={healthScoreColor}
            trend={{ value: '+3 pts', positive: true }}
          />
          <StatCard
            title="Active Treatment Cases"
            value={loading ? '...' : summary.active_treatment_cases}
            subtitle="Ongoing treatments"
            icon="💊"
            accentColor="text-orange-400"
            trend={{ value: '1 new', positive: false }}
          />
          <StatCard
            title="Total Livestock"
            value={loading ? '...' : summary.total_livestock}
            subtitle="Cattle · Swine · Poultry"
            icon="🐄"
            accentColor="text-blue-400"
          />
          <StatCard
            title="Consult Requests"
            value="1"
            subtitle="In-progress"
            icon="🩺"
            accentColor="text-purple-400"
          />
        </div>

        {/* Sensor + Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensorCard
            sensor={summary.latest_sensor}
            isLoading={loading}
          />
          <AlertCard level={summary.disease_alert_level} />
        </div>

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HerdGrowthChart />
          <ActivityStream events={summary.activity_stream} isLoading={loading} />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-72 xl:w-80 flex-shrink-0 overflow-y-auto space-y-4">
        <QuickActions />
        <ChatPanel />
        <VetPanel vets={vets} isLoading={vetsLoading} />
      </div>
    </div>
  );
};

export default Dashboard;
