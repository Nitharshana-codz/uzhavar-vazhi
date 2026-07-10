import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export type FarmerProfile = {
  district: string;
  districtTamilName: string;
  crop: string;
  cropTamilName?: string;
  landAcres: number;
  isTenant: boolean;
  farmerName?: string;
  eligibility?: string;
  season?: string;
  loans: {
    id?: string;
    name: string;
    tamilName?: string;
    provider: string;
    maxAmount: number | null;
    interestRate: string;
    documents: string[];
  }[];
  insurance: {
    id?: string;
    name: string;
    tamilName?: string;
    coverage: string;
    premiumRate: string;
  }[];
  riskScore: number;
  riskLevel: string;
  advice: string;
  cropMsp?: number;
  estimatedRevenue?: number;
  projectedLoss?: number;
};

type LegacyFarmerData = {
  farmerName?: string;
  district: string;
  districtTamilName?: string;
  crop: string;
  cropTamilName?: string;
  landSize?: number;
  landAcres?: number;
  ownership?: string;
  isTenant?: boolean;
};

type LegacyResultsData = {
  loans?: FarmerProfile["loans"];
  insurance?: FarmerProfile["insurance"];
  districtTamilName?: string;
  riskScore?: number;
  riskLevel?: string;
  advice?: string;
  eligibilityLevel?: string;
  msp?: {
    crop?: string;
    tamilName?: string;
    mspPerQuintal?: number;
    varieties?: { mspPerQuintal?: number }[];
    revenueProjection?: { revenueAtMSP?: number; lostToMiddlemen?: number };
  } | null;
};

const GREEN: [number, number, number] = [22, 101, 52];
const LIGHT_GREEN: [number, number, number] = [240, 253, 244];
const AMBER: [number, number, number] = [217, 119, 6];
const RED: [number, number, number] = [220, 38, 38];
const MUTED: [number, number, number] = [107, 114, 128];
const PAGE_BOTTOM = 266;
const TEMPLATE_URL = "/pdf-template/uzhavar_vazhi_farmer_profile.pdf";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
}

async function addTamilFont(doc: jsPDF): Promise<boolean> {
  try {
    const response = await fetch("/fonts/NotoSansTamil-Regular.ttf");
    if (!response.ok) return false;

    doc.addFileToVFS("NotoSansTamil-Regular.ttf", arrayBufferToBase64(await response.arrayBuffer()));
    doc.addFont("NotoSansTamil-Regular.ttf", "NotoSansTamil", "normal");
    return true;
  } catch {
    return false;
  }
}

function pdfSafeText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatINR(value?: number | null): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `Rs. ${value.toLocaleString("en-IN")}`
    : "Varies";
}

function topToPdfY(page: PDFPage, top: number, height: number): number {
  return page.getHeight() - top - height;
}

function cover(page: PDFPage, x: number, top: number, width: number, height: number, color = rgb(1, 1, 1)): void {
  page.drawRectangle({ x, y: topToPdfY(page, top, height), width, height, color });
}

function write(page: PDFPage, text: string, x: number, top: number, font: PDFFont, size: number, color = rgb(0.12, 0.16, 0.22)): void {
  page.drawText(text, { x, y: page.getHeight() - top - size, font, size, color });
}

function downloadPdf(bytes: Uint8Array): void {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "uzhavar_vazhi_farmer_profile.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

function profileFromArgs(profile: FarmerProfile | LegacyFarmerData, results?: LegacyResultsData): FarmerProfile {
  if ("loans" in profile && "insurance" in profile && "landAcres" in profile) {
    return profile;
  }

  const cropMsp = results?.msp?.mspPerQuintal ?? results?.msp?.varieties?.[0]?.mspPerQuintal ?? 0;
  const landAcres = profile.landAcres ?? profile.landSize ?? 0;
  const estimatedRevenue = results?.msp?.revenueProjection?.revenueAtMSP ?? cropMsp * landAcres * 10;
  const projectedLoss = results?.msp?.revenueProjection?.lostToMiddlemen ?? estimatedRevenue * 0.18;

  return {
    farmerName: profile.farmerName,
    district: profile.district,
    districtTamilName: profile.districtTamilName ?? results?.districtTamilName ?? "",
    crop: profile.crop,
    cropTamilName: profile.cropTamilName ?? results?.msp?.tamilName,
    landAcres,
    isTenant: profile.isTenant ?? (profile.ownership === "tenant" || profile.ownership === "leasehold"),
    eligibility: results?.eligibilityLevel,
    loans: results?.loans ?? [],
    insurance: results?.insurance ?? [],
    riskScore: results?.riskScore ?? 0,
    riskLevel: results?.riskLevel ?? "Low",
    advice: results?.advice ?? "",
    cropMsp,
    estimatedRevenue,
    projectedLoss,
  };
}

function ensureSpace(doc: jsPDF, y: number, requiredHeight: number): number {
  if (y + requiredHeight <= PAGE_BOTTOM) {
    return y;
  }

  doc.addPage();
  return 18;
}

function sectionHeading(doc: jsPDF, title: string, margin: number, y: number, size = 13): number {
  y = ensureSpace(doc, y, 14);
  doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.text(title, margin, y);
  doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.setLineWidth(0.35);
  doc.line(margin, y + 2.5, doc.internal.pageSize.getWidth() - margin, y + 2.5);
  return y + 8;
}

function drawFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth / 2, 292, { align: "center" });
  }
}

export async function generateFarmerPDF(
  farmerProfile: FarmerProfile | LegacyFarmerData,
  legacyResults?: LegacyResultsData,
): Promise<void> {
  const profile = profileFromArgs(farmerProfile, legacyResults);
  const [templateBytes, tamilFontBytes] = await Promise.all([
    fetch(TEMPLATE_URL).then((response) => response.arrayBuffer()),
    fetch("/fonts/NotoSansTamil-Regular.ttf").then((response) => response.arrayBuffer()),
  ]);
  const document = await PDFDocument.load(templateBytes);
  document.registerFontkit(fontkit);

  const [regular, bold, tamil] = await Promise.all([
    document.embedFont(StandardFonts.Helvetica),
    document.embedFont(StandardFonts.HelveticaBold),
    document.embedFont(tamilFontBytes, { subset: true }),
  ]);
  const page = document.getPage(0);
  const green = rgb(0.09, 0.4, 0.2);
  const lightGreen = rgb(0.86, 0.99, 0.91);
  const riskColor = profile.riskScore <= 35 ? rgb(0.06, 0.65, 0.29) : profile.riskScore <= 60 ? rgb(0.85, 0.47, 0.02) : rgb(0.86, 0.15, 0.15);

  // These coordinates are measured from the reference PDF in points. The template
  // itself carries every border, rule, background, footer, and static label.
  const summaryRows = [
    pdfSafeText(profile.farmerName) || "Farmer",
    pdfSafeText(profile.district),
    pdfSafeText(profile.crop),
    `${profile.landAcres} Acres`,
    profile.isTenant ? "Tenant Farmer" : "Land Owner (Direct Cultivation)",
    profile.eligibility === "high" ? "Verified Eligible" : pdfSafeText(profile.eligibility) || "Verified Eligible",
  ];
  [194, 225, 256, 287, 318, 349].forEach((top, index) => {
    cover(page, 166, top - 13, 395, 24, index % 2 === 1 ? rgb(0.985, 0.987, 0.99) : rgb(1, 1, 1));
    write(page, summaryRows[index], 176, top, index === 5 ? bold : regular, 8, index === 5 ? green : undefined);
  });
  if (profile.districtTamilName) write(page, `(${pdfSafeText(profile.districtTamilName)})`, 220, 225, tamil, 8, green);
  if (profile.cropTamilName) write(page, `(${pdfSafeText(profile.cropTamilName)})`, 210, 256, tamil, 8, green);

  cover(page, 49, 425, 120, 31, riskColor);
  write(page, `${pdfSafeText(profile.riskLevel) || "Risk"} (${profile.riskScore}/100)`, 63, 434, bold, 8.5, rgb(1, 1, 1));
  cover(page, 202, 425, 350, 65, lightGreen);
  write(page, profile.riskScore <= 35 ? "Favorable Agro-Climatic Window" : "Seasonal Risk Advisory", 203, 431, bold, 8, green);
  write(page, pdfSafeText(profile.advice) || "Use insurance and formal credit for safer seasonal planning.", 203, 449, regular, 7, green);

  const loan = profile.loans[0];
  if (loan) {
    cover(page, 35, 600, 526, 57, rgb(1, 1, 1));
    write(page, pdfSafeText(loan.name), 43, 625, bold, 7.5);
    write(page, pdfSafeText(loan.provider), 200, 625, regular, 7.5);
    write(page, formatINR(loan.maxAmount), 386, 625, regular, 7.5);
    write(page, pdfSafeText(loan.interestRate), 492, 625, regular, 7.5);
  }

  const secondPage = document.getPage(1);
  const insurance = profile.insurance[0];
  if (insurance) {
    cover(secondPage, 35, 135, 526, 56, rgb(1, 1, 1));
    write(secondPage, pdfSafeText(insurance.name), 43, 159, bold, 7.5);
    write(secondPage, pdfSafeText(insurance.coverage), 198, 159, regular, 7.5);
    write(secondPage, pdfSafeText(insurance.premiumRate), 490, 159, regular, 7.5);
  }

  downloadPdf(await document.save());
}
