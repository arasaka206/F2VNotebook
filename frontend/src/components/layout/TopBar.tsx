import React from 'react';

interface TopBarProps {
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-farm-border bg-farm-card">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">Farm2Vets · AI-Powered Livestock Management</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <div className="relative">
          <button className="w-9 h-9 bg-farm-border rounded-full flex items-center justify-center hover:bg-farm-border/80 transition-colors">
            <span className="text-lg">🔔</span>
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
            3
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
