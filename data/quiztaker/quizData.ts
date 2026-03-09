import { QuizQuestion } from "../../types.ts";

import { che110Unit1MCQs } from "./CHE110/unit1.ts";
import { cse101Unit1MCQs } from "./CSE101/unit1.ts";
import { cse121Unit1MCQs } from "./CSE121/unit1.ts";
import { cse320Unit1MCQs } from "./CSE320/unit1.ts";
import { ece249Unit1Subjective } from "./ECE249/unit1_subjective.ts";
import { pel125Unit1MCQs } from "./PEL125/unit1.ts";
import { pel130Unit1MCQs } from "./PEL130/unit1.ts";

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
        mcqs: [], // Need to add MCQs later, for now we have subjective
        subjective: ece249Unit1Subjective
    },
    "PEL125": {
        mcqs: pel125Unit1MCQs,
        subjective: []
    },
    "PEL130": {
        mcqs: pel130Unit1MCQs,
        subjective: []
    }
};
