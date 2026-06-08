import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './languageStore';
import {
  interpolate,
  Language,
  TranslationKey,
  translations,
} from './translations';

const STORAGE_KEY = 'scalewob-language';

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'zh') {
    return stored;
  }

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKey, values: Record<string, string | number> = {}) => {
      const fallback = translations.en[key];
      return interpolate(translations[language][key] || fallback, values);
    },
    [language]
  );

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = t('app.title');
  }, [language, t]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
