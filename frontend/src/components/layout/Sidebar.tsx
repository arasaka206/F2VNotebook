import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '../../data/mockData';
import type { UserAwarenessScore } from '../../types';

interface SidebarProps {
  activeItem: string;
  onNavigate: (id: string) => void;
  navigationRef?: React.RefObject<HTMLElement | null>;
  itemRefs?: Partial<Record<string, React.RefObject<HTMLButtonElement | null>>>;
  showTourButton?: boolean;
  tourLabel?: string;
  onOpenTour?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onNavigate,
  navigationRef,
  itemRefs,
  showTourButton = false,
  tourLabel,
  onOpenTour,
}) => {
  const { t } = useTranslation();
  const [awarenessScore, setAwarenessScore] = useState<UserAwarenessScore | null>(null);

  const getTranslatedLabel = (id: string) => {
    const labelMap: Record<string, string> = {
      landing: t('app.home'),
      dashboard: t('app.dashboard'),
      chat: t('app.chat'),
      notebook: t('app.notebook'),
      livestock: t('app.livestock'),
      'disease-map': t('app.diseaseMap'),
      'vet-connect': t('app.vetConnect'),
      quizzes: t('app.quizzes'),
      'public-dashboard': t('app.publicDashboard'),
      inventory: t('app.inventory'),
      reports: t('app.reports'),
      profile: t('app.farmerProfile'),
    };
    return labelMap[id] || id;
  };

  const loadScore = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/quizzes/user/user-123/awareness`);
      if (!response.ok) return;
      const data = await response.json();
      setAwarenessScore(data);
    } catch (error) {
      console.error('Failed to load awareness score:', error);
    }
  };

  useEffect(() => {
    loadScore();
    window.addEventListener('awarenessScoreUpdated', loadScore);
    return () => {
      window.removeEventListener('awarenessScoreUpdated', loadScore);
    };
  }, []);

  const getBadgeText = (status: string | undefined) => {
    switch (status) {
      case 'good': return t('sidebar.badges.good');
      case 'needs_improvement': return t('sidebar.badges.needsImprovement');
      case 'restricted': return t('sidebar.badges.restricted');
      default: return t('sidebar.badges.default');
    }
  };

  const getBadgeClasses = (status: string | undefined) => {
    switch (status) {
      case 'good': return 'bg-green-600 text-green-100';
      case 'needs_improvement': return 'bg-yellow-600 text-yellow-100';
      case 'restricted': return 'bg-red-600 text-red-100';
      default: return 'bg-gray-700 text-gray-100';
    }
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-farm-card border-r border-farm-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-farm-border">
        <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-xl font-bold">
          🌾
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight">Farm2Vets</div>
          <div className="text-xs text-gray-400">{t('sidebar.productSubtitle')}</div>
        </div>
      </div>

      {showTourButton && tourLabel && onOpenTour && (
        <div className="border-b border-farm-border px-3 py-3">
          <button
            type="button"
            onClick={onOpenTour}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-farm-border bg-farm-bg/45 px-3 py-2 text-sm font-semibold text-farm-text transition hover:border-farm-accent/60 hover:bg-farm-border/40"
          >
            <span aria-hidden="true">?</span>
            <span>{tourLabel}</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav ref={navigationRef} className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            ref={itemRefs?.[item.id]}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-start justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
              activeItem === item.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-farm-border hover:text-white'
            }`}
          >
            <span className="pt-0.5 text-base">{item.icon}</span>
            <span className="flex-1 leading-snug">{getTranslatedLabel(item.id)}</span>
          </button>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-farm-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
            NA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Nguyen Van An</div>
            <div className="text-xs text-gray-400">
              {t('sidebar.farmerMeta', { farm: t('sidebar.farmCode', { id: '001' }) })}
            </div>
          </div>
        </div>
        {awarenessScore && (
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getBadgeClasses(awarenessScore.status)}`}>
              {getBadgeText(awarenessScore.status)}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
