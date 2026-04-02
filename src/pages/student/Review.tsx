import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, ExamToken, Question, ExamState, Result, AnswerDetail } from '../../lib/db';
import { calculateScore, formatTime } from '../../lib/utils';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const Review = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  
  const [examState, setExamState] = useState<ExamState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const loadReview = async () => {
    if (!auth.student) {
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    try {
        const state = await api.getExamState(auth.student.id);
        if (!state || state.submitted) {
          navigate('/login');
          return;
        }

        setExamState(state);
        
        const allQs = await api.getQuestions();
        const orderedQs = state.questionOrder.map(id => allQs.find(q => q.id === id)).filter(Boolean) as Question[];
        setQuestions(orderedQs);
    } catch (err) {
        console.error("Review load error:", err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReview();
  }, [auth.student]);

  useEffect(() => {
    if (!examState?.endTime) return;
    
    const calculateTime = () => {
      const remaining = Math.max(0, Math.floor((examState.endTime! - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && !isSubmitting) {
        submitExam();
      }
    };

    calculateTime();
    const timerId = setInterval(calculateTime, 1000);
    return () => clearInterval(timerId);
  }, [examState, isSubmitting]);

  const submitExam = async () => {
    if (!examState || !auth.student || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
        const { correct, wrong, score } = calculateScore(questions, examState.answers);
        
        // Build answer details for analysis
        const answerDetails: AnswerDetail[] = questions.map(q => {
          const studentAnswer = examState.answers[q.id];
          let correctAnswer: any;
          let isCorrect = false;

          if (q.type === 'pilihan_ganda') {
            correctAnswer = q.correct_answer;
            isCorrect = studentAnswer === q.correct_answer;
          } else if (q.type === 'pilihan_ganda_kompleks') {
            const selectedIndices = (studentAnswer as number[]) || [];
            const correctIndices = q.statements?.map((s, i) => s.isCorrect ? i : -1).filter(i => i !== -1) || [];
            correctAnswer = correctIndices;
            isCorrect = selectedIndices.length === correctIndices.length && 
                        selectedIndices.every(i => correctIndices.includes(i));
          } else if (q.type === 'multiple_choice_multiple_answer') {
            const statementAnswers = (studentAnswer as Record<number, string>) || {};
            correctAnswer = q.statements?.map(s => s.correctAnswer) || [];
            isCorrect = q.statements?.every((s, i) => statementAnswers[i] === s.correctAnswer);
          }

          return {
            questionId: q.id,
            question: q.question,
            type: q.type,
            studentAnswer: studentAnswer || null,
            correctAnswer,
            isCorrect,
            subject: q.subject
          };
        });
        
        const result: Result = {
          id: 'RES-' + Math.random().toString(36).substring(2, 9),
          studentId: auth.student.id,
          studentName: auth.student.name,
          school: auth.student.school,
          correct,
          wrong,
          score,
          timestamp: new Date().toISOString(),
          answerDetails,
          durationSeconds: examState.endTime ? Math.round((examState.endTime - (examState.startTime || 0)) / 1000) : 0
        };
        
        await api.addResult(result);
        await api.updateExamState(auth.student.id, { submitted: true });
        
        // Pass resultID securely
        navigate('/result', { state: { resultId: result.id }, replace: true });
    } catch (err) {
        console.error("Submit error:", err);
        alert("Failed to submit exam. Please check your connection and try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!examState || (isLoading && questions.length === 0)) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          <p className="text-xl font-bold text-primary">Preparing Review...</p>
       </div>
    );
  }

  const answeredCount = Object.keys(examState.answers).filter(k => examState.answers[k]).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-background pt-12 animate-fade-in">
      <div className="w-full max-w-3xl">
        <header className="flex justify-between items-center mb-8">
          <button className="btn btn-outline py-2 px-4 shadow-sm bg-surface" onClick={() => navigate('/exam')}>
            <ArrowLeft size={20} /> Back to Exam
          </button>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg border-2 shadow-sm ${timeLeft < 300 ? 'bg-danger/10 text-danger border-danger/30 animate-pulse' : 'bg-surface border-border text-text-main'}`}>
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>
        </header>

        <div className="card text-center mb-8 border-2 border-border/50">
          <h2 className="text-3xl text-primary font-bold mb-2">Review Your Answers</h2>
          <p className="text-text-muted text-lg">Are you ready to submit your exam?</p>
          
          <div className="flex justify-center gap-8 mt-8 pb-4 border-b border-border/50">
            <div className="text-center">
              <span className="block text-4xl font-black text-secondary">{answeredCount}</span>
              <span className="text-sm font-bold text-text-muted uppercase tracking-wider mt-1 block">Answered</span>
            </div>
            <div className="text-center">
              <span className={`block text-4xl font-black ${unansweredCount > 0 ? 'text-danger' : 'text-text-main'}`}>
                {unansweredCount}
              </span>
              <span className="text-sm font-bold text-text-muted uppercase tracking-wider mt-1 block">Unanswered</span>
            </div>
          </div>
          
          {unansweredCount > 0 && (
            <div className="bg-warning/10 text-warning p-4 rounded-lg mt-6 flex items-start gap-3 text-left">
              <AlertTriangle className="flex-shrink-0 mt-1" />
              <div>
                <strong className="block mb-1 text-lg">You have unanswered questions!</strong>
                <span className="font-medium">Are you sure you want to finish the exam without answering them? They will be marked as wrong.</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 mb-10 card bg-surface/50 border-none shadow-sm">
          {questions.map((q, idx) => {
            const ans = examState.answers[q.id];
            const isDoubtful = examState.doubt && examState.doubt[q.id];
            
            let btnClasses = "flex flex-col items-center justify-center p-2 rounded-lg border-2 hover:scale-105 transition-transform cursor-pointer ";
            if (isDoubtful) btnClasses += "border-warning bg-warning";
            else if (ans) btnClasses += "border-secondary bg-secondary";
            else btnClasses += "border-danger/40 bg-background hover:border-danger";
            
            return (
              <button 
                key={q.id}
                onClick={() => navigate('/exam')}
                className={btnClasses}
                title="Click to jump to this question"
              >
                <span className={`text-xs font-bold mb-1 ${ans || isDoubtful ? 'text-white/80' : 'text-text-muted'}`}>{idx + 1}</span>
                <span className={`font-black text-lg ${ans || isDoubtful ? 'text-white' : 'text-danger'}`}>
                  {ans 
                    ? (typeof ans === 'string' ? ans : '✔') 
                    : '-'}
                </span>
              </button>
            )
          })}
        </div>
        
        <div className="flex justify-center pb-12">
          <button 
            onClick={submitExam} 
            disabled={isSubmitting}
            className="btn btn-secondary text-xl py-4 px-12 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            <CheckCircle size={28} /> {isSubmitting ? 'Submitting...' : 'Submit Final Answers'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Review;
