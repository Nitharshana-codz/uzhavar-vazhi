import { NextRequest, NextResponse } from "next/server";

import coimbatoreBank from "../../../data/banks/coimbatore.json";
import maduraiBank from "../../../data/banks/madurai.json";
import salemBank from "../../../data/banks/salem.json";
import thanjavurBank from "../../../data/banks/thanjavur.json";
import coconut from "../../../data/crops/coconut.json";
import cotton from "../../../data/crops/cotton.json";
import maize from "../../../data/crops/maize.json";
import paddy from "../../../data/crops/paddy.json";
import ragi from "../../../data/crops/ragi.json";
import turmeric from "../../../data/crops/turmeric.json";
import coimbatore from "../../../data/districts/coimbatore.json";
import madurai from "../../../data/districts/madurai.json";
import salem from "../../../data/districts/salem.json";
import thanjavur from "../../../data/districts/thanjavur.json";
import aadhaar from "../../../data/documents/aadhaar.json";
import bankPassbook from "../../../data/documents/bank_passbook.json";
import chitta from "../../../data/documents/chitta.json";
import cropSowingCertificate from "../../../data/documents/crop_sowing_certificate.json";
import landRecord from "../../../data/documents/land_record.json";
import patta from "../../../data/documents/patta.json";
import photo from "../../../data/documents/photo.json";
import msp2025 from "../../../data/msp/2025-26.json";
import msp2026 from "../../../data/msp/2026-27.json";
import kcc from "../../../data/schemes/kcc.json";
import nabard from "../../../data/schemes/nabard.json";
import pmfby from "../../../data/schemes/pmfby.json";
import tnInterestFreeCropLoan from "../../../data/schemes/tn_interest_free_crop_loan.json";
import cropRules from "../../../data/weather_rules/crop_rules.json";

type ChatRole = "user" | "assistant";

type IncomingMessage = {
  role?: unknown;
  content?: unknown;
};

type OpenRouterMessage = {
  role: "system" | ChatRole;
  content: string;
};

type OpenRouterResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  error?: {
    message?: string;
  };
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";
const APP_TITLE = "Uzhavar Vazhi";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const DISTRICTS = [coimbatore, madurai, salem, thanjavur];
const CROPS = [coconut, cotton, maize, paddy, ragi, turmeric];
const SCHEMES = [kcc, nabard, pmfby, tnInterestFreeCropLoan];
const DOCUMENTS = [
  aadhaar,
  bankPassbook,
  chitta,
  cropSowingCertificate,
  landRecord,
  patta,
  photo,
];
const BANKS = [coimbatoreBank, maduraiBank, salemBank, thanjavurBank];

const SUGGESTIONS = {
  en: [
    "Check my eligibility",
    "What documents are needed?",
    "Explain PMFBY claims",
  ],
  ta: [
    "என் தகுதியை சரிபார்க்கவும்",
    "எந்த ஆவணங்கள் தேவை?",
    "PMFBY கோரிக்கை விளக்கவும்",
  ],
};

function getSystemPrompt(language: "en" | "ta"): string {
  return [
    "You are Uzhavar AI, a careful assistant for Tamil Nadu farmers using the Uzhavar Vazhi app.",
    "Help with crop loans, Kisan Credit Card, PMFBY crop insurance, NABARD-linked support, MSP, documents, weather risk, and app navigation.",
    "Use simple language, short paragraphs, and practical next steps.",
    "Answer questions about how to use the website: Dashboard checks eligibility and risk, Schemes lists loans/insurance, MSP shows price/revenue data, Weather shows forecast/recommendations, Calculator compares bank vs moneylender cost, Chat answers doubts.",
    "Do not invent official rates, scheme limits, or eligibility rules. If the information depends on district, season, crop, bank, insurer, or a government notification, say that it must be verified with the official portal, local agriculture office, cooperative society, or bank.",
    "When using app data, mention if the data is marked as needing official verification.",
    "Do not ask for Aadhaar numbers, bank account numbers, OTPs, passwords, or private financial details.",
    "This is educational support, not final financial, legal, or government advice.",
    language === "ta"
      ? "Reply primarily in Tamil. You may include English scheme names like KCC, PMFBY, NABARD, and MSP where useful."
      : "Reply in English. Include Tamil terms only when helpful.",
  ].join("\n");
}

function formatRange(
  label: string,
  range: { min?: number; max?: number } | undefined,
  unit: string
): string | null {
  if (!range || typeof range.min !== "number" || typeof range.max !== "number") {
    return null;
  }

  return `${label} ${range.min}-${range.max}${unit}`;
}

function getWebsiteKnowledgeContext(): string {
  const districtLines = DISTRICTS.map((district) => {
    const crops = district.major_crops.join(", ");
    const schemes = district.available_schemes.join(", ");
    return `- ${district.name.en} (${district.name.ta}): zone ${district.agro_climatic_zone}, annual rainfall ${district.annual_rainfall_mm}mm, major crops ${crops}, schemes ${schemes}, status ${district.metadata.verification_status}`;
  });

  const cropLines = CROPS.map((crop) => {
    const temp = formatRange("temp", crop.temperature, "C");
    const rainfall = formatRange("rainfall", crop.rainfall, "mm");
    const humidity = formatRange("humidity", crop.humidity, "%");
    return `- ${crop.name.en} (${crop.name.ta}): ${crop.category}, seasons ${crop.season.join(", ")}, water ${crop.water_requirement}, ${[temp, rainfall, humidity].filter(Boolean).join(", ")}, status ${crop.metadata.verification_status}`;
  });

  const schemeLines = SCHEMES.map((scheme) => {
    const interest =
      "interest_rate" in scheme && typeof scheme.interest_rate === "number"
        ? `interest ${scheme.interest_rate}%`
        : "interest varies/verify officially";
    const collateral =
      "collateral_free_limit" in scheme &&
      typeof scheme.collateral_free_limit === "number"
        ? `collateral-free limit Rs. ${scheme.collateral_free_limit.toLocaleString("en-IN")}`
        : "limit varies/verify officially";
    return `- ${scheme.name.en} (${scheme.name.ta}): ${scheme.type}, tenant farmer allowed ${scheme.tenant_farmer ? "yes" : "no"}, ${interest}, ${collateral}, documents ${scheme.documents.join(", ")}, status ${scheme.metadata.verification_status}`;
  });

  const documentLines = DOCUMENTS.map((document) => {
    return `- ${document.id}: ${document.name.en} (${document.name.ta}), mandatory ${document.mandatory ? "yes" : "depends/no"}`;
  });

  const bankLines = BANKS.flatMap((districtBank) =>
    districtBank.banks.map((bank) => {
      return `- ${districtBank.district}: ${bank.name}, coordinates ${bank.latitude}, ${bank.longitude}, phone ${bank.phone || "not available"}, website ${bank.website || "not available"}, status ${districtBank.metadata.verification_status}`;
    })
  );

  const msp2025Lines = Object.entries(msp2025.prices).map(
    ([crop, price]) => `- ${crop}: Rs. ${price}/${msp2025.unit}`
  );
  const msp2026Lines = Object.entries(msp2026.prices).map(
    ([crop, price]) =>
      `- ${crop}: ${typeof price === "number" ? `Rs. ${price}/${msp2026.unit}` : "pending official update"}`
  );

  const weatherLines = Object.entries(cropRules)
    .filter(([cropId]) => cropId !== "metadata")
    .map(([cropId, rules]) => {
      const typedRules = rules as {
        temperature?: { min?: number; max?: number };
        rainfall?: { min?: number; max?: number };
        humidity?: { min?: number; max?: number };
      };
      const temp = formatRange("temp", typedRules.temperature, "C");
      const rainfall = formatRange("rainfall", typedRules.rainfall, "mm");
      const humidity = formatRange("humidity", typedRules.humidity, "%");
      return `- ${cropId}: ${[temp, rainfall, humidity].filter(Boolean).join(", ")}`;
    });

  return [
    "Website/app features:",
    "- /dashboard: farmer eligibility, risk score, and PDF profile workflow.",
    "- /schemes: loan and insurance scheme browsing.",
    "- /msp: MSP lookup and revenue projection.",
    "- /weather: district weather and crop recommendation support.",
    "- /calculator: bank loan vs moneylender cost comparison.",
    "- /chat: AI assistant for farmer and website doubts.",
    "",
    "Current app districts:",
    ...districtLines,
    "",
    "Current app crops:",
    ...cropLines,
    "",
    "Current app schemes:",
    ...schemeLines,
    "",
    "Current app documents:",
    ...documentLines,
    "",
    "Current app bank records:",
    ...bankLines,
    "",
    `MSP ${msp2025.season} (${msp2025.metadata.verification_status}):`,
    ...msp2025Lines,
    `MSP ${msp2026.season} (${msp2026.status}, ${msp2026.metadata.verification_status}):`,
    ...msp2026Lines,
    "",
    "Weather/crop suitability rules:",
    ...weatherLines,
  ].join("\n");
}

function cleanContent(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanHistory(history: unknown): OpenRouterMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-8)
    .map((message: IncomingMessage) => {
      const role = message.role === "assistant" ? "assistant" : "user";
      const content = cleanContent(message.content, 1500);
      return content ? { role, content } : null;
    })
    .filter((message): message is OpenRouterMessage => message !== null);
}

function fallbackResponse(language: "en" | "ta"): string {
  if (language === "ta") {
    return "மன்னிக்கவும், AI சேவை இப்போது கிடைக்கவில்லை. உங்கள் கேள்விக்கு மாவட்டம், பயிர், நில அளவு, உரிமையாளர்/குத்தகை விவரம் போன்ற தகவல்களுடன் உள்ளூர் வங்கி அல்லது வேளாண்மை அலுவலகத்தில் உறுதி செய்யவும்.";
  }

  return "Sorry, the AI service is not available right now. For farmer-facing decisions, verify district, crop, land size, ownership or tenancy, and scheme details with the local bank, cooperative society, or agriculture office.";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = cleanContent(body.message, 1000);
    const language = body.language === "ta" ? "ta" : "en";
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!question) {
      return NextResponse.json(
        { error: "Message is required", suggestions: SUGGESTIONS[language] },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENROUTER_API_KEY is not configured",
          response:
            language === "ta"
              ? "AI chatbot ஐ இயக்க OPENROUTER_API_KEY தேவை. அதை .env.local கோப்பில் சேர்த்து dev server ஐ restart செய்யவும்."
              : "The AI chatbot needs OPENROUTER_API_KEY in .env.local. Add the key and restart the dev server.",
          suggestions: SUGGESTIONS[language],
        },
        { status: 503 }
      );
    }

    const messages: OpenRouterMessage[] = [
      { role: "system", content: getSystemPrompt(language) },
      { role: "system", content: getWebsiteKnowledgeContext() },
      ...cleanHistory(body.history),
      { role: "user", content: question },
    ];

    const openRouterResponse = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,
        "X-OpenRouter-Title": APP_TITLE,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        messages,
        temperature: 0.35,
        max_tokens: 700,
      }),
    });

    const data = (await openRouterResponse.json()) as OpenRouterResponse;

    if (!openRouterResponse.ok) {
      return NextResponse.json(
        {
          error: data.error?.message ?? "OpenRouter request failed",
          response: fallbackResponse(language),
          suggestions: SUGGESTIONS[language],
        },
        { status: openRouterResponse.status }
      );
    }

    const response = data.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      response: response || fallbackResponse(language),
      suggestions: SUGGESTIONS[language],
      model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Something went wrong processing the chat request",
        response: fallbackResponse("en"),
        suggestions: SUGGESTIONS.en,
      },
      { status: 500 }
    );
  }
}
