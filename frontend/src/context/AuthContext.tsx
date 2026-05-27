import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Busca os dados complementares do usuário (role, empresa, etc)
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*, empresas(*)')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setUser(userData);
          setCompany(userData.empresas);
        }
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*, empresas(*)')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUser(userData);
          setCompany(userData.empresas);
        }
      } else {
        setUser(null);
        setCompany(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, company, login, logout, loading, isExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
