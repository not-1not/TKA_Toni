// src/lib/db.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Supabase configuration missing!');
  console.error('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

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
  package?: string; // Question package group
};

export type ExamToken = {
  id: string;
  token: string;
  durationMinutes: number;
  questionCount: number;
  subject?: string;
  package?: string;
  active: boolean;
};

export type Answer = {
  studentId: string;
  questionId: string;
  selectedAnswer: any; // Flexible answer type
};

export type AnswerDetail = {
  questionId: string;
  question: string;
  type: QuestionType;
  studentAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  subject: string;
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
  answerDetails?: AnswerDetail[]; // Detailed answer analysis
  durationSeconds?: number; // Exam duration in seconds
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

// --- Mappers ---
const mapQuestionFromDb = (q: any): Question => {
  let qTypeRaw = (q.type || '').toUpperCase();
  let qType: QuestionType = 'pilihan_ganda';

  if (qTypeRaw === 'MC' || qTypeRaw === 'PILIHAN_GANDA') qType = 'pilihan_ganda';
  else if (qTypeRaw === 'MCMA' || qTypeRaw === 'PILIHAN_GANDA_KOMPLEKS') qType = 'pilihan_ganda_kompleks';
  else if (qTypeRaw === 'TF' || qTypeRaw === 'MULTIPLE_CHOICE_MULTIPLE_ANSWER') qType = 'multiple_choice_multiple_answer';

  const res: Question = {
    id: q.id,
    subject: q.subject || 'Umum',
    package: q.package || '',
    question: q.question,
    type: qType,
    image: q.image || ''
  };

  const optionsArray = q.options || [];

  if (qType === 'pilihan_ganda') {
    res.option_a = optionsArray[0] || '';
    res.option_b = optionsArray[1] || '';
    res.option_c = optionsArray[2] || '';
    res.option_d = optionsArray[3] || '';
    res.correct_answer = (q.answer || 'A') as any;
  } else if (qType === 'pilihan_ganda_kompleks') {
    // For PK: answer is like "A,C" or "A, C" (letters of correct statements)
    const correctAnswers = (q.answer || '').toUpperCase().split(',').map((s: string) => s.trim());
    res.statements = optionsArray.map((opt: any, idx: number) => {
      const letter = String.fromCharCode(65 + idx);
      const text = typeof opt === 'string' ? opt : (opt?.statement || '');
      const isCorrect = correctAnswers.includes(letter);
      return { text, isCorrect };
    });
  } else if (qType === 'multiple_choice_multiple_answer') {
    // For MCMA: answer is like "Sesuai,Tidak Sesuai,Sesuai" 
    const answerArray = (q.answer || '')
      .split(',')
      .map((a: string) => a.trim())
      .filter(a => a); // Remove empty strings
    
    // Pad with defaults if needed
    while (answerArray.length < optionsArray.length) {
      answerArray.push('Sesuai');
    }
    
    res.statements = optionsArray.map((opt: any, idx: number) => {
      const text = typeof opt === 'string' ? opt : (opt?.statement || '');
      const correctAnswer = answerArray[idx] || 'Sesuai';
      return { text, correctAnswer };
    });
  }
  return res;
};

export const api = {
  // --- Students ---
  getStudents: async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) throw new Error(`Failed to fetch students: ${error.message}`);
    return data as Student[];
  },
  addStudent: async (student: Student) => {
    const { error } = await supabase.from('students').insert([student]);
    if (error) throw new Error(`Failed to add student: ${error.message}`);
  },
  updateStudent: async (student: Student) => {
    const { error } = await supabase.from('students').update(student).eq('id', student.id);
    if (error) throw new Error(`Failed to update student: ${error.message}`);
  },
  deleteStudent: async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete student: ${error.message}`);
  },
  setStudents: async (ss: Student[]) => {
    const { error } = await supabase.from('students').upsert(ss);
    if (error) throw new Error(`Failed to save students: ${error.message}`);
  },
  deleteStudents: async (ids: string[]) => {
    const { error } = await supabase.from('students').delete().in('id', ids);
    if (error) throw new Error(`Failed to delete students: ${error.message}`);
  },

  // --- Tokens ---
  getTokens: async () => {
    const { data, error } = await supabase.from('tokens').select('*');
    if (error) throw new Error(`Failed to fetch tokens: ${error.message}`);
    return (data || []).map(t => ({
      ...t,
      durationMinutes: t.durationMinutes,
      questionCount: t.questionCount
    })) as ExamToken[];
  },
  addToken: async (token: ExamToken) => {
    const payload: any = {
      ...token,
      package: token.package || ''
    };
    let result = await supabase.from('tokens').insert([payload]);
    if (result.error) {
      const message = result.error.message || '';
      if (message.toLowerCase().includes("could not find the 'package' column")) {
        // Fallback: remove package field and retry
        delete payload.package;
        result = await supabase.from('tokens').insert([payload]);
        if (result.error) throw new Error(`Failed to add token (fallback): ${result.error.message}`);
        return;
      }
      throw new Error(`Failed to add token: ${message}`);
    }
  },
  setTokens: async (ts: ExamToken[]) => {
    const payloads = ts.map(t => ({
      ...t,
      package: t.package || ''
    }));
    let result = await supabase.from('tokens').upsert(payloads);
    if (result.error) {
      const message = result.error.message || '';
      if (message.toLowerCase().includes("could not find the 'package' column")) {
        // Fallback: remove package field and retry
        const cleanPayloads = payloads.map(p => {
          const cp = { ...p };
          delete cp.package;
          return cp;
        });
        result = await supabase.from('tokens').upsert(cleanPayloads);
        if (result.error) throw new Error(`Failed to save tokens (fallback): ${result.error.message}`);
        return;
      }
      throw new Error(`Failed to save tokens: ${message}`);
    }
  },
  getTokenByStr: async (tokenStr: string) => {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .ilike('token', tokenStr)
      .eq('active', true)
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch token: ${error.message}`); // PGRST116 is "no rows returned"
    return data as ExamToken | null;
  },

  // --- Questions ---
  getQuestions: async () => {
    const { data, error } = await supabase.from('questions').select('*');
    if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
    return (data || []).map(mapQuestionFromDb);
  },
  addQuestion: async (q: Question) => {
    // Basic mapping for insertion
    const payload: any = {
      id: q.id,
      subject: q.subject,
      question: q.question,
      type: q.type === 'pilihan_ganda' ? 'MC' : q.type === 'pilihan_ganda_kompleks' ? 'MCMA' : 'TF',
      image: q.image || ''
    };
    if (q.package) payload.package = q.package;

    if (q.type === 'pilihan_ganda') {
      payload.options = [q.option_a, q.option_b, q.option_c, q.option_d];
      payload.answer = q.correct_answer;
    } else {
      payload.options = q.statements?.map(s => s.text) || [];
      if (q.type === 'pilihan_ganda_kompleks') {
        payload.answer = q.statements?.map((s, i) => s.isCorrect ? String.fromCharCode(65 + i) : null).filter(Boolean).join(',');
      } else if (q.type === 'multiple_choice_multiple_answer') {
        payload.answer = q.statements?.map(s => s.correctAnswer).join(',');
      }
    }

    let result = await supabase.from('questions').insert([payload]);
    if (result.error) {
      const message = result.error.message || '';
      if (message.toLowerCase().includes("could not find the 'package' column")) {
        delete payload.package;
        result = await supabase.from('questions').insert([payload]);
        if (result.error) throw new Error(`Failed to add question (fallback): ${result.error.message}`);
        return;
      }
      throw new Error(`Failed to add question: ${message}`);
    }
  },
  updateQuestion: async (q: Question) => {
    const payload: any = {
      subject: q.subject,
      question: q.question,
      type: q.type === 'pilihan_ganda' ? 'MC' : q.type === 'pilihan_ganda_kompleks' ? 'MCMA' : 'TF',
      image: q.image || ''
    };
    if (q.package) payload.package = q.package;

    if (q.type === 'pilihan_ganda') {
      payload.options = [q.option_a, q.option_b, q.option_c, q.option_d];
      payload.answer = q.correct_answer;
    } else {
      payload.options = q.statements?.map(s => s.text) || [];
      if (q.type === 'pilihan_ganda_kompleks') {
        payload.answer = q.statements?.map((s, i) => s.isCorrect ? String.fromCharCode(65 + i) : null).filter(Boolean).join(',');
      } else if (q.type === 'multiple_choice_multiple_answer') {
        payload.answer = q.statements?.map(s => s.correctAnswer).join(',');
      }
    }

    const { error } = await supabase.from('questions').update(payload).eq('id', q.id);
    if (error) {
      const message = error.message || '';
      if (message.toLowerCase().includes("could not find the 'package' column")) {
        delete payload.package;
        const { error: fallbackError } = await supabase.from('questions').update(payload).eq('id', q.id);
        if (fallbackError) throw new Error(`Failed to update question (fallback): ${fallbackError.message}`);
        return;
      }
      throw new Error(`Failed to update question: ${message}`);
    }
  },
  deleteQuestion: async (id: string) => {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete question: ${error.message}`);
  },
  deleteQuestions: async (ids: string[]) => {
    const { error } = await supabase.from('questions').delete().in('id', ids);
    if (error) throw new Error(`Failed to delete questions: ${error.message}`);
  },
  setQuestions: async (qs: Question[]) => {
    const payloads = qs.map(q => {
      const payload: any = {
        id: q.id,
        subject: q.subject,
        question: q.question,
        type: q.type === 'pilihan_ganda' ? 'MC' : q.type === 'pilihan_ganda_kompleks' ? 'MCMA' : 'TF',
        image: q.image || ''
      };
      if (q.package) payload.package = q.package;
      if (q.type === 'pilihan_ganda') {
        payload.options = [q.option_a, q.option_b, q.option_c, q.option_d];
        payload.answer = q.correct_answer;
      } else {
        payload.options = q.statements?.map(s => s.text) || [];
        if (q.type === 'pilihan_ganda_kompleks') {
          payload.answer = q.statements?.map((s, i) => s.isCorrect ? String.fromCharCode(65 + i) : null).filter(Boolean).join(',');
        } else if (q.type === 'multiple_choice_multiple_answer') {
          payload.answer = q.statements?.map(s => s.correctAnswer).join(',');
        }
      }
      return payload;
    });
    let upsertResult = await supabase.from('questions').upsert(payloads);
    if (upsertResult.error) {
      const message = upsertResult.error.message || '';
      if (message.toLowerCase().includes("could not find the 'package' column")) {
        const cleanPayloads = payloads.map(p => {
          const cp = { ...p };
          delete cp.package;
          return cp;
        });
        upsertResult = await supabase.from('questions').upsert(cleanPayloads);
        if (upsertResult.error) throw new Error(`Failed to save questions (fallback): ${upsertResult.error.message}`);
        return;
      }
      throw new Error(`Failed to save questions: ${message}`);
    }
  },

  // --- Results ---
  getResults: async () => {
    const { data, error } = await supabase.from('results').select('*').order('timestamp', { ascending: false });
    if (error) throw new Error(`Failed to fetch results: ${error.message}`);
    return (data || []) as Result[];
  },
  addResult: async (res: Result) => {
    const { error } = await supabase.from('results').insert([res]);
    if (error) throw new Error(`Failed to add result: ${error.message}`);
  },
  updateResult: async (res: Result) => {
    const { error } = await supabase.from('results').update(res).eq('id', res.id);
    if (error) throw new Error(`Failed to update result: ${error.message}`);
  },
  deleteResult: async (id: string) => {
    const { error } = await supabase.from('results').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete result: ${error.message}`);
  },

  // --- Exam State (Concurrent Sessions) ---
  getAllExamStates: async () => {
    const { data, error } = await supabase.from('exam_states').select('*');
    if (error) throw new Error(`Failed to fetch exam states: ${error.message}`);
    const result: Record<string, ExamState> = {};
    (data || []).forEach(s => {
      result[s.studentId] = s;
    });
    return result;
  },
  getExamState: async (studentId: string) => {
    const { data, error } = await supabase.from('exam_states').select('*').eq('studentId', studentId).single();
    if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch exam state: ${error.message}`);
    return data as ExamState | null;
  },
  setExamState: async (state: ExamState) => {
    const { error } = await supabase.from('exam_states').upsert(state);
    if (error) throw new Error(`Failed to save exam state: ${error.message}`);
  },
  updateExamState: async (studentId: string, update: Partial<ExamState>) => {
    const { error } = await supabase.from('exam_states').update(update).eq('studentId', studentId);
    if (error) throw new Error(`Failed to update exam state: ${error.message}`);
  },
  deleteExamState: async (studentId: string) => {
    const { error } = await supabase.from('exam_states').delete().eq('studentId', studentId);
    if (error) throw new Error(`Failed to delete exam state: ${error.message}`);
  },

  // --- Helpers ---
  getResultsByStudent: async (studentId: string) => {
    const { data, error } = await supabase.from('results').select('*').eq('studentId', studentId);
    if (error) throw new Error(`Failed to fetch student results: ${error.message}`);
    return (data || []) as Result[];
  },
  clearAll: async () => {
    // DANGEROUS: Usually not used in real Supabase production except for dev
    console.warn("clearAll called - this implemention only clears localStorage. Supabase must be managed via dashboard or migration scripts.");
    localStorage.clear();
  },

  // --- Database Initialization (Empty for full online) ---
  initializeDatabase: async () => {
    // Nothing to seed locally anymore
    console.log('Using Supabase as primary engine.');
  },

  resetDatabase: async () => {
    // In full online mode, "reset" should probably just clear local storage session and reload
    localStorage.clear();
    window.location.reload();
  },

  // --- CSV Parsers ---
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
      if (cols.length >= 4) {
        // Format: package|subject|question|type|[type-specific fields]|image
        // 0: package, 1: subject, 2: question, 3: type
        // 4-8: option_a-d, correct_answer (for PG)
        // 9-15: s1_text, s1_answer, s2_text, s2_answer, s3_text, s3_answer, image
        
        const pkg = cols[0]?.trim() || 'Default';
        const subj = cols[1]?.trim() || 'Umum';
        const qText = cols[2]?.trim() || '';
        const typeRaw = (cols[3]?.trim() || 'PG').toUpperCase();

        let qType: any = 'pilihan_ganda';
        if (typeRaw === 'PG' || typeRaw === 'MC' || typeRaw === 'PILIHAN_GANDA') qType = 'pilihan_ganda';
        else if (typeRaw === 'PK' || typeRaw === 'MCMA_PK' || typeRaw === 'PILIHAN_GANDA_KOMPLEKS') qType = 'pilihan_ganda_kompleks';
        else if (typeRaw === 'MCMA' || typeRaw === 'TF' || typeRaw === 'MULTIPLE_CHOICE_MULTIPLE_ANSWER') qType = 'multiple_choice_multiple_answer';

        const q: Question = {
          id: 'Q-' + Math.random().toString(36).substring(2, 9),
          package: pkg,
          subject: subj,
          question: qText,
          type: qType,
          image: cols[15]?.trim() || '',
        };

        if (qType === 'pilihan_ganda') {
          // PG: option_a(4), option_b(5), option_c(6), option_d(7), correct_answer(8)
          q.option_a = cols[4]?.trim() || '';
          q.option_b = cols[5]?.trim() || '';
          q.option_c = cols[6]?.trim() || '';
          q.option_d = cols[7]?.trim() || '';
          q.correct_answer = (cols[8]?.trim() || 'A').toUpperCase() as any;
        } else {
          // PK and MCMA both use: s1_text(9), s1_answer(10), s2_text(11), s2_answer(12), s3_text(13), s3_answer(14)
          const s1_text = cols[9]?.trim();
          const s1_ans = cols[10]?.trim()?.toUpperCase();
          const s2_text = cols[11]?.trim();
          const s2_ans = cols[12]?.trim()?.toUpperCase();
          const s3_text = cols[13]?.trim();
          const s3_ans = cols[14]?.trim()?.toUpperCase();

          if (qType === 'pilihan_ganda_kompleks') {
            q.statements = [
              s1_text ? { text: s1_text, isCorrect: s1_ans === 'TRUE' || s1_ans === '1' } : { text: '', isCorrect: false },
              s2_text ? { text: s2_text, isCorrect: s2_ans === 'TRUE' || s2_ans === '1' } : { text: '', isCorrect: false },
              s3_text ? { text: s3_text, isCorrect: s3_ans === 'TRUE' || s3_ans === '1' } : { text: '', isCorrect: false },
            ];
          } else if (qType === 'multiple_choice_multiple_answer') {
            q.statements = [
              s1_text ? { text: s1_text, correctAnswer: s1_ans === 'TRUE' || s1_ans === 'S' ? 'Sesuai' : 'Tidak Sesuai' } : { text: '', correctAnswer: 'Tidak Sesuai' },
              s2_text ? { text: s2_text, correctAnswer: s2_ans === 'TRUE' || s2_ans === 'S' ? 'Sesuai' : 'Tidak Sesuai' } : { text: '', correctAnswer: 'Tidak Sesuai' },
              s3_text ? { text: s3_text, correctAnswer: s3_ans === 'TRUE' || s3_ans === 'S' ? 'Sesuai' : 'Tidak Sesuai' } : { text: '', correctAnswer: 'Tidak Sesuai' },
            ];
          }
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
  },

  // --- JSON Parsers ---
  parseStudentJSON: (text: string) => {
    try {
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      return items.map((item: any) => ({
        id: item.id || 'S-' + Math.random().toString(36).substring(2, 9),
        username: item.username || item.name?.toLowerCase().replace(/\s+/g, '') || 'user' + Math.random().toString(36).substring(2, 5),
        password: item.password || '123456',
        name: item.name || 'Unknown',
        school: item.school || 'Unknown'
      }));
    } catch (e) {
      throw new Error('Format JSON tidak valid');
    }
  },

  parseQuestionJSON: (text: string) => {
    try {
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      return items.map((item: any) => {
        // Map from JSON fields to Question type
        // This accepts both our internal format and a simplified one
        const qType: QuestionType = item.type || 'pilihan_ganda';
        const q: Question = {
          id: item.id || 'Q-' + Math.random().toString(36).substring(2, 9),
          package: item.package || 'DEFAULT',
          subject: item.subject || 'Umum',
          question: item.question || '',
          type: qType,
          image: item.image || '',
        };

        if (qType === 'pilihan_ganda') {
          q.option_a = item.option_a || '';
          q.option_b = item.option_b || '';
          q.option_c = item.option_c || '';
          q.option_d = item.option_d || '';
          q.correct_answer = (item.correct_answer || 'A').toUpperCase() as any;
        } else {
          q.statements = item.statements || [];
        }
        return q;
      });
    } catch (e) {
      throw new Error('Format JSON tidak valid');
    }
  },

  // --- Quick Paste Parsers (Beginner Friendly) ---
  parseStudentQuickPaste: (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      // Split by common delimiters: comma, pipe, tab
      const parts = line.split(/[,|\t]+/).map(p => p.trim());
      const name = parts[0] || 'Unknown';
      const school = parts[1] || 'Umum';
      const username = parts[2] || name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 100);
      const password = parts[3] || '123456';

      return {
        id: 'S-' + Math.random().toString(36).substring(2, 9),
        username,
        password,
        name,
        school
      };
    });
  },

  parseQuestionQuickPaste: (text: string) => {
    // Format sesuai standard: package|subject|question|type|[type-specific]|image
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      const parts = line.split(/[,|\t]+/).map(p => p.trim());
      if (parts.length < 4) return null;

      const pkg = parts[0] || 'Default';
      const subj = parts[1] || 'Umum';
      const qText = parts[2] || '';
      const typeRaw = (parts[3] || 'PG').toUpperCase();

      let qType: any = 'pilihan_ganda';
      if (typeRaw === 'PG' || typeRaw === 'MC') qType = 'pilihan_ganda';
      else if (typeRaw === 'PK' || typeRaw === 'MCMA_PK') qType = 'pilihan_ganda_kompleks';
      else if (typeRaw === 'MCMA' || typeRaw === 'TF') qType = 'multiple_choice_multiple_answer';

      const q: Question = {
        id: 'Q-' + Math.random().toString(36).substring(2, 9),
        package: pkg,
        subject: subj,
        question: qText,
        type: qType,
        image: parts[15]?.trim() || ''
      };

      if (qType === 'pilihan_ganda') {
        // PG: package|subject|question|PG|optA|optB|optC|optD|answer|...|image
        q.option_a = parts[4] || '';
        q.option_b = parts[5] || '';
        q.option_c = parts[6] || '';
        q.option_d = parts[7] || '';
        q.correct_answer = (parts[8] || 'A').toUpperCase() as any;
      } else {
        // PK and MCMA: package|subject|question|type||||||s1_text|s1_ans|s2_text|s2_ans|s3_text|s3_ans|image
        const s1_text = parts[9]?.trim();
        const s1_ans = parts[10]?.trim()?.toUpperCase();
        const s2_text = parts[11]?.trim();
        const s2_ans = parts[12]?.trim()?.toUpperCase();
        const s3_text = parts[13]?.trim();
        const s3_ans = parts[14]?.trim()?.toUpperCase();

        if (qType === 'pilihan_ganda_kompleks') {
          q.statements = [
            s1_text ? { text: s1_text, isCorrect: s1_ans === 'TRUE' || s1_ans === '1' } : { text: '', isCorrect: false },
            s2_text ? { text: s2_text, isCorrect: s2_ans === 'TRUE' || s2_ans === '1' } : { text: '', isCorrect: false },
            s3_text ? { text: s3_text, isCorrect: s3_ans === 'TRUE' || s3_ans === '1' } : { text: '', isCorrect: false },
          ];
        } else if (qType === 'multiple_choice_multiple_answer') {
          q.statements = [
            s1_text ? { text: s1_text, correctAnswer: s1_ans === 'TRUE' || s1_ans === 'S' ? 'Sesuai' : 'Tidak Sesuai' } : { text: '', correctAnswer: 'Tidak Sesuai' },
            s2_text ? { text: s2_text, correctAnswer: s2_ans === 'TRUE' || s2_ans === 'S' ? 'Sesuai' : 'Tidak Sesuai' } : { text: '', correctAnswer: 'Tidak Sesuai' },
            s3_text ? { text: s3_text, correctAnswer: s3_ans === 'TRUE' || s3_ans === 'S' ? 'Sesuai' : 'Tidak Sesuai' } : { text: '', correctAnswer: 'Tidak Sesuai' },
          ];
        }
      }

      return q;
    }).filter(Boolean) as Question[];
  }
};

