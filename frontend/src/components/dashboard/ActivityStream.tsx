import React from 'react';
import type { ActivityEvent } from '../../types';

interface ActivityStreamProps {
  events: ActivityEvent[];
  isLoading?: boolean;
}

const typeIcon: Record<string, string> = {
  ai_note: '🤖',
  treatment: '💊',
  consult: '🩺',
  sensor: '📡',
};

const typeColor: Record<string, string> = {
  ai_note: 'bg-purple-700/30 text-purple-300',
  treatment: 'bg-blue-700/30 text-blue-300',
  consult: 'bg-green-700/30 text-green-300',
  sensor: 'bg-yellow-700/30 text-yellow-300',
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const ActivityStream: React.FC<ActivityStreamProps> = ({ events, isLoading }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">AI Notebook Activity Stream</p>
        <span className="text-xl">📓</span>
      </div>
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-farm-border rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-farm-border/30 transition-colors">
              <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm ${typeColor[event.type] ?? 'bg-gray-700/30 text-gray-300'}`}>
                {typeIcon[event.type] ?? '📌'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-200 leading-snug">{event.message}</p>
                <p className="text-[10px] text-gray-500 mt-1">{formatTimestamp(event.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityStream;
