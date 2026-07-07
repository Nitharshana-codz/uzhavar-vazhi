import msp2025 from "@/data/msp/2025-26.json";
import msp2026 from "@/data/msp/2026-27.json";

import cotton from "@/data/crops/cotton.json";
import maize from "@/data/crops/maize.json";
import paddy from "@/data/crops/paddy.json";
import ragi from "@/data/crops/ragi.json";

import type { DataMetadata } from "./district-data";

export type MSPEntry = {
  crop: string;
  tamilName: string;
  variety?: string;
  season: "Kharif" | "Rabi" | "Both";
  mspPerQuintal: number;
  mspPerKg: number;
  category: string;
  marketingSeason: string;
  metadata: DataMetadata;
};

type CropInfo = {
  crop: string;
  tamilName: string;
  variety?: string;
  season: MSPEntry["season"];
  category: string;
};

const PRICE_KEY_TO_CROP: Record<string, CropInfo> = {
  paddy_common: {
    crop: paddy.name.en,
    tamilName: paddy.name.ta,
    variety: "Common",
    season: "Kharif",
    category: "Cereals",
  },
  maize: {
    crop: maize.name.en,
    tamilName: maize.name.ta,
    season: "Kharif",
    category: "Cereals",
  },
  cotton_medium: {
    crop: cotton.name.en,
    tamilName: cotton.name.ta,
    variety: "Medium Staple",
    season: "Kharif",
    category: "Commercial Crops",
  },
  ragi: {
    crop: ragi.name.en,
    tamilName: ragi.name.ta,
    season: "Kharif",
    category: "Cereals",
  },
};

function buildMSPEntries(
  source: typeof msp2025 | typeof msp2026
): MSPEntry[] {
  return Object.entries(source.prices)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number")
    .map(([priceKey, mspPerQuintal]) => {
      const cropInfo = PRICE_KEY_TO_CROP[priceKey];

      return {
        crop: cropInfo.crop,
        tamilName: cropInfo.tamilName,
        variety: cropInfo.variety,
        season: cropInfo.season,
        category: cropInfo.category,
        marketingSeason: source.season,
        mspPerQuintal,
        mspPerKg: mspPerQuintal / 100,
        metadata: source.metadata as DataMetadata,
      };
    });
}

const LATEST_NUMERIC_MSP_SOURCE = Object.values(msp2026.prices).some(
  (price) => typeof price === "number"
)
  ? msp2026
  : msp2025;

export const MSP_SEASON = LATEST_NUMERIC_MSP_SOURCE.season;
export const MSP_DATA: MSPEntry[] = buildMSPEntries(LATEST_NUMERIC_MSP_SOURCE);

export function getMSPForCrop(cropName: string): MSPEntry[] {
  return MSP_DATA.filter(
    (msp) => msp.crop.toLowerCase() === cropName.toLowerCase()
  );
}

export function getBestMSPForCrop(cropName: string): MSPEntry | undefined {
  const entries = getMSPForCrop(cropName);
  if (entries.length === 0) return undefined;
  return entries.reduce((best, current) =>
    current.mspPerQuintal > best.mspPerQuintal ? current : best
  );
}

export function getMSPByCategory(category: string): MSPEntry[] {
  return MSP_DATA.filter(
    (msp) => msp.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCropNames(): string[] {
  return [...new Set(MSP_DATA.map((msp) => msp.crop))];
}

export function getAllCategories(): string[] {
  return [...new Set(MSP_DATA.map((msp) => msp.category))];
}

export const YIELD_PER_ACRE: Record<string, number> = {
  Paddy: 1200,
  Maize: 1400,
  Ragi: 700,
  Cotton: 300,
  Coconut: 4500,
};

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

export function getMSPResearchMetadata(): DataMetadata {
  return LATEST_NUMERIC_MSP_SOURCE.metadata as DataMetadata;
}

export const MSP_PENDING_UPDATE = {
  season: msp2026.season,
  status: msp2026.status,
  metadata: msp2026.metadata as DataMetadata,
};
