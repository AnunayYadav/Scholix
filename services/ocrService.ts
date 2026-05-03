
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
export const extractAttendanceWithTesseract = async (image: string | File): Promise<ExtractedAttendance[]> => {
  try {
    const { data: { text } } = await Tesseract.recognize(image, 'eng', {
      logger: m => console.log(m)
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
  // Each block usually starts with a Subject Code like "CHE110" or "CSE101"
  const subjectCodeRegex = /([A-Z]{2,5}\d{2,4})/g;
  const matches = [...cleanText.matchAll(subjectCodeRegex)];
  
  if (matches.length === 0) {
    // Fallback to simpler line-based parsing if no codes found
    return fallbackLineParsing(cleanText);
  }

  const results: ExtractedAttendance[] = [];

  for (let i = 0; i < matches.length; i++) {
    const startIndex = matches[i].index;
    const endIndex = matches[i + 1] ? matches[i + 1].index : cleanText.length;
    const block = cleanText.substring(startIndex, endIndex);

    // Extract Subject Code and Name
    const lines = block.split('\n');
    const firstLine = lines[0].trim();
    const subjectName = firstLine.replace(/[-|:]/g, ' ').replace(/\s+/g, ' ').trim();

    // Search for Attended/Delivered: 22/26
    const attDelMatch = block.match(/ATTENDED\s*\/\s*DELIVERED\s*[:|-]?\s*(\d+)\s*\/\s*(\d+)/i);
    
    // Search for Duty Leaves: 2
    const dlMatch = block.match(/DUTY\s*LEAVES\s*[:|-]?\s*(\d+)/i);

    // Alternative: Just search for X/Y pattern in the block
    const slashPattern = block.match(/(\d+)\s*\/\s*(\d+)/);

    let present = 0;
    let total = 0;
    let dl = 0;

    if (attDelMatch) {
      present = parseInt(attDelMatch[1]);
      total = parseInt(attDelMatch[2]);
    } else if (slashPattern) {
      // Avoid matching dates like 5/1/2026
      // We look for numbers that aren't 2026
      const allSlashes = [...block.matchAll(/(\d+)\s*\/\s*(\d+)/g)];
      const filtered = allSlashes.filter(m => parseInt(m[2]) !== 2026 && parseInt(m[2]) !== 2025);
      if (filtered.length > 0) {
        present = parseInt(filtered[0][1]);
        total = parseInt(filtered[0][2]);
      }
    }

    if (dlMatch) {
      dl = parseInt(dlMatch[1]);
    }

    if (subjectName && total > 0) {
      results.push({
        name: subjectName.toUpperCase(),
        present,
        total,
        dutyLeaves: dl
      });
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
    const numbers = line.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const subjectCodeRegex = /([A-Z]{2,5}\d{2,4})/;
      const match = line.match(subjectCodeRegex);
      if (match) {
        const name = match[0];
        const p = parseInt(numbers[numbers.length - 2]);
        const t = parseInt(numbers[numbers.length - 1]);
        if (p <= t) {
          results.push({ name, present: p, total: t, dutyLeaves: 0 });
        }
      }
    }
  }
  return results;
};
