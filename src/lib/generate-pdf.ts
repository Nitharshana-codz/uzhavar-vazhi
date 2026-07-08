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
const TAMIL_FONT_URL =
  "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/unhinted/ttf/NotoSansTamil/NotoSansTamil-Regular.ttf";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return window.btoa(binary);
}

async function registerTamilFont(doc: jsPDF): Promise<string> {
  try {
    const response = await fetch(TAMIL_FONT_URL);

    if (!response.ok) {
      throw new Error(`Font request failed with ${response.status}`);
    }

    const fontBuffer = await response.arrayBuffer();
    doc.addFileToVFS(TAMIL_FONT_FILE, arrayBufferToBase64(fontBuffer));
    doc.addFont(TAMIL_FONT_FILE, TAMIL_FONT_NAME, "normal");
    doc.addFont(TAMIL_FONT_FILE, TAMIL_FONT_NAME, "bold");

    return TAMIL_FONT_NAME;
  } catch (error) {
    console.warn("Could not load Tamil font, falling back to standard font.", error);
    return "helvetica";
  }
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
  const bodyFont = await registerTamilFont(doc);
  const cleanDistrict = farmerData.district.replace(/^&|&$/g, "").replace(/&/g, "");
  const mspPerQuintal = results.msp?.mspPerQuintal ?? results.msp?.varieties?.[0]?.mspPerQuintal;

  doc.setFillColor(59, 109, 17);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("Uzhavar Vazhi", margin + 8, y + 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Farmer Financial Readiness Profile", margin + 8, y + 21);
  doc.text(new Date().toLocaleDateString("en-IN"), pageWidth - margin - 35, y + 12);
  y += 42;

  doc.setTextColor(44, 44, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Farmer Summary", margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3, lineColor: [232, 213, 176] },
    headStyles: { fillColor: [250, 238, 218], textColor: [44, 44, 42] },
    bodyStyles: { font: bodyFont },
    body: [
      ["Farmer", farmerData.farmerName ?? "Farmer"],
      ["District", farmerData.districtTamilName ? `${cleanDistrict} (${farmerData.districtTamilName})` : cleanDistrict],
      ["Crop", farmerData.crop],
      ["Land", `${farmerData.landSize ?? farmerData.landAcres ?? 0} acres`],
      ["Ownership", farmerData.ownership ?? (farmerData.isTenant ? "tenant" : "owned")],
      ["Eligibility", results.eligibilityLevel ?? "Available"],
    ],
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  const riskScore = results.riskScore ?? 0;
  const riskColor = riskScore <= 33 ? [59, 109, 17] : riskScore <= 66 ? [212, 136, 42] : [153, 60, 29];
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Season Risk: ${results.riskLevel ?? "Calculated"} (${riskScore}/100)`, margin + 7, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(doc.splitTextToSize(results.advice ?? "Use insurance and formal credit for safer planning.", pageWidth - margin * 2 - 14), margin + 7, y + 17);
  y += 34;

  doc.setTextColor(44, 44, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Eligible Loans", margin, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Scheme", "Provider", "Max Amount", "Rate"]],
    body: (results.loans ?? []).map((loan) => [loan.name ?? "-", loan.provider ?? "-", formatINR(loan.maxAmount), loan.interestRate ?? "Varies"]),
    headStyles: { fillColor: [59, 109, 17], textColor: 255 },
    alternateRowStyles: { fillColor: [234, 243, 222] },
    styles: { font: bodyFont, fontSize: 9, cellPadding: 3 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Insurance and MSP", margin, y);
  y += 4;
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
    styles: { font: bodyFont, fontSize: 9, cellPadding: 3 },
  });

  const fileName = `farmer-profile-${farmerData.farmerName || cleanDistrict || "profile"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  doc.save(`${fileName}.pdf`);
}
