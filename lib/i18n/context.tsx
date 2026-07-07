'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { translations, Language } from './translations';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
