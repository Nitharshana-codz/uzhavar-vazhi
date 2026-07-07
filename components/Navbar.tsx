'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function Navbar() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = (lang: 'en' | 'ta') => {
    i18n.changeLanguage(lang);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-straw">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Side: Logo and Titles */}
        <div className="flex items-center gap-3">
          {/* Wheat SVG in turmeric color */}
          <svg
            className="w-8 h-8 text-turmeric"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 22 22 2" />
            <path d="M8 18c-1-1-1.5-2.5-1.5-4 0-1.5.5-3 1.5-4 1 1 2.5 1.5 4 1.5 1.5 0 3-.5 4-1.5" />
            <path d="M14 12c-1-1-1.5-2.5-1.5-4 0-1.5.5-3 1.5-4 1 1 2.5 1.5 4 1.5 1.5 0 3-.5 4-1.5" />
          </svg>
          <div>
            <h1 className="text-lg font-semibold text-soil leading-none font-sans">
              Uzhavar Vazhi
            </h1>
            <p className="text-xs font-semibold text-paddy font-tamil mt-0.5">
              உழவர் வழி
            </p>
          </div>
        </div>

        {/* Right Side: Language Toggle Pills */}
        <div className="flex bg-straw/20 p-1 rounded-full border border-straw/50">
          <motion.button
            onClick={() => toggleLanguage('en')}
            className={`px-4 py-1.5 text-xs font-semibold transition-all ${
              currentLang === 'en'
                ? 'bg-turmeric text-white rounded-full shadow-sm'
                : 'text-soil hover:bg-straw/50 rounded-full'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            EN
          </motion.button>
          <motion.button
            onClick={() => toggleLanguage('ta')}
            className={`px-4 py-1.5 text-xs font-semibold font-tamil transition-all ${
              currentLang === 'ta'
                ? 'bg-turmeric text-white rounded-full shadow-sm'
                : 'text-soil hover:bg-straw/50 rounded-full'
            }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            தமிழ்
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
