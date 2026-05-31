import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VetPanel from '../components/consult/VetPanel';
import { fetchVets } from '../services/farm2vets';
import type { Vet } from '../types';

const VetConnectPage: React.FC = () => {
  const { t } = useTranslation();
  const [vets, setVets] = useState<Vet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadVets = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const data = await fetchVets();
        setVets(data);
      } catch (error) {
        console.error('Failed to load vets:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadVets();
  }, []);

  return (
    <div className="w-full flex-1 overflow-y-auto p-6 text-left">
      <div className="w-full max-w-4xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-left text-2xl font-bold text-white">{t('vetConnect.title')}</h1>
          <p className="text-sm text-gray-400">{t('vetConnect.subtitle')}</p>
        </div>

        {hasError && (
          <div className="rounded-lg border border-red-700 bg-red-950/40 p-4 text-sm text-red-300">
            {t('vetConnect.loadError')}
          </div>
        )}

        <div className="max-w-xl">
          <VetPanel vets={vets} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default VetConnectPage;
