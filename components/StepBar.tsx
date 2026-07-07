'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StepBarProps {
  currentStep: number;
}

export function StepBar({ currentStep }: StepBarProps) {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const steps = [
    { en: 'Your farm details', ta: 'விவசாய விவரங்கள்' },
    { en: 'Eligibility results', ta: 'தகுதி முடிவுகள்' },
    { en: 'Your profile', ta: 'சுயவிவர அறிக்கை' },
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="w-full bg-cream py-6 px-4 border-b border-straw/20">
      <div className="max-w-2xl mx-auto">
        {/* Desktop Layout (hidden on mobile, starts showing on sm) */}
        <div className="hidden sm:flex items-center justify-between relative">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isDone = stepNum < currentStep;
            const isPending = stepNum > currentStep;

            return (
              <div key={idx} className="flex flex-col items-center flex-1 relative">
                {/* Connecting Line (drawn to the right of steps 1 and 2) */}
                {idx < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-[20px] h-[3px] bg-straw rounded-full overflow-hidden z-0">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: isDone ? '100%' : '0%' }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-paddy"
                    />
                  </div>
                )}

                {/* Circle Button */}
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                      isDone
                        ? 'bg-paddy text-white'
                        : isActive
                        ? 'bg-turmeric text-white shadow-md shadow-turmeric/20 ring-4 ring-turmeric-light'
                        : 'bg-straw text-soil/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isDone ? <Check className="w-5 h-5 stroke-[2.5]" /> : stepNum}
                  </motion.div>

                  {/* Label below circle */}
                  <div className="mt-2.5 text-center px-1">
                    <p
                      className={`text-xs font-semibold transition-colors duration-300 ${
                        isActive ? 'text-turmeric' : isDone ? 'text-paddy' : 'text-soil/50'
                      }`}
                    >
                      {step.en}
                    </p>
                    <p
                      className={`text-[10px] font-tamil transition-colors duration-300 mt-0.5 ${
                        isActive ? 'text-turmeric' : isDone ? 'text-paddy' : 'text-soil/40'
                      }`}
                    >
                      {step.ta}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Layout (shown only on mobile < 640px) */}
        <div className="flex sm:hidden flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold text-soil/50 uppercase tracking-wider">
            {isTamil ? `படி ${currentStep} / 3` : `Step ${currentStep} of 3`}
          </p>
          <h3 className="text-base font-bold text-soil mt-1 font-sans">
            {currentStepData.en}
          </h3>
          <p className="text-sm font-semibold text-paddy font-tamil mt-0.5">
            {currentStepData.ta}
          </p>
        </div>
      </div>
    </div>
  );
}
