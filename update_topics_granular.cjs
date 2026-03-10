const fs = require('fs');
const path = require('path');

const quiztakerDir = 'c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/data/quiztaker';
const dataDir = 'c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/data';

const syllabusDataFilePath = path.join(dataDir, 'syllabusData.ts');
let syllabusDataContent = fs.readFileSync(syllabusDataFilePath, 'utf8');

const roman = {1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI'};

function getGranularTopicsFromSyllabus(subject, unit) {
    try {
        const subjectRegex = new RegExp(`"${subject}[^"]*":\\s*\`([\\s\\S]*?)\``, 'i');
        const subjectMatches = syllabusDataContent.match(subjectRegex);
        if (subjectMatches && subjectMatches[1]) {
            const unitRegex = new RegExp(`Unit ${roman[unit]}\\s*\\n([^\\n]+)`);
            const unitContentMatch = subjectMatches[1].match(unitRegex);
            if (unitContentMatch && unitContentMatch[1]) {
                const text = unitContentMatch[1];
                const parts = text.split(':');
                if (parts.length > 1) {
                    const subtopicsStr = parts.slice(1).join(':');
                    let topics = subtopicsStr.split(',').map(s => s.trim().replace(/^and\s+/i, '')).filter(s => s && s.length > 3);
                    return topics;
                } else {
                    return [text.trim()];
                }
            }
        }
    } catch(e) {
        console.error("Error in getGranularTopicsFromSyllabus for", subject, unit, e);
    }
    return [];
}

function getGranularTopicsFromMarkdown(subject, unit) {
    try {
        const filePath = path.join(dataDir, subject.toLowerCase(), 'unit' + unit + '.ts');
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = [...content.matchAll(/^##\s+(.+)$/gm)];
            if (matches.length > 0) {
                return matches.map(m => {
                    if (m && m[1]) return m[1].trim();
                    return "General";
                }).filter(Boolean);
            }
        }
    } catch(e) {
        console.error("Error in getGranularTopicsFromMarkdown for", subject, unit, e);
    }
    return [];
}

function getBestTopic(questionText, explanationText, topics) {
    if (!topics || topics.length === 0) return "General Topic";
    
    try {
        const qWordsStr = (questionText + ' ' + (explanationText || '')).toLowerCase();
        const qWordsMatch = qWordsStr.match(/\b\w+\b/g);
        const qWords = qWordsMatch ? qWordsMatch : [];
        let bestTopic = topics[0];
        let maxScore = -1;

        for (const topic of topics) {
            if (!topic) continue;
            const tWordsMatch = topic.toLowerCase().match(/\b\w+\b/g);
            const tWords = tWordsMatch ? tWordsMatch : [];
            const stops = new Set(['and', 'of', 'the', 'in', 'to', 'a', 'is', 'for', 'with', 'on', 'as', 'their']);
            const meaningfulTWords = tWords.filter(w => !stops.has(w));
            
            let score = 0;
            for (const mw of meaningfulTWords) {
                if (qWords.includes(mw)) score += 1;
                for (const qw of qWords) {
                    if (qw.length > 4 && mw.length > 4) {
                        if (qw.includes(mw) || mw.includes(qw)) score += 0.5;
                    }
                }
            }
            
            if (score > maxScore) {
                maxScore = score;
                bestTopic = topic;
            }
        }
        
        if (maxScore === 0) {
            bestTopic = topics[Math.floor(Math.random() * topics.length)];
        }
        
        return bestTopic ? bestTopic.charAt(0).toUpperCase() + bestTopic.slice(1) : "General Topic";
    } catch(e) {
        console.error("Error in getBestTopic", e);
        return topics[0] || "General Topic";
    }
}

function processDir(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') && !fullPath.includes('quizData.ts')) {
            try {
                let content = fs.readFileSync(fullPath, 'utf8');
                let count = 0;

                const folderName = path.basename(path.dirname(fullPath));
                const fileName = path.basename(fullPath);
                const unitMatch = fileName.match(/unit(\d+)/i);
                const unitPatternMatch = content.match(/unit:\s*(\d+)/);
                
                let unitNum = 1;
                if (unitMatch) unitNum = parseInt(unitMatch[1]);
                else if (unitPatternMatch) unitNum = parseInt(unitPatternMatch[1]);

                let topics = getGranularTopicsFromSyllabus(folderName, unitNum);
                if (topics.length === 0) {
                    topics = getGranularTopicsFromMarkdown(folderName, unitNum);
                }
                if (topics.length === 0) {
                    topics = [`${folderName} Topic ${unitNum}`];
                }

                content = content.replace(/(question:\s*(["'`])((?:(?=(\\?))\4.)*?)\2.*?explanation:\s*(["'`])((?:(?=(\\?))\7.)*?)\5)(,\s*difficulty:\s*['"][^'"]+['"])?(,\s*topic:\s*['"][^'"]+['"])?/gs, function(match, qAndExplBlock, qQuote, qTextInside, qSlash, explQuote, explTextInside, explSlash, offset, string) {
                    count++;

                    let qText = qTextInside || '';
                    let explText = explTextInside || '';

                    let qLen = qText.length;
                    let difficulty = 'medium';
                    if (qLen < 70) difficulty = 'easy';
                    else if (qLen > 150) difficulty = 'hard';

                    const bestTopic = getBestTopic(qText, explText, topics);
                    
                    const lines = string.substring(0, offset).split(/\n/);
                    const lastLine = lines[lines.length - 1];
                    const indentMatch = lastLine.match(/^\s*/);
                    const indent = indentMatch ? indentMatch[0] : '        ';

                    return qAndExplBlock + ',\n' + indent + "difficulty: '" + difficulty + "',\n" + indent + "topic: '" + bestTopic.replace(/'/g, "\\'") + "'";
                });

                if (count > 0) {
                    fs.writeFileSync(fullPath, content);
                    console.log('Updated ' + count + ' questions in ' + fullPath);
                }
            } catch(e) {
                console.error("Error processing file", fullPath, e);
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
