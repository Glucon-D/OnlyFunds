/**
 * Expense Management Zustand Store
 *
 * This file contains the Zustand store for managing expense and income transactions.
 * Handles adding, fetching, deleting transactions, and provides utility methods
 * for filtering and calculating totals by type, category, and time period.
 * Central store for all transaction-related state management.
 * Now supports both localStorage and Appwrite cloud storage.
 */

import { create } from "zustand";
import {
  ExpenseStore,
  Transaction,
  TransactionType,
  ExpenseCategory,
  IncomeCategory,
} from "../types";
import {
  getTransactionsByUserId,
  addTransaction as addTransactionToDb,
  deleteTransaction as deleteTransactionFromDb,
} from "../utils/localDb";
import { appwriteTransactionService, syncService } from "../utils/appwriteDb";
import { generateId, getCurrentMonth, getCurrentYear } from "../utils/helpers";

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  // Initial state
  transactions: [],
  isLoading: false,

  // Actions
  addTransaction: async (transactionData, userId?: string) => {
    // userId will be passed from components that have access to auth store
    if (!userId) {
      console.error("No user ID provided");
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      userId: userId,
      ...transactionData,
      createdAt: new Date(),
    };

    // Add to local database first (for immediate UI update)
    addTransactionToDb(transaction);

    // Update state immediately
    set((state) => ({
      transactions: [...state.transactions, transaction],
    }));

    // Then sync to Appwrite in the background
    try {
      await appwriteTransactionService.createTransaction(transaction);
    } catch (error) {
      console.error("Failed to sync transaction to Appwrite:", error);
      // Note: Transaction is still saved locally, so user doesn't lose data
    }
  },

  fetchTransactions: async (userId?: string) => {
    set({ isLoading: true });

    try {
      if (!userId) {
        set({ transactions: [], isLoading: false });
        return;
      }

      // First, try to get data from localStorage (fast)
      const userTransactions = getTransactionsByUserId(userId);

      // Update state with local data immediately
      set({
        transactions: userTransactions,
        isLoading: false,
      });

      // Then, sync with Appwrite in the background (if configured)
      try {
        await syncService.syncTransactionsToLocal(userId);

        // Refresh local data after sync
        const syncedTransactions = getTransactionsByUserId(userId);
        set({
          transactions: syncedTransactions,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to sync transactions from Appwrite:", error);
        // Local data is still available, so continue normally
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      // Remove from local database first (for immediate UI update)
      deleteTransactionFromDb(id);

      // Update state immediately
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));

      // Then sync to Appwrite in the background
      try {
        await appwriteTransactionService.deleteTransaction(id);
      } catch (error) {
        console.error("Failed to delete transaction from Appwrite:", error);
        // Note: Transaction is still deleted locally
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  },

  getTransactionsByType: (type: TransactionType) => {
    const { transactions } = get();
    return transactions.filter((t) => t.type === type);
  },

  getTransactionsByCategory: (category: ExpenseCategory | IncomeCategory) => {
    const { transactions } = get();
    return transactions.filter((t) => t.category === category);
  },

  getTotalByType: (type: TransactionType) => {
    const { transactions } = get();
    return transactions
      .filter((t) => t.type === type)
      .reduce((total, t) => total + t.amount, 0);
  },

  getMonthlyTotal: (type: TransactionType, month?: number, year?: number) => {
    const { transactions } = get();
    const targetMonth = month || getCurrentMonth();
    const targetYear = year || getCurrentYear();

    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === type &&
          transactionDate.getMonth() + 1 === targetMonth &&
          transactionDate.getFullYear() === targetYear
        );
      })
      .reduce((total, t) => total + t.amount, 0);
  },
}));
