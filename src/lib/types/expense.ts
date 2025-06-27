/**
 * Expense and Transaction Type Definitions
 *
 * This file defines all types, enums, and interfaces related to financial transactions,
 * including expense and income categories, transaction types, and the expense store structure.
 * Central to the expense tracking functionality of the application.
 */

export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income'
}

export enum ExpenseCategory {
  FOOD = 'food',
  TRANSPORTATION = 'transportation',
  ENTERTAINMENT = 'entertainment',
  UTILITIES = 'utilities',
  HEALTHCARE = 'healthcare',
  SHOPPING = 'shopping',
  EDUCATION = 'education',
  OTHER = 'other'
}

export enum IncomeCategory {
  SALARY = 'salary',
  FREELANCE = 'freelance',
  INVESTMENT = 'investment',
  GIFT = 'gift',
  OTHER = 'other'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: ExpenseCategory | IncomeCategory;
  date: Date;
  createdAt: Date;
}

export interface ExpenseState {
  transactions: Transaction[];
  isLoading: boolean;
}

export interface ExpenseActions {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>, userId?: string) => void;
  fetchTransactions: (userId?: string) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getTransactionsByCategory: (category: ExpenseCategory | IncomeCategory) => Transaction[];
  getTotalByType: (type: TransactionType) => number;
  getMonthlyTotal: (type: TransactionType, month?: number, year?: number) => number;
}

export type ExpenseStore = ExpenseState & ExpenseActions;
