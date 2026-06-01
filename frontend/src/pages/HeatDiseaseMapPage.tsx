import React from 'react';
import { useTranslation } from 'react-i18next';
import GeoHeatmapChart from '../components/dashboard/GeoHeatmapChart';
import HeatmapChart from '../components/dashboard/HeatmapChart';

interface HeatDiseaseMapPageProps {
  onOpenTour?: () => void;
  tourLabel?: string;
  introRef?: React.RefObject<HTMLDivElement | null>;
  diseaseSpreadRef?: React.RefObject<HTMLDivElement | null>;
  farmMapRef?: React.RefObject<HTMLDivElement | null>;
}

const HeatDiseaseMapPage: React.FC<HeatDiseaseMapPageProps> = ({
  onOpenTour,
  tourLabel,
  introRef,
  diseaseSpreadRef,
  farmMapRef,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-end">
          {onOpenTour && tourLabel && (
            <button
              type="button"
              onClick={onOpenTour}
              className="inline-flex items-center gap-2 rounded-full border border-farm-border bg-farm-card/80 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-farm-border/50 hover:text-white"
            >
              <span className="text-base">🧭</span>
              {tourLabel}
            </button>
          )}
        </div>

        <div ref={introRef}>
          <section className="card">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                {t('dashboard.diseaseMapPageLabel')}
              </p>
              <h2 className="text-2xl font-semibold text-white">{t('dashboard.diseaseMapPageTitle')}</h2>
              <p className="max-w-4xl text-sm text-gray-400">{t('dashboard.diseaseMapPageSubtitle')}</p>
            </div>
          </section>
        </div>

        <div ref={diseaseSpreadRef}>
          <GeoHeatmapChart />
        </div>

        <div ref={farmMapRef}>
          <HeatmapChart barnId="BARN_ZONE_A" dataType="health" width="100%" height={420} />
        </div>
      </div>
    </div>
  );
};

export default HeatDiseaseMapPage;
