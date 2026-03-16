import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student } from '../lib/db';

type AuthState = {
  isAdmin: boolean;
  student: Student | null;
  tokenId: string | null;
};

type AuthContextType = {
  auth: AuthState;
  loginStudent: (student: Student, tokenId: string) => void;
  loginAdmin: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('auth_state');
    return saved ? JSON.parse(saved) : { isAdmin: false, student: null, tokenId: null };
  });

  useEffect(() => {
    localStorage.setItem('auth_state', JSON.stringify(auth));
  }, [auth]);

  const loginStudent = (student: Student, tokenId: string) => setAuth({ isAdmin: false, student, tokenId });
  
  const loginAdmin = () => setAuth({ isAdmin: true, student: null, tokenId: null });
  
  const logout = () => {
    setAuth({ isAdmin: false, student: null, tokenId: null });
  };

  return (
    <AuthContext.Provider value={{ auth, loginStudent, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
