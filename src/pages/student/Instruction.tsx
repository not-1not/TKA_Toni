import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, ExamToken } from '../../lib/db';
import { shuffleArray } from '../../lib/utils';
import { PlayCircle, AlertTriangle } from 'lucide-react';

const Instruction = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [tokenInfo, setTokenInfo] = useState<ExamToken | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      if (auth.tokenId) {
        setIsLoading(true);
        try {
            const tokens = await api.getTokens();
            const token = tokens.find(t => t.id === auth.tokenId);
            if (token) setTokenInfo(token);
        } catch (err) {
            console.error("Token load error:", err);
        } finally {
            setIsLoading(false);
        }
      }
    };
    fetchToken();
  }, [auth.tokenId]);

  const startExam = async () => {
    if (!tokenInfo || !auth.student || isLoading) return;
    
    setIsLoading(true);
    try {
        const existingState = await api.getExamState(auth.student.id);
        if (existingState && existingState.studentId === auth.student.id && existingState.tokenId === tokenInfo.id && !existingState.submitted) {
          navigate('/exam');
          return;
        }
        
        const allQs = await api.getQuestions();
        const filteredBySubject = tokenInfo.subject && tokenInfo.subject !== 'All' 
           ? allQs.filter(q => q.subject === tokenInfo.subject)
           : allQs;
        
        const filteredByPackage = tokenInfo.package
           ? filteredBySubject.filter(q => q.package === tokenInfo.package)
           : filteredBySubject;

        const shuffled = shuffleArray([...filteredByPackage]).slice(0, tokenInfo.questionCount);
        const questionOrder = shuffled.map(q => q.id);
        const optionOrder: Record<string, any> = {};
        shuffled.forEach(q => {
          if (q.type === 'pilihan_ganda') {
            // For PG: shuffle option letters A, B, C, D
            optionOrder[q.id] = shuffleArray(['A', 'B', 'C', 'D']);
          } else {
            // For PK/MCMA: shuffle statement indices
            const statementCount = q.statements?.length || 0;
            const shuffledIndices = shuffleArray(Array.from({length: statementCount}, (_, i) => i));
            optionOrder[q.id] = shuffledIndices;
          }
        });
        
        await api.setExamState({
          studentId: auth.student.id,
          tokenId: tokenInfo.id,
          endTime: null, 
          startTime: null,
          answers: {},
          doubt: {},
          questionOrder,
          optionOrder,
          submitted: false
        });
        
        navigate('/exam');
    } catch (err) {
        alert("Failed to start exam. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  if (!tokenInfo || (isLoading && !auth.student)) return <div className="p-8 text-center text-xl font-bold animate-pulse text-primary mt-12">Loading Exam Information...</div>;

  return (
    <div className="flex flex-col items-center p-4 min-h-[80vh] justify-center animate-fade-in py-12">
      <div className="card max-w-2xl w-full">
        <h2 className="text-3xl text-center mb-6 text-primary border-b-2 border-border pb-4">Exam Instructions</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-8 text-lg">
          <div className="bg-background p-4 rounded-md border border-border">
            <span className="text-muted block text-sm font-bold uppercase tracking-wider">Student Name</span>
            <span className="font-bold text-xl">{auth.student?.name}</span>
          </div>
          <div className="bg-background p-4 rounded-md border border-border">
            <span className="text-muted block text-sm font-bold uppercase tracking-wider">School</span>
            <span className="font-bold text-xl">{auth.student?.school}</span>
          </div>
          <div className="bg-background p-4 rounded-md border border-border">
            <span className="text-muted block text-sm font-bold uppercase tracking-wider">Duration</span>
            <span className="font-bold text-xl text-warning flex items-center gap-2">
              {tokenInfo.durationMinutes} Minutes
            </span>
          </div>
          <div className="bg-background p-4 rounded-md border border-border">
            <span className="text-muted block text-sm font-bold uppercase tracking-wider">Questions</span>
            <span className="font-bold text-xl">{tokenInfo.questionCount} Questions</span>
          </div>
        </div>

        <div className="mb-8 p-6 bg-danger/10 border-2 border-danger/30 rounded-xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 bg-danger text-white px-3 py-1 rounded-bl-lg font-bold text-sm tracking-wider uppercase">Penting</div>
          <h3 className="flex items-center gap-2 text-danger font-bold text-xl mb-4">
            <AlertTriangle className="animate-pulse" /> Peraturan sebelum memulai
          </h3>
          <ul className="list-disc list-inside space-y-3 text-text-main ml-2 font-medium">
            <li>Jangan tutup jendela browser selama ujian berlangsung.</li>
            <li>Jawaban Anda disimpan secara otomatis. Jika Anda tidak sengaja memuat ulang (refresh), Anda dapat melanjutkan ujian Anda kembali.</li>
            <li>Waktu ujian tidak akan berhenti jika Anda me-refresh atau berpindah tab.</li>
            <li>Setelah waktu habis, jawaban Anda akan dikumpulkan secara otomatis.</li>
            <li>Periksa kembali jawaban Anda dengan cermat di halaman Tinjauan sebelum mengirimkan hasil akhir.</li>
            <li>Terdapat jenis soal Pilihan Ganda Kompleks dan MCMA (Multiple Choice Multiple Answer). Pilihlah jawaban sesuai dengan instruksi masing-masing soal.</li>
          </ul>
        </div>
        
        <div className="flex justify-center">
          <button onClick={startExam} className="btn btn-primary text-xl py-4 px-12 rounded-full mt-4 hover:scale-105 transform transition-transform">
            <PlayCircle size={28} /> Start Exam Now
          </button>
        </div>
      </div>
    </div>
  );
};
export default Instruction;
