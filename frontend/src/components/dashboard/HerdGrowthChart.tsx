import React from 'react';

// Minimal SVG placeholder chart – replace with Recharts/Chart.js in production
const HerdGrowthChart: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const growthData = [18, 20, 22, 21, 24];
  const feedData = [3.2, 3.0, 2.9, 3.1, 2.8];

  const maxGrowth = Math.max(...growthData);
  const chartH = 80;
  const chartW = 300;
  const padX = 30;

  const xStep = (chartW - padX * 2) / (months.length - 1);

  const growthPoints = growthData
    .map((v, i) => `${padX + i * xStep},${chartH - (v / maxGrowth) * chartH * 0.9}`)
    .join(' ');

  const feedPoints = feedData
    .map((v, i) => `${padX + i * xStep},${chartH - (v / 4.0) * chartH * 0.7}`)
    .join(' ');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-white">Herd Growth vs Feed Conversion</p>
          <p className="text-xs text-gray-400">Last 5 months · Farm-001</p>
        </div>
        <span className="text-2xl">📉</span>
      </div>

      <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full h-28">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <line
            key={pct}
            x1={padX}
            y1={chartH - (pct / 100) * chartH * 0.9}
            x2={chartW - padX}
            y2={chartH - (pct / 100) * chartH * 0.9}
            stroke="#253347"
            strokeWidth="1"
          />
        ))}

        {/* Growth line */}
        <polyline fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" points={growthPoints} />
        {growthData.map((v, i) => (
          <circle key={i} cx={padX + i * xStep} cy={chartH - (v / maxGrowth) * chartH * 0.9} r="3.5" fill="#22c55e" />
        ))}

        {/* Feed conversion line */}
        <polyline fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 2" points={feedPoints} />
        {feedData.map((v, i) => (
          <circle key={i} cx={padX + i * xStep} cy={chartH - (v / 4.0) * chartH * 0.7} r="3" fill="#f59e0b" />
        ))}

        {/* X axis labels */}
        {months.map((m, i) => (
          <text key={m} x={padX + i * xStep} y={chartH + 15} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {m}
          </text>
        ))}
      </svg>

      <div className="flex gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-farm-accent inline-block rounded" />
          <span className="text-[10px] text-gray-400">Herd Size</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-farm-warn inline-block rounded" style={{ borderTop: '2px dashed #f59e0b' }} />
          <span className="text-[10px] text-gray-400">Feed Conv.</span>
        </div>
      </div>
    </div>
  );
};

export default HerdGrowthChart;
