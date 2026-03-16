// src/lib/db.ts
// Mock Database Implementation using LocalStorage

export type Student = {
  id: string;
  username: string;
  password?: string;
  name: string;
  school: string;
};

export type QuestionType = 'pilihan_ganda' | 'pilihan_ganda_kompleks' | 'multiple_choice_multiple_answer';

export type Statement = {
  text: string;
  isCorrect?: boolean; // For pilihan_ganda_kompleks
  correctAnswer?: string; // For multiple_choice_multiple_answer (e.g. 'Setuju' / 'Tidak Setuju')
};

export type Question = {
  id: string;
  subject: string;
  question: string;
  type: QuestionType;
  // Type: pilihan_ganda
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: 'A' | 'B' | 'C' | 'D';
  // Type: pilihan_ganda_kompleks & multiple_choice_multiple_answer
  statements?: Statement[]; // 3 statements for both
  image?: string; // Optional image URL or base64
};

export type ExamToken = {
  id: string;
  token: string;
  durationMinutes: number;
  questionCount: number;
  subject?: string;
  active: boolean;
};

export type Answer = {
  studentId: string;
  questionId: string;
  selectedAnswer: any; // Flexible answer type
};

export type Result = {
  id: string;
  studentId: string;
  studentName: string;
  school: string;
  correct: number;
  wrong: number;
  score: number;
  timestamp: string;
};

export type ExamState = {
  studentId: string;
  tokenId: string;
  endTime: number | null; // epoch time
  startTime: number | null;
  answers: Record<string, any>; // questionId -> selectedAnswer
  doubt: Record<string, boolean>; // questionId -> doubt toggle
  questionOrder: string[]; // randomized question IDs
  optionOrder: Record<string, any>; // questionId -> shuffled options/statements
  submitted: boolean;
};


// Generic helpers for LocalStorage
const getStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const api = {
  // --- Students ---
  getStudents: () => getStorage<Student[]>('students', []),
  addStudent: (student: Student) => {
    const students = api.getStudents();
    setStorage('students', [...students, student]);
  },
  updateStudent: (student: Student) => {
    const students = api.getStudents();
    setStorage('students', students.map(existing => existing.id === student.id ? student : existing));
  },
  deleteStudent: (id: string) => {
    const students = api.getStudents();
    setStorage('students', students.filter(s => s.id !== id));
  },
  setStudents: (ss: Student[]) => setStorage('students', ss),
  
  // --- Tokens ---
  getTokens: () => getStorage<ExamToken[]>('tokens', []),
  addToken: (token: ExamToken) => {
    const tokens = api.getTokens();
    setStorage('tokens', [...tokens, token]);
  },
  setTokens: (ts: ExamToken[]) => setStorage('tokens', ts),
  getTokenByStr: (tokenStr: string) => {
    return api.getTokens().find(t => t.token.toUpperCase() === tokenStr.toUpperCase() && t.active);
  },

  // --- Questions ---
  getQuestions: () => getStorage<Question[]>('questions', []),
  addQuestion: (q: Question) => {
    const questions = api.getQuestions();
    setStorage('questions', [...questions, q]);
  },
  updateQuestion: (q: Question) => {
    const questions = api.getQuestions();
    setStorage('questions', questions.map(existing => existing.id === q.id ? q : existing));
  },
  deleteQuestion: (id: string) => {
    const questions = api.getQuestions();
    setStorage('questions', questions.filter(q => q.id !== id));
  },
  setQuestions: (qs: Question[]) => setStorage('questions', qs), // For import formatting

  // --- Results ---
  getResults: () => getStorage<Result[]>('results', []),
  addResult: (res: Result) => {
    const results = api.getResults();
    setStorage('results', [...results, res]);
  },
  updateResult: (res: Result) => {
    const results = api.getResults();
    setStorage('results', results.map(existing => existing.id === res.id ? res : existing));
  },
  deleteResult: (id: string) => {
    const results = api.getResults();
    setStorage('results', results.filter(r => r.id !== id));
  },

  // --- Exam State (Concurrent Sessions) ---
  getAllExamStates: () => getStorage<Record<string, ExamState>>('exam_states', {}),
  getExamState: (studentId: string) => {
    const states = getStorage<Record<string, ExamState>>('exam_states', {});
    return states[studentId] || null;
  },
  setExamState: (state: ExamState) => {
    const states = getStorage<Record<string, ExamState>>('exam_states', {});
    states[state.studentId] = state;
    setStorage('exam_states', states);
  },
  updateExamState: (studentId: string, update: Partial<ExamState>) => {
    const states = getStorage<Record<string, ExamState>>('exam_states', {});
    if (states[studentId]) {
      states[studentId] = { ...states[studentId], ...update };
      setStorage('exam_states', states);
    }
  },
  deleteExamState: (studentId: string) => {
    const states = getStorage<Record<string, ExamState>>('exam_states', {});
    delete states[studentId];
    setStorage('exam_states', states);
  },
  
  // --- Helpers ---
  getResultsByStudent: (studentId: string) => {
    return api.getResults().filter(r => r.studentId === studentId);
  },
  clearAll: () => localStorage.clear(),

  // --- Database Seeding ---
  initializeDatabase: async (force = false) => {
    const isFirstRun = !localStorage.getItem('db_initialized');
    if (!isFirstRun && !force) return;

    try {
      const [questionsJson, students, results, tokens] = await Promise.all([
        fetch('/database/questions.json').then(res => res.json()).catch(() => []),
        fetch('/database/students.json').then(res => res.json()).catch(() => []),
        fetch('/database/results.json').then(res => res.json()).catch(() => []),
        fetch('/database/tokens.json').then(res => res.json()).catch(() => []),
      ]);

      let allQuestions = Array.isArray(questionsJson) ? [...questionsJson] : [];

      // Try to fetch BI CSV if it exists
      try {
        const biCsv = await fetch('/database/questions_bahasa_indonesia.csv').then(res => res.text());
        if (biCsv && biCsv.length > 50 && !biCsv.includes('<!DOCTYPE html>')) {
           const parsed = api.parseQuestionCSV(biCsv);
           allQuestions = [...allQuestions, ...parsed];
        }
      } catch (e) {
        console.warn('BI CSV not found or invalid');
      }

      // Try to fetch MTK CSV if it exists
      try {
        const mtkCsv = await fetch('/database/questions_matematika.csv').then(res => res.text());
        if (mtkCsv && mtkCsv.length > 50 && !mtkCsv.includes('<!DOCTYPE html>')) {
           const parsed = api.parseQuestionCSV(mtkCsv);
           allQuestions = [...allQuestions, ...parsed];
        }
      } catch (e) {
        console.warn('MTK CSV not found or invalid');
      }

      // Deduplicate by question text (simple way)
      const uniqueQuestions = Array.from(new Map(allQuestions.map(q => [q.question, q])).values());

      if (uniqueQuestions.length) api.setQuestions(uniqueQuestions);
      if (students && students.length) api.setStudents(students);
      if (results && results.length) setStorage('results', results);
      if (tokens && tokens.length) api.setTokens(tokens);

      localStorage.setItem('db_initialized', 'true');
      console.log('Database initialized from public files');
    } catch (err) {
      console.error('Failed to initialize database:', err);
    }
  },

  resetDatabase: async () => {
    localStorage.clear();
    await api.initializeDatabase(true);
    window.location.reload();
  },

  // --- Helper for CSV parsing in lib ---
  parseCSV: (content: string) => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
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
  },

  parseQuestionCSV: (text: string) => {
    const allRows = api.parseCSV(text);
    if (allRows.length < 2) return [];

    const dataRows = allRows.slice(1);
    const questions: Question[] = [];

    dataRows.forEach(cols => {
      if (cols.length >= 3) {
        let qTypeRaw = cols[2].toUpperCase();
        let qType: any = 'pilihan_ganda';
        
        if (qTypeRaw === 'MC' || qTypeRaw === 'PILIHAN_GANDA') qType = 'pilihan_ganda';
        else if (qTypeRaw === 'MCMA' || qTypeRaw === 'PILIHAN_GANDA_KOMPLEKS') qType = 'pilihan_ganda_kompleks';
        else if (qTypeRaw === 'TF' || qTypeRaw === 'MULTIPLE_CHOICE_MULTIPLE_ANSWER') qType = 'multiple_choice_multiple_answer';

        const q: Question = {
          id: 'Q-' + Math.random().toString(36).substring(2, 9),
          subject: cols[0],
          question: cols[1],
          type: qType,
          image: cols[14] || '',
        };

        if (qType === 'pilihan_ganda') {
          q.option_a = cols[3] || '';
          q.option_b = cols[4] || '';
          q.option_c = cols[5] || '';
          q.option_d = cols[6] || '';
          q.correct_answer = (cols[7] || 'A').toUpperCase() as any;
        } else if (qType === 'pilihan_ganda_kompleks') {
          const statements: Statement[] = [];
          const correctIndices = (cols[7] || '').toUpperCase().split(',').map(s => s.trim());

          if (cols[3] || cols[4] || cols[5]) {
            if (cols[3]) statements.push({ text: cols[3], isCorrect: correctIndices.includes('A') });
            if (cols[4]) statements.push({ text: cols[4], isCorrect: correctIndices.includes('B') });
            if (cols[5]) statements.push({ text: cols[5], isCorrect: correctIndices.includes('C') });
            if (cols[6]) statements.push({ text: cols[6], isCorrect: correctIndices.includes('D') });
          } else {
            if (cols[8]) statements.push({ text: cols[8], isCorrect: cols[9] === 'Benar' || cols[9] === 'Sesuai' || cols[9] === 'Tepat' });
            if (cols[10]) statements.push({ text: cols[10], isCorrect: cols[11] === 'Benar' || cols[11] === 'Sesuai' || cols[11] === 'Tepat' });
            if (cols[12]) statements.push({ text: cols[12], isCorrect: cols[13] === 'Benar' || cols[13] === 'Sesuai' || cols[13] === 'Tepat' });
          }
          q.statements = statements;
        } else if (qType === 'multiple_choice_multiple_answer') {
          const statements: Statement[] = [];
          if (cols[8]) statements.push({ text: cols[8], correctAnswer: cols[9] || 'Sesuai' });
          if (cols[10]) statements.push({ text: cols[10], correctAnswer: cols[11] || 'Sesuai' });
          if (cols[12]) statements.push({ text: cols[12], correctAnswer: cols[13] || 'Sesuai' });
          q.statements = statements;
        }
        questions.push(q);
      }
    });
    return questions;
  },

  parseStudentCSV: (text: string) => {
    const allRows = api.parseCSV(text);
    if (allRows.length < 2) return [];
    return allRows.slice(1).filter(cols => cols.length >= 4).map(cols => ({
      id: 'S-' + Math.random().toString(36).substring(2, 9),
      username: cols[0],
      password: cols[1],
      name: cols[2],
      school: cols[3]
    }));
  }
};
