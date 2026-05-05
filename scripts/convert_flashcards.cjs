const fs = require('fs');
const csv = fs.readFileSync('public/assets/flashcards.csv', 'utf-8');
const lines = csv.split('\n').filter(l => l.trim() !== '');
const json = lines.map(line => {
    // Regex to match "Question", "Answer" or Question, Answer
    let q = '';
    let a = '';
    if (line.startsWith('"')) {
        const parts = line.split('","');
        if (parts.length >= 2) {
            q = parts[0].substring(1);
            a = parts[1].replace(/"$/, '').trim();
        } else {
            // Handle cases where answer is not quoted but question is
            const match = line.match(/^"([^"]+)",(.*)$/);
            if (match) {
                q = match[1];
                a = match[2].trim();
            }
        }
    } else {
        const match = line.match(/^([^,]+),(.*)$/);
        if (match) {
            q = match[1];
            a = match[2].trim();
        }
    }
    // Clean quotes
    q = q.replace(/^"|"$/g, '');
    a = a.replace(/^"|"$/g, '');
    
    return { q, a };
}).filter(x => x.q && x.a);

if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
}
fs.writeFileSync('src/data/flashcards.json', JSON.stringify(json, null, 2));
