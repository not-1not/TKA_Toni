import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      loginAdmin();
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-text-main text-white animate-fade-in">
      <div className="card w-full max-w-sm bg-surface text-text-main shadow-2xl border-none">
        <div className="text-center mb-6">
          <ShieldCheck size={48} className="mx-auto text-primary mb-2" />
          <h2 className="text-2xl font-black">Admin Portal</h2>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-3 mb-4 rounded border-l-4 border-danger font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="text-xs text-text-muted mt-2 inline-block font-bold opacity-50 uppercase tracking-widest">Default: admin / admin123</span>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4 py-3 text-lg">
            Login to Admin
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button 
            type="button" 
            className="text-text-muted text-sm hover:text-primary underline bg-transparent border-none cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Return to Student Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
