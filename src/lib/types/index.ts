/**
 * Type Definitions Barrel Export
 *
 * This file serves as the main entry point for all type definitions used throughout
 * the OnlyFunds application. It re-exports types from auth, expense, and budget modules
 * to provide a centralized import location for better developer experience.
 */

// Auth types
export type {
  User,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  AuthActions,
  AuthStore
} from './auth';

// Expense types
export {
  TransactionType,
  ExpenseCategory,
  IncomeCategory
} from './expense';

export type {
  Transaction,
  ExpenseState,
  ExpenseActions,
  ExpenseStore
} from './expense';

// Budget types
export type {
  Budget,
  BudgetProgress,
  BudgetState,
  BudgetActions,
  BudgetStore,
  BudgetMap
} from './budget';
