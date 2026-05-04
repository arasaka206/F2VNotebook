import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  accentColor?: string;
  trend?: { value: string; positive: boolean };
  size?: 'small' | 'large';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, accentColor = 'text-farm-accent', trend, size = 'large' }) => {
  const isSmall = size === 'small';
  
  return (
    <div className={`card flex flex-col gap-3 ${isSmall ? 'p-3' : ''}`}>
      <div className="flex items-start justify-between">
        <p className={`text-xs text-gray-400 font-medium uppercase tracking-wide ${isSmall ? 'text-[10px]' : ''}`}>{title}</p>
        {icon && <span className={`${isSmall ? 'text-lg' : 'text-2xl'}`}>{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className={`${isSmall ? 'text-xl' : 'text-3xl'} font-bold ${accentColor}`}>{value}</div>
          {subtitle && <p className={`text-xs text-gray-400 mt-1 ${isSmall ? 'text-[10px]' : ''}`}>{subtitle}</p>}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend.positive ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
          } ${isSmall ? 'text-[10px] px-1.5 py-0.5' : ''}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
