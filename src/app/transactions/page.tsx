/**
 * Enhanced Professional Transactions Page
 * A comprehensive page for viewing and managing all user transactions with advanced
 * filtering, sorting, search capabilities, and beautiful statistics. Features
 * professional UI design with Lucide icons, responsive layout, and seamless
 * integration with the website's theme system.
 */

"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
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
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown, DropdownSeparator } from "@/components/ui/Dropdown";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  X,
  SortDesc,
  SortAsc,
  Clock,
  Tag,
  FileText,
  Target,
  Zap,
  Utensils,
  Car,
  Gamepad2,
  ShoppingBag,
  Home,
  Heart,
  GraduationCap,
  Briefcase,
  PiggyBank,
  Gift,
  CheckCircle,
} from "lucide-react";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "description-asc";
type FilterOption = "all" | "income" | "expense";

// Motion variants for dropdown items
const dropdownItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Category icons mapping
const getCategoryIcon = (category: string) => {
  const iconMap: Record<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  > = {
    // Expense categories
    food: Utensils,
    transportation: Car,
    entertainment: Gamepad2,
    shopping: ShoppingBag,
    utilities: Home,
    healthcare: Heart,
    education: GraduationCap,
    other: Zap,
    // Income categories
    salary: Briefcase,
    freelance: Target,
    investment: PiggyBank,
    gift: Gift,
    bonus: CheckCircle,
  };

  return iconMap[category.toLowerCase()] || Zap;
};

// Date range icons mapping
const getDateRangeIcon = (dateRange: string) => {
  const iconMap: Record<
    string,
    {
      icon: React.ComponentType<{
        className?: string;
        style?: React.CSSProperties;
      }>;
      color: string;
    }
  > = {
    all: { icon: Calendar, color: "#3b82f6" }, // blue-500
    today: { icon: Zap, color: "#eab308" }, // yellow-500
    week: { icon: Calendar, color: "#0ea5e9" }, // sky-500
    month: { icon: Target, color: "#3b82f6" }, // blue-500
    "3months": { icon: BarChart3, color: "#10b981" }, // emerald-500
  };

  return iconMap[dateRange] || { icon: Clock, color: "#3b82f6" };
};

// Sort option icons mapping
const getSortIcon = (sortBy: string) => {
  const iconMap: Record<
    string,
    {
      icon: React.ComponentType<{
        className?: string;
        style?: React.CSSProperties;
      }>;
      color: string;
    }
  > = {
    "date-desc": { icon: SortDesc, color: "#3b82f6" }, // blue-500
    "date-asc": { icon: SortAsc, color: "#3b82f6" }, // blue-500
    "amount-desc": { icon: TrendingUp, color: "#10b981" }, // emerald-500
    "amount-asc": { icon: TrendingDown, color: "#ef4444" }, // red-500
    "description-asc": { icon: FileText, color: "#0ea5e9" }, // sky-500
  };

  return iconMap[sortBy] || { icon: Clock, color: "#3b82f6" };
};

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
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Screen size detection
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Mobile transaction selection state
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  // Refs for dropdown triggers
  const typeDropdownRef = useRef<HTMLButtonElement>(null);
  const categoryDropdownRef = useRef<HTMLButtonElement>(null);
  const dateDropdownRef = useRef<HTMLButtonElement>(null);
  const sortDropdownRef = useRef<HTMLButtonElement>(null);

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

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showDeleteModal) {
          cancelDeleteTransaction();
        } else if (showExpenseForm) {
          setShowExpenseForm(false);
        } else if (selectedTransactionId) {
          setSelectedTransactionId(null);
        }
      }
    };

    if (showExpenseForm || showDeleteModal || selectedTransactionId) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showExpenseForm, showDeleteModal, selectedTransactionId]);

  // Handle click outside to close dropdowns and clear transaction selection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside any dropdown
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(target)
      ) {
        setTypeDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setCategoryDropdownOpen(false);
      }
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(target)
      ) {
        setDateDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(target)
      ) {
        setSortDropdownOpen(false);
      }

      // Clear transaction selection when clicking outside on non-large screens
      if (!isLargeScreen && selectedTransactionId) {
        // Check if the click is outside any transaction element
        const clickedElement = target as Element;
        const transactionElement = clickedElement.closest(".transaction-item");

        if (!transactionElement) {
          setSelectedTransactionId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLargeScreen, selectedTransactionId]);

  // Handle mouse enter for large screens only
  const handleMouseEnter = (
    setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>,
    dropdownRef: React.RefObject<HTMLButtonElement | null>
  ) => {
    if (isLargeScreen && dropdownRef.current) {
      dropdownRef.current.click();
    }
  };

  // Handle mouse leave for large screens only - only close when leaving dropdown content
  const handleMouseLeaveDropdownContent = () => {
    if (isLargeScreen) {
      // Simulate click outside to close dropdown
      setTimeout(() => {
        document.dispatchEvent(
          new MouseEvent("mousedown", {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
          })
        );
      }, 0);
    }
  };

  // Handle dropdown item selection by simulating click outside
  const handleDropdownItemSelect = () => {
    // Simulate click outside to close all dropdowns
    setTimeout(() => {
      document.dispatchEvent(
        new MouseEvent("mousedown", {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0,
        })
      );
    }, 0);
  };

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
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);

      // Show success toast notification
      const transactionTypeLabel =
        transactionToDelete.type === TransactionType.INCOME
          ? "Income"
          : "Expense";
      toast.success(
        `${transactionTypeLabel} transaction for ${getCategoryDisplayName(
          transactionToDelete.category as ExpenseCategory | IncomeCategory
        )} deleted successfully!`
      );

      // Clear selection after deletion
      setSelectedTransactionId(null);
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    }
  };

  const cancelDeleteTransaction = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  // Handle mobile transaction selection
  const handleMobileTransactionClick = (transactionId: string) => {
    if (!isLargeScreen) {
      setSelectedTransactionId((prevId) =>
        prevId === transactionId ? null : transactionId
      );
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
    <div className="min-h-screen w-full flex justify-center items-start bg-[var(--background)]">
      <div className="w-full max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-7xl mx-auto px-2 sm:px-4 py-8 mb-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-18 h-18 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl mb-6">
              <IndianRupee className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-emerald-800 dark:text-emerald-400 drop-shadow-lg">
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
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:-translate-y-2 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300">
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
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:-translate-y-2 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300">
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
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:-translate-y-2 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300">
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
                    statistics.netIncome >= 0
                      ? "var(--success)"
                      : "var(--error)",
                }}
              >
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Transactions Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:-translate-y-2 hover:bg-gray-100 dark:hover:bg-slate-900 transition-all duration-300">
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
          {/* Mobile Layout */}
          <div className="block md:hidden mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">
                <Filter className="w-3 h-3 text-white" />
              </div>
              <h3
                className="text-base font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Filter & Search Transactions
              </h3>
            </div>

            <div className="flex flex-row gap-3 w-full">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="flex items-center justify-center gap-2 flex-1 h-10 px-3"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="text-sm">Refresh</span>
              </Button>
              <Button
                onClick={() => setShowExpenseForm(true)}
                size="sm"
                className="flex items-center justify-center gap-2 flex-1 h-10 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-500 hover:border-emerald-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </Button>
            </div>
          </div>

          {/* Medium and Desktop Layout */}
          <div className="hidden md:flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Filter & Search Transactions
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-3 sm:gap-2 w-full sm:w-auto h-10 px-3"
                >
                  <RefreshCw
                    className={`w-5 h-5 -translate-x-1 sm:translate-x-0 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                  <span className="inline-block align-middle">Refresh</span>
                </Button>
                <Button
                  onClick={() => setShowExpenseForm(true)}
                  size="sm"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-500 hover:border-emerald-200 text-xs sm:text-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span className="inline-block align-middle">
                    Add Transaction
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Enhanced Search - Full Width */}
            <div className="relative w-full">
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

            {/* Filter Dropdowns - 2x2 Grid on Mobile, Responsive on Larger Screens */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {/* Enhanced Type Filter Dropdown */}
              <Dropdown
                trigger={
                  <button
                    ref={typeDropdownRef}
                    className={`dropdown-trigger flex items-center justify-between w-full h-10 px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      typeDropdownOpen ? "" : "border border-[var(--border)]"
                    }`}
                    onClick={() => setTypeDropdownOpen((open) => !open)}
                    onMouseEnter={() =>
                      handleMouseEnter(setTypeDropdownOpen, typeDropdownRef)
                    }
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
                  onMouseLeave={() => handleMouseLeaveDropdownContent()}
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      setTypeFilter("all");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      typeFilter === "all"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-2 border-emerald-500"
                        : "hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 0 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <BarChart3
                      className={`w-5 h-5 mr-3 ${
                        typeFilter === "all"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-emerald-500"
                      }`}
                    />
                    <span className="font-medium">All Types</span>
                    {typeFilter === "all" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setTypeFilter("income");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      typeFilter === "income"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-2 border-emerald-500"
                        : "hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 1 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <TrendingUp
                      className={`w-5 h-5 mr-3 ${
                        typeFilter === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-emerald-500"
                      }`}
                    />
                    <span className="font-medium">Income Only</span>
                    {typeFilter === "income" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setTypeFilter("expense");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      typeFilter === "expense"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-r-2 border-red-500"
                        : "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 2 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <TrendingDown
                      className={`w-5 h-5 mr-3 ${
                        typeFilter === "expense"
                          ? "text-red-600 dark:text-red-400"
                          : "text-red-500"
                      }`}
                    />
                    <span className="font-medium">Expenses Only</span>
                    {typeFilter === "expense" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-red-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                </div>
              </Dropdown>

              {/* Enhanced Category Filter Dropdown */}
              <Dropdown
                trigger={
                  <button
                    ref={categoryDropdownRef}
                    className={`dropdown-trigger flex items-center justify-between w-full h-10 px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      categoryDropdownOpen
                        ? ""
                        : "border border-[var(--border)]"
                    }`}
                    onClick={() => setCategoryDropdownOpen((open) => !open)}
                    onMouseEnter={() =>
                      handleMouseEnter(
                        setCategoryDropdownOpen,
                        categoryDropdownRef
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      {selectedCategory === "all" ? (
                        <Tag
                          className="w-4 h-4"
                          style={{ color: "var(--primary)" }}
                        />
                      ) : (
                        (() => {
                          const IconComponent =
                            getCategoryIcon(selectedCategory);
                          return (
                            <IconComponent
                              className="w-4 h-4"
                              style={{ color: "var(--primary)" }}
                            />
                          );
                        })()
                      )}
                      <span className="truncate">
                        {selectedCategory === "all"
                          ? "All Categories"
                          : getCategoryDisplayName(
                              selectedCategory as
                                | ExpenseCategory
                                | IncomeCategory
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
                  onMouseLeave={() => handleMouseLeaveDropdownContent()}
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("all");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      selectedCategory === "all"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-r-2 border-blue-500"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 0 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <Tag
                      className={`w-5 h-5 mr-3 ${
                        selectedCategory === "all"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-blue-500"
                      }`}
                    />
                    <span className="font-medium">All Categories</span>
                    {selectedCategory === "all" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  {categories.length > 0 && <DropdownSeparator />}
                  {categories.map((category, index) => {
                    const IconComponent = getCategoryIcon(category.value);
                    return (
                      <motion.button
                        key={category.value}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category.value);
                          handleDropdownItemSelect();
                        }}
                        className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                          selectedCategory === category.value
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-2 border-emerald-500"
                            : "hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                        }`}
                        variants={dropdownItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{
                          delay: (index + 1) * 0.05,
                          duration: 0.3,
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                        whileTap={{
                          scale: 0.98,
                          transition: { duration: 0.1 },
                        }}
                      >
                        <IconComponent
                          className={`w-5 h-5 mr-3 ${
                            selectedCategory === category.value
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-emerald-500"
                          }`}
                        />
                        <span className="font-medium truncate">
                          {category.label}
                        </span>
                        {selectedCategory === category.value && (
                          <motion.div
                            className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </Dropdown>

              {/* Enhanced Date Range Filter Dropdown */}
              <Dropdown
                trigger={
                  <button
                    ref={dateDropdownRef}
                    className={`dropdown-trigger flex items-center justify-between w-full h-10 px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      dateDropdownOpen ? "" : "border border-[var(--border)]"
                    }`}
                    onClick={() => setDateDropdownOpen((open) => !open)}
                    onMouseEnter={() =>
                      handleMouseEnter(setDateDropdownOpen, dateDropdownRef)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {(() => {
                        const { icon: IconComponent, color } =
                          getDateRangeIcon(dateRange);
                        return (
                          <IconComponent
                            className="w-4 h-4"
                            style={{ color }}
                          />
                        );
                      })()}
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
                  onMouseLeave={() => handleMouseLeaveDropdownContent()}
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      setDateRange("all");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      dateRange === "all"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-r-2 border-blue-500"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 0 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <Calendar
                      className={`w-5 h-5 mr-3 ${
                        dateRange === "all"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-blue-500"
                      }`}
                    />
                    <span className="font-medium">All Time</span>
                    {dateRange === "all" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <DropdownSeparator />
                  <motion.button
                    type="button"
                    onClick={() => {
                      setDateRange("today");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      dateRange === "today"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-r-2 border-yellow-500"
                        : "hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 1 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <Zap
                      className={`w-5 h-5 mr-3 ${
                        dateRange === "today"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-yellow-500"
                      }`}
                    />
                    <span className="font-medium">Today</span>
                    {dateRange === "today" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setDateRange("week");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      dateRange === "week"
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-r-2 border-sky-500"
                        : "hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 2 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <Calendar
                      className={`w-5 h-5 mr-3 ${
                        dateRange === "week"
                          ? "text-sky-600 dark:text-sky-400"
                          : "text-sky-500"
                      }`}
                    />
                    <span className="font-medium">This Week</span>
                    {dateRange === "week" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-sky-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setDateRange("month");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      dateRange === "month"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-r-2 border-blue-500"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 3 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <Target
                      className={`w-5 h-5 mr-3 ${
                        dateRange === "month"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-blue-500"
                      }`}
                    />
                    <span className="font-medium">This Month</span>
                    {dateRange === "month" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setDateRange("3months");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      dateRange === "3months"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-2 border-emerald-500"
                        : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 4 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <BarChart3
                      className={`w-5 h-5 mr-3 ${
                        dateRange === "3months"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-emerald-500"
                      }`}
                    />
                    <span className="font-medium">Last 3 Months</span>
                    {dateRange === "3months" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                </div>
              </Dropdown>

              {/* Enhanced Sort Options Dropdown */}
              <Dropdown
                trigger={
                  <button
                    ref={sortDropdownRef}
                    className={`dropdown-trigger flex items-center justify-between w-full h-10 px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      sortDropdownOpen ? "" : "border border-[var(--border)]"
                    }`}
                    onClick={() => setSortDropdownOpen((open) => !open)}
                    onMouseEnter={() =>
                      handleMouseEnter(setSortDropdownOpen, sortDropdownRef)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {(() => {
                        const { icon: IconComponent, color } =
                          getSortIcon(sortBy);
                        return (
                          <IconComponent
                            className="w-4 h-4"
                            style={{ color }}
                          />
                        );
                      })()}
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
                  onMouseLeave={() => handleMouseLeaveDropdownContent()}
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSortBy("date-desc");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      sortBy === "date-desc"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-r-2 border-blue-500"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 0 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <SortDesc
                      className={`w-5 h-5 mr-3 ${
                        sortBy === "date-desc"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-blue-500"
                      }`}
                    />
                    <span className="font-medium">Newest First</span>
                    {sortBy === "date-desc" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSortBy("date-asc");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      sortBy === "date-asc"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-r-2 border-blue-500"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 1 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <SortAsc
                      className={`w-5 h-5 mr-3 ${
                        sortBy === "date-asc"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-blue-500"
                      }`}
                    />
                    <span className="font-medium">Oldest First</span>
                    {sortBy === "date-asc" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <DropdownSeparator />
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSortBy("amount-desc");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      sortBy === "amount-desc"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-2 border-emerald-500"
                        : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 2 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <TrendingUp
                      className={`w-5 h-5 mr-3 ${
                        sortBy === "amount-desc"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-emerald-500"
                      }`}
                    />
                    <span className="font-medium">Highest Amount</span>
                    {sortBy === "amount-desc" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSortBy("amount-asc");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      sortBy === "amount-asc"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-r-2 border-red-500"
                        : "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 3 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <TrendingDown
                      className={`w-5 h-5 mr-3 ${
                        sortBy === "amount-asc"
                          ? "text-red-600 dark:text-red-400"
                          : "text-red-500"
                      }`}
                    />
                    <span className="font-medium">Lowest Amount</span>
                    {sortBy === "amount-asc" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-red-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                  <DropdownSeparator />
                  <motion.button
                    type="button"
                    onClick={() => {
                      setSortBy("description-asc");
                      handleDropdownItemSelect();
                    }}
                    className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                      sortBy === "description-asc"
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-r-2 border-sky-500"
                        : "hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400"
                    }`}
                    variants={dropdownItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      delay: 4 * 0.05,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                  >
                    <FileText
                      className={`w-5 h-5 mr-3 ${
                        sortBy === "description-asc"
                          ? "text-sky-600 dark:text-sky-400"
                          : "text-sky-500"
                      }`}
                    />
                    <span className="font-medium">A-Z Description</span>
                    {sortBy === "description-asc" && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-sky-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    )}
                  </motion.button>
                </div>
              </Dropdown>
            </div>
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
        <div className="rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50">
          <div
            className="p-6 border-b"
            style={{ borderColor: "var(--border)" }}
          >
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
                  <IndianRupee
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
              <div className="space-y-4">
                {filteredAndSortedTransactions.map((transaction) => {
                  return (
                    <div
                      key={transaction.id}
                      onClick={() =>
                        handleMobileTransactionClick(transaction.id)
                      }
                      className={`transaction-item group relative flex flex-col lg:flex-row lg:items-center lg:justify-between py-2 lg:p-4 px-4 rounded-xl border backdrop-blur-sm shadow transition-all duration-300 cursor-pointer lg:cursor-default border-l-4 ${
                        // Mobile/Medium: New styling with gradient background
                        "lg:bg-white/80 lg:dark:bg-slate-800/80 lg:hover:bg-gray-100 lg:dark:hover:bg-slate-900 lg:hover:shadow-xl lg:hover:scale-[1.01]"
                      } ${
                        // Mobile/Medium: Budget card style
                        "bg-gradient-to-tl from-white via-white to-slate-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 hover:shadow-2xl hover:scale-[1.02] lg:hover:scale-[1.01] duration-500 lg:duration-300"
                      } ${
                        // Dynamic left border color based on transaction type
                        transaction.type === TransactionType.INCOME
                          ? "hover:border-emerald-400 dark:hover:border-emerald-500"
                          : "hover:border-red-400 dark:hover:border-red-500"
                      } border-slate-200/50 dark:border-slate-700/50`}
                      style={{
                        borderLeftColor:
                          transaction.type === TransactionType.INCOME
                            ? "#10b981"
                            : "#ef4444",
                      }}
                    >
                      {/* Enhanced gradient overlay - matching budget card style - only on mobile/medium */}
                      <div className="lg:hidden pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-950 rounded-xl" />
                      {/* Mobile Layout */}
                      <div className="block md:hidden relative z-10 w-full">
                        {/* Transaction Type Icon - Top Right */}
                        <div className="absolute top-0 right-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor:
                                transaction.type === TransactionType.INCOME
                                  ? "var(--success)"
                                  : "var(--error)",
                            }}
                          >
                            {transaction.type === TransactionType.INCOME ? (
                              <ArrowUp className="w-4 h-4 text-white" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="pr-10">
                          <h4
                            className="font-semibold text-base mb-1"
                            style={{ color: "var(--foreground)" }}
                          >
                            {transaction.description}
                          </h4>
                          <span
                            className="text-lg font-bold block mb-2"
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
                          <div className="flex flex-col gap-1 text-sm">
                            <span
                              className="flex items-center gap-1"
                              style={{ color: "var(--foreground-secondary)" }}
                            >
                              <Eye className="w-3 h-3" />
                              {getCategoryDisplayName(transaction.category)}
                            </span>
                            <span
                              className="flex items-center gap-1"
                              style={{ color: "var(--foreground-secondary)" }}
                            >
                              <Calendar className="w-3 h-3" />
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>

                        {/* Action Button - Always visible, no background */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTransaction(transaction);
                          }}
                          className="absolute bottom-0 right-0 p-1 cursor-pointer transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" />
                        </div>
                      </div>

                      {/* Medium Screen Layout */}
                      <div className="hidden md:block lg:hidden relative z-10 w-full">
                        {/* Transaction Type Icon - Top Right */}
                        <div className="absolute top-0 right-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor:
                                transaction.type === TransactionType.INCOME
                                  ? "var(--success)"
                                  : "var(--error)",
                            }}
                          >
                            {transaction.type === TransactionType.INCOME ? (
                              <ArrowUp className="w-4 h-4 text-white" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="pr-10">
                          <h4
                            className="font-semibold text-lg mb-1"
                            style={{ color: "var(--foreground)" }}
                          >
                            {transaction.description}
                          </h4>
                          <span
                            className="text-xl font-bold block mb-2"
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
                          <div className="flex flex-row items-center gap-4 text-sm">
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

                        {/* Action Button - Always visible, no background */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTransaction(transaction);
                          }}
                          className="absolute bottom-0 right-0 p-1 cursor-pointer transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" />
                        </div>
                      </div>

                      {/* Desktop Layout (Large screens only) */}
                      <div className="hidden lg:flex flex-col sm:flex-row sm:items-center gap-4 flex-1 relative z-10 w-full">
                        {/* Transaction Type Icon */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto sm:mx-0"
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

                        {/* Transaction Details & Amount */}
                        <div className="flex flex-col w-full">
                          <div className="flex flex-row items-center justify-between w-full mb-1">
                            <h4
                              className="font-semibold text-lg truncate"
                              style={{ color: "var(--foreground)" }}
                            >
                              {transaction.description}
                            </h4>
                            <span
                              className="text-xl font-bold ml-2"
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
                          <div className="flex flex-row items-center justify-between text-sm mt-1 sm:justify-start sm:gap-4">
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
                          className="mt-2 sm:mt-0 sm:ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 self-end"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && transactionToDelete && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                cancelDeleteTransaction();
              }
            }}
          >
            <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md border border-slate-200/50 dark:border-slate-700/50 transform transition-all duration-300 scale-100 animate-scale-in">
              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-slate-500/50 dark:border-slate-700/50">
                {/* Delete Icon - Moved above the heading */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Heading */}
                <h3 className="text-2xl lg:text-3xl font-semibold text-slate-900 dark:text-white text-center mb-4">
                  Delete Transaction
                </h3>

                {/* Description with styled transaction name */}
                <p className="text-base text-slate-600 dark:text-slate-300 text-center px-2">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {transactionToDelete.description}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              {/* Modal Footer with Action Buttons */}
              <div className="p-6 pt-4 flex flex-row gap-3 sm:gap-4">
                {/* Delete Button */}
                <Button
                  type="button"
                  onClick={confirmDeleteTransaction}
                  className="flex items-center justify-center gap-2 flex-1 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </Button>

                {/* Cancel Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelDeleteTransaction}
                  className="flex items-center justify-center gap-2 flex-1 border-2 border-slate-300 dark:border-slate-600 hover:border-[#ef4444] dark:hover:border-[#ef4444] hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 focus:ring-2 focus:ring-[#ef4444]/30 focus:border-[#ef4444]"
                >
                  <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Cancel</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Add Transaction Modal */}
        {showExpenseForm && (
          <ExpenseForm
            asModal={true}
            onSuccess={() => {
              setShowExpenseForm(false);
              if (user?.id) {
                fetchTransactions(user.id);
              }
            }}
            onCancel={() => setShowExpenseForm(false)}
          />
        )}
      </div>
    </div>
  );
}
