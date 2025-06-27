/**
 * Utility Helper Functions
 *
 * This file contains various utility functions used throughout the OnlyFunds application.
 * Includes functions for currency formatting, date manipulation, ID generation,
 * category management, validation helpers, and array operations. These utilities
 * provide consistent functionality across different components and features.
 */

import { ExpenseCategory, IncomeCategory, TransactionType } from '../types';

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Date formatting
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatDateInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// ID generation
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Category helpers
export const getCategoryDisplayName = (category: ExpenseCategory | IncomeCategory): string => {
  return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
};

export const getExpenseCategories = (): { value: ExpenseCategory; label: string }[] => {
  return Object.values(ExpenseCategory).map(category => ({
    value: category,
    label: getCategoryDisplayName(category)
  }));
};

export const getIncomeCategories = (): { value: IncomeCategory; label: string }[] => {
  return Object.values(IncomeCategory).map(category => ({
    value: category,
    label: getCategoryDisplayName(category)
  }));
};

// Transaction type helpers
export const getTransactionTypeDisplayName = (type: TransactionType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Date utilities
export const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1; // JavaScript months are 0-indexed
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const getMonthName = (month: number): string => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month - 1] || '';
};

export const getMonthOptions = (): { value: number; label: string }[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1)
  }));
};

export const getYearOptions = (startYear?: number, endYear?: number): { value: number; label: string }[] => {
  const currentYear = getCurrentYear();
  const start = startYear || currentYear - 5;
  const end = endYear || currentYear + 5;
  
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const year = start + i;
    return { value: year, label: year.toString() };
  });
};

// Percentage calculation
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Budget progress helpers
export const getBudgetProgressColor = (percentageUsed: number): string => {
  if (percentageUsed >= 100) return 'text-red-600 dark:text-red-400';
  if (percentageUsed >= 80) return 'text-yellow-600 dark:text-yellow-400';
  if (percentageUsed >= 60) return 'text-blue-600 dark:text-blue-400';
  return 'text-green-600 dark:text-green-400';
};

export const getBudgetProgressBgColor = (percentageUsed: number): string => {
  if (percentageUsed >= 100) return 'bg-red-500';
  if (percentageUsed >= 80) return 'bg-yellow-500';
  if (percentageUsed >= 60) return 'bg-blue-500';
  return 'bg-green-500';
};

// Form validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

// Array utilities
export const sortByDate = <T extends { date: Date }>(items: T[], ascending = false): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortByAmount = <T extends { amount: number }>(items: T[], ascending = false): T[] => {
  return [...items].sort((a, b) => {
    return ascending ? a.amount - b.amount : b.amount - a.amount;
  });
};

// Local storage check
export const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
