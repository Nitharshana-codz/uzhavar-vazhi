'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Info, Check, AlertTriangle } from 'lucide-react';
import { FarmerData } from './Step1Form';
import districts from '@/src/data/districts.json';
import crops from '@/src/data/crops.json';
import schemes from '@/src/data/schemes.json';
import riskMatrix from '@/src/data/riskMatrix.json';

interface Step2ResultsProps {
  farmerData: FarmerData;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Results({ farmerData, onNext, onBack }: Step2ResultsProps) {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const district = districts.find((d) => d.id === farmerData.district);
  const crop = crops.find((c) => c.id === farmerData.crop);
  
  // Find crop risk matrix data
  const cropRisk = (riskMatrix.crops as any)[farmerData.crop] || { risk: 'medium', riskScore: 50 };

  const eligibleLoanSchemes = schemes
    .filter((s) => s.type === 'loan')
    .map((s) => {
      const cropEligible = s.eligibleCrops?.includes(farmerData.crop) || s.eligibleCrops?.includes('All');
      const ownershipEligible = s.ownership?.includes(farmerData.ownership);
      const landSizeOk =
        farmerData.landSize >= (s.minLandSize || 0) &&
        (!s.maxLandSize || farmerData.landSize <= s.maxLandSize);
      const districtEligible = !s.districts || s.districts.includes(farmerData.district);

      const status: 'eligible' | 'check' | 'notEligible' =
        cropEligible && ownershipEligible && landSizeOk && districtEligible
          ? 'eligible'
          : cropEligible || ownershipEligible
          ? 'check'
          : 'notEligible';

      return { ...s, status };
    });

  const eligibleInsuranceSchemes = schemes
    .filter((s) => s.type === 'insurance')
    .map((s) => {
      const cropEligible = s.eligibleCrops?.includes(farmerData.crop) || s.eligibleCrops?.includes('All');
      const ownershipEligible = s.ownership?.includes(farmerData.ownership);
      const districtEligible = !s.districts || s.districts.includes(farmerData.district);
      const landSizeOk = farmerData.landSize >= (s.minLandSize || 0);

      const status: 'eligible' | 'check' | 'notEligible' =
        cropEligible && ownershipEligible && landSizeOk && districtEligible
          ? 'eligible'
          : cropEligible || ownershipEligible
          ? 'check'
          : 'notEligible';

      return { ...s, status };
    });

  // Calculate max loan amount based on land size and eligible schemes
  let maxLoanAmount = 0;
  const hasKcc = eligibleLoanSchemes.find(s => s.id === 'kcc' && s.status === 'eligible');
  const hasCoop = eligibleLoanSchemes.find(s => s.id === 'cooperative' && s.status === 'eligible');
  const hasNabard = eligibleLoanSchemes.find(s => s.id === 'nabard' && s.status === 'eligible');

  if (hasKcc) maxLoanAmount = Math.max(maxLoanAmount, Math.min(300000, farmerData.landSize * 60000));
  if (hasCoop) maxLoanAmount = Math.max(maxLoanAmount, Math.min(150000, farmerData.landSize * 50000));
  if (hasNabard) maxLoanAmount = Math.max(maxLoanAmount, Math.min(500000, farmerData.landSize * 80000));
  if (maxLoanAmount === 0) {
    maxLoanAmount = farmerData.landSize * 30000; // default minimum calculation
  }

  const eligibleCount = eligibleLoanSchemes.filter((s) => s.status === 'eligible').length +
    eligibleInsuranceSchemes.filter((s) => s.status === 'eligible').length;
  const eligibilityLevel = eligibleCount >= 3 ? 'high' : eligibleCount >= 1 ? 'medium' : 'low';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 pb-8"
    >
      {/* Header Card */}
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
              <span className="font-tamil">{crop?.ta}</span> · {farmerData.landSize} {isTamil ? 'ஏக்கர்' : 'acres'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/70 text-xs tracking-wider font-bold">
                {t('results.eligibilityScore')}
              </p>
            </div>
            {/* Circular Eligibility Badge */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-center font-bold shadow-md transition-all duration-300 ${
                eligibilityLevel === 'high'
                  ? 'bg-paddy-light text-paddy ring-4 ring-paddy-light/30'
                  : 'bg-amber-100 text-amber-800 ring-4 ring-amber-100/30'
              }`}
            >
              <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase font-bold">
                  {eligibilityLevel === 'high' ? t('results.eligibility.high') : t('results.eligibility.medium')}
                </span>
                <span className="font-tamil text-[9px] mt-0.5">
                  {eligibilityLevel === 'high' ? t('results.eligibility.highTa') : t('results.eligibility.mediumTa')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2x2 Grid / Staggered Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card 1: Loan Schemes */}
        <motion.div
          className="bg-white rounded-xl border border-straw p-5 shadow-sm flex flex-col justify-between"
          variants={cardVariants}
        >
          <div>
            <h3 className="text-sm font-medium text-soil mb-0.5">
              {t('results.loans.title')}
            </h3>
            <p className="text-xs text-soil/60 font-tamil mb-3">
              {t('results.loans.titleTa')}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {eligibleLoanSchemes.map((s) => {
                if (s.status === 'notEligible') return null;
                return (
                  <motion.button
                    key={s.id}
                    whileHover={{ scale: 1.02 }}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      s.status === 'eligible'
                        ? 'bg-paddy-light text-paddy'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {s.status === 'eligible' ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{isTamil ? s.ta : s.en}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <p className="text-soil/60 text-sm border-t border-straw/30 pt-3">
            {t('results.loans.maxAmount')}:{' '}
            <span className="text-xl font-bold text-paddy block sm:inline mt-1 sm:mt-0 font-sans">
              ₹{maxLoanAmount.toLocaleString()}
            </span>
          </p>
        </motion.div>

        {/* Card 2: Insurance Schemes */}
        <motion.div
          className="bg-white rounded-xl border border-straw p-5 shadow-sm"
          variants={cardVariants}
        >
          <h3 className="text-sm font-medium text-soil mb-0.5">
            {t('results.insurance.title')}
          </h3>
          <p className="text-xs text-soil/60 font-tamil mb-3">
            {t('results.insurance.titleTa')}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {eligibleInsuranceSchemes.map((s) => {
              if (s.status === 'notEligible') return null;
              return (
                <motion.button
                  key={s.id}
                  whileHover={{ scale: 1.02 }}
                  title={t('results.insurance.clickToApply')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    s.status === 'eligible'
                      ? 'bg-paddy-light text-paddy'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {s.status === 'eligible' ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  <Info className="w-3 h-3 opacity-60" />
                  <span>{isTamil ? s.ta : s.en}</span>
                </motion.button>
              );
            })}
          </div>
          <p className="text-[10px] text-soil/40 italic font-medium font-sans">
            * {isTamil ? t('results.insurance.clickToApplyTa') : t('results.insurance.clickToApply')}
          </p>
        </motion.div>

        {/* Card 3: MSP Price Reference */}
        <motion.div
          className="bg-white rounded-xl border border-straw p-5 shadow-sm flex flex-col justify-between"
          variants={cardVariants}
        >
          <div>
            <h3 className="text-sm font-medium text-soil mb-0.5">
              {t('results.msp.title')}
            </h3>
            <p className="text-xs text-soil/60 font-tamil mb-3">
              {t('results.msp.titleTa')}
            </p>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-base font-bold text-soil">{crop?.en}</span>
              <span className="text-xs text-soil/60 font-tamil">({crop?.ta})</span>
            </div>
            {crop?.msp ? (
              <p className="text-2xl font-bold text-paddy leading-none font-sans">
                ₹{crop.msp.toLocaleString()}
                <span className="text-xs font-normal text-soil/60 ml-1">
                  {isTamil ? t('results.msp.perQuintalTa') : t('results.msp.perQuintal')}
                </span>
              </p>
            ) : (
              <p className="text-sm text-soil/60 font-medium mt-1">
                {isTamil ? 'குறைந்தபட்ச ஆதரவு விலை இல்லை' : 'No MSP announced'}
              </p>
            )}
          </div>
          <div className="border-t border-straw/30 pt-3 mt-4">
            <p className="text-[10px] text-soil/50">
              {t('results.msp.guaranteed')}
            </p>
            <p className="text-[10px] text-soil/40 font-tamil mt-0.5">
              {t('results.msp.guaranteedTa')}
            </p>
            <div className="inline-block mt-2 px-2 py-0.5 bg-straw/30 border border-straw/50 rounded text-[10px] text-soil/60 font-semibold uppercase">
              {isTamil ? `${t('results.msp.seasonTa')} 2025-26` : `2025-26 ${t('results.msp.season')}`}
            </div>
          </div>
        </motion.div>

        {/* Card 4: Seasonal Risk Progress Bar */}
        <motion.div
          className="bg-white rounded-xl border border-straw p-5 shadow-sm flex flex-col justify-between"
          variants={cardVariants}
        >
          <div>
            <h3 className="text-sm font-medium text-soil mb-0.5">
              {t('results.risk.title')}
            </h3>
            <p className="text-xs text-soil/60 font-tamil mb-3">
              {t('results.risk.titleTa')}
            </p>

            {/* Animated risk bar */}
            <div className="relative w-full h-3 bg-straw rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cropRisk.riskScore}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-full rounded-full ${
                  cropRisk.riskScore <= 33
                    ? 'bg-paddy'
                    : cropRisk.riskScore <= 66
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
              {cropRisk.risk === 'low' ? t('results.risk.low') : t('results.risk.medium')} —{' '}
              <span className="text-soil/70 font-normal">{t('results.risk.impact')}</span>
            </p>
            <p className="text-[10px] text-soil/50 font-tamil mt-0.5">
              {t('results.risk.impactTa')}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Buttons / Actions */}
      <div className="space-y-3">
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg font-semibold text-white bg-turmeric shadow-lg shadow-turmeric/30 hover:bg-turmeric/90 transition-all text-center cursor-pointer"
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
          className="w-full py-3 rounded-lg font-semibold text-paddy border-2 border-paddy hover:bg-paddy-light transition-all text-center cursor-pointer"
        >
          ← {t('results.actions.back.en')}{' '}
          <span className="font-tamil">— {t('results.actions.back.ta')}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}