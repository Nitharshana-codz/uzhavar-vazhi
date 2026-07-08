'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { districts, crops, ownershipTypes } from '@/lib/data/districts';
import { Check, ChevronDown, Minus, Plus, Loader2 } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/lib/utils';

interface FarmerFormProps {
  onSubmit: (data: FarmerData) => void;
}

export interface FarmerData {
  district: string;
  districtTa: string;
  crop: string;
  cropTa: string;
  landSize: number;
  ownership: string;
  ownershipTa: string;
  cropMsp: number | null;
  eligibility?: {
    loans: {
      name: string;
      provider: string;
      maxAmount: number | null;
      interestRate: string;
      documents: string[];
    }[];
    insurance: {
      name: string;
      coverage: string;
      premiumRate: string;
    }[];
  };
  riskData?: {
    riskScore: number;
    riskLevel: string;
    advice: string;
  };
}

export function FarmerForm({ onSubmit }: FarmerFormProps) {
  const { t, lang } = useI18n();
  const [district, setDistrict] = useState('');
  const [districtTa, setDistrictTa] = useState('');
  const [crop, setCrop] = useState('');
  const [cropTa, setCropTa] = useState('');
  const [cropMsp, setCropMsp] = useState<number | null>(null);
  const [landSize, setLandSize] = useState(1);
  const [ownership, setOwnership] = useState('');
  const [ownershipTa, setOwnershipTa] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!district || !crop || !ownership) return;

    setIsLoading(true);

    try {
      const isTenant = ownership === 'tenant';

      const [eligibilityRes, riskRes] = await Promise.all([
        fetch('/api/eligibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            district,
            crop,
            landAcres: landSize,
            isTenant,
          }),
        }),
        fetch('/api/risk-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            district,
            crop,
            landAcres: landSize,
            isTenant,
          }),
        }),
      ]);

      const eligibility = await eligibilityRes.json();
      const riskData = await riskRes.json();

      onSubmit({
        district,
        districtTa,
        crop,
        cropTa,
        landSize,
        ownership,
        ownershipTa,
        cropMsp,
        eligibility,
        riskData,
      });
    } catch (error) {
      console.error('API error:', error);
      onSubmit({
        district,
        districtTa,
        crop,
        cropTa,
        landSize,
        ownership,
        ownershipTa,
        cropMsp,
      });
    }

    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[520px] mx-auto px-4"
    >
      <div className="bg-white rounded-xl border border-straw p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* District */}
          <div>
            <label className="block mb-1">
              <span className="text-soil font-medium">{t.form.district}</span>
              <span className="block font-tamil text-paddy text-sm">{lang === 'en' ? 'மாவட்டம்' : ''}</span>
            </label>
            <SelectPrimitive.Root
              value={district}
              onValueChange={(val) => {
                const d = districts.find((d) => d.en === val);
                if (d) {
                  setDistrict(d.en);
                  setDistrictTa(d.ta);
                }
              }}
            >
              <SelectPrimitive.Trigger className="flex h-12 w-full items-center justify-between rounded-lg border border-straw bg-white px-4 py-2 text-soil text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/30 hover:border-turmeric transition-colors">
                <span className={cn(!district && 'text-soil/50')}>
                  {district ? (
                    <span>
                      {district} <span className="font-tamil text-paddy">— {districtTa}</span>
                    </span>
                  ) : (
                    t.form.districtPlaceholder
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-soil/50" />
              </SelectPrimitive.Trigger>
              <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                  className="relative z-50 max-h-80 overflow-auto rounded-lg border border-straw bg-white py-1 shadow-lg"
                  style={{ width: 'var(--radix-select-trigger-width)' }}
                >
                  {districts.map((d) => (
                    <SelectPrimitive.Item
                      key={d.en}
                      value={d.en}
                      className="relative flex cursor-pointer items-center px-4 py-2.5 text-sm outline-none hover:bg-turmeric-light focus:bg-turmeric-light"
                    >
                      <SelectPrimitive.ItemIndicator className="absolute left-3">
                        <Check className="h-4 w-4 text-paddy" />
                      </SelectPrimitive.ItemIndicator>
                      <span className="pl-6">
                        {d.en} <span className="font-tamil text-paddy">— {d.ta}</span>
                      </span>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Content>
              </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
          </div>

          {/* Crop */}
          <div>
            <label className="block mb-1">
              <span className="text-soil font-medium">{t.form.crop}</span>
              <span className="block font-tamil text-paddy text-sm">{lang === 'en' ? 'வளர்க்கும் பயிர்' : ''}</span>
            </label>
            <SelectPrimitive.Root
              value={crop}
              onValueChange={(val) => {
                const c = crops.find((c) => c.en === val);
                if (c) {
                  setCrop(c.en);
                  setCropTa(c.ta);
                  setCropMsp(c.msp);
                }
              }}
            >
              <SelectPrimitive.Trigger className="flex h-12 w-full items-center justify-between rounded-lg border border-straw bg-white px-4 py-2 text-soil text-sm focus:outline-none focus:ring-2 focus:ring-turmeric/30 hover:border-turmeric transition-colors">
                <span className={cn(!crop && 'text-soil/50')}>
                  {crop ? (
                    <span>
                      {crop} <span className="font-tamil text-paddy">({cropTa})</span>
                    </span>
                  ) : (
                    t.form.cropPlaceholder
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-soil/50" />
              </SelectPrimitive.Trigger>
              <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                  className="relative z-50 max-h-80 overflow-auto rounded-lg border border-straw bg-white py-1 shadow-lg"
                  style={{ width: 'var(--radix-select-trigger-width)' }}
                >
                  {crops.map((c) => (
                    <SelectPrimitive.Item
                      key={c.en}
                      value={c.en}
                      className="relative flex cursor-pointer items-center px-4 py-2.5 text-sm outline-none hover:bg-turmeric-light focus:bg-turmeric-light"
                    >
                      <SelectPrimitive.ItemIndicator className="absolute left-3">
                        <Check className="h-4 w-4 text-paddy" />
                      </SelectPrimitive.ItemIndicator>
                      <span className="pl-6">
                        {c.en} <span className="font-tamil text-paddy">({c.ta})</span>
                      </span>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Content>
              </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
          </div>

          {/* Land Size */}
          <div>
            <label className="block mb-1">
              <span className="text-soil font-medium">{t.form.landSize}</span>
              <span className="block font-tamil text-paddy text-sm">{lang === 'en' ? 'நில அளவு (ஏக்கரில்)' : ''}</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLandSize(Math.max(0.5, landSize - 0.5))}
                className="w-12 h-12 rounded-lg border border-straw bg-white flex items-center justify-center hover:bg-turmeric-light hover:border-turmeric transition-colors"
              >
                <Minus className="w-4 h-4 text-soil" />
              </button>
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                step="0.5"
                min="0.5"
                className="flex-1 h-12 text-center text-lg font-medium rounded-lg border border-straw bg-white px-4 focus:outline-none focus:ring-2 focus:ring-turmeric/30 text-soil"
              />
              <button
                type="button"
                onClick={() => setLandSize(landSize + 0.5)}
                className="w-12 h-12 rounded-lg border border-straw bg-white flex items-center justify-center hover:bg-turmeric-light hover:border-turmeric transition-colors"
              >
                <Plus className="w-4 h-4 text-soil" />
              </button>
            </div>
            <p className="mt-1 text-sm text-soil/60">{t.form.landSizeHelper}</p>
          </div>

          {/* Ownership */}
          <div>
            <label className="block mb-2">
              <span className="text-soil font-medium">{t.form.ownership}</span>
              <span className="block font-tamil text-paddy text-sm">{lang === 'en' ? 'நில உரிமை வகை' : ''}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ownershipTypes.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => {
                    setOwnership(o.key);
                    setOwnershipTa(o.ta);
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-all',
                    ownership === o.key
                      ? 'border-turmeric bg-turmeric-light'
                      : 'border-straw bg-white hover:border-turmeric/50 hover:bg-turmeric-light/50'
                  )}
                >
                  <span className="text-sm font-medium text-soil">{o.en}</span>
                  <span className="font-tamil text-xs text-paddy mt-0.5">{o.ta}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={!district || !crop || !ownership || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2',
              district && crop && ownership && !isLoading
                ? 'bg-turmeric hover:bg-turmeric/90'
                : 'bg-soil/30 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking eligibility...</span>
              </>
            ) : (
              <>
                <span>{t.form.checkEligibility}</span>
                <span className="font-tamil text-sm opacity-90">→ தகுதியை சரிபார்க்க</span>
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}