import React, { useEffect, useState } from 'react';
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
import type { DashboardSummary, Vet, SensorReading } from '../types';

const Dashboard: React.FC = () => {
  // 1. Khởi tạo state an toàn
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [vets, setVets] = useState<Vet[]>([]);
  const [sensorData, setSensorData] = useState<SensorReading | null>(null);
  const [sensorStats, setSensorStats] = useState<any>(null);
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
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend.");
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
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend.");
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
        <span className="animate-pulse">Đang tải dữ liệu từ hệ thống...</span>
      </div>
    );
  }

  // 7. CHẶN LỖI NULL: Nếu có lỗi hoặc không có summary, dừng lại và báo lỗi
  if (error || !summary) {
    return (
      <div className="flex-1 p-6 flex flex-col justify-center items-center text-red-400">
        <span className="text-4xl mb-4">⚠️</span>
        <p>{error || "Không có dữ liệu. Vui lòng kiểm tra lại Backend."}</p>
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
        {/* Top stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Overall Herd Health Score"
            value={`${summary.herd_health_score}`}
            subtitle={`${summary.total_livestock} livestock registered`}
            icon="💚"
            accentColor={healthScoreColor}
            trend={{ value: '+3 pts', positive: true }}
          />
          <StatCard
            title="Active Treatment Cases"
            value={summary.active_treatment_cases}
            subtitle="Ongoing treatments"
            icon="💊"
            accentColor="text-orange-400"
            trend={{ value: '1 new', positive: false }}
          />
          <StatCard
            title="Total Livestock"
            value={summary.total_livestock}
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
            sensor={sensorData || summary.latest_sensor}
          />
          <AlertCard level={summary.disease_alert_level} />
        </div>

        {/* 24h Sensor Statistics */}
        {sensorStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="24h Avg Temperature"
              value={sensorStats.avg_temperature_c !== null ? `${sensorStats.avg_temperature_c}°C` : 'N/A'}
              subtitle={`${sensorStats.data_points} readings`}
              icon="🌡️"
              accentColor="text-blue-400"
            />
            <StatCard
              title="24h Avg Humidity"
              value={sensorStats.avg_humidity_pct !== null ? `${sensorStats.avg_humidity_pct}%` : 'N/A'}
              subtitle={`${sensorStats.data_points} readings`}
              icon="💧"
              accentColor="text-cyan-400"
            />
            <StatCard
              title="24h Avg Ammonia"
              value={sensorStats.avg_ammonia_ppm !== null ? `${sensorStats.avg_ammonia_ppm} ppm` : 'N/A'}
              subtitle={`${sensorStats.data_points} readings`}
              icon="⚗️"
              accentColor="text-yellow-400"
            />
          </div>
        )}

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