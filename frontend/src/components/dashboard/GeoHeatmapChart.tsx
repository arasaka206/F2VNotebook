import React, { useEffect, useState } from 'react';
import { Circle, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../context/ThemeContext';
import { DISEASE_MAP_REGIONS, FALLBACK_DISEASE_BULLETINS } from '../../data/diseaseSpread';
import { fetchDiseaseSpreadFeed } from '../../services/farm2vets';
import type { DiseaseBulletin, DiseaseMapZone, DiseaseRegionId } from '../../types';

const REGION_LABEL_KEYS: Record<DiseaseRegionId, string> = {
  Vietnam: 'dashboard.wholeVietnam',
  Hanoi: 'dashboard.hanoiCity',
  HCMC: 'dashboard.saigonMetro',
};

const severityStyles = {
  low: { fill: '#38bdf8', stroke: '#7dd3fc' },
  watch: { fill: '#22c55e', stroke: '#86efac' },
  high: { fill: '#f59e0b', stroke: '#fcd34d' },
  critical: { fill: '#ef4444', stroke: '#fca5a5' },
} as const;

const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.4 });
  }, [center, zoom, map]);

  return null;
};

const GeoHeatmapChart: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const language = i18n.language?.startsWith('vi') ? 'vi' : 'en';
  const isDark = theme === 'dark';

  const [region, setRegion] = useState<DiseaseRegionId>('Vietnam');
  const [selectedZoneId, setSelectedZoneId] = useState(DISEASE_MAP_REGIONS.Vietnam.zones[0]?.id ?? '');
  const [bulletins, setBulletins] = useState<DiseaseBulletin[]>(FALLBACK_DISEASE_BULLETINS);
  const [feedFallback, setFeedFallback] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);

  const view = DISEASE_MAP_REGIONS[region];
  const selectedZone = view.zones.find((zone) => zone.id === selectedZoneId) ?? view.zones[0];

  useEffect(() => {
    setSelectedZoneId(DISEASE_MAP_REGIONS[region].zones[0]?.id ?? '');
  }, [region]);

  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      try {
        const response = await fetchDiseaseSpreadFeed();
        if (cancelled) {
          return;
        }

        setBulletins(response.items.length > 0 ? response.items : FALLBACK_DISEASE_BULLETINS);
        setFeedFallback(response.fallback || response.items.length === 0);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load disease bulletin feed:', error);
          setBulletins(FALLBACK_DISEASE_BULLETINS);
          setFeedFallback(true);
        }
      } finally {
        if (!cancelled) {
          setFeedLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      cancelled = true;
    };
  }, []);

  const tileLayerUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const formatDate = (value: string | null) => {
    if (!value) {
      return t('dashboard.liveNow');
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getZoneText = (zone: DiseaseMapZone, field: 'name' | 'summary') => zone[field][language];

  return (
    <section className="card p-0 overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
              {t('dashboard.publicDiseaseIntelligence')}
            </p>
            <h3 className="text-2xl font-semibold text-white">{t('dashboard.diseaseSpreadMap')}</h3>
            <p className="max-w-3xl text-sm text-gray-400">
              {t('dashboard.diseaseSpreadIntro')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(DISEASE_MAP_REGIONS) as DiseaseRegionId[]).map((regionId) => (
              <button
                key={regionId}
                type="button"
                onClick={() => setRegion(regionId)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  region === regionId
                    ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300'
                    : 'surface-panel text-gray-300 hover:border-emerald-500/50 hover:text-white'
                }`}
              >
                {t(REGION_LABEL_KEYS[regionId])}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="surface-panel-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{t('dashboard.zoneCount')}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{view.zones.length}</p>
            <p className="mt-1 text-xs text-gray-400">
              {region === 'Vietnam' ? t('dashboard.regionalOutbreakZones') : t('dashboard.citySurveillanceZones')}
            </p>
          </div>

          <div className="surface-panel-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{t('dashboard.diseasesTracked')}</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {new Set(view.zones.flatMap((zone) => zone.diseases.map((item) => item.en))).size}
            </p>
            <p className="mt-1 text-xs text-gray-400">{t('dashboard.outbreakAndSurveillanceBlend')}</p>
          </div>

          <div className="surface-panel-soft rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{t('dashboard.liveBulletinFeed')}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{bulletins.length}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                  feedFallback ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                }`}
              >
                {feedLoading
                  ? t('dashboard.loading')
                  : feedFallback
                    ? t('dashboard.liveFeedFallback')
                    : t('dashboard.liveFeedConnected')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid border-t border-farm-border xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,420px)]">
        <div className="relative min-h-[440px]">
          <MapContainer
            center={view.center}
            zoom={view.zoom}
            scrollWheelZoom
            style={{ height: '100%', width: '100%', background: isDark ? '#0f172a' : '#f8fafc' }}
          >
            <TileLayer
              url={tileLayerUrl}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO'
            />
            <MapController center={view.center} zoom={view.zoom} />

            {view.zones.map((zone) => {
              const palette = severityStyles[zone.severity];
              const isSelected = zone.id === selectedZone?.id;

              return (
                <Circle
                  key={zone.id}
                  center={zone.center}
                  radius={zone.radius_km * 1000}
                  pathOptions={{
                    color: isSelected ? (isDark ? '#f8fafc' : '#0f172a') : palette.stroke,
                    fillColor: palette.fill,
                    fillOpacity: isSelected ? 0.5 : 0.3,
                    weight: isSelected ? 3 : 1.8,
                  }}
                  eventHandlers={{
                    click: () => setSelectedZoneId(zone.id),
                  }}
                />
              );
            })}
          </MapContainer>

          <div className="surface-overlay pointer-events-none absolute bottom-4 left-4 z-[600] rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('dashboard.legend')}</p>
            <div className="mt-3 grid gap-2 text-xs text-gray-300">
              {(['watch', 'high', 'critical'] as const).map((severity) => (
                <div key={severity} className="flex items-center gap-3">
                  <span
                    className="inline-flex h-3.5 w-6 rounded-full border"
                    style={{
                      backgroundColor: severityStyles[severity].fill,
                      borderColor: severityStyles[severity].stroke,
                    }}
                  />
                  <span className="font-medium text-gray-300">{t(`dashboard.severityLevels.${severity}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="surface-panel-soft space-y-5 p-6">
          {selectedZone && (
            <div className="surface-panel space-y-4 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{t('dashboard.focusZone')}</p>
                  <h4 className="mt-1 text-lg font-semibold text-white">{getZoneText(selectedZone, 'name')}</h4>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    selectedZone.scope === 'outbreak'
                      ? 'bg-red-500/15 text-red-200'
                      : 'bg-emerald-500/15 text-emerald-200'
                  }`}
                >
                  {selectedZone.scope === 'outbreak' ? t('dashboard.outbreakFocus') : t('dashboard.surveillanceFocus')}
                </span>
              </div>

              <p className="text-sm leading-6 text-gray-300">{getZoneText(selectedZone, 'summary')}</p>

              <div className="flex flex-wrap gap-2">
                {selectedZone.diseases.map((disease) => (
                  <span
                    key={`${selectedZone.id}-${disease.en}`}
                    className="surface-panel rounded-full px-3 py-1 text-xs text-gray-200"
                  >
                    {disease[language]}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface-panel-soft rounded-xl p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">{t('dashboard.lastUpdated')}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{formatDate(selectedZone.updated_at)}</p>
                </div>
                <div className="surface-panel-soft rounded-xl p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">{t('dashboard.source')}</p>
                  <a
                    href={selectedZone.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    {selectedZone.source_label}
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-300">{t('dashboard.liveBulletinFeed')}</h4>
              <span className="text-[11px] text-gray-500">{t('dashboard.publicSourcesOnly')}</span>
            </div>

            <div className="space-y-3">
              {bulletins.map((item) => (
                <a
                  key={`${item.url}-${item.published_at ?? 'no-date'}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="surface-panel block rounded-2xl p-4 transition hover:border-emerald-500/40"
                >
                  <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wide text-gray-500">
                    <span>{item.source}</span>
                    <span>{formatDate(item.published_at)}</span>
                  </div>
                  <h5 className="mt-2 text-sm font-semibold leading-6 text-white">{item.title}</h5>
                  <p className="mt-2 text-xs leading-5 text-gray-400">{item.summary}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="surface-panel rounded-2xl p-4 text-xs leading-6 text-gray-400">
            {t('dashboard.diseaseSpreadDisclaimer')}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeoHeatmapChart;
