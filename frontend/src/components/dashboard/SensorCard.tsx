import React from 'react';
import type { SensorReading } from '../../types';

interface SensorCardProps {
  sensor: SensorReading;
}

// ĐÃ SỬA: Đồng bộ lại danh sách trạng thái cho khớp chính xác với Backend
const statusColors: Record<string, string> = {
  normal: 'text-green-400',
  warning: 'text-yellow-400',
  critical: 'text-red-400',
};

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
  // Lớp bảo vệ: Nếu Backend trả về null (lúc DB chưa có dữ liệu cảm biến nào)
  const safeSensor = sensor || {
    temperature_c: 0,
    humidity_pct: 0,
    ammonia_ppm: 0,
    status: 'normal'
  };

  const statusClass = statusColors[safeSensor.status] ?? 'text-gray-400';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">IoT Farm Sensors</p>
          <p className="text-sm font-semibold text-white mt-0.5">Barn A · Real-time</p>
        </div>
        <span className="text-2xl">📡</span>
      </div>

      <div className="space-y-3">
        <SensorRow
          label="Temperature"
          value={`${safeSensor.temperature_c}°C`}
          icon="🌡️"
          barPercent={Math.min((safeSensor.temperature_c / 40) * 100, 100)}
          // ĐÃ SỬA: Cập nhật mức nhiệt độ để thanh bar đổi màu đỏ khi > 35 độ
          barColor={safeSensor.temperature_c > 35 ? 'bg-red-500' : safeSensor.temperature_c > 30 ? 'bg-yellow-400' : 'bg-blue-400'}
        />
        <SensorRow
          label="Humidity"
          value={`${safeSensor.humidity_pct}%`}
          icon="💧"
          barPercent={Math.min(safeSensor.humidity_pct, 100)}
          barColor={safeSensor.humidity_pct > 80 ? 'bg-yellow-400' : 'bg-cyan-400'}
        />
        <SensorRow
          label="Ammonia"
          value={`${safeSensor.ammonia_ppm} ppm`}
          icon="⚗️"
          barPercent={Math.min((safeSensor.ammonia_ppm / 30) * 100, 100)}
          barColor={safeSensor.ammonia_ppm > 25 ? 'bg-red-500' : safeSensor.ammonia_ppm > 15 ? 'bg-yellow-400' : 'bg-green-400'}
        />
      </div>

      <div className={`mt-3 text-xs font-semibold ${statusClass} flex items-center gap-1`}>
        {/* ĐÃ SỬA: Đồng bộ logic dấu chấm hiển thị trạng thái */}
        <span className={`inline-block w-2 h-2 rounded-full ${
          safeSensor.status === 'normal' ? 'bg-green-400' : safeSensor.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
        }`} />
        Status: {safeSensor.status.toUpperCase()}
      </div>
    </div>
  );
};

interface SensorRowProps {
  label: string;
  value: string;
  icon: string;
  barPercent: number;
  barColor: string;
}

const SensorRow: React.FC<SensorRowProps> = ({ label, value, icon, barPercent, barColor }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-400 flex items-center gap-1.5">
        <span>{icon}</span> {label}
      </span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
    <div className="h-1.5 bg-farm-border rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${barPercent}%` }} />
    </div>
  </div>
);

export default SensorCard;