import { QuizQuestion, Flashcard } from "../../types";

export const pel125Quizzes: QuizQuestion[] = [
    // Unit 1: Tenses (Advanced)
    {
        unit: 1,
        question: "Which of the following is a STATIVE verb that is normally not used in continuous forms?",
        options: ["Run", "Understand", "Eat", "Drive"],
        correctAnswer: 1,
        explanation: "'Understand' is a stative verb describing a mental state, not a physical action."
    },
    {
        unit: 1,
        question: "I ____ my homework before my friend called me.",
        options: ["finishing", "had finished", "have finished", "finish"],
        correctAnswer: 1,
        explanation: "Past Perfect is used for the action that happened first in the past."
    },
    {
        unit: 1,
        question: "Next month, I ____ in this house for ten years.",
        options: ["will live", "will be living", "will have been living", "have lived"],
        correctAnswer: 2,
        explanation: "Future Perfect Continuous shows the duration of an action up to a future point."
    },
    {
        unit: 1,
        question: "What does 'The movie starts at 9 PM' represent?",
        options: ["Current action", "Spontaneous decision", "Fixed schedule", "Personal arrangement"],
        correctAnswer: 2,
        explanation: "Simple Present is used for timed events and fixed schedules."
    },
    {
        unit: 1,
        question: "I ____ dinner when the phone rang.",
        options: ["had", "have", "was having", "had had"],
        correctAnswer: 2,
        explanation: "Past Continuous is used for an ongoing action interrupted by another action (Past Simple)."
    },

    // Unit 2: Modals and Passives
    {
        unit: 2,
        question: "Which modal shows 95% certainty about a negative state?",
        options: ["Must", "Can't", "Should", "Might"],
        correctAnswer: 1,
        explanation: "'Can't' is used for negative logical deduction (e.g., 'It can't be true')."
    },
    {
        unit: 2,
        question: "I ____ studied harder; now I regret my low grade.",
        options: ["must have", "should have", "could have", "might have"],
        correctAnswer: 1,
        explanation: "'Should have' expresses regret about an unfulfilled past obligation."
    },
    {
        unit: 2,
        question: "Identify the causative passive form:",
        options: ["I cut my hair.", "My hair was cut.", "I had my hair cut.", "I am cutting my hair."],
        correctAnswer: 2,
        explanation: "Causative passive follows 'Have/Get + Object + Verb3'."
    },
    {
        unit: 2,
        question: "In 'It is said that he is a hero', which structure is used?",
        options: ["Active Voice", "Impersonal Passive", "Causative Passive", "Direct Speech"],
        correctAnswer: 1,
        explanation: "Impersonal passive uses 'It is [Verb3] that...' to report general beliefs."
    },
    {
        unit: 2,
        question: "'I was offered a job.' This is a passive of a verb with ____.",
        options: ["No object", "One object", "Two objects", "A gerund"],
        correctAnswer: 2,
        explanation: "Verbs like 'offer' have two objects (Indirect: me, Direct: job)."
    },

    // Unit 3: Parts of Speech (Advanced)
    {
        unit: 3,
        question: "Identify the ERGATIVE verb usage:",
        options: ["He opened the door.", "The door opened.", "Both A and B", "Neither"],
        correctAnswer: 2,
        explanation: "'Open' is ergative because it can be transitive or intransitive with the same sense."
    },
    {
        unit: 3,
        question: "'He stopped ____ to me.' (He doesn't talk to me anymore)",
        options: ["to talk", "talking", "talk", "talked"],
        correctAnswer: 1,
        explanation: "Stop + -ing means to quit a habit or permanent action."
    },
    {
        unit: 3,
        question: "'Never ____ I seen such beauty.' (Inversion)",
        options: ["I have", "have I", "had I", "I had"],
        correctAnswer: 1,
        explanation: "Inversion with negative adverbs requires Verb-Subject order."
    },
    {
        unit: 3,
        question: "Which of these is an EMPHATIC pronoun usage?",
        options: ["He hurt himself.", "I will do it myself!", "They saw themselves.", "She told herself."],
        correctAnswer: 1,
        explanation: "In 'I will do it myself', 'myself' is for emphasis and can be removed without losing basic meaning."
    },
    {
        unit: 3,
        question: "Correct preposition: 'Are you interested ____ joining us?'",
        options: ["at", "on", "in", "to"],
        correctAnswer: 2,
        explanation: "The adjective 'interested' is followed by 'in'."
    },

    // Unit 4: Reported Speech and Clauses
    {
        unit: 4,
        question: "Direct: 'Where do you live?' -> Reported: He asked me ____.",
        options: ["where did I live", "where I lived", "if I lived there", "where lived I"],
        correctAnswer: 1,
        explanation: "Reported questions use statement word order (Subject before Verb)."
    },
    {
        unit: 4,
        question: "Which relative clause is extra info and requires commas?",
        options: ["Defining", "Non-defining", "Reduced", "Participle"],
        correctAnswer: 1,
        explanation: "Non-defining relative clauses provide non-essential information and must have commas."
    },
    {
        unit: 4,
        question: "'Being tired, I went to bed.' What type of clause is 'Being tired'?",
        options: ["Relative Clause", "Noun Clause", "Participle Clause", "Adverb Clause"],
        correctAnswer: 2,
        explanation: "It's a present participle clause expressing reason."
    },
    {
        unit: 4,
        question: "Direct: 'I can help you.' -> Reported: He said he ____ help me.",
        options: ["can", "could", "shall", "must"],
        correctAnswer: 1,
        explanation: "In reported speech, 'can' backshifts to 'could'."
    },
    {
        unit: 4,
        question: "Which relative pronoun cannot be used in a non-defining clause?",
        options: ["Who", "Which", "That", "Whose"],
        correctAnswer: 2,
        explanation: "'That' is only used in defining (essential) relative clauses."
    },

    // Unit 5: Articles and Quantifiers
    {
        unit: 5,
        question: "Which is correct for a general group?",
        options: ["A rich", "Rich", "The rich", "An rich"],
        correctAnswer: 2,
        explanation: "'The + Adjective' can represent a group of people."
    },
    {
        unit: 5,
        question: "I have ____ friends, so I am quite lonely.",
        options: ["a few", "few", "a little", "little"],
        correctAnswer: 1,
        explanation: "'Few' means not many/almost none (negative), suitable for expressing loneliness."
    },
    {
        unit: 5,
        question: "We saw ____ Alps during our trip to Europe.",
        options: ["a", "an", "the", "no article"],
        correctAnswer: 2,
        explanation: "We use 'the' for mountain ranges."
    },
    {
        unit: 5,
        question: "Is there ____ milk in the fridge?",
        options: ["some", "any", "a few", "many"],
        correctAnswer: 1,
        explanation: "'Any' is standard for questions and negative sentences with uncountable nouns."
    },
    {
        unit: 5,
        question: "____ student in the class was given a prize.",
        options: ["All", "Each", "Some", "Many"],
        correctAnswer: 1,
        explanation: "'Each' is followed by a singular noun and focuses on individuals."
    },

    // Unit 6: Vocabulary and Word Formation
    {
        unit: 6,
        question: "Identify the inseparable phrasal verb:",
        options: ["Turn off", "Run into", "Pick up", "Put on"],
        correctAnswer: 1,
        explanation: "'Run into' (encounter) cannot be separated (e.g., 'run my friend into' is wrong)."
    },
    {
        unit: 6,
        question: "Opposite of 'Responsible':",
        options: ["Unresponsible", "Inresponsible", "Irresponsible", "Disresponsible"],
        correctAnswer: 2,
        explanation: "Words starting with 'r' usually take 'ir-' as a negative prefix."
    },
    {
        unit: 6,
        question: "Meaning of the idiom 'To stay on the ball':",
        options: ["To play sports", "To be alert and capable", "To be lazy", "To sleep"],
        correctAnswer: 1,
        explanation: "'Staying on the ball' means being quick to understand and react."
    },
    {
        unit: 6,
        question: "What suffix turns the verb 'Modern' into a verb meaning 'to make modern'?",
        options: ["-tion", "-ity", "-ize", "-ful"],
        correctAnswer: 2,
        explanation: "The suffix '-ize' turns nouns/adjectives into verbs meaning 'to make/become'."
    },
    {
        unit: 6,
        question: "Meaning of 'Once in a blue moon':",
        options: ["Regularly", "Very rarely", "Every night", "Never"],
        correctAnswer: 1,
        explanation: "This idiom means something happens very infrequently."
    }
];

export const pel125Flashcards: Flashcard[] = [
    // Unit 1
    { front: "Future Perfect Formula", back: "Subject + will + have + Verb3. (e.g., I will have finished)." },
    { front: "Stative Verb definition", back: "Verbs describing states/feelings (know, love) not used in -ing form." },
    { front: "Past Perfect Continuous usage", back: "Action happening up until another point in the past." },

    // Unit 2
    { front: "Causative Passive Formula", back: "Have/Get + Object + Past Participle (e.g., I had my car washed)." },
    { front: "Should have + Verb3 meaning", back: "Regret about an unfulfilled past obligation." },
    { front: "Impersonal Passive example", back: "'It is expected that output will increase.'" },

    // Unit 3
    { front: "Inversion with 'Never'", back: "'Never have I seen...' (Verb before Subject)." },
    { front: "Stop + To-Infinitive vs -ing", back: "To-Infinitive = pause for purpose; -ing = quit habit." },
    { front: "Ergative Verb", back: "Verb that can be transitive or intransitive. (e.g., The door opened)." },

    // Unit 4
    { front: "Reported Question Order", back: "Question word + Subject + Verb. (e.g., ...where I lived)." },
    { front: "Reduced Relative Clause (Active)", back: "'The girl sitting there...' instead of 'The girl who is sitting...'." },
    { front: "Non-defining Relative Clause", back: "Extra info, uses commas, cannot use 'that'." },

    // Unit 5
    { front: "Few vs A Few", back: "Few = almost none (neg); A few = some (pos)." },
    { front: "The + Adjective", back: "Used to refer to a specific group. (e.g., The unemployed)." },
    { front: "Zero Article with Geography", back: "No 'The' for most cities, countries, and continents." },

    // Unit 6
    { front: "Negative Prefixes (L, M, P, R)", back: "Il-legal, Im-possible, Im-mature, Ir-relevant." },
    { front: "Suffix -en significance", back: "To make or cause to be. (e.g., Sharpen, Widen)." },
    { front: "Idiom: 'Burn the midnight oil'", back: "To work or study late into the night." }
];
