import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

// Các tọa độ mặc định để zoom nhanh
const REGIONS = {
  Vietnam: { lat: 14.0583, lng: 108.2772, zoom: 6 },
  Hanoi: { lat: 21.0285, lng: 105.8542, zoom: 11 },
  HCMC: { lat: 10.8231, lng: 106.6297, zoom: 11 },
  DaNang: { lat: 16.0544, lng: 108.2022, zoom: 12 }
};

// Component tiện ích để di chuyển tâm bản đồ khi chọn vùng
const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const GeoHeatmapChart: React.FC = () => {
  const { t } = useTranslation();
  const [points, setPoints] = useState<any[]>([]);
  const [region, setRegion] = useState<keyof typeof REGIONS>('Vietnam');
  const [mapCenter, setMapCenter] = useState<[number, number]>([REGIONS.Vietnam.lat, REGIONS.Vietnam.lng]);
  const [mapZoom, setMapZoom] = useState(REGIONS.Vietnam.zoom);
  const [loading, setLoading] = useState(false);

  const loadGeoData = async (selectedRegion: string) => {
    setLoading(true);
    try {
      // Gọi endpoint lấy dữ liệu địa lý mới
      const response = await api.get(`/api/heatmap/geo-data?region=${selectedRegion}&data_type=health`);
      setPoints(response.data.points || []);
    } catch (err) {
      console.error("Failed to load geo heatmap data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGeoData(region);
  }, [region]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as keyof typeof REGIONS;
    setRegion(selected);
    setMapCenter([REGIONS[selected].lat, REGIONS[selected].lng]);
    setMapZoom(REGIONS[selected].zoom);
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setMapCenter([latitude, longitude]);
      setMapZoom(13); // Zoom gần hơn khi là vị trí cá nhân
    }, () => {
      alert('Unable to retrieve your location');
    });
  };

  const getCssColor = (intensity: number) => {
    if (intensity >= 75) return '#ef4444'; // Đỏ
    if (intensity >= 50) return '#f59e0b'; // Cam
    if (intensity >= 25) return '#10b981'; // Xanh lá
    return '#3b82f6'; // Xanh biển
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4 shadow-lg w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-200">{t('dashboard.epidemicGeoHeatmap')}</h3>
        <div className="flex items-center gap-3">
          <select 
            value={region} 
            onChange={handleRegionChange}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1 text-sm outline-none"
          >
            <option value="Vietnam">{t('dashboard.wholeVietnam')}</option>
            <option value="Hanoi">{t('dashboard.hanoiCity')}</option>
            <option value="HCMC">{t('dashboard.hoChiMinhCity')}</option>
            <option value="DaNang">{t('dashboard.daNang')}</option>
          </select>

          <button 
            onClick={handleMyLocation}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
          >
            📍 {t('dashboard.myLocation')}
          </button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-700 relative z-0" style={{ height: '400px' }}>
        {loading && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70">
             <span className="text-white animate-pulse">Loading Map Data...</span>
           </div>
        )}
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%', backgroundColor: '#1f2937' }}
          scrollWheelZoom={true} // Bật tính năng zoomable
        >
          {/* Lớp hiển thị bản đồ Dark Mode */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Vẽ các điểm heatmap dưới dạng Circle Marker */}
          {points.map((p, idx) => (
            <CircleMarker
              key={idx}
              center={[p.latitude, p.longitude]}
              radius={p.intensity / 5} // Scale size theo intensity
              pathOptions={{
                fillColor: getCssColor(p.intensity),
                fillOpacity: 0.6,
                color: 'transparent' // Bỏ viền
              }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default GeoHeatmapChart;