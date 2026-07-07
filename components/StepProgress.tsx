'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/context';
import { Check } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const { lang } = useLanguage();

  const steps = [
    { en: 'Your Details', ta: 'விவரங்கள்' },
    { en: 'Eligibility', ta: 'தகுதி' },
    { en: 'Your Profile', ta: 'சுயவிவரம்' },
  ];

  return (
    <div className="w-full bg-cream py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Mobile view */}
        <div className="md:hidden text-center">
          <p className="text-sm text-soil/70 mb-2">
            Step {currentStep} of 3
          </p>
          <p className="font-medium text-soil">
            {lang === 'en' ? steps[currentStep - 1].en : (
              <span className="font-tamil">{steps[currentStep - 1].ta}</span>
            )}
          </p>
        </div>

        {/* Desktop view */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;

            return (
              <div key={stepNum} className="flex items-center flex-1">
                {/* Step Circle and Line Container */}
                <div className="flex items-center flex-1">
                  {/* Circle */}
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      isCompleted
                        ? 'bg-paddy text-white'
                        : isActive
                        ? 'bg-turmeric text-white'
                        : 'bg-straw text-soil/50'
                    }`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      stepNum
                    )}
                  </motion.div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="h-1 flex-1 mx-2 bg-straw relative overflow-hidden">
                      <motion.div
                        className="h-full bg-paddy"
                        initial={{ width: '0%' }}
                        animate={{ width: isCompleted ? '100%' : '0%' }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  )}
                </div>

                {/* Label */}
                {index === steps.length - 1 && (
                  <div className="ml-2">
                    <p className={`text-sm ${isActive ? 'font-semibold text-turmeric' : 'text-soil/60'}`}>
                      {lang === 'en' ? step.en : <span className="font-tamil">{step.ta}</span>}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
