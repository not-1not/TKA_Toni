import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, Student } from '../../lib/db';
import { LogIn, BookOpen } from 'lucide-react';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tokenStr, setTokenStr] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [error, setError] = useState('');
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !tokenStr.trim() || !selectedSubject) {
      setError('Please fill in all required fields and select a subject!');
      return;
    }

    const students = api.getStudents();
    const student = students.find(s => s.username.toLowerCase() === username.trim().toLowerCase());

    if (!student) {
      setError('Student account not found. Please contact your teacher.');
      return;
    }

    if (student.password && student.password !== password) {
      setError('Incorrect password.');
      return;
    }

    const examToken = api.getTokenByStr(tokenStr);
    if (!examToken) {
      setError('Invalid or inactive exam token. Please ask your teacher.');
      return;
    }

    if (examToken.subject !== selectedSubject) {
      setError(`This token is for ${examToken.subject}, but you selected ${selectedSubject}.`);
      return;
    }

    loginStudent(student, examToken.id);
    navigate('/instructions');
  };

  const activeTokens = api.getTokens().filter(t => t.active);
  const availableSubjects = Array.from(new Set(activeTokens.map(t => t.subject))).filter(Boolean) as string[];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center justify-center mb-4 text-primary">
          <BookOpen size={64} />
        </div>
        <h1 className="text-4xl text-primary drop-shadow-sm">TKA SD Tryout Platform</h1>
        <p className="text-xl text-muted mt-2">Welcome students! Let's get started.</p>
      </div>

      <div className="card w-full max-w-md glass border-2 border-primary/20">
        <h2 className="text-2xl text-center mb-6">Student Login</h2>
        
        {error && (
          <div className="bg-danger/10 border-l-4 border-danger text-danger p-4 mb-6 rounded-r">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">Username / NISN</label>
            <input 
              id="username"
              type="text" 
              className="input-field" 
              placeholder="e.g. 123456789"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password (Opsional jika tidak disetel)</label>
            <input 
              id="password"
              type="password" 
              className="input-field" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="subject">Pilih Mata Pelajaran</label>
            <select 
              id="subject"
              className="input-field font-bold text-primary"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">-- Pilih Mapel --</option>
              {availableSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="token">Exam Token</label>
            <input 
              id="token"
              type="text" 
              className="input-field text-center tracking-widest uppercase font-bold text-xl" 
              placeholder="e.g. TRYOUT123"
              value={tokenStr}
              onChange={(e) => setTokenStr(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4 text-lg py-3">
            <LogIn size={24} /> Login to Exam
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            type="button" 
            className="text-muted text-sm hover:text-primary underline bg-transparent border-none cursor-pointer"
            onClick={() => navigate('/admin/login')}
          >
            Teacher/Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
