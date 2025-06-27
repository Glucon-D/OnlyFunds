/**
 * Budget Management Zustand Store
 *
 * This file contains the Zustand store for managing budgets and budget progress tracking.
 * Handles creating, updating, deleting budgets, and calculating budget progress
 * by comparing actual spending against budget limits. Provides real-time budget
 * monitoring and overspending alerts.
 */

import { create } from 'zustand';
import { BudgetStore, Budget, BudgetProgress, ExpenseCategory, TransactionType } from '../types';
import { 
  getBudgetsByUserId, 
  addBudget as addBudgetToDb, 
  updateBudget as updateBudgetInDb, 
  deleteBudget as deleteBudgetFromDb 
} from '../utils/localDb';
import { generateId, getCurrentMonth, getCurrentYear } from '../utils/helpers';

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  // Initial state
  budgets: [],
  budgetProgress: [],
  isLoading: false,

  // Actions
  setBudget: (budgetData, userId?: string) => {
    if (!userId) {
      console.error('No user ID provided');
      return;
    }

    // Check if budget already exists for this category, month, and year
    const existingBudget = get().budgets.find(b =>
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
        updatedAt: new Date()
      };

      updateBudgetInDb(existingBudget.id, updatedBudget);

      set(state => ({
        budgets: state.budgets.map(b => 
          b.id === existingBudget.id ? updatedBudget : b
        )
      }));
    } else {
      // Create new budget
      const newBudget: Budget = {
        id: generateId(),
        userId: userId,
        ...budgetData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addBudgetToDb(newBudget);

      set(state => ({
        budgets: [...state.budgets, newBudget]
      }));
    }

    // Recalculate budget progress
    get().calculateBudgetProgress([], budgetData.month, budgetData.year);
  },

  updateBudget: (id: string, updates: Partial<Budget>) => {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };

      updateBudgetInDb(id, updatedData);

      set(state => ({
        budgets: state.budgets.map(b => 
          b.id === id ? { ...b, ...updatedData } : b
        )
      }));

      // Recalculate budget progress
      get().calculateBudgetProgress([]);
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  },

  deleteBudget: (id: string) => {
    try {
      deleteBudgetFromDb(id);

      set(state => ({
        budgets: state.budgets.filter(b => b.id !== id)
      }));

      // Recalculate budget progress
      get().calculateBudgetProgress([]);
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  },

  fetchBudgets: (userId?: string) => {
    set({ isLoading: true });

    try {
      if (!userId) {
        set({ budgets: [], isLoading: false });
        return;
      }

      const userBudgets = getBudgetsByUserId(userId);
      
      set({
        budgets: userBudgets,
        isLoading: false
      });

      // Calculate budget progress for current month
      get().calculateBudgetProgress([]);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      set({ isLoading: false });
    }
  },

  calculateBudgetProgress: (transactions: any[] = [], month?: number, year?: number) => {
    const { budgets } = get();

    const targetMonth = month || getCurrentMonth();
    const targetYear = year || getCurrentYear();

    // If no transactions provided, try to get from expense store
    let transactionsToUse = transactions;
    if (transactions.length === 0 && typeof window !== 'undefined') {
      // Get transactions from expense store if available
      const expenseStore = (window as any).__expenseStore;
      if (expenseStore && expenseStore.getState) {
        transactionsToUse = expenseStore.getState().transactions || [];
      }
    }

    const progress: BudgetProgress[] = budgets
      .filter(b => b.month === targetMonth && b.year === targetYear)
      .map(budget => {
        // Calculate spent amount for this category in the target month/year
        const spentAmount = transactionsToUse
          .filter((t: any) => {
            const transactionDate = new Date(t.date);
            return (
              t.type === TransactionType.EXPENSE &&
              t.category === budget.category &&
              transactionDate.getMonth() + 1 === targetMonth &&
              transactionDate.getFullYear() === targetYear
            );
          })
          .reduce((total: number, t: any) => total + t.amount, 0);

        const remainingAmount = budget.amount - spentAmount;
        const percentageUsed = budget.amount > 0 ? Math.round((spentAmount / budget.amount) * 100) : 0;

        return {
          category: budget.category,
          budgetAmount: budget.amount,
          spentAmount,
          remainingAmount,
          percentageUsed,
          isOverBudget: spentAmount > budget.amount
        };
      });

    set({ budgetProgress: progress });
  },

  getBudgetByCategory: (category: ExpenseCategory, month?: number, year?: number) => {
    const { budgets } = get();
    const targetMonth = month || getCurrentMonth();
    const targetYear = year || getCurrentYear();

    return budgets.find(b => 
      b.category === category && 
      b.month === targetMonth && 
      b.year === targetYear
    ) || null;
  }
}));
