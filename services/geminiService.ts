
import { Type } from "@google/genai";
import { ResumeAnalysisResult, DaySchedule, QuizQuestion } from "../types.ts";

/**
 * Internal helper to communicate with the backend Gemini proxy
 */
const callGeminiProxy = async (action: string, payload: any, retries = 7, delay = 3000) => {
  console.log(`[Gemini Service v2.1] Initiating ${action} via Proxy...`);
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });

      if (res.ok) {
        return await res.json();
      }

      const errData = await res.json().catch(() => ({}));

      // If it's a rate limit or server overload and we have retries left
      if ((res.status === 429 || res.status === 503) && i < retries) {
        // More aggressive exponential backoff for 429
        const multiplier = res.status === 429 ? 2.5 : 2;
        const jitter = Math.random() * 2000;
        const backoff = (delay * Math.pow(multiplier, i)) + jitter;

        console.warn(`[Gemini Core] ${res.status === 429 ? 'Rate Limit Trace' : 'Server Overload'}. Cooling down for ${Math.round(backoff / 1000)}s... (Attempt ${i + 1}/${retries})`);

        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }

      if (res.status === 429) {
        throw new Error(errData.error || "The AI is currently busy. Please wait a minute before trying again.");
      }

      if (res.status === 503 || res.status === 504) {
        throw new Error("Nexus Intelligence is temporarily overloaded. Please try again shortly.");
      }

      throw new Error(errData.error || `Request failed with status ${res.status}. Please check your connection.`);
    } catch (e: any) {
      if (i === retries) {
        if (e.message.includes('Failed to fetch')) {
          throw new Error("Network Error: Could not reach the AI gateway. Please check your internet connection.");
        }
        throw e;
      }
      // For network errors, we also retry
      console.warn(`Network error during Gemini call. Retrying... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Module: Quiz Taker
 */
export const generateQuizFromSyllabus = async (subjectName: string, syllabusText: string, units: number[]): Promise<QuizQuestion[]> => {
  const prompt = `
    CRITICAL INSTRUCTION: GENERATE AN MCQ QUIZ STRICTLY FOR THE SUBJECT: "${subjectName}".
    
    SOURCE MATERIAL (SYLLABUS):
    ---
    ${syllabusText.substring(0, 12000)}
    ---

    SCOPE: ONLY COVER TOPICS FROM UNIT(S): ${units.join(", ")}.

    STRICT GUIDELINES:
    1. SUBJECT LOCK: You are restricted to "${subjectName}". Do not include generic questions or topics from unrelated engineering/management subjects.
    2. QUESTION QUALITY: Generate exactly 10 high-level MCQs.
    3. DISTRACTORS: All 4 options must be plausible.
    4. EXPLANATION: Each explanation MUST reference why the answer is correct.
    5. UNIT ATTRIBUTION: Each question object MUST include a "unit" field.

    Output format: JSON array of objects.
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        unit: { type: Type.INTEGER, description: "The unit number this question belongs to" },
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
        correctAnswer: { type: Type.INTEGER, description: "Index 0-3 of the correct option" },
        explanation: { type: Type.STRING }
      },
      required: ["unit", "question", "options", "correctAnswer", "explanation"]
    }
  };

  const data = await callGeminiProxy("GENERATE_QUIZ", { prompt, schema });
  return JSON.parse(data.text) as QuizQuestion[];
};

/**
 * Module: Placement Prefect
 */
export const analyzeResume = async (resumeText: string, jdText: string, deepAnalysis: boolean = false): Promise<ResumeAnalysisResult> => {
  const depthInstruction = deepAnalysis
    ? "Act as a ruthless, hyper-critical technical recruiter. Point out exactly where the candidate is failing."
    : "Perform a professional resume audit against modern tech standards.";

  const prompt = `
    TASK: GENERATE A SEMANTIC ATS DIAGNOSTIC REPORT AND FULL TEXT X-RAY.
    TARGET CONTEXT (JD/TRENDS): ${jdText}
    RESUME CONTENT: ${resumeText}

    REQUIREMENTS:
    ${depthInstruction}
    1. PROVIDE FEEDBACK FOR: keywordAnalysis, jobFit, achievements, formatting, language, and branding.
    2. ANNOTATE FULL CONTENT: Fragments for 'good', 'bad', 'neutral' with reason and suggestion.

    Output a JSON object.
  `;

  const categorySchema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER },
      description: { type: Type.STRING },
      found: { type: Type.ARRAY, items: { type: Type.STRING } },
      missing: { type: Type.ARRAY, items: { type: Type.STRING } },
      missingKeywordsExtended: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            example: { type: Type.STRING },
            importance: { type: Type.STRING }
          }
        }
      }
    },
    required: ["score", "description", "found", "missing"]
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
      totalScore: { type: Type.INTEGER },
      meaningScore: { type: Type.INTEGER },
      keywordQuality: {
        type: Type.OBJECT,
        properties: {
          contextual: { type: Type.INTEGER },
          weak: { type: Type.INTEGER },
          stuffed: { type: Type.INTEGER }
        }
      },
      annotatedContent: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            type: { type: Type.STRING },
            reason: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["text", "type"]
        }
      },
      flags: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            message: { type: Type.STRING }
          }
        }
      },
      categories: {
        type: Type.OBJECT,
        properties: {
          keywordAnalysis: categorySchema,
          jobFit: categorySchema,
          achievements: categorySchema,
          formatting: categorySchema,
          language: categorySchema,
          branding: categorySchema
        },
        required: ["keywordAnalysis", "jobFit", "achievements", "formatting", "language", "branding"]
      },
      summary: { type: Type.STRING }
    },
    required: ["totalScore", "meaningScore", "keywordQuality", "annotatedContent", "flags", "categories", "summary"]
  };

  const data = await callGeminiProxy("ANALYZE_RESUME", { prompt, schema, deep: deepAnalysis });
  const parsed = JSON.parse(data.text);

  const normalizeCategory = (cat: any) => ({
    score: cat?.score ?? 0,
    description: cat?.description || 'Analytical module completed.',
    found: Array.isArray(cat?.found) && cat.found.length > 0 ? cat.found : ['Sufficient skills detected.'],
    missing: Array.isArray(cat?.missing) && cat.missing.length > 0 ? cat.missing : ['No critical gaps detected.'],
    missingKeywordsExtended: cat?.missingKeywordsExtended || []
  });

  const categories = {
    keywordAnalysis: normalizeCategory(parsed.categories?.keywordAnalysis),
    jobFit: normalizeCategory(parsed.categories?.jobFit),
    achievements: normalizeCategory(parsed.categories?.achievements),
    formatting: normalizeCategory(parsed.categories?.formatting),
    language: normalizeCategory(parsed.categories?.language),
    branding: normalizeCategory(parsed.categories?.branding),
  };

  return {
    ...parsed,
    categories,
    analysisDate: Date.now()
  } as ResumeAnalysisResult;
};

/**
 * Module: Timetable Hub
 */
export const extractTimetableFromImage = async (base64Image: string): Promise<DaySchedule[]> => {
  const prompt = `
    Extract the LPU University timetable from this screenshot. 
    Identify the days (Monday to Saturday) and slots.
    Return a structured JSON array of DaySchedule objects.
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.STRING },
        slots: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              subject: { type: Type.STRING },
              room: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["id", "subject", "room", "startTime", "endTime", "type"]
          }
        }
      },
      required: ["day", "slots"]
    }
  };

  const data = await callGeminiProxy("EXTRACT_TIMETABLE", {
    prompt,
    schema,
    imageData: base64Image.split(',')[1] || base64Image
  });
  return JSON.parse(data.text) as DaySchedule[];
};


