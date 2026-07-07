import districts from '@/src/data/districts.json';
import crops from '@/src/data/crops.json';
import riskMatrix from '@/src/data/riskMatrix.json';

export interface FarmerData {
  district: string;
  districtTa: string;
  crop: string;
  cropTa: string;
  landSize: number;
  ownership: 'owned' | 'tenant' | 'leasehold';
  cropMsp: number;
}

interface EligibilityResult {
  maxLoanAmount: number;
  eligibleSchemes: string[];
  insuranceMatches: string[];
  seasonalRisk: string;
  riskScore: number;
}

export function useEligibility(farmerData: FarmerData): EligibilityResult {
  const landSize = farmerData.landSize || 1;
  const isOwned = farmerData.ownership === 'owned';

  // Calculate max loan based on land size and ownership
  let maxLoanAmount = 0;
  if (isOwned) {
    maxLoanAmount = landSize * 200000; // ₹2L per acre for owned land
  } else if (farmerData.ownership === 'tenant') {
    maxLoanAmount = landSize * 150000; // ₹1.5L per acre for tenant
  } else {
    maxLoanAmount = landSize * 100000; // ₹1L per acre for leasehold
  }

  // Determine eligible schemes
  const eligibleSchemes = [];
  if (isOwned && landSize >= 0.5) {
    eligibleSchemes.push('kcc'); // KCC
  }
  if (landSize > 2) {
    eligibleSchemes.push('nabard'); // NABARD
  }
  if (farmerData.crop) {
    eligibleSchemes.push('pmfby'); // PMFBY Insurance
  }

  // Insurance matches
  const insuranceMatches = [];
  if (farmerData.crop) {
    insuranceMatches.push('pmfby');
    if (landSize > 1) {
      insuranceMatches.push('agri-gold');
    }
  }

  // Get seasonal risk
  const cropData = crops.find((c) => c.en === farmerData.crop);
  const riskData = (riskMatrix.crops as any)[farmerData.crop];

  return {
    maxLoanAmount,
    eligibleSchemes,
    insuranceMatches,
    seasonalRisk: riskData?.risk || 'medium',
    riskScore: riskData?.riskScore || 50,
  };
}
