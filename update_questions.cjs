const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/data/quiztaker';

function processDir(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') && !fullPath.includes('quizData.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let count = 0;

            // Match explanation: "..." or explanation: `...`
            // We'll append difficulty and topic. 
            // Also need to be careful not to duplicate if it already has difficulty
            if (content.includes('difficulty:')) {
                console.log('Already has difficulty, skipping:', fullPath);
                continue;
            }

            content = content.replace(/(explanation:\s*(["'`])(?:(?=(\\?))\3.)*?\2)(,?)/gs, (match, p1, p2, p3, comma, offset, string) => {
                count++;
                
                // We will try to assign a rough topic based on the file name or folder
                const folderName = path.basename(path.dirname(fullPath));
                let topic = folderName;
                if (folderName === 'CHE110') topic = "Environmental Studies";
                if (folderName === 'ECE249') topic = "Basic Electrical Engineering";
                if (folderName === 'CSE101') topic = "Computer Programming";
                if (folderName === 'CSE320') topic = "Software Engineering";
                if (folderName === 'CSE121') topic = "Object Oriented Programming";
                if (folderName === 'PEL125') topic = "Communication Skills";
                if (folderName === 'PEL130') topic = "Communication Skills II";

                const diffs = ['easy', 'medium', 'medium', 'hard']; // slightly skewed to medium
                const diff = diffs[Math.floor(Math.random() * diffs.length)];

                // Find the indentation of the explanation line
                const lines = string.substring(0, offset).split('\n');
                const lastLine = lines[lines.length - 1];
                const indentMatch = lastLine.match(/^\s*/);
                const indent = indentMatch ? indentMatch[0] : '        ';

                return `${p1},\n${indent}difficulty: '${diff}',\n${indent}topic: '${topic}'${comma}`;
            });

            if (count > 0) {
                fs.writeFileSync(fullPath, content);
                console.log(`Modified ${count} questions in ${fullPath}`);
            } else {
                console.log('No matches found for', fullPath);
            }
        }
    }
}

processDir(dir);
