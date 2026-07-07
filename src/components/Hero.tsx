'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-cream py-10 sm:py-14">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern
              id="wheat-pattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M5 18 C5 18 2 15 2 10 C2 8 3 6 5 7 C5.5 7.5 6.5 9 7 11 M7 11 C7 9 8 7 10 6 C10 6 11 8 7 11"
                stroke="#E8D5B0"
                strokeWidth="0.5"
                fill="none"
              />
              <path
                d="M15 5 C15 5 18 8 18 13 C18 15 17 17 15 16 C14.5 15.5 13.5 14 13 12 M13 12 C13 14 12 16 10 17 C10 17 9 15 13 12"
                stroke="#E8D5B0"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wheat-pattern)" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-soil mb-2 leading-tight"
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-xl sm:text-2xl text-paddy font-tamil mb-4"
        >
          {t('hero.titleTamil')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm text-soil/60"
        >
          {t('hero.trust')}
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12">
        <svg viewBox="0 0 1440 48" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0 48 L0 24 Q240 0 720 12 Q1200 0 1440 24 L1440 48 Z"
            fill="#FDF6EC"
          />
          <path
            d="M0 48 L0 24 Q240 0 720 12 Q1200 0 1440 24 L1440 48 Z"
            fill="white"
            fillOpacity="0.5"
            transform="translate(0, 4)"
          />
        </svg>
      </div>
    </section>
  );
}
