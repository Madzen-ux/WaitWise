'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Staff } from '@/lib/types';
import { mockStaff } from '@/lib/mock-data';

interface AuthContextType {
  staff: Staff | null;
  isAuthenticated: boolean;
  login: (staffId: string, pin: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('waitwise_staff');
    if (stored) {
      try {
        setStaff(JSON.parse(stored));
      } catch {
        localStorage.removeItem('waitwise_staff');
      }
    }
  }, []);

  const login = (staffId: string, pin: string): boolean => {
    if (staffId === mockStaff.id && pin === mockStaff.pin) {
      const staffData = { ...mockStaff };
      setStaff(staffData);
      localStorage.setItem('waitwise_staff', JSON.stringify(staffData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setStaff(null);
    localStorage.removeItem('waitwise_staff');
  };

  return (
    <AuthContext.Provider value={{ staff, isAuthenticated: !!staff, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
