# Nexus Originals — AI Master Content Creation Protocol

This document defines the **strict rules and quality standards** for generating premium educational content for **LPU Nexus**.

The goal is simple:

> A student should be able to study **only from Nexus Originals and still score full marks in exams**.

Content must therefore be **complete, simple, visual, exam-focused, and memory friendly**.

---

# 1. Core Philosophy

Every note must follow these principles.

## 1.1 Simplicity First

Explain everything in **very simple English**.

Rules:

* Sentences must be short
* Avoid complex vocabulary
* Explain like teaching a **first-year student**
* No academic fluff

Bad example:

The aforementioned phenomenon illustrates the fundamental proportionality relationship.

Good example:

This means when one value increases, the other also increases.

---

## 1.2 Teach Like a Great Teacher

Content should feel like:

* a friendly professor
* a clear YouTube teacher
* a good textbook
* a smart exam guide

Combined together.

---

## 1.3 Visual Learning Priority

Humans remember **visual patterns better than plain text**.

Every major concept should include at least one of these:

* tables
* comparison charts
* flow explanations
* step lists
* pattern rules
* recognition tricks

---

## 1.4 Exam-Oriented Design

Notes must help students:

* understand concepts
* recognize question patterns quickly
* solve problems faster in exams
* avoid common mistakes

---

# 2. Directory Structure

All subject data must follow this structure.

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

# 3. Markdown Rules

## 3.1 Header Rules

The first line MUST always be:

# Unit N: Unit Name

Example:

# Unit 1: Ordinary Differential Equations

Do NOT manually number subsections.

Correct:

## Exact Differential Equations

Wrong:

2.1 Exact Differential Equations

The UI automatically adds numbering.

---

## 3.2 Section Structure (Heading Separator)

Do NOT use markdown dividers (`---`) to separate sections.

Instead, create separation using **clear headings**, which the UI automatically renders with a horizontal line.

Example:

## Exact Differential Equations

## Integrating Factors

## Clairaut's Equation

The UI automatically displays the heading with a horizontal line below it.

---

## 3.3 Heading Hierarchy

Use headings to organize content.

# Unit Title

## Major Topic

### Subtopic

#### Small Concept

Example:

# Unit 1: Differential Equations

## Exact Differential Equations

### Definition

### Necessary and Sufficient Condition

### Method of Solution

## Equations Reducible to Exact

### Homogeneous Equations

### Integrating Factors

## Clairaut's Equation

---

## 3.4 Readability Formatting

Use:

**Bold for keywords**

Use bullet lists instead of long paragraphs.

Avoid very large blocks of text.

---

# 4. Mandatory Topic Structure

Every topic MUST follow this format.

## Topic Name

* **Definition**
* **Formula**
* **Explanation**
* **Example**
* **Solution**
* **Exam Tip**

---

### Example

## Ohm's Law

* **Definition:**
  Ohm's Law says current increases when voltage increases if resistance stays the same.

* **Formula:**

V = IR

* **Explanation:**
  Voltage pushes electric current through a conductor.
  More voltage means more current if resistance does not change.

* **Example:**
  Voltage = 20V
  Resistance = 10Ω

Find current.

* **Solution:**

I = V / R

I = 20 / 10

I = 2A

* **Exam Tip:**
  If voltage and resistance are given, immediately apply the formula **I = V / R**.

---

# 5. Memory Design (Important)

Notes should help students **remember quickly**.

---

## 5.1 Memory Hacks

Include at least one:

* mnemonic
* analogy
* real-life comparison

Example:

### Memory Trick

Think of CPU like a kitchen.

CPU → Chef
RAM → Kitchen counter
Hard disk → Refrigerator

---

## 5.2 Recognition Tricks

Teach students how to identify question types quickly.

Example:

### Recognition Trick

If the equation is:

Mdx + Ndy = 0

Check this condition first:

∂M/∂y = ∂N/∂x

If both are equal → Exact equation.

---

# 6. Problem Solving Strategy

Students must learn **step-by-step solving methods**.

Every numerical topic must include:

### Step Method

Example:

Step 1 → Identify M and N
Step 2 → Calculate ∂M/∂y
Step 3 → Calculate ∂N/∂x
Step 4 → Compare the results

---

# 7. Concept Flow Explanations

When a topic involves decision making, explain the logic clearly.

Example:

### How to Identify Equation Type

1. Write equation as Mdx + Ndy = 0
2. Check ∂M/∂y and ∂N/∂x
3. If equal → Exact equation
4. If not equal → Use integrating factor

---

# 8. Common Mistakes

Each major topic must include a **Common Mistakes** section.

Example:

### Common Mistakes

* Forgetting to treat y as constant while integrating Mdx
* Mixing up partial derivatives
* Missing the constant of integration

---

# 9. Quick Revision Section

Each major section should end with:

## Quick Revision

Example table:

| Concept              | Key Idea                        |
| -------------------- | ------------------------------- |
| Exact Equation       | ∂M/∂y = ∂N/∂x                   |
| Integrating Factor   | Used when equation is not exact |
| Homogeneous Equation | M and N same degree             |

---

# 10. Final Summary Table

Each unit must end with a **formula summary table**.

Example:

| Type        | Form            | Solution          |
| ----------- | --------------- | ----------------- |
| Exact       | Mdx + Ndy = 0   | Integrate M and N |
| Homogeneous | M,N same degree | IF = 1/(Mx+Ny)    |
| Linear      | dy/dx + Py = Q  | IF = e^(∫Pdx)     |

---

# 11. Self Assessment

Every unit must end with:

## Self Assessment

Include:

* conceptual questions
* numerical problems

Example:

1. What condition makes a differential equation exact?
2. What is an integrating factor?
3. When is an equation called homogeneous?

---

# 12. Quiz Generation

Questions are stored in:

quizzesAndFlashcards.ts

---

# 13. Content Completeness & Generation Strategy

AI models often try to generate everything in a single response, which leads to:

* short explanations
* skipped topics
* missing formulas
* incomplete examples

To prevent this, the AI must follow these rules.

---

## 13.1 Full Syllabus Coverage

AI must cover **every topic and subtopic** from the syllabus.

No topic should be skipped.

Each topic must include:

* definition
* explanation
* formulas
* examples
* exam tips

---

## 13.2 Depth Requirement

Notes must be **complete learning material**, not summaries.

Every topic must include:

* Definition
* Explanation
* Formula
* Example
* Step-by-step solution
* Exam tip

Major topics should include **multiple examples**.

---

## 13.3 Length Requirement

AI must **not compress explanations**.

Notes must be detailed enough so a student can **learn the topic from scratch**.

Avoid:

* very short explanations
* missing steps
* single sentence concepts

---

## 13.4 Multi-Section Generation Strategy

To avoid short notes, generate units in stages:

1. Core theory
2. Examples
3. Tricks and shortcuts
4. Common mistakes
5. Summary tables
6. Practice questions
7. Flashcards

---

# 14. Question Bank Requirements

Practice questions are essential for exam preparation.

---

## 14.1 Question Count Rules

### Soft / Secondary Subjects (PEL, communication etc.)

Minimum **30 questions per unit**

Include:

* MCQs
* short answer
* conceptual questions

---

### Core Subjects (Math, CSE, Physics, Engineering)

Minimum **50 questions per unit**

Include:

* conceptual questions
* numerical problems
* tricky exam-style questions
* applied problems

---

## 14.2 Difficulty Distribution

30% Easy
40% Medium
30% Difficult

Easy → concept check
Medium → application
Hard → tricky exam questions

---

## 14.3 Question Variety

Questions should include:

* MCQs
* short answer
* numerical problems
* reasoning questions
* case-based questions

---

# 15. Flashcard Requirements

Flashcards are used for quick revision.

Each unit must contain **10–15 flashcards**.

Flashcards should include:

* definitions
* formulas
* tricks
* exam keywords
* common mistakes

Example:

Q: Condition for exact differential equation?

A: ∂M/∂y = ∂N/∂x

---

# 16. Mathematical Formula Rendering Standard

Many subjects such as **Mathematics, Physics, Engineering, and CSE** require proper display of formulas.

All formulas MUST be written using **LaTeX syntax** so that they can be rendered properly in the UI using **KaTeX**.

This ensures formulas display clearly and professionally.

---

## 16.1 Formula Writing Rules

Inline formulas should use:

$ formula $

Example:

$ I = V/R $

Block formulas should use:

$$
formula
$$

Example:

$$
F = ma
$$

---

## 16.2 Common Formula Examples

Derivative:

$$
\frac{dy}{dx}
$$

Partial derivative:

$$
\frac{\partial M}{\partial y}
$$

Integral:

$$
\int x^2 dx = \frac{x^3}{3} + C
$$

Matrix:

$$
\begin{bmatrix}
1 & 2 \
3 & 4
\end{bmatrix}
$$

Vector:

$$
\vec{F} = m\vec{a}
$$

---

## 16.3 Important Rule

Never write formulas like plain text:

Wrong:

dy/dx + Py = Q

Correct:

$$
\frac{dy}{dx} + Py = Q
$$

---

## 16.4 Recommended Rendering Stack

The frontend should render formulas using:

react-markdown
remark-math
rehype-katex
katex

---

# 17. Final Quality Check

Before completing a unit, AI must verify:

✔ all syllabus topics included
✔ explanations are simple
✔ examples exist
✔ exam tricks included
✔ summary tables included
✔ required question count satisfied
✔ required flashcards included
✔ formulas written using LaTeX

If these conditions are not satisfied, the unit is **not considered complete**.

---

# Final Goal

When a student studies from **Nexus Originals**, they should feel:

"I don't need YouTube or Google anymore."

Everything required for **understanding, practice, and exam preparation** must already exist inside the platform.
