import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  title: string;
  onNavigate?: (page: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onNavigate }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    await logout();
    if (onNavigate) {
      onNavigate('landing');
    }
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
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-farm-border/50 transition-colors"
          >
            <div className="w-8 h-8 bg-farm-accent rounded-full flex items-center justify-center text-farm-bg font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase() || '👤'}
            </div>
            <span className="text-sm text-gray-300 hidden sm:inline">{user?.email?.split('@')[0]}</span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-farm-card border border-farm-border rounded-lg shadow-xl z-50">
              <div className="px-4 py-3 border-b border-farm-border">
                <p className="text-xs text-gray-400">{t('auth.email')}</p>
                <p className="text-sm text-white truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('profile');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-farm-border/50 transition-colors"
              >
                👤 {t('app.profile') || 'Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-farm-border/50 transition-colors border-t border-farm-border"
              >
                🚪 {t('auth.logout') || 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
