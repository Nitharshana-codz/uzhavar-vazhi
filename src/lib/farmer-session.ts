export type StoredEligibility = {
  loans: {
    name: string;
    tamilName?: string;
    provider: string;
    maxAmount: number | null;
    interestRate: string;
    documents: string[];
  }[];
  insurance: {
    name: string;
    tamilName?: string;
    coverage: string;
    premiumRate: string;
  }[];
  district?: string;
  districtTamilName?: string;
};

export type StoredRiskData = {
  riskScore: number;
  riskLevel: string;
  advice: string;
};

export type FarmerSessionData = {
  eligibility?: StoredEligibility;
  riskData?: StoredRiskData;
  cropMsp?: number | null;
};

const SESSION_KEY = 'uzhavar-vazhi-farmer-session';

export function saveFarmerSession(data: FarmerSessionData): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function loadFarmerSession(): FarmerSessionData | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as FarmerSessionData;
  } catch {
    return null;
  }
}

export function clearFarmerSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}
