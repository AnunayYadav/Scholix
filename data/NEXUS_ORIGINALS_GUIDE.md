# Nexus Originals — AI Master Content Creation Protocol

This document defines the **strict rules and quality standards** for generating premium educational content for **LPU Nexus**.

The primary goal is:

A student should be able to **study only from Nexus Originals and still score full marks in exams**.

Therefore, all generated content must be:

• complete
• simple to understand
• structured and visual
• exam-focused
• aligned with LPU syllabus
• easy to revise

The AI must treat these rules as **mandatory instructions** when generating notes.

---

# 1. Core Philosophy

All notes must follow these learning principles.

## 1.1 Simplicity First

Explain everything using **very simple English**.

Rules:

• Sentences must be short
• Avoid complex vocabulary
• Explain concepts as if teaching a **first-year student**
• Avoid academic or research-style wording

Bad example:

"The aforementioned phenomenon illustrates proportionality."

Good example:

"When one value increases, the other also increases."

---

## 1.2 Teach Like a Great Teacher

Notes should feel like a combination of:

• a friendly professor
• a clear YouTube teacher
• a structured textbook
• an exam preparation guide

The tone should be **helpful, simple, and educational**.

---

## 1.3 Visual Learning Priority

Students understand faster when information is visual.

Whenever possible, include:

• tables
• comparison charts
• step lists
• logical flows
• pattern recognition tricks

Avoid long dense paragraphs.

---

## 1.4 Exam-Oriented Design

Notes must help students:

• understand the concept
• recognize exam questions quickly
• solve problems faster
• avoid common mistakes

Focus on **what students need to write in exams**.

---

# 2. Directory Structure

All subject data must follow this file structure.

data/

  [subject_code]/

    unit1.ts
    unit2.ts
    unit3.ts
    quizzesAndFlashcards.ts

data/

  nexusOriginalsData.ts

Each unit file must export:

export const unit[N]Title
export const unit[N]Body

---

# 3. Markdown Structure Rules

These rules ensure consistent formatting inside the platform.

---

## 3.1 Unit Header Rule

The first line of every unit must be:

# Unit N: Unit Name

Example:

# Unit 1: Fundamentals of Electrical Laws

Do **NOT manually number subsections**.

Correct:

## Ohm's Law

Wrong:

1.1 Ohm's Law

The platform automatically generates numbering.

---

## 3.2 Section Separation Rule

Do **NOT use markdown dividers (---)** to separate sections.

Instead use headings.

Example:

## Ohm's Law

## Kirchhoff's Laws

## Voltage Division Rule

The UI automatically renders headings with separator lines.

---

## 3.3 Heading Hierarchy

Use this structure consistently.

# Unit Title

## Major Topic

### Subtopic

#### Small Concept

Example:

# Unit 1: Electrical Laws

## Ohm's Law

### Definition

### Formula

### Explanation

### Examples

---

## 3.4 Readability Rules

Always prioritize readability.

Use:

• **bold keywords**
• bullet lists
• short paragraphs

Avoid long blocks of text.

---

# 4. Mandatory Topic Structure

Every topic must follow this structure.

## Topic Name

• Definition
• Formula (if applicable)
• Explanation
• Example
• Solution
• Exam Tip

---

### Example

## Ohm's Law

**Definition**

Ohm's Law states that the current through a conductor is directly proportional to the voltage across it when temperature remains constant.

**Formula**

$$
V = IR
$$

**Explanation**

If voltage increases while resistance stays constant, current increases proportionally.

**Example**

Voltage = 20V
Resistance = 10Ω

Find current.

**Solution**

$$
I = \frac{V}{R}
$$

$$
I = \frac{20}{10} = 2A
$$

**Exam Tip**

If voltage and resistance are given in exams, directly use the formula:

$$
I = V/R
$$

---

# 5. Memory Design (Important)

Notes must help students **remember concepts quickly**.

---

## 5.1 Memory Hacks

Include at least one of the following:

• mnemonic
• analogy
• real-life example

Example:

CPU → Chef
RAM → Kitchen Counter
Hard Disk → Refrigerator

---

## 5.2 Recognition Tricks

Teach students how to identify problem types.

Example:

If the equation looks like

$$
Mdx + Ndy = 0
$$

Check the condition:

$$
\frac{\partial M}{\partial y} = \frac{\partial N}{\partial x}
$$

If both sides are equal → the equation is **Exact**.

---

# 6. Problem Solving Strategy

Students must learn **step-by-step solving methods**.

Every numerical topic must include a **Step Method**.

Example:

### Step Method

Step 1 → Identify variables
Step 2 → Apply correct formula
Step 3 → Substitute values
Step 4 → Solve and verify units

---

# 7. Concept Flow Explanation

When a concept involves decision logic, explain it clearly.

Example:

### Identifying Equation Type

1 Write equation as

$$
Mdx + Ndy = 0
$$

2 Check derivatives

3 If

$$
\frac{\partial M}{\partial y} =
\frac{\partial N}{\partial x}
$$

→ Exact equation

4 Otherwise → Use integrating factor

---

# 8. Common Mistakes Section

Every major topic must include:

### Common Mistakes

Example:

• forgetting constants
• wrong sign during substitution
• incorrect formula selection

---

# 9. Quick Revision Section

Each major section should end with:

## Quick Revision

Example:

| Concept   | Key Idea                    |
| --------- | --------------------------- |
| Ohm's Law | V = IR                      |
| KCL       | Sum of currents at node = 0 |
| KVL       | Sum of voltages in loop = 0 |

---

# 10. Final Summary Table

Each unit must end with a summary.

Example:

| Topic     | Key Formula |
| --------- | ----------- |
| Ohm's Law | V = IR      |
| KCL       | ∑I = 0      |
| KVL       | ∑V = 0      |

---

# 11. Self Assessment

Each unit must end with:

## Self Assessment

Include:

• conceptual questions
• numerical problems

Example:

1 Define Ohm's Law.
2 State Kirchhoff's laws.
3 Solve a circuit using VDR.

---

# 12. Quiz Generation

Practice questions must be stored in:

quizzesAndFlashcards.ts

---

# 13. Content Completeness Rules

AI models often produce short notes.

To prevent this:

• every syllabus topic must be covered
• no topic should be skipped
• explanations must not be compressed

---

## 13.1 Full Syllabus Coverage

Before writing notes, identify **all topics from the syllabus**.

Every topic must appear in the notes.

---

## 13.2 Subtopic Expansion Rule

If the syllabus includes subtopics like:

BJT (types, modes, construction, CE configuration)

Then the notes must include:

### Types of BJT

### Modes of Operation

### Construction of BJT

### Working of BJT in CE Configuration

No listed subtopic may be skipped.

---

## 13.3 Parentheses Rule

Items inside parentheses must become separate headings.

Example:

Semiconductors (Intrinsic and Extrinsic)

Must become:

### Intrinsic Semiconductor

### Extrinsic Semiconductor

---

## 13.4 Maintain Syllabus Order

Topics must appear in the **same order as syllabus**.

Do not rearrange topics.

---

## 13.5 Adaptive Length Rule

Notes length should depend on the number of topics.

Each topic should contain roughly **10-20 lines**.

Large units become longer naturally.

Small units remain concise.

---

# 14. Question Bank Requirements

Practice questions are essential.

---

## 14.1 Question Count

Secondary subjects:

Minimum **30 questions per unit**

Core subjects (Math / CSE / Engineering / ECE):

Minimum **50 questions per unit**

---

## 14.2 Difficulty Distribution

30% Easy
40% Medium
30% Difficult

---

## 14.3 Question Types

Include:

• MCQs
• short answers
• numericals
• reasoning questions
• application questions

---

# 15. Flashcard Requirements

Each unit must contain **10–15 flashcards**.

Flashcards must include:

• definitions
• formulas
• tricks
• exam keywords

Example:

Q: Condition for exact differential equation?

A:

$$
\frac{\partial M}{\partial y} =
\frac{\partial N}{\partial x}
$$

---

# 16. Mathematical Formula Rendering Standard

All mathematical expressions must use **LaTeX syntax**.

They will be rendered using **KaTeX**.

---

## Inline Formula

$ I = V/R $

---

## Block Formula

$$
F = ma
$$

---

## Example Expressions

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

Vector

$$
\vec{F} = m\vec{a}
$$

---

## Rendering Stack

react-markdown
remark-math
rehype-katex
katex

---

# 17. Final Quality Check

Before finishing the unit, verify:

✔ all syllabus topics included
✔ subtopics from parentheses included
✔ explanations simple and clear
✔ formulas written in LaTeX
✔ examples included
✔ summary tables included
✔ practice questions included
✔ flashcards included

If any condition fails, the unit is **not complete**.

---

# Final Goal

When students use **Nexus Originals**, they should feel:

"I don't need YouTube or Google anymore."

Everything needed for **learning, revision, and exam preparation** must already exist inside the platform.
