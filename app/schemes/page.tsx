'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, FileText, Shield } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { INSURANCE_SCHEMES, LOAN_SCHEMES } from '@/lib/schemes-data';

export default function SchemesPage() {
  const [tab, setTab] = useState<'loans' | 'insurance'>('loans');
  const items = useMemo(() => (tab === 'loans' ? LOAN_SCHEMES : INSURANCE_SCHEMES), [tab]);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-soil">Government Schemes</h1>
              <p className="font-tamil text-lg text-paddy">அரசு திட்டங்கள்</p>
              <p className="text-sm text-soil/60 mt-1">Loan and insurance options that can be matched from the dashboard.</p>
            </div>
            <div className="inline-flex bg-white border border-straw rounded-full p-1 w-fit">
              <button onClick={() => setTab('loans')} className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === 'loans' ? 'bg-turmeric text-white' : 'text-soil'}`}>Loans</button>
              <button onClick={() => setTab('insurance')} className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === 'insurance' ? 'bg-turmeric text-white' : 'text-soil'}`}>Insurance</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {items.map((item, index) => {
              const isLoan = 'maxAmount' in item;
              return (
                <motion.article key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="bg-white rounded-xl border border-straw shadow-sm p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isLoan ? 'bg-turmeric-light text-turmeric' : 'bg-paddy-light text-paddy'}`}>
                      {isLoan ? <Banknote className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                    </div>
                    <div>
                      <h2 className="font-semibold text-soil">{item.name}</h2>
                      <p className="font-tamil text-sm text-soil/60">{item.tamilName}</p>
                    </div>
                  </div>
                  {isLoan ? (
                    <div className="space-y-2 text-sm text-soil/70">
                      <p><span className="font-semibold text-soil">Provider:</span> {item.provider}</p>
                      <p><span className="font-semibold text-soil">Max:</span> {item.maxAmount ? `Rs. ${item.maxAmount.toLocaleString('en-IN')}` : 'Varies'}</p>
                      <p><span className="font-semibold text-soil">Interest:</span> {item.interestRate}</p>
                      <p><span className="font-semibold text-soil">Tenant:</span> {item.allowsTenant ? 'Allowed' : 'Not allowed'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-soil/70">
                      <p><span className="font-semibold text-soil">Provider:</span> {item.provider}</p>
                      <p>{item.coverage}</p>
                      <p><span className="font-semibold text-soil">Premium:</span> {item.premiumRate}</p>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-straw">
                    <p className="font-semibold text-soil flex items-center gap-2"><FileText className="w-4 h-4" /> Documents needed</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.documents.map((document) => <span key={document} className="px-3 py-1 rounded-full text-xs bg-paddy-light text-paddy">{document}</span>)}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}
