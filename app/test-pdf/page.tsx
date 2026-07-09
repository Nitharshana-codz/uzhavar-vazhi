"use client";
import { useState } from "react";
import { generateFarmerPDF } from "@/lib/generate-pdf";

export default function TestPDF() {
  // Added a visual loading state while the font is being downloaded and configured
  const [isGenerating, setIsGenerating] = useState(false);

  // Changed to an async function to handle font downloading sequences sequentially
  async function handleTest() {
    setIsGenerating(true);
    try {
      await generateFarmerPDF({
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
        cropMsp: 2441,
        estimatedRevenue: 48820,
        projectedLoss: 8788,
      });
    } catch (error) {
      console.error("Error generating profile PDF:", error);
      alert("Something went wrong while generating the PDF. Check console.");
    } finally {
      setIsGenerating(false);
    }
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
        disabled={isGenerating} // Disable button to prevent double triggering
        style={{
          background: isGenerating ? "#86efac" : "#16a34a",
          color: "white",
          padding: "12px 32px",
          borderRadius: "12px",
          border: "none",
          fontSize: "16px",
          cursor: isGenerating ? "not-allowed" : "pointer",
          transition: "background 0.2s ease",
        }}
      >
        {isGenerating ? "Downloading Font & Customizing PDF..." : "Download Test PDF"}
      </button>
    </main>
  );
}