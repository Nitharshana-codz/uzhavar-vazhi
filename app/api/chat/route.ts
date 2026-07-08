import { NextRequest, NextResponse } from "next/server";

const answers = {
  loans: "For most small farmers, the strongest first options are Kisan Credit Card, cooperative crop loan, and NABARD-linked short term crop credit. Use the Dashboard page with district, crop, land size, and ownership to get matched results.",
  pmfby: "For PMFBY, keep Aadhaar, bank passbook, land or lease proof, and sowing certificate ready. Report crop loss quickly through the bank, insurer, or local agriculture office so field verification can happen on time.",
  msp: "MSP is the government-declared minimum support price. For paddy in this app, the 2026-27 reference value is Rs. 2,441 per quintal for common paddy.",
  weather: "Use the Weather page to select your district and fetch a 7-day forecast. If rainfall is high, avoid fresh pesticide spraying and check drainage before sowing.",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const message = String(body.message ?? "").toLowerCase();
  const language = body.language === "ta" ? "ta" : "en";
  let response = answers.loans;

  if (message.includes("pmfby") || message.includes("insurance") || message.includes("claim")) response = answers.pmfby;
  if (message.includes("msp") || message.includes("price") || message.includes("paddy")) response = answers.msp;
  if (message.includes("weather") || message.includes("rain")) response = answers.weather;

  if (language === "ta") {
    response = `தமிழில் சுருக்கம்: ${response}`;
  }

  return NextResponse.json({
    response,
    suggestions: ["Check my eligibility", "Show MSP prices", "What documents are needed?"],
  });
}
