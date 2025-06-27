/**
 * Expense Management Zustand Store
 *
 * This file contains the Zustand store for managing expense and income transactions.
 * Handles adding, fetching, deleting transactions, and provides utility methods
 * for filtering and calculating totals by type, category, and time period.
 * Central store for all transaction-related state management.
 */

import { create } from 'zustand';
import { ExpenseStore, Transaction, TransactionType, ExpenseCategory, IncomeCategory } from '../types';
import {
  getTransactionsByUserId,
  addTransaction as addTransactionToDb,
  deleteTransaction as deleteTransactionFromDb
} from '../utils/localDb';
import { generateId, getCurrentMonth, getCurrentYear } from '../utils/helpers';

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  transactions: [],
  isLoading: false,

  // Actions
  addTransaction: (transactionData, userId?: string) => {
    // userId will be passed from components that have access to auth store
    if (!userId) {
      console.error('No user ID provided');
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      userId: userId,
      ...transactionData,
      createdAt: new Date()
    };

    // Add to local database
    addTransactionToDb(transaction);

    // Update state
    set(state => ({
      transactions: [...state.transactions, transaction]
    }));
  },

  fetchTransactions: (userId?: string) => {
    set({ isLoading: true });

    try {
      if (!userId) {
        set({ transactions: [], isLoading: false });
        return;
      }

      const userTransactions = getTransactionsByUserId(userId);
      
      set({
        transactions: userTransactions,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ isLoading: false });
    }
  },

  deleteTransaction: (id: string) => {
    try {
      // Remove from local database
      deleteTransactionFromDb(id);

      // Update state
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  },

  getTransactionsByType: (type: TransactionType) => {
    const { transactions } = get();
    return transactions.filter(t => t.type === type);
  },

  getTransactionsByCategory: (category: ExpenseCategory | IncomeCategory) => {
    const { transactions } = get();
    return transactions.filter(t => t.category === category);
  },

  getTotalByType: (type: TransactionType) => {
    const { transactions } = get();
    return transactions
      .filter(t => t.type === type)
      .reduce((total, t) => total + t.amount, 0);
  },

  getMonthlyTotal: (type: TransactionType, month?: number, year?: number) => {
    const { transactions } = get();
    const targetMonth = month || getCurrentMonth();
    const targetYear = year || getCurrentYear();

    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.type === type &&
          transactionDate.getMonth() + 1 === targetMonth &&
          transactionDate.getFullYear() === targetYear
        );
      })
      .reduce((total, t) => total + t.amount, 0);
  }
}));
