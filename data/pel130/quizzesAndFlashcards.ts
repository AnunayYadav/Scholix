import { QuizQuestion, Flashcard } from "../../types";

export const pel130Quizzes: QuizQuestion[] = [
    // Unit 1: Substitution and Ellipsis
    {
        unit: 1,
        question: "Which sentence uses 'it' as a preparatory subject?",
        options: ["It is a beautiful sunset.", "It is essential to attend the lecture.", "I like it when it rains.", "Give it to me."],
        correctAnswer: 1,
        explanation: "'It' is used to postpone the real subject 'to attend the lecture'."
    },
    {
        unit: 1,
        question: "Identify the correct substitution: 'I need some help. Can you provide ____?'",
        options: ["so", "one", "some", "it"],
        correctAnswer: 3,
        explanation: "'It' refers back to the uncountable noun 'help'."
    },
    {
        unit: 1,
        question: "Complete: 'Will he pass?' 'I hope ____.'",
        options: ["it", "one", "so", "that"],
        correctAnswer: 2,
        explanation: "'So' replaces the entire clause 'that he will pass' after report verbs."
    },
    {
        unit: 1,
        question: "Example of situational ellipsis:",
        options: ["He ran and fell.", "Want a drink?", "I like tea; he, coffee.", "The one I want."],
        correctAnswer: 1,
        explanation: "'[Do you] Want a drink?' is common in spoken English where the start of the sentence is dropped."
    },
    {
        unit: 1,
        question: "Correct the sentence: 'I have two pens. You can take the blue ones.'",
        options: ["No change", "Take the blue one.", "Take blue.", "Take one's."],
        correctAnswer: 1,
        explanation: "Since only one pen is being offered, the singular 'one' should be used."
    },

    // Unit 2: Sentence Structure
    {
        unit: 2,
        question: "Which structure has 1 independent and 1+ dependent clauses?",
        options: ["Simple", "Compound", "Complex", "Compound-Complex"],
        correctAnswer: 2,
        explanation: "Defined as a complex sentence."
    },
    {
        unit: 2,
        question: "Identify the Indirect Object: 'The manager gave the team a bonus.'",
        options: ["manager", "gave", "the team", "a bonus"],
        correctAnswer: 2,
        explanation: "The team is the recipient of the direct object (bonus)."
    },
    {
        unit: 2,
        question: "Correct usage with a linking verb:",
        options: ["He feels baddly.", "He feels bad.", "He feels in bad.", "He feels badness."],
        correctAnswer: 1,
        explanation: "Linking verbs take adjectives, not adverbs."
    },
    {
        unit: 2,
        question: "'Since I was late, I missed the intro.' Type?",
        options: ["Simple", "Compound", "Complex", "Fragment"],
        correctAnswer: 2,
        explanation: "Contains a subordinator 'Since'."
    },
    {
        unit: 2,
        question: "Which is a Compound-Complex sentence?",
        options: ["He ran and he tripped.", "Because he ran, he fell.", "While he ran, he tripped and he cried.", "He ran fast."],
        correctAnswer: 2,
        explanation: "Contains 1 dependent clause (While...) and 2 independent clauses."
    },

    // Unit 3: Conditionals
    {
        unit: 3,
        question: "Which shows a past regret?",
        options: ["If I win, I'll go.", "If I won, I'd go.", "If I had won, I'd have gone.", "If I win, I'd go."],
        correctAnswer: 2,
        explanation: "Third conditional is used for past unrealities/regrets."
    },
    {
        unit: 3,
        question: "Mixed Conditional: Past Cause, Present Result.",
        options: ["If I had studied, I would be rich now.", "If I study, I am rich.", "If I had studied, I would have been rich.", "If I studied, I would be rich."],
        correctAnswer: 0,
        explanation: "Past Perfect (cause) + Would + Verb (result)."
    },
    {
        unit: 3,
        question: "Inversion of 'If I had known':",
        options: ["Had I known", "I had known", "Did I know", "Have I known"],
        correctAnswer: 0,
        explanation: "In formal inversion, 'had' moves to the front."
    },
    {
        unit: 3,
        question: "Equivalent to 'If ... not':",
        options: ["Provided", "Unless", "As long as", "Whether"],
        correctAnswer: 1,
        explanation: "'Unless' means 'except if' or 'if not'."
    },
    {
        unit: 3,
        question: "What does 'Only if' represent?",
        options: ["A loose suggestion", "A strict condition", "A past regret", "A general truth"],
        correctAnswer: 1,
        explanation: "'Only if' indicates a mandatory requirement for the result."
    },

    // Unit 4: Infinitives, Gerunds and Quantifiers
    {
        unit: 4,
        question: "Form after prepositions (on, in, at, of):",
        options: ["Infinitive", "Bare Infinitive", "Gerund (-ing)", "Past Participle"],
        correctAnswer: 2,
        explanation: "Prepositions are always followed by gerunds."
    },
    {
        unit: 4,
        question: "Bare Infinitive after perception verb:",
        options: ["I saw him to leave.", "I saw him leaving.", "I saw him leave.", "Both B and C"],
        correctAnswer: 3,
        explanation: "Perception verbs like 'see' can take bare infinitives or gerunds (-ing)."
    },
    {
        unit: 4,
        question: "'Stop talking' vs 'Stop to talk':",
        options: ["No difference", "Talking = quit; To talk = pause for purpose", "Talking = pause; To talk = quit", "Both are wrong"],
        correctAnswer: 1,
        explanation: "Meaning shift: -ing is quitting the habit, to-infinitive is pausing other tasks to do the action."
    },
    {
        unit: 4,
        question: "Negative meaning (not enough):",
        options: ["A few", "Few", "A little", "Plenty"],
        correctAnswer: 1,
        explanation: "'Few' (countable) and 'Little' (uncountable) imply a lack of something."
    },
    {
        unit: 4,
        question: "After 'Make' or 'Let':",
        options: ["To-infinitive", "Gerund", "Bare Infinitive", "V3"],
        correctAnswer: 2,
        explanation: "Causative verbs like make/let take the bare infinitive."
    },

    // Unit 5: Reduced Clauses, Connectors and Focus Structures
    {
        unit: 5,
        question: "Reduced version of 'The man who is standing there':",
        options: ["The man standing there", "The man stand there", "Standing there man", "The man stood there"],
        correctAnswer: 0,
        explanation: "Reduced active relative clause."
    },
    {
        unit: 5,
        question: "Connector for Concession:",
        options: ["Therefore", "Moreover", "Nevertheless", "Furthermore"],
        correctAnswer: 2,
        explanation: "'Nevertheless' shows contrast/concession."
    },
    {
        unit: 5,
        question: "Inversion with 'Never':",
        options: ["Never I have seen", "Never have I seen", "Never I did see", "Never had seen I"],
        correctAnswer: 1,
        explanation: "Auxillary comes before Subject."
    },
    {
        unit: 5,
        question: "It-Cleft for 'The CEO signed the deal':",
        options: ["What the CEO did was sign.", "It was the CEO who signed the deal.", "The deal was signed by the CEO.", "CEO signing the deal."],
        correctAnswer: 1,
        explanation: "It-cleft emphasizes the person/noun."
    },
    {
        unit: 5,
        question: "Reduced Reason clause: 'Because he was tired...'",
        options: ["Tiring...", "He being tired...", "Being tired...", "For tired..."],
        correctAnswer: 2,
        explanation: "Participle clauses can replace 'Because'."
    },

    // Unit 6: Professional Vocabulary
    {
        unit: 6,
        question: "One word for 'Fundamental change in assumptions':",
        options: ["Bottleneck", "Synergy", "Paradigm Shift", "Scalability"],
        correctAnswer: 2,
        explanation: "Definition of paradigm shift."
    },
    {
        unit: 6,
        question: "Idiom: 'To be on the same page' means:",
        options: ["To read together", "To agree or have same understanding", "To be in a loop", "To think outside the box"],
        correctAnswer: 1,
        explanation: "Standard business idiom for alignment."
    },
    {
        unit: 6,
        question: "Technically jargon for data capacity:",
        options: ["Backend", "Bandwidth", "Leverage", "Benchmark"],
        correctAnswer: 1,
        explanation: "Bandwidth refers to capacity."
    },
    {
        unit: 6,
        question: "Formal version of 'Relieved':",
        options: ["Ameliorated", "Mitigated", "Relinquished", "Elucidated"],
        correctAnswer: 1,
        explanation: "Mitigate means to make less severe/relieve."
    },
    {
        unit: 6,
        question: "Academic collocation for 'Evidence':",
        options: ["Stark evidence", "Comprehensive evidence", "Empirical evidence", "Vast evidence"],
        correctAnswer: 2,
        explanation: "Empirical evidence (based on observation) is a standard academic pairing."
    }
];

export const pel130Flashcards: Flashcard[] = [
    { front: "Empty Subject", back: "Dummy subjects like 'it' or 'there' used as placeholders in a sentence." },
    { front: "Substitution", back: "Replacing words/phrases with pro-forms (one, so, do so) to avoid repetition." },
    { front: "Ellipsis", back: "Omission of words understood from context (Native speaker style)." },
    { front: "Simple Sentence", back: "One independent clause (Subject + Verb)." },
    { front: "Compound Sentence", back: "Two independent clauses joined by FANBOYS (And, But, Or, etc.)." },
    { front: "Complex Sentence", back: "One independent + one or more dependent clauses." },
    { front: "Compound-Complex", back: "2+ Independent + 1+ Dependent clauses." },
    { front: "Linking Verb", back: "A verb (be, seem, feel) connecting subject to a descriptive adjective." },
    { front: "Zero Conditional", back: "General Truths. (If + Present, Present)." },
    { front: "First Conditional", back: "Real Future. (If + Present, Will + Verb)." },
    { front: "Second Conditional", back: "Hypothetical Present. (If + Past, Would + Verb)." },
    { front: "Third Conditional", back: "Past Regret/Unreal. (If + Past Perfect, Would have + V3)." },
    { front: "Mixed Conditional", back: "Combining different time zones (e.g., Past cause, Present result)." },
    { front: "Inversion", back: "Reversing Subject-Verb order (e.g., Had I known...) for emphasis." },
    { front: "Gerund", back: "The -ing form of a verb acting as a noun." },
    { front: "Bare Infinitive", back: "A verb base without 'to' (used after let, make, can)." },
    { front: "Cleft Sentence", back: "A sentence split to focus on one part (e.g., It was X who...)." },
    { front: "Paradigm Shift", back: "A fundamental change in approach or underlying assumptions." },
    { front: "Synergy", back: "Interaction greater than the sum of parts." },
    { front: "ROI", back: "Return on Investment - Profitability measure." },
    { front: "KPI", back: "Key Performance Indicator - Success measure." },
    { front: "Empirical", back: "Based on observation or experience rather than theory." },
    { front: "Mitigate", back: "To make less severe, serious, or painful." },
    { front: "Scalability", back: "The capacity to change in size or scale to meet demand." },
    { front: "SWOT", back: "Strengths, Weaknesses, Opportunities, Threats." }
];
