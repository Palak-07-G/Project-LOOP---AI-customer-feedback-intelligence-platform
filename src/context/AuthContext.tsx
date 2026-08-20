import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string, workspace: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoAccount: (role: 'ADMIN' | 'ANALYST' | 'VIEWER' | 'GLOBEX') => Promise<void>;
  isAdmin: boolean;
  isAnalyst: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.getMe();
        if (res?.user) {
          setUser(res.user);
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('loop_auth_token');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    if (res?.token && res?.user) {
      localStorage.setItem('loop_auth_token', res.token);
      setUser(res.user);
    }
  };

  const signup = async (name: string, email: string, pass: string, workspace: string) => {
    const res = await api.signup(name, email, pass, workspace);
    if (res?.token && res?.user) {
      localStorage.setItem('loop_auth_token', res.token);
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('loop_auth_token');
      setUser(null);
    }
  };

  const switchDemoAccount = async (role: 'ADMIN' | 'ANALYST' | 'VIEWER' | 'GLOBEX') => {
    setLoading(true);
    try {
      const res = await api.demoSwitch(role);
      if (res?.token && res?.user) {
        localStorage.setItem('loop_auth_token', res.token);
        setUser(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAnalyst = user?.role === 'ANALYST' || isAdmin;
  const isViewer = user?.role === 'VIEWER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        switchDemoAccount,
        isAdmin,
        isAnalyst,
        isViewer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
