'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { FarmerData } from './FarmerForm';
import { Download, Share2, ArrowLeft, RotateCcw, Wheat } from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFProfilePreviewProps {
  farmerData: FarmerData;
  onBack: () => void;
  onNewFarmer: () => void;
}

export function PDFProfilePreview({ farmerData, onBack, onNewFarmer }: PDFProfilePreviewProps) {
  const { t, lang } = useI18n();
  const pdfRef = useRef<HTMLDivElement>(null);

  const maxLoanAmount = farmerData.landSize >= 2 ? 180000 : Math.floor(farmerData.landSize * 90000);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('Uzhavar-Vazhi-Farmer-Profile.pdf');
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
      className="w-full max-w-120 mx-auto px-4"
    >
      {/* PDF Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white shadow-md rounded-lg overflow-hidden"
        ref={pdfRef}
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
          {/* Farmer Details */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
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
              <p className="text-soil/60 text-xs">{t.profile.landSize}</p>
              <p className="font-medium text-soil">{farmerData.landSize} acres</p>
            </div>
            <div>
              <p className="text-soil/60 text-xs">{t.profile.ownership}</p>
              <p className="font-medium text-soil">{farmerData.ownership}</p>
              <p className="font-tamil text-paddy text-xs">{farmerData.ownershipTa}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-straw" />

          {/* Eligibility Results */}
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-soil">KCC Eligibility</span>
                <span className="font-tamil text-paddy text-xs ml-2">கிசான் கடன் அட்டை</span>
              </div>
              <span className="text-paddy font-medium flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-paddy text-white text-xs flex items-center justify-center">✓</span>
                Eligible — ₹{maxLoanAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-soil">PMFBY Insurance</span>
                <span className="font-tamil text-paddy text-xs ml-2">PMFBY</span>
              </div>
              <span className="text-paddy font-medium flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-paddy text-white text-xs flex items-center justify-center">✓</span>
                Matched
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-soil">Cooperative Loan</span>
                <span className="font-tamil text-paddy text-xs ml-2">கூட்டுறவு கடன்</span>
              </div>
              <span className="text-paddy font-medium flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-paddy text-white text-xs flex items-center justify-center">✓</span>
                Eligible
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-soil">NABARD Scheme</span>
                <span className="font-tamil text-paddy text-xs ml-2">நபார்டு திட்டம்</span>
              </div>
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">!</span>
                Verify at branch
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-soil">Seasonal Risk</span>
              <span className="font-medium text-soil">
                {farmerData.crop === 'Paddy' ? 'Medium' : 'Low'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-soil">MSP Reference</span>
              <span className="font-medium text-soil">
                ₹{(farmerData.cropMsp || 2183).toLocaleString()}/quintal
              </span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-soil">{t.profile.nearestBranch}</span>
              <span className="text-right text-soil/80 text-xs max-w-37.5">
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
