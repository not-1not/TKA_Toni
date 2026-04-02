import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, Result as ResultType, Question } from '../../lib/db';
import { Award, LogOut, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { AnswerAnalysis } from '../../components/AnswerAnalysis';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, auth } = useAuth();
  
  const [result, setResult] = useState<ResultType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      const resultId = location.state?.resultId;
      if (!resultId && !auth.student?.id) { 
        navigate('/login');
        return;
      }

      try {
          if (resultId) {
            const results = await api.getResults();
            const found = results.find(r => r.id === resultId);
            if (found) setResult(found);
            else navigate('/login');
          } else {
            const thisStudent = await api.getResultsByStudent(auth.student?.id || '');
            if (thisStudent.length > 0) {
              setResult(thisStudent[thisStudent.length - 1]);
            } else {
              navigate('/login'); 
            }
          }
          
          // Fetch all questions for display
          const allQuestions = await api.getQuestions();
          setQuestions(allQuestions);
      } catch (err) {
          console.error("Result load error:", err);
          navigate('/login');
      }
    };
    
    fetchResult();
  }, [location, auth.student, navigate]);

  if (!result) return <div className="p-8 text-center animate-pulse font-bold text-xl text-primary mt-12">Loading Results...</div>;

  const totalQs = result.correct + result.wrong;

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background shapes for kid-friendly aesthetic */}
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-secondary/10 rounded-full blur-3xl z-0"></div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Summary Card */}
        {!showAnalysis ? (
          <div className="card max-w-lg mx-auto text-center p-8 border-4 border-white shadow-2xl glass mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary text-white mb-6 shadow-lg shadow-primary/30 transform hover:scale-110 transition-transform">
              <Award size={48} />
            </div>
            
            <h2 className="text-3xl font-black text-text-main mb-2">Ujian Selesai!</h2>
            <p className="text-text-muted text-lg font-medium mb-8">Bagus sekali, {result.studentName}!</p>
            
            <div className="bg-background rounded-2xl p-6 mb-8 border border-border shadow-inner">
              <div className="text-sm font-bold text-text-muted uppercase tracking-widest mb-2">Nilai Akhir</div>
              <div className="text-7xl font-black text-primary drop-shadow-sm mb-6">{result.score}</div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
                <div className="flex flex-col items-center p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                  <CheckCircle className="text-secondary mb-2" size={32} />
                  <div className="text-3xl font-black text-text-main">{result.correct}</div>
                  <div className="text-xs font-bold text-text-muted uppercase mt-1">Benar</div>
                </div>
                
                <div className="flex flex-col items-center p-3 rounded-xl bg-danger/10 border border-danger/20">
                  <XCircle className="text-danger mb-2" size={32} />
                  <div className="text-3xl font-black text-text-main">{result.wrong}</div>
                  <div className="text-xs font-bold text-text-muted uppercase mt-1">Salah</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button 
                onClick={() => setShowAnalysis(true)}
                className="btn btn-secondary w-full py-3 px-8 text-lg"
              >
                <BarChart3 size={24} /> Lihat Analisis Jawaban
              </button>
              
              <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }} 
                className="btn btn-outline hover:bg-surface w-full py-3 px-8 text-lg"
              >
                <LogOut size={24} /> Logout
              </button>
            </div>
          </div>
        ) : (
          /* Analysis View */
          <div className="animate-fade-in">
            <div className="card mb-6 border-2 border-border/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl text-primary font-bold">Analisis Jawaban</h2>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-text-muted hover:text-text-main transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-text-muted text-lg">
                Periksa jawaban Anda untuk setiap soal
              </p>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <div className="text-sm font-bold text-text-muted uppercase mb-1">Total Soal</div>
                  <div className="text-3xl font-black text-primary">{totalQs}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-text-muted uppercase mb-1">Tingkat Keberhasilan</div>
                  <div className="text-3xl font-black text-secondary">{result.score}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-text-muted uppercase mb-1">Durasi Ujian</div>
                  <div className="text-3xl font-black text-primary">
                    {result.durationSeconds ? `${Math.floor(result.durationSeconds / 60)}m` : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Analysis */}
            {result.answerDetails && result.answerDetails.length > 0 && (
              <div className="card border-2 border-border/50 p-6">
                <AnswerAnalysis answerDetails={result.answerDetails} allQuestions={questions} />
              </div>
            )}

            {/* Back Button */}
            <div className="flex justify-center gap-3 mt-8 pb-8">
              <button 
                onClick={() => setShowAnalysis(false)}
                className="btn btn-outline py-3 px-8"
              >
                ← Kembali
              </button>
              
              <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }} 
                className="btn btn-secondary py-3 px-8"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
