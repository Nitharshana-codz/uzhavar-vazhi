import { NextRequest, NextResponse } from "next/server";

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
    "Help with crop loans, Kisan Credit Card, PMFBY crop insurance, NABARD-linked support, MSP, documents, weather risk, and basic app navigation.",
    "Use simple language, short paragraphs, and practical next steps.",
    "Do not invent official rates, scheme limits, or eligibility rules. If the information depends on district, season, crop, bank, insurer, or a government notification, say that it must be verified with the official portal, local agriculture office, cooperative society, or bank.",
    "Do not ask for Aadhaar numbers, bank account numbers, OTPs, passwords, or private financial details.",
    "This is educational support, not final financial, legal, or government advice.",
    language === "ta"
      ? "Reply primarily in Tamil. You may include English scheme names like KCC, PMFBY, NABARD, and MSP where useful."
      : "Reply in English. Include Tamil terms only when helpful.",
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
