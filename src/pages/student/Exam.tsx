import React, { useState, useEffect } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, ExamToken, Question, ExamState } from '../../lib/db';
import { formatTime, getServerTime } from '../../lib/utils';
import { LogOut, User, Building, AlertTriangle, Type, Plus, Minus } from 'lucide-react';

const Exam = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  
  const [examState, setExamState] = useState<ExamState | null>(null);
  const [tokenInfo, setTokenInfo] = useState<ExamToken | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fontSize, setFontSize] = useState(20);

  // useBlocker to warn on leaving
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !examState?.submitted &&
      currentLocation.pathname !== nextLocation.pathname &&
      nextLocation.pathname !== '/review'
  );

  // Initialize and load state
  useEffect(() => {
    if (!auth.student) {
      navigate('/login');
      return;
    }
    const state = api.getExamState(auth.student.id);
    if (!state || state.submitted || state.studentId !== auth.student.id) {
      navigate('/instructions');
      return;
    }

    const token = api.getTokens().find(t => t.id === state.tokenId);
    if (!token) {
      navigate('/instructions');
      return;
    }

    setTokenInfo(token);

    // Initialize timers if not set
    let activeState = { ...state };
    if (!activeState.startTime) {
      activeState.startTime = getServerTime();
      activeState.endTime = activeState.startTime + (token.durationMinutes * 60 * 1000);
      if (!activeState.doubt) activeState.doubt = {};
      api.setExamState(activeState);
    }
    setExamState(activeState);
    
    // Load question data
    const allQs = api.getQuestions();
    const orderedQs = activeState.questionOrder.map(id => allQs.find(q => q.id === id)).filter(Boolean) as Question[];
    setQuestions(orderedQs);
  }, [auth.student, navigate]);

  // Prevent refresh warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Timer logic
  useEffect(() => {
    if (!examState?.endTime) return;
    
    const calculateTime = () => {
      const remaining = Math.max(0, Math.floor((examState.endTime! - getServerTime()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        handleAutoSubmit();
      }
    };

    calculateTime();
    const timerId = setInterval(calculateTime, 1000);
    return () => clearInterval(timerId);
  }, [examState?.endTime]);

  const handleAutoSubmit = () => {
    navigate('/review');
  };

  const handleSelectAnswer = (ans: any) => {
    if (!examState || !questions[currentIndex]) return;
    
    const qId = questions[currentIndex].id;
    const newAnswers = { ...examState.answers, [qId]: ans };
    const newState = { ...examState, answers: newAnswers };
    
    setExamState(newState);
    api.updateExamState(auth.student!.id, { answers: newAnswers });
  };

  const handleComplexToggle = (index: number) => {
    if (!examState || !questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    const currentAns = (examState.answers[qId] as number[]) || [];
    
    let newAns: number[];
    if (currentAns.includes(index)) {
      newAns = currentAns.filter(i => i !== index);
    } else {
      // Limit to 2 choices as requested
      if (currentAns.length >= 2) {
        newAns = [currentAns[1], index];
      } else {
        newAns = [...currentAns, index];
      }
    }
    
    handleSelectAnswer(newAns);
  };

  const handleStatementCheck = (index: number, val: string) => {
    if (!examState || !questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    const currentAns = (examState.answers[qId] as Record<number, string>) || {};
    
    const newAns = { ...currentAns, [index]: val };
    handleSelectAnswer(newAns);
  };
  
  const toggleDoubt = () => {
    if (!examState || !questions[currentIndex]) return;
    
    const qId = questions[currentIndex].id;
    const newDoubt = { ...examState.doubt, [qId]: !examState.doubt[qId] };
    const newState = { ...examState, doubt: newDoubt };
    
    setExamState(newState);
    api.updateExamState(auth.student!.id, { doubt: newDoubt });
  }

  if (!examState || !tokenInfo || questions.length === 0) {
    return <div className="p-8 text-center text-xl font-bold">Loading CBT Environment...</div>;
  }

  const currentQ = questions[currentIndex];
  const selectedAns = examState.answers[currentQ.id];
  const isDoubt = examState.doubt[currentQ.id] || false;

  const renderOptions = () => {
    if (currentQ.type === 'pilihan_ganda') {
      return (
        <div className="grid gap-3 max-w-4xl">
          {(examState.optionOrder[currentQ.id] || ['A', 'B', 'C', 'D']).map((opt) => {
            const isSelected = selectedAns === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelectAnswer(opt)}
                className={`flex items-center text-left p-4 rounded-xl border-2 transition-all duration-200 text-lg md:text-xl group ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                    : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-6 font-bold border-2 transition-colors ${
                  isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-transparent border-neutral-300 text-neutral-500 group-hover:border-blue-300'
                }`}>
                  {opt}
                </div>
                <div className={`flex-1 font-medium transition-colors ${isSelected ? 'text-blue-900' : 'text-neutral-700'}`}>
                  {currentQ[`option_${opt.toLowerCase()}` as keyof Question] as string}
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentQ.type === 'pilihan_ganda_kompleks') {
      const selectedIndices = (selectedAns as number[]) || [];
      return (
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm font-bold text-blue-600 bg-blue-50 p-2 rounded inline-block mb-2 italic">
            Pilihlah {currentQ.statements?.filter(s => s.isCorrect).length || 0} pernyataan yang benar berdasarkan teks di atas.
          </p>
          {currentQ.statements?.map((s, i) => {
            const isSelected = selectedIndices.includes(i);
            return (
              <button
                key={i}
                onClick={() => handleComplexToggle(i)}
                className={`w-full flex items-start text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                    : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                }`}
              >
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 mr-4 flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-neutral-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <div className="flex-1 font-medium text-lg leading-snug">
                  {s.text}
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentQ.type === 'multiple_choice_multiple_answer') {
      const statementAnswers = (selectedAns as Record<number, string>) || {};
      return (
        <div className="space-y-6 max-w-5xl">
          {currentQ.statements?.map((s, i) => {
            // Improved pair detection logic
            const getPair = (ans: string) => {
              if (ans === 'Benar' || ans === 'Salah') return ['Benar', 'Salah'];
              if (ans === 'Sesuai' || ans === 'Tidak Sesuai') return ['Sesuai', 'Tidak Sesuai'];
              if (ans === 'Tepat' || ans === 'Tidak Tepat') return ['Tepat', 'Tidak Tepat'];
              if (ans === 'Ya' || ans === 'Tidak') return ['Ya', 'Tidak'];
              if (ans === 'Mendukung' || ans === 'Tidak Mendukung') return ['Mendukung', 'Tidak Mendukung'];
              return ['Sesuai', 'Tidak Sesuai'];
            };
            const pair = getPair(s.correctAnswer || '');

            return (
              <div key={i} className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
                <div className="text-lg font-bold text-neutral-800 mb-4">{i + 1}. {s.text}</div>
                <div className="flex gap-4">
                  {pair.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleStatementCheck(i, opt)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all ${
                        statementAnswers[i] === opt
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:border-blue-300 mt-0'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-neutral-100 text-neutral-800 font-sans overflow-hidden">
      
      {/* CBT Header (Blue) */}
      <header className="bg-blue-600 text-white shadow-md z-10 p-2 md:p-0">
        <div className="max-w-[1400px] mx-auto flex justify-between items-stretch">
          <div className="flex items-center gap-4 px-4 py-3">
             <div className="hidden md:flex flex-col border-r border-blue-400/50 pr-6 mr-2">
               <span className="font-bold text-xl uppercase tracking-widest">TKA CBT</span>
               <span className="text-blue-200 text-xs">Ujian Berbasis Komputer</span>
             </div>
             <div>
                <div className="font-bold flex items-center gap-2"><User size={16}/> {auth.student?.name}</div>
                <div className="text-sm text-blue-100 flex items-center gap-2"><Building size={14}/> {auth.student?.school}</div>
             </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-blue-800 h-full flex items-center px-4 md:px-8 shadow-inner">
              <div className="text-right">
                <div className="text-xs text-blue-300 uppercase font-bold">Sisa Waktu</div>
                <div className={`text-2xl font-black font-mono tracking-wider ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content CBT Layout */}
      <div className="flex flex-col md:flex-row flex-1 max-w-[1400px] mx-auto w-full gap-4 p-4 overflow-hidden relative">
        
        {/* Left Side: Question Area */}
        <main className="flex-1 flex flex-col bg-white rounded-xl shadow border border-neutral-200 overflow-hidden relative">
          
          {/* Question Header */}
          <div className="bg-neutral-100 border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
            <div className="text-lg font-bold text-neutral-700 flex items-center gap-3">
              SOAL NO <span className="text-2xl font-black bg-blue-100 text-blue-700 px-3 py-1 rounded inline-block min-w-[2rem] text-center">{currentIndex + 1}</span>
            </div>
            <div className="bg-neutral-200 text-neutral-600 px-3 py-1 rounded font-bold text-sm tracking-wider uppercase">
              {currentQ.subject}
            </div>
          </div>
          
          {/* Question Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="flex justify-end gap-2 mb-4 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
              <span className="text-xs font-bold text-neutral-400 uppercase flex items-center mr-2"><Type size={14} className="mr-1"/> Ukuran Teks</span>
              <button 
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="w-8 h-8 flex items-center justify-center bg-white border border-neutral-200 rounded hover:bg-neutral-100 text-neutral-600"
                title="Perkecil Teks"
              >
                <Minus size={16} />
              </button>
              <button 
                onClick={() => setFontSize(Math.min(40, fontSize + 2))}
                className="w-8 h-8 flex items-center justify-center bg-white border border-neutral-200 rounded hover:bg-neutral-100 text-neutral-600"
                title="Perbesar Teks"
              >
                <Plus size={16} />
              </button>
            </div>

            <div 
              className="mb-6 leading-relaxed font-medium text-neutral-800 whitespace-pre-wrap"
              style={{ fontSize: `${fontSize}px` }}
            >
              {currentQ.question}
            </div>

            {currentQ.image && (
              <div className="mb-8 rounded-2xl overflow-hidden border-2 border-neutral-200 bg-neutral-50 shadow-sm max-w-fit">
                <img 
                  src={currentQ.image} 
                  alt="Question material" 
                  className="max-h-[400px] w-auto object-contain block mx-auto"
                />
              </div>
            )}

            {renderOptions()}
          </div>
          
          {/* Question Footer Controls */}
          <div className="bg-neutral-50 border-t border-neutral-200 p-4 md:p-6 flex flex-wrap justify-between items-center gap-4">
            <button 
              className="px-6 md:px-8 py-3 rounded text-neutral-700 font-bold border-2 border-neutral-300 bg-white hover:bg-neutral-100 transition-colors disabled:opacity-50 text-sm md:text-base uppercase"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              Soal Sebelumnya
            </button>
            
            <button 
              className={`px-6 md:px-8 py-3 rounded font-bold border-2 transition-colors flex items-center gap-2 text-sm md:text-base uppercase ${
                isDoubt 
                  ? 'border-yellow-500 bg-yellow-500 text-white' 
                  : 'border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
              }`}
              onClick={toggleDoubt}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${isDoubt ? 'border-white' : 'border-yellow-600'}`}>
                {isDoubt && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </div>
              Ragu-Ragu
            </button>

            {currentIndex < questions.length - 1 ? (
              <button 
                className="px-6 md:px-8 py-3 rounded text-white font-bold border-2 border-blue-600 bg-blue-500 hover:bg-blue-600 hover:border-blue-700 transition-colors text-sm md:text-base uppercase"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              >
                Soal Berikutnya
              </button>
            ) : (
              <button 
                className="px-6 md:px-8 py-3 rounded text-white font-bold border-2 border-green-600 bg-green-500 hover:bg-green-600 transition-colors text-sm md:text-base uppercase shadow-md animate-pulse"
                onClick={() => navigate('/review')}
              >
                Selesai Ujian
              </button>
            )}
          </div>
        </main>

        {/* Right Side: Question Map Sidebar */}
        <aside className="w-full md:w-80 flex flex-col bg-white rounded-xl shadow border border-neutral-200 overflow-hidden h-[300px] md:h-auto">
          <div className="bg-neutral-100 border-b border-neutral-200 px-6 py-4">
            <h3 className="font-bold text-neutral-700 md:text-lg">DAFTAR SOAL</h3>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 content-start">
            <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!examState.answers[q.id] && 
                  (typeof examState.answers[q.id] === 'object' ? Object.keys(examState.answers[q.id]).length > 0 : true);
                const isDoubtful = !!examState.doubt[q.id];
                const isActive = idx === currentIndex;
                
                let btnClass = "w-full aspect-square rounded font-bold flex flex-col items-center justify-center transition-all border-2 relative select-none ";
                
                // CBT coloring logic
                if (isActive) btnClass += "ring-4 ring-blue-300 ring-offset-1 scale-105 z-10 ";
                
                if (isDoubtful) {
                  btnClass += "bg-yellow-400 border-yellow-500 text-white shadow-sm";
                } else if (isAnswered) {
                  btnClass += "bg-green-500 border-green-600 text-white shadow-sm";
                } else {
                  btnClass += "bg-white border-neutral-300 text-neutral-500 hover:border-neutral-400";
                }
                
                return (
                  <button
                    key={q.id}
                    className={btnClass}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <span className="text-lg leading-none">{idx + 1}</span>
                    {isAnswered && !isDoubtful && q.type === 'pilihan_ganda' && (
                       <span className="text-[10px] mt-1 opacity-80 uppercase leading-none">{examState.answers[q.id]}</span>
                    )}
                    {isAnswered && !isDoubtful && q.type !== 'pilihan_ganda' && (
                       <span className="text-[10px] mt-1 opacity-80 uppercase leading-none">✔</span>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 space-y-3 p-4 bg-neutral-50 rounded border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded border-2 border-green-600 bg-green-500 shadow-sm flex items-center justify-center text-white text-xs font-bold">A</div>
                <span className="text-sm font-bold text-neutral-600 uppercase">Terjawab</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded border-2 border-yellow-500 bg-yellow-400 shadow-sm"></div>
                <span className="text-sm font-bold text-neutral-600 uppercase">Ragu-Ragu</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded border-2 border-neutral-300 bg-white"></div>
                <span className="text-sm font-bold text-neutral-600 uppercase">Belum Dijawab</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Blocker Modal */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 bg-neutral-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border-2 border-red-500/20 transform scale-100">
            <h3 className="text-2xl font-black text-red-600 mb-4 flex items-center gap-2">
              <AlertTriangle size={28} /> Peringatan
            </h3>
            <p className="mb-8 text-neutral-700 leading-relaxed font-medium">
              Apakah Anda yakin ingin keluar dari halaman ujian? Waktu ujian Anda <strong className="text-red-500">akan terus berjalan</strong> meskipun Anda meninggalkan halaman ini.
            </p>
            <div className="flex gap-4 justify-end flex-col sm:flex-row">
              <button className="px-6 py-3 rounded font-bold border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-100" onClick={() => blocker.reset?.()}>Kembali Ujian</button>
              <button className="px-6 py-3 rounded font-bold bg-red-500 text-white hover:bg-red-600 shadow-md" onClick={() => blocker.proceed?.()}>Tinggalkan Ujian</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;
