import React, { useEffect, useRef, useState } from 'react';
import { fetchHeatmapData, fetchHeatmapSummary, generateHeatmapFromSensors, createHeatmapOverlayImage } from '../../services/farm2vets';
import api from '../../services/api';
import type { HeatmapData, HeatmapSummary } from '../../types';

interface HeatmapProps {
  barnId?: string;
  dataType?: 'health' | 'temperature' | 'humidity';
  width?: number;
  height?: number;
}

const DEFAULT_LONGITUDE = -93.0977;
const DEFAULT_LATITUDE = 41.8781;
const BARN_SPREAD = 0.05;

const HeatmapChart: React.FC<HeatmapProps> = ({
  barnId = 'barn-1',
  dataType = 'health',
  width = 400,
  height = 300
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [heatmapImageUrl, setHeatmapImageUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState<HeatmapSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [generatingReal, setGeneratingReal] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string>('Waiting for heatmap data...');
  const previousImageUrl = useRef<string | null>(null);

  const bounds = {
    Lat1: DEFAULT_LATITUDE + BARN_SPREAD / 2,
    Lat2: DEFAULT_LATITUDE - BARN_SPREAD / 2,
    Lon1: DEFAULT_LONGITUDE - BARN_SPREAD / 2,
    Lon2: DEFAULT_LONGITUDE + BARN_SPREAD / 2
  };

  const mapPointToLatLon = (x: number, y: number) => {
    const normalizedX = (x - 50) / 100;
    const normalizedY = (y - 50) / 100;
    return {
      lat: DEFAULT_LATITUDE + normalizedY * BARN_SPREAD,
      lon: DEFAULT_LONGITUDE + normalizedX * BARN_SPREAD
    };
  };

  useEffect(() => {
    return () => {
      if (previousImageUrl.current) {
        URL.revokeObjectURL(previousImageUrl.current);
      }
    };
  }, []);

  const buildDataPointsString = (data: HeatmapData) => {
    return data.grid_data
      .map((point) => {
        const coords = mapPointToLatLon(point.x, point.y);
        return `${coords.lat},${coords.lon},${point.intensity}`;
      })
      .join(',');
  };

  const generateHeatmapImage = async (data: HeatmapData) => {
    if (!data?.grid_data?.length) {
      setHeatmapImageUrl(null);
      setDebugMessage('No heatmap points available to render.');
      return;
    }

    setDebugMessage('Generating heatmap image from HeatmapAPI...');

    const payload = {
      Width: width,
      Height: height,
      Lat1: bounds.Lat1,
      Lat2: bounds.Lat2,
      Lon1: bounds.Lon1,
      Lon2: bounds.Lon2,
      DistanceMultiple: 18,
      UseAverage: false,
      ColorPalette: '4',
      DataPoints: buildDataPointsString(data)
    };

    try {
      const blob = await createHeatmapOverlayImage(payload);
      const imageUrl = URL.createObjectURL(blob);
      if (previousImageUrl.current) {
        URL.revokeObjectURL(previousImageUrl.current);
      }
      previousImageUrl.current = imageUrl;
      setHeatmapImageUrl(imageUrl);
      setDebugMessage(`Heatmap image generated with ${data.grid_data.length} points.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Heatmap image generation failed.';
      setError(message);
      setDebugMessage('Heatmap image generation failed.');
    }
  };

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const [data, summaryData] = await Promise.all([
        fetchHeatmapData(barnId, dataType),
        fetchHeatmapSummary(barnId)
      ]);
      setHeatmapData(data);
      setSummary(summaryData);
      setError(null);
      setDebugMessage(`Loaded ${data.grid_data.length} points`);
      await generateHeatmapImage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load heatmap data');
      setHeatmapData(null);
      setSummary(null);
      setHeatmapImageUrl(null);
      setDebugMessage('Failed to load heatmap data.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDemo = async () => {
    try {
      setGeneratingDemo(true);
      const response = await api.post(`/heatmap/demo-data/${barnId}`);
      setDebugMessage(`Demo data created: ${response.data.points_created} points`);
      await loadHeatmapData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate demo data');
      setDebugMessage('Demo data generation failed.');
    } finally {
      setGeneratingDemo(false);
    }
  };

  const handleGenerateReal = async () => {
    try {
      setGeneratingReal(true);
      const result = await generateHeatmapFromSensors(barnId);
      if (result.points_created === 0) {
        setError('No sensor data available for this barn. Please ensure sensors are connected.');
      } else {
        setError(null);
        await loadHeatmapData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate heatmap from sensors');
    } finally {
      setGeneratingReal(false);
    }
  };

  useEffect(() => {
    loadHeatmapData();
  }, [barnId, dataType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-900 rounded-lg">
        <span className="text-gray-400 animate-pulse">Loading heatmap...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-900 rounded-lg">
        <span className="text-red-400">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-200">
          Heatmap - {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGenerateReal}
            disabled={generatingReal}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs rounded transition"
            title="Generate from sensor readings"
          >
            {generatingReal ? 'Loading...' : 'From Sensors'}
          </button>
          <button
            onClick={handleGenerateDemo}
            disabled={generatingDemo}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs rounded transition"
            title="Generate sample data for testing"
          >
            {generatingDemo ? 'Generating...' : 'Demo Data'}
          </button>
          <button
            onClick={loadHeatmapData}
            disabled={loading}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 text-white text-xs rounded transition"
            title="Refresh current heatmap data"
          >
            Refresh
          </button>
          <span className="text-xs text-gray-500">{barnId}</span>
        </div>
      </div>

      <div className="relative border border-gray-700 rounded overflow-hidden bg-gray-800" style={{ width: `${width}px`, height: `${height}px` }}>
        {heatmapImageUrl ? (
          <img
            src={heatmapImageUrl}
            alt="Heatmap overlay"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            No heatmap image available yet.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>Heatmap image: {heatmapImageUrl ? 'ready' : 'none'}</span>
        <span>Loaded points: {heatmapData?.grid_data?.length ?? 0}</span>
      </div>
      <div className="text-xs text-yellow-300 px-1">
        {debugMessage}
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-700">
          <div className="text-center">
            <span className="text-xs text-gray-500">Min</span>
            <p className="text-sm font-semibold text-blue-400">{summary.min_intensity.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Avg</span>
            <p className="text-sm font-semibold text-green-400">{summary.avg_intensity.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Max</span>
            <p className="text-sm font-semibold text-red-400">{summary.max_intensity.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Points</span>
            <p className="text-sm font-semibold text-gray-300">{summary.data_points}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
          <span className="text-gray-400">Low (0-25)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
          <span className="text-gray-400">Normal (25-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
          <span className="text-gray-400">Elevated (50-75)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-gray-400">Critical (75-100)</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
