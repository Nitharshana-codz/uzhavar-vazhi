'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import taTranslations from './ta.json';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: enTranslations },
      ta: { translation: taTranslations },
    },
    lng: 'ta',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
