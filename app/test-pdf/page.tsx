"use client";
import { generateFarmerPDF } from "@/lib/generate-pdf";

export default function TestPDF() {
  function handleTest() {
    generateFarmerPDF({
      district: "Thanjavur",
      districtTamilName: "தஞ்சாவூர்",
      crop: "Paddy",
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
      ],
      insurance: [
        {
          name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
          coverage: "Crop loss due to drought, flood, pest, disease",
          premiumRate: "2% for Kharif crops",
        },
      ],
      riskScore: 35,
      riskLevel: "Low Risk",
      advice: "This season looks favorable. Good time to plan crop investments.",
      mspData: {
        crop: "Paddy",
        mspPerQuintal: 2441,
        mspPerKg: 24.41,
        revenueAtMSP: 58584,
        lostToMiddlemen: 10545,
        message:
          "By selling at MSP instead of market price, you could earn Rs. 10,545 more this season",
      },
    });
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      fontFamily: "sans-serif",
      background: "#f0fdf4",
    }}>
      <h1 style={{ color: "#166534", fontSize: "24px" }}>
        MSP PDF Test — 2026-27
      </h1>
      <p style={{ color: "#555", textAlign: "center", maxWidth: "400px" }}>
        Thanjavur Paddy farmer, 2 acres, Land Owner.
        PDF should include MSP section showing Rs. 2,441/quintal
        and Rs. 10,545 lost to middlemen.
      </p>
      <button
        onClick={handleTest}
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
        Download Test PDF
      </button>
    </main>
  );
}