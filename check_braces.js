
const fs = require('fs');

const content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/components/QuizTaker.tsx', 'utf8');
let open = 0;
let lines = content.split('\n');
for (let i = 0; i < (lines.length); i++) {
    let line = (lines[i]);
    for (let char of line) {
        if (char === '{') open++;
        if (char === '}') open--;
    }
    if (open < 0) {
        console.log(`Open braces < 0 at line ${(i + 1)}: ${line}`);
        break;
    }
}
console.log(`Final open count: ${open}`);
