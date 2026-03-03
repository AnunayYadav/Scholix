import { NexusOriginal } from "../types.ts";
import { unit1Title, unit1Body } from "./ece249/unit1.ts";
import { unit2Title, unit2Body } from "./ece249/unit2.ts";
import { unit3Title, unit3Body } from "./ece249/unit3.ts";
import { unit4Title, unit4Body } from "./ece249/unit4.ts";
import { unit5Title, unit5Body } from "./ece249/unit5.ts";
import { unit6Title, unit6Body } from "./ece249/unit6.ts";
import { ece249Quizzes, ece249Flashcards } from "./ece249/quizzesAndFlashcards.ts";

export const nexusOriginalsData: NexusOriginal[] = [
    {
        id: "ece249-beee",
        subject: "ECE249: Basic Electrical and Electronics Engineering",
        semester: "2",
        program: "CSE",
        ltp: "L:3 T:0 P:0",
        credits: 3,
        content: {
            notes: [
                { title: unit1Title, body: unit1Body, unit: 1 },
                { title: unit2Title, body: unit2Body, unit: 2 },
                { title: unit3Title, body: unit3Body, unit: 3 },
                { title: unit4Title, body: unit4Body, unit: 4 },
                { title: unit5Title, body: unit5Body, unit: 5 },
                { title: unit6Title, body: unit6Body, unit: 6 },
            ],
            quizzes: ece249Quizzes,
            flashcards: ece249Flashcards,
        },
        created_at: "2026-03-03T10:00:00Z",
        last_updated: "2026-03-03T10:00:00Z",
    },
];
