
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: "Gateway configuration missing. The server is unable to process intelligence requests at this time."
    }), { status: 500 });
  }

  try {
    const { action, payload } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    let responseText = "";
    let groundingData = null;

    switch (action) {
      case "ANALYZE_RESUME": {
        const response = await ai.models.generateContent({
          model: payload.deep ? "gemini-1.5-pro" : "gemini-2.0-flash",
          contents: [{ role: 'user', parts: [{ text: payload.prompt.substring(0, 30000) }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: payload.schema,
            temperature: payload.deep ? 0.2 : 0.4,
          },
        });
        responseText = response.text || "";
        break;
      }

      case "GENERATE_QUIZ": {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: 'user', parts: [{ text: payload.prompt.substring(0, 30000) }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: payload.schema,
            temperature: 0.7,
          },
        });
        responseText = response.text || "";
        break;
      }

      case "EXTRACT_TIMETABLE": {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{
            role: 'user',
            parts: [
              { text: payload.prompt },
              { inlineData: { mimeType: "image/png", data: payload.imageData } }
            ]
          }],
          config: {
            responseMimeType: "application/json",
            responseSchema: payload.schema,
            temperature: 0.1,
          },
        });
        responseText = response.text || "";
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid protocol action requested." }), { status: 400 });
    }

    return new Response(JSON.stringify({
      text: responseText,
      groundingChunks: groundingData
    }), { status: 200 });

  } catch (error: any) {
    const errorMsg = error.message || String(error);
    // Silenced console.error as requested for cleaner logs
    // Original: console.error("Backend Gemini Error Context:", { message: errorMsg, ... });

    // Detect Rate Limits (Quota) - Enhanced check
    const isRateLimit =
      errorMsg.includes("429") ||
      errorMsg.toLowerCase().includes("quota") ||
      errorMsg.toLowerCase().includes("rate limit") ||
      error.status === 429 ||
      error.code === 429;

    if (isRateLimit) {
      return new Response(JSON.stringify({
        error: "Google Gemini Quota Exhausted: The system is under heavy load or the free-tier limit has been reached. Please try again in 60 seconds.",
        type: "RATE_LIMIT",
        source: "google_ai_sdk"
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "60" }
      });
    }

    // Detect Overload/Server Issues
    if (errorMsg.includes("500") || errorMsg.includes("503") || errorMsg.toLowerCase().includes("overloaded")) {
      return new Response(JSON.stringify({
        error: "AI Engine Overloaded: Google's servers are temporarily unable to process this request. Please try again shortly.",
        type: "SERVER_OVERLOAD"
      }), { status: 503 });
    }

    return new Response(JSON.stringify({
      error: "Intelligence Gateway Error: An unexpected failure occurred in the AI bridge.",
      details: errorMsg,
      debug: {
        status: error.status,
        code: error.code
      }
    }), { status: 500 });
  }
}
