'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { FarmerData } from './FarmerForm';
import { Info, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsDashboardProps {
  farmerData: FarmerData;
  onGeneratePDF: () => void;
  onChangeDetails: () => void;
}

export function ResultsDashboard({ farmerData, onGeneratePDF, onChangeDetails }: ResultsDashboardProps) {
  const { t, lang } = useI18n();

  const isHighEligibility = farmerData.landSize >= 2 && farmerData.ownership === 'owned';
  const maxLoanAmount = farmerData.landSize >= 2 ? 180000 : Math.floor(farmerData.landSize * 90000);

  const schemes = [
    {
      en: 'KCC',
      ta: 'கிசான் கடன் அட்டை',
      eligible: true,
      tooltip: 'Kisan Credit Card for farmers',
    },
    {
      en: 'Cooperative loan',
      ta: 'கூட்டுறவு கடன்',
      eligible: true,
      tooltip: 'District cooperative bank loan',
    },
    {
      en: 'NABARD scheme',
      ta: 'நபார்டு திட்டம்',
      eligible: farmerData.landSize >= 2,
      tooltip: 'NABARD farmer development scheme',
    },
  ];

  const insuranceSchemes = [
    { en: 'PMFBY', ta: 'PMFBY', eligible: true },
    { en: 'TN Delta Relief', ta: 'டெல்டா நிவாரணம்', eligible: true },
  ];

  const seasonRisk = farmerData.crop === 'Paddy' ? 45 : 30;
  const riskLevel = seasonRisk > 40 ? 'medium' : 'low';
  const mspValue = farmerData.cropMsp || 2183;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto px-4"
    >
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-paddy rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="text-white">
          <p className="text-lg font-semibold">{farmerData.district} · {farmerData.crop} · {farmerData.landSize} acres</p>
          <p className="font-tamil text-paddy-light text-sm mt-1">
            {farmerData.districtTa} · {farmerData.cropTa}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white/70 text-xs">{t.results.eligibilityScore}</p>
            <p className={cn('text-lg font-bold', isHighEligibility ? 'text-green-300' : 'text-amber-300')}>
              {isHighEligibility ? t.results.high : t.results.medium}
            </p>
          </div>
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              isHighEligibility ? 'bg-green-500' : 'bg-amber-500'
            )}
          >
            {isHighEligibility ? (
              <Check className="w-7 h-7 text-white" />
            ) : (
              <AlertCircle className="w-7 h-7 text-white" />
            )}
          </div>
        </div>
      </motion.div>

      {/* Results grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Loan schemes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white rounded-xl border border-straw p-5"
        >
          <h3 className="font-semibold text-soil mb-1">{t.results.loanSchemes}</h3>
          <p className="font-tamil text-paddy text-sm mb-3">{lang === 'en' ? 'கடன் திட்டங்கள்' : ''}</p>
          <div className="flex flex-wrap gap-2">
            {schemes.map((s) => (
              <div
                key={s.en}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm flex items-center gap-1',
                  s.eligible ? 'bg-paddy-light text-paddy' : 'bg-amber-100 text-amber-700'
                )}
              >
                {s.eligible && <Check className="w-3 h-3" />}
                {!s.eligible && <AlertCircle className="w-3 h-3" />}
                <span>{s.en}</span>
                <span className="font-tamil text-xs opacity-70">({s.ta})</span>
                <span title={s.tooltip}><Info className="w-3 h-3 opacity-50 cursor-help" /></span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-soil">
            <span className="text-2xl font-semibold text-paddy">₹{maxLoanAmount.toLocaleString()}</span>
            <span className="text-sm text-soil/60 ml-2">{t.results.maxLoan}</span>
          </p>
        </motion.div>

        {/* Insurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white rounded-xl border border-straw p-5"
        >
          <h3 className="font-semibold text-soil mb-1">{t.results.insurance}</h3>
          <p className="font-tamil text-paddy text-sm mb-3">{lang === 'en' ? 'காப்பீட்டு திட்டங்கள்' : ''}</p>
          <div className="flex flex-wrap gap-2">
            {insuranceSchemes.map((s) => (
              <div
                key={s.en}
                className="px-3 py-1.5 rounded-full text-sm bg-paddy-light text-paddy flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>{s.en}</span>
                <span className="font-tamil text-xs opacity-70">({s.ta})</span>
                <span title="Click to see how to apply"><Info className="w-3 h-3 opacity-50 cursor-help" /></span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* MSP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white rounded-xl border border-straw p-5"
        >
          <h3 className="font-semibold text-soil mb-1">{t.results.mspToday}</h3>
          <p className="font-tamil text-paddy text-sm mb-2">{lang === 'en' ? 'இன்றைய MSP' : ''}</p>
          <p className="text-2xl font-semibold text-paddy">
            {farmerData.crop} — ₹{mspValue.toLocaleString()}/quintal
          </p>
          <p className="text-sm text-soil/60 mt-1">{t.results.guaranteedPrice}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded bg-straw text-soil/70 text-xs">
            {t.results.season}
          </span>
        </motion.div>

        {/* Season risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white rounded-xl border border-straw p-5"
        >
          <h3 className="font-semibold text-soil mb-1">{t.results.seasonRisk}</h3>
          <p className="font-tamil text-paddy text-sm mb-3">{lang === 'en' ? 'பருவகால அபாயம்' : ''}</p>
          <div className="space-y-2">
            <div className="relative h-3 bg-straw rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${seasonRisk}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className={cn(
                  'absolute top-0 left-0 h-full rounded-full',
                  riskLevel === 'low' ? 'bg-paddy' : 'bg-amber-500'
                )}
              />
            </div>
            <div className="flex justify-between text-xs text-soil/60">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-soil">
            {riskLevel === 'medium' ? t.results.risk.medium : t.results.risk.low}
            <span className="text-soil/60 ml-1">— {t.results.risk.monsoonImpact}</span>
          </p>
          <p className="font-tamil text-xs text-paddy mt-1">
            {riskLevel === 'medium' ? 'வடகிழக்கு பருவமழை தாக்கம்' : 'குறைந்த ஆபத்து'}
          </p>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 space-y-3"
      >
        <motion.button
          onClick={onGeneratePDF}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg bg-turmeric text-white font-semibold flex items-center justify-center gap-2"
        >
          Generate my farmer profile PDF →
          <span className="font-tamil text-sm opacity-90">PDF உருவாக்கு</span>
        </motion.button>
        <motion.button
          onClick={onChangeDetails}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg border-2 border-paddy text-paddy font-medium"
        >
          ← {t.form.changeDetails}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
