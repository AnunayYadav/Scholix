import { QuizQuestion } from "../../types.ts";

import { che110Unit1MCQs } from "./CHE110/unit1.ts";
import { cse101Unit1MCQs } from "./CSE101/unit1.ts";
import { cse121Unit1MCQs } from "./CSE121/unit1.ts";
import { cse320Unit1MCQs } from "./CSE320/unit1.ts";

import { unit1Quizzes as ece249U1 } from "./ECE249/unit1.ts";
import { unit2Quizzes as ece249U2 } from "./ECE249/unit2.ts";
import { unit3Quizzes as ece249U3 } from "./ECE249/unit3.ts";
import { unit4Quizzes as ece249U4 } from "./ECE249/unit4.ts";
import { unit5Quizzes as ece249U5 } from "./ECE249/unit5.ts";
import { unit6Quizzes as ece249U6 } from "./ECE249/unit6.ts";
import { ece249Unit1Subjective } from "./ECE249/unit1_subjective.ts";

import { unit1Quizzes as pel125U1 } from "./PEL125/unit1.ts";
import { unit2Quizzes as pel125U2 } from "./PEL125/unit2.ts";
import { unit3Quizzes as pel125U3 } from "./PEL125/unit3.ts";
import { unit4Quizzes as pel125U4 } from "./PEL125/unit4.ts";
import { unit5Quizzes as pel125U5 } from "./PEL125/unit5.ts";
import { unit6Quizzes as pel125U6 } from "./PEL125/unit6.ts";

import { unit1Quizzes as pel130U1 } from "./PEL130/unit1.ts";
import { unit2Quizzes as pel130U2 } from "./PEL130/unit2.ts";
import { unit3Quizzes as pel130U3 } from "./PEL130/unit3.ts";
import { unit4Quizzes as pel130U4 } from "./PEL130/unit4.ts";
import { unit5Quizzes as pel130U5 } from "./PEL130/unit5.ts";
import { unit6Quizzes as pel130U6 } from "./PEL130/unit6.ts";

export const QUIZTAKER_DATA: Record<string, { mcqs: QuizQuestion[], subjective: QuizQuestion[] }> = {
    "CHE110": {
        mcqs: che110Unit1MCQs,
        subjective: []
    },
    "CSE101": {
        mcqs: cse101Unit1MCQs,
        subjective: []
    },
    "CSE121": {
        mcqs: cse121Unit1MCQs,
        subjective: []
    },
    "CSE320": {
        mcqs: cse320Unit1MCQs,
        subjective: []
    },
    "ECE249": {
        mcqs: [...ece249U1, ...ece249U2, ...ece249U3, ...ece249U4, ...ece249U5, ...ece249U6],
        subjective: ece249Unit1Subjective
    },
    "PEL125": {
        mcqs: [...pel125U1, ...pel125U2, ...pel125U3, ...pel125U4, ...pel125U5, ...pel125U6],
        subjective: []
    },
    "PEL130": {
        mcqs: [...pel130U1, ...pel130U2, ...pel130U3, ...pel130U4, ...pel130U5, ...pel130U6],
        subjective: []
    }
};
