/**
 * Dashboard Page Component
 *
 * The main dashboard page for authenticated users. Displays a welcome message,
 * financial overview with income vs expense summary, recent transactions,
 * and quick action buttons. Includes route protection to redirect
 * unauthenticated users to the login page.
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/lib/hooks/useAuth";
import { useExpenseStore } from "@/lib/zustand";
import { TransactionType } from "@/lib/types";
import {
  formatCurrency,
  getCurrentMonth,
  getCurrentYear,
} from "@/lib/utils/helpers";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { AuthPageLoader } from "@/components/ui/AuthLoader";
import { ChartColumnBig, Lightbulb, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

// Motivational/Insight Banner tips
const MOTIVATIONAL_TIPS = [
  "A budget is telling your money where to go instead of wondering where it went. — Dave Ramsey",
  "Do not save what is left after spending, but spend what is left after saving. — Warren Buffett",
  "Small daily improvements are the key to staggering long-term results. — James Clear",
  "It's not your salary that makes you rich, it's your spending habits. — Charles A. Jaffe",
  "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
  "Wealth consists not in having great possessions, but in having few wants. — Epictetus",
  "Financial freedom is available to those who learn about it and work for it. — Robert Kiyosaki"
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuthState();
  const { fetchTransactions, getMonthlyTotal } = useExpenseStore();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Refs and timeout for improved dropdown behavior
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Banner state for rotating tips
  const [bannerIndex, setBannerIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % MOTIVATIONAL_TIPS.length);
    }, 6000); // Change every 6 seconds
    return () => clearInterval(interval);
  }, []);

  // Optimized dropdown handlers with timeout
  const handleDropdownEnter = useCallback(() => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setShowQuickActions(true);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowQuickActions(false);
    }, 150); // 150ms delay before hiding
  }, []);

  const closeDropdown = useCallback(() => {
    setShowQuickActions(false);
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    if (showQuickActions) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showQuickActions, closeDropdown]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (showQuickActions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showQuickActions, closeDropdown]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Optimized auth check - redirect immediately if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  // Optimized data fetching - only fetch when user is confirmed
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchTransactions(user.id);
    }
  }, [isLoggedIn, user?.id, fetchTransactions]);

  // Professional loading state
  if (isLoading) {
    return <AuthPageLoader message="Loading your dashboard..." />;
  }

  // Immediate redirect for unauthenticated users
  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const monthlyIncome = getMonthlyTotal(
    TransactionType.INCOME,
    currentMonth,
    currentYear
  );
  const monthlyExpenses = getMonthlyTotal(
    TransactionType.EXPENSE,
    currentMonth,
    currentYear
  );
  const netIncome = monthlyIncome - monthlyExpenses;

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.04 }
  };
  const iconVariants = {
    initial: { scale: 0.9, rotate: -8, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    hover: { scale: 1.15, rotate: 6 }
  };

  const quickActionsHeaderVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  const quickActionBtnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.1, duration: 0.5 } }),
    hover: { scale: 1.05, boxShadow: "0 4px 16px 0 rgba(16,185,129,0.10)" }
  };
  const dropdownMenuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
  };
  const dropdownItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.08, duration: 0.3 } }),
    hover: { scale: 1.03 }
  };

  const tipsSectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };
  const tipsIconVariants = {
    hidden: { scale: 0.8, rotate: -10, opacity: 0 },
    visible: { scale: 1, rotate: 0, opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
    hover: { scale: 1.1, rotate: 8 }
  };

  return (
    <div
      className="min-h-screen max-w-6xl mx-auto"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Motivational/Insight Banner */}
        <div className="mb-6">
          <motion.div
            key={bannerIndex}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-2xl rounded-2xl px-6 py-4 bg-emerald-50 text-emerald-800 dark:bg-gradient-to-r dark:from-emerald-400/90 dark:via-green-400/80 dark:to-emerald-600/90 dark:text-white shadow-lg border border-emerald-200 dark:border-emerald-800 text-center text-lg md:text-xl font-semibold flex items-center justify-center min-h-[64px]"
            style={{ letterSpacing: 0.1 }}
          >
            <span className="inline-block animate-pulse mr-3">💡</span>
            <span>{MOTIVATIONAL_TIPS[bannerIndex]}</span>
          </motion.div>
        </div>

        {/* Welcome Section */}
        <motion.div
          className="mb-10 text-center flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 via-green-400 to-emerald-600 animate-gradient rounded-3xl shadow-2xl mb-7 border-4 border-white dark:border-slate-900"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 180 }}
          >
            <ChartColumnBig className="w-10 h-10 text-white drop-shadow-lg" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-extrabold mb-3 text-emerald-800 dark:text-emerald-400 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            Welcome back, <span>{user?.username}</span>!
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            Here&apos;s your financial overview for
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
          </motion.p>
        </motion.div>

        {/* Financial Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Monthly Income Card */}
          <motion.div
            className="relative overflow-hidden rounded-2xl p-7 shadow-xl border backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-emerald-100 dark:border-emerald-900 group cursor-pointer transition-all duration-500"
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" }}
            />
            <div className="relative">
              <motion.div
                className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg mb-4"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" }}
                variants={iconVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ duration: 0.5 }}
              >
                <IndianRupee className="w-7 h-7 text-white" strokeWidth={2.2} />
              </motion.div>
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">Monthly Income</span>
              <p className="text-3xl font-bold mb-2 text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrency(monthlyIncome)}</p>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Total earnings this month
              </div>
            </div>
          </motion.div>

          {/* Monthly Expenses Card */}
          <motion.div
            className="relative overflow-hidden rounded-2xl p-7 shadow-xl border backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-rose-100 dark:border-rose-900 group cursor-pointer transition-all duration-500"
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
            transition={{ delay: 0.32, duration: 0.7 }}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
              style={{ background: "linear-gradient(135deg, #f43f5e 0%, #fbbf24 100%)" }}
            />
            <div className="relative">
              <motion.div
                className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg mb-4"
                style={{ background: "linear-gradient(135deg, #f43f5e 0%, #fbbf24 100%)" }}
                variants={iconVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ duration: 0.5 }}
              >
                <IndianRupee className="w-7 h-7 text-white" strokeWidth={2.2} />
              </motion.div>
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">Monthly Expenses</span>
              <p className="text-3xl font-bold mb-2 text-rose-600 dark:text-rose-400 mt-2">{formatCurrency(monthlyExpenses)}</p>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                Total spending this month
              </div>
            </div>
          </motion.div>

          {/* Net Income Card */}
          <motion.div
            className={`relative overflow-hidden rounded-2xl p-7 shadow-xl border backdrop-blur-md bg-white/70 dark:bg-slate-900/70 group cursor-pointer transition-all duration-500 ${netIncome >= 0 ? "border-sky-100 dark:border-sky-900" : "border-yellow-100 dark:border-yellow-900"}`}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={cardVariants}
            transition={{ delay: 0.44, duration: 0.7 }}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
              style={{ background: netIncome >= 0 ? "linear-gradient(135deg, #38bdf8 0%, #06b6d4 100%)" : "linear-gradient(135deg, #fbbf24 0%, #f59e42 100%)" }}
            />
            <div className="relative">
              <motion.div
                className="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg mb-4"
                style={{ background: netIncome >= 0 ? "linear-gradient(135deg, #38bdf8 0%, #06b6d4 100%)" : "linear-gradient(135deg, #fbbf24 0%, #f59e42 100%)" }}
                variants={iconVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ duration: 0.5 }}
              >
                <IndianRupee className="w-7 h-7 text-white" strokeWidth={2.2} />
              </motion.div>
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">Net Income</span>
              <p className={`text-3xl font-bold mb-2 mt-2 ${netIncome >= 0 ? "text-sky-600 dark:text-sky-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                {netIncome >= 0 ? "+" : ""}{formatCurrency(netIncome)}
              </p>
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                {netIncome >= 0 ? "Positive cash flow" : "Budget review needed"}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions with Enhanced Dropdown */}
        <div className="mb-8">
          <motion.h2
            className="text-2xl font-bold mb-6 flex items-center"
            style={{ color: "var(--foreground)" }}
            initial="hidden"
            animate="visible"
            variants={quickActionsHeaderVariants}
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--primary)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Quick Actions
          </motion.h2>

          <div className="flex gap-3 w-full">
            {/* Enhanced Dropdown Menu */}
            <div
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <motion.button
                ref={triggerRef}
                className="group px-6 py-3 rounded-lg border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 focus:border-emerald-500 bg-white/80 dark:bg-slate-800/80 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                initial="hidden"
                animate="visible"
                variants={quickActionBtnVariants}
                custom={1}
                whileHover="hover"
                onClick={() => setShowQuickActions(!showQuickActions)}
                aria-expanded={showQuickActions}
                aria-haspopup="true"
                aria-label="More actions menu"
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  More Actions
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-300 ${showQuickActions ? "rotate-180" : ""}`}
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
                className={`absolute top-full left-0 w-64 h-2 ${
                  showQuickActions ? "block" : "hidden"
                }`}
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              />

              {/* Dropdown Menu */}
              {showQuickActions && (
                <motion.div
                  ref={dropdownRef}
                  className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-2xl border z-50 bg-white/90 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 backdrop-blur-xl origin-top"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownMenuVariants}
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <div className="p-2">
                    <motion.button
                      onClick={() => {
                        router.push("/transactions");
                        closeDropdown();
                      }}
                      className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800 dark:hover:text-emerald-100"
                      variants={dropdownItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={0}
                      tabIndex={showQuickActions ? 0 : -1}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200 bg-emerald-100 dark:bg-emerald-900"
                      >
                        <svg
                          className="w-5 h-5 text-emerald-600 dark:text-emerald-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">View Transactions</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">See all your financial activity</p>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        router.push("/budgets");
                        closeDropdown();
                      }}
                      className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800 dark:hover:text-emerald-100"
                      variants={dropdownItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={1}
                      tabIndex={showQuickActions ? 0 : -1}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200 bg-emerald-100 dark:bg-emerald-900"
                      >
                        <svg
                          className="w-5 h-5 text-emerald-600 dark:text-emerald-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">Manage Budgets</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Set and track spending limits</p>
                      </div>
                    </motion.button>

                    <div className="h-px my-2 bg-emerald-100 dark:bg-emerald-900"></div>

                    <motion.button
                      onClick={() => {
                        // Add export functionality here
                        closeDropdown();
                      }}
                      className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800 dark:hover:text-emerald-100"
                      variants={dropdownItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={2}
                      tabIndex={showQuickActions ? 0 : -1}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200 bg-yellow-100 dark:bg-yellow-900"
                      >
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">Export Data</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Download your financial data</p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Add Transaction Button */}
            <motion.button
              onClick={() => setShowExpenseForm(true)}
              className="group relative overflow-hidden px-4 py-3 rounded-lg text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium bg-gradient-to-r from-emerald-500 to-green-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
              initial="hidden"
              animate="visible"
              variants={quickActionBtnVariants}
              custom={0}
              whileHover="hover"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300"
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
                Add Transaction
              </div>
            </motion.button>
          </div>
        </div>

        {/* Enhanced Add Transaction Form Modal */}
        {showExpenseForm && (
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowExpenseForm(false);
              }
            }}
          >
            <div
              className="rounded-2xl p-6 w-full max-w-md shadow-2xl border transform transition-all duration-300 scale-100 animate-in slide-in-from-bottom-4"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Add New Transaction
                </h2>
                <button
                  onClick={() => setShowExpenseForm(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--foreground-secondary)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
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

        {/* Enhanced Financial Tips */}
        <motion.div
          className="rounded-2xl p-7 border shadow-xl bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 border-emerald-100 dark:border-emerald-900 mt-12"
          initial="hidden"
          animate="visible"
          variants={tipsSectionVariants}
        >
          <div className="mb-4 flex items-center">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg bg-gradient-to-br from-amber-400 to-yellow-500"
              variants={tipsIconVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Lightbulb className="w-6 h-6 text-white drop-shadow" />
            </motion.div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent dark:from-yellow-300 dark:to-yellow-500">Financial Insight</h3>
          </div>
          <div
            className={`p-5 rounded-xl border-2 mt-2 ${netIncome >= 0 ? "border-emerald-300 bg-emerald-50/80 dark:bg-emerald-900/30" : "border-yellow-300 bg-yellow-50/80 dark:bg-yellow-900/30"}`}
          >
            <p className="leading-relaxed text-lg font-medium text-slate-700 dark:text-slate-200">
              {netIncome >= 0
                ? "🎉 Excellent! You're spending less than you earn this month. Consider setting aside some money for savings or investments to secure your financial future."
                : "⚠️ You're spending more than you earn this month. Review your expenses and consider creating a budget to better manage your finances. Small changes can make a big difference!"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
