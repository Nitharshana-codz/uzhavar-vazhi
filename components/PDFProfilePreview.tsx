'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { FarmerData } from './FarmerForm';
import { Download, Share2, ArrowLeft, RotateCcw, Wheat } from 'lucide-react';
import { generateFarmerPDF } from '@/lib/generate-pdf';

interface PDFProfilePreviewProps {
  farmerData: FarmerData;
  onBack: () => void;
  onNewFarmer: () => void;
}

export function PDFProfilePreview({ farmerData, onBack, onNewFarmer }: PDFProfilePreviewProps) {
  const { t } = useI18n();
  const previewData = farmerData as FarmerData & {
    farmerName?: string;
    name?: string;
    season?: string;
  };

  const maxLoanAmount = farmerData.eligibility?.loans?.length
    ? Math.max(...farmerData.eligibility.loans.map((l) => l.maxAmount || 0))
    : farmerData.landSize >= 2 ? 180000 : Math.floor(farmerData.landSize * 90000);

  const handleDownloadPDF = () => {
    generateFarmerPDF({
      district: farmerData.district,
      districtTamilName: farmerData.districtTa,
      crop: farmerData.crop,
      landAcres: farmerData.landSize,
      isTenant: farmerData.ownership === 'tenant',
      loans: farmerData.eligibility?.loans || [],
      insurance: farmerData.eligibility?.insurance || [],
      riskScore: farmerData.riskData?.riskScore || 0,
      riskLevel: farmerData.riskData?.riskLevel || 'Low',
      advice: farmerData.riskData?.advice || '',
    });
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Uzhavar Vazhi Farmer Profile\n\nDistrict: ${farmerData.district}\nCrop: ${farmerData.crop}\nLand: ${farmerData.landSize} acres\nEligible loan: ₹${maxLoanAmount.toLocaleString()}\n\nGenerated with uzhavarvazhi.in`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[480px] mx-auto px-4 pb-16"
    >
      {/* PDF Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white shadow-md rounded-lg"
      >
        {/* Header */}
        <div className="bg-paddy p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-turmeric" />
            <div>
              <p className="text-white font-semibold text-sm">Uzhavar Vazhi</p>
              <p className="font-tamil text-turmeric text-xs">உழவர் வழி</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-tamil text-white text-sm">விவசாயி நிதி சுயவிவர அறிக்கை</p>
            <p className="text-paddy-light text-xs">{today}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div>
              <p className="text-soil/60 text-xs">Farmer Name</p>
              <p className="font-medium text-soil">{previewData.farmerName || previewData.name || 'Farmer'}</p>
            </div>
            <div>
              <p className="text-soil/60 text-xs">{t.profile.district}</p>
              <p className="font-medium text-soil">{farmerData.district}</p>
              <p className="font-tamil text-paddy text-xs">{farmerData.districtTa}</p>
            </div>
            <div>
              <p className="text-soil/60 text-xs">{t.profile.crop}</p>
              <p className="font-medium text-soil">{farmerData.crop}</p>
              <p className="font-tamil text-paddy text-xs">{farmerData.cropTa}</p>
            </div>
            <div>
              <p className="text-soil/60 text-xs">Season</p>
              <p className="font-medium text-soil">{previewData.season || 'Current season'}</p>
            </div>
            <div>
              <p className="text-soil/60 text-xs">{t.profile.landSize}</p>
              <p className="font-medium text-soil">{farmerData.landSize} acres</p>
            </div>
            <div>
              <p className="text-soil/60 text-xs">{t.profile.ownership}</p>
              <p className="font-medium text-soil">{farmerData.ownership}</p>
              <p className="font-tamil text-paddy text-xs">{farmerData.ownershipTa}</p>
            </div>
          </div>

          <div className="my-4 border-t border-straw" />

          <div className="space-y-2.5 text-sm">
            {farmerData.eligibility?.loans?.map((loan) => (
              <div key={loan.name} className="flex items-center justify-between">
                <span className="text-soil">{loan.name}</span>
                <span className="text-paddy font-medium flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-paddy text-white text-xs flex items-center justify-center">✓</span>
                  ₹{(loan.maxAmount || 0).toLocaleString()}
                </span>
              </div>
            ))}

            {farmerData.eligibility?.insurance?.map((ins) => (
              <div key={ins.name} className="flex items-center justify-between">
                <span className="text-soil">{ins.name}</span>
                <span className="text-paddy font-medium flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-paddy text-white text-xs flex items-center justify-center">✓</span>
                  Matched
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <span className="text-soil">Seasonal Risk</span>
              <span className="font-medium text-soil">{farmerData.riskData?.riskLevel || 'Medium'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-soil">MSP Reference</span>
              <span className="font-medium text-soil">₹{(farmerData.cropMsp || 2183).toLocaleString()}/quintal</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-soil">{t.profile.nearestBranch}</span>
              <span className="text-right text-soil/80 text-xs max-w-[150px]">
                {farmerData.district} Central Cooperative Bank
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-straw/50 p-3 text-center">
          <p className="text-xs text-soil/60">
            {t.pdf.generated} Uzhavar Vazhi · உழவர் வழி · uzhavarvazhi.in
          </p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 space-y-3"
      >
        <motion.button
          onClick={handleDownloadPDF}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg bg-turmeric text-white font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>{t.pdf.download}</span>
          <span className="font-tamil text-sm opacity-90">PDF பதிவிறக்கம்</span>
        </motion.button>

        <motion.button
          onClick={handleWhatsAppShare}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-lg bg-green-600 text-white font-semibold flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          <span>{t.pdf.share}</span>
        </motion.button>

        <div className="flex gap-3">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-lg border border-straw text-soil font-medium flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.pdf.backToResults}
          </motion.button>
          <motion.button
            onClick={onNewFarmer}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-lg border border-straw text-soil font-medium flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            {t.pdf.newFarmer}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
