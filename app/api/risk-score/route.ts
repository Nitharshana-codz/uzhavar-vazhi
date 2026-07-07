// app/api/risk-score/route.ts
// This API calculates a seasonal risk score (1-100) for a specific farmer.
// It combines three factors: rainfall risk, crop sensitivity, and land vulnerability.
// Higher score = higher risk this season.

import { NextRequest, NextResponse } from "next/server";
import { getDistrictByName, getCropSensitivity } from "@/lib/district-data";

// ─── Helper: Calculate Rainfall Risk ────────────────────────────────────────
// We compare the district's average rainfall to the "ideal" range for farming.
// Too little rainfall = drought risk. Too much = flood risk. Both are bad.
function calculateRainfallRisk(avgRainfallMM: number): number {
  // Ideal range for Tamil Nadu farming is 800-1000mm annually
  if (avgRainfallMM < 600) return 90;   // severe drought risk
  if (avgRainfallMM < 700) return 75;   // moderate drought risk
  if (avgRainfallMM < 800) return 60;   // mild drought risk
  if (avgRainfallMM <= 1000) return 30; // ideal range — low risk
  if (avgRainfallMM <= 1200) return 50; // above ideal — mild flood risk
  return 80;                             // very high rainfall — flood risk
}

// ─── Helper: Calculate Land Vulnerability ───────────────────────────────────
// Smaller farms have less buffer to absorb a bad season.
// Tenant farmers carry more financial risk than owners.
function calculateLandVulnerability(landAcres: number, isTenant: boolean): number {
  let score = 0;

  // Land size factor
  if (landAcres < 1) score += 70;       // very small farm, high vulnerability
  else if (landAcres < 2.5) score += 50; // small farm
  else if (landAcres < 5) score += 35;   // medium farm
  else score += 20;                       // large farm, more resilient

  // Tenant farmers pay rent regardless of crop outcome, adding financial risk
  if (isTenant) score += 15;

  return Math.min(score, 100); // cap at 100
}

// ─── Helper: Risk score to label ────────────────────────────────────────────
function getRiskLabel(score: number): {
  label: string;
  tamilLabel: string;
  color: string;
  advice: string;
  tamilAdvice: string;
} {
  if (score <= 30) return {
    label: "Low Risk",
    tamilLabel: "குறைந்த ஆபத்து",
    color: "green",
    advice: "This season looks favorable. Good time to plan crop investments.",
    tamilAdvice: "இந்த பருவம் சாதகமாக தெரிகிறது. பயிர் முதலீட்டை திட்டமிட நல்ல நேரம்.",
  };
  if (score <= 55) return {
    label: "Medium Risk",
    tamilLabel: "நடுத்தர ஆபத்து",
    color: "yellow",
    advice: "Moderate risk. Ensure crop insurance is active before sowing.",
    tamilAdvice: "மிதமான ஆபத்து. விதைப்பதற்கு முன் பயிர் காப்பீடு செயல்படுவதை உறுதி செய்யுங்கள்.",
  };
  if (score <= 75) return {
    label: "High Risk",
    tamilLabel: "அதிக ஆபத்து",
    color: "orange",
    advice: "High risk season. Strongly recommend insurance and smaller crop investment.",
    tamilAdvice: "அதிக ஆபத்துள்ள பருவம். காப்பீடு மற்றும் சிறிய பயிர் முதலீடு அறிவுறுத்தப்படுகிறது.",
  };
  return {
    label: "Very High Risk",
    tamilLabel: "மிக அதிக ஆபத்து",
    color: "red",
    advice: "Very high risk. Consider alternative crops or wait for next season.",
    tamilAdvice: "மிக அதிக ஆபத்து. மாற்று பயிர்களை கருத்தில் கொள்ளுங்கள் அல்லது அடுத்த பருவம் வரை காத்திருங்கள்.",
  };
}

// ─── Main API Handler ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { district, crop, landAcres, isTenant } = body;

    // Validate required fields
    if (!district || !crop || landAcres === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: district, crop, landAcres" },
        { status: 400 }
      );
    }

    // Look up district
    const districtData = getDistrictByName(district);
    if (!districtData) {
      return NextResponse.json(
        { error: `District "${district}" not found` },
        { status: 404 }
      );
    }

    // Calculate the three components
    const rainfallRisk = calculateRainfallRisk(districtData.avgRainfallMM);
    const cropSensitivity = getCropSensitivity(crop);
    const landVulnerability = calculateLandVulnerability(
      landAcres,
      isTenant ?? false
    );

    // Weighted formula: rainfall 40%, crop sensitivity 35%, land vulnerability 25%
    const finalScore = Math.round(
      rainfallRisk * 0.4 +
      cropSensitivity * 0.35 +
      landVulnerability * 0.25
    );

    // Get the label for this score
    const riskInfo = getRiskLabel(finalScore);

    // Build a breakdown so farmers (and judges) can see exactly how the score was calculated
    const breakdown = [
      {
        factor: "Rainfall Pattern",
        tamilFactor: "மழைப்பொழிவு முறை",
        score: rainfallRisk,
        weight: "40%",
        detail: `${districtData.avgRainfallMM}mm average annual rainfall`,
      },
      {
        factor: "Crop Sensitivity",
        tamilFactor: "பயிர் உணர்திறன்",
        score: cropSensitivity,
        weight: "35%",
        detail: `${crop} sensitivity to weather deviation`,
      },
      {
        factor: "Land Vulnerability",
        tamilFactor: "நிலம் பாதிப்பு",
        score: landVulnerability,
        weight: "25%",
        detail: `${landAcres} acres, ${isTenant ? "tenant" : "owner"}`,
      },
    ];

    return NextResponse.json({
      district: districtData.name,
      districtTamilName: districtData.tamilName,
      crop,
      landAcres,
      isTenant: isTenant ?? false,
      riskScore: finalScore,
      riskLevel: riskInfo.label,
      riskLevelTamil: riskInfo.tamilLabel,
      color: riskInfo.color,
      advice: riskInfo.advice,
      tamilAdvice: riskInfo.tamilAdvice,
      breakdown,
    });

  } catch {
    return NextResponse.json(
      { error: "Something went wrong processing your request" },
      { status: 500 }
    );
  }
}
