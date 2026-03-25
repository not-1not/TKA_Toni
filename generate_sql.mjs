import fs from 'fs';
import path from 'path';

// Helperes
function parseCSV(content) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (currentCell || currentRow.length > 0) {
                currentRow.push(currentCell.trim());
                rows.push(currentRow);
                currentRow = [];
                currentCell = '';
            }
            if (char === '\r' && nextChar === '\n') i++;
        } else {
            currentCell += char;
        }
    }
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }
    return rows;
}

function escapeSql(str) {
    if (str === null || str === undefined) return '';
    return str.replace(/'/g, "''");
}

let sqlOutput = `-- ==========================================
-- SUPABASE INITIALIZATION SCRIPT
-- ==========================================

-- 1. Create table 'questions'
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    question TEXT NOT NULL,
    type TEXT NOT NULL,
    options JSONB,
    answer TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clear existing data (optional, remove comment below if you want to wipe before insert)
-- TRUNCATE TABLE public.questions;

-- 3. Insert Database Matematika
`;

// -- Process MATEMATIKA (from SQL) --
try {
    const mtkSqlContent = fs.readFileSync('C:/Users/Administrator/Downloads/files/insert_questions_matematika.sql', 'utf-8');
    const regex = /INSERT INTO public\.questions_matematika \(id, question, type, options, answer\)\s*VALUES \('([^']+)', '((?:[^']|'')*)', '([^']+)', '(.*?)'::jsonb, '([^']*)'\);/g;
    
    let match;
    while ((match = regex.exec(mtkSqlContent)) !== null) {
        const [_, id, question, type, optionsJsonStr, answer] = match;
        // The regex captures escaped quotes as ''. We need to unescape them for JS parsing if needed, 
        // but we can just forward them to the new SQL directly, just replace table name and add subject 'Matematika'
        // wait, we need to add subject mapping.
        
        sqlOutput += `INSERT INTO public.questions (id, subject, question, type, options, answer, image)\n`;
        sqlOutput += `VALUES ('${id}', 'Matematika', '${question}', '${type}', '${escapeSql(optionsJsonStr.replace(/''/g, "'"))}'::jsonb, '${escapeSql(answer)}', '');\n`;
    }
} catch (err) {
    console.error('Error processing Matematika SQL:', err.message);
}

sqlOutput += `\n-- 4. Insert Database Bahasa Indonesia\n`;

// -- Process BAHASA INDONESIA (from CSV) --
try {
    const biCsvContent = fs.readFileSync('C:/Users/Administrator/Downloads/questions_bahasa_indonesia.csv', 'utf-8');
    const rows = parseCSV(biCsvContent);
    const headers = rows[0]; // Assuming no header missing

    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length < 3) continue;

        const id = 'q_bi_' + Math.random().toString(36).substring(2, 9);
        const subject = cols[0];
        const questionText = cols[1];
        let qTypeRaw = (cols[2] || '').toUpperCase();
        
        let qType = 'MC';
        if (qTypeRaw === 'MC' || qTypeRaw === 'PILIHAN_GANDA') qType = 'MC';
        else if (qTypeRaw === 'MCMA' || qTypeRaw === 'PILIHAN_GANDA_KOMPLEKS') qType = 'MCMA';
        else if (qTypeRaw === 'TF' || qTypeRaw === 'MULTIPLE_CHOICE_MULTIPLE_ANSWER') qType = 'TF';

        let optionsJson = '[]';
        let answerStr = '';

        if (qType === 'MC') {
            const opts = [cols[3] || '', cols[4] || '', cols[5] || '', cols[6] || ''];
            optionsJson = JSON.stringify(opts);
            answerStr = (cols[7] || 'A').toUpperCase();
        } else if (qType === 'MCMA') {
            const correctIndices = (cols[7] || '').toUpperCase().split(',').map(s => s.trim());
            let statements = [];
            
            // Check if structured as A,B,C,D or Statements in s1..s3
            if (cols[3] || cols[4] || cols[5]) {
                 statements = [
                    { statement: cols[3], answer: correctIndices.includes('A') ? 'Benar' : 'Salah' },
                    { statement: cols[4], answer: correctIndices.includes('B') ? 'Benar' : 'Salah' },
                    { statement: cols[5], answer: correctIndices.includes('C') ? 'Benar' : 'Salah' },
                    { statement: cols[6], answer: correctIndices.includes('D') ? 'Benar' : 'Salah' }
                 ].filter(s => s.statement);
                 answerStr = correctIndices.join(',');
            } else {
                 if (cols[8]) statements.push({ statement: cols[8], answer: cols[9] });
                 if (cols[10]) statements.push({ statement: cols[10], answer: cols[11] });
                 if (cols[12]) statements.push({ statement: cols[12], answer: cols[13] });
                 answerStr = 'A,B'; // Dummy or mapped
            }
            optionsJson = JSON.stringify(statements.map(s => s.statement));
            answerStr = cols[7] || ''; // MCMA answer is like "A,B"
        } else if (qType === 'TF') {
            let statements = [];
            if (cols[8]) statements.push({ statement: cols[8], answer: cols[9] || 'Benar' });
            if (cols[10]) statements.push({ statement: cols[10], answer: cols[11] || 'Benar' });
            if (cols[12]) statements.push({ statement: cols[12], answer: cols[13] || 'Benar' });
            optionsJson = JSON.stringify(statements);
            answerStr = '';
        }

        sqlOutput += `INSERT INTO public.questions (id, subject, question, type, options, answer, image)\n`;
        sqlOutput += `VALUES ('${id}', '${escapeSql(subject)}', '${escapeSql(questionText)}', '${qType}', '${escapeSql(optionsJson)}'::jsonb, '${escapeSql(answerStr)}', '');\n`;
    }
} catch (err) {
    console.error('Error processing Bahasa Indonesia CSV:', err.message);
}

fs.writeFileSync('supabase_setup.sql', sqlOutput);
console.log('Successfully generated supabase_setup.sql!');
