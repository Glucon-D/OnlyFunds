/**
 * Dashboard Page Component
 * 
 * The main dashboard page for authenticated users. Displays a welcome message,
 * financial overview with income vs expense summary, recent transactions,
 * and quick action buttons. Includes route protection to redirect
 * unauthenticated users to the login page.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useExpenseStore } from '@/lib/zustand';
import { TransactionType } from '@/lib/types';
import { formatCurrency, getCurrentMonth, getCurrentYear } from '@/lib/utils/helpers';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuthStore();
  const { fetchTransactions, getMonthlyTotal } = useExpenseStore();
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

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const monthlyIncome = getMonthlyTotal(TransactionType.INCOME, currentMonth, currentYear);
  const monthlyExpenses = getMonthlyTotal(TransactionType.EXPENSE, currentMonth, currentYear);
  const netIncome = monthlyIncome - monthlyExpenses;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Here's your financial overview for {monthNames[currentMonth - 1]} {currentYear}
        </p>
      </div>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="text-emerald-600 dark:text-emerald-400 flex items-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(monthlyIncome)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(monthlyExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className={`flex items-center ${netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${netIncome >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setShowExpenseForm(true)}>
            Add Transaction
          </Button>
          <Button variant="outline" onClick={() => router.push('/transactions')}>
            View All Transactions
          </Button>
          <Button variant="outline" onClick={() => router.push('/budgets')}>
            Manage Budgets
          </Button>
        </div>
      </div>

      {/* Add Transaction Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-lg">
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

      {/* Financial Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-300">
            {netIncome >= 0 
              ? "Great job! You're spending less than you earn this month. Consider setting aside some money for savings or investments."
              : "You're spending more than you earn this month. Review your expenses and consider creating a budget to better manage your finances."
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
