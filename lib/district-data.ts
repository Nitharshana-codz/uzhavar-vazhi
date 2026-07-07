import coimbatore from "@/data/districts/coimbatore.json";
import madurai from "@/data/districts/madurai.json";
import salem from "@/data/districts/salem.json";
import thanjavur from "@/data/districts/thanjavur.json";

import coconut from "@/data/crops/coconut.json";
import cotton from "@/data/crops/cotton.json";
import maize from "@/data/crops/maize.json";
import paddy from "@/data/crops/paddy.json";
import ragi from "@/data/crops/ragi.json";
import turmeric from "@/data/crops/turmeric.json";

export type VerificationStatus =
  | "needs_official_verification"
  | "partially_verified"
  | "verified";

export type DataMetadata = {
  source: string;
  source_url: string;
  last_verified: string | null;
  verification_status: VerificationStatus;
  verified_by: string;
  notes: string;
};

export type District = {
  id: string;
  name: string;
  tamilName: string;
  region: string;
  agroClimaticZone: string;
  headquarters: string;
  mainCrops: string[];
  cropIds: string[];
  bankIds: string[];
  availableSchemeIds: string[];
  avgRainfallMM: number;
  riskLevel: "Low" | "Medium" | "High";
  metadata: DataMetadata;
};

type RawDistrict = typeof coimbatore;
type RawCrop = typeof cotton;

const RAW_DISTRICTS: RawDistrict[] = [
  coimbatore,
  madurai,
  salem,
  thanjavur,
];

const CROPS_BY_ID: Record<string, RawCrop> = {
  coconut,
  cotton,
  maize,
  paddy,
  ragi,
  turmeric,
};

function toTitleCropName(cropId: string): string {
  return CROPS_BY_ID[cropId]?.name.en ?? cropId;
}

function getRiskLevel(avgRainfallMM: number): District["riskLevel"] {
  if (avgRainfallMM < 700 || avgRainfallMM > 1000) return "High";
  if (avgRainfallMM < 800) return "Medium";
  return "Low";
}

function toDistrict(rawDistrict: RawDistrict): District {
  return {
    id: rawDistrict.id,
    name: rawDistrict.name.en,
    tamilName: rawDistrict.name.ta,
    region: rawDistrict.region,
    agroClimaticZone: rawDistrict.agro_climatic_zone,
    headquarters: rawDistrict.headquarters,
    mainCrops: rawDistrict.major_crops.map(toTitleCropName),
    cropIds: rawDistrict.major_crops,
    bankIds: rawDistrict.banks,
    availableSchemeIds: rawDistrict.available_schemes,
    avgRainfallMM: rawDistrict.annual_rainfall_mm,
    riskLevel: getRiskLevel(rawDistrict.annual_rainfall_mm),
    metadata: rawDistrict.metadata as DataMetadata,
  };
}

export const DISTRICTS: District[] = RAW_DISTRICTS.map(toDistrict);

export function getDistrictByName(name: string): District | undefined {
  return DISTRICTS.find((district) => {
    const normalizedName = name.toLowerCase();
    return (
      district.name.toLowerCase() === normalizedName ||
      district.id.toLowerCase() === normalizedName
    );
  });
}

export function getAllDistrictNames(): string[] {
  return DISTRICTS.map((district) => district.name);
}

export function getDistrictResearchMetadata(name: string): DataMetadata | undefined {
  return getDistrictByName(name)?.metadata;
}

export const CROP_RISK_SENSITIVITY: Record<string, number> = {
  Paddy: 85,
  Rice: 85,
  Cotton: 65,
  Maize: 55,
  Turmeric: 50,
  Coconut: 40,
  Ragi: 45,
};

export function getCropSensitivity(crop: string): number {
  return CROP_RISK_SENSITIVITY[crop] ?? 55;
}
