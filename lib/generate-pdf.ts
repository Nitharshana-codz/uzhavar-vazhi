// lib/generate-pdf.ts
// This function takes a farmer's complete results and generates a downloadable PDF.
// It runs entirely in the browser — no server needed.
// Member 2 will call this function when the farmer clicks "Download Profile".

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type AutoTableDoc = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

// This type describes all the data we need to build the PDF
export type FarmerProfile = {
  // Farmer's input
  district: string;
  districtTamilName: string;
  crop: string;
  landAcres: number;
  isTenant: boolean;
  // Eligibility results (from /api/eligibility)
  loans: {
    name: string;
    provider: string;
    maxAmount: number | null;
    interestRate: string;
    documents: string[];
  }[];
  insurance: {
    name: string;
    coverage: string;
    premiumRate: string;
  }[];
  // Risk results (from /api/risk-score)
  riskScore: number;
  riskLevel: string;
  advice: string;
};

export function generateFarmerPDF(profile: FarmerProfile): void {
  // Create a new PDF document (A4 size, portrait)
  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20; // current vertical position on page

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
  doc.setFont("helvetica", "normal");

  const details = [
    ["District", `${profile.district} (${profile.districtTamilName})`],
    ["Main Crop", profile.crop],
    ["Land Size", `${profile.landAcres} acres`],
    ["Farmer Type", profile.isTenant ? "Tenant Farmer" : "Land Owner"],
  ];

  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
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
      loan.maxAmount === null
        ? "Varies by bank/product"
        : `₹${loan.maxAmount.toLocaleString("en-IN")}`,
      loan.interestRate,
    ]),
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });

  y = ((doc as AutoTableDoc).lastAutoTable?.finalY ?? y) + 10;

  // ── Documents Needed ─────────────────────────────────────────────────────
  if (profile.loans.length > 0) {
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Documents Needed for Loan Application", margin, y);
    y += 6;

    // Collect unique documents across all eligible loans
    const allDocs = [
      ...new Set(profile.loans.flatMap((l) => l.documents)),
    ];

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
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
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
  });

  y = ((doc as AutoTableDoc).lastAutoTable?.finalY ?? y) + 10;

  // ── Footer ───────────────────────────────────────────────────────────────
  doc.setFillColor(243, 244, 246);
  doc.rect(0, 282, pageWidth, 15, "F");
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Generated by Uzhavar Vazhi | உழவர் வழி — Tamil Nadu Farmer Financial Readiness Platform",
    pageWidth / 2,
    289,
    { align: "center" }
  );
  doc.text(
    "This document is for reference only. Please verify scheme eligibility with your local bank or cooperative.",
    pageWidth / 2,
    294,
    { align: "center" }
  );

  // ── Download ─────────────────────────────────────────────────────────────
  // This triggers the browser's file download dialog
  const fileName = `uzhavar-vazhi-${profile.district.toLowerCase()}-${profile.crop.toLowerCase()}.pdf`;
  doc.save(fileName);
}
