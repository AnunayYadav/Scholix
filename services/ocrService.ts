
import Tesseract from 'tesseract.js';

interface ExtractedAttendance {
  name: string;
  present: number;
  total: number;
  dutyLeaves: number;
}

export interface TimetableSlot {
  id: string;
  subject: string;
  room: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'lab' | 'break';
}

export interface DaySchedule {
  day: string;
  slots: TimetableSlot[];
}

/**
 * Extracts timetable data from an image using Tesseract.js
 */
export const extractTimetableWithTesseract = async (
  image: string | File,
  onProgress?: (progress: number) => void
): Promise<DaySchedule[]> => {
  try {
    const { data: { text } } = await Tesseract.recognize(image, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress);
        }
      }
    });

    console.log("Tesseract Timetable Raw Text:", text);
    return parseTimetableText(text);
  } catch (error) {
    console.error("Tesseract Error:", error);
    throw new Error("Failed to extract timetable from image.");
  }
};

/**
 * Parses raw text into timetable slots.
 * Specifically optimized for LPU Touch timetable format.
 */
const parseTimetableText = (text: string): DaySchedule[] => {
  const cleanText = text.replace(/\r/g, '').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  let detectedDay = 'Monday';
  
  // Detect day from anywhere in the text
  const upperText = cleanText.toUpperCase();
  for (const day of days) {
    if (upperText.includes(day)) {
      detectedDay = day.charAt(0) + day.slice(1).toLowerCase();
      break;
    }
  }

  const slots: TimetableSlot[] = [];
  const timeRegex = /(\d{1,2}[:.]\d{2})\s*[-—]\s*(\d{1,2}[:.]\d{2})/;
  const subjectRegex = /\b([A-Z]{2,5}\d{3,4})\b/;
  const roomRegex = /(\d{1,2}-\d{3,4}[A-Z]?)/;
  
  let currentSlot: Partial<TimetableSlot> = {};

  const flushSlot = () => {
    if (currentSlot.subject && currentSlot.startTime && currentSlot.endTime) {
      slots.push({
        id: Math.random().toString(36).substr(2, 9),
        subject: currentSlot.subject,
        room: currentSlot.room || 'N/A',
        startTime: currentSlot.startTime,
        endTime: currentSlot.endTime,
        type: currentSlot.type || 'class'
      } as TimetableSlot);
    }
    currentSlot = {};
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    
    // Time is the main trigger for a new slot block
    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      // If we already have a partial slot, try to save it before starting a new one
      if (currentSlot.subject) flushSlot();
      
      let start = timeMatch[1].replace('.', ':');
      let end = timeMatch[2].replace('.', ':');
      if (start.length === 4) start = '0' + start;
      if (end.length === 4) end = '0' + end;
      
      currentSlot.startTime = start;
      currentSlot.endTime = end;
    }

    const subMatch = line.match(subjectRegex);
    if (subMatch) {
      currentSlot.subject = subMatch[1];
    }

    const roomMatch = line.match(roomRegex);
    if (roomMatch) {
      currentSlot.room = roomMatch[1];
    }

    if (line.includes('LAB') || line.includes('PRACTICAL') || line.includes(' (P)')) {
      currentSlot.type = 'lab';
    } else if (line.includes('LECTURE') || line.includes('TUTORIAL') || line.includes(' (L)') || line.includes(' (T)')) {
      currentSlot.type = 'class';
    }
    
    // If we have all critical info, we can flush it early to avoid missing data in multi-line blocks
    if (currentSlot.subject && currentSlot.startTime && currentSlot.room && currentSlot.type) {
      flushSlot();
    }
  }

  // Push final remaining slot
  flushSlot();

  if (slots.length === 0) return [];

  return [{
    day: detectedDay,
    slots: slots.sort((a, b) => {
      // Use timeToMinutes for proper comparison since they are 12hr strings potentially
      const aMins = a.startTime.split(':').map(Number);
      const bMins = b.startTime.split(':').map(Number);
      // Heuristic: hours < 8 are PM
      let aH = aMins[0]; if (aH < 8) aH += 12;
      let bH = bMins[0]; if (bH < 8) bH += 12;
      return (aH * 60 + aMins[1]) - (bH * 60 + bMins[1]);
    })
  }];
};

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
    const startIndex = matches[i].index || 0;
    const nextMatch = matches[i + 1];
    const endIndex = nextMatch ? nextMatch.index : cleanText.length;
    let block = cleanText.substring(startIndex, endIndex);
    
    const subjectCode = matches[i][1].toUpperCase();

    // Strategy: Find all potential X/Y or X|Y pairs in the block and pick the most likely one
    // while strictly excluding dates.
    const pairs = [...block.matchAll(/(\d+)\s*[\/|]\s*(\d+)/g)];
    let bestAttendance = null;
    let highestScore = -1;

    for (const p of pairs) {
      const v1 = parseInt(p[1]);
      const v2 = parseInt(p[2]);
      const fullMatch = p[0];
      const matchIndex = p.index || 0;

      // 1. Date exclusion: check if it's followed by another slash (X/Y/Z)
      const afterMatch = block.substring(matchIndex + fullMatch.length, matchIndex + fullMatch.length + 5);
      if (afterMatch.trim().startsWith('/') || afterMatch.trim().startsWith('-')) continue;

      // 2. Date exclusion: check if it's preceded by another slash (W/X/Y)
      const beforeMatch = block.substring(Math.max(0, matchIndex - 5), matchIndex);
      if (beforeMatch.trim().endsWith('/') || beforeMatch.trim().endsWith('-')) continue;

      // 3. 'Last Attended' exclusion
      const contextBefore = block.substring(Math.max(0, matchIndex - 30), matchIndex).toUpperCase();
      if (contextBefore.includes('LAST')) continue;

      // 4. Sanity Check
      const [pres, tot] = v1 > v2 ? [v2, v1] : [v1, v2];
      if (tot <= 0 || tot >= 150) continue;

      // Scoring
      let score = 0;
      if (contextBefore.includes('DELIVERED') || contextBefore.includes('ATTENDANCE') || 
          contextBefore.includes('PRESENT') || contextBefore.includes('TOTAL')) {
        score += 20;
      }
      if (contextBefore.includes('ATTENDED') && !contextBefore.includes('LAST')) {
        score += 15;
      }
      
      // Proximity to subject code (closer is better)
      score += Math.max(0, (400 - matchIndex) / 10);

      if (score > highestScore) {
        highestScore = score;
        bestAttendance = { present: pres, total: tot };
      }
    }

    // Search for Duty Leaves separately
    const dlMatch = block.match(/DUTY\s*LEAVES\s*[:|-]?\s*(\d+)/i);
    const dl = dlMatch ? parseInt(dlMatch[1]) : 0;

    if (subjectCode && bestAttendance) {
      results.push({
        name: subjectCode,
        present: bestAttendance.present,
        total: bestAttendance.total,
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
    // Skip lines that look like dates (e.g., 5/1/2026)
    if (/\d+[\/|-]\d+[\/|-]\d+/.test(line)) continue;

    const numbers = line.match(/\b\d+\b/g);
    if (numbers && numbers.length >= 2) {
      const subjectCodeRegex = /([A-Z]{2,5}\d{3,4})/;
      const match = line.match(subjectCodeRegex);
      if (match) {
        const name = match[0];
        
        // Find pairs in numbers that aren't dates
        // We'll look for the last pair that fits attendance criteria
        for (let i = numbers.length - 1; i >= 1; i--) {
          const t = parseInt(numbers[i]);
          const p = parseInt(numbers[i-1]);
          
          // Skip if any of them look like a year
          if (t > 2000 && t < 2100) continue;
          if (p > 2000 && p < 2100) continue;
          
          if (p <= t && t < 150 && t > 0) {
            results.push({ name, present: p, total: t, dutyLeaves: 0 });
            break;
          }
        }
      }
    }
  }
  return results;
};
