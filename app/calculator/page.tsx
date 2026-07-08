'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import crops from '@/data/crops.json';

type CalculatorResult = {
  moneylender: { scenarios: { type: string; totalFormatted: string; interestFormatted: string }[] };
  bankLoans: { scenarios: { type: string; totalFormatted: string; interestFormatted: string; recommended?: boolean }[] };
  summary: { savingsFormatted: string; verdictEN: string; verdictTA: string; rateReduction: string };
};

export default function CalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [months, setMonths] = useState(6);
  const [cropName, setCropName] = useState('Paddy');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanAmount, months, cropName }),
      });
      if (!response.ok) throw new Error('Calculator failed');
      setResult(await response.json());
    } catch {
      setError('Could not calculate now. Please try again. / கணக்கிட முடியவில்லை.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-soil">Moneylender vs Bank Calculator</h1>
            <p className="font-tamil text-lg text-paddy">கடன் கணக்கீடு</p>
            <p className="text-sm text-soil/60 mt-1">Compare private loan cost against formal KCC and cooperative bank loans.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-straw shadow-sm p-6 space-y-4">
              <label className="block">
                <span className="font-medium text-soil">Loan Amount</span>
                <p className="font-tamil text-sm text-soil/60">கடன் தொகை</p>
                <input type="number" min="1000" max="1000000" className="w-full h-11 px-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none" value={loanAmount} onChange={(event) => setLoanAmount(Number(event.target.value))} />
              </label>
              <label className="block">
                <span className="font-medium text-soil">Duration in Months</span>
                <p className="font-tamil text-sm text-soil/60">மாதங்கள்</p>
                <input type="number" min="1" max="36" className="w-full h-11 px-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none" value={months} onChange={(event) => setMonths(Number(event.target.value))} />
              </label>
              <label className="block">
                <span className="font-medium text-soil">Crop</span>
                <p className="font-tamil text-sm text-soil/60">பயிர்</p>
                <select className="w-full h-11 px-3 border border-straw rounded-lg bg-white focus:border-turmeric focus:ring-2 focus:ring-turmeric/20 outline-none" value={cropName} onChange={(event) => setCropName(event.target.value)}>
                  {crops.map((crop) => <option key={crop.id} value={crop.en}>{crop.en}</option>)}
                </select>
              </label>
              {error && <p className="text-sm text-terracotta">{error}</p>}
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="w-full bg-turmeric text-white rounded-lg font-semibold py-3 px-6 shadow-lg shadow-turmeric/30 hover:bg-turmeric/90 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Calculate Savings
              </motion.button>
            </form>

            <section className="bg-white rounded-xl border border-straw shadow-sm p-6">
              {!result ? (
                <div className="h-full min-h-[280px] flex items-center justify-center text-center text-soil/60">
                  <p>Enter values to compare loan options.<span className="block font-tamil text-sm">கடன் விருப்பங்களை ஒப்பிட மதிப்புகளை உள்ளிடவும்.</span></p>
                </div>
              ) : (
                <div>
                  <div className="rounded-xl bg-paddy text-white p-5 mb-5">
                    <p className="text-sm opacity-80">Estimated Savings</p>
                    <h2 className="text-3xl font-semibold">{result.summary.savingsFormatted}</h2>
                    <p className="mt-2 text-sm opacity-90">{result.summary.rateReduction}</p>
                  </div>
                  <p className="text-soil mb-2">{result.summary.verdictEN}</p>
                  <p className="font-tamil text-sm text-soil/60 mb-5">{result.summary.verdictTA}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-straw p-4">
                      <h3 className="font-semibold text-terracotta mb-3">Moneylender</h3>
                      {result.moneylender.scenarios.map((item) => <p key={item.type} className="text-sm mb-2">{item.type}<span className="block font-semibold">{item.totalFormatted}</span></p>)}
                    </div>
                    <div className="rounded-lg border border-straw p-4">
                      <h3 className="font-semibold text-paddy mb-3">Bank Loans</h3>
                      {result.bankLoans.scenarios.map((item) => <p key={item.type} className="text-sm mb-2">{item.type}<span className="block font-semibold">{item.totalFormatted}</span></p>)}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
