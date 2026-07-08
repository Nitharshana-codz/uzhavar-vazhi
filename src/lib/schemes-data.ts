export type LoanScheme = {
  id: string;
  name: string;
  tamilName: string;
  provider: string;
  providerTa: string;
  maxAmount: number | null;
  interestRate: string;
  minLandAcres: number;
  allowsTenant: boolean;
  documents: string[];
};

export type InsuranceScheme = {
  id: string;
  name: string;
  tamilName: string;
  provider: string;
  coverage: string;
  coverageTa: string;
  premiumRate: string;
  eligibleCrops: string[];
  documents: string[];
  howToClaim: string[];
};

export const LOAN_SCHEMES: LoanScheme[] = [
  {
    id: "kcc",
    name: "Kisan Credit Card",
    tamilName: "கிசான் கடன் அட்டை",
    provider: "Commercial, cooperative and regional rural banks",
    providerTa: "வணிக, கூட்டுறவு மற்றும் கிராம வங்கிகள்",
    maxAmount: 300000,
    interestRate: "4%",
    minLandAcres: 0.5,
    allowsTenant: true,
    documents: ["Aadhaar", "Bank passbook", "Land record or lease proof", "Crop sowing certificate"],
  },
  {
    id: "cooperative",
    name: "TN Cooperative Crop Loan",
    tamilName: "தமிழ்நாடு கூட்டுறவு பயிர் கடன்",
    provider: "Tamil Nadu Cooperative Bank",
    providerTa: "தமிழ்நாடு கூட்டுறவு வங்கி",
    maxAmount: 200000,
    interestRate: "0-7%",
    minLandAcres: 0.5,
    allowsTenant: false,
    documents: ["Aadhaar", "Chitta", "Patta", "Bank passbook"],
  },
  {
    id: "nabard",
    name: "NABARD Short Term Crop Loan",
    tamilName: "நபார்டு குறுகிய கால பயிர் கடன்",
    provider: "NABARD refinance through banks",
    providerTa: "வங்கிகள் வழியாக நபார்டு",
    maxAmount: 500000,
    interestRate: "7%",
    minLandAcres: 1,
    allowsTenant: true,
    documents: ["Aadhaar", "Bank passbook", "Land record", "Photo"],
  },
];

export const INSURANCE_SCHEMES: InsuranceScheme[] = [
  {
    id: "pmfby",
    name: "PMFBY Crop Insurance",
    tamilName: "பிரதம மந்திரி பயிர் காப்பீடு",
    provider: "Government of India",
    coverage: "Protection against notified crop loss from weather and local calamities",
    coverageTa: "வானிலை மற்றும் உள்ளூர் பேரிடர் பயிர் இழப்புகளுக்கான பாதுகாப்பு",
    premiumRate: "1.5-5%",
    eligibleCrops: ["All"],
    documents: ["Aadhaar", "Bank passbook", "Sowing certificate", "Land record"],
    howToClaim: ["Notify bank or insurer quickly", "Submit crop-loss evidence", "Track claim through PMFBY portal"],
  },
  {
    id: "tn-delta-relief",
    name: "Tamil Nadu Crop Relief",
    tamilName: "தமிழ்நாடு பயிர் நிவாரணம்",
    provider: "Government of Tamil Nadu",
    coverage: "Relief support for officially notified crop damage",
    coverageTa: "அரசால் அறிவிக்கப்பட்ட பயிர் சேதத்திற்கு நிவாரணம்",
    premiumRate: "No farmer premium",
    eligibleCrops: ["Paddy", "Cotton", "Groundnut", "Maize"],
    documents: ["Aadhaar", "Land record", "VAO certificate", "Bank passbook"],
    howToClaim: ["Report to VAO", "Complete field verification", "Receive DBT after approval"],
  },
];

export const schemes = { loans: LOAN_SCHEMES, insurance: INSURANCE_SCHEMES };

export function getEligibleLoans(landAcres: number, isTenant: boolean): LoanScheme[] {
  return LOAN_SCHEMES.filter((scheme) => landAcres >= scheme.minLandAcres && (!isTenant || scheme.allowsTenant));
}

export function getEligibleInsurance(crop: string): InsuranceScheme[] {
  return INSURANCE_SCHEMES.filter((scheme) => scheme.eligibleCrops.includes("All") || scheme.eligibleCrops.some((item) => item.toLowerCase() === crop.toLowerCase()));
}
