
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\ASUS\\OneDrive\\Desktop\\Anunayy\\AntiGravity\\LPU-Nexus\\services\\nexusServer.ts', 'utf8');

let braceCount = 0;
let lineNum = 0;
const lines = content.split('\n');

for (let line of lines) {
    lineNum++;
    for (let char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
    }
    if (braceCount < 0) {
        console.log(`Brace underflow at line ${lineNum}: ${line}`);
        break;
    }
}

if (braceCount !== 0) {
    console.log(`Final brace mismatch: ${braceCount}`);
} else {
    console.log("No brace mismatch found.");
}
