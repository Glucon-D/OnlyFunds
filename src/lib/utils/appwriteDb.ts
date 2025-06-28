/**
 * Appwrite Database Service
 *
 * This file provides database operations for Appwrite backend.
 * Handles CRUD operations for transactions and budgets with error handling
 * and type safety. Used as a cloud storage layer alongside localStorage.
 */

import { databases, appwriteConfig, isConfigured } from "../config/appwrite";
import { Transaction, Budget } from "../types";
import { ID, Query } from "appwrite";

// Transaction Database Operations
export const appwriteTransactionService = {
  // Create a new transaction
  async createTransaction(
    transaction: Transaction
  ): Promise<Transaction | null> {
    if (!isConfigured) {
      console.warn("Appwrite not configured, skipping cloud save");
      return null;
    }

    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        ID.unique(),
        {
          id: transaction.id,
          userId: transaction.userId,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          date: transaction.date.toISOString(),
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.createdAt.toISOString(),
        }
      );

      return {
        id: response.id,
        userId: response.userId,
        type: response.type,
        amount: response.amount,
        description: response.description,
        category: response.category,
        date: new Date(response.date),
        createdAt: new Date(response.createdAt),
      };
    } catch (error) {
      console.error("Error creating transaction in Appwrite:", error);
      return null;
    }
  },

  // Get transactions by user ID
  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    if (!isConfigured) {
      console.warn("Appwrite not configured, returning empty array");
      return [];
    }

    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        [Query.equal("userId", userId), Query.orderDesc("createdAt")]
      );

      return response.documents.map((doc: any) => ({
        id: doc.id,
        userId: doc.userId,
        type: doc.type,
        amount: doc.amount,
        description: doc.description,
        category: doc.category,
        date: new Date(doc.date),
        createdAt: new Date(doc.createdAt),
      }));
    } catch (error) {
      console.error("Error fetching transactions from Appwrite:", error);
      return [];
    }
  },

  // Delete a transaction
  async deleteTransaction(transactionId: string): Promise<boolean> {
    if (!isConfigured) {
      console.warn("Appwrite not configured, skipping cloud delete");
      return false;
    }

    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        [Query.equal("id", transactionId)]
      );

      if (response.documents.length === 0) {
        console.warn("Transaction not found for deletion:", transactionId);
        return false;
      }

      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        response.documents[0].$id
      );
      return true;
    } catch (error) {
      console.error("Error deleting transaction from Appwrite:", error);
      return false;
    }
  },

  // Update a transaction
  async updateTransaction(
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<Transaction | null> {
    if (!isConfigured) {
      console.warn("Appwrite not configured, skipping cloud update");
      return null;
    }

    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        [Query.equal("id", transactionId)]
      );

      if (response.documents.length === 0) {
        console.warn("Transaction not found for update:", transactionId);
        return null;
      }

      const updateData: any = {};

      if (updates.type) updateData.type = updates.type;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.description) updateData.description = updates.description;
      if (updates.category) updateData.category = updates.category;
      if (updates.date) updateData.date = updates.date.toISOString();

      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date().toISOString();

      const updateResponse = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        response.documents[0].$id,
        updateData
      );

      return {
        id: updateResponse.id,
        userId: updateResponse.userId,
        type: updateResponse.type,
        amount: updateResponse.amount,
        description: updateResponse.description,
        category: updateResponse.category,
        date: new Date(updateResponse.date),
        createdAt: new Date(updateResponse.createdAt),
      };
    } catch (error) {
      console.error("Error updating transaction in Appwrite:", error);
      return null;
    }
  },
};

// Budget Database Operations
export const appwriteBudgetService = {
  // Create a new budget
  async createBudget(budget: Budget): Promise<Budget | null> {
    if (!isConfigured) {
      console.warn("Appwrite not configured, skipping cloud save");
      return null;
    }

    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.budgetsCollectionId,
        ID.unique(),
        {
          id: budget.id,
          userId: budget.userId,
          category: budget.category,
          amount: budget.amount,
          month: budget.month,
          year: budget.year,
          createdAt: budget.createdAt.toISOString(),
          updatedAt: budget.updatedAt.toISOString(),
        }
      );

      return {
        id: response.id,
        userId: response.userId,
        category: response.category,
        amount: response.amount,
        month: response.month,
        year: response.year,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      console.error("Error creating budget in Appwrite:", error);
      return null;
    }
  },

  // Get budgets by user ID
  async getBudgetsByUserId(userId: string): Promise<Budget[]> {
    if (!isConfigured) {
      console.warn("Appwrite not configured, returning empty array");
      return [];
    }

    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.budgetsCollectionId,
        [Query.equal("userId", userId), Query.orderDesc("createdAt")]
      );

      return response.documents.map((doc: any) => ({
        id: doc.id,
        userId: doc.userId,
        category: doc.category,
        amount: doc.amount,
        month: doc.month,
        year: doc.year,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
    } catch (error) {
      console.error("Error fetching budgets from Appwrite:", error);
      return [];
    }
  },

  // Update a budget
  async updateBudget(
    budgetId: string,
    updates: Partial<Budget>
  ): Promise<Budget | null> {
    if (!isConfigured) {
      console.warn("Appwrite not configured, skipping cloud update");
      return null;
    }

    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.budgetsCollectionId,
        [Query.equal("id", budgetId)]
      );

      if (response.documents.length === 0) {
        console.warn("Budget not found for update:", budgetId);
        return null;
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (updates.category) updateData.category = updates.category;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.month !== undefined) updateData.month = updates.month;
      if (updates.year !== undefined) updateData.year = updates.year;

      const updateResponse = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.budgetsCollectionId,
        response.documents[0].$id,
        updateData
      );

      return {
        id: updateResponse.id,
        userId: updateResponse.userId,
        category: updateResponse.category,
        amount: updateResponse.amount,
        month: updateResponse.month,
        year: updateResponse.year,
        createdAt: new Date(updateResponse.createdAt),
        updatedAt: new Date(updateResponse.updatedAt),
      };
    } catch (error) {
      console.error("Error updating budget in Appwrite:", error);
      return null;
    }
  },

  // Delete a budget
  async deleteBudget(budgetId: string): Promise<boolean> {
    if (!isConfigured) {
      console.warn("Appwrite not configured, skipping cloud delete");
      return false;
    }

    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.budgetsCollectionId,
        [Query.equal("id", budgetId)]
      );

      if (response.documents.length === 0) {
        console.warn("Budget not found for deletion:", budgetId);
        return false;
      }

      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.budgetsCollectionId,
        response.documents[0].$id
      );
      return true;
    } catch (error) {
      console.error("Error deleting budget from Appwrite:", error);
      return false;
    }
  },
};

// Sync utilities for data synchronization
export const syncService = {
  // Sync transactions from Appwrite to localStorage
  async syncTransactionsToLocal(userId: string): Promise<void> {
    try {
      const cloudTransactions =
        await appwriteTransactionService.getTransactionsByUserId(userId);
      if (cloudTransactions.length > 0) {
        const { saveTransactions } = await import("./localDb");
        const localTransactions = (
          await import("./localDb")
        ).getTransactionsByUserId(userId);

        // Simple merge: prefer cloud data and add missing local transactions
        const allTransactions = [...cloudTransactions];
        localTransactions.forEach((localTx) => {
          if (!cloudTransactions.find((cloudTx) => cloudTx.id === localTx.id)) {
            allTransactions.push(localTx);
          }
        });

        saveTransactions(allTransactions);
      }
    } catch (error) {
      console.error("Error syncing transactions to local:", error);
    }
  },

  // Sync budgets from Appwrite to localStorage
  async syncBudgetsToLocal(userId: string): Promise<void> {
    try {
      const cloudBudgets = await appwriteBudgetService.getBudgetsByUserId(
        userId
      );
      if (cloudBudgets.length > 0) {
        const { saveBudgets } = await import("./localDb");
        const localBudgets = (await import("./localDb")).getBudgetsByUserId(
          userId
        );

        // Simple merge: prefer cloud data and add missing local budgets
        const allBudgets = [...cloudBudgets];
        localBudgets.forEach((localBudget) => {
          if (
            !cloudBudgets.find(
              (cloudBudget) => cloudBudget.id === localBudget.id
            )
          ) {
            allBudgets.push(localBudget);
          }
        });

        saveBudgets(allBudgets);
      }
    } catch (error) {
      console.error("Error syncing budgets to local:", error);
    }
  },
};
