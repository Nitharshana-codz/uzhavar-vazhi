'use client';

import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Download, Info, Loader2, Minus, Plus, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import districts from '@/data/districts.json';
import crops from '@/data/crops.json';
import { getBestMSPForCrop } from '@/lib/msp-data';
import { generateFarmerPDF } from '@/lib/generate-pdf';

type FarmerData = {
  farmerName: string;
  district: string;
  crop: string;
  landSize: number;
  ownership: 'owned' | 'tenant' | 'leasehold';
};

type Results = {
  loans: { id: string; name: string; tamilName?: string; provider: string; maxAmount: number | null; interestRate: string }[];
  insurance: { id: string; name: string; tamilName?: string; coverage: string; premiumRate: string }[];
  riskScore: number;
  riskLevel: string;
  advice: string;
  eligibilityLevel: 'high' | 'medium' | 'low';
  msp: {
    crop?: string;
    tamilName?: string;
    mspPerQuintal?: number;
    mspPerKg?: number;
    varieties?: { variety?: string; mspPerQuintal?: number; mspPerKg?: number }[];
    revenueProjection?: { revenueAtMSP?: number; lostToMiddlemen?: number };
  } | null;
};

const ownershipOptions = [
  { id: 'owned', en: 'Owned', ta: 'சொந்தம்' },
  { id: 'tenant', en: 'Tenant', ta: 'குத்தகை' },
  { id: 'leasehold', en: 'Leasehold', ta: 'குத்தகை ஒப்பந்தம்' },
] as const;

const formatINR = (value?: number | null) =>
  typeof value === 'number' ? `Rs. ${value.toLocaleString('en-IN')}` : 'Varies';

function levelFromLoans(loans: unknown[], insurance: unknown[]): Results['eligibilityLevel'] {
  if (loans.length >= 2 && insurance.length > 0) return 'high';
  if (loans.length > 0 || insurance.length > 0) return 'medium';
  return 'low';
}

export default function DashboardPage() {
  const [farmerData, setFarmerData] = useState<FarmerData>({
    farmerName: '',
    district: '',
    crop: '',
    landSize: 1,
    ownership: 'owned',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Results | null>(null);

  const isValid = farmerData.farmerName.trim() && farmerData.district && farmerData.crop && farmerData.landSize >= 0.5;
  const cropMsp = useMemo(() => getBestMSPForCrop(farmerData.crop), [farmerData.crop]);
  const displayedMsp = results?.msp?.mspPerQuintal ?? results?.msp?.varieties?.[0]?.mspPerQuintal ?? cropMsp?.mspPerQuintal;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValid) return;
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const payload = {
        district: farmerData.district,
        crop: farmerData.crop,
        landAcres: farmerData.landSize,
        isTenant: farmerData.ownership !== 'owned',
      };
      const [eligibilityRes, riskRes, mspRes] = await Promise.all([
        fetch('/api/eligibility', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        fetch('/api/risk-score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        fetch(`/api/msp?crop=${encodeURIComponent(farmerData.crop)}&landAcres=${farmerData.landSize}`),
      ]);
      if (!eligibilityRes.ok || !riskRes.ok) throw new Error('Unable to calculate eligibility');
      const eligibility = await eligibilityRes.json();
      const risk = await riskRes.json();
      const msp = mspRes.ok ? await mspRes.json() : cropMsp;
      setResults({
        loans: eligibility.loans ?? [],
        insurance: eligibility.insurance ?? [],
        riskScore: risk.riskScore ?? 0,
        riskLevel: risk.riskLevel ?? 'Calculated',
        advice: risk.advice ?? risk.tamilAdvice ?? 'Use insurance and formal credit for safer planning.',
        eligibilityLevel: levelFromLoans(eligibility.loans ?? [], eligibility.insurance ?? []),
        msp,
      });
    } catch {
      setError('Could not connect to the eligibility backend. Please try again. / தகுதி சேவையுடன் இணைக்க முடியவில்லை.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-soil">Dashboard</h1>
            <p className="font-tamil text-lg text-paddy">டாஷ்போர்டு</p>
            <p className="text-soil/60 mt-2">Check your loan, insurance, risk, and MSP readiness in one place.</p>
          </div>

          {!results && (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-straw shadow-sm p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  <span className="font-medium text-soil">Farmer Name</span>
                  <p className="font-tamil text-sm text-soil/60">விவசாயி பெயர்</p>
                  <input className="w-full h-11 px-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none" value={farmerData.farmerName} onChange={(e) => setFarmerData({ ...farmerData, farmerName: e.target.value })} />
                </label>
                <label>
                  <span className="font-medium text-soil">District</span>
                  <p className="font-tamil text-sm text-soil/60">மாவட்டம்</p>
                  <select className="w-full h-11 px-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none" value={farmerData.district} onChange={(e) => setFarmerData({ ...farmerData, district: e.target.value })}>
                    <option value="">Select district</option>
                    {districts.map((district) => <option key={district.id} value={district.en}>{district.en}</option>)}
                  </select>
                </label>
                <label>
                  <span className="font-medium text-soil">Crop</span>
                  <p className="font-tamil text-sm text-soil/60">பயிர்</p>
                  <select className="w-full h-11 px-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none" value={farmerData.crop} onChange={(e) => setFarmerData({ ...farmerData, crop: e.target.value })}>
                    <option value="">Select crop</option>
                    {crops.map((crop) => <option key={crop.id} value={crop.en}>{crop.en}</option>)}
                  </select>
                </label>
                <div>
                  <span className="font-medium text-soil">Land Size</span>
                  <p className="font-tamil text-sm text-soil/60">நில அளவு</p>
                  <div className="flex h-11 border border-straw rounded-lg overflow-hidden">
                    <button type="button" className="w-12 bg-turmeric-light text-turmeric flex items-center justify-center" onClick={() => setFarmerData({ ...farmerData, landSize: Math.max(0.5, farmerData.landSize - 0.5) })}><Minus className="w-4 h-4" /></button>
                    <input type="number" min="0.5" step="0.5" className="flex-1 text-center outline-none" value={farmerData.landSize} onChange={(e) => setFarmerData({ ...farmerData, landSize: Number(e.target.value) })} />
                    <button type="button" className="w-12 bg-paddy-light text-paddy flex items-center justify-center" onClick={() => setFarmerData({ ...farmerData, landSize: farmerData.landSize + 0.5 })}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-medium text-soil">Ownership</span>
                <p className="font-tamil text-sm text-soil/60">உரிமை வகை</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {ownershipOptions.map((option) => (
                    <button key={option.id} type="button" onClick={() => setFarmerData({ ...farmerData, ownership: option.id })} className={`rounded-lg border p-4 text-left ${farmerData.ownership === option.id ? 'border-turmeric bg-turmeric-light' : 'border-straw bg-white'}`}>
                      <span className="font-semibold text-soil">{option.en}</span>
                      <span className="block font-tamil text-sm text-soil/60">{option.ta}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="rounded-lg border border-terracotta bg-red-50 p-3 text-sm text-terracotta">{error}</div>}
              <motion.button disabled={!isValid || isLoading} whileHover={{ scale: isValid ? 1.01 : 1 }} whileTap={{ scale: isValid ? 0.98 : 1 }} className={`w-full py-4 rounded-lg font-semibold text-white ${isValid ? 'bg-turmeric shadow-lg shadow-turmeric/30' : 'bg-straw cursor-not-allowed'}`}>
                {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Checking... / சரிபார்க்கிறது...</span> : <>Check my eligibility<span className="block font-tamil text-sm mt-0.5">தகுதியை சரிபார்க்க</span></>}
              </motion.button>
            </form>
          )}

          {results && (
            <div>
              <div className="bg-paddy rounded-xl p-5 text-white mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm opacity-80">Farmer summary / விவசாயி சுருக்கம்</p>
                  <h2 className="text-2xl font-semibold">{farmerData.farmerName}</h2>
                  <p>{farmerData.district} · {farmerData.crop} · {farmerData.landSize} acres</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-white text-paddy flex items-center justify-center font-bold uppercase">{results.eligibilityLevel}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="bg-white rounded-xl border border-straw shadow-sm p-5">
                  <h3 className="font-semibold text-soil">Loan Schemes</h3>
                  <p className="font-tamil text-sm text-soil/60 mb-4">கடன் திட்டங்கள்</p>
                  <div className="space-y-2">{results.loans.map((loan) => <div key={loan.id} className="inline-flex mr-2 mb-2 items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-paddy-light text-paddy"><Check className="w-4 h-4" />{loan.name}</div>)}</div>
                  <p className="mt-4 text-2xl font-semibold text-paddy">Max: {formatINR(Math.max(0, ...results.loans.map((loan) => loan.maxAmount ?? 0)))}</p>
                </section>
                <section className="bg-white rounded-xl border border-straw shadow-sm p-5">
                  <h3 className="font-semibold text-soil">Insurance</h3>
                  <p className="font-tamil text-sm text-soil/60 mb-4">காப்பீடு</p>
                  {results.insurance.map((item) => <div key={item.id} className="flex items-start gap-2 mb-3"><Info className="w-5 h-5 text-turmeric mt-0.5" /><p className="text-sm text-soil">{item.name}<span className="block text-soil/60">{item.premiumRate}</span></p></div>)}
                </section>
                <section className="bg-white rounded-xl border border-straw shadow-sm p-5">
                  <h3 className="font-semibold text-soil">Season Risk</h3>
                  <p className="font-tamil text-sm text-soil/60 mb-4">பருவகால ஆபத்து</p>
                  <div className="h-3 bg-straw rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${results.riskScore}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${results.riskScore <= 33 ? 'bg-paddy' : results.riskScore <= 66 ? 'bg-amber-500' : 'bg-terracotta'}`} />
                  </div>
                  <p className="mt-4 font-semibold text-soil">{results.riskLevel} · {results.riskScore}/100</p>
                  <p className="text-sm text-soil/60">{results.advice}</p>
                </section>
                <section className="bg-white rounded-xl border border-straw shadow-sm p-5">
                  <h3 className="font-semibold text-soil">MSP for Your Crop</h3>
                  <p className="font-tamil text-sm text-soil/60 mb-4">உங்கள் பயிரின் MSP</p>
                  <TrendingUp className="w-7 h-7 text-paddy mb-2" />
                  <p className="text-3xl font-semibold text-paddy">{formatINR(displayedMsp)}</p>
                  <p className="text-sm text-soil/60">per quintal</p>
                </section>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => generateFarmerPDF(farmerData, results)} className="bg-turmeric text-white rounded-lg font-semibold py-3 px-6 shadow-lg shadow-turmeric/30 hover:bg-turmeric/90 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </motion.button>
                <button onClick={() => setResults(null)} className="border-2 border-paddy text-paddy rounded-lg py-3 px-6 hover:bg-paddy-light">Check another farmer</button>
              </div>
            </div>
          )}
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
