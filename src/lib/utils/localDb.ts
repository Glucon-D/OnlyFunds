/**
 * Local Storage Database Utilities
 *
 * This file provides an abstraction layer over localStorage for data persistence
 * in the OnlyFunds application. Handles storage and retrieval of user data,
 * transactions, budgets, and theme preferences. Includes error handling and
 * type-safe operations for all data entities.
 */

import { User, Transaction, Budget } from '../types';

// Storage keys
const STORAGE_KEYS = {
  USER: 'onlyfunds_user',
  USERS: 'onlyfunds_users',
  TRANSACTIONS: 'onlyfunds_transactions',
  BUDGETS: 'onlyfunds_budgets',
  THEME: 'onlyfunds_theme'
} as const;

// Generic localStorage utilities
export const saveItem = <T>(key: string, value: T): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getItem = <T>(key: string): T | null => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const removeItem = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// User-specific utilities
export const saveUser = (user: User): void => {
  saveItem(STORAGE_KEYS.USER, user);
};

export const getUser = (): User | null => {
  const user = getItem<User>(STORAGE_KEYS.USER);
  if (user && user.createdAt) {
    // Convert date string back to Date object
    user.createdAt = new Date(user.createdAt);
  }
  return user;
};

export const removeUser = (): void => {
  removeItem(STORAGE_KEYS.USER);
};

// Users database (for local authentication)
export const saveUserToDatabase = (user: User, hashedPassword: string): void => {
  const users = getItem<Record<string, { user: User; hashedPassword: string }>>(STORAGE_KEYS.USERS) || {};
  users[user.email] = { user, hashedPassword };
  saveItem(STORAGE_KEYS.USERS, users);
};

export const getUserFromDatabase = (email: string): { user: User; hashedPassword: string } | null => {
  const users = getItem<Record<string, { user: User; hashedPassword: string }>>(STORAGE_KEYS.USERS) || {};
  const userData = users[email];
  if (userData && userData.user.createdAt) {
    // Convert date string back to Date object
    userData.user.createdAt = new Date(userData.user.createdAt);
  }
  return userData || null;
};

export const checkUserExists = (email: string): boolean => {
  const users = getItem<Record<string, { user: User; hashedPassword: string }>>(STORAGE_KEYS.USERS) || {};
  return email in users;
};

// Transaction utilities
export const saveTransactions = (transactions: Transaction[]): void => {
  saveItem(STORAGE_KEYS.TRANSACTIONS, transactions);
};

export const getTransactions = (): Transaction[] => {
  const transactions = getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
  // Convert date strings back to Date objects
  return transactions.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date),
    createdAt: new Date(transaction.createdAt)
  }));
};

export const addTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  saveTransactions(transactions);
};

export const deleteTransaction = (transactionId: string): void => {
  const transactions = getTransactions();
  const filteredTransactions = transactions.filter(t => t.id !== transactionId);
  saveTransactions(filteredTransactions);
};

export const getTransactionsByUserId = (userId: string): Transaction[] => {
  const transactions = getTransactions();
  return transactions.filter(t => t.userId === userId);
};

// Budget utilities
export const saveBudgets = (budgets: Budget[]): void => {
  saveItem(STORAGE_KEYS.BUDGETS, budgets);
};

export const getBudgets = (): Budget[] => {
  const budgets = getItem<Budget[]>(STORAGE_KEYS.BUDGETS) || [];
  // Convert date strings back to Date objects
  return budgets.map(budget => ({
    ...budget,
    createdAt: new Date(budget.createdAt),
    updatedAt: new Date(budget.updatedAt)
  }));
};

export const addBudget = (budget: Budget): void => {
  const budgets = getBudgets();
  budgets.push(budget);
  saveBudgets(budgets);
};

export const updateBudget = (budgetId: string, updates: Partial<Budget>): void => {
  const budgets = getBudgets();
  const budgetIndex = budgets.findIndex(b => b.id === budgetId);
  if (budgetIndex !== -1) {
    budgets[budgetIndex] = { ...budgets[budgetIndex], ...updates, updatedAt: new Date() };
    saveBudgets(budgets);
  }
};

export const deleteBudget = (budgetId: string): void => {
  const budgets = getBudgets();
  const filteredBudgets = budgets.filter(b => b.id !== budgetId);
  saveBudgets(filteredBudgets);
};

export const getBudgetsByUserId = (userId: string): Budget[] => {
  const budgets = getBudgets();
  return budgets.filter(b => b.userId === userId);
};

// Theme utilities
export const saveTheme = (theme: 'light' | 'dark'): void => {
  saveItem(STORAGE_KEYS.THEME, theme);
};

export const getTheme = (): 'light' | 'dark' => {
  return getItem<'light' | 'dark'>(STORAGE_KEYS.THEME) || 'light';
};

// Clear all data (for testing or reset)
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key);
  });
};
