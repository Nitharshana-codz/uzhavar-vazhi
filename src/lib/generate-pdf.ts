import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type FarmerData = {
  farmerName?: string;
  district: string;
  districtTamilName?: string;
  crop: string;
  landSize?: number;
  landAcres?: number;
  ownership?: "owned" | "tenant" | "leasehold";
  isTenant?: boolean;
  loans?: ResultsData["loans"];
  insurance?: ResultsData["insurance"];
  riskScore?: number;
  riskLevel?: string;
  advice?: string;
  mspData?: {
    crop?: string;
    mspPerQuintal?: number;
    mspPerKg?: number;
    revenueAtMSP?: number;
    lostToMiddlemen?: number;
    message?: string;
  };
};

type ResultsData = {
  loans?: { name?: string; tamilName?: string; provider?: string; maxAmount?: number | null; interestRate?: string; documents?: string[] }[];
  insurance?: { name?: string; tamilName?: string; coverage?: string; premiumRate?: string }[];
  districtTamilName?: string;
  riskScore?: number;
  riskLevel?: string;
  advice?: string;
  msp?: {
    crop?: string;
    tamilName?: string;
    mspPerQuintal?: number;
    mspPerKg?: number;
    varieties?: { variety?: string; mspPerQuintal?: number; mspPerKg?: number }[];
    revenueProjection?: { revenueAtMSP?: number; lostToMiddlemen?: number };
  } | null;
  eligibilityLevel?: string;
};

const formatINR = (value?: number | null) =>
  typeof value === "number" ? `Rs. ${value.toLocaleString("en-IN")}` : "Varies";

const TAMIL_FONT_NAME = "NotoSansTamil";
const TAMIL_FONT_FILE = "NotoSansTamil-Regular.ttf";
const TAMIL_FONT_URL = "/fonts/NotoSansTamil-Regular.ttf";
const STANDARD_FONT = "helvetica";
const MOJIBAKE_PATTERN = /[ÃÂà][\u0080-\u00ff]?/;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return window.btoa(binary);
}

async function registerTamilFont(doc: jsPDF): Promise<boolean> {
  try {
    const response = await fetch(TAMIL_FONT_URL);

    if (!response.ok) {
      throw new Error(`Font request failed with ${response.status}`);
    }

    const fontBuffer = await response.arrayBuffer();
    doc.addFileToVFS(TAMIL_FONT_FILE, arrayBufferToBase64(fontBuffer));
    doc.addFont(TAMIL_FONT_FILE, TAMIL_FONT_NAME, "normal");

    return true;
  } catch (error) {
    console.warn("Could not load Tamil font, falling back to standard font.", error);
    return false;
  }
}

function repairMojibake(value?: string): string | undefined {
  if (!value || !MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return value;
  }
}

function drawFarmerSummaryTable(
  doc: jsPDF,
  rows: { label: string; value: string; tamilValue?: string }[],
  startY: number,
  hasTamilFont: boolean,
  margin: number,
  pageWidth: number,
): number {
  const tableWidth = pageWidth - margin * 2;
  const labelWidth = 62;
  let y = startY;

  doc.setDrawColor(232, 213, 176);
  doc.setLineWidth(0.2);

  rows.forEach((row) => {
    const rowHeight = row.tamilValue ? 13 : 10;

    doc.rect(margin, y, labelWidth, rowHeight);
    doc.rect(margin + labelWidth, y, tableWidth - labelWidth, rowHeight);

    doc.setTextColor(44, 44, 42);
    doc.setFont(STANDARD_FONT, "bold");
    doc.setFontSize(9);
    doc.text(row.label, margin + 3, y + 6.5);

    doc.setFont(STANDARD_FONT, "normal");
    doc.text(row.value, margin + labelWidth + 3, y + 5.4);

    const tamilValue = repairMojibake(row.tamilValue);

    if (tamilValue && hasTamilFont) {
      doc.setFont(TAMIL_FONT_NAME, "normal");
      doc.setFontSize(8.5);
      doc.text(tamilValue, margin + labelWidth + 3, y + 10.2);
    }

    y += rowHeight;
  });

  return y;
}

function addSectionTitle(doc: jsPDF, title: string, margin: number, y: number): number {
  doc.setTextColor(44, 44, 42);
  doc.setFont(STANDARD_FONT, "bold");
  doc.setFontSize(14);
  doc.text(title, margin, y);
  return y + 4;
}

function addTamilSchemeNames(
  doc: jsPDF,
  title: string,
  names: (string | undefined)[],
  startY: number,
  hasTamilFont: boolean,
  margin: number,
  pageWidth: number,
): number {
  const tamilNames = names.map(repairMojibake).filter((name): name is string => Boolean(name));

  if (!hasTamilFont || tamilNames.length === 0) {
    return startY;
  }

  let y = startY;
  if (y > 252) {
    doc.addPage();
    y = 18;
  }

  doc.setTextColor(59, 109, 17);
  doc.setFont(STANDARD_FONT, "bold");
  doc.setFontSize(9);
  doc.text(title, margin, y);
  y += 6;

  doc.setTextColor(44, 44, 42);
  doc.setFont(TAMIL_FONT_NAME, "normal");
  doc.setFontSize(8.5);

  tamilNames.slice(0, 4).forEach((name) => {
    const lines = doc.splitTextToSize(name, pageWidth - margin * 2 - 6);
    doc.text(lines, margin + 3, y);
    y += lines.length * 4.6 + 2;
  });

  return y + 3;
}

export async function generateFarmerPDF(farmerData: FarmerData, passedResults?: ResultsData) {
  const results: ResultsData = passedResults ?? {
    loans: farmerData.loans,
    insurance: farmerData.insurance,
    riskScore: farmerData.riskScore,
    riskLevel: farmerData.riskLevel,
    advice: farmerData.advice,
    msp: farmerData.mspData
      ? {
          crop: farmerData.mspData.crop,
          mspPerQuintal: farmerData.mspData.mspPerQuintal,
          mspPerKg: farmerData.mspData.mspPerKg,
          revenueProjection: {
            revenueAtMSP: farmerData.mspData.revenueAtMSP,
            lostToMiddlemen: farmerData.mspData.lostToMiddlemen,
          },
        }
      : null,
  };
  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 18;
  const hasTamilFont = await registerTamilFont(doc);
  const cleanDistrict = farmerData.district.replace(/^&|&$/g, "").replace(/&/g, "");
  const tamilDistrictName = repairMojibake(farmerData.districtTamilName ?? results.districtTamilName);
  const tamilCropName = repairMojibake(results.msp?.tamilName);
  const mspPerQuintal = results.msp?.mspPerQuintal ?? results.msp?.varieties?.[0]?.mspPerQuintal;

  doc.setFillColor(59, 109, 17);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont(STANDARD_FONT, "bold");
  doc.setFontSize(19);
  doc.text("Uzhavar Vazhi", margin + 8, y + 12);
  doc.setFontSize(10);
  doc.setFont(STANDARD_FONT, "normal");
  doc.text("Farmer Financial Readiness Profile", margin + 8, y + 21);
  doc.text(new Date().toLocaleDateString("en-IN"), pageWidth - margin - 35, y + 12);
  y += 42;

  y = addSectionTitle(doc, "Farmer Summary", margin, y) + 1;

  y = drawFarmerSummaryTable(
    doc,
    [
      { label: "Farmer", value: farmerData.farmerName ?? "Farmer" },
      { label: "District", value: cleanDistrict, tamilValue: tamilDistrictName },
      { label: "Crop", value: farmerData.crop, tamilValue: tamilCropName },
      { label: "Land", value: `${farmerData.landSize ?? farmerData.landAcres ?? 0} acres` },
      { label: "Ownership", value: farmerData.ownership ?? (farmerData.isTenant ? "tenant" : "owned") },
      { label: "Eligibility", value: results.eligibilityLevel ?? "Available" },
    ],
    y,
    hasTamilFont,
    margin,
    pageWidth,
  ) + 10;

  const riskScore = results.riskScore ?? 0;
  const riskColor = riskScore <= 33 ? [59, 109, 17] : riskScore <= 66 ? [212, 136, 42] : [153, 60, 29];
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont(STANDARD_FONT, "bold");
  doc.setFontSize(13);
  doc.text(`Season Risk: ${results.riskLevel ?? "Calculated"} (${riskScore}/100)`, margin + 7, y + 10);
  doc.setFont(STANDARD_FONT, "normal");
  doc.setFontSize(9);
  doc.text(doc.splitTextToSize(results.advice ?? "Use insurance and formal credit for safer planning.", pageWidth - margin * 2 - 14), margin + 7, y + 17);
  y += 34;

  y = addSectionTitle(doc, "Eligible Loans", margin, y);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Scheme", "Provider", "Max Amount", "Rate"]],
    body: (results.loans ?? []).map((loan) => [loan.name ?? "-", loan.provider ?? "-", formatINR(loan.maxAmount), loan.interestRate ?? "Varies"]),
    headStyles: { fillColor: [59, 109, 17], textColor: 255 },
    alternateRowStyles: { fillColor: [234, 243, 222] },
    styles: { font: STANDARD_FONT, fontSize: 9, cellPadding: 3 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  y = addTamilSchemeNames(doc, "Tamil loan names", (results.loans ?? []).map((loan) => loan.tamilName), y, hasTamilFont, margin, pageWidth);

  y = addSectionTitle(doc, "Insurance and MSP", margin, y);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Item", "Details"]],
    body: [
      ...(results.insurance ?? []).map((item) => [item.name ?? "Insurance", `${item.coverage ?? ""} | Premium: ${item.premiumRate ?? "Varies"}`]),
      ["MSP", `${results.msp?.crop ?? farmerData.crop}: ${formatINR(mspPerQuintal)} / quintal`],
      ["Expected MSP Revenue", formatINR(results.msp?.revenueProjection?.revenueAtMSP)],
    ],
    headStyles: { fillColor: [212, 136, 42], textColor: 255 },
    alternateRowStyles: { fillColor: [250, 238, 218] },
    styles: { font: STANDARD_FONT, fontSize: 9, cellPadding: 3 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  y = addTamilSchemeNames(doc, "Tamil insurance names", (results.insurance ?? []).map((item) => item.tamilName), y, hasTamilFont, margin, pageWidth);

  doc.setFillColor(243, 244, 246);
  doc.rect(0, 282, pageWidth, 15, "F");
  doc.setTextColor(107, 114, 128);
  doc.setFont(STANDARD_FONT, "normal");
  doc.setFontSize(8);
  doc.text("Generated by Uzhavar Vazhi. Verify scheme eligibility with your local bank or cooperative.", pageWidth / 2, 290, {
    align: "center",
  });

  const fileName = `farmer-profile-${farmerData.farmerName || cleanDistrict || "profile"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  doc.save(`${fileName}.pdf`);
}
