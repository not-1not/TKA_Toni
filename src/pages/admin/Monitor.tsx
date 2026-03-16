import React, { useState, useEffect } from 'react';
import { AdminLayout } from './Dashboard';
import { api, ExamState, Student, Question } from '../../lib/db';
import { Clock, CheckCircle, Activity, User, ExternalLink, RefreshCw } from 'lucide-react';
import { formatTime } from '../../lib/utils';

const Monitor = () => {
  const [activeSessions, setActiveSessions] = useState<{student: Student, state: ExamState}[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadData = () => {
    const allStates = api.getAllExamStates();
    const allStudents = api.getStudents();
    const allQs = api.getQuestions();
    
    const studentMap: Record<string, Student> = {};
    allStudents.forEach(s => studentMap[s.id] = s);
    setStudents(studentMap);
    setQuestions(allQs);

    const active = Object.values(allStates)
      .filter(state => !state.submitted && studentMap[state.studentId])
      .map(state => ({
        student: studentMap[state.studentId],
        state
      }));
    
    setActiveSessions(active);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8 border-b-2 border-border pb-4">
        <div>
          <h1 className="text-3xl font-black text-text-main flex items-center gap-3">
            <Activity className="text-primary" /> Live Monitoring
          </h1>
          <p className="text-text-muted font-medium">Real-time tracking of students currently taking exams.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-text-muted uppercase">Last update: {lastUpdate.toLocaleTimeString()}</span>
          <button onClick={loadData} className="btn btn-outline p-2 bg-surface">
            <RefreshCw size={18} className="text-primary" />
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {activeSessions.length > 0 ? (
          activeSessions.map(({ student, state }) => {
            const answeredCount = Object.keys(state.answers).length;
            const totalCount = state.questionOrder.length;
            const progress = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
            
            const remaining = state.endTime ? Math.max(0, Math.floor((state.endTime - Date.now()) / 1000)) : 0;
            
            return (
              <div key={student.id} className="card bg-surface border border-border shadow-sm hover:border-primary/50 transition-all flex flex-col md:flex-row gap-6 items-center">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl border-2 border-primary/20">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main mb-1">{student.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <span className="bg-background px-2 py-0.5 rounded border border-border font-bold">{student.school}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><User size={14}/> {student.username}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-64">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
                    <span>Progress Mengerjakan</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-border">
                    <div 
                      className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-center font-bold text-text-muted">
                    {answeredCount} dari {totalCount} soal terjawab
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto border-l border-border pl-6">
                  <div className="text-center">
                    <span className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Sisa Waktu</span>
                    <span className={`font-mono font-black text-xl flex items-center gap-2 ${remaining < 300 ? 'text-danger animate-pulse' : 'text-text-main'}`}>
                      <Clock size={16} /> {formatTime(remaining)}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Status</span>
                    <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-black uppercase flex items-center justify-center gap-1">
                      <Activity size={12} /> Active
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card bg-surface border-2 border-dashed border-border py-20 text-center flex flex-col items-center">
            <Activity size={48} className="text-text-muted opacity-20 mb-4" />
            <h3 className="text-xl font-bold text-text-muted">No Active Sessions</h3>
            <p className="text-text-muted max-w-sm mx-auto mt-2">There are currently no students taking exams. When students log in and start, they will appear here.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Monitor;
