
import Tesseract from 'tesseract.js';

interface ExtractedAttendance {
  name: string;
  present: number;
  total: number;
  dutyLeaves: number;
}

/**
 * Extracts attendance data from an image using Tesseract.js
 * This replaces the Gemini-based OCR to avoid rate limits.
 */
export const extractAttendanceWithTesseract = async (
  image: string | File, 
  onProgress?: (progress: number) => void
): Promise<ExtractedAttendance[]> => {
  try {
    const { data: { text } } = await Tesseract.recognize(image, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress);
        }
      }
    });

    console.log("Tesseract Raw Text:", text);

    return parseAttendanceText(text);
  } catch (error) {
    console.error("Tesseract Error:", error);
    throw new Error("Failed to extract text from image.");
  }
};

/**
 * Parses the raw text from Tesseract into structured attendance data.
 * Designed to handle common LPU attendance report formats.
 */
const parseAttendanceText = (text: string): ExtractedAttendance[] => {
  // Normalize text for easier parsing
  const cleanText = text.replace(/\r/g, '').trim();
  
  // Split into potential subject blocks. 
  // LPU Subject Codes are typically 3 letters followed by 3 numbers (e.g., CSE101, CHE110)
  // We use a stricter regex to avoid matching things like "CH23" in seating.
  const subjectCodeRegex = /\b([A-Z]{2,5}\d{3,4})\b/g;
  const matches = [...cleanText.matchAll(subjectCodeRegex)];
  
  if (matches.length === 0) {
    return fallbackLineParsing(cleanText);
  }

  const results: ExtractedAttendance[] = [];

  for (let i = 0; i < matches.length; i++) {
    const startIndex = matches[i].index;
    const endIndex = matches[i + 1] ? matches[i + 1].index : cleanText.length;
    let block = cleanText.substring(startIndex, endIndex);
    
    // The subject code itself - strictly the alphanumeric part
    const subjectCode = matches[i][1].toUpperCase();

    // LPU Portal often has "Attended/Delivered: X/Y"
    // We look for the attendance pattern within the block associated with this subject code.
    // Stricter regex to avoid matching dates like 5/1/2026:
    // 1. We prioritize "Delivered" or the "Attended/Delivered" combo.
    // 2. We ensure the numbers are not followed by another slash (which would indicate a date).
    const attDelMatch = block.match(/(?:ATTENDED\s*[\/|]\s*DELIVERED|DELIVERED|ATTENDANCE)\s*[:|-]?\s*(\d+)\s*[\/|]\s*(\d+)(?!\s*[\/|]\s*\d+)/i);
    
    // Search for Duty Leaves: 2
    const dlMatch = block.match(/DUTY\s*LEAVES\s*[:|-]?\s*(\d+)/i);

    let present = -1;
    let total = -1;
    let dl = 0;

    if (attDelMatch) {
      present = parseInt(attDelMatch[1]);
      total = parseInt(attDelMatch[2]);
      
      // OCR Sanity Check: If present > total, they might be swapped
      if (present > total) {
        [present, total] = [total, present];
      }
    } 

    if (dlMatch) {
      dl = parseInt(dlMatch[1]);
    }

    // STRICTOR VALIDATION:
    // 1. Must have a subject code
    // 2. Must have found the attendance (present/total) line
    // 3. The attendance line must be reasonably close to the subject code (within 300 chars)
    // 4. Must not be a partial/garbled match (total > 0 and not too large)
    const isAttendanceNearCode = attDelMatch && (block.indexOf(attDelMatch[0]) < 400);

    if (subjectCode && attDelMatch && total > 0 && isAttendanceNearCode) {
      // Ensure we don't pick up unrealistic numbers or garbled text
      if (total < 150) { 
        results.push({
          name: subjectCode,
          present,
          total,
          dutyLeaves: dl
        });
      }
    }
  }

  return results;
};

/**
 * Simpler fallback parser if subject codes aren't clearly identified as start of blocks.
 */
const fallbackLineParsing = (text: string): ExtractedAttendance[] => {
  const lines = text.split('\n');
  const results: ExtractedAttendance[] = [];
  
  for (let line of lines) {
    line = line.trim().toUpperCase();
    // Skip lines that look like dates (e.g., 5/1/2026)
    if (/\d+[\/|-]\d+[\/|-]\d+/.test(line)) continue;

    const numbers = line.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const subjectCodeRegex = /([A-Z]{2,5}\d{3,4})/;
      const match = line.match(subjectCodeRegex);
      if (match) {
        const name = match[0];
        // Ensure we take numbers that look like attendance, not parts of a date if regex missed it
        const p = parseInt(numbers[numbers.length - 2]);
        const t = parseInt(numbers[numbers.length - 1]);
        if (p <= t && t < 150) {
          results.push({ name, present: p, total: t, dutyLeaves: 0 });
        }
      }
    }
  }
  return results;
};
