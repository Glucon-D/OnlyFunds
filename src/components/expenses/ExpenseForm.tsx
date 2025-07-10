/**
 * Enhanced Professional Expense Form Component - Redesigned
 *
 * A beautifully designed form component for adding new income and expense transactions.
 * Features custom dropdowns, smooth animations, enhanced validation feedback,
 * modern UI design with proper theming, and seamless integration with framer-motion.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExpenseStore, useAuthStore } from "@/lib/zustand";
import { TransactionType, ExpenseCategory, IncomeCategory } from "@/lib/types";
import { transactionFormSchema } from "@/lib/utils/validation";
import {
  getExpenseCategories,
  getIncomeCategories,
  formatDateInput,
  getCategoryDisplayName,
} from "@/lib/utils/helpers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ChevronDown,
  IndianRupee,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Plus,
  Home,
  Car,
  Utensils,
  ShoppingBag,
  Gamepad2,
  Heart,
  GraduationCap,
  Briefcase,
  Gift,
  PiggyBank,
  Target,
  Zap,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface ExpenseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  asModal?: boolean; // New prop to control modal rendering
}

// Animation variants
const formVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
};

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
};

const dropdownItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const iconHoverVariants = {
  hover: { scale: 1.1 },
  tap: { scale: 0.95 },
};

const formContainerVariants = {
  hover: { scale: 1.02 },
};

// Category icons mapping
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSuccess,
  onCancel,
  asModal = false,
}) => {
  const { addTransaction } = useExpenseStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    category: "",
    customCategory: "",
    date: formatDateInput(new Date()),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Dropdown states
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus first field on mount and detect touch device
  useEffect(() => {
    const timer = setTimeout(() => {
      // Focus will be handled by the custom dropdown
    }, 100);

    // Detect if this is a touch device
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };

    checkTouchDevice();

    return () => clearTimeout(timer);
  }, []);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setTypeDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReset = useCallback(() => {
    setFormData({
      type: "",
      amount: "",
      description: "",
      category: "",
      customCategory: "",
      date: formatDateInput(new Date()),
    });
    setErrors({});
    setTypeDropdownOpen(false);
    setCategoryDropdownOpen(false);
  }, []);

  const validateForm = useCallback((): boolean => {
    try {
      transactionFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: unknown) {
      const fieldErrors: Record<string, string> = {};

      if (error && typeof error === "object" && "errors" in error) {
        (
          error as { errors: Array<{ path?: string[]; message: string }> }
        ).errors.forEach((err) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
      }

      setErrors(fieldErrors);
      return false;
    }
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const validatedData = transactionFormSchema.parse(formData);

        // Use custom category if "other" is selected and custom category is provided
        const finalCategory =
          validatedData.category === "other" && validatedData.customCategory
            ? validatedData.customCategory
            : validatedData.category;

        addTransaction(
          {
            type: validatedData.type,
            amount: validatedData.amount,
            description: validatedData.description,
            category: finalCategory as ExpenseCategory | IncomeCategory,
            date: validatedData.date,
          },
          user?.id
        );

        // Show success toast notification
        const transactionTypeLabel =
          formData.type === TransactionType.INCOME ? "Income" : "Expense";
        const categoryDisplayName =
          finalCategory === formData.category
            ? getCategoryDisplayName(
                formData.category as ExpenseCategory | IncomeCategory
              )
            : formData.customCategory;
        toast.success(
          `${transactionTypeLabel} transaction for ${categoryDisplayName} added successfully!`
        );

        // Reset form and close modal
        setFormData({
          type: "",
          amount: "",
          description: "",
          category: "",
          customCategory: "",
          date: formatDateInput(new Date()),
        });
        onSuccess?.();
      } catch (error) {
        console.error("Error adding transaction:", error);
        toast.error("Failed to add transaction. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData, addTransaction, user?.id, onSuccess]
  );

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to close
      if (event.key === "Escape") {
        event.preventDefault();
        if (typeDropdownOpen) setTypeDropdownOpen(false);
        else if (categoryDropdownOpen) setCategoryDropdownOpen(false);
        else onCancel?.();
        return;
      }

      // Ctrl/Cmd + Enter to submit
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        handleSubmit(event as unknown as React.FormEvent);
        return;
      }

      // Ctrl/Cmd + R to reset form
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        handleReset();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    onCancel,
    handleReset,
    handleSubmit,
    typeDropdownOpen,
    categoryDropdownOpen,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Calculate dynamic rows for description textarea
  const calculateRows = (text: string) => {
    if (!text) return 1;

    // Count explicit line breaks
    const lineBreaks = (text.match(/\n/g) || []).length;

    // Estimate characters per line based on textarea width
    // This is an approximation - adjust based on your font size and textarea width
    const charsPerLine = 45; // Approximate for typical textarea width
    const textLines = text.split("\n");
    let wrappedLines = 0;

    textLines.forEach((line) => {
      if (line.length === 0) {
        wrappedLines += 1;
      } else {
        wrappedLines += Math.ceil(line.length / charsPerLine);
      }
    });

    const totalLines = Math.max(lineBreaks + 1, wrappedLines);

    // Return between 1 and 4 rows, then scrollbar takes over
    return Math.min(Math.max(1, totalLines), 4);
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = descriptionRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;

      // Set height based on content, with min and max limits
      const minHeight = 42; // min-h-[42px]
      const maxHeight = 120; // max-h-[120px]
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;
    }
  }, [formData.description]);

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, type, category: "" }));
    setTypeDropdownOpen(false);
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: "" }));
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
      // Clear custom category when switching away from "other"
      customCategory: category === "other" ? prev.customCategory : "",
    }));
    setCategoryDropdownOpen(false);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
    if (errors.customCategory) {
      setErrors((prev) => ({ ...prev, customCategory: "" }));
    }
  };

  const handleDateIconClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.();
    }
  };

  const getCategoryOptions = () => {
    if (formData.type === TransactionType.EXPENSE) {
      return getExpenseCategories();
    } else if (formData.type === TransactionType.INCOME) {
      return getIncomeCategories();
    }
    return [];
  };

  const transactionTypeOptions = [
    {
      value: TransactionType.EXPENSE,
      label: "Expense",
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      value: TransactionType.INCOME,
      label: "Income",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  // Render the form content
  const formContent = (
    <motion.div
      className="w-full max-w-md mx-auto"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Form Header with Plus Icon and Close Button */}
      <div className="flex items-center justify-between mb-4 lg:mb-5">
        <div className="flex items-center">
          <motion.div
            variants={iconHoverVariants}
            whileHover={{
              rotate: 12,
              scale: 1.05,
            }}
            whileTap={{
              rotate: -5,
              scale: 0.95,
            }}
            transition={{
              duration: 0.2,
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg mr-2.5 lg:mr-3 hover:animate-spin"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </motion.div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Add New Transaction
          </h2>
        </div>
        {onCancel && (
          <motion.button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 lg:w-8 lg:h-8 rounded-md lg:rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 shadow-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-500 dark:text-slate-400" />
          </motion.button>
        )}
      </div>

      {/* Enhanced Form */}
      <motion.div
        className="rounded-xl lg:rounded-2xl p-4 lg:p-5 xl:p-6 shadow-xl border backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:border-emerald-500/50"
        variants={formContainerVariants}
        whileHover="hover"
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-3 lg:space-y-4"
        >
          {/* Transaction Type Custom Dropdown */}
          <div className="relative" ref={typeDropdownRef}>
            <label className="block text-sm lg:text-base font-medium mb-1.5 lg:mb-2 text-slate-700 dark:text-slate-200">
              <Plus className="lg:w-5 lg:h-5 w-4 h-4 inline mr-2 text-emerald-500" />
              Transaction Type
            </label>
            <motion.button
              type="button"
              onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              onMouseEnter={
                !isTouchDevice ? () => setTypeDropdownOpen(true) : undefined
              }
              onMouseLeave={
                !isTouchDevice ? () => setTypeDropdownOpen(false) : undefined
              }
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 ${
                errors.type
                  ? "border-red-500 ring-2 ring-red-500/20"
                  : focusedField === "type" || typeDropdownOpen
                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                  : "border-slate-300 dark:border-slate-600"
              } ${
                formData.type
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
                  : ""
              }`}
              onFocus={() => setFocusedField("type")}
              onBlur={() => setFocusedField(null)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isSubmitting}
            >
              <div className="flex items-center">
                {formData.type ? (
                  <>
                    {transactionTypeOptions.find(
                      (opt) => opt.value === formData.type
                    )?.icon &&
                      React.createElement(
                        transactionTypeOptions.find(
                          (opt) => opt.value === formData.type
                        )!.icon,
                        {
                          className: `w-5 h-5 mr-3 ${
                            transactionTypeOptions.find(
                              (opt) => opt.value === formData.type
                            )?.color
                          }`,
                        }
                      )}
                    <span className="text-slate-900 dark:text-white font-medium">
                      {
                        transactionTypeOptions.find(
                          (opt) => opt.value === formData.type
                        )?.label
                      }
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Choose transaction type
                  </span>
                )}
              </div>
              <motion.div
                animate={{ rotate: typeDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {typeDropdownOpen && (
                <motion.div
                  className="absolute top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  onMouseEnter={
                    !isTouchDevice ? () => setTypeDropdownOpen(true) : undefined
                  }
                  onMouseLeave={
                    !isTouchDevice
                      ? () => setTypeDropdownOpen(false)
                      : undefined
                  }
                >
                  {transactionTypeOptions.map((option, index) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => handleTypeSelect(option.value)}
                      className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                        formData.type === option.value
                          ? option.value === TransactionType.EXPENSE
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-r-2 border-red-500"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-2 border-emerald-500"
                          : option.value === TransactionType.EXPENSE
                          ? "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                          : "hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                      }`}
                      variants={dropdownItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      whileHover={{
                        x: 4,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{
                        scale:
                          option.value === TransactionType.EXPENSE
                            ? 0.96
                            : 0.98,
                        transition: { duration: 0.1 },
                      }}
                    >
                      <option.icon
                        className={`w-5 h-5 mr-3 ${
                          formData.type === option.value
                            ? option.value === TransactionType.EXPENSE
                              ? "text-red-600 dark:text-red-400"
                              : "text-emerald-600 dark:text-emerald-400"
                            : option.color
                        }`}
                      />
                      <span className="font-medium">{option.label}</span>
                      {formData.type === option.value && (
                        <motion.div
                          className={`ml-auto w-2 h-2 rounded-full ${
                            option.value === TransactionType.EXPENSE
                              ? "bg-red-500"
                              : "bg-emerald-500"
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.type}
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div className="relative">
            <label className="block text-sm lg:text-base font-medium mb-1.5 lg:mb-2 text-slate-700 dark:text-slate-200">
              <IndianRupee className="lg:w-5 lg:h-5 w-4 h-4 inline mr-2 text-emerald-500" />
              Amount
            </label>
            <div className="relative group">
              <div
                className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 transition-opacity duration-200 ${
                  focusedField === "amount" ? "opacity-100" : "opacity-0"
                }`}
              >
                <IndianRupee className="w-4 h-4 text-emerald-500" />
              </div>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileFocus={{ scale: 1.01 }}
              >
                <Input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                  error={errors.amount}
                  disabled={isSubmitting}
                  step="0.01"
                  min="0"
                  onFocus={() => setFocusedField("amount")}
                  onBlur={() => setFocusedField(null)}
                  className={`${
                    focusedField === "amount" ? "pl-10" : "pl-3"
                  } pr-12 text-lg font-medium transition-all duration-300 hover:border-emerald-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]`}
                />
              </motion.div>
              {/* Custom Number Input Controls */}
              <div className="absolute inset-y-0 right-0 flex flex-col">
                <button
                  type="button"
                  className="flex-1 px-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center rounded-tr-lg"
                  onClick={() => {
                    const newValue = (parseFloat(formData.amount) || 0) + 1;
                    setFormData((prev) => ({
                      ...prev,
                      amount: newValue.toString(),
                    }));
                  }}
                >
                  <ChevronUp className="w-4 h-4 text-emerald-500" />
                </button>
                <button
                  type="button"
                  className="flex-1 px-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center rounded-br-lg"
                  onClick={() => {
                    const newValue = Math.max(
                      0,
                      (parseFloat(formData.amount) || 0) - 1
                    );
                    setFormData((prev) => ({
                      ...prev,
                      amount: newValue.toString(),
                    }));
                  }}
                >
                  <ChevronDownIcon className="w-4 h-4 text-emerald-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Description Input */}
          <div className="relative">
            <label className="block text-sm lg:text-base font-medium mb-1.5 lg:mb-2 text-slate-700 dark:text-slate-200">
              <FileText className="lg:w-5 lg:h-5 w-4 h-4 inline mr-2 text-emerald-500" />
              Description
            </label>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileFocus={{ scale: 1.01 }}
            >
              <textarea
                ref={descriptionRef}
                name="description"
                placeholder="Enter transaction description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                rows={calculateRows(formData.description)}
                className={`w-full p-2.5 min-h-[42px] max-h-[120px] resize-none rounded-lg border transition-all duration-300 hover:border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 placeholder:text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  calculateRows(formData.description) >= 4
                    ? "overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500 dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-400"
                    : "overflow-hidden"
                } ${
                  errors.description
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : focusedField === "description"
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-300 dark:border-slate-600"
                }`}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#94a3b8 transparent",
                }}
              />
            </motion.div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category Custom Dropdown */}
          {formData.type && (
            <motion.div
              className="relative"
              ref={categoryDropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm lg:text-base font-medium mb-1.5 lg:mb-2 text-slate-700 dark:text-slate-200">
                <Target className="w-4 lg:w-5 h-4 lg:h-5 inline mr-2 text-emerald-500" />
                Category
              </label>
              <motion.button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                onMouseEnter={
                  !isTouchDevice
                    ? () => setCategoryDropdownOpen(true)
                    : undefined
                }
                onMouseLeave={
                  !isTouchDevice
                    ? () => setCategoryDropdownOpen(false)
                    : undefined
                }
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 ${
                  errors.category
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : focusedField === "category" || categoryDropdownOpen
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-300 dark:border-slate-600"
                } ${
                  formData.category
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
                    : ""
                }`}
                onFocus={() => setFocusedField("category")}
                onBlur={() => setFocusedField(null)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isSubmitting}
              >
                <div className="flex items-center">
                  {formData.category ? (
                    <>
                      {React.createElement(getCategoryIcon(formData.category), {
                        className: "w-5 h-5 mr-3 text-emerald-500",
                      })}
                      <span className="text-slate-900 dark:text-white font-medium">
                        {
                          getCategoryOptions().find(
                            (opt) => opt.value === formData.category
                          )?.label
                        }
                      </span>
                    </>
                  ) : (
                    <span className=" text-sm text-slate-500 dark:text-slate-400">
                      Select a category
                    </span>
                  )}
                </div>
                <motion.div
                  animate={{ rotate: categoryDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {categoryDropdownOpen && (
                  <motion.div
                    className="absolute top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-48 sm:max-h-44 lg:max-h-40 xl:max-h-36 2xl:max-h-32 overflow-y-auto"
                    style={{
                      maxHeight: "min(12rem, calc(100vh - 400px))",
                    }}
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    onMouseEnter={
                      !isTouchDevice
                        ? () => setCategoryDropdownOpen(true)
                        : undefined
                    }
                    onMouseLeave={
                      !isTouchDevice
                        ? () => setCategoryDropdownOpen(false)
                        : undefined
                    }
                  >
                    {getCategoryOptions().map((option, index) => {
                      const IconComponent = getCategoryIcon(option.value);
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleCategorySelect(option.value)}
                          className={`w-full flex items-center p-3 text-left transition-all duration-200 ${
                            formData.category === option.value
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-r-2 border-emerald-500"
                              : "hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                          }`}
                          variants={dropdownItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{
                            delay: index * 0.05,
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
                              formData.category === option.value
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-emerald-500"
                            }`}
                          />
                          <span className="font-medium">{option.label}</span>
                          {formData.category === option.value && (
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
                  </motion.div>
                )}
              </AnimatePresence>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.category}
                </p>
              )}
            </motion.div>
          )}

          {/* Custom Category Input - Show when "Other" is selected */}
          {formData.category === "other" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <label className="block text-sm lg:text-base font-medium mb-1.5 lg:mb-2 text-slate-700 dark:text-slate-200">
                <FileText className="w-4 lg:w-5 h-4 lg:h-5 inline mr-2 text-emerald-500" />
                Custom Category
              </label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileFocus={{ scale: 1.01 }}
              >
                <Input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleInputChange}
                  placeholder="Enter custom category name"
                  error={errors.customCategory}
                  disabled={isSubmitting}
                  onFocus={() => setFocusedField("customCategory")}
                  onBlur={() => setFocusedField(null)}
                  className="transition-all duration-300 hover:border-emerald-500"
                />
              </motion.div>
              {errors.customCategory && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.customCategory}
                </p>
              )}
            </motion.div>
          )}

          {/* Date Input */}
          <div className="relative">
            <label className="block text-sm lg:text-base font-medium mb-1.5 lg:mb-2 text-slate-700 dark:text-slate-200">
              <Calendar className=" w-4 h-4 lg:w-5 lg:h-5 inline mr-2 text-emerald-500" />
              Date
            </label>
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileFocus={{ scale: 1.01 }}
              >
                <Input
                  ref={dateInputRef}
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  error={errors.date}
                  disabled={isSubmitting}
                  onFocus={() => setFocusedField("date")}
                  onBlur={() => setFocusedField(null)}
                  className="pr-10 transition-all duration-300 hover:border-emerald-500 [&::-webkit-calendar-picker-indicator]:hidden"
                />
              </motion.div>
              <button
                type="button"
                onClick={handleDateIconClick}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
              >
                <Calendar className="w-5 h-5 text-emerald-500 hover:text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 lg:pt-4">
            <div className="flex flex-col sm:flex-row gap-2.5 lg:gap-3">
              <motion.div
                className="flex-1"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                transition={{
                  duration: 0.2,
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      <span className="text-sm sm:text-base">Adding...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-sm sm:text-base">
                        Add Transaction
                      </span>
                    </div>
                  )}
                </Button>
              </motion.div>

              {onCancel && (
                <motion.div
                  className="flex-1 sm:flex-initial sm:min-w-[120px]"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  transition={{
                    duration: 0.2,
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full border-2 border-slate-300 dark:border-slate-600 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center">
                      <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600 dark:text-red-400" />
                      <span className="text-sm sm:text-base">Cancel</span>
                    </div>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </form>
      </motion.div>

      {/* Quick Tips Section - Outside the form container */}
      <div className="mt-3 sm:mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-2.5">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/40 rounded-md flex items-center justify-center mt-0.5">
            <FileText className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Quick Tips
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-0.5">
              <li>• Add clear descriptions for better tracking</li>
              <li>• Choose proper categories for insights</li>
              <li>• Record transactions promptly for accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Return the form with or without modal wrapper
  if (asModal) {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onCancel?.();
          }
        }}
      >
        <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200/50 dark:border-slate-700/50 transform transition-all duration-300 scale-100 animate-scale-in overflow-hidden max-h-[90vh] lg:max-h-[85vh] xl:max-h-[80vh] 2xl:max-h-[75vh] flex flex-col">
          {/* Enhanced Modal Body - with scroll if needed */}
          <div
            className="p-4 lg:p-5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-slate-400/70 [&::-webkit-scrollbar-corner]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-slate-600/60 dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-500/70"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(148, 163, 184, 0.6) transparent",
            }}
          >
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return formContent;
};
