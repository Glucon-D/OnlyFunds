/**
 * Budgets Page Component
 *
 * A page for managing budgets and viewing budget progress. Displays the
 * BudgetList component showing current budget status and includes functionality
 * to add new budgets. Includes route protection to redirect unauthenticated
 * users to the login page.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useBudgetStore, useExpenseStore } from "@/lib/zustand";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { BudgetList } from "@/components/budgets/BudgetList";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthOptions,
  getYearOptions,
  getMonthName,
} from "@/lib/utils/helpers";

export default function BudgetsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuthStore();
  const { fetchBudgets, budgetProgress, calculateBudgetProgress } =
    useBudgetStore();
  const { fetchTransactions, transactions } = useExpenseStore();
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Selected month/year state
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchBudgets(user.id);
      fetchTransactions(user.id); // Needed for budget progress calculation
    }
  }, [isLoggedIn, user?.id, fetchBudgets, fetchTransactions]);

  // Recalculate budget progress when month/year changes
  useEffect(() => {
    if (transactions.length > 0) {
      calculateBudgetProgress(transactions, selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, transactions, calculateBudgetProgress]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const monthOptions = getMonthOptions().map((option) => ({
    value: option.value.toString(),
    label: option.label,
  }));

  const yearOptions = getYearOptions(2020, 2030).map((option) => ({
    value: option.value.toString(),
    label: option.label,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/20">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
              Loading your budgets...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  // Calculate summary statistics
  const totalBudget = budgetProgress.reduce(
    (sum, budget) => sum + budget.budgetAmount,
    0
  );
  const totalSpent = budgetProgress.reduce(
    (sum, budget) => sum + budget.spentAmount,
    0
  );
  const totalRemaining = totalBudget - totalSpent;
  const overBudgetCount = budgetProgress.filter(
    (budget) => budget.isOverBudget
  ).length;

  return (
    <div
      className="min-h-screen "
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl mb-12">
        {/* Enhanced Hero Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
              Budget Management
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Take control of your finances with smart budgeting and real-time
              spending insights
            </p>
          </div>

          {/* Quick Stats Cards */}
          {budgetProgress.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Total Budget
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-600 dark:text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${totalSpent.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      totalRemaining >= 0
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        totalRemaining >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Remaining
                </p>
                <p
                  className={`text-2xl font-bold ${
                    totalRemaining >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ${Math.abs(totalRemaining).toLocaleString()}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      overBudgetCount > 0
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-emerald-100 dark:bg-emerald-900/30"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        overBudgetCount > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Budgets
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {budgetProgress.length}
                  {overBudgetCount > 0 && (
                    <span className="text-sm text-red-500 dark:text-red-400 ml-2">
                      ({overBudgetCount} over)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Action Bar with Month/Year Selection */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
            {/* Period Selection */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Viewing Period
                </p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {getMonthName(selectedMonth)} {selectedYear}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-slate-500 dark:text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <Select
                    name="month"
                    value={selectedMonth.toString()}
                    onChange={handleMonthChange}
                    options={monthOptions}
                    className="min-w-[120px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    name="year"
                    value={selectedYear.toString()}
                    onChange={handleYearChange}
                    options={yearOptions}
                    className="min-w-[100px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50"
                  />
                </div>
              </div>
            </div>

            {/* Create Budget Button */}
            <Button
              onClick={() => setShowBudgetForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 px-6 py-3"
              size="lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create New Budget
            </Button>
          </div>
        </div>

        {/* Budget List */}
        <div className="animate-fade-in-up">
          <BudgetList
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>

        {/* Enhanced Budget Form Modal */}
        {showBudgetForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md border border-slate-200/50 dark:border-slate-700/50 animate-scale-in">
              <BudgetForm
                defaultMonth={selectedMonth}
                defaultYear={selectedYear}
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
    </div>
  );
}
