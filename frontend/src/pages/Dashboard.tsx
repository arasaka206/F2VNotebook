import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../components/dashboard/StatCard';
import SensorCard from '../components/dashboard/SensorCard';
import AlertCard from '../components/dashboard/AlertCard';
import AlarmingNotifications from '../components/dashboard/AlarmingNotifications';
import ActivityStream from '../components/dashboard/ActivityStream';
import HerdGrowthChart from '../components/dashboard/HerdGrowthChart';
import QuickActions from '../components/dashboard/QuickActions';
import ChatPanel from '../components/chat/ChatPanel';
import VetPanel from '../components/consult/VetPanel';
import HeatmapChart from '../components/dashboard/HeatmapChart';
import GeoHeatmapChart from '../components/dashboard/GeoHeatmapChart';
import { fetchDashboardSummary, fetchVets, fetchLatestSensor, fetchSensorAggregate } from '../services/farm2vets';
import type { DashboardSummary, Vet, SensorReading, SensorAggregate } from '../types';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  // 1. Khởi tạo state an toàn
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [vets, setVets] = useState<Vet[]>([]);
  const [sensorData, setSensorData] = useState<SensorReading | null>(null);
  const [sensorStats, setSensorStats] = useState<SensorAggregate | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [vetsLoading, setVetsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Hàm tải dữ liệu dashboard
  const loadDashboardData = async () => {
    try {
      setError(null);
      const summaryData = await fetchDashboardSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error("Lỗi khi tải dashboard:", err);
      setError(t('dashboard.connectionError'));
    }
  };

  // 3. Hàm tải dữ liệu cảm biến
  const loadSensorData = async () => {
    try {
      const latest = await fetchLatestSensor();
      setSensorData(latest);
      
      // Fetch 24h aggregates
      const stats = await fetchSensorAggregate('barn-1', 24);
      setSensorStats(stats);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu cảm biến:", err);
    }
  };

  // 4. Gọi API lấy dữ liệu thật một lần khi component mount
  useEffect(() => {
    setError(null);

    Promise.all([
      fetchDashboardSummary().then(setSummary),
      fetchVets().then(setVets),
      loadSensorData()
    ])
    .catch((err) => {
      console.error("Lỗi khi tải dữ liệu thật:", err);
      setError(t('dashboard.connectionError'));
    })
    .finally(() => {
      setLoading(false);
      setVetsLoading(false);
    });

    // 5. Thiết lập auto-refresh mỗi 10 giây
    const interval = setInterval(() => {
      loadDashboardData();
      loadSensorData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // 6. CHẶN LỖI NULL: Nếu đang tải, trả về màn hình Loading ngay lập tức
  if (loading || vetsLoading) {
    return (
      <div className="flex-1 p-6 flex justify-center items-center text-gray-400">
        <span className="animate-pulse">{t('dashboard.loadingData')}</span>
      </div>
    );
  }

  // 7. CHẶN LỖI NULL: Nếu có lỗi hoặc không có summary, dừng lại và báo lỗi
  if (error || !summary) {
    return (
      <div className="flex-1 p-6 flex flex-col justify-center items-center text-red-400">
        <span className="text-4xl mb-4">⚠️</span>
        <p>{error || t('dashboard.noDataAvailable')}</p>
      </div>
    );
  }

  // 8. LÚC NÀY `summary` CHẮC CHẮN ĐÃ CÓ DATA: Thoải mái tính toán mà không sợ crash
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
        {/* Top stat cards - Bento Grid Hierarchy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Primary KPI - Larger */}
          <div className="lg:col-span-2">
            <StatCard
              title={t('dashboard.herdHealthScore')}
              value={`${summary.herd_health_score}`}
              subtitle={`${summary.total_livestock} ${t('dashboard.cattleSwinePoultry').toLowerCase()}`}
              icon="💚"
              accentColor={healthScoreColor}
              trend={{ value: '+3 pts', positive: true }}
              size="large"
            />
          </div>
          {/* Secondary chips - Smaller */}
          <div className="space-y-2">
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

        {/* Sensor + Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensorCard
            sensor={sensorData || summary.latest_sensor}
            sensorStats={sensorStats}
          />
          <AlertCard level={summary.disease_alert_level} />
        </div>



        {/* Alarming Notifications */}
        <AlarmingNotifications />

        {/* GeoHeatmap */}
        <div className="mt-6">
          <GeoHeatmapChart />
        </div>

        {/* Heatmap */}
        <HeatmapChart barnId="barn-1" dataType="health" width={400} height={300} />

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HerdGrowthChart />
          <ActivityStream events={summary.activity_stream} isLoading={false} />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-72 xl:w-80 flex-shrink-0 overflow-y-auto space-y-4">
        <QuickActions />
        <ChatPanel />
        <VetPanel vets={vets} isLoading={false} />
        
      </div>
    </div>
  );
};

export default Dashboard;