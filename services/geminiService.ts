
import { Type } from "@google/genai";
import { ResumeAnalysisResult, DaySchedule, QuizQuestion } from "../types.ts";

/**
 * Global request queue state to prevent 429s (Too Many Requests)
 */
let isProcessingRequest = false;
const requestQueue: (() => void)[] = [];
let lastRequestTimestamp = 0;
const MIN_REQUEST_SPACING = 2000; // 2 seconds between successful calls

import { GoogleGenAI } from "@google/genai";

const getGenAIClient = () => {
  // Try to find the key in modern Vite or legacy fallback configurations
  const apiKey =
    //@ts-ignore
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
    //@ts-ignore
    (typeof process !== 'undefined' && process.env && (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) ||
    "";

  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your Vercel Environment Variables.");
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * Internal helper to communicate directly with Gemini from the frontend
 */
const callGeminiProxy = async (action: string, payload: any, retries = 2, delay = 2000) => {
  // 1. Queue management (Semaphore)
  if (isProcessingRequest) {
    await new Promise<void>(resolve => requestQueue.push(resolve));
  }
  isProcessingRequest = true;

  try {
    // 2. Enforce minimum spacing between calls to stay under RPM limits
    const now = Date.now();
    const timeSinceLast = now - lastRequestTimestamp;
    if (timeSinceLast < MIN_REQUEST_SPACING) {
      await new Promise(r => setTimeout(r, MIN_REQUEST_SPACING - timeSinceLast));
    }

    const ai = getGenAIClient();

    for (let i = 0; i <= retries; i++) {
      try {
        let responseText = "";
        let groundingData = null;

        switch (action) {
          case "ANALYZE_RESUME": {
            const response = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite-preview",
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
              model: "gemini-3.1-flash-lite-preview",
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
              model: "gemini-3.1-flash-lite-preview",
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

          case "EXTRACT_ATTENDANCE": {
            const response = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite-preview",
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
              model: "gemini-3.1-flash-lite-preview",
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
            throw new Error("Invalid protocol action requested.");
        }

        lastRequestTimestamp = Date.now();
        return { text: responseText, groundingChunks: groundingData };

      } catch (e: any) {
        const errorMsg = e.message || String(e);
        const isRateLimit =
          errorMsg.includes("429") ||
          errorMsg.toLowerCase().includes("quota") ||
          errorMsg.toLowerCase().includes("rate limit") ||
          e.status === 429 ||
          e.code === 429;

        if (isRateLimit && i < retries) {
          const multiplier = 2;
          const jitter = Math.random() * 1000;
          const backoff = (delay * Math.pow(multiplier, i)) + jitter;
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }

        if (i === retries) {
          if (isRateLimit) {
            throw new Error("Google Gemini Quota Exhausted: The system is under heavy load or the free-tier limit has been reached. Please try again in 60 seconds.");
          }
          if (errorMsg.includes("500") || errorMsg.includes("503") || errorMsg.toLowerCase().includes("overloaded")) {
            throw new Error("AI Engine Overloaded: Google's servers are temporarily unable to process this request. Please try again shortly.");
          }
          throw e;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } finally {
    isProcessingRequest = false;
    const next = requestQueue.shift();
    if (next) next();
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
    TASK: Tier-1 Tech Recruiter (Meta/Google-level) Resume Diagnostic & X-Ray.
    ROLE CONTEXT: ${jdText}
    RESUME CONTENT: 
    """
    ${resumeText}
    """

    EVALUATION GUIDELINES:
    - IMPACT: Penalize heavily if achievements lack quantifiable metrics (%, $, numbers).
    - EVIDENCE: Skills claimed without project context are "Bad" segments.
    - STRUCTURE: Check for ATS-friendly density and semantic hierarchy.

    JSON OUTPUT REQUIREMENTS:
    1. stats: Count 'errors', 'improvements', 'passed'.
    2. detailedScores: 0-100 for (keywordMatch, skillsAlignment, experienceRelevance, formattingQuality, overallImpact).
    3. improvementSuggestions: List 'category', 'original' text, 'improved' text, 'impact' (High/Med/Low), and 'reason'.
    4. passedChecks: List 'category', 'checkName', 'insight' for 3-5 successes.
    5. skillDiversity: AN ARRAY OF CATEGORIES. 
       - Categories MUST be exactly: ["Technical Skills", "Soft Skills", "Domain Expertise"].
       - Each category has "skills": array of { name: string, found: boolean, level: 'Mandatory' | 'Desired' | 'Optional' }.
       - 'Mandatory': Critical for the role.
       - 'Desired': Value-add skills.
       - 'Optional': Found in resume but not core to JD.
    6. radarData: 0-100 for (qualification, experience, roleAlignment, domainDiversity, retention).
    7. annotatedContent: 
       - CRITICAL: You MUST provide an array of fragments that TOGETHER reconstruct the EXACT RAW TEXT of the resume provided.
       - EVERY SINGLE LINE and every single character of the resume must be included in one of the fragments.
       - Do NOT omit anything (no summaries, no "...", no "etc").
       - Break the text into line-level or paragraph-level chunks.
       - Types: 'good', 'bad', or 'neutral'.
       - 'good' or 'bad' fragments MUST have 'reason' and 'suggestion'.
       - Neutral fragments are for parts that are fine or just structural (like names, headers, contact info).
    8. categories: Detailed breakdown for (keywordAnalysis, jobFit, achievements, formatting, language, branding).
    9. summary: High-level recruiter verdict.
    10. actionPlan: CRITICAL. Provide 3-4 EXACT tasks.
        - action: MUST be one of (Build, Practice, Add, Refactor).
        - task: A specific title.
        - description: One sentence explaining why/how.
    11. simulation: 
        - currentShortlistChance: 0-100.
        - projectedShortlistChance: 0-100 (Must be higher than current).
        - explanation: Why.
  `;

  const categorySchema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER },
      details: { type: Type.STRING },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
      found: { type: Type.ARRAY, items: { type: Type.STRING } },
      missing: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["score", "details", "strengths", "weaknesses", "found", "missing"]
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
      totalScore: { type: Type.INTEGER },
      meaningScore: { type: Type.INTEGER },
      stats: {
        type: Type.OBJECT,
        properties: {
          errors: { type: Type.INTEGER },
          improvements: { type: Type.INTEGER },
          passed: { type: Type.INTEGER }
        },
        required: ["errors", "improvements", "passed"]
      },
      detailedScores: {
        type: Type.OBJECT,
        properties: {
          keywordMatch: { type: Type.INTEGER },
          skillsAlignment: { type: Type.INTEGER },
          experienceRelevance: { type: Type.INTEGER },
          formattingQuality: { type: Type.INTEGER },
          overallImpact: { type: Type.INTEGER }
        },
        required: ["keywordMatch", "skillsAlignment", "experienceRelevance", "formattingQuality", "overallImpact"]
      },
      improvementSuggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            original: { type: Type.STRING },
            improved: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            reason: { type: Type.STRING }
          },
          required: ["category", "original", "improved", "impact", "reason"]
        }
      },
      passedChecks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            checkName: { type: Type.STRING },
            insight: { type: Type.STRING }
          },
          required: ["category", "checkName", "insight"]
        }
      },
      quantifiableOpportunities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            opportunity: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            metric: { type: Type.STRING }
          },
          required: ["opportunity", "suggestion", "metric"]
        }
      },
      skillDiversity: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  found: { type: Type.BOOLEAN },
                  level: { type: Type.STRING, enum: ["Mandatory", "Desired", "Optional"] }
                },
                required: ["name", "found", "level"]
              }
            }
          },
          required: ["category", "skills"]
        }
      },
      radarData: {
        type: Type.OBJECT,
        properties: {
          qualification: { type: Type.INTEGER },
          experience: { type: Type.INTEGER },
          roleAlignment: { type: Type.INTEGER },
          domainDiversity: { type: Type.INTEGER },
          retention: { type: Type.INTEGER }
        },
        required: ["qualification", "experience", "roleAlignment", "domainDiversity", "retention"]
      },
      annotatedContent: {
        type: Type.ARRAY,
        description: "CRITICAL: The sum of all 'text' fields MUST exactly match the provided resume text letter-for-letter.",
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Exactly preserve the segment of the resume, including newlines and leading spaces." },
            type: { type: Type.STRING, enum: ["good", "bad", "neutral"] },
            reason: { type: Type.STRING, description: "Detailed recruiter insight (required for good/bad)." },
            suggestion: { type: Type.STRING, description: "Actionable improvement (required for good/bad)." }
          },
          required: ["text", "type"]
        }
      },
      flags: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["critical", "warning", "info"] },
            message: { type: Type.STRING }
          },
          required: ["type", "message"]
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
      summary: { type: Type.STRING, description: "Professional executive summary of the resume's match for the JD." },
      actionPlan: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING, enum: ["Build", "Practice", "Add", "Refactor"] },
                task: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["action", "task", "description"]
            }
          }
        },
        required: ["title", "tasks"]
      },
      simulation: {
        type: Type.OBJECT,
        properties: {
          currentShortlistChance: { type: Type.INTEGER },
          projectedShortlistChance: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["currentShortlistChance", "projectedShortlistChance", "explanation"]
      }
    },
    required: ["totalScore", "meaningScore", "stats", "detailedScores", "improvementSuggestions", "skillDiversity", "radarData", "annotatedContent", "flags", "categories", "summary", "actionPlan", "simulation"]
  };

  const data = await callGeminiProxy("ANALYZE_RESUME", { prompt, schema, deep: deepAnalysis });
  const parsed = JSON.parse(data.text);

  const normalizeCategory = (cat: any) => ({
    score: cat?.score ?? 0,
    details: cat?.details || 'Module analysis completed with base metrics.',
    strengths: Array.isArray(cat?.strengths) ? cat.strengths : [],
    weaknesses: Array.isArray(cat?.weaknesses) ? cat.weaknesses : [],
    found: Array.isArray(cat?.found) ? cat.found : [],
    missing: Array.isArray(cat?.missing) ? cat.missing : []
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
export const extractTimetableFromImage = async (base64Image: string, universityName: string = "the university"): Promise<DaySchedule[]> => {
  const prompt = `
    Extract the ${universityName} timetable from this screenshot. 
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

/**
 * Module: Nexus Originals
 */
export const generateSubjectOriginals = async (subjectName: string, syllabusText: string): Promise<any> => {
  const prompt = `
    TASK: GENERATE COMPREHENSIVE STUDY MATERIAL FOR THE SUBJECT: "${subjectName}".
    
    SYLLABUS CONTEXT:
    ---
    ${syllabusText.substring(0, 15000)}
    ---

    REQUIREMENTS:
    1. CHAPTER-WISE NOTES: Generate 5 detailed summary notes covering the entire syllabus.
    2. QUESTION BANK: Generate 10 high-quality MCQs (quizzes).
    3. FLASHCARDS: Generate 10 flashcards for quick revision.
    
    GUIDELINES:
    - Use professional, academic tone.
    - Notes should be concise but cover key concepts.
    - All content must be strictly related to "${subjectName}".
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      notes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING, description: "Detailed Markdown content for the note" }
          },
          required: ["title", "body"]
        }
      },
      quizzes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            unit: { type: Type.INTEGER },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["unit", "question", "options", "correctAnswer", "explanation"]
        }
      },
      flashcards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING }
          },
          required: ["front", "back"]
        }
      }
    },
    required: ["notes", "quizzes", "flashcards"]
  };

  const data = await callGeminiProxy("GENERATE_SUBJECT_ORIGINALS", { prompt, schema });
  return JSON.parse(data.text);
};

/**
 * Module: Attendance Tracker OCR
 */
export const extractAttendanceFromImage = async (base64Image: string): Promise<any[]> => {
  const prompt = `
    Extract subject names and attendance details from this screenshot.
    Look for subject names/codes, total lectures held, and lectures attended.
    Return a structured JSON array of objects.
    Each object must have: 'name' (subject name or code), 'present' (number), 'total' (number).
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        present: { type: Type.INTEGER },
        total: { type: Type.INTEGER }
      },
      required: ["name", "present", "total"]
    }
  };

  const data = await callGeminiProxy("EXTRACT_ATTENDANCE", {
    prompt,
    schema,
    imageData: base64Image.split(',')[1] || base64Image
  });
  return JSON.parse(data.text);
};


