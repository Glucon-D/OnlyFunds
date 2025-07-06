/**
 * Budgets Page Component
 *
 * A page for managing budgets and viewing budget progress. Displays the
 * BudgetList component showing current budget status and includes functionality
 * to add new budgets. Includes route protection to redirect unauthenticated
 * users to the login page.
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useBudgetStore, useExpenseStore } from "@/lib/zustand";
import { Button } from "@/components/ui/Button";
import { BudgetList } from "@/components/budgets/BudgetList";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { motion } from "framer-motion";
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

  // Dropdown states for month/year selection
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Refs and timeout for improved dropdown behavior
  const monthDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const yearDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const monthTriggerRef = useRef<HTMLButtonElement>(null);
  const yearTriggerRef = useRef<HTMLButtonElement>(null);

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

  // Optimized dropdown handlers for month selection
  const handleMonthDropdownEnter = useCallback(() => {
    if (monthDropdownTimeoutRef.current) {
      clearTimeout(monthDropdownTimeoutRef.current);
      monthDropdownTimeoutRef.current = null;
    }
    setShowMonthDropdown(true);
  }, []);

  const handleMonthDropdownLeave = useCallback(() => {
    monthDropdownTimeoutRef.current = setTimeout(() => {
      setShowMonthDropdown(false);
    }, 150);
  }, []);

  const closeMonthDropdown = useCallback(() => {
    setShowMonthDropdown(false);
    if (monthDropdownTimeoutRef.current) {
      clearTimeout(monthDropdownTimeoutRef.current);
      monthDropdownTimeoutRef.current = null;
    }
  }, []);

  // Optimized dropdown handlers for year selection
  const handleYearDropdownEnter = useCallback(() => {
    if (yearDropdownTimeoutRef.current) {
      clearTimeout(yearDropdownTimeoutRef.current);
      yearDropdownTimeoutRef.current = null;
    }
    setShowYearDropdown(true);
  }, []);

  const handleYearDropdownLeave = useCallback(() => {
    yearDropdownTimeoutRef.current = setTimeout(() => {
      setShowYearDropdown(false);
    }, 150);
  }, []);

  const closeYearDropdown = useCallback(() => {
    setShowYearDropdown(false);
    if (yearDropdownTimeoutRef.current) {
      clearTimeout(yearDropdownTimeoutRef.current);
      yearDropdownTimeoutRef.current = null;
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMonthDropdown();
        closeYearDropdown();
      }
    };

    if (showMonthDropdown || showYearDropdown) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showMonthDropdown, showYearDropdown, closeMonthDropdown, closeYearDropdown]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        monthDropdownRef.current &&
        monthTriggerRef.current &&
        !monthDropdownRef.current.contains(event.target as Node) &&
        !monthTriggerRef.current.contains(event.target as Node)
      ) {
        closeMonthDropdown();
      }
      if (
        yearDropdownRef.current &&
        yearTriggerRef.current &&
        !yearDropdownRef.current.contains(event.target as Node) &&
        !yearTriggerRef.current.contains(event.target as Node)
      ) {
        closeYearDropdown();
      }
    };

    if (showMonthDropdown || showYearDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMonthDropdown, showYearDropdown, closeMonthDropdown, closeYearDropdown]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (monthDropdownTimeoutRef.current) {
        clearTimeout(monthDropdownTimeoutRef.current);
      }
      if (yearDropdownTimeoutRef.current) {
        clearTimeout(yearDropdownTimeoutRef.current);
      }
    };
  }, []);

  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions(2020, 2030);

  // Animation variants
  const dropdownMenuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
  };

  const dropdownItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0, 
      transition: { delay: 0.05 + i * 0.05, duration: 0.3 } 
    }),
    hover: { scale: 1.02 }
  };

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
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 dark:text-emerald-400 mb-4">
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
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:-translate-y-2 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300">
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
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  ₹{totalBudget.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:-translate-y-2 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300">
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
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  ₹{totalSpent.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:-translate-y-2 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300">
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
                  ₹{Math.abs(totalRemaining).toLocaleString()}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:-translate-y-2 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300">
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
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
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

          {/* Action Bar with Enhanced Month/Year Selection */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
            {/* Period Selection with Custom Dropdowns */}
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
                {/* Month Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleMonthDropdownEnter}
                  onMouseLeave={handleMonthDropdownLeave}
                >
                  <motion.button
                    ref={monthTriggerRef}
                    className="group px-4 py-2 rounded-lg border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 focus:border-emerald-500 bg-white/80 dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 min-w-[140px]"
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    aria-expanded={showMonthDropdown}
                    aria-haspopup="true"
                    aria-label="Select month"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400"
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
                        {getMonthName(selectedMonth)}
                      </div>
                      <svg
                        className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                          showMonthDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </motion.button>

                  {/* Invisible bridge to prevent hover gap issues */}
                  <div
                    className={`absolute top-full left-0 w-full h-2 ${
                      showMonthDropdown ? "block" : "hidden"
                    }`}
                    onMouseEnter={handleMonthDropdownEnter}
                    onMouseLeave={handleMonthDropdownLeave}
                  />

                  {/* Month Dropdown Menu */}
                  {showMonthDropdown && (
                    <motion.div
                      ref={monthDropdownRef}
                      className="absolute top-full left-0 mt-2 w-full rounded-xl shadow-2xl border z-50 bg-white/90 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 backdrop-blur-xl origin-top"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownMenuVariants}
                      onMouseEnter={handleMonthDropdownEnter}
                      onMouseLeave={handleMonthDropdownLeave}
                    >
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {monthOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            onClick={() => {
                              setSelectedMonth(option.value);
                              closeMonthDropdown();
                            }}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800 dark:hover:text-emerald-100 ${
                              selectedMonth === option.value
                                ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100"
                                : ""
                            }`}
                            variants={dropdownItemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            custom={index}
                            tabIndex={showMonthDropdown ? 0 : -1}
                          >
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-100">
                                {option.label}
                              </p>
                              {selectedMonth === option.value && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                  Currently selected
                                </p>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleYearDropdownEnter}
                  onMouseLeave={handleYearDropdownLeave}
                >
                  <motion.button
                    ref={yearTriggerRef}
                    className="group px-4 py-2 rounded-lg border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 focus:border-emerald-500 bg-white/80 dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 min-w-[100px]"
                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                    aria-expanded={showYearDropdown}
                    aria-haspopup="true"
                    aria-label="Select year"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400"
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
                        {selectedYear}
                      </div>
                      <svg
                        className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                          showYearDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </motion.button>

                  {/* Invisible bridge to prevent hover gap issues */}
                  <div
                    className={`absolute top-full left-0 w-full h-2 ${
                      showYearDropdown ? "block" : "hidden"
                    }`}
                    onMouseEnter={handleYearDropdownEnter}
                    onMouseLeave={handleYearDropdownLeave}
                  />

                  {/* Year Dropdown Menu */}
                  {showYearDropdown && (
                    <motion.div
                      ref={yearDropdownRef}
                      className="absolute top-full left-0 mt-2 w-full rounded-xl shadow-2xl border z-50 bg-white/90 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 backdrop-blur-xl origin-top"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownMenuVariants}
                      onMouseEnter={handleYearDropdownEnter}
                      onMouseLeave={handleYearDropdownLeave}
                    >
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {yearOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            onClick={() => {
                              setSelectedYear(option.value);
                              closeYearDropdown();
                            }}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800 dark:hover:text-emerald-100 ${
                              selectedYear === option.value
                                ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100"
                                : ""
                            }`}
                            variants={dropdownItemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            custom={index}
                            tabIndex={showYearDropdown ? 0 : -1}
                          >
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-100">
                                {option.label}
                              </p>
                              {selectedYear === option.value && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                  Currently selected
                                </p>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Create Budget Button */}
            <Button
              onClick={() => setShowBudgetForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-950/30 hover:to-green-600/30 shadow-lg hover:shadow-xl hover:scale-105 transform hover:-translate-y-1.5 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-500 px-6 py-3"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md px-2 sm:px-4 border border-slate-200/50 dark:border-slate-700/50 animate-scale-in overflow-y-auto max-h-[90vh]">
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
