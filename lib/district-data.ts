// lib/district-data.ts
// This file stores basic data for all 38 districts of Tamil Nadu.
// Other files (like our API routes) will import this data to look things up.

// "type" creates a custom data shape in TypeScript.
// This says: a District object always has these exact fields, with these exact types.
export type District = {
  name: string;              // English name, e.g. "Coimbatore"
  tamilName: string;         // Tamil name, e.g. "கோயம்புத்தூர்"
  region: string;            // Which broad region of TN it belongs to
  mainCrops: string[];       // List of major crops grown there
  avgRainfallMM: number;     // Average annual rainfall in millimetres
  riskLevel: "Low" | "Medium" | "High"; // Pre-assessed seasonal risk category
};

// This is the actual list of districts.
// "DISTRICTS" is an array (a list) of District objects.
// We're starting with 8 districts to keep this manageable —
// Member 3 will expand this to all 38 once their research is ready.
export const DISTRICTS: District[] = [
  {
    name: "Coimbatore",
    tamilName: "கோயம்புத்தூர்",
    region: "Western",
    mainCrops: ["Cotton", "Maize", "Coconut", "Turmeric"],
    avgRainfallMM: 700,
    riskLevel: "Medium",
  },
  {
    name: "Madurai",
    tamilName: "மதுரை",
    region: "Southern",
    mainCrops: ["Rice", "Cotton", "Pulses"],
    avgRainfallMM: 850,
    riskLevel: "Medium",
  },
  {
    name: "Thanjavur",
    tamilName: "தஞ்சாவூர்",
    region: "Cauvery Delta",
    mainCrops: ["Rice", "Sugarcane", "Banana"],
    avgRainfallMM: 950,
    riskLevel: "Low",
  },
  {
    name: "Tirunelveli",
    tamilName: "திருநெல்வேலி",
    region: "Southern",
    mainCrops: ["Rice", "Banana", "Chilli"],
    avgRainfallMM: 780,
    riskLevel: "Medium",
  },
  {
    name: "Salem",
    tamilName: "சேலம்",
    region: "Western",
    mainCrops: ["Tapioca", "Mango", "Sugarcane"],
    avgRainfallMM: 870,
    riskLevel: "Medium",
  },
  {
    name: "Nagapattinam",
    tamilName: "நாகப்பட்டினம்",
    region: "Cauvery Delta",
    mainCrops: ["Rice", "Groundnut"],
    avgRainfallMM: 1050,
    riskLevel: "High",
  },
  {
    name: "Erode",
    tamilName: "ஈரோடு",
    region: "Western",
    mainCrops: ["Turmeric", "Cotton", "Coconut"],
    avgRainfallMM: 720,
    riskLevel: "Medium",
  },
  {
    name: "Villupuram",
    tamilName: "விழுப்புரம்",
    region: "Northern",
    mainCrops: ["Groundnut", "Rice", "Sugarcane"],
    avgRainfallMM: 1100,
    riskLevel: "High",
  },
];

// A helper function: given a district name, find and return its full data.
// "find" searches through the DISTRICTS array and returns the first match.
// Returns "undefined" if no match is found (we'll handle that case later).
export function getDistrictByName(name: string): District | undefined {
  return DISTRICTS.find(
    (d) => d.name.toLowerCase() === name.toLowerCase()
  );
}

// A helper function: returns just the list of district names.
// Useful later for the frontend dropdown (Member 2 will use this).
export function getAllDistrictNames(): string[] {
  return DISTRICTS.map((d) => d.name);
}

// Crop sensitivity to weather risk — how badly does each crop suffer from
// rainfall deviation or drought? Higher number = more sensitive = higher risk.
export const CROP_RISK_SENSITIVITY: Record<string, number> = {
  Rice: 85,
  Sugarcane: 70,
  Cotton: 65,
  Banana: 75,
  Groundnut: 60,
  Maize: 55,
  Turmeric: 50,
  Coconut: 40,
  Pulses: 60,
  Chilli: 65,
  Tapioca: 45,
  Mango: 35,
};

// Helper: get crop sensitivity score (defaults to 55 if crop not listed)
export function getCropSensitivity(crop: string): number {
  return CROP_RISK_SENSITIVITY[crop] ?? 55;
}