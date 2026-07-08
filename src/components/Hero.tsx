'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calculator, Cloud, FileText, MessageCircle, Shield, TrendingUp } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Check Eligibility', titleTa: 'தகுதி சரிபார்', href: '/dashboard', color: 'bg-paddy-light text-paddy' },
  { icon: TrendingUp, title: 'MSP Prices', titleTa: 'MSP விலை', href: '/msp', color: 'bg-turmeric-light text-turmeric' },
  { icon: Shield, title: 'Govt Schemes', titleTa: 'அரசு திட்டங்கள்', href: '/schemes', color: 'bg-paddy-light text-paddy' },
  { icon: Calculator, title: 'Loan Calculator', titleTa: 'கடன் கணக்கீடு', href: '/calculator', color: 'bg-turmeric-light text-turmeric' },
  { icon: Cloud, title: 'Weather', titleTa: 'வானிலை', href: '/weather', color: 'bg-paddy-light text-paddy' },
  { icon: MessageCircle, title: 'Ask AI', titleTa: 'AI கேளுங்கள்', href: '/chat', color: 'bg-turmeric-light text-turmeric' },
];

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-cream py-10 sm:py-16">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <pattern id="wheat-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M5 18 C5 18 2 15 2 10 C2 8 3 6 5 7 C5.5 7.5 6.5 9 7 11 M7 11 C7 9 8 7 10 6 C10 6 11 8 7 11" stroke="#E8D5B0" strokeWidth="0.5" fill="none" />
              <path d="M15 5 C15 5 18 8 18 13 C18 15 17 17 15 16 C14.5 15.5 13.5 14 13 12 M13 12 C13 14 12 16 10 17 C10 17 9 15 13 12" stroke="#E8D5B0" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wheat-pattern)" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-6xl font-semibold text-soil mb-3 leading-tight"
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-xl sm:text-2xl lg:text-4xl text-paddy font-tamil mb-4"
        >
          {t('hero.titleTamil')}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm sm:text-base text-soil/60"
        >
          {t('hero.trust')}
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link href={feature.href} key={feature.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl border border-straw shadow-sm p-6 min-h-[160px] flex flex-col items-center justify-center"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-soil text-lg">{feature.title}</h3>
                  <p className="font-tamil text-sm text-soil/60 mt-1">{feature.titleTa}</p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
