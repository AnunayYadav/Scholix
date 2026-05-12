
import Tesseract from 'tesseract.js';

interface ExtractedAttendance {
  name: string;
  present: number;
  total: number;
  dutyLeaves: number;
}

import { DaySchedule, TimetableSlot } from '../types';

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
/**
 * Parses raw text into timetable slots.
 * Specifically optimized for LPU Touch timetable format.
 * Handles multiple days and various OCR inaccuracies.
 */
export const parseTimetableText = (text: string): DaySchedule[] => {
  const cleanText = text.replace(/\r/g, '');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const daySchedules = new Map<string, TimetableSlot[]>();
  
  let currentDay = '';
  let activeSlots: Partial<TimetableSlot>[] = [];

  // Robust Regexes
  const timeRegex = /(\d{1,2})\s*[:.]\s*(\d{2})\s*([APMRFB]{1,2})?\s*[-—~]\s*(\d{1,2})\s*[:.]\s*(\d{2})\s*([APMRFB]{1,2})?/gi;
  const subjectRegex = /(?:C\s*[:]\s*)?([A-Z]{2,5}\s*\d{3,4}[A-Z]?)/gi;
  const roomRegex = /(?:R\s*[:]\s*)?(\d{1,2}\s*[-]\s*\d{2,4}[A-Z]?)/gi;

  const finalizeSlot = (slot: Partial<TimetableSlot>): TimetableSlot => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      subject: slot.subject || 'Unknown Subject',
      room: slot.room || 'N/A',
      startTime: slot.startTime || '09:00',
      endTime: slot.endTime || '10:00',
      type: slot.type || 'Class'
    };
  };

  const flushActiveSlots = () => {
    if (activeSlots.length > 0) {
      const day = currentDay || 'Monday';
      if (!daySchedules.has(day)) daySchedules.set(day, []);
      
      activeSlots.forEach(slot => {
        if (slot.subject || slot.startTime) {
          daySchedules.get(day)!.push(finalizeSlot(slot));
        }
      });
      activeSlots = [];
    }
  };

  const normalizeOCRTime = (h: string, m: string, period?: string): string => {
    let hh = parseInt(h);
    let mm = m.padStart(2, '0');
    let p = period ? period.toUpperCase().trim() : '';
    
    if (p.includes('A')) p = 'AM';
    else if (p.includes('P') || p.includes('R') || p.includes('F') || p.includes('B')) p = 'PM';
    else if (p === 'M') p = (hh >= 8 && hh <= 11) ? 'AM' : 'PM';
    else p = (hh >= 8 && hh <= 11) ? 'AM' : 'PM';

    let hhStr = hh.toString().padStart(2, '0');
    return `${hhStr}:${mm} ${p}`;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();

    // 1. Detect Day
    const foundDay = dayNames.find(d => 
      upperLine === d || 
      upperLine.startsWith(d + ' ') || 
      upperLine.endsWith(' ' + d)
    );
    
    if (foundDay) {
      flushActiveSlots();
      currentDay = foundDay.charAt(0) + foundDay.slice(1).toLowerCase();
      continue;
    }

    // 2. Detect Times (Multiple on one line for multi-column)
    const timeMatches = [...line.matchAll(timeRegex)];
    if (timeMatches.length > 0) {
      flushActiveSlots(); // Start a new "row" of slots
      
      timeMatches.forEach(match => {
        activeSlots.push({
          startTime: normalizeOCRTime(match[1], match[2], match[3]),
          endTime: normalizeOCRTime(match[4], match[5], match[6]),
          type: 'Class'
        });
      });
      continue;
    }

    // 3. Detect Subject Codes (Assign to active slots in order)
    const subMatches = [...line.matchAll(subjectRegex)];
    if (subMatches.length > 0) {
      // If we have no active slots, maybe the subjects came BEFORE the times or we missed the times
      if (activeSlots.length === 0) {
        subMatches.forEach(match => {
          activeSlots.push({ subject: match[1].replace(/\s+/g, ''), type: 'Class' });
        });
      } else {
        subMatches.forEach((match, idx) => {
          if (activeSlots[idx] && !activeSlots[idx].subject) {
            activeSlots[idx].subject = match[1].replace(/\s+/g, '');
          }
        });
      }
    }

    // 4. Detect Rooms (Assign to active slots in order)
    const roomMatches = [...line.matchAll(roomRegex)];
    if (roomMatches.length > 0 && activeSlots.length > 0) {
      roomMatches.forEach((match, idx) => {
        if (activeSlots[idx] && !activeSlots[idx].room) {
          activeSlots[idx].room = match[1].replace(/\s+/g, '');
        }
      });
    }

    // 5. Detect Type / Lab
    if (activeSlots.length > 0) {
      if (upperLine.includes('LAB')) {
        activeSlots.forEach(s => s.type = 'Lab');
      } else if (upperLine.includes('PRACTICAL')) {
        activeSlots.forEach(s => s.type = 'Practical');
      }
    }
  }

  flushActiveSlots();

  const result: DaySchedule[] = [];
  daySchedules.forEach((slots, day) => {
    // Filter out duplicates and sort
    const uniqueSlots = slots.filter((v, idx, a) => 
      a.findIndex(t => t.startTime === v.startTime && t.subject === v.subject) === idx
    );
    
    result.push({
      day,
      slots: uniqueSlots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    });
  });

  return result;
};

const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const clean = time.toUpperCase().replace(/[\s.]/g, '');
  
  // Handle 12-hour format
  const match12 = clean.match(/(\d{1,2})[:]?(\d{0,2})([AP]M)/);
  if (match12) {
    let hours = parseInt(match12[1]);
    const minutes = match12[2] ? parseInt(match12[2]) : 0;
    const period = match12[3];
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  
  // Handle 24-hour format or partials
  const match24 = clean.match(/(\d{1,2})[:](\d{2})/);
  if (match24) {
    let hours = parseInt(match24[1]);
    const minutes = parseInt(match24[2]);
    // Heuristic: if hour is 1-7, it's probably PM (LPU classes are usually 8 AM - 6 PM)
    if (hours >= 1 && hours <= 7) hours += 12;
    return hours * 60 + minutes;
  }
  
  return 0;
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

/**
 * Extracts raw text from a resume image using Tesseract.js
 */
export const extractResumeWithTesseract = async (
  image: string | File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(image, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress);
        }
      }
    });

    console.log("Tesseract Resume OCR Text:", text);
    return text;
  } catch (error) {
    console.error("Tesseract Resume OCR Error:", error);
    throw new Error("Failed to extract text from resume image.");
  }
};

