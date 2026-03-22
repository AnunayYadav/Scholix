import { QuizQuestion, Flashcard } from "../../types.ts";

// Note: Quizzes are now fetched dynamically from Supabase questions table.
// Local imports from quiztaker removed to resolve performance issues.
export const pel130Quizzes: QuizQuestion[] = [];

import { unit1Flashcards } from "./flashcards/unit1.ts";
import { unit2Flashcards } from "./flashcards/unit2.ts";
import { unit3Flashcards } from "./flashcards/unit3.ts";
import { unit4Flashcards } from "./flashcards/unit4.ts";
import { unit5Flashcards } from "./flashcards/unit5.ts";
import { unit6Flashcards } from "./flashcards/unit6.ts";

export const pel130Flashcards: Flashcard[] = [
    ...unit1Flashcards,
    ...unit2Flashcards,
    ...unit3Flashcards,
    ...unit4Flashcards,
    ...unit5Flashcards,
    ...unit6Flashcards
];
