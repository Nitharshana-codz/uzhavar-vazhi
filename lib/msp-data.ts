// lib/msp-data.ts
// MSP (Minimum Support Price) data for Tamil Nadu crops.
// Source: Official CCEA 2026-27 announcement
// Unit: Indian Rupees per Quintal (1 quintal = 100 kg)

export type MSPEntry = {
  crop: string;
  tamilName: string;
  variety?: string;
  season: "Kharif" | "Rabi" | "Both";
  mspPerQuintal: number;
  mspPerKg: number;
  category: string;
};

export const MSP_DATA: MSPEntry[] = [
  {
    crop: "Paddy",
    tamilName: "நெல்",
    variety: "Common",
    season: "Kharif",
    mspPerQuintal: 2441,
    mspPerKg: 24.41,
    category: "Cereals",
  },
  {
    crop: "Paddy",
    tamilName: "நெல் (Grade A)",
    variety: "Grade A",
    season: "Kharif",
    mspPerQuintal: 2461,
    mspPerKg: 24.61,
    category: "Cereals",
  },
  {
    crop: "Sorghum",
    tamilName: "சோளம்",
    variety: "Hybrid",
    season: "Kharif",
    mspPerQuintal: 4023,
    mspPerKg: 40.23,
    category: "Cereals",
  },
  {
    crop: "Sorghum",
    tamilName: "சோளம் (மல்தாண்டி)",
    variety: "Maldandi",
    season: "Kharif",
    mspPerQuintal: 4073,
    mspPerKg: 40.73,
    category: "Cereals",
  },
  {
    crop: "Cumbu",
    tamilName: "கம்பு",
    season: "Kharif",
    mspPerQuintal: 2900,
    mspPerKg: 29.00,
    category: "Cereals",
  },
  {
    crop: "Maize",
    tamilName: "மக்காச்சோளம்",
    season: "Kharif",
    mspPerQuintal: 2410,
    mspPerKg: 24.10,
    category: "Cereals",
  },
  {
    crop: "Ragi",
    tamilName: "ராகி",
    season: "Kharif",
    mspPerQuintal: 5205,
    mspPerKg: 52.05,
    category: "Cereals",
  },
  {
    crop: "Redgram",
    tamilName: "துவரம் பருப்பு",
    season: "Kharif",
    mspPerQuintal: 8450,
    mspPerKg: 84.50,
    category: "Pulses",
  },
  {
    crop: "Greengram",
    tamilName: "பாசிப்பருப்பு",
    season: "Kharif",
    mspPerQuintal: 8780,
    mspPerKg: 87.80,
    category: "Pulses",
  },
  {
    crop: "Blackgram",
    tamilName: "உளுந்து",
    season: "Kharif",
    mspPerQuintal: 8200,
    mspPerKg: 82.00,
    category: "Pulses",
  },
  {
    crop: "Bengalgram",
    tamilName: "கடலை பருப்பு",
    season: "Rabi",
    mspPerQuintal: 5875,
    mspPerKg: 58.75,
    category: "Pulses",
  },
  {
    crop: "Cotton",
    tamilName: "பருத்தி",
    variety: "Medium Staple",
    season: "Kharif",
    mspPerQuintal: 8267,
    mspPerKg: 82.67,
    category: "Commercial Crops",
  },
  {
    crop: "Cotton",
    tamilName: "பருத்தி (நீண்ட நார்)",
    variety: "Long Staple",
    season: "Kharif",
    mspPerQuintal: 8667,
    mspPerKg: 86.67,
    category: "Commercial Crops",
  },
  {
    crop: "Groundnut",
    tamilName: "நிலக்கடலை",
    season: "Kharif",
    mspPerQuintal: 7517,
    mspPerKg: 75.17,
    category: "Oilseeds",
  },
  {
    crop: "Sugarcane",
    tamilName: "கரும்பு",
    variety: "10% sugar recovery",
    season: "Both",
    mspPerQuintal: 365,
    mspPerKg: 3.65,
    category: "Commercial Crops",
  },
  {
    crop: "Sunflower",
    tamilName: "சூரியகாந்தி",
    season: "Kharif",
    mspPerQuintal: 8343,
    mspPerKg: 83.43,
    category: "Oilseeds",
  },
  {
    crop: "Soyabean",
    tamilName: "சோயாபீன்",
    season: "Kharif",
    mspPerQuintal: 5708,
    mspPerKg: 57.08,
    category: "Oilseeds",
  },
  {
    crop: "Sesamum",
    tamilName: "எள்",
    season: "Kharif",
    mspPerQuintal: 10346,
    mspPerKg: 103.46,
    category: "Oilseeds",
  },
  {
    crop: "Copra",
    tamilName: "உலர்ந்த தேங்காய்",
    variety: "Milling",
    season: "Both",
    mspPerQuintal: 12027,
    mspPerKg: 120.27,
    category: "Plantation Crops",
  },
  {
    crop: "Copra",
    tamilName: "உலர்ந்த தேங்காய் (Ball)",
    variety: "Ball",
    season: "Both",
    mspPerQuintal: 12500,
    mspPerKg: 125.00,
    category: "Plantation Crops",
  },
  {
    crop: "Coconut",
    tamilName: "தேங்காய்",
    variety: "Dehusked",
    season: "Both",
    mspPerQuintal: 3250,
    mspPerKg: 32.50,
    category: "Plantation Crops",
  },
];

// Helper: get MSP for a specific crop (returns all varieties if multiple exist)
export function getMSPForCrop(cropName: string): MSPEntry[] {
  return MSP_DATA.filter(
    (m) => m.crop.toLowerCase() === cropName.toLowerCase()
  );
}

// Helper: get the best (highest) MSP for a crop — useful for revenue calculation
export function getBestMSPForCrop(cropName: string): MSPEntry | undefined {
  const entries = getMSPForCrop(cropName);
  if (entries.length === 0) return undefined;
  return entries.reduce((best, current) =>
    current.mspPerQuintal > best.mspPerQuintal ? current : best
  );
}

// Helper: get all crops in a specific category
export function getMSPByCategory(category: string): MSPEntry[] {
  return MSP_DATA.filter(
    (m) => m.category.toLowerCase() === category.toLowerCase()
  );
}

// Helper: get all unique crop names (no duplicates for varieties)
export function getAllCropNames(): string[] {
  return [...new Set(MSP_DATA.map((m) => m.crop))];
}

// Helper: get all unique categories
export function getAllCategories(): string[] {
  return [...new Set(MSP_DATA.map((m) => m.category))];
}

// Average yield per acre for TN crops (kg/acre) — conservative estimates
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

// Helper: calculate expected earnings for a farmer
export function calculateExpectedRevenue(
  cropName: string,
  landAcres: number
): {
  estimatedYieldKg: number;
  expectedRevenueAtMSP: number;
  expectedRevenueAtMarket: number;
  lostToMiddlemen: number;
} | null {
  const msp = getBestMSPForCrop(cropName);
  if (!msp) return null;

  const yieldPerAcre = YIELD_PER_ACRE[cropName] ?? 800;
  const estimatedYieldKg = Math.round(yieldPerAcre * landAcres);
  const expectedRevenueAtMSP = Math.round(estimatedYieldKg * msp.mspPerKg);

  // Market price is typically 15-20% below MSP for small farmers
  const marketPricePerKg = msp.mspPerKg * 0.82;
  const expectedRevenueAtMarket = Math.round(estimatedYieldKg * marketPricePerKg);
  const lostToMiddlemen = expectedRevenueAtMSP - expectedRevenueAtMarket;

  return {
    estimatedYieldKg,
    expectedRevenueAtMSP,
    expectedRevenueAtMarket,
    lostToMiddlemen,
  };
}