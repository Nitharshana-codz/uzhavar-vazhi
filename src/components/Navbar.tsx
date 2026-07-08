'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', en: 'Home', ta: 'முகப்பு' },
  { href: '/dashboard', en: 'Dashboard', ta: 'டாஷ்போர்டு' },
  { href: '/msp', en: 'MSP', ta: 'MSP விலை' },
  { href: '/schemes', en: 'Schemes', ta: 'திட்டங்கள்' },
  { href: '/calculator', en: 'Calculator', ta: 'கணக்கீடு' },
  { href: '/weather', en: 'Weather', ta: 'வானிலை' },
  { href: '/chat', en: 'Chat', ta: 'உரையாடல்' },
];

export function Navbar() {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-straw">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
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
        </Link>

        <div className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 min-w-0 flex-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-2 border-b-2 text-sm xl:text-base leading-tight transition-all ${
                  active
                    ? 'text-turmeric border-turmeric'
                    : 'text-soil border-transparent hover:text-turmeric'
                }`}
              >
                <span className="block font-medium">{link.en}</span>
                <span className="block font-tamil text-xs xl:text-sm text-soil/60">{link.ta}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

          <motion.button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="lg:hidden w-10 h-10 rounded-lg border border-straw bg-white flex items-center justify-center text-soil"
            whileTap={{ scale: 0.94 }}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden border-t border-straw bg-cream px-4 py-3"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg border px-3 py-2 ${
                    active
                      ? 'border-turmeric bg-turmeric-light text-turmeric'
                      : 'border-straw bg-white text-soil'
                  }`}
                >
                  <span className="block text-sm font-semibold">{link.en}</span>
                  <span className="block font-tamil text-xs text-soil/60">{link.ta}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
