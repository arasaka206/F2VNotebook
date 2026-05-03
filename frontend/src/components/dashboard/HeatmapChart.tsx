import React, { useEffect, useState } from 'react';
import { fetchHeatmapData, fetchHeatmapSummary, generateHeatmapFromSensors } from '../../services/farm2vets';
import api from '../../services/api';
import type { HeatmapPoint, HeatmapSummary } from '../../types';

interface HeatmapProps {
  barnId?: string;
  dataType?: 'health' | 'temperature' | 'humidity';
  width?: number | string;
  height?: number;
}

// Fallback mock data if Backend is empty
const MOCK_POINTS = [
  { x: 20, y: 25, intensity: 35 },
  { x: 50, y: 50, intensity: 85 },
  { x: 75, y: 80, intensity: 45 },
  { x: 30, y: 70, intensity: 60 },
  { x: 80, y: 20, intensity: 20 },
  { x: 60, y: 65, intensity: 75 },
];

const HeatmapChart: React.FC<HeatmapProps> = ({
  barnId = 'barn-1',
  dataType = 'health',
  width = '100%',
  height = 300
}) => {
  const [summary, setSummary] = useState<HeatmapSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [generatingReal, setGeneratingReal] = useState(false);
  
  const [renderPoints, setRenderPoints] = useState<HeatmapPoint[]>([]); 
  const [debugMessage, setDebugMessage] = useState<string>('Loading data...');

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [heatmapData, summaryData] = await Promise.all([
        fetchHeatmapData(barnId, dataType as 'health' | 'temperature' | 'humidity').catch(() => ({ barn_id: barnId, data_type: dataType as 'health' | 'temperature' | 'humidity', grid_data: [] as HeatmapPoint[], timestamp: '' })),
        fetchHeatmapSummary(barnId).catch(() => null)
      ]);
      
      const points = heatmapData?.grid_data || [];
      
      if (points.length === 0) {
        setRenderPoints(MOCK_POINTS);
        setDebugMessage('Backend is empty. Displaying mock data.');
      } else {
        setRenderPoints(points);
        setDebugMessage(`Successfully loaded ${points.length} data points.`);
      }

      setSummary(summaryData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error while loading heatmap');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDemo = async () => {
    try {
      setGeneratingDemo(true);
      setDebugMessage('Generating demo data on backend...');
      await api.post(`/heatmap/demo-data/${barnId}`);
      await loadHeatmapData();
    } catch (err) {
      console.error(err);
      setError('Error creating demo data.');
    } finally {
      setGeneratingDemo(false);
    }
  };

  const handleGenerateReal = async () => {
    try {
      setGeneratingReal(true);
      setDebugMessage('Analyzing sensor data...');
      await generateHeatmapFromSensors(barnId);
      await loadHeatmapData();
    } catch (err) {
      console.error(err);
      setError('Error extracting data from sensors.');
    } finally {
      setGeneratingReal(false);
    }
  };

  useEffect(() => {
    loadHeatmapData();
  }, [barnId, dataType]);

  const getCssColor = (intensity: number) => {
    if (intensity >= 75) return 'rgba(239, 68, 68, 0.85)';
    if (intensity >= 50) return 'rgba(245, 158, 11, 0.85)';
    if (intensity >= 25) return 'rgba(16, 185, 129, 0.85)';
    return 'rgba(59, 130, 246, 0.85)';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-900 rounded-lg" style={{ height: height + 100 }}>
        <span className="text-gray-400 animate-pulse">Loading heatmap...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-900 rounded-lg" style={{ height: height + 100 }}>
        <span className="text-red-400">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4 shadow-lg" style={{ width: typeof width === 'number' ? `${width}px` : width }}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-200">
          Heatmap - {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleGenerateReal} disabled={generatingReal} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition">
            From Sensors
          </button>
          <button onClick={handleGenerateDemo} disabled={generatingDemo} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition">
            Demo Data
          </button>
          <button onClick={loadHeatmapData} disabled={loading} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition">
            Refresh
          </button>
        </div>
      </div>

      <div className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-800" style={{ width: '100%', height: `${height}px` }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {renderPoints.map((p, idx) => {
          const size = 100 + (p.intensity * 0.5); 
          return (
            <div
              key={idx}
              className="absolute rounded-full pointer-events-none mix-blend-screen transition-all duration-700 ease-in-out"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${size}px`,
                height: `${size}px`,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${getCssColor(p.intensity)} 0%, transparent 65%)`,
                filter: 'blur(8px)'
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span className="text-yellow-400">{debugMessage}</span>
        <span>Loaded points: {renderPoints.length}</span>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-700">
          <div className="text-center">
            <span className="text-xs text-gray-500">Min</span>
            <p className="text-sm font-semibold text-blue-400">{summary.min_intensity?.toFixed(1) || 0}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Avg</span>
            <p className="text-sm font-semibold text-green-400">{summary.avg_intensity?.toFixed(1) || 0}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Max</span>
            <p className="text-sm font-semibold text-red-400">{summary.max_intensity?.toFixed(1) || 0}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Data Points</span>
            <p className="text-sm font-semibold text-gray-300">{summary.data_points || 0}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 text-xs border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-gray-400">Low (0-25)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-gray-400">Normal (25-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-gray-400">Elevated (50-75)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-gray-400">Critical (75-100)</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;