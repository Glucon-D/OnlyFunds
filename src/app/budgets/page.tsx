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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Budgets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set and track your monthly spending limits by category
          </p>
        </div>
        <Button 
          onClick={() => setShowBudgetForm(true)}
          className="mt-4 sm:mt-0"
        >
          Set Budget
        </Button>
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
