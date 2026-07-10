'use client';

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Share2, ArrowLeft, RotateCcw } from 'lucide-react';
import { FarmerData } from './Step1Form';
import districts from '@/lib/data/districts.json';
import crops from '@/src/data/crops.json';
import schemes from '@/src/data/schemes.json';
import riskMatrix from '@/src/data/riskMatrix.json';
import { generateFarmerPDF } from '@/lib/generate-pdf';

interface Step3PDFProps {
  farmerData: FarmerData;
  onBack: () => void;
  onReset: () => void;
}

export function Step3PDF({ farmerData, onBack, onReset }: Step3PDFProps) {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const reportRef = useRef<HTMLDivElement>(null);

  const district = districts.find((d) => d.id === farmerData.district);
  const crop = crops.find((c) => c.id === farmerData.crop);
  const cropRisk = riskMatrix.find((entry) => entry.cropId === farmerData.crop) || { riskLevel: 30 };

  const eligibleSchemes = schemes.filter((s) => {
    const cropEligible = s.eligibleCrops?.includes(farmerData.crop) || s.eligibleCrops?.includes('All');
    const ownershipEligible = s.ownership?.includes(farmerData.ownership);
    const landSizeOk =
      farmerData.landSize >= (s.minLandSize || 0) &&
      (!s.maxLandSize || farmerData.landSize <= s.maxLandSize);
    const districtEligible = !s.districts || s.districts.includes(farmerData.district);

    return cropEligible && ownershipEligible && landSizeOk && districtEligible;
  });

  const riskScore = cropRisk.riskLevel;
  const riskLabel = riskScore <= 33 ? 'Low' : riskScore <= 66 ? 'Medium' : 'High';

  const handleDownloadPDF = async () => {
    const loans = eligibleSchemes
      .filter((scheme) => scheme.type === 'loan')
      .map((scheme) => ({
        id: scheme.id,
        name: scheme.en,
        tamilName: scheme.ta,
        provider: scheme.id === 'kcc' ? 'Nationalised & Cooperative Banks' : 'Tamil Nadu Cooperative Banks',
        maxAmount: 'maxAmount' in scheme ? scheme.maxAmount ?? null : null,
        interestRate: scheme.id === 'kcc' ? '4% (with government subvention)' : 'As per scheme terms',
        documents: ['Aadhaar Card', 'Land Ownership Record', 'Bank Passbook', 'Passport Photographs'],
      }));
    const insurance = eligibleSchemes
      .filter((scheme) => scheme.type === 'insurance')
      .map((scheme) => ({
        id: scheme.id,
        name: scheme.en,
        tamilName: scheme.ta,
        coverage: 'Crop loss due to drought, flood, pest, and disease',
        premiumRate: scheme.id === 'pmfby' ? '2% for Kharif crops' : 'As per scheme terms',
      }));

    await generateFarmerPDF({
      farmerName: farmerData.farmerName,
      district: district?.en ?? farmerData.district,
      districtTamilName: district?.ta ?? '',
      crop: crop?.en ?? farmerData.crop,
      cropTamilName: crop?.ta,
      landAcres: farmerData.landSize,
      isTenant: farmerData.ownership !== 'owned',
      eligibility: loans.length > 0 || insurance.length > 0 ? 'Verified Eligible' : 'No matching schemes',
      season: crop?.season,
      loans,
      insurance,
      riskScore,
      riskLevel: `${riskLabel} Risk`,
      advice:
        riskLabel === 'Low'
          ? 'Favorable agro-climatic conditions support planned crop investments this season.'
          : 'Use insurance and formal credit to reduce seasonal cultivation risk.',
      cropMsp: crop?.msp ?? undefined,
      estimatedRevenue: crop?.msp ? crop.msp * farmerData.landSize * 10 : undefined,
    });
  };

  const handleWhatsAppShare = () => {
    const text = `🌾 உழவர் வழி - Farmer Profile\n\n${farmerData.farmerName}\n${district?.ta} | ${crop?.ta} | ${farmerData.landSize} acres\n\nKCC: Eligible\nPMFBY: Matched\n\nDownload from uzhavarvazhi.in`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-[480px] mx-auto px-4 pb-8"
    >
      {/* A4-Style Preview Card */}
      <motion.div
        ref={reportRef}
        className="bg-white rounded-xl shadow-md border border-straw overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-paddy p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <span className="font-tamil text-lg font-bold">உ</span>
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">{t('app.name')}</p>
                <p className="text-xs text-white/80 font-tamil mt-0.5">{t('app.nameTamil')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold font-tamil">{t('pdf.title')}</p>
              <p className="text-[10px] text-white/80 leading-none">{t('pdf.titleTa')}</p>
              <p className="text-[9px] text-white/50 mt-1 font-sans font-medium">
                {new Date().toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 bg-cream">
          <div className="space-y-0.5 bg-white rounded-lg border border-straw/50 overflow-hidden shadow-sm">
            {[
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
                value: `${t(`form.ownership.${farmerData.ownership}.en`)} / ${t(
                  `form.ownership.${farmerData.ownership}.ta`
                )}`,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center px-4 py-3 border-b border-straw/20 last:border-0 hover:bg-cream/20 transition-colors"
              >
                <div className="text-left">
                  <span className="text-[11px] font-bold text-soil/60">{item.label}</span>
                  <br />
                  <span className="text-[10px] text-soil/40 font-tamil font-semibold leading-none">
                    {item.labelTa}
                  </span>
                </div>
                <span className="text-xs font-bold text-soil text-right">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="my-4 border-t-2 border-straw/30" />

          {/* Scheme Matches */}
          <div className="space-y-2.5">
            {eligibleSchemes.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50 hover:border-paddy/30 transition-all shadow-sm"
              >
                <span className="text-xs font-bold text-soil/70 leading-snug text-left">
                  {isTamil ? s.ta : s.en}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-right">
                  <span className="text-paddy font-bold text-sm">✓</span>
                  <span className="text-paddy font-bold font-tamil">
                    {t('results.status.eligible.ta')}
                  </span>
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50 shadow-sm">
              <span className="text-xs font-bold text-soil/70 text-left">
                {t('pdf.fields.seasonalRisk')}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-right font-semibold">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    riskLabel === 'Low'
                      ? 'bg-paddy'
                      : riskLabel === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-terracotta'
                  }`}
                />
                <span className="text-soil/70 font-bold">
                  {riskLabel} / {riskLabel === 'Low' ? 'குறைந்த' : riskLabel === 'Medium' ? 'நடுத்தரம்' : 'அதிக'}
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50 shadow-sm">
              <span className="text-xs font-bold text-soil/70 text-left">
                {t('pdf.fields.mspReference')}
              </span>
              <span className="text-xs font-bold text-paddy text-right font-sans">
                {crop?.msp ? `₹${crop.msp.toLocaleString()} / ql` : isTamil ? 'MSP இல்லை' : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50 shadow-sm">
              <span className="text-xs font-bold text-soil/70 text-left">
                {t('pdf.fields.nearestPacs')}
              </span>
              <span className="text-[11px] font-bold text-soil/70 text-right leading-tight">
                {district?.en} Cooperative Bank
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-paddy-light p-3 border-t border-paddy/10 text-center">
          <p className="text-[10px] font-bold text-paddy leading-relaxed">
            {t('pdf.footer.en')}
          </p>
          <p className="text-[9px] font-semibold text-paddy/80 font-tamil leading-tight">
            {t('pdf.footer.ta')}
          </p>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 mt-6"
      >
        {/* Download Button */}
        <motion.button
          onClick={handleDownloadPDF}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg font-semibold text-white bg-turmeric shadow-lg shadow-turmeric/30 hover:bg-turmeric/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
          <span>{t('pdf.actions.download.en')}</span>
          <span className="font-tamil text-sm">— {t('pdf.actions.download.ta')}</span>
        </motion.button>

        {/* WhatsApp Button */}
        <motion.button
          onClick={handleWhatsAppShare}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg font-semibold text-white bg-green-600 shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-5 h-5 stroke-[2.5]" />
          <span>{t('pdf.actions.whatsapp.en')}</span>
          <span className="font-tamil text-sm">— {t('pdf.actions.whatsapp.ta')}</span>
        </motion.button>

        {/* Back and Reset buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-lg font-semibold text-paddy border-2 border-paddy/50 hover:border-paddy hover:bg-paddy-light transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            {t('pdf.actions.back.en')}
          </motion.button>

          <motion.button
            onClick={onReset}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-lg font-semibold text-turmeric border-2 border-turmeric/50 hover:border-turmeric hover:bg-turmeric-light transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            {t('pdf.actions.newFarmer.en')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
