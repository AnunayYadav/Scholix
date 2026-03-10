import { QuizQuestion } from "../../types.ts";

import { che110Unit1MCQs } from "./CHE110/unit1.ts";
import { che110Unit2MCQs } from "./CHE110/unit2.ts";
import { che110Unit3MCQs } from "./CHE110/unit3.ts";
import { che110Unit4MCQs } from "./CHE110/unit4.ts";
import { che110Unit5MCQs } from "./CHE110/unit5.ts";
import { che110Unit6MCQs } from "./CHE110/unit6.ts";
import { cse101Unit1MCQs } from "./CSE101/unit1.ts";
import { cse101Unit2MCQs } from "./CSE101/unit2.ts";
import { cse101Unit3MCQs } from "./CSE101/unit3.ts";
import { cse101Unit4MCQs } from "./CSE101/unit4.ts";
import { cse101Unit5MCQs } from "./CSE101/unit5.ts";
import { cse101Unit6MCQs } from "./CSE101/unit6.ts";
import { cse121Unit1MCQs } from "./CSE121/unit1.ts";
import { cse121Unit2MCQs } from "./CSE121/unit2.ts";
import { cse121Unit3MCQs } from "./CSE121/unit3.ts";
import { cse121Unit4MCQs } from "./CSE121/unit4.ts";
import { cse121Unit5MCQs } from "./CSE121/unit5.ts";
import { cse121Unit6MCQs } from "./CSE121/unit6.ts";
import { cse320Unit1MCQs } from "./CSE320/unit1.ts";
import { cse320Unit2MCQs } from "./CSE320/unit2.ts";
import { cse320Unit3MCQs } from "./CSE320/unit3.ts";
import { cse320Unit4MCQs } from "./CSE320/unit4.ts";
import { cse320Unit5MCQs } from "./CSE320/unit5.ts";
import { cse320Unit6MCQs } from "./CSE320/unit6.ts";


import { unit1Quizzes as ece249U1 } from "./ECE249/unit1.ts";
import { unit2Quizzes as ece249U2 } from "./ECE249/unit2.ts";
import { unit3Quizzes as ece249U3 } from "./ECE249/unit3.ts";
import { unit4Quizzes as ece249U4 } from "./ECE249/unit4.ts";
import { unit5Quizzes as ece249U5 } from "./ECE249/unit5.ts";
import { unit6Quizzes as ece249U6 } from "./ECE249/unit6.ts";
import { ece249Unit1Subjective } from "./ECE249/unit1_subjective.ts";
import { ece249Unit2Subjective } from "./ECE249/unit2_subjective.ts";
import { ece249Unit3Subjective } from "./ECE249/unit3_subjective.ts";
import { ece249Unit4Subjective } from "./ECE249/unit4_subjective.ts";
import { ece249Unit5Subjective } from "./ECE249/unit5_subjective.ts";
import { ece249Unit6Subjective } from "./ECE249/unit6_subjective.ts";

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
        mcqs: [
            ...che110Unit1MCQs,
            ...che110Unit2MCQs,
            ...che110Unit3MCQs,
            ...che110Unit4MCQs,
            ...che110Unit5MCQs,
            ...che110Unit6MCQs
        ],
        subjective: []
    },
    "CSE101": {
        mcqs: [...cse101Unit1MCQs, ...cse101Unit2MCQs, ...cse101Unit3MCQs, ...cse101Unit4MCQs, ...cse101Unit5MCQs, ...cse101Unit6MCQs],
        subjective: []
    },
    "CSE121": {
        mcqs: [...cse121Unit1MCQs, ...cse121Unit2MCQs, ...cse121Unit3MCQs, ...cse121Unit4MCQs, ...cse121Unit5MCQs, ...cse121Unit6MCQs],
        subjective: [],
    },
    "CSE320": {
        mcqs: [
            ...cse320Unit1MCQs,
            ...cse320Unit2MCQs,
            ...cse320Unit3MCQs,
            ...cse320Unit4MCQs,
            ...cse320Unit5MCQs,
            ...cse320Unit6MCQs
        ],
        subjective: []
    },
    "ECE249": {
        mcqs: [...ece249U1, ...ece249U2, ...ece249U3, ...ece249U4, ...ece249U5, ...ece249U6],
        subjective: [
            ...ece249Unit1Subjective,
            ...ece249Unit2Subjective,
            ...ece249Unit3Subjective,
            ...ece249Unit4Subjective,
            ...ece249Unit5Subjective,
            ...ece249Unit6Subjective
        ]
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
