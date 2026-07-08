// app/api/weather/route.ts
// This route:
// 1. Takes a district name from the frontend
// 2. Looks up its GPS coordinates from weather-data.ts
// 3. Calls Open-Meteo API (free, no key needed) to get current weather
// 4. Runs crop matching logic
// 5. Returns weather + crop recommendations + crops to avoid
//
// HOW TO CALL:
// GET /api/weather?district=Coimbatore

import { NextRequest, NextResponse } from "next/server";
import {
  getCoordsForDistrict,
  matchCropsToWeather,
  DISTRICT_COORDS,
} from "../../../lib/weather-data";

// ─── Open-Meteo URL Builder ───────────────────────────────────────────────────
// Open-Meteo is a completely free weather API — no signup, no key.
// We request: temperature, rainfall (precipitation), humidity, wind speed
// "current=" means get the live reading right now, not a forecast
function buildOpenMeteoURL(lat: number, lon: number): string {
  return (
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&forecast_days=7` +
    `&timezone=Asia%2FKolkata` // IST timezone for Tamil Nadu
  );
}

// ─── Weather Description Helper ───────────────────────────────────────────────
// Converts raw numbers into human-readable descriptions
function describeWeather(tempC: number, rainfall: number, humidity: number): {
  summary: string;
  tamilSummary: string;
  condition: "dry" | "moderate" | "wet";
} {
  let summary = "";
  let tamilSummary = "";
  let condition: "dry" | "moderate" | "wet" = "moderate";

  // Temperature description
  const tempDesc =
    tempC < 20 ? "cool" :
    tempC < 28 ? "mild" :
    tempC < 34 ? "warm" : "hot";

  const tamilTempDesc =
    tempC < 20 ? "குளிர்" :
    tempC < 28 ? "மிதமான" :
    tempC < 34 ? "வெப்பமான" : "மிகவும் வெப்பமான";

  // Rainfall description
  if (rainfall < 1) {
    summary = `${tempDesc} and dry`;
    tamilSummary = `${tamilTempDesc} மற்றும் வறண்ட`;
    condition = "dry";
  } else if (rainfall < 10) {
    summary = `${tempDesc} with light rain`;
    tamilSummary = `${tamilTempDesc} மற்றும் லேசான மழை`;
    condition = "moderate";
  } else if (rainfall < 20) {
    summary = `${tempDesc} with moderate rain`;
    tamilSummary = `${tamilTempDesc} மற்றும் மிதமான மழை`;
    condition = "moderate";
  } else {
    summary = `${tempDesc} with heavy rain`;
    tamilSummary = `${tamilTempDesc} மற்றும் கனமழை`;
    condition = "wet";
  }

  summary = `${summary}, ${Math.round(humidity)}% humidity`;

  return { summary, tamilSummary, condition };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");

    // ── Validation ────────────────────────────────────────────────────────────
    if (!district) {
      return NextResponse.json(
        {
          error: "Missing required parameter: district",
          example: "/api/weather?district=Coimbatore",
          availableDistricts: DISTRICT_COORDS.map((d) => d.name),
        },
        { status: 400 }
      );
    }

    // ── Find GPS coordinates ──────────────────────────────────────────────────
    const coords = getCoordsForDistrict(district);
    if (!coords) {
      return NextResponse.json(
        {
          error: `District "${district}" not found`,
          availableDistricts: DISTRICT_COORDS.map((d) => d.name),
        },
        { status: 404 }
      );
    }

    // ── Call Open-Meteo API ───────────────────────────────────────────────────
    // fetch() is built into Next.js — no extra library needed
    const weatherURL = buildOpenMeteoURL(coords.lat, coords.lon);
    const weatherResponse = await fetch(weatherURL, {
      // Cache weather for 30 minutes — we don't need it updated every second
      // This also reduces API calls if multiple farmers check simultaneously
      next: { revalidate: 1800 },
    });

    if (!weatherResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch weather data. Please try again." },
        { status: 502 }
      );
    }

    const weatherData = await weatherResponse.json();

    // ── Extract the numbers we need ───────────────────────────────────────────
    // Open-Meteo returns data inside "current" object
    const current = weatherData.current;
    const tempC: number = current.temperature_2m;
    const rainfallMM: number = current.precipitation;
    const humidity: number = current.relative_humidity_2m;
    const windSpeed: number = current.wind_speed_10m;
    const daily = weatherData.daily;
    const forecast = Array.isArray(daily?.time)
      ? daily.time.map((date: string, index: number) => ({
          date,
          maxTempC: daily.temperature_2m_max[index],
          minTempC: daily.temperature_2m_min[index],
          rainfallMM: daily.precipitation_sum[index],
        }))
      : [];

    // ── Run crop matching ─────────────────────────────────────────────────────
    const allCropResults = matchCropsToWeather({ tempC, rainfallMM, humidity });
    const recommended = allCropResults.filter((c) => c.status === "recommended");
    const avoid = allCropResults.filter((c) => c.status === "avoid");

    // ── Build weather description ─────────────────────────────────────────────
    const { summary, tamilSummary, condition } = describeWeather(
      tempC,
      rainfallMM,
      humidity
    );

    // ── Build farming advisory ────────────────────────────────────────────────
    // General advice based on overall weather condition
    const farmingAdvisory = {
      dry: {
        en: "Low rainfall detected. Prioritise irrigation if planting. Drought-tolerant crops like Cumbu and Ragi are best this season.",
        ta: "குறைந்த மழைப்பொழிவு கண்டறியப்பட்டது. நடவு செய்தால் நீர்ப்பாசனத்திற்கு முன்னுரிமை கொடுங்கள். கம்பு மற்றும் ராகி போன்ற வறட்சி-தாங்கும் பயிர்கள் சிறந்தவை.",
      },
      moderate: {
        en: "Moderate conditions detected. Good time for planting. Monitor rainfall weekly and ensure drainage is ready.",
        ta: "மிதமான சூழல் கண்டறியப்பட்டது. நடவுக்கு நல்ல நேரம். வாராந்திர மழையை கண்காணித்து வடிகால் தயாராக இருப்பதை உறுதி செய்யுங்கள்.",
      },
      wet: {
        en: "Heavy rainfall detected. Avoid sowing for now. Ensure field drainage is clear. Check standing crops for waterlogging damage.",
        ta: "கனமழை கண்டறியப்பட்டது. இப்போது விதைப்பை தவிர்க்கவும். வயல் வடிகால் தெளிவாக இருப்பதை உறுதி செய்யுங்கள். நிற்கும் பயிர்களை நீர்த்தேக்க சேதத்திற்காக சரிபார்க்கவும்.",
      },
    };

    // ── Final response ────────────────────────────────────────────────────────
    return NextResponse.json({
      district: coords.name,
      fetchedAt: new Date().toISOString(),

      // Raw weather numbers
      weather: {
        temperatureC: tempC,
        rainfallMM,
        humidityPercent: humidity,
        windSpeedKmh: windSpeed,
        summary,
        tamilSummary,
        condition,
      },
      forecast,

      // Farming advisory based on overall condition
      farmingAdvisory: farmingAdvisory[condition],

      // Crops split into two clear lists
      recommendations: {
        totalAnalysed: allCropResults.length,
        recommendedCount: recommended.length,
        avoidCount: avoid.length,
        recommended,
        avoid,
      },
    });

  } catch (error) {
    // Specific error for network failures (Open-Meteo unreachable)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { error: "Cannot reach weather service. Check internet connection." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong processing weather data" },
      { status: 500 }
    );
  }
}
