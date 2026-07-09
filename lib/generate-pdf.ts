import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

function pdfSafeText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatINR(value?: number | null): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `Rs. ${value.toLocaleString("en-IN")}`
    : "Varies";
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
  doc.setLineWidth(0.6);
  doc.line(margin, y + 2.5, margin + 48, y + 2.5);
  return y + 8;
}

function drawFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFillColor(243, 244, 246);
    doc.rect(0, 278, pageWidth, 19, "F");
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(
      "Generated securely via Uzhavar Vazhi Platform (Tamil Nadu Farmer Financial Readiness Hub).",
      pageWidth / 2,
      285,
      { align: "center" },
    );
    doc.text(
      "This document is an analytical reference. Please verify exact terms with local cooperative or bank managers.",
      pageWidth / 2,
      291,
      { align: "center" },
    );
  }
}

export async function generateFarmerPDF(
  farmerProfile: FarmerProfile | LegacyFarmerData,
  legacyResults?: LegacyResultsData,
): Promise<void> {
  const profile = profileFromArgs(farmerProfile, legacyResults);
  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 0;

  doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Uzhavar Vazhi", margin, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Farmer Financial Readiness Profile - Seasonal Evaluation", margin, 25);
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin, 15, { align: "right" });
  y = 52;

  y = sectionHeading(doc, "FARMER SUMMARY", margin, y);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    body: [
      ["Farmer Profile", pdfSafeText(profile.farmerName) || "Farmer"],
      ["District Location", pdfSafeText(profile.district)],
      ["Main Crop Target", pdfSafeText(profile.crop)],
      ["Cultivation Area", `${profile.landAcres} Acres`],
      ["Land Tenure Mode", profile.isTenant ? "Tenant Farmer" : "Land Owner (Direct Cultivation)"],
      ["Scheme Eligibility", profile.eligibility === "high" ? "Verified Eligible" : pdfSafeText(profile.eligibility) || "Verified Eligible"],
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 58 }, 1: { cellWidth: 122 } },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 3, textColor: [31, 41, 55] },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === 5 && data.column.index === 1) {
        data.cell.styles.textColor = GREEN;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  y = sectionHeading(doc, "SEASONAL RISK ASSESSMENT", margin, y);
  const riskColor = profile.riskScore <= 35 ? GREEN : profile.riskScore <= 60 ? AMBER : RED;
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(margin, y, 62, 18, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${pdfSafeText(profile.riskLevel) || "Risk"} (${profile.riskScore}/100)`, margin + 5, y + 11);
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const adviceLines = doc.splitTextToSize(
    pdfSafeText(profile.advice) || "Use insurance and formal credit for safer seasonal planning.",
    pageWidth - margin * 2 - 72,
  );
  doc.text(adviceLines, margin + 70, y + 7);
  y += Math.max(26, adviceLines.length * 5 + 10);

  y = sectionHeading(doc, "ELIGIBLE LOAN SCHEMES", margin, y);
  if (profile.loans.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Scheme Name", "Provider", "Max Sanction Amount", "Interest Rate"]],
      body: profile.loans.map((loan) => [
        pdfSafeText(loan.name),
        pdfSafeText(loan.provider),
        formatINR(loan.maxAmount),
        pdfSafeText(loan.interestRate),
      ]),
      headStyles: { fillColor: GREEN, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT_GREEN },
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  } else {
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("No eligible loan schemes found for your profile", margin, y);
    y += 10;
  }

  const documents = [...new Set(profile.loans.flatMap((loan) => loan.documents))];
  if (documents.length > 0) {
    y = sectionHeading(doc, "REQUIRED LOAN APPLICATION DOCUMENTS CHECKLIST", margin, y, 11);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    documents.forEach((document) => {
      y = ensureSpace(doc, y, 7);
      doc.text(`- ${pdfSafeText(document)}`, margin + 2, y);
      y += 6;
    });
    y += 5;
  }

  y = sectionHeading(doc, "ELIGIBLE INSURANCE SCHEMES", margin, y);
  if (profile.insurance.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Scheme Name", "Coverage Scope", "Premium Rate"]],
      body: profile.insurance.map((insurance) => [
        pdfSafeText(insurance.name),
        pdfSafeText(insurance.coverage),
        pdfSafeText(insurance.premiumRate),
      ]),
      headStyles: { fillColor: GREEN, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: LIGHT_GREEN },
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  } else {
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("No eligible insurance schemes found", margin, y);
    y += 10;
  }

  const cropMsp = profile.cropMsp ?? 0;
  if (cropMsp > 0) {
    const estimatedRevenue = profile.estimatedRevenue ?? cropMsp * profile.landAcres * 10;
    const projectedLoss = profile.projectedLoss ?? estimatedRevenue * 0.18;

    y = sectionHeading(doc, "MSP PRICE ANALYTICS (2026-27 SEASON)", margin, y);
    y = ensureSpace(doc, y, 42);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${pdfSafeText(profile.crop)} MSP Protection Matrix`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Official Government Minimum Support Price: ${formatINR(cropMsp)} / quintal`, margin, y + 8);
    doc.text(`Your Estimated Yield Revenue potential at full MSP value: ${formatINR(estimatedRevenue)}`, margin, y + 16);
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, y + 22, pageWidth - margin * 2, 16, 2, 2, "F");
    doc.setTextColor(146, 64, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.3);
    doc.text(
      doc.splitTextToSize(
        `Projected Loss to Middlemen if sold at local market rates: ${formatINR(projectedLoss)} (Claim official MSP channels to protect this value)`,
        pageWidth - margin * 2 - 8,
      ),
      margin + 4,
      y + 29,
    );
    y += 48;
  }

  y = ensureSpace(doc, y, 34);
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 27, 2, 2, "F");
  doc.setTextColor(120, 53, 15);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Actionable Guidance Note:", margin + 4, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  doc.text(
    doc.splitTextToSize(
      "To claim official MSP valuation and reduce local intermediary fees, submit a printout of this Financial Readiness Profile to your nearest PACS center or regional Agriculture Officer.",
      pageWidth - margin * 2 - 8,
    ),
    margin + 4,
    y + 15,
  );

  drawFooter(doc);

  const fileName = `uzhavar-vazhi-${profile.farmerName || profile.district}-${profile.crop}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  doc.save(`${fileName || "farmer-profile"}.pdf`);
}
