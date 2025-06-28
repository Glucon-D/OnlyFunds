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
import { useAuthStore, useExpenseStore } from "@/lib/zustand";
import { TransactionType } from "@/lib/types";
import {
  formatCurrency,
  getCurrentMonth,
  getCurrentYear,
} from "@/lib/utils/helpers";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import {
  BarChart,
  BarChart2,
  ChartColumnBig,
  Lightbulb,
  Receipt,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuthStore();
  const { fetchTransactions, getMonthlyTotal } = useExpenseStore();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Refs and timeout for improved dropdown behavior
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchTransactions(user.id);
    }
  }, [isLoggedIn, user?.id, fetchTransactions]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="text-center">
          <div className="relative">
            <div
              className="animate-spin rounded-full h-12 w-12 border-4"
              style={{ borderColor: "var(--border)" }}
            ></div>
            <div
              className="animate-spin rounded-full h-12 w-12 border-4 border-transparent absolute top-0 left-0"
              style={{ borderTopColor: "var(--primary)" }}
            ></div>
          </div>
          <p
            className="mt-4 font-medium"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div
      className="min-h-screen max-w-6xl mx-auto"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl mb-6">
            <ChartColumnBig className="w-8 h-8 text-white" />
          </div>

          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Welcome back, {user?.username}!
          </h1>
          <p
            className="text-lg"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Here&apos;s your financial overview for{" "}
            <span className="font-semibold" style={{ color: "var(--primary)" }}>
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
          </p>
        </div>

        {/* Financial Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Monthly Income Card */}
          <div
            className="group border-1 border-gray-200 relative overflow-hidden rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ backgroundColor: "var(--success)" }}
            ></div>
            <div className="relative">
              <div className="flex items-center mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: "var(--success)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </div>
                <span
                  className="text-lg font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Monthly Income
                </span>
              </div>
              <p
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--success)" }}
              >
                {formatCurrency(monthlyIncome)}
              </p>
              <div
                className="flex items-center text-sm"
                style={{ color: "var(--foreground-secondary)" }}
              >
                <svg
                  className="w-4 h-4 mr-1"
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
                Total earnings this month
              </div>
            </div>
          </div>

          {/* Monthly Expenses Card */}
          <div
            className="group border-1 border-gray-200 relative overflow-hidden rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ backgroundColor: "var(--error)" }}
            ></div>
            <div className="relative">
              <div className="flex items-center mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: "var(--error)" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 13l-5 5m0 0l-5-5m5 5V6"
                    />
                  </svg>
                </div>
                <span
                  className="text-lg font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Monthly Expenses
                </span>
              </div>
              <p
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--error)" }}
              >
                {formatCurrency(monthlyExpenses)}
              </p>
              <div
                className="flex items-center text-sm"
                style={{ color: "var(--foreground-secondary)" }}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                </svg>
                Total spending this month
              </div>
            </div>
          </div>

          {/* Net Income Card */}
          <div
            className="group border-1 border-gray-200 relative overflow-hidden rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                backgroundColor:
                  netIncome >= 0 ? "var(--info)" : "var(--warning)",
              }}
            ></div>
            <div className="relative">
              <div className="flex items-center mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundColor:
                      netIncome >= 0 ? "var(--info)" : "var(--warning)",
                  }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {netIncome >= 0 ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                      />
                    )}
                  </svg>
                </div>
                <span
                  className="text-lg font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Net Income
                </span>
              </div>
              <p
                className="text-3xl font-bold mb-2"
                style={{
                  color: netIncome >= 0 ? "var(--info)" : "var(--warning)",
                }}
              >
                {netIncome >= 0 ? "+" : ""}
                {formatCurrency(netIncome)}
              </p>
              <div
                className="flex items-center text-sm"
                style={{ color: "var(--foreground-secondary)" }}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
          </div>
        </div>

        {/* Quick Actions with Enhanced Dropdown */}
        <div className="mb-8">
          <h2
            className="text-2xl font-bold mb-6 flex items-center"
            style={{ color: "var(--foreground)" }}
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
          </h2>

          <div className="flex flex-wrap gap-4">
            {/* Add Transaction Button */}
            <button
              onClick={() => setShowExpenseForm(true)}
              className="group relative overflow-hidden px-6 py-3 rounded-lg text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
              style={{ backgroundColor: "var(--primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary)";
              }}
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
            </button>

            {/* Enhanced Dropdown Menu */}
            <div
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                ref={triggerRef}
                className="group px-6 py-3 rounded-lg border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 focus:border-emerald-500"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.backgroundColor = "var(--card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.backgroundColor = "var(--card)";
                }}
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
                    className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                      showQuickActions ? "rotate-180" : ""
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
              </button>

              {/* Invisible bridge to prevent hover gap issues */}
              <div
                className={`absolute top-full left-0 w-64 h-2 ${
                  showQuickActions ? "block" : "hidden"
                }`}
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              />

              {/* Dropdown Menu */}
              <div
                ref={dropdownRef}
                className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-2xl border z-50 transition-all duration-300 transform origin-top ${
                  showQuickActions
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--shadow-lg)",
                  marginTop: "0px", // Remove gap
                }}
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push("/transactions");
                      closeDropdown();
                    }}
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                    style={{ color: "var(--foreground)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--card-hover)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "translateX(0px)";
                    }}
                    tabIndex={showQuickActions ? 0 : -1}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: "var(--success)" }}
                    >
                      <svg
                        className="w-5 h-5 text-white"
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
                      <p
                        className="font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        View Transactions
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        See all your financial activity
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/budgets");
                      closeDropdown();
                    }}
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                    style={{ color: "var(--foreground)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--card-hover)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "translateX(0px)";
                    }}
                    tabIndex={showQuickActions ? 0 : -1}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      <svg
                        className="w-5 h-5 text-white"
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
                      <p
                        className="font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        Manage Budgets
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        Set and track spending limits
                      </p>
                    </div>
                  </button>

                  <div
                    className="h-px my-2"
                    style={{ backgroundColor: "var(--border)" }}
                  ></div>

                  <button
                    onClick={() => {
                      // Add export functionality here
                      closeDropdown();
                    }}
                    className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                    style={{ color: "var(--foreground)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--card-hover)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "translateX(0px)";
                    }}
                    tabIndex={showQuickActions ? 0 : -1}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: "var(--warning)" }}
                    >
                      <svg
                        className="w-5 h-5 text-white"
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
                      <p
                        className="font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        Export Data
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        Download your financial data
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
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
        <div
          className="rounded-xl p-6 border-1 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="mb-4">
            <div
              className="flex items-center"
              style={{ color: "var(--foreground)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Financial Insight</h3>
            </div>
          </div>
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor:
                netIncome >= 0
                  ? "var(--success-light)"
                  : "var(--warning-light)",
              borderColor: netIncome >= 0 ? "var(--success)" : "var(--warning)",
            }}
          >
            <p
              className="leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              {netIncome >= 0
                ? "🎉 Excellent! You're spending less than you earn this month. Consider setting aside some money for savings or investments to secure your financial future."
                : "⚠️ You're spending more than you earn this month. Review your expenses and consider creating a budget to better manage your finances. Small changes can make a big difference!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
