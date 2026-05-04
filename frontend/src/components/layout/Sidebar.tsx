import React from 'react';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '../../data/mockData';

interface SidebarProps {
  activeItem: string;
  onNavigate: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate }) => {
  const { t } = useTranslation();

  const getTranslatedLabel = (id: string) => {
    const labelMap: Record<string, string> = {
      dashboard: t('app.dashboard'),
      notebook: t('app.notebook'),
      livestock: t('app.livestock'),
      'disease-map': t('app.diseaseMap'),
      'vet-connect': t('app.vetConnect'),
      quizzes: t('app.quizzes'),
      'public-dashboard': t('app.publicDashboard'),
      inventory: t('app.inventory'),
      reports: t('app.reports'),
    };
    return labelMap[id] || id;
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
          <div className="text-xs text-gray-400">AI Herd Notebook</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeItem === item.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-farm-border hover:text-white'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{getTranslatedLabel(item.id)}</span>
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
            <div className="text-xs text-gray-400">Farmer · Farm-001</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
