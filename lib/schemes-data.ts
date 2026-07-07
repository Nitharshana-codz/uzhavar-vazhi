import kcc from "@/data/schemes/kcc.json";
import nabard from "@/data/schemes/nabard.json";
import pmfby from "@/data/schemes/pmfby.json";
import tnInterestFreeCropLoan from "@/data/schemes/tn_interest_free_crop_loan.json";

import aadhaar from "@/data/documents/aadhaar.json";
import bankPassbook from "@/data/documents/bank_passbook.json";
import chitta from "@/data/documents/chitta.json";
import cropSowingCertificate from "@/data/documents/crop_sowing_certificate.json";
import landRecord from "@/data/documents/land_record.json";
import patta from "@/data/documents/patta.json";
import photo from "@/data/documents/photo.json";

import type { DataMetadata } from "./district-data";

export type LoanScheme = {
  id: string;
  name: string;
  tamilName: string;
  provider: string;
  maxAmount: number | null;
  interestRate: string;
  minLandAcres: number;
  allowsTenant: boolean;
  documents: string[];
  documentIds: string[];
  metadata: DataMetadata;
};

export type InsuranceScheme = {
  id: string;
  name: string;
  tamilName: string;
  coverage: string;
  premiumRate: string;
  eligibleCrops: string[];
  documents: string[];
  documentIds: string[];
  metadata: DataMetadata;
};

type RawScheme = {
  id: string;
  name: {
    en: string;
    ta: string;
  };
  interest_rate?: number;
  collateral_free_limit?: number;
  tenant_farmer: boolean;
  documents: string[];
  metadata: unknown;
};
type RawDocument = typeof aadhaar;

const DOCUMENTS_BY_ID: Record<string, RawDocument> = {
  aadhaar,
  bank_passbook: bankPassbook,
  chitta,
  crop_sowing_certificate: cropSowingCertificate,
  land_record: landRecord,
  patta,
  photo,
};

function documentName(documentId: string): string {
  return DOCUMENTS_BY_ID[documentId]?.name.en ?? documentId;
}

function interestRateText(rate: number | undefined): string {
  return typeof rate === "number" ? `${rate}%` : "Varies by bank and scheme";
}

function toLoanScheme(
  rawScheme: RawScheme,
  provider: string,
  maxAmount: number | null,
  minLandAcres = 0
): LoanScheme {
  return {
    id: rawScheme.id,
    name: rawScheme.name.en,
    tamilName: rawScheme.name.ta,
    provider,
    maxAmount,
    interestRate: interestRateText(rawScheme.interest_rate),
    minLandAcres,
    allowsTenant: rawScheme.tenant_farmer,
    documents: rawScheme.documents.map(documentName),
    documentIds: rawScheme.documents,
    metadata: rawScheme.metadata as DataMetadata,
  };
}

export const LOAN_SCHEMES: LoanScheme[] = [
  toLoanScheme(
    kcc,
    "Nationalised, commercial, regional rural, and cooperative banks",
    kcc.collateral_free_limit
  ),
  toLoanScheme(
    nabard,
    "NABARD through eligible banks and financial institutions",
    null
  ),
  toLoanScheme(
    tnInterestFreeCropLoan,
    "Tamil Nadu cooperative credit institutions",
    null
  ),
];

export const INSURANCE_SCHEMES: InsuranceScheme[] = [
  {
    id: pmfby.id,
    name: pmfby.name.en,
    tamilName: pmfby.name.ta,
    coverage:
      "Crop insurance coverage for notified risks, crops, areas, and seasons as defined by official PMFBY notifications",
    premiumRate: "Varies by crop, season, and official notification",
    eligibleCrops: ["All"],
    documents: pmfby.documents.map(documentName),
    documentIds: pmfby.documents,
    metadata: pmfby.metadata as DataMetadata,
  },
];

export function getEligibleLoans(landAcres: number, isTenant: boolean): LoanScheme[] {
  return LOAN_SCHEMES.filter((scheme) => {
    const meetsLandRequirement = landAcres >= scheme.minLandAcres;
    const tenantAllowed = isTenant ? scheme.allowsTenant : true;
    return meetsLandRequirement && tenantAllowed;
  });
}

export function getEligibleInsurance(crop: string): InsuranceScheme[] {
  return INSURANCE_SCHEMES.filter((scheme) => {
    return (
      scheme.eligibleCrops.includes("All") ||
      scheme.eligibleCrops.some(
        (eligibleCrop) => eligibleCrop.toLowerCase() === crop.toLowerCase()
      )
    );
  });
}

export function getSchemeResearchMetadata(id: string): DataMetadata | undefined {
  const scheme = [...LOAN_SCHEMES, ...INSURANCE_SCHEMES].find(
    (entry) => entry.id === id
  );
  return scheme?.metadata;
}
