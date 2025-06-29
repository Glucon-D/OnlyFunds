/**
 * Enhanced Professional Transactions Page
 *
 * A comprehensive page for viewing and managing all user transactions with advanced
 * filtering, sorting, search capabilities, and beautiful statistics. Features
 * professional UI design with Lucide icons, responsive layout, and seamless
 * integration with the website's theme system.
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useExpenseStore } from "@/lib/zustand";
import {
  TransactionType,
  Transaction,
  ExpenseCategory,
  IncomeCategory,
} from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  getCategoryDisplayName,
} from "@/lib/utils/helpers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Check,
  X,
  SortDesc,
  SortAsc,
  Clock,
  Tag,
  FileText,
  Target,
  Zap,
} from "lucide-react";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "description-asc";
type FilterOption = "all" | "income" | "expense";

export default function TransactionsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuthStore();
  const { fetchTransactions, transactions, deleteTransaction } =
    useExpenseStore();

  // UI State
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showExpenseForm) {
        setShowExpenseForm(false);
      }
    };

    if (showExpenseForm) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showExpenseForm]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;

    // This month's transactions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const thisMonthIncome = thisMonthTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpenses = thisMonthTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      thisMonthIncome,
      thisMonthExpenses,
      totalTransactions: transactions.length,
      thisMonthTransactions: thisMonthTransactions.length,
    };
  }, [transactions]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(transactions.map((t) => t.category))
    );
    return uniqueCategories.map((cat) => ({
      value: cat,
      label: getCategoryDisplayName(cat),
    }));
  }, [transactions]);

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCategoryDisplayName(t.category)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case "today":
          filterDate.setDate(now.getDate());
          filtered = filtered.filter((t) => {
            const transactionDate = new Date(t.date);
            return transactionDate.toDateString() === filterDate.toDateString();
          });
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter((t) => new Date(t.date) >= filterDate);
          break;
        case "month":
          filterDate.setMonth(now.getMonth());
          filterDate.setDate(1);
          filtered = filtered.filter((t) => new Date(t.date) >= filterDate);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          filtered = filtered.filter((t) => new Date(t.date) >= filterDate);
          break;
      }
    }

    // Sort
    switch (sortBy) {
      case "date-desc":
        filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "date-asc":
        filtered.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "amount-desc":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-asc":
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case "description-asc":
        filtered.sort((a, b) => a.description.localeCompare(b.description));
        break;
    }

    return filtered;
  }, [
    transactions,
    searchTerm,
    typeFilter,
    selectedCategory,
    dateRange,
    sortBy,
  ]);

  const handleRefresh = async () => {
    if (user?.id) {
      setIsRefreshing(true);
      await fetchTransactions(user.id);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${transaction.description}"?`
      )
    ) {
      deleteTransaction(transaction.id);
    }
  };

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
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div
      className="min-h-screen max-w-7xl mx-auto px-4 py-8 mb-12"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Hero Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl mb-6">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Transaction History
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Manage and analyze your financial transactions
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Income Card */}
        <div
          className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--foreground-secondary)" }}
              >
                Total Income
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--success)" }}
              >
                {formatCurrency(statistics.totalIncome)}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--success)" }}
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div
          className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--foreground-secondary)" }}
              >
                Total Expenses
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--error)" }}
              >
                {formatCurrency(statistics.totalExpenses)}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--error)" }}
            >
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Net Income Card */}
        <div
          className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--foreground-secondary)" }}
              >
                Net Income
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color:
                    statistics.netIncome >= 0
                      ? "var(--success)"
                      : "var(--error)",
                }}
              >
                {statistics.netIncome >= 0 ? "+" : ""}
                {formatCurrency(statistics.netIncome)}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor:
                  statistics.netIncome >= 0 ? "var(--success)" : "var(--error)",
              }}
            >
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Transactions Card */}
        <div
          className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--foreground-secondary)" }}
              >
                Total Transactions
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--primary)" }}
              >
                {statistics.totalTransactions}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters and Search */}
      <div
        className="rounded-2xl p-6 mb-8 shadow-lg border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" style={{ color: "var(--primary)" }} />
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Filter & Search Transactions
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            <Button
              onClick={() => setShowExpenseForm(true)}
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Enhanced Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10"
              style={{ color: "var(--foreground-secondary)" }}
            />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X
                  className="w-3 h-3"
                  style={{ color: "var(--foreground-secondary)" }}
                />
              </button>
            )}
          </div>

          {/* Enhanced Type Filter Dropdown */}
          <Dropdown
            trigger={
              <button
                className="dropdown-trigger flex items-center justify-between w-full h-10 px-3 py-2 text-sm border rounded-lg transition-all duration-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <div className="flex items-center gap-2">
                  {typeFilter === "all" && (
                    <BarChart3
                      className="w-4 h-4"
                      style={{ color: "var(--primary)" }}
                    />
                  )}
                  {typeFilter === "income" && (
                    <TrendingUp
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                  {typeFilter === "expense" && (
                    <TrendingDown
                      className="w-4 h-4"
                      style={{ color: "var(--error)" }}
                    />
                  )}
                  <span>
                    {typeFilter === "all" && "All Types"}
                    {typeFilter === "income" && "Income Only"}
                    {typeFilter === "expense" && "Expenses Only"}
                  </span>
                </div>
                <ChevronDown
                  className="w-4 h-4"
                  style={{ color: "var(--foreground-secondary)" }}
                />
              </button>
            }
            contentClassName="w-48 rounded-xl shadow-2xl"
            offset={4}
          >
            <div
              style={{
                backgroundColor: "var(--card)",
              }}
            >
              <DropdownItem
                onClick={() => setTypeFilter("all")}
                icon={
                  <BarChart3
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                }
                className={`dropdown-item ${
                  typeFilter === "all"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>All Types</span>
                  {typeFilter === "all" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownItem
                onClick={() => setTypeFilter("income")}
                icon={
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: "var(--success)" }}
                  />
                }
                className={
                  typeFilter === "income"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Income Only</span>
                  {typeFilter === "income" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownItem
                onClick={() => setTypeFilter("expense")}
                icon={
                  <TrendingDown
                    className="w-4 h-4"
                    style={{ color: "var(--error)" }}
                  />
                }
                className={
                  typeFilter === "expense"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Expenses Only</span>
                  {typeFilter === "expense" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
            </div>
          </Dropdown>

          {/* Enhanced Category Filter Dropdown */}
          <Dropdown
            trigger={
              <button
                className="dropdown-trigger flex items-center justify-between w-full h-10 px-3 py-2 text-sm border rounded-lg transition-all duration-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Tag
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                  <span className="truncate">
                    {selectedCategory === "all"
                      ? "All Categories"
                      : getCategoryDisplayName(
                          selectedCategory as ExpenseCategory | IncomeCategory
                        )}
                  </span>
                </div>
                <ChevronDown
                  className="w-4 h-4"
                  style={{ color: "var(--foreground-secondary)" }}
                />
              </button>
            }
            contentClassName="w-56 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
            offset={4}
          >
            <div
              style={{
                backgroundColor: "var(--card)",
              }}
            >
              <DropdownItem
                onClick={() => setSelectedCategory("all")}
                icon={
                  <Tag
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                }
                className={
                  selectedCategory === "all"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>All Categories</span>
                  {selectedCategory === "all" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              {categories.length > 0 && <DropdownSeparator />}
              {categories.map((category) => (
                <DropdownItem
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  icon={
                    <FileText
                      className="w-4 h-4"
                      style={{ color: "var(--foreground-secondary)" }}
                    />
                  }
                  className={
                    selectedCategory === category.value
                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : ""
                  }
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{category.label}</span>
                    {selectedCategory === category.value && (
                      <Check
                        className="w-4 h-4"
                        style={{ color: "var(--success)" }}
                      />
                    )}
                  </div>
                </DropdownItem>
              ))}
            </div>
          </Dropdown>

          {/* Enhanced Date Range Filter Dropdown */}
          <Dropdown
            trigger={
              <button
                className="dropdown-trigger flex items-center justify-between w-full h-10 px-3 py-2 text-sm border rounded-lg transition-all duration-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Clock
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                  <span>
                    {dateRange === "all" && "All Time"}
                    {dateRange === "today" && "Today"}
                    {dateRange === "week" && "This Week"}
                    {dateRange === "month" && "This Month"}
                    {dateRange === "3months" && "Last 3 Months"}
                  </span>
                </div>
                <ChevronDown
                  className="w-4 h-4"
                  style={{ color: "var(--foreground-secondary)" }}
                />
              </button>
            }
            contentClassName="w-48 rounded-xl shadow-2xl "
            offset={4}
          >
            <div
              style={{
                backgroundColor: "var(--card)",
              }}
            >
              <DropdownItem
                onClick={() => setDateRange("all")}
                icon={
                  <Calendar
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                }
                className={
                  dateRange === "all"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>All Time</span>
                  {dateRange === "all" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                onClick={() => setDateRange("today")}
                icon={
                  <Zap
                    className="w-4 h-4"
                    style={{ color: "var(--warning)" }}
                  />
                }
                className={
                  dateRange === "today"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Today</span>
                  {dateRange === "today" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownItem
                onClick={() => setDateRange("week")}
                icon={
                  <Calendar
                    className="w-4 h-4"
                    style={{ color: "var(--info)" }}
                  />
                }
                className={
                  dateRange === "week"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>This Week</span>
                  {dateRange === "week" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownItem
                onClick={() => setDateRange("month")}
                icon={
                  <Target
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                }
                className={
                  dateRange === "month"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>This Month</span>
                  {dateRange === "month" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownItem
                onClick={() => setDateRange("3months")}
                icon={
                  <BarChart3
                    className="w-4 h-4"
                    style={{ color: "var(--success)" }}
                  />
                }
                className={
                  dateRange === "3months"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Last 3 Months</span>
                  {dateRange === "3months" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
            </div>
          </Dropdown>

          {/* Enhanced Sort Options Dropdown */}
          <Dropdown
            trigger={
              <button
                className="dropdown-trigger flex items-center justify-between w-full h-10 px-3 py-2 text-sm border rounded-lg transition-all duration-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <div className="flex items-center gap-2">
                  {(sortBy === "date-desc" || sortBy === "date-asc") && (
                    <Clock
                      className="w-4 h-4"
                      style={{ color: "var(--primary)" }}
                    />
                  )}
                  {(sortBy === "amount-desc" || sortBy === "amount-asc") && (
                    <DollarSign
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                  {sortBy === "description-asc" && (
                    <FileText
                      className="w-4 h-4"
                      style={{ color: "var(--info)" }}
                    />
                  )}
                  <span className="truncate">
                    {sortBy === "date-desc" && "Newest First"}
                    {sortBy === "date-asc" && "Oldest First"}
                    {sortBy === "amount-desc" && "Highest Amount"}
                    {sortBy === "amount-asc" && "Lowest Amount"}
                    {sortBy === "description-asc" && "A-Z Description"}
                  </span>
                </div>
                <ChevronDown
                  className="w-4 h-4"
                  style={{ color: "var(--foreground-secondary)" }}
                />
              </button>
            }
            contentClassName="w-52 rounded-xl shadow-2xl"
            offset={4}
          >
            <div
              style={{
                backgroundColor: "var(--card)",
              }}
            >
              <DropdownItem
                onClick={() => setSortBy("date-desc")}
                icon={
                  <SortDesc
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                }
                className={
                  sortBy === "date-desc"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Newest First</span>
                  {sortBy === "date-desc" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownItem
                onClick={() => setSortBy("date-asc")}
                icon={
                  <SortAsc
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                }
                className={
                  sortBy === "date-asc"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Oldest First</span>
                  {sortBy === "date-asc" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                onClick={() => setSortBy("amount-desc")}
                icon={
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: "var(--success)" }}
                  />
                }
                className={
                  sortBy === "amount-desc"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Highest Amount</span>
                  {sortBy === "amount-desc" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownItem
                onClick={() => setSortBy("amount-asc")}
                icon={
                  <TrendingDown
                    className="w-4 h-4"
                    style={{ color: "var(--error)" }}
                  />
                }
                className={
                  sortBy === "amount-asc"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>Lowest Amount</span>
                  {sortBy === "amount-asc" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                onClick={() => setSortBy("description-asc")}
                icon={
                  <FileText
                    className="w-4 h-4"
                    style={{ color: "var(--info)" }}
                  />
                }
                className={
                  sortBy === "description-asc"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : ""
                }
              >
                <div className="flex items-center justify-between w-full">
                  <span>A-Z Description</span>
                  {sortBy === "description-asc" && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                </div>
              </DropdownItem>
            </div>
          </Dropdown>
        </div>

        {/* Results Summary */}
        <div
          className="mt-4 p-3 rounded-lg border text-sm"
          style={{
            backgroundColor: "var(--card-hover)",
            borderColor: "var(--border)",
            color: "var(--foreground-secondary)",
          }}
        >
          Showing{" "}
          <span className="font-semibold">
            {filteredAndSortedTransactions.length}
          </span>{" "}
          of <span className="font-semibold">{transactions.length}</span>{" "}
          transactions
          {(searchTerm ||
            typeFilter !== "all" ||
            selectedCategory !== "all" ||
            dateRange !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setSelectedCategory("all");
                setDateRange("all");
                setSortBy("date-desc");
              }}
              className="ml-3 h-auto p-1 text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div
        className="rounded-2xl shadow-lg border overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <h3
              className="text-xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Recent Transactions
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--card-hover)" }}
              >
                <Receipt
                  className="w-8 h-8"
                  style={{ color: "var(--foreground-secondary)" }}
                />
              </div>
              <h4
                className="text-lg font-medium mb-2"
                style={{ color: "var(--foreground)" }}
              >
                {transactions.length === 0
                  ? "No transactions yet"
                  : "No transactions match your filters"}
              </h4>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--foreground-secondary)" }}
              >
                {transactions.length === 0
                  ? "Add your first transaction to get started tracking your finances"
                  : "Try adjusting your search criteria or filters"}
              </p>
              {transactions.length === 0 && (
                <Button
                  onClick={() => setShowExpenseForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-all duration-300 group"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--card)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--card)";
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Transaction Type Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor:
                          transaction.type === TransactionType.INCOME
                            ? "var(--success)"
                            : "var(--error)",
                      }}
                    >
                      {transaction.type === TransactionType.INCOME ? (
                        <ArrowUp className="w-6 h-6 text-white" />
                      ) : (
                        <ArrowDown className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className="font-semibold text-lg truncate"
                          style={{ color: "var(--foreground)" }}
                        >
                          {transaction.description}
                        </h4>
                        <span
                          className="text-xl font-bold"
                          style={{
                            color:
                              transaction.type === TransactionType.INCOME
                                ? "var(--success)"
                                : "var(--error)",
                          }}
                        >
                          {transaction.type === TransactionType.INCOME
                            ? "+"
                            : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className="flex items-center gap-1"
                          style={{ color: "var(--foreground-secondary)" }}
                        >
                          <Eye className="w-4 h-4" />
                          {getCategoryDisplayName(transaction.category)}
                        </span>
                        <span
                          className="flex items-center gap-1"
                          style={{ color: "var(--foreground-secondary)" }}
                        >
                          <Calendar className="w-4 h-4" />
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Add Transaction Modal */}
      {showExpenseForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExpenseForm(false);
            }
          }}
        >
          <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200/50 dark:border-slate-700/50 transform transition-all duration-300 scale-100 animate-scale-in overflow-hidden">
            {/* Enhanced Modal Header */}
            <div className="relative  px-6 pt-6 border-b border-slate-200 dark:border-slate-700">
              {/* Close Button */}
              <button
                onClick={() => setShowExpenseForm(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md border border-slate-200 dark:border-slate-600 z-10"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>

              {/* Header Content */}
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    Add New Transaction
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300">
                    Record your income or expense transaction
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Modal Body */}
            <div className="p-6">
              <ExpenseForm
                onSuccess={() => {
                  setShowExpenseForm(false);
                  if (user?.id) {
                    fetchTransactions(user.id);
                  }
                }}
                onCancel={() => setShowExpenseForm(false)}
              />
            </div>

            {/* Modal Footer with Tips */}
            <div className="px-6 pb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mt-0.5">
                    <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                      Quick Tips
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <li>
                        • Use clear descriptions to track your spending patterns
                      </li>
                      <li>
                        • Choose the right category for better budget insights
                      </li>
                      <li>• Double-check the amount and date before saving</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
