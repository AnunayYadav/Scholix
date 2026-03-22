import { QuizQuestion, Flashcard } from "../../types.ts";

// Note: Quizzes are now fetched dynamically from Supabase questions table.
// Local imports from quiztaker removed to resolve performance issues.
export const ece249Quizzes: QuizQuestion[] = [];

// Flashcards are still local - import them if they exist
export const ece249Flashcards: Flashcard[] = []; // Default if not found
