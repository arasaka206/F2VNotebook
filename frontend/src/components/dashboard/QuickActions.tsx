import React from 'react';
import { useTranslation } from 'react-i18next';

const QuickActions: React.FC = () => {
  const { t } = useTranslation();

  interface QuickAction {
    label: string;
    icon: string;
    color: string;
    onClick?: () => void;
  }

  const actions: QuickAction[] = [
    { label: t('quickActions.recordVoiceNote'), icon: '🎙️', color: 'bg-blue-700/40 hover:bg-blue-700/60 border-blue-600/30' },
    { label: t('quickActions.analyzePhoto'), icon: '📷', color: 'bg-purple-700/40 hover:bg-purple-700/60 border-purple-600/30' },
    { label: t('quickActions.contactVetSOS'), icon: '🚨', color: 'bg-red-700/40 hover:bg-red-700/60 border-red-600/30' },
  ];

  return (
    <div className="card">
      <p className="text-sm font-semibold text-white mb-3">{t('dashboard.quickActions')}</p>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm font-medium text-gray-200 transition-colors ${action.color}`}
          >
            <span className="text-lg">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
