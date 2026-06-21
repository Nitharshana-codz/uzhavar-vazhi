// app/api/eligibility/route.ts
// This is a backend API route. When the frontend sends a request to /api/eligibility,
// this code runs on the server and sends back a JSON response.

import { NextRequest, NextResponse } from "next/server";
import { getDistrictByName } from "@/lib/district-data";
import { getEligibleLoans, getEligibleInsurance } from "@/lib/schemes-data";

// "POST" means this function runs when the frontend sends data TO us
// (as opposed to "GET" which is for just requesting data without sending any)
export async function POST(request: NextRequest) {
  try {
    // Read the JSON data the frontend sent us
    const body = await request.json();
    const { district, crop, landAcres, isTenant } = body;

    // Basic validation — if required fields are missing, send back an error
    if (!district || !crop || landAcres === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: district, crop, landAcres" },
        { status: 400 }
      );
    }

    // Look up the district data
    const districtData = getDistrictByName(district);
    if (!districtData) {
      return NextResponse.json(
        { error: `District "${district}" not found in our database` },
        { status: 404 }
      );
    }

    // Run our matching logic
    const eligibleLoans = getEligibleLoans(landAcres, isTenant ?? false);
    const eligibleInsurance = getEligibleInsurance(crop);

    // Send back a clean, structured response
    return NextResponse.json({
      district: districtData.name,
      districtTamilName: districtData.tamilName,
      crop,
      landAcres,
      isTenant: isTenant ?? false,
      loans: eligibleLoans,
      insurance: eligibleInsurance,
    });
  } catch (error) {
    // If anything unexpected breaks, we send a clean error instead of crashing
    return NextResponse.json(
      { error: "Something went wrong processing your request" },
      { status: 500 }
    );
  }
}
