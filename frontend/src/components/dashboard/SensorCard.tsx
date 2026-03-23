import React from 'react';
import type { SensorReading } from '../../types';

interface SensorCardProps {
  sensor: SensorReading;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  normal: 'text-green-400',
  warning: 'text-yellow-400',
  critical: 'text-red-400',
};

const SensorCard: React.FC<SensorCardProps> = ({ sensor, isLoading }) => {
  const statusClass = statusColors[sensor.status] ?? 'text-gray-400';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">IoT Farm Sensors</p>
          <p className="text-sm font-semibold text-white mt-0.5">Barn A · Real-time</p>
        </div>
        <span className="text-2xl">📡</span>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-farm-border rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <SensorRow
            label="Temperature"
            value={`${sensor.temperature_c}°C`}
            icon="🌡️"
            barPercent={Math.min((sensor.temperature_c / 40) * 100, 100)}
            barColor={sensor.temperature_c > 30 ? 'bg-red-500' : 'bg-blue-400'}
          />
          <SensorRow
            label="Humidity"
            value={`${sensor.humidity_pct}%`}
            icon="💧"
            barPercent={Math.min(sensor.humidity_pct, 100)}
            barColor={sensor.humidity_pct > 80 ? 'bg-yellow-400' : 'bg-cyan-400'}
          />
          <SensorRow
            label="Ammonia"
            value={`${sensor.ammonia_ppm} ppm`}
            icon="⚗️"
            barPercent={Math.min((sensor.ammonia_ppm / 30) * 100, 100)}
            barColor={sensor.ammonia_ppm > 20 ? 'bg-red-500' : sensor.ammonia_ppm > 12 ? 'bg-yellow-400' : 'bg-green-400'}
          />
        </div>
      )}

      <div className={`mt-3 text-xs font-semibold ${statusClass} flex items-center gap-1`}>
        <span className={`inline-block w-2 h-2 rounded-full ${
          sensor.status === 'normal' ? 'bg-green-400' : sensor.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
        }`} />
        Status: {sensor.status.toUpperCase()}
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
