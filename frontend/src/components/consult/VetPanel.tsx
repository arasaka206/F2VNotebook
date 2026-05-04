import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Vet } from '../../types';
import { submitConsultRequest } from '../../services/farm2vets';

interface VetPanelProps {
  vets: Vet[];
  isLoading?: boolean;
}

const statusBadge: Record<string, string> = {
  online: 'badge-online',
  busy: 'badge-busy',
  offline: 'badge-offline',
};

const VetPanel: React.FC<VetPanelProps> = ({ vets, isLoading }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRequestConsult = async () => {
    setSubmitting(true);
    try {
      await submitConsultRequest({
        farmer_id: 'user-001',
        subject: 'General herd health consultation',
        description: 'Requesting a routine health check consultation from the dashboard.',
        priority: 'normal',
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // silently fail in stub mode
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{t('dashboard.veterinaryConnect')}</p>
        <span className="text-xl">🩺</span>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-farm-border rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {vets.map((vet) => (
            <div key={vet.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-farm-border/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-700/40 rounded-full flex items-center justify-center text-xs font-bold">
                  {vet.full_name.split(' ').slice(-2).map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{vet.full_name}</p>
                  <p className="text-[10px] text-gray-400">{vet.specialty}</p>
                </div>
              </div>
              <span className={`flex items-center gap-1 text-[10px] text-gray-400`}>
                <span className={statusBadge[vet.status] ?? 'badge-offline'} />
                {t(`dashboard.${vet.status}`)}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleRequestConsult}
        disabled={submitting}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          success
            ? 'bg-green-700 text-white'
            : 'bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white'
        }`}
      >
        {success ? t('dashboard.consultRequested') : submitting ? t('dashboard.sending') : t('dashboard.requestConsult')}
      </button>
    </div>
  );
};

export default VetPanel;
