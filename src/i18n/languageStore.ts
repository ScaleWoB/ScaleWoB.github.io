import { createContext } from 'react';
import { Language, TranslationKey } from './translations';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);
