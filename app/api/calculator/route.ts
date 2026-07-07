// app/api/calculator/route.ts
// Compares moneylender loan cost vs bank/KCC loan cost for a farmer.
// No external API needed — pure math.
// 
// HOW TO CALL THIS:
// POST /api/calculator
// Body: { loanAmount: 50000, months: 6, cropName: "Paddy" }

import { NextRequest, NextResponse } from "next/server";

// ─── Interest Rate Constants ──────────────────────────────────────────────────
// These are real documented rates in Tamil Nadu
const RATES = {
  moneylender: {
    low: 36,      // 3% per month = 36% per year (common in TN villages)
    typical: 48,  // 4% per month = 48% per year (most common)
    high: 60,     // 5% per month = 60% per year (distress lending)
  },
  bank: {
    kcc: 4,           // Kisan Credit Card — 4% with govt subvention
    nabard: 7,        // NABARD short term crop loan
    tnCoop: 3,        // TN Cooperative bank — lowest available
  },
};

// ─── Helper: Simple Interest Calculation ─────────────────────────────────────
// Simple interest = Principal × Rate × Time
// Most moneylender loans in TN use simple interest (monthly)
function calculateSimpleInterest(
  principal: number,
  annualRatePercent: number,
  months: number
): {
  interest: number;
  totalRepayment: number;
  monthlyPayment: number;
} {
  const interest = Math.round(
    (principal * annualRatePercent * months) / (100 * 12)
  );
  const totalRepayment = principal + interest;
  const monthlyPayment = Math.round(totalRepayment / months);

  return { interest, totalRepayment, monthlyPayment };
}

// ─── Helper: Format currency ──────────────────────────────────────────────────
function formatINR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanAmount, months, cropName } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!loanAmount || !months) {
      return NextResponse.json(
        {
          error: "Missing required fields: loanAmount (number), months (number)",
          example: { loanAmount: 50000, months: 6, cropName: "Paddy" },
        },
        { status: 400 }
      );
    }

    if (loanAmount < 1000 || loanAmount > 1000000) {
      return NextResponse.json(
        { error: "loanAmount must be between Rs. 1,000 and Rs. 10,00,000" },
        { status: 400 }
      );
    }

    if (months < 1 || months > 36) {
      return NextResponse.json(
        { error: "months must be between 1 and 36" },
        { status: 400 }
      );
    }

    // ── Moneylender Scenarios ─────────────────────────────────────────────────
    const mlLow      = calculateSimpleInterest(loanAmount, RATES.moneylender.low, months);
    const mlTypical  = calculateSimpleInterest(loanAmount, RATES.moneylender.typical, months);
    const mlHigh     = calculateSimpleInterest(loanAmount, RATES.moneylender.high, months);

    // ── Bank / Formal Loan Scenarios ──────────────────────────────────────────
    const bankKCC    = calculateSimpleInterest(loanAmount, RATES.bank.kcc, months);
    const bankNABARD = calculateSimpleInterest(loanAmount, RATES.bank.nabard, months);
    const bankCoop   = calculateSimpleInterest(loanAmount, RATES.bank.tnCoop, months);

    // ── Savings Calculation ───────────────────────────────────────────────────
    // Compare typical moneylender (48%) vs best bank option (KCC 4%)
    const savingsVsTypicalML = mlTypical.totalRepayment - bankKCC.totalRepayment;
    const savingsVsHighML    = mlHigh.totalRepayment - bankKCC.totalRepayment;

    // ── Verdict ───────────────────────────────────────────────────────────────
    // Plain language conclusion for the farmer
    const verdictEN = `By taking a KCC loan instead of a moneylender, you save ${formatINR(savingsVsTypicalML)} over ${months} months on a ${formatINR(loanAmount)} loan.`;
    const verdictTA = `கடன் வட்டியாளருக்கு பதில் KCC கடன் எடுத்தால் ${months} மாதத்தில் Rs. ${savingsVsTypicalML.toLocaleString("en-IN")} சேமிக்கலாம்.`;

    // ── Build Response ────────────────────────────────────────────────────────
    return NextResponse.json({
      input: {
        loanAmount,
        loanAmountFormatted: formatINR(loanAmount),
        months,
        cropName: cropName ?? "Not specified",
      },

      moneylender: {
        label: "Moneylender / Private Loan",
        tamilLabel: "கடன் வட்டியாளர்",
        warning: "Unregulated. No legal protection for farmer.",
        scenarios: [
          {
            type: "Low (36% p.a. / 3% per month)",
            annualRate: "36%",
            interest: mlLow.interest,
            totalRepayment: mlLow.totalRepayment,
            monthlyPayment: mlLow.monthlyPayment,
            interestFormatted: formatINR(mlLow.interest),
            totalFormatted: formatINR(mlLow.totalRepayment),
          },
          {
            type: "Typical (48% p.a. / 4% per month)",
            annualRate: "48%",
            interest: mlTypical.interest,
            totalRepayment: mlTypical.totalRepayment,
            monthlyPayment: mlTypical.monthlyPayment,
            interestFormatted: formatINR(mlTypical.interest),
            totalFormatted: formatINR(mlTypical.totalRepayment),
          },
          {
            type: "High (60% p.a. / 5% per month)",
            annualRate: "60%",
            interest: mlHigh.interest,
            totalRepayment: mlHigh.totalRepayment,
            monthlyPayment: mlHigh.monthlyPayment,
            interestFormatted: formatINR(mlHigh.interest),
            totalFormatted: formatINR(mlHigh.totalRepayment),
          },
        ],
      },

      bankLoans: {
        label: "Formal Bank / Government Loan",
        tamilLabel: "வங்கி / அரசு கடன்",
        note: "Government regulated. Legal protection. No hidden charges.",
        scenarios: [
          {
            type: "TN Cooperative Bank",
            annualRate: "3%",
            interest: bankCoop.interest,
            totalRepayment: bankCoop.totalRepayment,
            monthlyPayment: bankCoop.monthlyPayment,
            interestFormatted: formatINR(bankCoop.interest),
            totalFormatted: formatINR(bankCoop.totalRepayment),
            recommended: false,
          },
          {
            type: "Kisan Credit Card (KCC)",
            annualRate: "4%",
            interest: bankKCC.interest,
            totalRepayment: bankKCC.totalRepayment,
            monthlyPayment: bankKCC.monthlyPayment,
            interestFormatted: formatINR(bankKCC.interest),
            totalFormatted: formatINR(bankKCC.totalRepayment),
            recommended: true,   // most accessible for TN farmers
          },
          {
            type: "NABARD Crop Loan",
            annualRate: "7%",
            interest: bankNABARD.interest,
            totalRepayment: bankNABARD.totalRepayment,
            monthlyPayment: bankNABARD.monthlyPayment,
            interestFormatted: formatINR(bankNABARD.interest),
            totalFormatted: formatINR(bankNABARD.totalRepayment),
            recommended: false,
          },
        ],
      },

      // The headline numbers — what judges and farmers look at first
      summary: {
        savingsVsTypicalMoneylender: savingsVsTypicalML,
        savingsVsHighMoneylender: savingsVsHighML,
        savingsFormatted: formatINR(savingsVsTypicalML),
        verdictEN,
        verdictTA,
        // Interest rate comparison for visual display
        moneylenderTypicalRate: "48% per year",
        bestBankRate: "3-4% per year",
        rateReduction: "12x lower interest with KCC vs typical moneylender",
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong processing your request" },
      { status: 500 }
    );
  }
}