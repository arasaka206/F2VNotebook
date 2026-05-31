import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? t('theme.switchToDark') : t('theme.switchToLight')}
      title={isLight ? t('theme.switchToDark') : t('theme.switchToLight')}
      className={`inline-flex items-center gap-2 rounded-lg border border-farm-border bg-farm-card px-3 py-2 text-sm font-semibold text-farm-text transition hover:border-farm-accent ${
        compact ? 'h-9 w-9 justify-center px-0' : ''
      }`}
    >
      <span aria-hidden="true">{isLight ? '☀' : '☾'}</span>
      {!compact && <span>{isLight ? t('theme.light') : t('theme.dark')}</span>}
    </button>
  );
};

export default ThemeToggle;
