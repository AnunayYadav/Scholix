import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Add CORS headers just in case
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gateway configuration missing. The server is unable to process intelligence requests at this time." });
  }

  try {
    const { action, payload } = req.body || {};
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

      case "GENERATE_SUBJECT_ORIGINALS": {
        const response = await ai.models.generateContent({
          model: "gemini-1.5-pro",
          contents: [{ role: 'user', parts: [{ text: payload.prompt.substring(0, 30000) }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: payload.schema,
            temperature: 0.2,
          },
        });
        responseText = response.text || "";
        break;
      }

      default:
        return res.status(400).json({ error: "Invalid protocol action requested." });
    }

    return res.status(200).json({
      text: responseText,
      groundingChunks: groundingData
    });

  } catch (error: any) {
    const errorMsg = error.message || String(error);

    // Detect Rate Limits (Quota) - Enhanced check
    const isRateLimit =
      errorMsg.includes("429") ||
      errorMsg.toLowerCase().includes("quota") ||
      errorMsg.toLowerCase().includes("rate limit") ||
      error.status === 429 ||
      error.code === 429;

    if (isRateLimit) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({
        error: "Google Gemini Quota Exhausted: The system is under heavy load or the free-tier limit has been reached. Please try again in 60 seconds.",
        type: "RATE_LIMIT",
        source: "google_ai_sdk",
        rawError: errorMsg
      });
    }

    // Detect Overload/Server Issues
    if (errorMsg.includes("500") || errorMsg.includes("503") || errorMsg.toLowerCase().includes("overloaded")) {
      return res.status(503).json({
        error: "AI Engine Overloaded: Google's servers are temporarily unable to process this request. Please try again shortly.",
        type: "SERVER_OVERLOAD"
      });
    }

    return res.status(500).json({
      error: "Intelligence Gateway Error: An unexpected failure occurred in the AI bridge.",
      details: errorMsg,
      debug: {
        status: error.status,
        code: error.code
      }
    });
  }
}
