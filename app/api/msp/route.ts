// app/api/msp/route.ts
// GET /api/msp              → returns all 21 crops
// GET /api/msp?crop=Paddy   → returns Paddy MSP only
// GET /api/msp?crop=Cotton&landAcres=2 → returns Cotton + revenue projection

import { NextRequest, NextResponse } from "next/server";
import {
  getMSPForCrop,
  getBestMSPForCrop,
  MSP_DATA,
  getAllCategories,
  getAllCropNames,
  calculateExpectedRevenue,
} from "@/lib/msp-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get("crop");
    const landAcres = parseFloat(searchParams.get("landAcres") ?? "1");

    // ── Specific crop requested ──────────────────────────────────────────────
    if (crop) {
      const entries = getMSPForCrop(crop);

      // Crop not found — send helpful error with full crop list
      if (entries.length === 0) {
        return NextResponse.json(
          {
            error: `MSP data not found for: "${crop}"`,
            hint: "Check spelling. Crop names are case-sensitive.",
            availableCrops: getAllCropNames(),
          },
          { status: 404 }
        );
      }

      const bestEntry = getBestMSPForCrop(crop)!;
      const revenue = calculateExpectedRevenue(crop, landAcres);

      return NextResponse.json({
        crop: bestEntry.crop,
        tamilName: bestEntry.tamilName,
        season: bestEntry.season,
        category: bestEntry.category,
        governmentSeason: "2026-27",

        // If crop has multiple varieties (Paddy, Cotton, Sorghum, Copra)
        // we return all of them so the frontend can display both
        varieties: entries.map((e) => ({
          variety: e.variety ?? "Standard",
          mspPerQuintal: e.mspPerQuintal,
          mspPerKg: e.mspPerKg,
        })),

        // Revenue projection (only if landAcres was provided)
        revenueProjection: revenue
          ? {
              landAcres,
              estimatedYieldKg: revenue.estimatedYieldKg,
              // Government guaranteed price
              revenueAtMSP: revenue.revenueAtMSP,
              // What middlemen actually pay
              revenueAtMarket: revenue.revenueAtMarket,
              // The gap — this is what judges and farmers notice
              lostToMiddlemen: revenue.lostToMiddlemen,
              priceComparison: {
                mspPricePerKg: revenue.mspPerKg,
                marketPricePerKg: revenue.marketPricePerKg,
              },
              // Human readable messages in both languages
              message: `By selling at MSP instead of market price, you could earn Rs. ${revenue.lostToMiddlemen.toLocaleString("en-IN")} more this season`,
              tamilMessage: `MSP விலையில் விற்றால் இந்த பருவம் Rs. ${revenue.lostToMiddlemen.toLocaleString("en-IN")} அதிகம் கிடைக்கும்`,
            }
          : null,
      });
    }

    // ── No crop specified — return full MSP table ────────────────────────────
    return NextResponse.json({
      governmentSeason: "2026-27",
      source: "CCEA — Cabinet Committee on Economic Affairs, Govt. of India",
      totalEntries: MSP_DATA.length,
      totalUniqueCrops: getAllCropNames().length,
      categories: getAllCategories(),
      allCrops: MSP_DATA.map((m) => ({
        id: m.id,
        crop: m.crop,
        tamilName: m.tamilName,
        variety: m.variety ?? null,
        season: m.season,
        category: m.category,
        mspPerQuintal: m.mspPerQuintal,
        mspPerKg: m.mspPerKg,
      })),
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong fetching MSP data" },
      { status: 500 }
    );
  }
}