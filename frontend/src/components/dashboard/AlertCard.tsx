import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AlertLevel } from '../../types';

interface AlertCardProps {
  level: AlertLevel;
}

const AlertCard: React.FC<AlertCardProps> = ({ level }) => {
  const { t } = useTranslation();

  const levelConfig: Record<AlertLevel, { color: string; bg: string; label: string; description: string; icon: string }> = {
    low: {
      color: 'text-green-400',
      bg: 'bg-green-900/30 border-green-700/40',
      label: t('dashboard.low'),
      description: t('dashboard.lowDescription'),
      icon: '✅',
    },
    medium: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/30 border-yellow-700/40',
      label: t('dashboard.medium'),
      description: t('dashboard.mediumDescription'),
      icon: '⚠️',
    },
    high: {
      color: 'text-orange-400',
      bg: 'bg-orange-900/30 border-orange-700/40',
      label: t('dashboard.high'),
      description: t('dashboard.highDescription'),
      icon: '🚨',
    },
    critical: {
      color: 'text-red-400',
      bg: 'bg-red-900/30 border-red-700/40',
      label: t('dashboard.critical'),
      description: t('dashboard.criticalDescription'),
      icon: '🔴',
    },
  };
  const cfg = levelConfig[level];
  return (
    <div className={`card border ${cfg.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t('dashboard.regionalDiseaseAlert')}</p>
        <span className="text-2xl">{cfg.icon}</span>
      </div>
      <div className={`text-2xl font-bold ${cfg.color} mb-1`}>{cfg.label}</div>
      <p className="text-xs text-gray-400">{cfg.description}</p>
      <button className="mt-3 text-xs text-farm-info underline hover:no-underline">
        {t('dashboard.viewDiseaseRiskMap')}
      </button>
    </div>
  );
};

export default AlertCard;
