/**
 * Budget List Component
 *
 * A component that displays budget progress for all categories with visual progress bars.
 * Shows budget amount, spent amount, remaining amount, and percentage used.
 * Includes color-coded progress indicators and budget deletion functionality.
 * Integrates with both budget and expense stores for comprehensive budget tracking.
 */

"use client";

import React, { useEffect, useMemo } from "react";
import { useBudgetStore, useExpenseStore, useAuthStore } from "@/lib/zustand";
import { formatCurrency, getCategoryDisplayName } from "@/lib/utils/helpers";
import {
  ExpenseCategory,
  Budget,
  Transaction,
  BudgetProgress,
  TransactionType,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthName,
} from "@/lib/utils/helpers";
import { Dialog } from "@/components/ui/Dialog";
import toast from "react-hot-toast";
import { IndianRupee } from "lucide-react";

// Optimized function to calculate budget progress
const calculateBudgetProgressOptimized = (
  budgets: Budget[],
  transactions: Transaction[],
  month?: number,
  year?: number
): BudgetProgress[] => {
  const targetMonth = month || getCurrentMonth();
  const targetYear = year || getCurrentYear();

  // Filter budgets for current month/year first
  const currentBudgets = budgets.filter(
    (b) => b.month === targetMonth && b.year === targetYear
  );

  if (currentBudgets.length === 0) return [];

  // Create a map for faster transaction lookup by category
  const expensesByCategory = new Map<ExpenseCategory, number>();

  // Filter and group transactions in a single pass
  transactions.forEach((transaction) => {
    if (transaction.type !== TransactionType.EXPENSE) return;

    const transactionDate = new Date(transaction.date);
    if (
      transactionDate.getMonth() + 1 !== targetMonth ||
      transactionDate.getFullYear() !== targetYear
    )
      return;

    const category = transaction.category as ExpenseCategory;
    const currentAmount = expensesByCategory.get(category) || 0;
    expensesByCategory.set(category, currentAmount + transaction.amount);
  });

  // Calculate progress for each budget
  return currentBudgets.map((budget) => {
    const spentAmount = expensesByCategory.get(budget.category) || 0;
    const remainingAmount = budget.amount - spentAmount;
    const percentageUsed =
      budget.amount > 0 ? Math.round((spentAmount / budget.amount) * 100) : 0;

    return {
      category: budget.category,
      budgetAmount: budget.amount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      isOverBudget: spentAmount > budget.amount,
    };
  });
};

interface BudgetListProps {
  selectedMonth?: number;
  selectedYear?: number;
}

const BudgetListComponent: React.FC<BudgetListProps> = ({
  selectedMonth,
  selectedYear,
}) => {
  const {
    budgets,
    fetchBudgets,
    isLoading: budgetsLoading,
    deleteBudget,
  } = useBudgetStore();
  const {
    transactions,
    fetchTransactions,
    isLoading: transactionsLoading,
  } = useExpenseStore();
  const { user } = useAuthStore();

  // Calculate budget progress using useMemo for optimal performance
  const budgetProgress = useMemo(() => {
    return calculateBudgetProgressOptimized(
      budgets,
      transactions,
      selectedMonth,
      selectedYear
    );
  }, [budgets, transactions, selectedMonth, selectedYear]);

  // Check if we're still loading or calculating
  const isLoading = budgetsLoading || transactionsLoading;

  // Debug logging (commented out for performance)
  // console.log("BudgetList render:", {
  //   budgetsCount: budgets.length,
  //   transactionsCount: transactions.length,
  //   budgetProgressCount: budgetProgress.length,
  //   userId: user?.id,
  // });

  useEffect(() => {
    if (user?.id) {
      fetchBudgets(user.id);
      fetchTransactions(user.id);
    }
  }, [fetchBudgets, fetchTransactions, user?.id]);

  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    category: ExpenseCategory | null;
  }>({ open: false, category: null });
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteBudget = React.useCallback((category: ExpenseCategory) => {
    setConfirmDialog({ open: true, category });
  }, []);

  const confirmDelete = async () => {
    if (!confirmDialog.category) return;
    const category = confirmDialog.category;
    setIsDeleting(true);
    // Find the budget to delete
    const budgetToDelete = budgets.find(
      (b) =>
        b.category === category &&
        b.month === (selectedMonth || getCurrentMonth()) &&
        b.year === (selectedYear || getCurrentYear())
    );
    if (budgetToDelete) {
      try {
        await deleteBudget(budgetToDelete.id);
        if (user?.id) {
          await fetchBudgets(user.id); // Refresh budgets after deletion
        }
        toast.success(
          `Budget for ${getCategoryDisplayName(category)} deleted successfully.`
        );
      } catch {
        toast.error("Failed to delete budget. Please try again.");
      }
    }
    setIsDeleting(false);
    setConfirmDialog({ open: false, category: null });
  };

  const cancelDelete = () => {
    setConfirmDialog({ open: false, category: null });
  };

  // Show loader while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for budget cards */}
        {[1, 2, 3].map((index) => (
          <Card
            key={index}
            className="w-full border-l-4 border-slate-300 dark:border-slate-600 loading-skeleton"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                  <div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              {/* Stats skeleton */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((statIndex) => (
                  <div
                    key={statIndex}
                    className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div>
                  </div>
                ))}
              </div>

              {/* Progress bar skeleton */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 rounded-full animate-pulse"
                    style={{ width: `${40 + index * 15}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
                {selectedMonth &&
                selectedYear &&
                (selectedMonth !== getCurrentMonth() ||
                  selectedYear !== getCurrentYear())
                  ? `No budgets found for ${getMonthName(
                      selectedMonth
                    )} ${selectedYear}. Create a budget for this period to start tracking your spending.`
                  : "Create your first budget to start tracking your spending and take control of your financial future"}
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
    <>
      {/* Confirmation Dialog */}
      <div
        style={{
          position: "relative",
        }}
      >
        <style>{`
          .budget-delete-dialog button[aria-label="Close"] {
            display: none !important;
          }
          .budget-delete-dialog .absolute.top-2.right-2 {
            display: none !important;
          }
        `}</style>
        <div className="budget-delete-dialog">
          <Dialog open={confirmDialog.open} onOpenChange={cancelDelete}>
            <div className="p-6 w-80 max-w-full flex flex-col items-center">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 text-red-500"
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
              </div>
              <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white text-center">
                Delete Budget?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-center">
                Are you sure you want to delete the budget for{" "}
                <span className="font-semibold text-red-600">
                  {confirmDialog.category &&
                    getCategoryDisplayName(confirmDialog.category)}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  className="flex-1 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all disabled:opacity-60"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  type="button"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </Dialog>
        </div>
      </div>
      {/* Budget List UI */}
      <div className="space-y-6">
        {budgetProgress.map((progress, index) => (
          <Card
            key={progress.category}
            className="group w-full hover:shadow-2xl transition-all duration-500 border-l-4 bg-gradient-to-tl from-white via-white to-slate-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500 hover:scale-[1.02] animate-fade-in-up"
            style={{
              borderLeftColor: progress.isOverBudget
                ? "#ef4444"
                : progress.percentageUsed > 80
                ? "#f59e0b"
                : "#10b981",
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="relative">
              {/* Dark overlay on hover */}
              <div className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-slate-900 dark:via-gray-900 dark:to-emerald-950 rounded-2xl" />
              <div className="relative z-20">
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
                          <IndianRupee
                            className={`w-7 h-7 ${
                              progress.isOverBudget
                                ? "text-red-600 dark:text-red-400"
                                : progress.percentageUsed > 80
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          />
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-indigo-950/80 dark:to-indigo-900/80 rounded-xl border border-blue-200 dark:border-indigo-900 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-xl hover:from-blue-50/40 hover:to-blue-100/40 hover:dark:from-indigo-950/30 hover:dark:to-indigo-800/30 hover:backdrop-blur-sm hover:scale-[1.03] transition-all duration-500">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                          <IndianRupee className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-semibold mb-1">
                        Budget
                      </p>
                      <p className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-100 break-words truncate min-w-0 overflow-x-auto">
                        {formatCurrency(progress.budgetAmount)}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-orange-50/80 to-orange-100/80 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800/30 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-xl hover:from-orange-50/40 hover:to-orange-100/40 hover:dark:from-orange-900/10 hover:dark:to-orange-800/10 hover:backdrop-blur-sm hover:scale-[1.03] transition-all duration-500">
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
                        className={`text-base sm:text-lg font-bold ${
                          progress.isOverBudget
                            ? "text-red-600 dark:text-red-400"
                            : "text-orange-900 dark:text-orange-100"
                        } break-words truncate min-w-0 overflow-x-auto`}
                      >
                        {formatCurrency(progress.spentAmount)}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800/30 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xl hover:from-emerald-50/40 hover:to-emerald-100/40 hover:dark:from-emerald-900/10 hover:dark:to-emerald-800/10 hover:backdrop-blur-sm hover:scale-[1.03] transition-all duration-500">
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
                        className={`text-base sm:text-lg font-bold ${
                          progress.remainingAmount < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        } break-words truncate min-w-0 overflow-x-auto`}
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
                        {progress.percentageUsed || 0}%
                      </span>
                    </div>

                    <div className="relative">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full progress-bar relative overflow-hidden ${
                            progress.isOverBudget
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : progress.percentageUsed > 80
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                              : progress.percentageUsed > 60
                              ? "bg-gradient-to-r from-blue-500 to-blue-600"
                              : "bg-gradient-to-r from-emerald-500 to-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              Math.max(progress.percentageUsed || 0, 0),
                              100
                            )}%`,
                            transition:
                              "width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                            minWidth: progress.spentAmount > 0 ? "4px" : "0px",
                          }}
                        >
                          {/* Animated shimmer effect - only show when progress > 3% to avoid flickering */}
                          {progress.percentageUsed > 3 && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
                          )}
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
                            You&apos;ve exceeded your budget for this category
                            by{" "}
                            <span className="font-semibold">
                              {formatCurrency(
                                Math.abs(progress.remainingAmount)
                              )}
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
                            You&apos;ve used {progress.percentageUsed}% of your
                            budget. You have{" "}
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
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};

BudgetListComponent.displayName = "BudgetList";

export const BudgetList = React.memo(BudgetListComponent);
