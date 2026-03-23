import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  accentColor?: string;
  trend?: { value: string; positive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, accentColor = 'text-farm-accent', trend }) => {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className={`text-3xl font-bold ${accentColor}`}>{value}</div>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.positive ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
          }`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
