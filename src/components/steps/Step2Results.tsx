'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, AlertTriangle } from 'lucide-react';
import type { FarmerData } from '../../../app/page';
import districts from '@/data/districts.json';
import crops from '@/data/crops.json';
import { loadFarmerSession, type FarmerSessionData } from '@/lib/farmer-session';

interface Step2ResultsProps {
  farmerData: FarmerData;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Results({ farmerData, onNext, onBack }: Step2ResultsProps) {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const [sessionData, setSessionData] = useState<FarmerSessionData | null>(null);

  useEffect(() => {
    setSessionData(loadFarmerSession());
  }, []);

  const district = districts.find((d) => d.id === farmerData.district);
  const crop = crops.find((c) => c.id === farmerData.crop);
  const loans = sessionData?.eligibility?.loans ?? [];
  const insurance = sessionData?.eligibility?.insurance ?? [];
  const riskScore = sessionData?.riskData?.riskScore ?? 0;
  const riskLevel = sessionData?.riskData?.riskLevel ?? 'Medium';
  const advice = sessionData?.riskData?.advice ?? '';
  const cropMsp = sessionData?.cropMsp ?? crop?.msp ?? null;

  const maxLoanAmount = loans.length
    ? Math.max(...loans.map((loan) => loan.maxAmount ?? 0))
    : farmerData.landSize * 30000;

  const eligibleCount = loans.length + insurance.length;
  const eligibilityLevel =
    eligibleCount >= 3 ? 'high' : eligibleCount >= 1 ? 'medium' : 'low';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const badgeClasses =
    eligibilityLevel === 'high'
      ? 'bg-paddy-light text-paddy'
      : eligibilityLevel === 'medium'
        ? 'bg-amber-200 text-amber-800'
        : 'bg-red-200 text-red-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 pb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-paddy rounded-xl p-5 text-white mb-6 shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-lg font-semibold leading-snug">
              {farmerData.farmerName} ·{' '}
              <span className="font-tamil">{district?.ta}</span> ·{' '}
              <span className="font-tamil">{crop?.ta}</span> · {farmerData.landSize}{' '}
              {isTamil ? 'ஏக்கர்' : 'acres'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-white/70 text-xs tracking-wider font-bold">
              {t('results.eligibilityScore')}
            </p>
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-center font-bold shadow-md ${badgeClasses}`}
            >
              <div className="flex flex-col leading-none">
                <span className="text-xs uppercase font-bold">
                  {t(`results.eligibility.${eligibilityLevel}`)}
                </span>
                <span className="font-tamil text-[10px] mt-0.5">
                  {t(`results.eligibility.${eligibilityLevel}Ta`)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white rounded-xl border border-straw p-5 shadow-sm flex flex-col justify-between"
          variants={cardVariants}
        >
          <div>
            <h3 className="text-sm font-medium text-soil mb-0.5">{t('results.loans.title')}</h3>
            <p className="text-xs text-soil/60 font-tamil mb-3">{t('results.loans.titleTa')}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {loans.length > 0 ? (
                loans.map((loan) => (
                  <span
                    key={loan.name}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-paddy-light text-paddy"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isTamil && loan.tamilName ? loan.tamilName : loan.name}</span>
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'தகுதியான கடன் திட்டம் இல்லை' : 'No eligible loan schemes'}</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-soil/60 text-sm border-t border-straw/30 pt-3">
            {t('results.loans.maxAmount')}:{' '}
            <span className="text-xl font-bold text-paddy">
              ₹{maxLoanAmount.toLocaleString('en-IN')}
            </span>
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-straw p-5 shadow-sm"
          variants={cardVariants}
        >
          <h3 className="text-sm font-medium text-soil mb-0.5">{t('results.insurance.title')}</h3>
          <p className="text-xs text-soil/60 font-tamil mb-3">{t('results.insurance.titleTa')}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {insurance.length > 0 ? (
              insurance.map((item) => (
                <span
                  key={item.name}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-paddy-light text-paddy"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isTamil && item.tamilName ? item.tamilName : item.name}</span>
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isTamil ? 'தகுதியான காப்பீடு இல்லை' : 'No eligible insurance'}</span>
              </span>
            )}
          </div>
          {insurance[0] && (
            <p className="text-xs text-soil/60">{insurance[0].premiumRate}</p>
          )}
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-straw p-5 shadow-sm flex flex-col justify-between"
          variants={cardVariants}
        >
          <div>
            <h3 className="text-sm font-medium text-soil mb-0.5">{t('results.msp.title')}</h3>
            <p className="text-xs text-soil/60 font-tamil mb-3">{t('results.msp.titleTa')}</p>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-base font-bold text-soil">{crop?.en}</span>
              <span className="text-xs text-soil/60 font-tamil">({crop?.ta})</span>
            </div>
            {cropMsp ? (
              <p className="text-2xl font-bold text-paddy leading-none">
                ₹{cropMsp.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-soil/60 ml-1">
                  {isTamil ? t('results.msp.perQuintalTa') : t('results.msp.perQuintal')}
                </span>
              </p>
            ) : (
              <p className="text-sm text-soil/60 font-medium mt-1 font-tamil">
                {t('results.msp.noMsp')}
              </p>
            )}
          </div>
          <div className="border-t border-straw/30 pt-3 mt-4">
            <p className="text-[10px] text-soil/50">{t('results.msp.guaranteed')}</p>
            <p className="text-[10px] text-soil/40 font-tamil mt-0.5">
              {t('results.msp.guaranteedTa')}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-straw p-5 shadow-sm flex flex-col justify-between"
          variants={cardVariants}
        >
          <div>
            <h3 className="text-sm font-medium text-soil mb-0.5">{t('results.risk.title')}</h3>
            <p className="text-xs text-soil/60 font-tamil mb-3">{t('results.risk.titleTa')}</p>
            <div className="relative w-full h-3 bg-straw rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${riskScore}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-full rounded-full ${
                  riskScore <= 33
                    ? 'bg-paddy'
                    : riskScore <= 66
                      ? 'bg-amber-500'
                      : 'bg-terracotta'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-soil/50 mb-4">
              <span>
                {t('results.risk.low')}{' '}
                <span className="font-tamil">({t('results.risk.lowTa')})</span>
              </span>
              <span>
                {t('results.risk.high')}{' '}
                <span className="font-tamil">({t('results.risk.highTa')})</span>
              </span>
            </div>
          </div>
          <div className="border-t border-straw/30 pt-3">
            <p className="text-xs font-semibold text-soil">
              {riskLevel} — {riskScore}/100
            </p>
            <p className="text-xs text-soil/70 mt-1">{advice}</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="space-y-3">
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg font-semibold text-white bg-turmeric shadow-lg shadow-turmeric/30 hover:bg-turmeric/90 text-center"
        >
          {t('results.actions.next.en')} →
          <span className="block text-sm font-normal font-tamil mt-0.5">
            {t('results.actions.next.ta')}
          </span>
        </motion.button>

        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg font-semibold text-paddy border-2 border-paddy hover:bg-paddy-light text-center"
        >
          ← {t('results.actions.back.en')}{' '}
          <span className="font-tamil">— {t('results.actions.back.ta')}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
