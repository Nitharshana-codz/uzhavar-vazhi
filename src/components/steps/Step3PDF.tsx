'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Share2, ArrowLeft, RotateCcw, Loader2 } from 'lucide-react';
import type { FarmerData } from '../../../app/page';
import districts from '@/data/districts.json';
import crops from '@/data/crops.json';
import { generateFarmerPDF } from '@/lib/generate-pdf';
import { clearFarmerSession, loadFarmerSession, type FarmerSessionData } from '@/lib/farmer-session';

interface Step3PDFProps {
  farmerData: FarmerData;
  onBack: () => void;
  onReset: () => void;
}

export function Step3PDF({ farmerData, onBack, onReset }: Step3PDFProps) {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const [isDownloading, setIsDownloading] = useState(false);
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
  const cropMsp = sessionData?.cropMsp ?? crop?.msp ?? 0;

  const handleDownloadPDF = async () => {
    if (isDownloading) return;

    const advice = sessionData?.riskData?.advice || '';

    console.log('Generating PDF with data:', {
      loans,
      insurance,
      riskScore,
      riskLevel,
      advice,
    });

    setIsDownloading(true);
    try {
      await generateFarmerPDF({
        farmerName: farmerData.farmerName || '',
        district: district?.en ?? farmerData.district,
        districtTamilName: sessionData?.eligibility?.districtTamilName ?? district?.ta ?? '',
        crop: crop?.en ?? farmerData.crop,
        cropTamilName: crop?.ta,
        landAcres: farmerData.landSize,
        isTenant: farmerData.ownership === 'tenant' || farmerData.ownership === 'leasehold',
        eligibility: loans.length > 0 ? 'high' : 'medium',
        loans,
        insurance,
        riskScore,
        riskLevel,
        advice,
        cropMsp: cropMsp || 0,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🌾 உழவர் வழி - Farmer Profile\n\n${farmerData.farmerName}\n${district?.ta} | ${crop?.ta} | ${farmerData.landSize} acres\n\nDownload from uzhavarvazhi.in`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReset = () => {
    clearFarmerSession();
    onReset();
  };

  const detailRows = [
    {
      label: t('pdf.fields.farmerName'),
      labelTa: t('pdf.fields.farmerNameTa'),
      value: farmerData.farmerName,
    },
    {
      label: t('pdf.fields.district'),
      labelTa: t('pdf.fields.districtTa'),
      value: `${district?.en} (${district?.ta})`,
    },
    {
      label: t('pdf.fields.crop'),
      labelTa: t('pdf.fields.cropTa'),
      value: `${crop?.en} (${crop?.ta})`,
    },
    {
      label: t('pdf.fields.season'),
      labelTa: t('pdf.fields.seasonTa'),
      value: crop?.season || 'Annual',
    },
    {
      label: t('pdf.fields.landSize'),
      labelTa: t('pdf.fields.landSizeTa'),
      value: `${farmerData.landSize} acres`,
    },
    {
      label: t('pdf.fields.ownership'),
      labelTa: t('pdf.fields.ownershipTa'),
      value: `${t(`form.ownership.${farmerData.ownership}.en`)} / ${t(`form.ownership.${farmerData.ownership}.ta`)}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto px-4 pb-16"
    >
      <motion.div className="bg-white rounded-xl shadow-md border border-straw flex flex-col mx-auto w-full">
        <div className="bg-paddy p-4 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <path
                    d="M20 35 C20 35 8 28 8 16 C8 12 11 8 16 10 C17 11 19 14 20 16 C21 14 23 11 24 10 C29 8 32 12 32 16 C32 28 20 35 20 35"
                    fill="#D4882A"
                  />
                  <path d="M20 16 L20 5" stroke="#D4882A" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">{t('app.name')}</p>
                <p className="text-xs text-white/80 font-tamil mt-0.5">{t('app.nameTamil')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold font-tamil">{t('pdf.titleTa')}</p>
              <p className="text-[10px] text-white/80">{t('pdf.title')}</p>
              <p className="text-[9px] text-white/50 mt-1">
                {new Date().toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-cream flex-1">
          {detailRows.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-3 border-b border-straw/50 last:border-0"
            >
              <div>
                <span className="text-[11px] font-bold text-soil/60">{item.label}</span>
                <br />
                <span className="text-[10px] text-soil/40 font-tamil">{item.labelTa}</span>
              </div>
              <span className="text-xs font-bold text-soil text-right">{item.value}</span>
            </div>
          ))}

          <div className="my-4 border-t-2 border-straw/30" />

          <div className="space-y-2">
            {loans.map((loan) => (
              <div
                key={loan.name}
                className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50"
              >
                <div>
                  <span className="text-xs font-bold text-soil/70">{loan.name}</span>
                  {loan.tamilName && (
                    <span className="font-tamil text-paddy text-[10px] ml-2">{loan.tamilName}</span>
                  )}
                </div>
                <span className="text-xs text-paddy font-bold flex items-center gap-1">
                  <span>✓</span>
                  ₹{(loan.maxAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}

            {insurance.map((ins) => (
              <div
                key={ins.name}
                className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50"
              >
                <div>
                  <span className="text-xs font-bold text-soil/70">{ins.name}</span>
                  {ins.tamilName && (
                    <span className="font-tamil text-paddy text-[10px] ml-2">{ins.tamilName}</span>
                  )}
                </div>
                <span className="text-xs text-paddy font-bold flex items-center gap-1">
                  <span>✓</span>
                  {isTamil ? 'தகுதியானது' : 'Eligible'}
                </span>
              </div>
            ))}

            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50">
              <div>
                <span className="text-xs font-bold text-soil/70">{t('pdf.fields.seasonalRisk')}</span>
                <br />
                <span className="text-[10px] text-soil/40 font-tamil">
                  {t('pdf.fields.seasonalRiskTa')}
                </span>
              </div>
              <span className="text-xs font-bold text-soil">
                {riskLevel} ({riskScore}/100)
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50">
              <div>
                <span className="text-xs font-bold text-soil/70">{t('pdf.fields.mspReference')}</span>
                <br />
                <span className="text-[10px] text-soil/40 font-tamil">
                  {t('pdf.fields.mspReferenceTa')}
                </span>
              </div>
              <span className="text-xs font-bold text-paddy">
                ₹{(cropMsp || 0).toLocaleString('en-IN')}/quintal
              </span>
            </div>

            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50">
              <div>
                <span className="text-xs font-bold text-soil/70">{t('pdf.fields.nearestPacs')}</span>
                <br />
                <span className="text-[10px] text-soil/40 font-tamil">
                  {t('pdf.fields.nearestPacsTa')}
                </span>
              </div>
              <span className="text-[11px] font-bold text-soil/70 text-right">
                {district?.en} Cooperative Bank
              </span>
            </div>
          </div>
        </div>

        <div className="bg-paddy-light p-3 border-t border-paddy/10 text-center">
          <p className="text-[10px] font-bold text-paddy">{t('pdf.footer.en')}</p>
          <p className="text-[9px] font-semibold text-paddy/80 font-tamil">{t('pdf.footer.ta')}</p>
        </div>
      </motion.div>

      <div className="space-y-3 mt-6 max-w-xl mx-auto">
        <motion.button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg font-semibold text-white bg-turmeric shadow-lg shadow-turmeric/30 hover:bg-turmeric/90 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isDownloading ? <Loader2 className="w-5 h-5 stroke-[2.5] animate-spin" /> : <Download className="w-5 h-5 stroke-[2.5]" />}
          <span>{isDownloading ? 'Preparing PDF' : t('pdf.actions.download.en')}</span>
          <span className="font-tamil text-sm">— {t('pdf.actions.download.ta')}</span>
        </motion.button>

        <motion.button
          onClick={handleWhatsAppShare}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg font-semibold text-white bg-green-600 shadow-lg shadow-green-600/30 hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5 stroke-[2.5]" />
          <span>{t('pdf.actions.whatsapp.en')}</span>
          <span className="font-tamil text-sm">— {t('pdf.actions.whatsapp.ta')}</span>
        </motion.button>

        <div className="flex gap-3">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-lg font-semibold text-paddy border-2 border-paddy hover:bg-paddy-light flex items-center justify-center gap-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            {t('pdf.actions.back.en')}
          </motion.button>

          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-lg font-semibold text-paddy border-2 border-paddy hover:bg-paddy-light flex items-center justify-center gap-1.5 text-sm"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            {t('pdf.actions.newFarmer.en')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
