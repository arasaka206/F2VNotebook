import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../components/dashboard/StatCard';
import SensorCard from '../components/dashboard/SensorCard';
import AlertCard from '../components/dashboard/AlertCard';
import AlarmingNotifications from '../components/dashboard/AlarmingNotifications';
import ActivityStream from '../components/dashboard/ActivityStream';
import HerdGrowthChart from '../components/dashboard/HerdGrowthChart';
import QuickActions from '../components/dashboard/QuickActions';
import { fetchDashboardSummary, fetchLatestSensor, fetchSensorAggregate } from '../services/farm2vets';
import type { DashboardSummary, SensorReading, SensorAggregate } from '../types';

interface DashboardProps {
  onOpenTour?: () => void;
  tourLabel?: string;
  overviewRef?: React.RefObject<HTMLDivElement | null>;
  quickActionsRef?: React.RefObject<HTMLDivElement | null>;
  sensorsRef?: React.RefObject<HTMLDivElement | null>;
  alertsRef?: React.RefObject<HTMLDivElement | null>;
  notificationsRef?: React.RefObject<HTMLDivElement | null>;
  activityRef?: React.RefObject<HTMLDivElement | null>;
}

const Dashboard: React.FC<DashboardProps> = ({
  onOpenTour,
  tourLabel,
  overviewRef,
  quickActionsRef,
  sensorsRef,
  alertsRef,
  notificationsRef,
  activityRef,
}) => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sensorData, setSensorData] = useState<SensorReading | null>(null);
  const [sensorStats, setSensorStats] = useState<SensorAggregate | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const summaryData = await fetchDashboardSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(t('dashboard.connectionError'));
    }
  };

  const loadSensorData = async () => {
    try {
      const latest = await fetchLatestSensor();
      setSensorData(latest);

      const stats = await fetchSensorAggregate(latest.barn_id || 'barn-1', 24);
      setSensorStats(stats);
    } catch (err) {
      console.error('Failed to load sensor data:', err);
    }
  };

  useEffect(() => {
    setError(null);

    Promise.all([
      fetchDashboardSummary().then(setSummary),
      loadSensorData(),
    ])
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
        setError(t('dashboard.connectionError'));
      })
      .finally(() => {
        setLoading(false);
      });

    const interval = setInterval(() => {
      loadDashboardData();
      loadSensorData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-gray-400">
        <span className="animate-pulse">{t('dashboard.loadingData')}</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-red-400">
        <span className="mb-4 text-4xl">⚠️</span>
        <p>{error || t('dashboard.noDataAvailable')}</p>
      </div>
    );
  }

  const healthScoreColor =
    summary.herd_health_score >= 80
      ? 'text-green-400'
      : summary.herd_health_score >= 60
        ? 'text-yellow-400'
        : 'text-red-400';

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="min-w-0 flex-1 space-y-6 overflow-y-auto p-6">
        {onOpenTour && tourLabel && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onOpenTour}
              className="inline-flex items-center gap-2 rounded-full border border-farm-border bg-farm-card/80 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-farm-border/50 hover:text-white"
            >
              <span className="text-base">🧭</span>
              {tourLabel}
            </button>
          </div>
        )}

        <div ref={overviewRef} className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-4">
            <StatCard
              title={t('dashboard.herdHealthScore')}
              value={`${summary.herd_health_score}`}
              subtitle={`${summary.total_livestock} ${t('dashboard.cattleSwinePoultry').toLowerCase()}`}
              icon="💚"
              accentColor={healthScoreColor}
              trend={{ value: '+3 pts', positive: true }}
              size="large"
            />
            <div ref={quickActionsRef}>
              <QuickActions />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard
              title={t('dashboard.activeTreatmentCases')}
              value={summary.active_treatment_cases}
              subtitle={t('dashboard.ongoingTreatments')}
              icon="💊"
              accentColor="text-orange-400"
              trend={{ value: '1 new', positive: false }}
              size="small"
            />
            <StatCard
              title={t('dashboard.totalLivestock')}
              value={summary.total_livestock}
              subtitle={t('dashboard.cattleSwinePoultry')}
              icon="🐄"
              accentColor="text-blue-400"
              size="small"
            />
            <StatCard
              title={t('dashboard.consultRequests')}
              value="1"
              subtitle={t('dashboard.inProgress')}
              icon="🩺"
              accentColor="text-purple-400"
              size="small"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div ref={sensorsRef}>
            <SensorCard sensor={sensorData || summary.latest_sensor} sensorStats={sensorStats} />
          </div>
          <div ref={alertsRef}>
            <AlertCard level={summary.disease_alert_level} />
          </div>
        </div>

        <div ref={notificationsRef}>
          <AlarmingNotifications />
        </div>

        <div ref={activityRef} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <HerdGrowthChart />
          <ActivityStream events={summary.activity_stream} isLoading={false} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
