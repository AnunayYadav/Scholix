
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
};

/**
 * Produces compact slugs for library URLs:
 * - Programs: "BTech CSE" → "btechcse"
 * - Semesters: "Semester 2" / "Term 2" → "sem2"
 * - Subjects: "CSE121: Orientation to Computing II" → "cse121"
 * - Categories: "Lectures" → "lectures"
 */
export const librarySlug = (text: string, type?: 'program' | 'semester' | 'subject' | 'category'): string => {
  if (!text) return '';
  const trimmed = text.trim();

  // Semester: extract number, produce "sem<N>"
  if (type === 'semester') {
    const numMatch = trimmed.match(/(\d+)/);
    if (numMatch) return `sem${numMatch[1]}`;
    // Fallback: just strip spaces and lowercase
    return trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Subject: extract code only (e.g. "CSE121" from "CSE121: Orientation to Computing II")
  if (type === 'subject') {
    const codeMatch = trimmed.match(/^([A-Za-z]+\d{3})/);
    if (codeMatch) return codeMatch[1].toLowerCase();
    // Fallback: strip spaces and lowercase
    return trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Program: just strip spaces and special chars, lowercase ("BTech CSE" → "btechcse")
  if (type === 'program') {
    return trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Category or unknown: just lowercase, no spaces
  return trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Matches a display name against a compact library slug.
 * Handles the reverse mapping for URL sync:
 * - "btechcse" matches "BTech CSE"
 * - "sem2" matches "Semester 2" / "Term 2"
 * - "cse121" matches "CSE121: Orientation to Computing II"
 */
export const matchLibrarySlug = (displayName: string, urlSlug: string, type?: 'program' | 'semester' | 'subject' | 'category'): boolean => {
  if (!displayName || !urlSlug) return false;

  // Exact match on compact slug
  if (librarySlug(displayName, type) === urlSlug) return true;

  // Also match against the old-style slugify for backward compatibility with bookmarks/shared links
  if (slugify(displayName) === urlSlug) return true;

  // Subject: also check if the URL slug matches just the code portion
  if (type === 'subject') {
    const codeMatch = displayName.match(/^([A-Za-z]+\d{3})/);
    if (codeMatch && codeMatch[1].toLowerCase() === urlSlug) return true;
  }

  // Semester: handle both "sem2" and old "semester-2" style
  if (type === 'semester') {
    const numMatch = displayName.match(/(\d+)/);
    if (numMatch && `sem${numMatch[1]}` === urlSlug) return true;
    // Also match "semester-2" → extract number
    const slugNumMatch = urlSlug.match(/^(?:sem|semester-?|term-?)(\d+)$/);
    if (slugNumMatch && numMatch && slugNumMatch[1] === numMatch[1]) return true;
  }

  // Program: compare stripped versions
  if (type === 'program') {
    const stripped = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (stripped === urlSlug) return true;
    // Also match old hyphenated style: "btech-cse" → "btechcse"
    if (stripped === urlSlug.replace(/-/g, '')) return true;
  }

  return false;
};
