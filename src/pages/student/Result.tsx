import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, Result as ResultType } from '../../lib/db';
import { Award, LogOut, CheckCircle, XCircle } from 'lucide-react';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, auth } = useAuth();
  
  const [result, setResult] = useState<ResultType | null>(null);

  useEffect(() => {
    const resultId = location.state?.resultId;
    if (!resultId && !auth.student?.id) { 
      navigate('/login');
      return;
    }

    if (resultId) {
      const found = api.getResults().find(r => r.id === resultId);
      if (found) setResult(found);
      else { 
        navigate('/login');
      }
    } else {
      const thisStudent = api.getResultsByStudent(auth.student?.id || '');
      if (thisStudent.length > 0) {
        setResult(thisStudent[thisStudent.length - 1]);
      } else {
        navigate('/login'); 
      }
    }
  }, [location, auth.student, navigate]);

  if (!result) return <div className="p-8 text-center animate-pulse font-bold text-xl text-primary mt-12">Loading Results...</div>;

  const totalQs = result.correct + result.wrong;

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background shapes for kid-friendly aesthetic */}
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-primary/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-secondary/10 rounded-full blur-3xl z-0"></div>

      <div className="card max-w-lg w-full text-center relative z-10 p-8 border-4 border-white shadow-2xl glass">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary text-white mb-6 shadow-lg shadow-primary/30 transform hover:scale-110 transition-transform">
          <Award size={48} />
        </div>
        
        <h2 className="text-3xl font-black text-text-main mb-2">Exam Completed!</h2>
        <p className="text-text-muted text-lg font-medium mb-8">Great job, {result.studentName}!</p>
        
        <div className="bg-background rounded-2xl p-6 mb-8 border border-border shadow-inner">
          <div className="text-sm font-bold text-text-muted uppercase tracking-widest mb-2">Final Score</div>
          <div className="text-7xl font-black text-primary drop-shadow-sm mb-6">{result.score}</div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
            <div className="flex flex-col items-center p-3 rounded-xl bg-secondary/10 border border-secondary/20">
              <CheckCircle className="text-secondary mb-2" size={32} />
              <div className="text-3xl font-black text-text-main">{result.correct}</div>
              <div className="text-xs font-bold text-text-muted uppercase mt-1">Correct</div>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-xl bg-danger/10 border border-danger/20">
              <XCircle className="text-danger mb-2" size={32} />
              <div className="text-3xl font-black text-text-main">{result.wrong}</div>
              <div className="text-xs font-bold text-text-muted uppercase mt-1">Wrong</div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }} 
          className="btn btn-outline hover:bg-surface py-3 px-8 text-lg w-full"
        >
          <LogOut size={24} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Result;
