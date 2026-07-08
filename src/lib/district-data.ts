import districts from "@/data/districts.json";

export type DataMetadata = {
  source: string;
  source_url: string;
  last_verified: string | null;
  verification_status: "needs_official_verification" | "partially_verified" | "verified";
  verified_by: string;
  notes: string;
};

export type District = {
  id: string;
  name: string;
  tamilName: string;
  avgRainfallMM: number;
  riskLevel: "Low" | "Medium" | "High";
};

const rainfallByDistrict: Record<string, number> = {
  coimbatore: 690,
  madurai: 840,
  salem: 820,
  thanjavur: 960,
  chennai: 1400,
  nilgiris: 1900,
  ramanathapuram: 640,
  tirunelveli: 815,
  erode: 720,
};

function riskFromRainfall(rainfall: number): District["riskLevel"] {
  if (rainfall < 700 || rainfall > 1200) return "High";
  if (rainfall < 800 || rainfall > 1000) return "Medium";
  return "Low";
}

export const DISTRICTS: District[] = districts.map((district) => {
  const avgRainfallMM = rainfallByDistrict[district.id] ?? 880;
  return {
    id: district.id,
    name: district.en,
    tamilName: district.ta,
    avgRainfallMM,
    riskLevel: riskFromRainfall(avgRainfallMM),
  };
});

export function getDistrictByName(name: string): District | undefined {
  const normalized = name.toLowerCase();
  return DISTRICTS.find((district) => district.id === normalized || district.name.toLowerCase() === normalized);
}

export function getAllDistrictNames(): string[] {
  return DISTRICTS.map((district) => district.name);
}

export const CROP_RISK_SENSITIVITY: Record<string, number> = {
  Paddy: 85,
  Cotton: 65,
  Maize: 55,
  Turmeric: 50,
  Coconut: 40,
  Groundnut: 60,
  Sugarcane: 70,
  Banana: 75,
};

export function getCropSensitivity(crop: string): number {
  return CROP_RISK_SENSITIVITY[crop] ?? 55;
}
