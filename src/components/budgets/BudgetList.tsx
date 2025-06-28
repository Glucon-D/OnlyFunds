/**
 * Budget List Component
 *
 * A component that displays budget progress for all categories with visual progress bars.
 * Shows budget amount, spent amount, remaining amount, and percentage used.
 * Includes color-coded progress indicators and budget deletion functionality.
 * Integrates with both budget and expense stores for comprehensive budget tracking.
 */

"use client";

import React, { useEffect } from "react";
import { useBudgetStore, useExpenseStore, useAuthStore } from "@/lib/zustand";
import {
  formatCurrency,
  getCategoryDisplayName,
  getBudgetProgressBgColor,
} from "@/lib/utils/helpers";
import { ExpenseCategory } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export const BudgetList: React.FC = () => {
  const { budgetProgress, fetchBudgets, calculateBudgetProgress } =
    useBudgetStore();
  const { transactions, fetchTransactions } = useExpenseStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      fetchBudgets(user.id);
      fetchTransactions(user.id);
    }
  }, [fetchBudgets, fetchTransactions, user?.id]);

  useEffect(() => {
    // Recalculate budget progress when transactions change
    calculateBudgetProgress(transactions);
  }, [transactions, calculateBudgetProgress]);

  const handleDeleteBudget = (category: ExpenseCategory) => {
    if (
      window.confirm(
        `Are you sure you want to delete the budget for ${getCategoryDisplayName(
          category
        )}?`
      )
    ) {
      // This is a simplified approach - in a real app, you'd want to pass the budget ID
      // For now, we'll need to modify the store to handle deletion by category/month/year
      console.log("Delete budget for category:", category);
    }
  };

  if (budgetProgress.length === 0) {
    return (
      <div className="relative">
        <Card className="w-full border-dashed border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 dark:from-slate-800 dark:via-slate-800/80 dark:to-emerald-900/10">
          <CardContent className="py-20">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <svg
                    className="w-12 h-12 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-2 h-2 bg-emerald-400 rounded-full opacity-60"></div>
                <div className="absolute bottom-0 right-1/3 w-1 h-1 bg-green-500 rounded-full opacity-40"></div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                No Budgets Set Yet
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
                Create your first budget to start tracking your spending and
                take control of your financial future
              </p>

              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-4 py-2 rounded-full">
                  <svg
                    className="w-4 h-4 mr-2 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Set monthly spending limits by category
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
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
                    Track Progress
                  </div>
                  <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                    <svg
                      className="w-4 h-4 mr-2 text-emerald-500"
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
                    Control Spending
                  </div>
                  <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
                    <svg
                      className="w-4 h-4 mr-2 text-purple-500"
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
                    Reach Goals
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {budgetProgress.map((progress, index) => (
        <Card
          key={progress.category}
          className="group w-full hover:shadow-2xl transition-all duration-500 border-l-4 bg-gradient-to-r from-white via-white to-slate-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/30 hover:from-white hover:via-slate-50 hover:to-emerald-50/20 dark:hover:from-slate-800 dark:hover:via-slate-700 dark:hover:to-emerald-900/10 animate-fade-in-up"
          style={{
            borderLeftColor: progress.isOverBudget
              ? "#ef4444"
              : progress.percentageUsed > 80
              ? "#f59e0b"
              : "#10b981",
            animationDelay: `${index * 100}ms`,
          }}
        >
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${
                      progress.isOverBudget
                        ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40"
                        : progress.percentageUsed > 80
                        ? "bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900/40 dark:to-orange-800/40"
                        : "bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/40 dark:to-green-800/40"
                    }`}
                  >
                    <svg
                      className={`w-7 h-7 ${
                        progress.isOverBudget
                          ? "text-red-600 dark:text-red-400"
                          : progress.percentageUsed > 80
                          ? "text-yellow-600 dark:text-yellow-400"
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  {/* Status indicator dot */}
                  <div
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                      progress.isOverBudget
                        ? "bg-red-500"
                        : progress.percentageUsed > 80
                        ? "bg-yellow-500"
                        : "bg-emerald-500"
                    }`}
                  ></div>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {getCategoryDisplayName(progress.category)}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        progress.isOverBudget
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : progress.percentageUsed > 80
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          progress.isOverBudget
                            ? "bg-red-500"
                            : progress.percentageUsed > 80
                            ? "bg-yellow-500"
                            : "bg-emerald-500"
                        }`}
                      ></div>
                      {progress.isOverBudget
                        ? "Over Budget"
                        : progress.percentageUsed > 80
                        ? "Near Limit"
                        : "On Track"}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteBudget(progress.category)}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-full w-10 h-10 p-0"
                aria-label="Delete budget"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-6">
            {/* Enhanced Budget Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-semibold mb-1">
                  Budget
                </p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(progress.budgetAmount)}
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800/30 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-orange-600 dark:text-orange-400"
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
                <p className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wide font-semibold mb-1">
                  Spent
                </p>
                <p
                  className={`text-lg font-bold ${
                    progress.isOverBudget
                      ? "text-red-600 dark:text-red-400"
                      : "text-orange-900 dark:text-orange-100"
                  }`}
                >
                  {formatCurrency(progress.spentAmount)}
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800/30 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      progress.remainingAmount < 0
                        ? "bg-red-100 dark:bg-red-900/40"
                        : "bg-emerald-100 dark:bg-emerald-900/40"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        progress.remainingAmount < 0
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
                <p
                  className={`text-xs uppercase tracking-wide font-semibold mb-1 ${
                    progress.remainingAmount < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {progress.remainingAmount < 0 ? "Over by" : "Remaining"}
                </p>
                <p
                  className={`text-lg font-bold ${
                    progress.remainingAmount < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatCurrency(Math.abs(progress.remainingAmount))}
                </p>
              </div>
            </div>

            {/* Enhanced Progress Bar Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-slate-500"
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
                  Budget Progress
                </span>
                <span
                  className={`text-sm font-bold px-3 py-1.5 rounded-full shadow-sm ${
                    progress.isOverBudget
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : progress.percentageUsed > 80
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  }`}
                >
                  {progress.percentageUsed}%
                </span>
              </div>

              <div className="relative">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${getBudgetProgressBgColor(
                      progress.percentageUsed
                    )}`}
                    style={{
                      width: `${Math.min(progress.percentageUsed, 100)}%`,
                    }}
                  >
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                {/* Progress markers */}
                <div className="flex justify-between mt-2 text-xs text-slate-400 dark:text-slate-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Warning message for over budget */}
            {progress.isOverBudget && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-red-600 dark:text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      Budget Exceeded
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      You've exceeded your budget for this category by{" "}
                      <span className="font-semibold">
                        {formatCurrency(Math.abs(progress.remainingAmount))}
                      </span>
                      . Consider reviewing your spending or adjusting your
                      budget.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Near limit warning */}
            {!progress.isOverBudget && progress.percentageUsed > 80 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                      Approaching Budget Limit
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      You've used {progress.percentageUsed}% of your budget. You
                      have{" "}
                      <span className="font-semibold">
                        {formatCurrency(progress.remainingAmount)}
                      </span>{" "}
                      remaining this month.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
