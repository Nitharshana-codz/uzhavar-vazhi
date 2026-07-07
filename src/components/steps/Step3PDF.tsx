'use client';

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Share2, ArrowLeft, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { FarmerData } from '../../../app/page';
import districts from '@/data/districts.json';
import crops from '@/data/crops.json';
import schemes from '@/data/schemes.json';
import riskMatrix from '@/data/riskMatrix.json';

interface Step3PDFProps {
  farmerData: FarmerData;
  onBack: () => void;
  onReset: () => void;
}

function isSchemeEligible(scheme: (typeof schemes)[number], farmerData: FarmerData): boolean {
  const cropEligible =
    scheme.eligibleCrops?.includes(farmerData.crop) ||
    scheme.eligibleCrops?.includes('All');
  const ownershipEligible = scheme.ownership?.includes(farmerData.ownership);
  const landSizeOk =
    farmerData.landSize >= (scheme.minLandSize || 0) &&
    (!('maxLandSize' in scheme) || !scheme.maxLandSize || farmerData.landSize <= scheme.maxLandSize);
  const districtEligible = !scheme.districts || scheme.districts.includes(farmerData.district);
  return !!(cropEligible && ownershipEligible && landSizeOk && districtEligible);
}

export function Step3PDF({ farmerData, onBack, onReset }: Step3PDFProps) {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const reportRef = useRef<HTMLDivElement>(null);

  const district = districts.find((d) => d.id === farmerData.district);
  const crop = crops.find((c) => c.id === farmerData.crop);
  const riskData = riskMatrix.find((r) => r.cropId === farmerData.crop);
  const riskLevel = riskData?.riskLevel ?? 50;

  const eligibleSchemes = schemes.filter((s) => isSchemeEligible(s, farmerData));

  const riskLabel =
    riskLevel <= 33 ? 'Low' : riskLevel <= 66 ? 'Medium' : 'High';
  const riskLabelTa =
    riskLevel <= 33 ? 'குறைந்த' : riskLevel <= 66 ? 'நடுத்தரம்' : 'அதிக';

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`farmer-profile-${farmerData.farmerName.replace(/\s+/g, '-')}.pdf`);
  };

  const handleWhatsAppShare = () => {
    const text = `🌾 உழவர் வழி - Farmer Profile\n\n${farmerData.farmerName}\n${district?.ta} | ${crop?.ta} | ${farmerData.landSize} acres\n\nDownload from uzhavarvazhi.in`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
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
      className="max-w-xl mx-auto px-4 pb-8"
    >
      <motion.div
        ref={reportRef}
        className="bg-white rounded-xl shadow-md border border-straw overflow-hidden flex flex-col pdf-a4 mx-auto w-full"
      >
        <div className="bg-paddy p-4 text-white">
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
            {eligibleSchemes.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-straw/50"
              >
                <span className="text-xs font-bold text-soil/70">{isTamil ? s.ta : s.en}</span>
                <span className="text-xs text-paddy font-bold font-tamil">
                  ✓ {t('results.status.eligible.ta')}
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
                {riskLabel} / <span className="font-tamil">{riskLabelTa}</span>
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
                {crop?.msp ? `₹${crop.msp.toLocaleString('en-IN')} / ql` : isTamil ? 'MSP இல்லை' : 'N/A'}
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
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg font-semibold text-white bg-turmeric shadow-lg shadow-turmeric/30 hover:bg-turmeric/90 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
          <span>{t('pdf.actions.download.en')}</span>
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
            onClick={onReset}
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
