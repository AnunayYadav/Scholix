const fs = require('fs');
const path = require('path');

const quiztakerDir = 'c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/data/quiztaker';
const dataDir = 'c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/data';

const syllabusMapping = {
    CHE110: {
        1: "Introduction and sustainable development",
        2: "Natural resources and ecosystem",
        3: "Biodiversity and conservation",
        4: "Environmental pollution",
        5: "Disaster management",
        6: "Human communities and environment"
    },
    CSE320: {
        1: "Software Engineering Foundations & SDLC",
        2: "Software Design Principles & System Architecture",
        3: "Object-Oriented Software Development and Modeling Techniques",
        4: "Software Testing Concepts, Techniques, and Automation",
        5: "Software Project Management & DevOps Practices",
        6: "Quality Management, Maintenance & Emerging Technologies"
    },
    CSE121: {
        1: "Data Science & Big Data",
        2: "Artificial Intelligence & Machine Learning",
        3: "Cybersecurity",
        4: "DevOps & Software Testing",
        5: "Cloud Computing",
        6: "Full Stack Web Development & UI/UX"
    },
    CSE101: {
        1: "Basics and introduction to C",
        2: "Control structures and Input/Output functions",
        3: "User defined functions and Storage classes",
        4: "Arrays in C",
        5: "Pointers, Dynamic memory allocation and Strings",
        6: "Derived types including structures and unions"
    }
};

function extractDynamicTopic(subject, unit) {
    const filePath = path.join(dataDir, subject.toLowerCase(), 'unit' + unit + '.ts');
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/export const unit\d+Title\s*=\s*["']([^"']+)["']/);
        if (match && match[1]) {
            let title = match[1];
            title = title.replace(/^Unit\s*\d+\s*:\s*/i, '').trim();
            return title;
        }
    }
    return subject + ' Topic ' + unit;
}

function processDir(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') && !fullPath.includes('quizData.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let count = 0;

            const folderName = path.basename(path.dirname(fullPath));
            const fileName = path.basename(fullPath);
            const unitMatch = fileName.match(/unit(\d+)/i);
            const unitPatternMatch = content.match(/unit:\s*(\d+)/);
            
            let unitNum = 1;
            if (unitMatch) unitNum = parseInt(unitMatch[1]);
            else if (unitPatternMatch) unitNum = parseInt(unitPatternMatch[1]);

            let exactTopic = "General Topic";
            if (syllabusMapping[folderName] && syllabusMapping[folderName][unitNum]) {
                exactTopic = syllabusMapping[folderName][unitNum];
            } else {
                exactTopic = extractDynamicTopic(folderName, unitNum);
            }

            content = content.replace(/(explanation:\s*(["'`])(?:(?=(\\?))\3.)*?\2)(,\s*difficulty:\s*['"][^'"]+['"])?(,\s*topic:\s*['"][^'"]+['"])?/gs, function(match, explBlock, quote, p3, diffBlock, topicBlock, offset, string) {
                count++;

                const blockUpToHere = string.substring(Math.max(0, offset - 400), offset + explBlock.length);
                const qMatch = blockUpToHere.match(/question:\s*(["'`])(?:(?=(\\?))\2.)*?\1/);
                let qLen = qMatch ? qMatch[0].length : 100;
                
                let difficulty = 'medium';
                if (qLen < 70) difficulty = 'easy';
                else if (qLen > 150) difficulty = 'hard';
                
                const lines = string.substring(0, offset).split(/\n/);
                const lastLine = lines[lines.length - 1];
                const indentMatch = lastLine.match(/^\s*/);
                const indent = indentMatch ? indentMatch[0] : '        ';

                return explBlock + ',\n' + indent + "difficulty: '" + difficulty + "',\n" + indent + "topic: '" + exactTopic.replace(/'/g, "\\'") + "'";
            });

            if (count > 0) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + count + ' questions in ' + fullPath + ' with topic "' + exactTopic + '"');
            }
        }
    }
}

try {
    processDir(quiztakerDir);
    console.log("Success.");
} catch(e) {
    console.error(e);
}
