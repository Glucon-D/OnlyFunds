/**
 * Budget Management Zustand Store
 *
 * This file contains the Zustand store for managing budgets and budget progress tracking.
 * Handles creating, updating, deleting budgets, and calculating budget progress
 * by comparing actual spending against budget limits. Provides real-time budget
 * monitoring and overspending alerts.
 * Now supports both localStorage and Appwrite cloud storage.
 */

import { create } from "zustand";
import {
  BudgetStore,
  Budget,
  BudgetProgress,
  ExpenseCategory,
  TransactionType,
  Transaction,
} from "../types";
import {
  getBudgetsByUserId,
  addBudget as addBudgetToDb,
  updateBudget as updateBudgetInDb,
  deleteBudget as deleteBudgetFromDb,
} from "../utils/localDb";
import { appwriteBudgetService, syncService } from "../utils/appwriteDb";
import { generateId, getCurrentMonth, getCurrentYear } from "../utils/helpers";

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  // Initial state
  budgets: [],
  budgetProgress: [],
  isLoading: false,

  // Actions
  setBudget: async (budgetData, userId?: string) => {
    if (!userId) {
      console.error("No user ID provided");
      return;
    }

    // Check if budget already exists for this category, month, and year
    const existingBudget = get().budgets.find(
      (b) =>
        b.category === budgetData.category &&
        b.month === budgetData.month &&
        b.year === budgetData.year &&
        b.userId === userId
    );

    if (existingBudget) {
      // Update existing budget
      const updatedBudget = {
        ...existingBudget,
        amount: budgetData.amount,
        updatedAt: new Date(),
      };

      // Update in local database first (for immediate UI update)
      updateBudgetInDb(existingBudget.id, updatedBudget);

      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === existingBudget.id ? updatedBudget : b
        ),
      }));

      // Then sync to Appwrite in the background
      try {
        await appwriteBudgetService.updateBudget(
          existingBudget.id,
          updatedBudget
        );
      } catch (error) {
        console.error("Failed to sync budget update to Appwrite:", error);
      }
    } else {
      // Create new budget
      const newBudget: Budget = {
        id: generateId(),
        userId: userId,
        ...budgetData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to local database first (for immediate UI update)
      addBudgetToDb(newBudget);

      set((state) => ({
        budgets: [...state.budgets, newBudget],
      }));

      // Then sync to Appwrite in the background
      try {
        await appwriteBudgetService.createBudget(newBudget);
      } catch (error) {
        console.error("Failed to sync new budget to Appwrite:", error);
      }
    }

    // Recalculate budget progress
    get().calculateBudgetProgress([], budgetData.month, budgetData.year);
  },

  updateBudget: async (id: string, updates: Partial<Budget>) => {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date(),
      };

      // Update in local database first (for immediate UI update)
      updateBudgetInDb(id, updatedData);

      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === id ? { ...b, ...updatedData } : b
        ),
      }));

      // Then sync to Appwrite in the background
      try {
        await appwriteBudgetService.updateBudget(id, updatedData);
      } catch (error) {
        console.error("Failed to sync budget update to Appwrite:", error);
      }

      // Recalculate budget progress
      get().calculateBudgetProgress([]);
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  },

  deleteBudget: async (id: string) => {
    try {
      // Delete from local database first (for immediate UI update)
      deleteBudgetFromDb(id);

      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      }));

      // Then sync to Appwrite in the background
      try {
        await appwriteBudgetService.deleteBudget(id);
      } catch (error) {
        console.error("Failed to delete budget from Appwrite:", error);
      }

      // Recalculate budget progress
      get().calculateBudgetProgress([]);
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  },

  fetchBudgets: async (userId?: string) => {
    set({ isLoading: true });

    try {
      if (!userId) {
        set({ budgets: [], isLoading: false });
        return;
      }

      // First, try to get data from localStorage (fast)
      const userBudgets = getBudgetsByUserId(userId);

      // Update state with local data immediately
      set({
        budgets: userBudgets,
        isLoading: false,
      });

      // Calculate budget progress for current month
      get().calculateBudgetProgress([]);

      // Then, sync with Appwrite in the background (if configured)
      try {
        await syncService.syncBudgetsToLocal(userId);

        // Refresh local data after sync
        const syncedBudgets = getBudgetsByUserId(userId);
        set({
          budgets: syncedBudgets,
          isLoading: false,
        });

        // Recalculate budget progress after sync
        get().calculateBudgetProgress([]);
      } catch (error) {
        console.error("Failed to sync budgets from Appwrite:", error);
        // Local data is still available, so continue normally
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
      set({ isLoading: false });
    }
  },

  calculateBudgetProgress: (
    transactions: Transaction[] = [],
    month?: number,
    year?: number
  ) => {
    const { budgets } = get();

    const targetMonth = month || getCurrentMonth();
    const targetYear = year || getCurrentYear();

    // Use provided transactions or empty array if none provided
    const transactionsToUse = transactions;

    const progress: BudgetProgress[] = budgets
      .filter((b) => b.month === targetMonth && b.year === targetYear)
      .map((budget) => {
        // Calculate spent amount for this category in the target month/year
        const relevantTransactions = transactionsToUse.filter(
          (t: Transaction) => {
            const transactionDate = new Date(t.date);
            return (
              t.type === TransactionType.EXPENSE &&
              t.category === budget.category &&
              transactionDate.getMonth() + 1 === targetMonth &&
              transactionDate.getFullYear() === targetYear
            );
          }
        );

        const spentAmount = relevantTransactions.reduce(
          (total: number, t: Transaction) => total + t.amount,
          0
        );

        const remainingAmount = budget.amount - spentAmount;
        const percentageUsed =
          budget.amount > 0
            ? Math.round((spentAmount / budget.amount) * 100)
            : 0;

        // console.log(`Budget Progress for ${budget.category}:`, {
        //   budgetAmount: budget.amount,
        //   spentAmount,
        //   remainingAmount,
        //   percentageUsed,
        //   relevantTransactionsCount: relevantTransactions.length,
        //   totalTransactions: transactionsToUse.length,
        // });

        return {
          category: budget.category,
          budgetAmount: budget.amount,
          spentAmount,
          remainingAmount,
          percentageUsed,
          isOverBudget: spentAmount > budget.amount,
        };
      });

    // Only update if progress has actually changed to prevent unnecessary re-renders
    const currentProgress = get().budgetProgress;
    const hasChanged =
      progress.length !== currentProgress.length ||
      progress.some((p, index) => {
        const current = currentProgress[index];
        return (
          !current ||
          p.percentageUsed !== current.percentageUsed ||
          p.spentAmount !== current.spentAmount ||
          p.isOverBudget !== current.isOverBudget
        );
      });

    if (hasChanged) {
      // console.log("Setting budget progress:", progress);
      set({ budgetProgress: progress });
    } else {
      // console.log("Budget progress unchanged, skipping update");
    }
  },

  getBudgetByCategory: (
    category: ExpenseCategory,
    month?: number,
    year?: number
  ) => {
    const { budgets } = get();
    const targetMonth = month || getCurrentMonth();
    const targetYear = year || getCurrentYear();

    return (
      budgets.find(
        (b) =>
          b.category === category &&
          b.month === targetMonth &&
          b.year === targetYear
      ) || null
    );
  },
}));
