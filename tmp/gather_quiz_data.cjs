const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/data/quiztaker';
const outputFile = 'c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/tmp/all_questions.json';

const allQuestions = [];

function parseFile(filePath, subject, unit) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // We regex for patterns like { id: "...", ... }
    // Since these are TS files, we need to extract everything inside the [ ] of the exported const
    const arrayMatch = content.match(/export const \w+: QuizQuestion\[\] = \[(.*)\];/s);
    if (!arrayMatch) {
        // Fallback for different export patterns if any
        return [];
    }
    
    const arrayContent = arrayMatch[1];
    
    // Note: This is an extremely simplified parser. 
    // It works as long as the content is valid JS and doesn't contain nested objects that mess up the split
    // Better: use eval or a proper parser. 
    // Since we are running in node, we can just replace 'export const' with 'const' and eval it.
    try {
        const cleanedContent = content
            .replace(/import .*/g, '')
            .replace(/export const \w+(?:: \w+\[\])? =/, 'const dataArray =')
            .replace(/export /g, ''); // just in case
        
        // Use a function scope to safely eval
        let dataResult = [];
        const evalContext = { dataArray: [] };
        // We'll use a hack to get the variable value
        // eval(cleanedContent + '; dataResult = dataArray;');
        // Since we can't easily map everything, let's use the simplest version:
        const wrapped = `(function(){ ${cleanedContent}; return dataArray; })()`;
        dataResult = eval(wrapped);
        
        return dataResult.map(q => ({
            ...q,
            subject,
            unit: unit || q.unit // prioritize given unit from folder
        }));
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e);
        return [];
    }
}

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.name.endsWith('.ts') && entry.name !== 'quizData.ts') {
            const subject = path.basename(path.dirname(fullPath));
            const unitMatch = entry.name.match(/unit(\d+)/i);
            const unit = unitMatch ? parseInt(unitMatch[1]) : null;
            
            const questions = parseFile(fullPath, subject, unit);
            allQuestions.push(...questions);
            console.log(`Extracted ${questions.length} questions from ${entry.name}`);
        }
    }
}

walk(rootDir);

fs.writeFileSync(outputFile, JSON.stringify(allQuestions, null, 2));
console.log(`Successfully saved ${allQuestions.length} questions to ${outputFile}`);
