'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-straw">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <path
                d="M20 35 C20 35 8 28 8 16 C8 12 11 8 16 10 C17 11 19 14 20 16 C21 14 23 11 24 10 C29 8 32 12 32 16 C32 28 20 35 20 35"
                fill="#D4882A"
                className="drop-shadow-sm"
              />
              <path d="M20 16 L20 5" stroke="#D4882A" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M17 8 L20 5 L23 8"
                stroke="#D4882A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-semibold text-soil leading-tight">
              {t('app.name')}
            </span>
            <span className="text-xs sm:text-sm text-paddy font-tamil leading-tight">
              {t('app.nameTamil')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-straw/30 rounded-full p-1">
          <motion.button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
              !isTamil ? 'bg-turmeric text-white shadow-sm' : 'text-soil hover:bg-straw/50'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            EN
          </motion.button>
          <motion.button
            onClick={() => i18n.changeLanguage('ta')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full font-tamil transition-all ${
              isTamil ? 'bg-turmeric text-white shadow-sm' : 'text-soil hover:bg-straw/50'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            தமிழ்
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
