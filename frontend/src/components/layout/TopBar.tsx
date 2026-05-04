import React from 'react';
import { useTranslation } from 'react-i18next';

interface TopBarProps {
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-farm-border bg-farm-card">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{t('topbar.subtitle')}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <button
          onClick={toggleLanguage}
          className="px-2 py-1 text-xs bg-farm-border rounded hover:bg-farm-border/80 transition-colors font-medium"
        >
          {i18n.language === 'en' ? 'EN' : 'VN'}
        </button>
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
