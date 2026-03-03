// NOTE TO ALL AI AGENTS: 
// Before creating or modifying any Nexus Originals notes, 
// please refer to: data/NEXUS_ORIGINALS_GUIDE.md for structure and aesthetic standards.

import { NexusOriginal } from "../types.ts";
import { unit1Title as eceUnit1Title, unit1Body as eceUnit1Body } from "./ece249/unit1.ts";
import { unit2Title as eceUnit2Title, unit2Body as eceUnit2Body } from "./ece249/unit2.ts";
import { unit3Title as eceUnit3Title, unit3Body as eceUnit3Body } from "./ece249/unit3.ts";
import { unit4Title as eceUnit4Title, unit4Body as eceUnit4Body } from "./ece249/unit4.ts";
import { unit5Title as eceUnit5Title, unit5Body as eceUnit5Body } from "./ece249/unit5.ts";
import { unit6Title as eceUnit6Title, unit6Body as eceUnit6Body } from "./ece249/unit6.ts";
import { ece249Quizzes, ece249Flashcards } from "./ece249/quizzesAndFlashcards.ts";

import { unit1Title as pel1Unit1Title, unit1Body as pel1Unit1Body } from "./pel125/unit1.ts";
import { unit2Title as pel1Unit2Title, unit2Body as pel1Unit2Body } from "./pel125/unit2.ts";
import { unit3Title as pel1Unit3Title, unit3Body as pel1Unit3Body } from "./pel125/unit3.ts";
import { unit4Title as pel1Unit4Title, unit4Body as pel1Unit4Body } from "./pel125/unit4.ts";
import { unit5Title as pel1Unit5Title, unit5Body as pel1Unit5Body } from "./pel125/unit5.ts";
import { unit6Title as pel1Unit6Title, unit6Body as pel1Unit6Body } from "./pel125/unit6.ts";
import { pel125Quizzes, pel125Flashcards } from "./pel125/quizzesAndFlashcards.ts";

import { unit1Title as pel2Unit1Title, unit1Body as pel2Unit1Body } from "./pel130/unit1.ts";
import { unit2Title as pel2Unit2Title, unit2Body as pel2Unit2Body } from "./pel130/unit2.ts";
import { unit3Title as pel2Unit3Title, unit3Body as pel2Unit3Body } from "./pel130/unit3.ts";
import { unit4Title as pel2Unit4Title, unit4Body as pel2Unit4Body } from "./pel130/unit4.ts";
import { unit5Title as pel2Unit5Title, unit5Body as pel2Unit5Body } from "./pel130/unit5.ts";
import { unit6Title as pel2Unit6Title, unit6Body as pel2Unit6Body } from "./pel130/unit6.ts";
import { pel130Quizzes, pel130Flashcards } from "./pel130/quizzesAndFlashcards.ts";

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
                { title: eceUnit1Title, body: eceUnit1Body, unit: 1 },
                { title: eceUnit2Title, body: eceUnit2Body, unit: 2 },
                { title: eceUnit3Title, body: eceUnit3Body, unit: 3 },
                { title: eceUnit4Title, body: eceUnit4Body, unit: 4 },
                { title: eceUnit5Title, body: eceUnit5Body, unit: 5 },
                { title: eceUnit6Title, body: eceUnit6Body, unit: 6 },
            ],
            quizzes: ece249Quizzes,
            flashcards: ece249Flashcards,
        },
        created_at: "2026-03-03T10:00:00Z",
        last_updated: "2026-03-03T10:00:00Z",
    },
    {
        id: "pel125-comms",
        subject: "PEL125: Upper Intermediate Communication Skills – I",
        semester: "2",
        program: "CSE",
        ltp: "L:1 T:0 P:3",
        credits: 3,
        content: {
            notes: [
                { title: pel1Unit1Title, body: pel1Unit1Body, unit: 1 },
                { title: pel1Unit2Title, body: pel1Unit2Body, unit: 2 },
                { title: pel1Unit3Title, body: pel1Unit3Body, unit: 3 },
                { title: pel1Unit4Title, body: pel1Unit4Body, unit: 4 },
                { title: pel1Unit5Title, body: pel1Unit5Body, unit: 5 },
                { title: pel1Unit6Title, body: pel1Unit6Body, unit: 6 },
            ],
            quizzes: pel125Quizzes,
            flashcards: pel125Flashcards,
        },
        created_at: "2026-03-03T11:45:00Z",
        last_updated: "2026-03-03T11:45:00Z",
    },
    {
        id: "pel130-adv-comms",
        subject: "PEL130: Advanced Communication Skills-I",
        semester: "2",
        program: "CSE",
        ltp: "L:1 T:0 P:3",
        credits: 3,
        content: {
            notes: [
                { title: pel2Unit1Title, body: pel2Unit1Body, unit: 1 },
                { title: pel2Unit2Title, body: pel2Unit2Body, unit: 2 },
                { title: pel2Unit3Title, body: pel2Unit3Body, unit: 3 },
                { title: pel2Unit4Title, body: pel2Unit4Body, unit: 4 },
                { title: pel2Unit5Title, body: pel2Unit5Body, unit: 5 },
                { title: pel2Unit6Title, body: pel2Unit6Body, unit: 6 },
            ],
            quizzes: pel130Quizzes,
            flashcards: pel130Flashcards,
        },
        created_at: "2026-03-03T19:50:00Z",
        last_updated: "2026-03-03T19:50:00Z",
    },
];
