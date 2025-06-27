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
  const { fetchTransactions, transactions } = useExpenseStore();
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
      {/* Enhanced Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="flex items-center mb-4 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                Transaction History
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Track all your income and expenses with detailed categorization
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Transactions</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {transactions.length}
              </p>
            </div>
            <Button
              onClick={() => setShowExpenseForm(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Transaction
            </Button>
          </div>
        </div>
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
