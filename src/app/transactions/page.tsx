/**
 * Transactions Page Component
 * 
 * A page for viewing and managing all user transactions. Displays the
 * TransactionList component with filtering and sorting capabilities,
 * and includes a button to add new transactions. Includes route protection
 * to redirect unauthenticated users to the login page.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useExpenseStore } from '@/lib/zustand';
import { Button } from '@/components/ui/Button';
import { TransactionList } from '@/components/expenses/TransactionList';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export default function TransactionsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuthStore();
  const { fetchTransactions } = useExpenseStore();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchTransactions(user.id);
    }
  }, [isLoggedIn, user?.id, fetchTransactions]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your income and expense transactions
          </p>
        </div>
        <Button 
          onClick={() => setShowExpenseForm(true)}
          className="mt-4 sm:mt-0"
        >
          Add Transaction
        </Button>
      </div>

      {/* Transaction List */}
      <TransactionList />

      {/* Add Transaction Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <ExpenseForm
              onSuccess={() => {
                setShowExpenseForm(false);
                if (user?.id) {
                  fetchTransactions(user.id); // Refresh data
                }
              }}
              onCancel={() => setShowExpenseForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
