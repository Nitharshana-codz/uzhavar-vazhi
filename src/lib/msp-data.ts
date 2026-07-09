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
  {
    id: "paddy-common",
    en: "Paddy",
    ta: "நெல்",
    msp: 2441,
    season: "Kharif",
    change: 5.2,
    crop: "Paddy",
    tamilName: "நெல்",
    variety: "Common",
    mspPerQuintal: 2441,
    mspPerKg: 24.41,
    category: "Cereals",
  },
  {
    id: "paddy-grade-a",
    en: "Paddy",
    ta: "நெல் (Grade A)",
    msp: 2461,
    season: "Kharif",
    change: 5.2,
    crop: "Paddy",
    tamilName: "நெல் (Grade A)",
    variety: "Grade A",
    mspPerQuintal: 2461,
    mspPerKg: 24.61,
    category: "Cereals",
  },
  {
    id: "sorghum-hybrid",
    en: "Sorghum",
    ta: "சோளம்",
    msp: 4023,
    season: "Kharif",
    change: 4.5,
    crop: "Sorghum",
    tamilName: "சோளம்",
    variety: "Hybrid",
    mspPerQuintal: 4023,
    mspPerKg: 40.23,
    category: "Cereals",
  },
  {
    id: "sorghum-maldandi",
    en: "Sorghum",
    ta: "சோளம் (மல்தாண்டி)",
    msp: 4073,
    season: "Kharif",
    change: 4.5,
    crop: "Sorghum",
    tamilName: "சோளம் (மல்தாண்டி)",
    variety: "Maldandi",
    mspPerQuintal: 4073,
    mspPerKg: 40.73,
    category: "Cereals",
  },
  {
    id: "cumbu",
    en: "Cumbu",
    ta: "கம்பு",
    msp: 2900,
    season: "Kharif",
    change: 5.1,
    crop: "Cumbu",
    tamilName: "கம்பு",
    mspPerQuintal: 2900,
    mspPerKg: 29,
    category: "Cereals",
  },
  {
    id: "maize",
    en: "Maize",
    ta: "மக்காச்சோளம்",
    msp: 2410,
    season: "Kharif",
    change: 7.0,
    crop: "Maize",
    tamilName: "மக்காச்சோளம்",
    mspPerQuintal: 2410,
    mspPerKg: 24.10,
    category: "Cereals",
  },
  {
    id: "ragi",
    en: "Ragi",
    ta: "ராகி",
    msp: 5205,
    season: "Kharif",
    change: 6.4,
    crop: "Ragi",
    tamilName: "ராகி",
    mspPerQuintal: 5205,
    mspPerKg: 52.05,
    category: "Cereals",
  },
  {
    id: "redgram",
    en: "Redgram",
    ta: "துவரம் பருப்பு",
    msp: 8450,
    season: "Kharif",
    change: 6.0,
    crop: "Redgram",
    tamilName: "துவரம் பருப்பு",
    mspPerQuintal: 8450,
    mspPerKg: 84.50,
    category: "Pulses",
  },
  {
    id: "greengram",
    en: "Greengram",
    ta: "பாசிப்பருப்பு",
    msp: 8780,
    season: "Kharif",
    change: 6.0,
    crop: "Greengram",
    tamilName: "பாசிப்பருப்பு",
    mspPerQuintal: 8780,
    mspPerKg: 87.80,
    category: "Pulses",
  },
  {
    id: "blackgram",
    en: "Blackgram",
    ta: "உளுந்து",
    msp: 8200,
    season: "Kharif",
    change: 5.8,
    crop: "Blackgram",
    tamilName: "உளுந்து",
    mspPerQuintal: 8200,
    mspPerKg: 82.00,
    category: "Pulses",
  },
  {
    id: "bengalgram",
    en: "Bengalgram",
    ta: "கடலை பருப்பு",
    msp: 5875,
    season: "Rabi",
    change: 5.0,
    crop: "Bengalgram",
    tamilName: "கடலை பருப்பு",
    mspPerQuintal: 5875,
    mspPerKg: 58.75,
    category: "Pulses",
  },
  {
    id: "cotton-medium",
    en: "Cotton",
    ta: "பருத்தி",
    msp: 8267,
    season: "Kharif",
    change: 8.9,
    crop: "Cotton",
    tamilName: "பருத்தி",
    variety: "Medium Staple",
    mspPerQuintal: 8267,
    mspPerKg: 82.67,
    category: "Commercial Crops",
  },
  {
    id: "cotton-long",
    en: "Cotton",
    ta: "பருத்தி (நீண்ட நார்)",
    msp: 8667,
    season: "Kharif",
    change: 8.9,
    crop: "Cotton",
    tamilName: "பருத்தி (நீண்ட நார்)",
    variety: "Long Staple",
    mspPerQuintal: 8667,
    mspPerKg: 86.67,
    category: "Commercial Crops",
  },
  {
    id: "groundnut",
    en: "Groundnut",
    ta: "நிலக்கடலை",
    msp: 7517,
    season: "Kharif",
    change: 9.1,
    crop: "Groundnut",
    tamilName: "நிலக்கடலை",
    mspPerQuintal: 7517,
    mspPerKg: 75.17,
    category: "Oilseeds",
  },
  {
    id: "sugarcane",
    en: "Sugarcane",
    ta: "கரும்பு",
    msp: 365,
    season: "Annual",
    change: 7.4,
    crop: "Sugarcane",
    tamilName: "கரும்பு",
    mspPerQuintal: 365,
    mspPerKg: 3.65,
    category: "Commercial Crops",
  },
  {
    id: "sunflower",
    en: "Sunflower",
    ta: "சூரியகாந்தி",
    msp: 8343,
    season: "Kharif",
    change: 5.3,
    crop: "Sunflower",
    tamilName: "சூரியகாந்தி",
    mspPerQuintal: 8343,
    mspPerKg: 83.43,
    category: "Oilseeds",
  },
  {
    id: "soyabean",
    en: "Soyabean",
    ta: "சோயாபீன்",
    msp: 5708,
    season: "Kharif",
    change: 5.0,
    crop: "Soyabean",
    tamilName: "சோயாபீன்",
    mspPerQuintal: 5708,
    mspPerKg: 57.08,
    category: "Oilseeds",
  },
  {
    id: "sesamum",
    en: "Sesamum",
    ta: "எள்",
    msp: 10346,
    season: "Kharif",
    change: 6.5,
    crop: "Sesamum",
    tamilName: "எள்",
    mspPerQuintal: 10346,
    mspPerKg: 103.46,
    category: "Oilseeds",
  },
  {
    id: "copra-milling",
    en: "Copra",
    ta: "உலர்ந்த தேங்காய்",
    msp: 12027,
    season: "Annual",
    change: 5.5,
    crop: "Copra",
    tamilName: "உலர்ந்த தேங்காய்",
    variety: "Milling",
    mspPerQuintal: 12027,
    mspPerKg: 120.27,
    category: "Plantation Crops",
  },
  {
    id: "copra-ball",
    en: "Copra",
    ta: "உலர்ந்த தேங்காய் (Ball)",
    msp: 12500,
    season: "Annual",
    change: 5.5,
    crop: "Copra",
    tamilName: "உலர்ந்த தேங்காய் (Ball)",
    variety: "Ball",
    mspPerQuintal: 12500,
    mspPerKg: 125,
    category: "Plantation Crops",
  },
  {
    id: "coconut",
    en: "Coconut",
    ta: "தேங்காய்",
    msp: 3250,
    season: "Annual",
    change: 6.0,
    crop: "Coconut",
    tamilName: "தேங்காய்",
    mspPerQuintal: 3250,
    mspPerKg: 32.5,
    category: "Plantation Crops",
  },
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
  "paddy-common": 2400,
  "paddy-grade-a": 2400,
  "sorghum-hybrid": 800,
  "sorghum-maldandi": 800,
  cumbu: 600,
  maize: 2600,
  ragi: 700,
  redgram: 300,
  greengram: 250,
  blackgram: 250,
  bengalgram: 350,
  "cotton-medium": 650,
  "cotton-long": 650,
  groundnut: 1200,
  sugarcane: 40000,
  sunflower: 400,
  soyabean: 500,
  sesamum: 200,
  "copra-milling": 600,
  "copra-ball": 600,
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
