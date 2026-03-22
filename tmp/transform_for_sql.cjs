const fs = require('fs');

const inputFile = 'c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/tmp/all_questions.json';
const outputFile = 'c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/tmp/questions_transformed.json';

const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

const transformed = rawData.map(q => ({
    id: q.id,
    subject: q.subject,
    unit: q.unit,
    topic: q.topic,
    difficulty: q.difficulty,
    question_type: q.questionType,
    type: q.type || 'mcq', // default
    question: q.question,
    options: q.options ? JSON.stringify(q.options) : null,
    correct_answer: q.correctAnswer !== undefined ? q.correctAnswer : null,
    explanation: q.explanation || '',
    starter_code: q.starterCode || null,
    test_cases: q.testCases ? JSON.stringify(q.testCases) : null
}));

fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2));
console.log(`Transformed ${transformed.length} questions.`);
