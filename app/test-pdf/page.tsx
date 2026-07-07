// app/test-pdf/page.tsx
// TEMPORARY TEST PAGE — delete this after testing
// This page lets us test the PDF generator directly in the browser

"use client"; // This tells Next.js this page runs in the browser, not the server
// We need this because jsPDF uses browser features

import { generateFarmerPDF } from "@/lib/generate-pdf";

export default function TestPDF() {
  function handleTestPDF() {
    // This is sample data simulating what our two API routes would return
    generateFarmerPDF({
      district: "Coimbatore",
      districtTamilName: "கோயம்புத்தூர்",
      crop: "Cotton",
      landAcres: 2,
      isTenant: false,
      loans: [
        {
          name: "Kisan Credit Card (KCC)",
          provider: "Nationalised & Cooperative Banks",
          maxAmount: 300000,
          interestRate: "4% (with government subvention)",
          documents: [
            "Aadhaar card",
            "Land record (patta/chitta)",
            "Bank passbook",
            "Passport photo",
          ],
        },
        {
          name: "NABARD Short-Term Crop Loan",
          provider: "NABARD via Cooperative Banks",
          maxAmount: 100000,
          interestRate: "7% (subsidised)",
          documents: [
            "Aadhaar card",
            "Patta/chitta",
            "Crop sowing certificate",
          ],
        },
      ],
      insurance: [
        {
          name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
          coverage:
            "Crop loss due to drought, flood, pest, disease, or natural calamity",
          premiumRate: "2% for Kharif crops, 1.5% for Rabi crops",
        },
      ],
      riskScore: 58,
      riskLevel: "Medium Risk",
      advice:
        "Moderate risk. Ensure crop insurance is active before sowing.",
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        fontFamily: "sans-serif",
        background: "#f0fdf4",
      }}
    >
      <h1 style={{ color: "#166534", fontSize: "24px" }}>
        🌾 PDF Generator Test
      </h1>
      <p style={{ color: "#555" }}>
        Click the button below — a PDF should download to your device
      </p>
      <button
        onClick={handleTestPDF}
        style={{
          background: "#16a34a",
          color: "white",
          padding: "12px 32px",
          borderRadius: "12px",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Download Test Farmer Profile PDF
      </button>
      <p style={{ color: "#888", fontSize: "12px" }}>
        Check your Downloads folder after clicking
      </p>
    </main>
  );
}