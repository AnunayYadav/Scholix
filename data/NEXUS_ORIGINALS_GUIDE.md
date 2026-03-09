NEXUS ORIGINALS — AI CONTENT GENERATION GUIDE

Goal
A student should be able to study only from Nexus Originals notes and still score full marks in exams.

All generated content must be:

* Complete
* Simple
* Structured
* Exam focused
* Easy to revise

---

1. LANGUAGE RULES

Use very simple English.

Rules:

* Use short sentences
* Avoid difficult vocabulary
* Explain like teaching a first-year student
* Avoid long paragraphs

Prefer:

* Bullet points
* Tables
* Step lists
* Clear headings

---

2. STEP 1 — GENERATE TABLE OF CONTENTS

When a syllabus is given:

1. Carefully read the syllabus.
2. Extract all topics and subtopics.
3. Generate a Table of Contents for the unit.

Rules:

* Include every topic from the syllabus
* Topics inside parentheses must become separate subtopics
* Keep the same order as the syllabus
* Do not skip any topic

Example

Syllabus:
Semiconductors (Intrinsic, Extrinsic)

Table of Contents should be:

## Intrinsic Semiconductor

## Extrinsic Semiconductor

---

3. STEP 2 — GENERATE DETAILED NOTES

After generating the Table of Contents, create detailed notes for every topic.

Each topic must include:

* Definition
* Explanation
* Formula (if applicable)
* Example
* Solution
* Exam Tip
* Common Mistakes

Each topic should contain around 10–20 lines of explanation.

---

4. CONTENT STYLE

Always improve readability.

Use:

* Bold keywords
* Bullet lists
* Tables
* Comparisons
* Step-by-step explanations

Avoid large blocks of text.

---

5. MATHEMATICAL FORMULAS

All formulas must use LaTeX syntax so they can render using KaTeX.

Inline example:
$I = V/R$

Block example:

$$
F = ma
$$

Examples:

Derivative

$$
\frac{dy}{dx}
$$

Integral

$$
\int x^2 dx
$$

Matrix

$$
\begin{bmatrix}
1 & 2 \
3 & 4
\end{bmatrix}
$$

---

6. MATHEMATICAL GRAPHS AND PHYSICS DIAGRAMS

When a concept requires visualization, generate graphs using JSXGraph.

JSXGraph can create:

* Function graphs
* Coordinate geometry diagrams
* Calculus graphs
* Vectors
* Physics diagrams

Examples of when to generate graphs:

Mathematics:

* Quadratic functions
* Trigonometric functions
* Coordinate geometry
* Derivatives
* Limits

Example formula:

$$
y = x^2
$$

Example JSXGraph code:

<div id="graph" style="width:500px;height:500px;"></div>

<script src="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraphcore.js"></script>

<script>
const board = JXG.JSXGraph.initBoard('graph', {
boundingbox: [-5,5,5,-5],
axis:true
});

board.create('functiongraph', [function(x){ return x*x; }]);
</script>

Graphs should appear after explanations when visual understanding helps.

---

7. TOPIC STRUCTURE

Each topic must follow this structure:

## Topic Name

Definition

Formula (if applicable)

Explanation

Example

Solution

Exam Tip

Common Mistakes

---

8. PROBLEM SOLVING METHOD

For numerical topics include step-by-step solving.

Example:

Step 1 → Identify variables
Step 2 → Choose formula
Step 3 → Substitute values
Step 4 → Solve and verify units

---

9. MEMORY AIDS

Include memory techniques when possible.

Examples:

* Mnemonics
* Analogies
* Real-life examples

Example:

CPU → Chef
RAM → Kitchen Counter
Hard Disk → Refrigerator

---

10. QUICK REVISION TABLES

Each major section should end with a quick revision table.

Example:

| Concept   | Key Idea            |
| --------- | ------------------- |
| Ohm's Law | V = IR              |
| KCL       | Sum of currents = 0 |
| KVL       | Sum of voltages = 0 |

---

11. UNIT SUMMARY

Each unit must end with a final summary table.

Example:

| Topic     | Key Formula |
| --------- | ----------- |
| Ohm's Law | V = IR      |
| KCL       | ∑I = 0      |
| KVL       | ∑V = 0      |

---

12. QUESTION BANK REQUIREMENTS

Every unit must include practice questions.

Minimum requirements:

MCQs:

* At least 100 MCQs per unit

Subjective Questions:

* At least 20 subjective questions for theory-based subjects

Question types should include:

* Conceptual questions
* Numerical problems
* Reasoning questions
* Application questions

---

13. FLASHCARDS

Each unit must include at least 20 flashcards.

Flashcards should include:

* Definitions
* Formulas
* Important concepts
* Exam keywords
* Tricks

Example:

Q: Condition for exact differential equation?

A:

$$
\frac{\partial M}{\partial y} =
\frac{\partial N}{\partial x}
$$

---

14. FINAL CHECKLIST

Before finishing the unit verify:

* All syllabus topics are covered
* All subtopics are included
* Explanations are simple and clear
* Formulas are written in LaTeX
* Graphs are added where needed using JSXGraph
* Tables are included
* Examples are included
* Minimum 100 MCQs are included
* Minimum 20 subjective questions are included
* Minimum 20 flashcards are included

If any condition is missing, the unit is incomplete.

---

FINAL GOAL

Students using Nexus Originals should feel:

"I do not need YouTube or Google anymore."

Everything required for learning, revision, and exam preparation must already exist inside the notes.
