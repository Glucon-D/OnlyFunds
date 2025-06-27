/**
 * Budget Type Definitions
 *
 * This file contains all TypeScript interfaces and types related to budget management,
 * including budget data structure, progress tracking, and budget store actions.
 * Used for budget creation, monitoring, and progress calculation features.
 */

import { ExpenseCategory } from './expense';

export interface Budget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetProgress {
  category: ExpenseCategory;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface BudgetState {
  budgets: Budget[];
  budgetProgress: BudgetProgress[];
  isLoading: boolean;
}

export interface BudgetActions {
  setBudget: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId?: string) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  fetchBudgets: (userId?: string) => void;
  calculateBudgetProgress: (transactions?: any[], month?: number, year?: number) => void;
  getBudgetByCategory: (category: ExpenseCategory, month?: number, year?: number) => Budget | null;
}

export type BudgetStore = BudgetState & BudgetActions;

export type BudgetMap = Record<string, number>;
