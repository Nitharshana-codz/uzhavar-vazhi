'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepBarProps {
  currentStep: number;
}

export function StepBar({ currentStep }: StepBarProps) {
  const { t } = useTranslation();
  const steps = [
    { num: 1, enKey: 'steps.step1.en', taKey: 'steps.step1.ta' },
    { num: 2, enKey: 'steps.step2.en', taKey: 'steps.step2.ta' },
    { num: 3, enKey: 'steps.step3.en', taKey: 'steps.step3.ta' },
  ];

  return (
    <div className="bg-cream py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="hidden sm:flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.num;
            const isDone = currentStep > step.num;

            return (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isDone ? '#3B6D11' : isActive ? '#D4882A' : '#E8D5B0',
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-sm"
                  >
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    ) : (
                      <span className={isActive ? 'text-white' : 'text-soil/60'}>{step.num}</span>
                    )}
                  </motion.div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${isActive ? 'text-turmeric' : 'text-soil'}`}
                    >
                      {t(step.enKey)}
                    </p>
                    <p className="text-xs text-soil/60 font-tamil">{t(step.taKey)}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-1 bg-straw rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isDone ? '100%' : '0%' }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-paddy"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sm:hidden text-center">
          <p className="text-sm text-soil/60 mb-2">
            {t('steps.progress', { current: currentStep, total: 3 })}
          </p>
          <p className="font-medium text-turmeric">{t(steps[currentStep - 1].enKey)}</p>
          <p className="text-sm text-soil/60 font-tamil">{t(steps[currentStep - 1].taKey)}</p>
        </div>
      </div>
    </div>
  );
}
