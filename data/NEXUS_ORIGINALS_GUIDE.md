# Nexus Originals: AI Content Generation Guide

This guide defines the standards for creating premium subject notes, quizzes, and flashcards for the "Nexus Originals" section of the LPU-Nexus application. Any AI assisting with the expansion of this section MUST follow these rules to maintain the established aesthetics and functionality.

---

## 1. Directory Structure
All subject data must be organized as follows:
- `data/[subject_code]/unit[N].ts`: Contains the markdown body for each unit.
- `data/[subject_code]/quizzesAndFlashcards.ts`: Contains the `QuizQuestion[]` and `Flashcard[]` arrays.
- `data/nexusOriginalsData.ts`: The central registry where the subject is imported and added.

---

## 2. Note Creation (unit[N].ts)

### 2.1 Technical Format
- **Export Variables**: Must export `unit[N]Title` and `unit[N]Body`.
- **Markdown Header**: The first line of `unit[N]Body` MUST be an H1 header with the unit name (e.g., `# Unit 1: Substitution and Ellipsis`).
- **NO Manual Numbering**: Do NOT add "1.", "1.1", "2." prefix to headings. The system's markdown renderer adds these automatically.
- **Dividers**: Use `---` frequently to separate major sections for clarity.

### 2.2 Content Aesthetic (Premium & Professional)
- **Brief yet Detailed**: Avoid walls of text. Use bullet points and bold keywords (`**keyword**`).
- **Industry Context**: Relate topics to professional life (e.g., "In a technical interview," "When presenting to a CEO").
- **Tables**: Use markdown tables for comparisons or summarizes.
- **Assessment**: End every unit with a `## Self-Assessment` section containing 3 practice questions (Q&A format).

---

## 3. Quantity Standards

### 3.1 MCQ Quantity (Per Unit)
- **Secondary Subjects (PEL, Soft Skills, etc.)**: Minimum **5 MCQs**.
- **Important/Core Subjects (Math, Physics, CSE, Engineering)**: Minimum **10 MCQs**.
- **Difficulty**: Progressive. 30% basic, 40% applied/scenarios, 30% complex/tricky.

### 3.2 Flashcard Quantity (Per Unit)
- **All Subjects**: Minimum **6-8 Flashcards**.
- **Focus**: Key definitions, acronyms, formulas, or "Exam Favorite" concepts.

---

## 4. Scoring for Full Marks (Detailed Notes)

To ensure students can score maximum marks, every topic MUST strictly follow this **4-Part Template** using the exact bullet-point naming shown below:

### 4.1 The Strict Topic Format
- **Definition:** Clear, concise explanation using **Simple English**. No academic jargon; explain like the reader is in 8th grade.
- **Formula:** Use LaTeX for all mathematical expressions (e.g., `$V = IR$`). For language, use the grammatical structure.
- **Explanation:** (Optional but Recommended) A brief bridge connecting the formula to the definition.
- **Example:** A real-world or numerical scenario.
- **Solution:** (For Numerical/Grammar) The step-by-step resolution of the example.

### 4.2 Example Content Block
```markdown
## Ohm's Law

- **Definition:** Ohm's Law states that the current flowing through a conductor is directly proportional to the voltage across it, provided temperature stays constant.
- **Formula:** $V = IR$
- **Explanation:** If we increase voltage while keeping resistance the same, the current will also increase.
- **Example:** Find the current if $V = 20V$ and $R = 10\Omega$.
- **Solution:** Using $I = V/R$, we get $I = 20/10 = 2A$.
```

### 4.3 Mark-Boosting Rules
- **Bold Keywords:** Examiners look for specific terms. **BOLD** them every time they appear.
- **Visual Dividers:** Use `---` after every primary topic to keep the UI clean.
- **Simple English Policy:** Use words like "clear," "help," "start" instead of "elucidate," "facilitate," "commence."

---

## 5. Cognitive Design & Memorization Hacks

Notes should be designed for **instant recognition and long-term retention**.

### 5.1 Mnemonics & Analogies
Every unit should include at least one "Memory Hack":
- **Mnemonics**: Use acronyms (e.g., "FANBOYS" for conjunctions).
- **Analogies**: Relate complex concepts to daily life (e.g., "A CPU is like a Kitchen, and RAM is the Counter Space").

### 5.2 Recognition Tricks
- **The "Look For" Rule**: Give students a specific trigger word or pattern to recognize a concept (e.g., "If the sentence starts with 'It is...', look for a preparatory subject").
- **Visual Cues**: Use consistent formatting for formulas vs definitions.

### 5.3 Quick-Memory Tables
Use summary tables at the end of sections to condense 3 pages of notes into 1 glance.

---

## 6. UI/UX Constraints & Gotchas
- **Sticky Header Offset**: Headings use `scroll-mt-[140px]` in `NexusOriginals.tsx`.
- **Images**: Use the `note.image` property in the metadata rather than raw HTML.

---

## 7. Metadata Registry (nexusOriginalsData.ts)
When adding a new subject:
1.  Import all unit headers and all quizzes/flashcards.
2.  Assign a unique `id` (next increment).
3.  Set `premium: true`.

---

*This guide ensures LPU-Nexus remains the most premium educational platform for students.*
