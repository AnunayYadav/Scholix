import { unit1Quizzes } from '../quiztaker/ECE249/unit1.ts';
import { unit2Quizzes } from '../quiztaker/ECE249/unit2.ts';
import { unit3Quizzes } from '../quiztaker/ECE249/unit3.ts';
import { unit4Quizzes } from '../quiztaker/ECE249/unit4.ts';
import { unit5Quizzes } from '../quiztaker/ECE249/unit5.ts';
import { unit6Quizzes } from '../quiztaker/ECE249/unit6.ts';

import { unit1Flashcards } from './flashcards/unit1.ts';
import { unit2Flashcards } from './flashcards/unit2.ts';
import { unit3Flashcards } from './flashcards/unit3.ts';
import { unit4Flashcards } from './flashcards/unit4.ts';
import { unit5Flashcards } from './flashcards/unit5.ts';
import { unit6Flashcards } from './flashcards/unit6.ts';

import { QuizQuestion, Flashcard } from "../../types.ts";

export const ece249Quizzes: QuizQuestion[] = [
    ...unit1Quizzes,
    ...unit2Quizzes,
    ...unit3Quizzes,
    ...unit4Quizzes,
    ...unit5Quizzes,
    ...unit6Quizzes
];

export const ece249Flashcards: Flashcard[] = [
    ...unit1Flashcards,
    ...unit2Flashcards,
    ...unit3Flashcards,
    ...unit4Flashcards,
    ...unit5Flashcards,
    ...unit6Flashcards
];
