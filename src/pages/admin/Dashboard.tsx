import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, Question, ExamToken, Result, Student } from '../../lib/db';
import { Users, FileQuestion, KeyRound, Activity, LogOut, LayoutDashboard, Settings, Trophy, Clock, CheckCircle, Upload } from 'lucide-react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/admin/students', label: 'Students', icon: <Users size={20} /> },
    { to: '/admin/monitor', label: 'Monitoring', icon: <Activity size={20} /> },
    { to: '/admin/questions', label: 'Question Bank', icon: <FileQuestion size={20} /> },
    { to: '/admin/import', label: 'Import', icon: <Upload size={20} /> },
    { to: '/admin/tokens', label: 'Exam Tokens', icon: <KeyRound size={20} /> },
    { to: '/admin/results', label: 'Results', icon: <Activity size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-text-main text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Settings size={28} className="text-primary" />
          <span className="font-black text-xl tracking-wider">TKA ADMIN</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map(link => {
            const active = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  active ? 'bg-primary text-white border border-primary-hover shadow-lg' : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="flex items-center gap-3 px-4 py-3 rounded text-danger hover:bg-danger/10 w-full font-bold transition-colors uppercase tracking-widest text-sm"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalStudents: 0,
    totalTokens: 0,
    averageScore: 0,
    breakdown: {
      pilihan_ganda: 0,
      pilihan_ganda_kompleks: 0,
      mcma: 0
    }
  });
  
  const [recentResults, setRecentResults] = useState<Result[]>([]);

  useEffect(() => {
    const questions = api.getQuestions();
    const students = api.getStudents();
    const tokens = api.getTokens();
    const results = api.getResults();

    const sumScore = results.reduce((acc, r) => acc + r.score, 0);
    const avgScore = results.length ? Math.round(sumScore / results.length) : 0;

    const qBreakdown = {
      pilihan_ganda: questions.filter(q => q.type === 'pilihan_ganda').length,
      pilihan_ganda_kompleks: questions.filter(q => q.type === 'pilihan_ganda_kompleks').length,
      mcma: questions.filter(q => q.type === 'multiple_choice_multiple_answer').length
    };

    setStats({
      totalQuestions: questions.length,
      totalStudents: students.length,
      totalTokens: tokens.length,
      averageScore: avgScore,
      breakdown: qBreakdown
    });
    
    // Sort descending by timestamp and take top 5
    const latest = [...results].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
    setRecentResults(latest);
  }, []);

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">System Overview</h1>
          <p className="text-text-muted mt-2 font-medium">Welcome back to the admin dashboard.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="card flex flex-col gap-4 bg-gradient-to-br from-primary to-primary-hover text-white border-none shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileQuestion size={28} className="text-white" />
            </div>
            <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Bank</span>
          </div>
          <div>
            <div className="text-5xl font-black mb-1">{stats.totalQuestions}</div>
            <div className="text-white/80 font-semibold tracking-wide flex flex-col gap-1">
              <span>Total Questions</span>
              <div className="flex gap-2 text-[10px] uppercase font-bold text-white/50">
                <span>{stats.breakdown.pilihan_ganda} PG</span>
                <span>•</span>
                <span>{stats.breakdown.pilihan_ganda_kompleks} PK</span>
                <span>•</span>
                <span>{stats.breakdown.mcma} MCMA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-4 bg-gradient-to-br from-secondary to-secondary-hover text-white border-none shadow-lg shadow-secondary/20 hover:scale-105 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users size={28} className="text-white" />
            </div>
            <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Users</span>
          </div>
          <div>
             <div className="text-5xl font-black mb-1">{stats.totalStudents}</div>
            <div className="text-white/80 font-semibold tracking-wide">Registered Students</div>
          </div>
        </div>

        <div className="card flex flex-col gap-4 bg-gradient-to-br from-warning to-yellow-600 text-white border-none shadow-lg shadow-warning/20 hover:scale-105 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <KeyRound size={28} className="text-white" />
            </div>
            <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Access</span>
          </div>
          <div>
             <div className="text-5xl font-black mb-1">{stats.totalTokens}</div>
            <div className="text-white/80 font-semibold tracking-wide">Active Tokens</div>
          </div>
        </div>

        <div className="card flex flex-col gap-4 bg-gradient-to-br from-text-main to-text-muted text-white border-none shadow-lg shadow-text-main/20 hover:scale-105 transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Activity size={28} className="text-white" />
            </div>
            <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Metrics</span>
          </div>
          <div>
             <div className="text-5xl font-black mb-1">{stats.averageScore}%</div>
            <div className="text-white/80 font-semibold tracking-wide">Average Score</div>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Clock size={20} className="text-primary"/> Recent Exam Results</h2>
            <Link to="/admin/results" className="text-primary text-sm font-bold hover:underline">View All</Link>
          </div>
          
          {recentResults.length > 0 ? (
            <div className="space-y-4 flex-1">
              {recentResults.map(res => (
                <div key={res.id} className="flex justify-between items-center p-4 bg-background rounded-xl border border-border/50 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {res.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-text-main">{res.studentName}</div>
                      <div className="text-sm text-text-muted">{res.school} • {new Date(res.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-bold ${res.score >= 70 ? 'bg-secondary/10 text-secondary' : res.score >= 50 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                    {res.score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted min-h-[200px] border-2 border-dashed border-border rounded-xl bg-background/50">
              <Trophy size={48} className="opacity-20 mb-4" />
              <p className="font-medium text-lg">No exam results yet.</p>
              <p className="text-sm">When students finish exams, their scores will appear here.</p>
            </div>
          )}
        </div>

        <div className="card bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm flex flex-col h-full">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle size={20} className="text-secondary"/> Quick Actions</h2>
          <div className="grid gap-4 flex-1">
            <Link to="/admin/questions" className="btn btn-outline border-primary text-primary hover:bg-primary/5 flex justify-start items-center gap-4 py-4 text-lg">
              <div className="bg-primary/10 p-2 rounded-lg"><FileQuestion size={24}/></div>
              Add New Question
            </Link>
            <Link to="/admin/tokens" className="btn btn-outline border-secondary text-secondary hover:bg-secondary/5 flex justify-start items-center gap-4 py-4 text-lg">
              <div className="bg-secondary/10 p-2 rounded-lg"><KeyRound size={24}/></div>
              Generate Token
            </Link>
            <Link to="/admin/results" className="btn btn-outline border-text-main text-text-main hover:bg-text-main/5 flex justify-start items-center gap-4 py-4 text-lg">
              <div className="bg-text-main/10 p-2 rounded-lg"><Activity size={24}/></div>
              Export Results
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
export { AdminLayout };
