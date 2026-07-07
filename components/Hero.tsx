'use client';

import { motion } from 'framer-motion';

function WheatPattern() {
  return (
    <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none select-none">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="wheat-pattern-new" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <g fill="currentColor" className="text-turmeric">
              <path d="M10 5 Q15 10 10 15 Q5 10 10 5 Z" />
              <path d="M10 15 Q15 20 10 25 Q5 20 10 15 Z" />
              <path d="M10 25 Q15 30 10 35 Q5 30 10 25 Z" />
              <line x1="10" y1="5" x2="10" y2="35" stroke="currentColor" strokeWidth="0.8" />
              
              <path d="M40 35 Q45 40 40 45 Q35 40 40 35 Z" />
              <path d="M40 45 Q45 50 40 55 Q35 50 40 45 Z" />
              <line x1="40" y1="35" x2="40" y2="55" stroke="currentColor" strokeWidth="0.8" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wheat-pattern-new)" />
      </svg>
    </div>
  );
}

function WaveDivider() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] transform rotate-180">
      <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V120H0V56.44Z"
          fill="#FDF6EC"
        />
      </svg>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative bg-cream pt-10 pb-24 overflow-hidden border-b border-straw/30">
      <WheatPattern />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-semibold text-soil leading-tight"
        >
          Know your rights. Get your loan.
        </motion.h2>

        {/* Tamil Below Heading */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl sm:text-2xl text-paddy font-tamil mt-3 font-semibold"
        >
          உங்கள் உரிமைகளை அறியுங்கள். உங்கள் கடனை பெறுங்கள்.
        </motion.p>

        {/* Trust Line with dot separators */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-soil/60 mt-6 font-medium flex items-center justify-center flex-wrap gap-x-2.5 gap-y-1.5"
        >
          <span>Covering all 38 districts</span>
          <span className="text-turmeric text-lg select-none">•</span>
          <span>12+ schemes</span>
          <span className="text-turmeric text-lg select-none">•</span>
          <span>Free forever</span>
        </motion.p>
      </div>

      <WaveDivider />
    </section>
  );
}
