import { Question } from './db';

// Randomize array
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Auto-scorer
export const calculateScore = (
  questions: Question[],
  answers: Record<string, any>
) => {
  let correct = 0;
  let wrong = 0;

  questions.forEach(q => {
    const ans = answers[q.id];
    if (!ans) return; // Unanswered

    if (q.type === 'pilihan_ganda') {
      if (ans === q.correct_answer) {
        correct++;
      } else {
        wrong++;
      }
    } else if (q.type === 'pilihan_ganda_kompleks') {
      const selectedIndices = (ans as number[]) || [];
      const correctIndices = q.statements?.map((s, i) => s.isCorrect ? i : -1).filter(i => i !== -1) || [];
      
      // Must have exactly same indices
      const isCorrect = selectedIndices.length === correctIndices.length && 
                        selectedIndices.every(i => correctIndices.includes(i));
      
      if (isCorrect) {
        correct++;
      } else {
        wrong++;
      }
    } else if (q.type === 'multiple_choice_multiple_answer') {
      const statementAnswers = (ans as Record<number, string>) || {};
      const isCorrect = q.statements?.every((s, i) => statementAnswers[i] === s.correctAnswer);
      
      if (isCorrect) {
        correct++;
      } else {
        wrong++;
      }
    }
  });

  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  return { correct, wrong, score };
};

// Format time utility
export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Server time synchronization mock
let serverTimeOffset = 0;

export const syncServerTime = async () => {
  try {
    const start = Date.now();
    const res = await fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' });
    const end = Date.now();
    const dateHeader = res.headers.get('date');
    if (dateHeader) {
      const serverTime = new Date(dateHeader).getTime();
      const latency = (end - start) / 2;
      serverTimeOffset = serverTime + latency - end;
    }
  } catch (e) {
    console.error('Failed to sync server time, using local time');
  }
};

export const getServerTime = () => Date.now() + serverTimeOffset;
