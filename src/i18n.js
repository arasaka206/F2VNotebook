// i18n setup

import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    welcome: 'Welcome',
    selectLanguage: 'Select Language',
    // ... more translations
  },
  vi: {
    welcome: 'Chào mừng',
    selectLanguage: 'Chọn ngôn ngữ',
    // ... more translations
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
