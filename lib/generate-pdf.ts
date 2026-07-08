// lib/generate-pdf.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type FarmerProfile = {
  district: string;
  districtTamilName: string;
  crop: string;
  landAcres: number;
  isTenant: boolean;
  loans: {
    name: string;
    provider: string;
    maxAmount: number;
    interestRate: string;
    documents: string[];
  }[];
  insurance: {
    name: string;
    coverage: string;
    premiumRate: string;
  }[];
  mspData?: {
    mspPerQuintal: number;
    mspPerKg: number;
    revenueAtMSP: number; // FIXED: Changed to match your usage below
    lostToMiddlemen: number;
    message: string;
    crop?: string; // Added to match your usage below
  } | null;
  riskScore: number;
  riskLevel: string;
  advice: string;
};

// ── Helper to convert ArrayBuffer to Base64 for the browser
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// NOTE: The function is now async because we must download the font first.
export async function generateFarmerPDF(profile: FarmerProfile): Promise<void> {
  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // ── HOTFIX: Clean the '&' bug from the district name 
  // If "Tirunelveli" comes in as "&T&i&r&u...", this strips the stray '&'s
  const cleanDistrict = profile.district.replace(/^&|&$/g, "").replace(/&/g, "");

  // ── Load Tamil Font (Noto Sans Tamil) ───────────────────────────────────
  try {
    // Fetching from a reliable open-source font CDN
    const fontUrl = "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/unhinted/ttf/NotoSansTamil/NotoSansTamil-Regular.ttf";
    const response = await fetch(fontUrl);
    const buffer = await response.arrayBuffer();
    const base64Font = arrayBufferToBase64(buffer);

    // Inject the font into jsPDF
    doc.addFileToVFS("NotoSansTamil.ttf", base64Font);
    doc.addFont("NotoSansTamil.ttf", "TamilFont", "normal");
  } catch (error) {
    console.warn("Could not load Tamil font, falling back to standard font.", error);
  }

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(22, 101, 52); // dark green
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Uzhavar Vazhi", margin, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Farmer Financial Profile | Tamil Nadu", margin, 23);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, margin, 30);

  y = 45;

  // ── Farmer Details Section ───────────────────────────────────────────────
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Farmer Details", margin, y);
  y += 6;

  doc.setDrawColor(22, 101, 52);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);

  const details = [
    ["District", `${cleanDistrict} (${profile.districtTamilName})`],
    ["Main Crop", profile.crop],
    ["Land Size", `${profile.landAcres} acres`],
    ["Farmer Type", profile.isTenant ? "Tenant Farmer" : "Land Owner"],
  ];

  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    
    // Switch to Tamil font specifically for the value printing
    doc.setFont("TamilFont", "normal");
    doc.text(value, margin + 35, y);
    y += 7;
  });

  y += 5;

  // ── Risk Score Section ───────────────────────────────────────────────────
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Seasonal Risk Assessment", margin, y);
  y += 6;

  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Color-coded risk score box
  const riskColor =
    profile.riskScore <= 30 ? [34, 197, 94]   // green
    : profile.riskScore <= 55 ? [234, 179, 8]  // yellow
    : profile.riskScore <= 75 ? [249, 115, 22] // orange
    : [239, 68, 68];                            // red

  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(margin, y, 60, 18, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Risk Score: ${profile.riskScore}/100`, margin + 5, y + 8);
  doc.setFontSize(9);
  doc.text(profile.riskLevel, margin + 5, y + 14);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const adviceLines = doc.splitTextToSize(
    `Advice: ${profile.advice}`,
    pageWidth - margin - 85
  );
  doc.text(adviceLines, margin + 70, y + 7);
  y += 28;

  // ── Eligible Loan Schemes ────────────────────────────────────────────────
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Eligible Loan Schemes", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Scheme Name", "Provider", "Max Amount", "Interest Rate"]],
    body: profile.loans.map((loan) => [
      loan.name,
      loan.provider,
      `Rs.${loan.maxAmount.toLocaleString("en-IN")}`,
      loan.interestRate,
    ]),
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      font: "helvetica" // Ensure headers use english font
    },
    bodyStyles: { 
      fontSize: 9,
      font: "TamilFont" // Use Tamil font for body incase data has Tamil
    },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Documents Needed ─────────────────────────────────────────────────────
  if (profile.loans.length > 0) {
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Documents Needed for Loan Application", margin, y);
    y += 6;

    const allDocs = [...new Set(profile.loans.flatMap((l) => l.documents))];

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("TamilFont", "normal"); // Use Tamil font for docs
    allDocs.forEach((docItem, i) => {
      doc.text(`${i + 1}. ${docItem}`, margin + 4, y);
      y += 6;
    });
    y += 4;
  }

  // ── Eligible Insurance Schemes ───────────────────────────────────────────
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Eligible Insurance Schemes", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Scheme Name", "Coverage", "Premium Rate"]],
    body: profile.insurance.map((ins) => [
      ins.name,
      ins.coverage,
      ins.premiumRate,
    ]),
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      font: "helvetica"
    },
    bodyStyles: { 
      fontSize: 9,
      font: "TamilFont" 
    },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── MSP Price Section ────────────────────────────────────────────────────
  if (profile.mspData) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(22, 101, 52);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("MSP Price Information (2026-27)", margin, y);
    y += 6;

    doc.setDrawColor(22, 101, 52);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 40, 3, 3, "F");
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 40, 3, 3, "S");

    doc.setTextColor(22, 101, 52);
    doc.setFontSize(11);
    doc.setFont("TamilFont", "bold");
    doc.text(
      `${profile.mspData.crop || profile.crop} MSP: Rs. ${profile.mspData.mspPerKg}/kg  (Rs. ${profile.mspData.mspPerQuintal}/quintal)`,
      margin + 8,
      y + 12
    );

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Estimated revenue at MSP price:  Rs. ${profile.mspData.revenueAtMSP.toLocaleString("en-IN")}`,
      margin + 8,
      y + 24
    );
    doc.setTextColor(185, 28, 28);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Amount lost to middlemen:  Rs. ${profile.mspData.lostToMiddlemen.toLocaleString("en-IN")} (claim MSP to recover this)`,
      margin + 8,
      y + 34
    );

    y += 50;

    doc.setTextColor(120, 53, 15);
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 3, 3, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "To claim MSP: Contact your nearest PACS cooperative or Agriculture Officer with this document.",
      margin + 5,
      y + 10
    );
  }
  
  // ── Footer ───────────────────────────────────────────────────────────────
  doc.setFillColor(243, 244, 246);
  doc.rect(0, 282, pageWidth, 15, "F");
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  
  // Switch back to Tamil font to print the Tamil portion of the footer
  doc.setFont("TamilFont", "normal");
  doc.text(
    "Generated by Uzhavar Vazhi | உழவர் வழி — Tamil Nadu Farmer Financial Readiness Platform",
    pageWidth / 2,
    289,
    { align: "center" }
  );
  
  doc.setFont("helvetica", "normal");
  doc.text(
    "This document is for reference only. Please verify scheme eligibility with your local bank or cooperative.",
    pageWidth / 2,
    294,
    { align: "center" }
  );

  // ── Download ─────────────────────────────────────────────────────────────
  const fileName = `uzhavar-vazhi-${cleanDistrict.toLowerCase()}-${profile.crop.toLowerCase()}.pdf`;
  doc.save(fileName);
}