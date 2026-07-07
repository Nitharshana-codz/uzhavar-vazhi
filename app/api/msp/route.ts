// app/api/msp/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getMSPForCrop,
  getBestMSPForCrop,
  MSP_DATA,
  MSP_SEASON,
  getAllCategories,
  getAllCropNames,
  calculateExpectedRevenue,
} from "@/lib/msp-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get("crop");
    const landAcres = parseFloat(searchParams.get("landAcres") ?? "1");

    if (crop) {
      const entries = getMSPForCrop(crop);

      if (entries.length === 0) {
        return NextResponse.json(
          {
            error: `MSP data not found for: ${crop}`,
            availableCrops: getAllCropNames(),
          },
          { status: 404 }
        );
      }

      const bestEntry = getBestMSPForCrop(crop)!;
      const revenueProjection = calculateExpectedRevenue(crop, landAcres);

      return NextResponse.json({
        crop: bestEntry.crop,
        tamilName: bestEntry.tamilName,
        season: bestEntry.season,
        category: bestEntry.category,
        marketingSeason: bestEntry.marketingSeason,
        // Return all varieties if crop has multiple (e.g. Cotton, Paddy)
        varieties: entries.map((e) => ({
          variety: e.variety ?? "Standard",
          mspPerQuintal: e.mspPerQuintal,
          mspPerKg: e.mspPerKg,
        })),
        revenueProjection: revenueProjection
          ? {
              landAcres,
              estimatedYieldKg: revenueProjection.estimatedYieldKg,
              expectedAtMSP: revenueProjection.expectedRevenueAtMSP,
              expectedAtMarket: revenueProjection.expectedRevenueAtMarket,
              lostToMiddlemen: revenueProjection.lostToMiddlemen,
              message: `By claiming MSP, you could earn ₹${revenueProjection.lostToMiddlemen.toLocaleString("en-IN")} more this season`,
              tamilMessage: `MSP விலையில் விற்றால் ₹${revenueProjection.lostToMiddlemen.toLocaleString("en-IN")} அதிகம் கிடைக்கும்`,
            }
          : null,
      });
    }

    // Return full table
    return NextResponse.json({
      season: MSP_SEASON,
      source: MSP_DATA[0]?.metadata.source ?? "MSP JSON data",
      totalCrops: MSP_DATA.length,
      categories: getAllCategories(),
      crops: MSP_DATA.map((m) => ({
        crop: m.crop,
        tamilName: m.tamilName,
        variety: m.variety ?? null,
        season: m.season,
        category: m.category,
        mspPerQuintal: m.mspPerQuintal,
        mspPerKg: m.mspPerKg,
      })),
    });

  } catch {
    return NextResponse.json(
      { error: "Something went wrong fetching MSP data" },
      { status: 500 }
    );
  }
}
