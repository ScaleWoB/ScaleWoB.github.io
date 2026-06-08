import { useContext } from 'react';
import { LanguageContext } from './languageStore';

export const useI18n = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }

  return context;
};
