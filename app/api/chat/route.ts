

import { NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const TIMEOUT_MS = 30000;

export async function POST(request: Request) {
  console.log("[AutoSpec] Chat request received");

  try {
    const apiKey = process.env.AUTOSPEC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("[AutoSpec] Gemini API key is missing");

      return NextResponse.json(
        { error: "Gemini API key is not configured. Check your .env.local file." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const message = body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter a question." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(
          `[AutoSpec] Sending Gemini request (${attempt + 1}/3)`
        );

        const response = await Promise.race([
          ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `You are AutoSpec AI, a helpful car recommendation assistant.

Help users choose, understand, and compare cars based on their budget and needs.
Explain car specifications and features in simple language.
Ask a short follow-up question if important information is missing.
Never invent exact prices, availability, or vehicle specifications.
If information may vary by country, model year, or trim, explain that it needs verification.
Keep answers clear, helpful, and reasonably concise.

User question: ${message.trim().slice(0, 4000)}`,
            config: {
  thinkingConfig: {
    thinkingLevel: ThinkingLevel.LOW,
  },
},
          }),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(
                new Error("Gemini request timed out after 30 seconds.")
              );
            }, TIMEOUT_MS);
          }),
        ]);

        console.log("[AutoSpec] Gemini response received");

        return NextResponse.json({
          reply:
            response.text ??
            "I couldn't generate a response. Please try again.",
        });
      } catch (error: unknown) {
        const err = error as {
          status?: number | string;
          code?: number | string;
          message?: string;
        };

        const errorMessage = err?.message ?? "";
        const status = err?.status ?? err?.code;

        console.error("[AutoSpec] Gemini request failed:", {
          status,
          message: errorMessage,
        });

        const isTemporaryError =
          status === 503 ||
          status === "503" ||
          errorMessage.includes("UNAVAILABLE") ||
          errorMessage.includes("high demand") ||
          errorMessage.includes("503");

        const isTimeout = errorMessage.includes("timed out");

        const isRateLimit =
          status === 429 ||
          status === "429" ||
          errorMessage.includes("RESOURCE_EXHAUSTED");

        const isAuthError =
          status === 401 ||
          status === 403 ||
          status === "401" ||
          status === "403";

        // Retry temporary server errors, but not timeouts.
        if (isTemporaryError && attempt < 2) {
          await sleep(1000 * (attempt + 1));
          continue;
        }

        let userMessage =
          "Unable to get an AI response. Please try again.";

        if (isTimeout) {
          userMessage =
            "Gemini took too long to respond. Please try again.";
        } else if (isTemporaryError) {
          userMessage =
            "Gemini is temporarily busy. Please try again in a minute.";
        } else if (isRateLimit) {
          userMessage =
            "Gemini API quota or rate limit reached. Please try again later.";
        } else if (isAuthError) {
          userMessage =
            "Gemini API authentication failed. Check your API key and permissions.";
        }

        const responseStatus = isTemporaryError
          ? 503
          : isRateLimit
            ? 429
            : isAuthError
              ? 401
              : isTimeout
                ? 504
                : 500;

        return NextResponse.json(
          { error: userMessage },
          { status: responseStatus }
        );
      }
    }

    return NextResponse.json(
      { error: "Gemini is temporarily busy. Please try again shortly." },
      { status: 503 }
    );
  } catch (error) {
    console.error("[AutoSpec] Chat route failed:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

