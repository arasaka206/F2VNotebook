import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { fetchBarnSensorOverview } from '../../services/farm2vets';
import type { BarnSensorOverview } from '../../types';

interface HeatmapProps {
  barnId?: string;
  dataType?: 'health' | 'temperature' | 'humidity';
  width?: number | string;
  height?: number;
}

type LayoutSlot = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const PRIMARY_SLOT: LayoutSlot = { left: 37, top: 57, width: 28, height: 18 };
const SECONDARY_SLOTS: LayoutSlot[] = [
  { left: 22, top: 29, width: 16, height: 17 },
  { left: 60, top: 29, width: 16, height: 17 },
  { left: 41, top: 15, width: 18, height: 12 },
  { left: 74, top: 15, width: 13, height: 11 },
  { left: 8, top: 39, width: 10, height: 18 },
];

const LANDMARKS = [
  { key: 'milkingRobot', left: 41, top: 8, width: 19 },
  { key: 'feedLane', left: 5, top: 41, width: 10 },
  { key: 'feedingArea', left: 18, top: 16, width: 15 },
  { key: 'restingArea', left: 35, top: 82, width: 30 },
  { key: 'intakeGate', left: 71, top: 9, width: 16 },
];

const normalizeStatus = (status?: string): 'normal' | 'warning' | 'critical' => {
  if (status === 'danger' || status === 'critical') {
    return 'critical';
  }
  if (status === 'warning') {
    return 'warning';
  }
  return 'normal';
};

const getLayoutSlots = (count: number) => {
  if (count <= 1) {
    return [PRIMARY_SLOT];
  }

  return [PRIMARY_SLOT, ...SECONDARY_SLOTS].slice(0, count);
};

const HeatmapChart: React.FC<HeatmapProps> = ({
  barnId,
  width = '100%',
  height = 420,
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const language = i18n.language?.startsWith('vi') ? 'vi' : 'en';
  const isDark = theme === 'dark';

  const [barns, setBarns] = useState<BarnSensorOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadBarns = async (showInitialLoader = false) => {
    try {
      if (showInitialLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);
      const overview = await fetchBarnSensorOverview(24);
      setBarns(overview);
    } catch (err) {
      console.error('Failed to load barn sensor overview:', err);
      setError(t('dashboard.connectionError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBarns(true);

    const interval = setInterval(() => {
      loadBarns(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const orderedBarns = [...barns].sort((a, b) => {
    if (barnId && a.barn_id === barnId) {
      return -1;
    }
    if (barnId && b.barn_id === barnId) {
      return 1;
    }
    return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
  });

  const visibleBarns = orderedBarns.slice(0, 6);
  const slots = getLayoutSlots(visibleBarns.length);

  const overallAverageTemperature = (() => {
    const values = visibleBarns
      .map((barn) => barn.avg_temperature_c)
      .filter((value): value is number => value !== null);

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  })();

  const overallAverageHumidity = (() => {
    const values = visibleBarns
      .map((barn) => barn.avg_humidity_pct)
      .filter((value): value is number => value !== null);

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  })();

  const formatTime = (value?: string) => {
    if (!value) {
      return t('dashboard.liveNow');
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMetric = (value: number | null | undefined, suffix: string) =>
    typeof value === 'number' ? `${value.toFixed(1)}${suffix}` : t('dashboard.noData');

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-farm-border bg-farm-card p-6" style={{ height }}>
        <span className="animate-pulse text-sm text-gray-400">{t('dashboard.loadingHeatmap')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-farm-border bg-farm-card p-6" style={{ height }}>
        <span className="text-sm text-red-400">{error}</span>
      </div>
    );
  }

  return (
    <section className="card p-0 overflow-hidden" style={{ width: typeof width === 'number' ? `${width}px` : width }}>
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
              {t('dashboard.farmSensorLayoutLabel')}
            </p>
            <h3 className="text-2xl font-semibold text-white">{t('dashboard.farmSensorLayout')}</h3>
            <p className="max-w-3xl text-sm text-gray-400">{t('dashboard.farmSensorLayoutSubtitle')}</p>
          </div>

          <button
            type="button"
            onClick={() => loadBarns(false)}
            className="surface-panel rounded-full px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-cyan-400/40 hover:text-white"
          >
            {refreshing ? t('dashboard.refreshing') : t('dashboard.refresh')}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="surface-panel-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{t('dashboard.monitoredBarns')}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{visibleBarns.length}</p>
            <p className="mt-1 text-xs text-gray-400">{t('dashboard.liveSensorBuildings')}</p>
          </div>
          <div className="surface-panel-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{t('dashboard.temperature')}</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {overallAverageTemperature !== null ? `${overallAverageTemperature.toFixed(1)}°C` : t('dashboard.noData')}
            </p>
            <p className="mt-1 text-xs text-gray-400">{t('dashboard.avgWindow24h')}</p>
          </div>
          <div className="surface-panel-soft rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{t('dashboard.humidity')}</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {overallAverageHumidity !== null ? `${overallAverageHumidity.toFixed(1)}%` : t('dashboard.noData')}
            </p>
            <p className="mt-1 text-xs text-gray-400">{t('dashboard.avgWindow24h')}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-farm-border p-6">
        <div className="surface-panel-soft relative overflow-hidden rounded-[32px] p-4" style={{ height }}>
          <div className="surface-image-frame relative h-full overflow-hidden rounded-[26px]">
            <div
              className="absolute inset-0"
              style={{
                background: isDark
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,247,250,0.98))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.99), rgba(249,247,240,1))',
              }}
            />

            <img
              src="/farm-layout-clean.svg"
              alt={t('dashboard.farmLayoutReferenceAlt')}
              className="absolute inset-[3%] h-[94%] w-[94%] object-contain opacity-95"
            />

            {LANDMARKS.map((landmark) => (
              <div
                key={landmark.key}
                className="surface-overlay absolute z-10 rounded-full px-3 py-1 text-center"
                style={{
                  left: `${landmark.left}%`,
                  top: `${landmark.top}%`,
                  width: `${landmark.width}%`,
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {t(`dashboard.farmLayoutZones.${landmark.key}`)}
                </p>
              </div>
            ))}

            {visibleBarns.length === 0 ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                <div className="surface-overlay rounded-2xl px-6 py-5 text-center text-sm text-gray-400">
                  {t('dashboard.noBarnDataYet')}
                </div>
              </div>
            ) : (
              visibleBarns.map((barn, index) => {
                const slot = slots[index] ?? SECONDARY_SLOTS[SECONDARY_SLOTS.length - 1];
                const normalizedStatus = normalizeStatus(barn.latest_reading.status);

                const toneClasses =
                  normalizedStatus === 'critical'
                    ? 'border-red-300 bg-red-50/95'
                    : normalizedStatus === 'warning'
                      ? 'border-amber-300 bg-amber-50/95'
                      : 'border-cyan-300 bg-cyan-50/95';

                const statusClasses =
                  normalizedStatus === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : normalizedStatus === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700';

                return (
                  <div
                    key={barn.barn_id}
                    className={`absolute z-20 rounded-[22px] border p-4 shadow-[0_20px_38px_rgba(15,23,42,0.16)] ${toneClasses}`}
                    style={{
                      left: `${slot.left}%`,
                      top: `${slot.top}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`,
                    }}
                  >
                    <div className="flex h-full flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {t('dashboard.monitoredBarn')}
                          </p>
                          <h4 className="mt-1 text-base font-semibold text-slate-900">{barn.barn_id}</h4>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusClasses}`}>
                          {t(`dashboard.statusLabels.${normalizedStatus}`)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white/80 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">{t('dashboard.temperature')}</p>
                          <p className="mt-2 text-xl font-semibold text-slate-900">
                            {formatMetric(barn.latest_reading.temperature_c, '°C')}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {t('dashboard.avgWindow24hValue', {
                              value: barn.avg_temperature_c !== null ? `${barn.avg_temperature_c.toFixed(1)}°C` : t('dashboard.noData'),
                            })}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white/80 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">{t('dashboard.humidity')}</p>
                          <p className="mt-2 text-xl font-semibold text-slate-900">
                            {formatMetric(barn.latest_reading.humidity_pct, '%')}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {t('dashboard.avgWindow24hValue', {
                              value: barn.avg_humidity_pct !== null ? `${barn.avg_humidity_pct.toFixed(1)}%` : t('dashboard.noData'),
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-[11px] text-slate-500">
                        <span>{t('dashboard.lastReadingAt', { value: formatTime(barn.latest_reading.timestamp || barn.last_seen) })}</span>
                        <span>{t('dashboard.readingCount', { count: barn.data_points })}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div className="surface-overlay absolute bottom-4 right-4 z-20 rounded-full px-3 py-1 text-[11px] text-gray-500">
              {t('dashboard.farmLayoutSource')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeatmapChart;
