/**
 * Budgets Page Component
 * 
 * A page for managing budgets and viewing budget progress. Displays the
 * BudgetList component showing current budget status and includes functionality
 * to add new budgets. Includes route protection to redirect unauthenticated
 * users to the login page.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useBudgetStore, useExpenseStore } from '@/lib/zustand';
import { Button } from '@/components/ui/Button';
import { BudgetList } from '@/components/budgets/BudgetList';
import { BudgetForm } from '@/components/budgets/BudgetForm';

export default function BudgetsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuthStore();
  const { fetchBudgets } = useBudgetStore();
  const { fetchTransactions } = useExpenseStore();
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchBudgets(user.id);
      fetchTransactions(user.id); // Needed for budget progress calculation
    }
  }, [isLoggedIn, user?.id, fetchBudgets, fetchTransactions]);

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
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                Budget Management
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Set monthly spending limits and track your progress in real-time
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current Period</p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Button
              onClick={() => setShowBudgetForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Budget
            </Button>
          </div>
        </div>
      </div>

      {/* Budget List */}
      <BudgetList />

      {/* Set Budget Form Modal */}
      {showBudgetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <BudgetForm
              onSuccess={() => {
                setShowBudgetForm(false);
                if (user?.id) {
                  fetchBudgets(user.id); // Refresh data
                }
              }}
              onCancel={() => setShowBudgetForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
