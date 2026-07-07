'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Minus, Plus, Search } from 'lucide-react';
import districts from '@/data/districts.json';
import crops from '@/data/crops.json';
import type { FarmerData } from '../../../app/page';

interface Step1FormProps {
  onSubmit: (data: FarmerData) => void;
}

export function Step1Form({ onSubmit }: Step1FormProps) {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';

  const [farmerName, setFarmerName] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  const [cropSearch, setCropSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [showCropDropdown, setShowCropDropdown] = useState(false);

  const [landSize, setLandSize] = useState(1);
  const [ownership, setOwnership] = useState<'owned' | 'tenant' | 'leasehold' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const districtRef = useRef<HTMLDivElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) {
        setShowDistrictDropdown(false);
      }
      if (cropRef.current && !cropRef.current.contains(e.target as Node)) {
        setShowCropDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDistricts = districts.filter(
    (d) =>
      d.en.toLowerCase().includes(districtSearch.toLowerCase()) ||
      d.ta.includes(districtSearch)
  );

  const filteredCrops = crops.filter(
    (c) =>
      c.en.toLowerCase().includes(cropSearch.toLowerCase()) ||
      c.ta.includes(cropSearch)
  );

  const selectedDistrictData = districts.find((d) => d.id === selectedDistrict);
  const selectedCropData = crops.find((c) => c.id === selectedCrop);

  const isFormValid =
    farmerName.trim() && selectedDistrict && selectedCrop && landSize >= 0.5 && ownership;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    onSubmit({
      district: selectedDistrict,
      crop: selectedCrop,
      landSize,
      ownership: ownership as 'owned' | 'tenant' | 'leasehold',
      farmerName: farmerName.trim(),
    });
    setIsLoading(false);
  };

  const adjustLandSize = (delta: number) => {
    setLandSize((prev) => Math.max(0.5, +(prev + delta).toFixed(1)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-[520px] mx-auto px-4 pb-8"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-straw p-6 shadow-sm"
      >
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-soil">
              {t('form.farmerName.label')}
            </label>
            <p className="text-xs text-soil/60 font-tamil">{t('form.farmerName.labelTa')}</p>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder={t('form.farmerName.placeholder')}
              className="w-full h-11 px-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none text-soil text-sm"
            />
          </div>

          <div className="space-y-1.5" ref={districtRef}>
            <label className="block text-sm font-medium text-soil">
              {t('form.district.label')}
            </label>
            <p className="text-xs text-soil/60 font-tamil">{t('form.district.labelTa')}</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                className="w-full h-11 px-3 border border-straw rounded-lg bg-white flex items-center justify-between hover:border-turmeric/50"
              >
                <div className="flex items-center gap-2">
                  {selectedDistrictData && (
                    <Check className="w-4 h-4 text-paddy stroke-[2.5]" />
                  )}
                  <span
                    className={`text-sm ${selectedDistrictData ? 'text-soil font-medium' : 'text-soil/40'}`}
                  >
                    {selectedDistrictData
                      ? `${selectedDistrictData.en} — ${selectedDistrictData.ta}`
                      : t('form.district.placeholder')}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-soil/40 transition-transform duration-200 ${
                    showDistrictDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showDistrictDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute z-20 w-full mt-1 bg-white border border-straw rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="p-2 border-b border-straw bg-cream/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soil/40" />
                        <input
                          type="text"
                          value={districtSearch}
                          onChange={(e) => setDistrictSearch(e.target.value)}
                          placeholder={isTamil ? 'தேடு...' : 'Search...'}
                          className="w-full h-9 pl-9 pr-3 text-sm border border-straw rounded-md focus:border-turmeric focus:ring-1 focus:ring-turmeric/20 outline-none bg-white text-soil"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredDistricts.length > 0 ? (
                        filteredDistricts.map((d) => (
                          <button
                            type="button"
                            key={d.id}
                            onClick={() => {
                              setSelectedDistrict(d.id);
                              setShowDistrictDropdown(false);
                              setDistrictSearch('');
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-turmeric-light transition-colors flex items-center justify-between ${
                              selectedDistrict === d.id
                                ? 'bg-turmeric-light text-paddy font-semibold'
                                : 'text-soil'
                            }`}
                          >
                            <span>
                              {d.en}{' '}
                              <span className="text-soil/60 font-tamil">— {d.ta}</span>
                            </span>
                            {selectedDistrict === d.id && (
                              <Check className="w-4 h-4 text-paddy" />
                            )}
                          </button>
                        ))
                      ) : (
                        <p className="p-3 text-xs text-soil/40 text-center font-tamil">
                          {isTamil ? 'மாவட்டம் எதுவும் கிடைக்கவில்லை' : 'No district found'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-1.5" ref={cropRef}>
            <label className="block text-sm font-medium text-soil">{t('form.crop.label')}</label>
            <p className="text-xs text-soil/60 font-tamil">{t('form.crop.labelTa')}</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCropDropdown(!showCropDropdown)}
                className="w-full h-11 px-3 border border-straw rounded-lg bg-white flex items-center justify-between hover:border-turmeric/50"
              >
                <div className="flex items-center gap-2">
                  {selectedCropData && <Check className="w-4 h-4 text-paddy stroke-[2.5]" />}
                  <span
                    className={`text-sm ${selectedCropData ? 'text-soil font-medium' : 'text-soil/40'}`}
                  >
                    {selectedCropData
                      ? `${selectedCropData.en} (${selectedCropData.ta})`
                      : t('form.crop.placeholder')}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-soil/40 transition-transform duration-200 ${
                    showCropDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showCropDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute z-20 w-full mt-1 bg-white border border-straw rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="p-2 border-b border-straw bg-cream/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soil/40" />
                        <input
                          type="text"
                          value={cropSearch}
                          onChange={(e) => setCropSearch(e.target.value)}
                          placeholder={isTamil ? 'தேடு...' : 'Search...'}
                          className="w-full h-9 pl-9 pr-3 text-sm border border-straw rounded-md focus:border-turmeric focus:ring-1 focus:ring-turmeric/20 outline-none bg-white text-soil"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredCrops.length > 0 ? (
                        filteredCrops.map((c) => (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => {
                              setSelectedCrop(c.id);
                              setShowCropDropdown(false);
                              setCropSearch('');
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-turmeric-light transition-colors flex items-center justify-between ${
                              selectedCrop === c.id
                                ? 'bg-turmeric-light text-paddy font-semibold'
                                : 'text-soil'
                            }`}
                          >
                            <span>
                              {c.en}{' '}
                              <span className="text-soil/60 font-tamil">({c.ta})</span>
                            </span>
                            {selectedCrop === c.id && <Check className="w-4 h-4 text-paddy" />}
                          </button>
                        ))
                      ) : (
                        <p className="p-3 text-xs text-soil/40 text-center font-tamil">
                          {isTamil ? 'பயிர் எதுவும் கிடைக்கவில்லை' : 'No crop found'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-soil">
              {t('form.landSize.label')}
            </label>
            <p className="text-xs text-soil/60 font-tamil">{t('form.landSize.labelTa')}</p>
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                onClick={() => adjustLandSize(-0.5)}
                disabled={landSize <= 0.5}
                whileHover={{ scale: landSize > 0.5 ? 1.02 : 1 }}
                whileTap={{ scale: landSize > 0.5 ? 0.98 : 1 }}
                className="w-11 h-11 flex items-center justify-center border border-straw rounded-lg bg-white hover:bg-straw/30 disabled:opacity-40 disabled:cursor-not-allowed text-soil"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                min="0.5"
                step="0.5"
                className="flex-1 h-11 px-3 text-center border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none text-soil text-sm font-semibold"
              />
              <motion.button
                type="button"
                onClick={() => adjustLandSize(0.5)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-11 h-11 flex items-center justify-center border border-straw rounded-lg bg-white hover:bg-straw/30 text-soil"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
            </div>
            <p className="text-xs text-soil/50 mt-1">{t('form.landSize.helper')}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-soil">
              {t('form.ownership.label')}
            </label>
            <p className="text-xs text-soil/60 font-tamil">{t('form.ownership.labelTa')}</p>
            <div className="grid grid-cols-3 gap-2">
              {(['owned', 'tenant', 'leasehold'] as const).map((type) => {
                const isSelected = ownership === type;
                return (
                  <motion.button
                    key={type}
                    type="button"
                    onClick={() => setOwnership(type)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-lg border-2 text-center ${
                      isSelected
                        ? 'border-turmeric bg-turmeric-light'
                        : 'border-straw bg-white hover:border-turmeric/50'
                    }`}
                  >
                    <p className="text-sm font-bold text-soil">
                      {t(`form.ownership.${type}.en`)}
                    </p>
                    <p className="text-xs text-soil/60 font-tamil mt-0.5">
                      {t(`form.ownership.${type}.ta`)}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={!isFormValid || isLoading}
            whileHover={{ scale: isFormValid && !isLoading ? 1.01 : 1 }}
            whileTap={{ scale: isFormValid && !isLoading ? 0.98 : 1 }}
            className={`w-full py-4 rounded-lg font-semibold text-white ${
              isFormValid && !isLoading
                ? 'bg-turmeric shadow-lg shadow-turmeric/30 hover:bg-turmeric/90'
                : 'bg-straw cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t('form.submit.loading')}</span>
              </span>
            ) : (
              <>
                <span>{t('form.submit.en')} →</span>
                <span className="block text-sm font-normal font-tamil mt-0.5">
                  {t('form.submit.ta')}
                </span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
