export type MSPEntry = {
  id: string;
  en: string;
  ta: string;
  msp: number;
  season: "Kharif" | "Rabi" | "Annual";
  change: number;
  crop: string;
  tamilName: string;
  mspPerQuintal: number;
  mspPerKg: number;
  category: string;
  variety?: string;
};

export const mspCrops: MSPEntry[] = [
  { id: "paddy", en: "Paddy", ta: "நெல்", msp: 2441, season: "Kharif", change: 5.2, crop: "Paddy", tamilName: "நெல்", mspPerQuintal: 2441, mspPerKg: 24.41, category: "Cereals", variety: "Common" },
  { id: "sugarcane", en: "Sugarcane", ta: "கரும்பு", msp: 365, season: "Annual", change: 7.4, crop: "Sugarcane", tamilName: "கரும்பு", mspPerQuintal: 365, mspPerKg: 3.65, category: "Commercial Crops" },
  { id: "cotton", en: "Cotton", ta: "பருத்தி", msp: 8267, season: "Kharif", change: 8.9, crop: "Cotton", tamilName: "பருத்தி", mspPerQuintal: 8267, mspPerKg: 82.67, category: "Commercial Crops", variety: "Medium Staple" },
  { id: "groundnut", en: "Groundnut", ta: "நிலக்கடலை", msp: 7517, season: "Kharif", change: 9.1, crop: "Groundnut", tamilName: "நிலக்கடலை", mspPerQuintal: 7517, mspPerKg: 75.17, category: "Oilseeds" },
  { id: "maize", en: "Maize", ta: "மக்காச்சோளம்", msp: 2410, season: "Kharif", change: 7.0, crop: "Maize", tamilName: "மக்காச்சோளம்", mspPerQuintal: 2410, mspPerKg: 24.1, category: "Cereals" },
  { id: "turmeric", en: "Turmeric", ta: "மஞ்சள்", msp: 9500, season: "Annual", change: 6.5, crop: "Turmeric", tamilName: "மஞ்சள்", mspPerQuintal: 9500, mspPerKg: 95, category: "Spices" },
  { id: "banana", en: "Banana", ta: "வாழை", msp: 1800, season: "Annual", change: 4.2, crop: "Banana", tamilName: "வாழை", mspPerQuintal: 1800, mspPerKg: 18, category: "Horticulture" },
  { id: "coconut", en: "Coconut", ta: "தேங்காய்", msp: 3250, season: "Annual", change: 6.0, crop: "Coconut", tamilName: "தேங்காய்", mspPerQuintal: 3250, mspPerKg: 32.5, category: "Plantation Crops" },
];

export const MSP_DATA = mspCrops;

export function getMSPForCrop(cropName: string): MSPEntry[] {
  const normalized = cropName.toLowerCase();
  return MSP_DATA.filter((entry) => entry.crop.toLowerCase() === normalized || entry.id === normalized);
}

export function getBestMSPForCrop(cropName: string): MSPEntry | undefined {
  return getMSPForCrop(cropName).sort((a, b) => b.mspPerQuintal - a.mspPerQuintal)[0];
}

export function getAllCategories(): string[] {
  return Array.from(new Set(MSP_DATA.map((entry) => entry.category)));
}

export function getAllCropNames(): string[] {
  return Array.from(new Set(MSP_DATA.map((entry) => entry.crop)));
}

const yieldKgPerAcre: Record<string, number> = {
  paddy: 2400,
  cotton: 650,
  maize: 2600,
  groundnut: 1200,
  sugarcane: 40000,
  turmeric: 2200,
  banana: 18000,
  coconut: 6500,
};

export function calculateExpectedRevenue(cropName: string, landAcres: number) {
  const entry = getBestMSPForCrop(cropName);
  if (!entry) return null;
  const estimatedYieldKg = Math.round((yieldKgPerAcre[entry.id] ?? 1500) * landAcres);
  const revenueAtMSP = Math.round(estimatedYieldKg * entry.mspPerKg);
  const marketPricePerKg = Math.round(entry.mspPerKg * 0.82 * 100) / 100;
  const revenueAtMarket = Math.round(estimatedYieldKg * marketPricePerKg);
  return {
    estimatedYieldKg,
    revenueAtMSP,
    revenueAtMarket,
    lostToMiddlemen: revenueAtMSP - revenueAtMarket,
    mspPerKg: entry.mspPerKg,
    marketPricePerKg,
  };
}
