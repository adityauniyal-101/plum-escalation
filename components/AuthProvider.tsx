'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authStorage, initializeAuth } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
    const storedUser = authStorage.getUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const verifiedUser = authStorage.verifyCredentials(email, password);
      if (verifiedUser) {
        authStorage.saveUser(verifiedUser);
        setUser(verifiedUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('auth_users') || '[]');
      if (users.find((u: any) => u.email === email)) {
        throw new Error('Email already exists');
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: 'agent',
        createdAt: new Date().toISOString(),
      };

      users.push({
        ...newUser,
        password: btoa(password),
      });

      localStorage.setItem('auth_users', JSON.stringify(users));
      authStorage.saveUser(newUser);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authStorage.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
