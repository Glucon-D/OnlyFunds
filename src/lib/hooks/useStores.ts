/**
 * Combined Store Hooks
 * 
 * This file provides custom hooks that combine multiple Zustand stores
 * to provide a unified interface for components. Handles the integration
 * between auth, expense, and budget stores, ensuring proper data flow
 * and user context across all store operations.
 */

import { useAuthStore, useExpenseStore, useBudgetStore } from '../zustand';
import { Transaction, Budget } from '../types';

// Enhanced expense store with user context
export const useExpenseStoreWithAuth = () => {
  const { user } = useAuthStore();
  const expenseStore = useExpenseStore();

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    expenseStore.addTransaction(transactionData);
  };

  const fetchTransactions = () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    expenseStore.fetchTransactions();
  };

  return {
    ...expenseStore,
    addTransaction,
    fetchTransactions,
  };
};

// Enhanced budget store with user context
export const useBudgetStoreWithAuth = () => {
  const { user } = useAuthStore();
  const budgetStore = useBudgetStore();

  const setBudget = (budgetData: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    budgetStore.setBudget(budgetData);
  };

  const fetchBudgets = () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    budgetStore.fetchBudgets();
  };

  return {
    ...budgetStore,
    setBudget,
    fetchBudgets,
  };
};

// Combined hook for components that need both expense and budget data
export const useFinancialData = () => {
  const { user, isLoggedIn } = useAuthStore();
  const expenseStore = useExpenseStoreWithAuth();
  const budgetStore = useBudgetStoreWithAuth();

  const refreshAllData = () => {
    if (isLoggedIn && user) {
      expenseStore.fetchTransactions();
      budgetStore.fetchBudgets();
    }
  };

  return {
    user,
    isLoggedIn,
    expenseStore,
    budgetStore,
    refreshAllData,
  };
};
