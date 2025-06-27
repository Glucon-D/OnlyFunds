/**
 * Authentication Provider Component
 *
 * A React Context provider that manages authentication state and theme switching
 * throughout the application. Handles initial authentication checks, theme
 * initialization from localStorage, and provides theme toggle functionality.
 * Wraps the entire application to provide auth and theme context.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/zustand';
import { saveTheme, getTheme } from '@/lib/utils/localDb';

interface AuthContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  // Initialize theme and auth status
  useEffect(() => {
    // Check authentication status
    checkAuthStatus();

    // Initialize theme
    const savedTheme = getTheme();
    setTheme(savedTheme);
    
    // Apply theme to document
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setMounted(true);
  }, [checkAuthStatus]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);

    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};
