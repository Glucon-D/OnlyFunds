/**
 * Zod Validation Schemas
 *
 * This file contains all Zod validation schemas used throughout the application
 * for form validation and data validation. Includes schemas for authentication,
 * transactions, budgets, and their corresponding form data transformations.
 * Ensures type safety and data integrity across the application.
 */

import { z } from 'zod';
import { TransactionType, ExpenseCategory, IncomeCategory } from '../types';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long')
});

export const signupSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters long')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Transaction validation schemas
export const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: 'Please select a valid transaction type' })
  }),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed $1,000,000'),
  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
  category: z.union([
    z.nativeEnum(ExpenseCategory),
    z.nativeEnum(IncomeCategory)
  ], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  date: z.date({
    errorMap: () => ({ message: 'Please select a valid date' })
  })
});

// Budget validation schemas
export const budgetSchema = z.object({
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  amount: z.number()
    .positive('Budget amount must be greater than 0')
    .max(100000, 'Budget amount cannot exceed $100,000'),
  month: z.number()
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12'),
  year: z.number()
    .min(2020, 'Year must be 2020 or later')
    .max(2030, 'Year cannot be more than 2030')
});

// Form data transformation schemas
export const transactionFormSchema = z.object({
  type: z.string().transform((val) => val as TransactionType),
  amount: z.string()
    .min(1, 'Amount is required')
    .transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Invalid amount');
      return num;
    }),
  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
  category: z.string()
    .min(1, 'Category is required'),
  customCategory: z.string().optional(),
  date: z.string()
    .min(1, 'Date is required')
    .transform((val) => new Date(val))
}).refine((data) => {
  // Validate category based on transaction type
  if (data.type === TransactionType.EXPENSE) {
    // Allow custom category when "other" is selected
    if (data.category === ExpenseCategory.OTHER) {
      return data.customCategory && data.customCategory.trim().length > 0;
    }
    return Object.values(ExpenseCategory).includes(data.category as ExpenseCategory);
  } else {
    // Allow custom category when "other" is selected
    if (data.category === IncomeCategory.OTHER) {
      return data.customCategory && data.customCategory.trim().length > 0;
    }
    return Object.values(IncomeCategory).includes(data.category as IncomeCategory);
  }
}, {
  message: 'Please specify a custom category when "Other" is selected, or choose a valid category',
  path: ['customCategory']
});

export const budgetFormSchema = z.object({
  category: z.string()
    .min(1, 'Category is required'),
  customCategory: z.string().optional(),
  amount: z.string()
    .min(1, 'Amount is required')
    .transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Invalid amount');
      return num;
    }),
  month: z.string()
    .min(1, 'Month is required')
    .transform((val) => parseInt(val, 10)),
  year: z.string()
    .min(1, 'Year is required')
    .transform((val) => parseInt(val, 10))
}).refine((data) => {
  // Allow custom category when "other" is selected
  if (data.category === ExpenseCategory.OTHER) {
    return data.customCategory && data.customCategory.trim().length > 0;
  }
  return Object.values(ExpenseCategory).includes(data.category as ExpenseCategory);
}, {
  message: 'Please specify a custom category when "Other" is selected, or choose a valid category',
  path: ['customCategory']
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type TransactionFormData = z.infer<typeof transactionFormSchema>;
export type BudgetFormData = z.infer<typeof budgetFormSchema>;
