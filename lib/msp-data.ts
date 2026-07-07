// lib/msp-data.ts
// Official MSP (Minimum Support Price) for Tamil Nadu crops
// Source: CCEA Government of India — Season 2026-27
// Unit: Rs per Quintal (1 Quintal = 100 kg)

// ─── Type Definition ─────────────────────────────────────────────────────────
// This is the blueprint — every MSP entry must follow this exact shape
export type MSPEntry = {
  id: string;           // unique key e.g. "paddy-common"
  crop: string;         // English crop name
  tamilName: string;    // Tamil name (for web app display)
  variety?: string;     // some crops have varieties e.g. Cotton has Medium/Long
  season: "Kharif" | "Rabi" | "Both";
  mspPerQuintal: number; // official government price per 100kg
  mspPerKg: number;      // derived: mspPerQuintal / 100
  category: string;      // Cereals / Pulses / Oilseeds / Commercial Crops etc.
};

// ─── Official 2026-27 MSP Data ───────────────────────────────────────────────
// All 21 crops from your official data, exactly as provided
export const MSP_DATA: MSPEntry[] = [
  {
    id: "paddy-common",
    crop: "Paddy",
    tamilName: "நெல்",
    variety: "Common",
    season: "Kharif",
    mspPerQuintal: 2441,
    mspPerKg: 24.41,
    category: "Cereals",
  },
  {
    id: "paddy-grade-a",
    crop: "Paddy",
    tamilName: "நெல் (Grade A)",
    variety: "Grade A",
    season: "Kharif",
    mspPerQuintal: 2461,
    mspPerKg: 24.61,
    category: "Cereals",
  },
  {
    id: "sorghum-hybrid",
    crop: "Sorghum",
    tamilName: "சோளம்",
    variety: "Hybrid",
    season: "Kharif",
    mspPerQuintal: 4023,
    mspPerKg: 40.23,
    category: "Cereals",
  },
  {
    id: "sorghum-maldandi",
    crop: "Sorghum",
    tamilName: "சோளம் (மல்தாண்டி)",
    variety: "Maldandi",
    season: "Kharif",
    mspPerQuintal: 4073,
    mspPerKg: 40.73,
    category: "Cereals",
  },
  {
    id: "cumbu",
    crop: "Cumbu",
    tamilName: "கம்பு",
    season: "Kharif",
    mspPerQuintal: 2900,
    mspPerKg: 29.00,
    category: "Cereals",
  },
  {
    id: "maize",
    crop: "Maize",
    tamilName: "மக்காச்சோளம்",
    season: "Kharif",
    mspPerQuintal: 2410,
    mspPerKg: 24.10,
    category: "Cereals",
  },
  {
    id: "ragi",
    crop: "Ragi",
    tamilName: "ராகி",
    season: "Kharif",
    mspPerQuintal: 5205,
    mspPerKg: 52.05,
    category: "Cereals",
  },
  {
    id: "redgram",
    crop: "Redgram",
    tamilName: "துவரம் பருப்பு",
    season: "Kharif",
    mspPerQuintal: 8450,
    mspPerKg: 84.50,
    category: "Pulses",
  },
  {
    id: "greengram",
    crop: "Greengram",
    tamilName: "பாசிப்பருப்பு",
    season: "Kharif",
    mspPerQuintal: 8780,
    mspPerKg: 87.80,
    category: "Pulses",
  },
  {
    id: "blackgram",
    crop: "Blackgram",
    tamilName: "உளுந்து",
    season: "Kharif",
    mspPerQuintal: 8200,
    mspPerKg: 82.00,
    category: "Pulses",
  },
  {
    id: "bengalgram",
    crop: "Bengalgram",
    tamilName: "கடலை பருப்பு",
    season: "Rabi",
    mspPerQuintal: 5875,
    mspPerKg: 58.75,
    category: "Pulses",
  },
  {
    id: "cotton-medium",
    crop: "Cotton",
    tamilName: "பருத்தி",
    variety: "Medium Staple",
    season: "Kharif",
    mspPerQuintal: 8267,
    mspPerKg: 82.67,
    category: "Commercial Crops",
  },
  {
    id: "cotton-long",
    crop: "Cotton",
    tamilName: "பருத்தி (நீண்ட நார்)",
    variety: "Long Staple",
    season: "Kharif",
    mspPerQuintal: 8667,
    mspPerKg: 86.67,
    category: "Commercial Crops",
  },
  {
    id: "groundnut",
    crop: "Groundnut",
    tamilName: "நிலக்கடலை",
    season: "Kharif",
    mspPerQuintal: 7517,
    mspPerKg: 75.17,
    category: "Oilseeds",
  },
  {
    id: "sugarcane",
    crop: "Sugarcane",
    tamilName: "கரும்பு",
    variety: "10% sugar recovery",
    season: "Both",
    mspPerQuintal: 365,
    mspPerKg: 3.65,
    category: "Commercial Crops",
  },
  {
    id: "sunflower",
    crop: "Sunflower",
    tamilName: "சூரியகாந்தி",
    season: "Kharif",
    mspPerQuintal: 8343,
    mspPerKg: 83.43,
    category: "Oilseeds",
  },
  {
    id: "soyabean",
    crop: "Soyabean",
    tamilName: "சோயாபீன்",
    season: "Kharif",
    mspPerQuintal: 5708,
    mspPerKg: 57.08,
    category: "Oilseeds",
  },
  {
    id: "sesamum",
    crop: "Sesamum",
    tamilName: "எள்",
    season: "Kharif",
    mspPerQuintal: 10346,
    mspPerKg: 103.46,
    category: "Oilseeds",
  },
  {
    id: "copra-milling",
    crop: "Copra",
    tamilName: "உலர்ந்த தேங்காய்",
    variety: "Milling",
    season: "Both",
    mspPerQuintal: 12027,
    mspPerKg: 120.27,
    category: "Plantation Crops",
  },
  {
    id: "copra-ball",
    crop: "Copra",
    tamilName: "உலர்ந்த தேங்காய் (Ball)",
    variety: "Ball",
    season: "Both",
    mspPerQuintal: 12500,
    mspPerKg: 125.00,
    category: "Plantation Crops",
  },
  {
    id: "coconut-dehusked",
    crop: "Coconut",
    tamilName: "தேங்காய்",
    variety: "Dehusked",
    season: "Both",
    mspPerQuintal: 3250,
    mspPerKg: 32.50,
    category: "Plantation Crops",
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

// Get all entries for a crop (handles crops with multiple varieties)
export function getMSPForCrop(cropName: string): MSPEntry[] {
  return MSP_DATA.filter(
    (m) => m.crop.toLowerCase() === cropName.toLowerCase()
  );
}

// Get the highest MSP for a crop (best case for farmer)
export function getBestMSPForCrop(cropName: string): MSPEntry | undefined {
  const entries = getMSPForCrop(cropName);
  if (entries.length === 0) return undefined;
  return entries.reduce((best, current) =>
    current.mspPerQuintal > best.mspPerQuintal ? current : best
  );
}

// Get all unique crop names (no duplicates for varieties)
export function getAllCropNames(): string[] {
  return [...new Set(MSP_DATA.map((m) => m.crop))];
}

// Get all categories
export function getAllCategories(): string[] {
  return [...new Set(MSP_DATA.map((m) => m.category))];
}

// ─── Average Yield Per Acre ───────────────────────────────────────────────────
// Conservative estimates for Tamil Nadu farming conditions
// Unit: kg per acre
export const YIELD_PER_ACRE: Record<string, number> = {
  Paddy: 1200,
  Sorghum: 800,
  Cumbu: 600,
  Maize: 1400,
  Ragi: 700,
  Redgram: 300,
  Greengram: 250,
  Blackgram: 250,
  Bengalgram: 350,
  Cotton: 300,
  Groundnut: 500,
  Sugarcane: 30000,
  Sunflower: 400,
  Soyabean: 500,
  Sesamum: 200,
  Copra: 600,
  Coconut: 4500,
};

// ─── Revenue Calculator ───────────────────────────────────────────────────────
// The most important function — shows farmer what they LOSE to middlemen
export function calculateExpectedRevenue(
  cropName: string,
  landAcres: number
): {
  estimatedYieldKg: number;
  revenueAtMSP: number;       // what they SHOULD earn
  revenueAtMarket: number;    // what they ACTUALLY earn (middleman price)
  lostToMiddlemen: number;    // the difference — this is the powerful number
  mspPerKg: number;
  marketPricePerKg: number;
} | null {

  const bestMSP = getBestMSPForCrop(cropName);
  if (!bestMSP) return null;

  const yieldPerAcre = YIELD_PER_ACRE[cropName] ?? 800;
  const estimatedYieldKg = Math.round(yieldPerAcre * landAcres);

  // MSP revenue — guaranteed government price
  const revenueAtMSP = Math.round(estimatedYieldKg * bestMSP.mspPerKg);

  // Market price — middlemen typically pay 18% below MSP to small farmers
  const marketPricePerKg = parseFloat((bestMSP.mspPerKg * 0.82).toFixed(2));
  const revenueAtMarket = Math.round(estimatedYieldKg * marketPricePerKg);

  // The gap — money going to middlemen instead of the farmer
  const lostToMiddlemen = revenueAtMSP - revenueAtMarket;

  return {
    estimatedYieldKg,
    revenueAtMSP,
    revenueAtMarket,
    lostToMiddlemen,
    mspPerKg: bestMSP.mspPerKg,
    marketPricePerKg,
  };
}