// lib/schemes-data.ts
// This file stores the rules for loan schemes and insurance schemes.
// Our eligibility API route will read this file and match farmers against these rules.

// Blueprint for a loan scheme
export type LoanScheme = {
  id: string;                 // unique short code, e.g. "kcc"
  name: string;                // English name
  tamilName: string;           // Tamil name
  provider: string;            // who offers it
  maxAmount: number;           // maximum loan amount in rupees
  interestRate: string;        // interest rate as text (e.g. "4%")
  minLandAcres: number;        // minimum land size required to qualify
  allowsTenant: boolean;       // true if tenant farmers (not just owners) can apply
  documents: string[];         // documents needed
};

// Blueprint for an insurance scheme
export type InsuranceScheme = {
  id: string;
  name: string;
  tamilName: string;
  coverage: string;            // what it protects against
  premiumRate: string;         // cost to the farmer
  eligibleCrops: string[];     // which crops this applies to ("All" means every crop)
};

// All loan schemes we support right now
export const LOAN_SCHEMES: LoanScheme[] = [
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    tamilName: "கிசான் கிரெடிட் கார்டு",
    provider: "Nationalised & Cooperative Banks",
    maxAmount: 300000,
    interestRate: "4% (with government subvention)",
    minLandAcres: 0.5,
    allowsTenant: true,
    documents: ["Aadhaar card", "Land record (patta/chitta)", "Bank passbook", "Passport photo"],
  },
  {
    id: "nabard-short-term",
    name: "NABARD Short-Term Crop Loan",
    tamilName: "நபார்டு குறுகிய கால பயிர் கடன்",
    provider: "NABARD via Cooperative Banks",
    maxAmount: 100000,
    interestRate: "7% (subsidised)",
    minLandAcres: 0.25,
    allowsTenant: true,
    documents: ["Aadhaar card", "Patta/chitta", "Crop sowing certificate"],
  },
  {
    id: "tn-coop-loan",
    name: "TN Cooperative Crop Loan",
    tamilName: "தமிழ்நாடு கூட்டுறவு பயிர் கடன்",
    provider: "Tamil Nadu State Cooperative Bank",
    maxAmount: 150000,
    interestRate: "3% (TN govt subsidy)",
    minLandAcres: 0.5,
    allowsTenant: false,
    documents: ["Aadhaar card", "Cooperative society membership", "Land ownership proof"],
  },
];

// All insurance schemes we support right now
export const INSURANCE_SCHEMES: InsuranceScheme[] = [
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    tamilName: "பிரதம மந்திரி பயிர் காப்பீடு திட்டம்",
    coverage: "Crop loss due to drought, flood, pest, disease, or natural calamity",
    premiumRate: "2% for Kharif crops, 1.5% for Rabi crops",
    eligibleCrops: ["Rice", "Cotton", "Groundnut", "Maize", "Sugarcane"],
  },
  {
    id: "rwbcis",
    name: "Restructured Weather Based Crop Insurance Scheme",
    tamilName: "மறுகட்டமைக்கப்பட்ட வானிலை அடிப்படையிலான பயிர் காப்பீடு",
    coverage: "Losses from rainfall, temperature, or humidity deviation",
    premiumRate: "Approx. 4-6%, varies by district",
    eligibleCrops: ["All"],
  },
];

// Helper: find loan schemes a farmer qualifies for based on land size and tenant status
export function getEligibleLoans(landAcres: number, isTenant: boolean): LoanScheme[] {
  return LOAN_SCHEMES.filter((scheme) => {
    const meetsLandRequirement = landAcres >= scheme.minLandAcres;
    const tenantAllowed = isTenant ? scheme.allowsTenant : true;
    return meetsLandRequirement && tenantAllowed;
  });
}

// Helper: find insurance schemes that cover a specific crop
export function getEligibleInsurance(crop: string): InsuranceScheme[] {
  return INSURANCE_SCHEMES.filter((scheme) => {
    return (
      scheme.eligibleCrops.includes("All") ||
      scheme.eligibleCrops.some(
        (c) => c.toLowerCase() === crop.toLowerCase()
      )
    );
  });
}