'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '../src/components/Navbar';
import { Hero } from '../src/components/Hero';
import { StepBar } from '../src/components/StepBar';
import { Step1Form } from '../src/components/steps/Step1Form';
import { Step2Results } from '../src/components/steps/Step2Results';
import { Step3PDF } from '../src/components/steps/Step3PDF';
import { Footer } from '../src/components/Footer';

export interface FarmerData {
  district: string;
  crop: string;
  landSize: number;
  ownership: 'owned' | 'tenant' | 'leasehold';
  farmerName: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);

  const handleStep1Submit = (data: FarmerData) => {
    setFarmerData(data);
    setCurrentStep(2);
  };

  const handleStep2Next = () => setCurrentStep(3);
  const handleStep2Back = () => setCurrentStep(1);
  const handleStep3Back = () => setCurrentStep(2);

  const handleReset = () => {
    setFarmerData(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        {currentStep === 1 && <Hero />}
        <StepBar currentStep={currentStep} />
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1Form key="step1" onSubmit={handleStep1Submit} />
          )}
          {currentStep === 2 && farmerData && (
            <Step2Results
              key="step2"
              farmerData={farmerData}
              onNext={handleStep2Next}
              onBack={handleStep2Back}
            />
          )}
          {currentStep === 3 && farmerData && (
            <Step3PDF
              key="step3"
              farmerData={farmerData}
              onBack={handleStep3Back}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
