import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface AuthContextType {
  user: any | null;
  company: any | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isExpired: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('@NFERIO:user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setCompany(parsed.user.company);
      setIsExpired(parsed.expired);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/users/login', { email, password: pass });
    const data = res.data;
    
    setUser(data.user);
    setCompany(data.user.company);
    setIsExpired(data.expired);
    
    localStorage.setItem('@NFERIO:user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('@NFERIO:user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, company, login, logout, loading, isExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
