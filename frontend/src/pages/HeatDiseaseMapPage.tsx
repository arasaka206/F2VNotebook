import React from 'react';
import GeoHeatmapChart from '../components/dashboard/GeoHeatmapChart';
import HeatmapChart from '../components/dashboard/HeatmapChart';

const HeatDiseaseMapPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        <GeoHeatmapChart />
        <HeatmapChart barnId="barn-1" dataType="health" width="100%" height={340} />
      </div>
    </div>
  );
};

export default HeatDiseaseMapPage;
