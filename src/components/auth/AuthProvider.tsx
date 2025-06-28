/**
 * Optimized Authentication Provider Component
 *
 * A React Context provider that manages authentication state and theme switching
 * throughout the application. Features instant session restoration, optimized auth checks,
 * and professional loading states to prevent UI flickering.
 * Wraps the entire application to provide auth and theme context.
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/zustand";
import { saveTheme, getTheme } from "@/lib/utils/localDb";
import { isConfigured } from "@/lib/config/appwrite";
import { AuthPageLoader } from "@/components/ui/AuthLoader";

interface AuthContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  // Initialize theme and auth status
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize theme first (synchronous)
      const savedTheme = getTheme();
      setTheme(savedTheme);

      // Apply theme to document
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      setMounted(true);

      // Check authentication status asynchronously (only if configured)
      if (isConfigured) {
        await checkAuthStatus();
      }

      // Short delay to prevent flickering, but keep it minimal
      setTimeout(() => {
        setIsInitializing(false);
      }, 100);
    };

    initializeApp();
  }, [checkAuthStatus]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    saveTheme(newTheme);

    // Apply theme to document
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show professional loader during initialization
  if (isInitializing) {
    return <AuthPageLoader message="Initializing application..." />;
  }

  return (
    <AuthContext.Provider value={{ theme, toggleTheme, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};
