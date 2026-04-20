import React from 'react';

interface QuickAction {
  label: string;
  icon: string;
  color: string;
  onClick?: () => void;
}

const actions: QuickAction[] = [
  { label: 'Record Voice Note', icon: '🎙️', color: 'bg-blue-700/40 hover:bg-blue-700/60 border-blue-600/30' },
  { label: 'Analyze Photo', icon: '📷', color: 'bg-purple-700/40 hover:bg-purple-700/60 border-purple-600/30' },
  { label: 'Contact Vet Now (SOS)', icon: '🚨', color: 'bg-red-700/40 hover:bg-red-700/60 border-red-600/30' },
];

const QuickActions: React.FC = () => {
  return (
    <div className="card">
      <p className="text-sm font-semibold text-white mb-3">Quick Actions</p>
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
