import { useState, useMemo, ReactNode } from 'react';
import { LanguageContext } from './context';
import en from './en.json';
import ta from './ta.json';

interface LanguageProviderProps {
  children: ReactNode;
  defaultLang?: 'en' | 'ta';
}

export function LanguageProvider({ children, defaultLang = 'en' }: LanguageProviderProps) {
  const [lang, setLang] = useState<'en' | 'ta'>(defaultLang);

  const translations = useMemo(
    () => ({
      en,
      ta,
    }),
    []
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: translations[lang],
    }),
    [lang, translations]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
