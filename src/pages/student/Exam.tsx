import React, { useState, useEffect } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, ExamToken, Question, ExamState } from '../../lib/db';
import { formatTime, getServerTime } from '../../lib/utils';
import { User, Building, AlertTriangle, Type, Plus, Minus, Menu, X } from 'lucide-react';

// Renders HTML content safely for question text and options
const RichText = ({ html, className = '' }: { html: string; className?: string }) => (
  <div
    className={`rich-content ${className}`}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

const Exam = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [examState, setExamState] = useState<ExamState | null>(null);
  const [tokenInfo, setTokenInfo] = useState<ExamToken | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fontSize, setFontSize] = useState(20);
  const [showSidebar, setShowSidebar] = useState(false);
  const questionRef = React.useRef<HTMLDivElement>(null);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !examState?.submitted &&
      currentLocation.pathname !== nextLocation.pathname &&
      nextLocation.pathname !== '/review'
  );

  const [isSyncing, setIsSyncing] = useState(false);

  const loadExam = async () => {
    if (!auth.student) {
      navigate('/login');
      return;
    }
    
    setIsSyncing(true);
    try {
        const state = await api.getExamState(auth.student.id);
        if (!state || state.submitted || state.studentId !== auth.student.id) {
          navigate('/instructions');
          return;
        }

        const tokens = await api.getTokens();
        const token = tokens.find(t => t.id === state.tokenId);
        if (!token) {
          navigate('/instructions');
          return;
        }

        setTokenInfo(token);

        let activeState = { ...state };
        if (!activeState.startTime) {
          const serverTime = await getServerTime();
          activeState.startTime = serverTime;
          activeState.endTime = activeState.startTime + (token.durationMinutes * 60 * 1000);
          if (!activeState.doubt) activeState.doubt = {};
          await api.setExamState(activeState);
        }
        setExamState(activeState);

        const allQs = await api.getQuestions();
        const orderedQs = activeState.questionOrder.map(id => allQs.find(q => q.id === id)).filter(Boolean) as Question[];
        setQuestions(orderedQs);
    } catch (err) {
        console.error("Exam load error:", err);
    } finally {
        setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadExam();
  }, [auth.student]);

  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize, currentIndex]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!examState?.endTime) return;

    const calculateTime = () => {
      const remaining = Math.max(0, Math.floor((examState.endTime! - getServerTime()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        navigate('/review');
      }
    };

    calculateTime();
    const timerId = setInterval(calculateTime, 1000);
    return () => clearInterval(timerId);
  }, [examState?.endTime, navigate]);

  const handleSelectAnswer = async (ans: any) => {
    if (!examState || !questions[currentIndex] || !auth.student) return;

    const qId = questions[currentIndex].id;
    const newAnswers = { ...examState.answers, [qId]: ans };

    setExamState({ ...examState, answers: newAnswers });
    setIsSyncing(true);
    try {
        await api.updateExamState(auth.student.id, { answers: newAnswers });
    } catch (err) {
        console.error("Sync error:", err);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleComplexToggle = (index: number) => {
    if (!examState || !questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    const currentAns = (examState.answers[qId] as number[]) || [];

    let newAns: number[];
    if (currentAns.includes(index)) {
      newAns = currentAns.filter(i => i !== index);
    } else {
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

  const toggleDoubt = async () => {
    if (!examState || !questions[currentIndex] || !auth.student) return;

    const qId = questions[currentIndex].id;
    const newDoubt = { ...examState.doubt, [qId]: !examState.doubt[qId] };

    setExamState({ ...examState, doubt: newDoubt });
    setIsSyncing(true);
    try {
        await api.updateExamState(auth.student.id, { doubt: newDoubt });
    } catch (err) {
        console.error("Sync error:", err);
    } finally {
        setIsSyncing(false);
    }
  }

  if (!examState || !tokenInfo || (questions.length === 0 && (isSyncing || !auth.student))) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
        <p className="text-xl font-bold text-blue-900">Loading CBT Environment...</p>
      </div>
    );
  }

  // Handle case where questions are actually missing after load
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 gap-4 p-8 text-center">
        <AlertTriangle size={48} className="text-amber-500" />
        <h2 className="text-2xl font-bold text-neutral-800">No Questions Found</h2>
        <p className="text-neutral-600 max-w-md">The exam session was initialized but no questions were found for the selected subject. Please contact your administrator.</p>
        <button onClick={() => navigate('/instructions')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Back to Instructions</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  
  // Guard against undefined currentQ
  if (!currentQ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
        <p className="text-lg text-neutral-600">Preparing question {currentIndex + 1}...</p>
      </div>
    );
  }

  const selectedAns = examState.answers[currentQ.id];
  const isDoubt = examState.doubt[currentQ.id] || false;

  const renderOptions = () => {
    if (currentQ.type === 'pilihan_ganda') {
      return (
        <div className="grid gap-2 sm:gap-3 max-w-4xl">
          {(examState.optionOrder[currentQ.id] || ['A', 'B', 'C', 'D']).map((opt) => {
            const isSelected = selectedAns === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelectAnswer(opt)}
                className={`flex items-center text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-base sm:text-lg md:text-xl group ${isSelected
                  ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                  : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                  }`}
              >
                <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-3 sm:mr-6 font-bold border-2 transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-transparent border-neutral-300 text-neutral-500 group-hover:border-blue-300'
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
      const shuffledIndices = (examState.optionOrder[currentQ.id] || Array.from({length: currentQ.statements?.length || 0}, (_, i) => i)) as number[];
      const shuffledStatements = shuffledIndices.map(i => ({ stmt: currentQ.statements?.[i], origIndex: i })).filter(s => s.stmt);
      
      return (
        <div className="space-y-3 sm:space-y-4 max-w-4xl">
          <p className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 p-2 rounded inline-block mb-2">
            Pilihlah {currentQ.statements?.filter(s => s.isCorrect).length || 0} pernyataan yang benar
          </p>
          {shuffledStatements.map(({ stmt, origIndex }, displayIndex) => {
            const isSelected = selectedIndices.includes(origIndex);
            return (
              <button
                key={origIndex}
                onClick={() => handleComplexToggle(origIndex)}
                className={`w-full flex items-start text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 group ${isSelected
                  ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                  : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'
                  }`}
              >
                <div className={`mt-1 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 mr-3 sm:mr-4 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-neutral-300'
                  }`}>
                  {isSelected && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-sm" />}
                </div>
                <div className="flex-1 font-medium text-base sm:text-lg leading-snug">
                  <RichText html={stmt?.text || ''} />
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentQ.type === 'multiple_choice_multiple_answer') {
      const statementAnswers = (selectedAns as Record<number, string>) || {};
      const shuffledIndices = (examState.optionOrder[currentQ.id] || Array.from({length: currentQ.statements?.length || 0}, (_, i) => i)) as number[];
      const shuffledStatements = shuffledIndices.map(i => ({ stmt: currentQ.statements?.[i], origIndex: i })).filter(s => s.stmt);
      
      return (
        <div className="space-y-4 sm:space-y-6 max-w-5xl">
          {shuffledStatements.map(({ stmt, origIndex }, displayIndex) => {
            const getPair = (ans: string) => {
              if (ans === 'Benar' || ans === 'Salah') return ['Benar', 'Salah'];
              if (ans === 'Sesuai' || ans === 'Tidak Sesuai') return ['Sesuai', 'Tidak Sesuai'];
              if (ans === 'Tepat' || ans === 'Tidak Tepat') return ['Tepat', 'Tidak Tepat'];
              if (ans === 'Ya' || ans === 'Tidak') return ['Ya', 'Tidak'];
              if (ans === 'Mendukung' || ans === 'Tidak Mendukung') return ['Mendukung', 'Tidak Mendukung'];
              return ['Sesuai', 'Tidak Sesuai'];
            };
            const pair = getPair(stmt?.correctAnswer || '');

            return (
              <div key={origIndex} className="bg-neutral-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-200">
                <div className="text-base sm:text-lg font-bold text-neutral-800 mb-3 sm:mb-4">
                  {displayIndex + 1}. <RichText html={stmt?.text || ''} className="inline" />
                </div>
                <div className="flex gap-2 sm:gap-4">
                  {pair.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleStatementCheck(origIndex, opt)}
                      className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-xl font-bold border-2 transition-all text-sm sm:text-base ${statementAnswers[origIndex] === opt
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-blue-300'
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

  const answeredCount = Object.keys(examState.answers).filter(k => examState.answers[k]).length;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-neutral-100 text-neutral-800 font-sans overflow-hidden">

      {/* CBT Header - Mobile Optimized */}
      <header className="bg-blue-600 text-white shadow-md z-20 px-2 sm:px-4 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center h-12 sm:h-16">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="hidden sm:flex flex-col border-r border-blue-400/50 pr-4 mr-2">
              <span className="font-bold text-lg lg:text-xl uppercase">TKA CBT</span>
              <span className="text-blue-200 text-xs">Ujian Komputer</span>
            </div>
            {/* Mobile: Compact user info */}
            <div className="flex items-center gap-2">
              <User size={16} className="flex-shrink-0" />
              <span className="font-bold text-sm sm:text-base truncate max-w-[80px] sm:max-w-[150px]">{auth.student?.name}</span>
            </div>
            <div className="hidden sm:block text-sm text-blue-100">
              <Building size={14} className="inline mr-1" />
              {auth.student?.school}
            </div>
          </div>

          {/* Right Section: Timer + Sidebar Toggle */}
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors active:scale-95"
              title="Daftar Soal"
            >
              {showSidebar ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Timer */}
            <div className="bg-blue-800 flex items-center px-3 sm:px-6 py-2 shadow-inner">
               {isSyncing && <div className="mr-3 animate-pulse text-[10px] font-black uppercase text-blue-300">Syncing...</div>}
               <div className="text-right">
                <div className="hidden xs:block text-xs text-blue-300 uppercase font-bold">Sisa Waktu</div>
                <div className={`text-lg sm:text-2xl font-black font-mono tracking-wider ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full overflow-hidden relative">

        {/* Question Area */}
        <main className="flex-1 flex flex-col bg-white rounded-none sm:rounded-xl shadow border border-neutral-200 overflow-hidden relative">

          {/* Question Header */}
          <div className="bg-neutral-100 border-b border-neutral-200 px-3 sm:px-6 py-2 sm:py-4 flex justify-between items-center">
            <div className="text-base sm:text-lg font-bold text-neutral-700 flex items-center gap-2 sm:gap-3">
              SOAL
              <span className="text-xl sm:text-2xl font-black bg-blue-100 text-blue-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded min-w-[2rem] text-center">
                {currentIndex + 1}
              </span>
            </div>
            <div className="bg-neutral-200 text-neutral-600 px-2 sm:px-3 py-1 rounded font-bold text-xs sm:text-sm">
              {currentQ.subject}
            </div>
          </div>

          {/* Question Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
            {/* Font Size Controls */}
            <div className="flex justify-end gap-1 sm:gap-2 mb-4 bg-neutral-50 p-1.5 sm:p-2 rounded-lg border border-neutral-100">
              <span className="text-xs font-bold text-neutral-400 hidden xs:flex items-center mr-2">
                <Type size={12} className="mr-1" /> Ukuran
              </span>
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white border border-neutral-200 rounded hover:bg-neutral-100 text-neutral-600 active:scale-95 transition-transform"
                title="Perkecil"
              >
                <Minus size={14} />
              </button>
              <button
                onClick={() => setFontSize(Math.min(40, fontSize + 2))}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white border border-neutral-200 rounded hover:bg-neutral-100 text-neutral-600 active:scale-95 transition-transform"
                title="Perbesar"
              >
                <Plus size={14} />
              </button>
            </div>

            <div
              ref={questionRef}
              className="mb-4 sm:mb-6 leading-relaxed font-medium text-neutral-800"
            >
              <RichText html={currentQ.question} />
            </div>

            {currentQ.image && (
              <div className="mb-6 sm:mb-8 rounded-2xl overflow-hidden border-2 border-neutral-200 bg-neutral-50 shadow-sm max-w-fit mx-auto">
                <img
                  src={currentQ.image}
                  alt="Question material"
                  className="max-h-[200px] sm:max-h-[300px] lg:max-h-[400px] w-auto object-contain block mx-auto"
                />
              </div>
            )}

            {renderOptions()}
          </div>

          {/* Question Footer Controls - Mobile Optimized */}
          <div className="bg-neutral-50 border-t border-neutral-200 p-2 sm:p-4 lg:p-6 flex flex-wrap justify-between items-center gap-2 sm:gap-4">
            <button
              className="px-3 sm:px-6 lg:px-8 py-2 sm:py-3 rounded text-neutral-700 font-bold border-2 border-neutral-300 bg-white hover:bg-neutral-100 transition-colors disabled:opacity-50 text-xs sm:text-sm active:scale-95 transition-transform"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              ← Prev
            </button>

            <button
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded font-bold border-2 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm active:scale-95 transition-transform ${isDoubt
                ? 'border-yellow-500 bg-yellow-500 text-white'
                : 'border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                }`}
              onClick={toggleDoubt}
            >
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center border-2 ${isDoubt ? 'border-white' : 'border-yellow-600'}`}>
                {isDoubt && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <span className="hidden xs:inline">Ragu</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                className="px-3 sm:px-6 lg:px-8 py-2 sm:py-3 rounded text-white font-bold border-2 border-blue-600 bg-blue-500 hover:bg-blue-600 transition-colors text-xs sm:text-sm active:scale-95 transition-transform"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              >
                Next →
              </button>
            ) : (
              <button
                className="px-3 sm:px-6 lg:px-8 py-2 sm:py-3 rounded text-white font-bold border-2 border-green-600 bg-green-500 hover:bg-green-600 transition-colors text-xs sm:text-sm shadow-md animate-pulse active:scale-95 transition-transform"
                onClick={() => navigate('/review')}
              >
                Selesai ✓
              </button>
            )}
          </div>
        </main>

        {/* Question Map Sidebar - Slide-in on Mobile */}
        <aside className={`
          fixed sm:relative inset-y-0 right-0 z-30
          w-72 sm:w-72 lg:w-80
          flex flex-col bg-white rounded-l-2xl sm:rounded-xl shadow-2xl border border-neutral-200
          transform transition-transform duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
          h-full sm:h-auto mt-0
        `}>
          {/* Sidebar Header */}
          <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-neutral-700 text-sm sm:text-base">DAFTAR SOAL</h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="sm:hidden w-8 h-8 flex items-center justify-center hover:bg-neutral-200 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {/* Progress indicator */}
            <div className="mb-3 text-xs font-bold text-neutral-500 text-center">
              {answeredCount} / {questions.length} terjawab
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!examState.answers[q.id] &&
                  (typeof examState.answers[q.id] === 'object' ? Object.keys(examState.answers[q.id]).length > 0 : true);
                const isDoubtful = !!examState.doubt[q.id];
                const isActive = idx === currentIndex;

                let btnClass = "w-full aspect-square rounded-lg font-bold flex flex-col items-center justify-center transition-all border-2 relative select-none active:scale-95 ";

                if (isActive) btnClass += "ring-2 ring-blue-400 ring-offset-1 scale-105 z-10 ";

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
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowSidebar(false);
                    }}
                  >
                    <span className="text-base sm:text-lg leading-none">{idx + 1}</span>
                    {isAnswered && !isDoubtful && q.type === 'pilihan_ganda' && (
                      <span className="text-[8px] sm:text-[10px] mt-0.5 opacity-80 uppercase">{examState.answers[q.id]}</span>
                    )}
                    {isAnswered && !isDoubtful && q.type !== 'pilihan_ganda' && (
                      <span className="text-[8px] sm:text-[10px] mt-0.5 opacity-80">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 sm:mt-6 space-y-2 p-2 sm:p-4 bg-neutral-50 rounded border border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border-2 border-green-600 bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                <span className="text-xs font-bold text-neutral-600">Terjawab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border-2 border-yellow-500 bg-yellow-400"></div>
                <span className="text-xs font-bold text-neutral-600">Ragu-Ragu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border-2 border-neutral-300 bg-white"></div>
                <span className="text-xs font-bold text-neutral-600">Belum</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-20 sm:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>

      {/* Blocker Modal */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 bg-neutral-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-2xl border-2 border-red-500/20">
            <h3 className="text-xl sm:text-2xl font-black text-red-600 mb-4 flex items-center gap-2">
              <AlertTriangle size={24} className="sm:w-7 sm:h-7" /> Peringatan
            </h3>
            <p className="mb-6 sm:mb-8 text-neutral-700 leading-relaxed font-medium">
              Apakah Anda yakin ingin keluar dari halaman ujian? Waktu ujian Anda <strong className="text-red-500">akan terus berjalan</strong> meskipun Anda meninggalkan halaman ini.
            </p>
            <div className="flex gap-3 sm:gap-4 justify-end flex-col sm:flex-row">
              <button className="px-4 sm:px-6 py-2 sm:py-3 rounded font-bold border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors text-sm sm:text-base" onClick={() => blocker.reset?.()}>
                Kembali Ujian
              </button>
              <button className="px-4 sm:px-6 py-2 sm:py-3 rounded font-bold bg-red-500 text-white hover:bg-red-600 shadow-md transition-colors text-sm sm:text-base" onClick={() => blocker.proceed?.()}>
                Tinggalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;
