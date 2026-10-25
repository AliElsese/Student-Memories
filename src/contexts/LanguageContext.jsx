import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en.js';
import { ar } from '../locales/ar.js';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('student_memories_lang') || 'en';
  });

  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';
  const translations = isRTL ? ar : en;

  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('student_memories_lang', language);
  }, [language, direction]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'ar') {
      setLanguageState(lang);
    }
  };

  const t = (key, fallback = '') => {
    return translations[key] ?? fallback ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        t,
        toggleLanguage,
        setLanguage,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
