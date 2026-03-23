import React from 'react';
import type { AlertLevel } from '../../types';

interface AlertCardProps {
  level: AlertLevel;
}

const levelConfig: Record<AlertLevel, { color: string; bg: string; label: string; description: string; icon: string }> = {
  low: {
    color: 'text-green-400',
    bg: 'bg-green-900/30 border-green-700/40',
    label: 'LOW',
    description: 'No significant disease activity in your region.',
    icon: '✅',
  },
  medium: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30 border-yellow-700/40',
    label: 'MEDIUM',
    description: 'HFMD and respiratory infections reported in nearby districts.',
    icon: '⚠️',
  },
  high: {
    color: 'text-orange-400',
    bg: 'bg-orange-900/30 border-orange-700/40',
    label: 'HIGH',
    description: 'Multiple disease outbreaks confirmed. Restrict livestock movement.',
    icon: '🚨',
  },
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-900/30 border-red-700/40',
    label: 'CRITICAL',
    description: 'Outbreak emergency. Contact vet immediately and isolate herd.',
    icon: '🔴',
  },
};

const AlertCard: React.FC<AlertCardProps> = ({ level }) => {
  const cfg = levelConfig[level];
  return (
    <div className={`card border ${cfg.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Regional Disease Alert</p>
        <span className="text-2xl">{cfg.icon}</span>
      </div>
      <div className={`text-2xl font-bold ${cfg.color} mb-1`}>{cfg.label}</div>
      <p className="text-xs text-gray-400">{cfg.description}</p>
      <button className="mt-3 text-xs text-farm-info underline hover:no-underline">
        View Disease Risk Map →
      </button>
    </div>
  );
};

export default AlertCard;
