import { createContext, useContext } from 'react';

export interface Language {
  lang: 'en' | 'ta';
  setLang: (lang: 'en' | 'ta') => void;
  t: Record<string, any>;
}

export const LanguageContext = createContext<Language | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
