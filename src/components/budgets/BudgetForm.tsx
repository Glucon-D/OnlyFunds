/**
 * Budget Form Component
 *
 * A form component for creating and editing budget limits for expense categories.
 * Includes fields for category selection, budget amount, month, and year.
 * Features client-side validation using Zod schemas and integration with
 * the budget store for budget management functionality.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useBudgetStore, useAuthStore } from "@/lib/zustand";
import { budgetFormSchema } from "@/lib/utils/validation";
import { ExpenseCategory } from "@/lib/types";
import {
  getExpenseCategories,
  getMonthOptions,
  getYearOptions,
  getCurrentMonth,
  getCurrentYear,
  getCategoryDisplayName,
} from "@/lib/utils/helpers";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import {
  BarChart3,
  PiggyBank,
  X,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Target,
  Utensils,
  Car,
  Gamepad2,
  ShoppingBag,
  Home,
  Heart,
  GraduationCap,
  Zap,
  FileText,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface BudgetFormProps {
  defaultMonth?: number;
  defaultYear?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  defaultMonth,
  defaultYear,
  onSuccess,
  onCancel,
}) => {
  const { setBudget } = useBudgetStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    category: "",
    customCategory: "",
    amount: "",
    month: (defaultMonth || getCurrentMonth()).toString(),
    year: (defaultYear || getCurrentYear()).toString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Refs and timeout for improved dropdown behavior
  const categoryDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const monthDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const yearDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const categoryTriggerRef = useRef<HTMLButtonElement>(null);
  const monthTriggerRef = useRef<HTMLButtonElement>(null);
  const yearTriggerRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key press to close the form and detect touch device
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCancel) {
        onCancel();
      }
    };

    // Detect if this is a touch device
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };

    checkTouchDevice();
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onCancel]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        categoryTriggerRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        !categoryTriggerRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        monthDropdownRef.current &&
        monthTriggerRef.current &&
        !monthDropdownRef.current.contains(event.target as Node) &&
        !monthTriggerRef.current.contains(event.target as Node)
      ) {
        setShowMonthDropdown(false);
      }
      if (
        yearDropdownRef.current &&
        yearTriggerRef.current &&
        !yearDropdownRef.current.contains(event.target as Node) &&
        !yearTriggerRef.current.contains(event.target as Node)
      ) {
        setShowYearDropdown(false);
      }
    };

    if (showCategoryDropdown || showMonthDropdown || showYearDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCategoryDropdown, showMonthDropdown, showYearDropdown]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (categoryDropdownTimeoutRef.current) {
        clearTimeout(categoryDropdownTimeoutRef.current);
      }
      if (monthDropdownTimeoutRef.current) {
        clearTimeout(monthDropdownTimeoutRef.current);
      }
      if (yearDropdownTimeoutRef.current) {
        clearTimeout(yearDropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    try {
      budgetFormSchema.parse(formData);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedData = budgetFormSchema.parse(formData);

      // Use custom category if "other" is selected and custom category is provided
      const finalCategory =
        validatedData.category === "other" && validatedData.customCategory
          ? validatedData.customCategory
          : validatedData.category;

      setBudget(
        {
          category: finalCategory as ExpenseCategory,
          amount: validatedData.amount,
          month: validatedData.month,
          year: validatedData.year,
        },
        user?.id
      );

      // Show success toast notification
      const categoryDisplayName =
        finalCategory === validatedData.category
          ? getCategoryDisplayName(validatedData.category as ExpenseCategory)
          : validatedData.customCategory;
      toast.success(`Budget for ${categoryDisplayName} created successfully!`);

      // Reset form to default month/year but keep other fields for easy re-entry
      setFormData({
        category: "",
        customCategory: "",
        amount: "",
        month: (defaultMonth || getCurrentMonth()).toString(),
        year: (defaultYear || getCurrentYear()).toString(),
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error setting budget:", error);
      toast.error("Failed to create budget. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = getExpenseCategories();
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions(2020, 2030);

  // Animation variants
  const dropdownMenuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } },
  };

  const dropdownItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.05 + i * 0.05, duration: 0.3 },
    }),
    hover: { scale: 1.02 },
  };

  // Category icons mapping
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      food: Utensils,
      transportation: Car,
      entertainment: Gamepad2,
      shopping: ShoppingBag,
      utilities: Home,
      healthcare: Heart,
      education: GraduationCap,
      other: Zap,
    };

    return iconMap[category.toLowerCase()] || Zap;
  };

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
      // Clear custom category when switching away from "other"
      customCategory: category === "other" ? prev.customCategory : "",
    }));
    setShowCategoryDropdown(false);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
    if (errors.customCategory) {
      setErrors((prev) => ({ ...prev, customCategory: "" }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Enhanced Header with Responsive Layout */}
      <div className="mb-4 lg:mb-5">
        {/* Header Row with Icon, Title, and Close Button */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          {/* Left Side: Icon and Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Budget Icon */}
            <motion.div
              className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center"
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
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Create Budget
            </h2>
          </div>

          {/* Right Side: Close Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-6 h-6 sm:w-9 sm:h-9 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md sm:rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
              aria-label="Close form"
            >
              <X className="w-3 h-3 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
            </button>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300">
          Set a spending limit for a specific category and period
        </p>
      </div>

      {/* Enhanced Form */}
      <motion.div
        className="rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-xl border backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:border-emerald-500/50"
        whileHover={{
          scale: 1.02,
        }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        style={{ backfaceVisibility: "hidden", transform: "translateZ(0)" }}
      >
        <form
          id="budget-form"
          onSubmit={handleSubmit}
          className="space-y-3 lg:space-y-4"
        >
          {/* Category Selection with Enhanced Dropdown */}
          <div className="relative">
            <label className="block text-sm lg:text-base font-medium mb-1.5 lg:mb-2 text-slate-700 dark:text-slate-200">
              <Target className="w-4 lg:w-5 h-4 lg:h-5 inline mr-2 text-emerald-500" />
              Category
            </label>
            <motion.button
              ref={categoryTriggerRef}
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              onMouseEnter={
                !isTouchDevice ? () => setShowCategoryDropdown(true) : undefined
              }
              onMouseLeave={
                !isTouchDevice
                  ? () => setShowCategoryDropdown(false)
                  : undefined
              }
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 ${
                errors.category
                  ? "border-red-500 ring-2 ring-red-500/20"
                  : focusedField === "category" || showCategoryDropdown
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
                        categoryOptions.find(
                          (opt) => opt.value === formData.category
                        )?.label
                      }
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Choose a category to budget for
                  </span>
                )}
              </div>
              <motion.div
                animate={{ rotate: showCategoryDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  ref={categoryDropdownRef}
                  className="absolute top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-48 sm:max-h-44 lg:max-h-40 xl:max-h-36 2xl:max-h-32 overflow-y-auto"
                  style={{
                    maxHeight: "min(12rem, calc(100vh - 400px))",
                  }}
                  variants={dropdownMenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  onMouseEnter={
                    !isTouchDevice
                      ? () => setShowCategoryDropdown(true)
                      : undefined
                  }
                  onMouseLeave={
                    !isTouchDevice
                      ? () => setShowCategoryDropdown(false)
                      : undefined
                  }
                >
                  {categoryOptions.map((option, index) => {
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
          </div>

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

          {/* Amount Input with Enhanced Styling */}
          <div className="relative">
            <label className="block text-sm lg:text-base font-medium mb-1.5 lg:mb-2 text-slate-700 dark:text-slate-200">
              <IndianRupee className="lg:w-5 lg:h-5 w-4 h-4 inline mr-2 text-emerald-500" />
              Budget Amount
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
            {formData.amount && !errors.amount && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Budget: ₹{parseFloat(formData.amount || "0").toLocaleString()}
              </p>
            )}
          </div>

          {/* Period Selection with Custom Dropdowns */}
          <div className="space-y-4">
            <label className="text-sm lg:text-base font-medium mb-3 text-slate-700 dark:text-slate-200 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400"
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
              Budget Period
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Month Dropdown */}
              <div className="space-y-2">
                <div className="relative">
                  <motion.button
                    ref={monthTriggerRef}
                    type="button"
                    className={`w-full px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-left ${
                      showMonthDropdown
                        ? ""
                        : "border-2 border-emerald-200 dark:border-emerald-800"
                    }`}
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    onMouseEnter={
                      !isTouchDevice
                        ? () => setShowMonthDropdown(true)
                        : undefined
                    }
                    onMouseLeave={
                      !isTouchDevice
                        ? () => setShowMonthDropdown(false)
                        : undefined
                    }
                    aria-expanded={showMonthDropdown}
                    aria-haspopup="true"
                    aria-label="Select month"
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {monthOptions.find(
                          (opt) => opt.value.toString() === formData.month
                        )?.label || "Month"}
                      </span>
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
                  {showMonthDropdown && (
                    <motion.div
                      ref={monthDropdownRef}
                      className="absolute top-full left-0 w-full rounded-xl shadow-2xl border z-50 bg-white/90 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 backdrop-blur-xl origin-top"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownMenuVariants}
                      onMouseEnter={
                        !isTouchDevice
                          ? () => setShowMonthDropdown(true)
                          : undefined
                      }
                      onMouseLeave={
                        !isTouchDevice
                          ? () => setShowMonthDropdown(false)
                          : undefined
                      }
                    >
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {monthOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                month: option.value.toString(),
                              }));
                              setShowMonthDropdown(false);
                            }}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800 dark:hover:text-emerald-100 ${
                              formData.month === option.value.toString()
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
                              {formData.month === option.value.toString() && (
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

              {/* Year Dropdown */}
              <div className="space-y-2">
                <div className="relative">
                  <motion.button
                    ref={yearTriggerRef}
                    type="button"
                    className={`w-full px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-left ${
                      showYearDropdown
                        ? ""
                        : "border-2 border-emerald-200 dark:border-emerald-800"
                    }`}
                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                    onMouseEnter={
                      !isTouchDevice
                        ? () => setShowYearDropdown(true)
                        : undefined
                    }
                    onMouseLeave={
                      !isTouchDevice
                        ? () => setShowYearDropdown(false)
                        : undefined
                    }
                    aria-expanded={showYearDropdown}
                    aria-haspopup="true"
                    aria-label="Select year"
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center justify-between">
                      <span>{formData.year}</span>
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
                  {showYearDropdown && (
                    <motion.div
                      ref={yearDropdownRef}
                      className="absolute top-full left-0 w-full rounded-xl shadow-2xl border z-50 bg-white/90 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 backdrop-blur-xl origin-top"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownMenuVariants}
                      onMouseEnter={
                        !isTouchDevice
                          ? () => setShowYearDropdown(true)
                          : undefined
                      }
                      onMouseLeave={
                        !isTouchDevice
                          ? () => setShowYearDropdown(false)
                          : undefined
                      }
                    >
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {yearOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                year: option.value.toString(),
                              }));
                              setShowYearDropdown(false);
                            }}
                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800 dark:hover:text-emerald-100 ${
                              formData.year === option.value.toString()
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
                              {formData.year === option.value.toString() && (
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
          </div>
          {/* Action Buttons - Inside the form container */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              className="sm:flex-[3] md:flex-[2] bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Budget...
                </>
              ) : (
                <>
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
                  Create Budget
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                size="lg"
                className="sm:flex-[2] md:flex-1 border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-500 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Helper Text - Outside the form container */}
      <div className="mt-3 sm:mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-2.5">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/40 rounded-md flex items-center justify-center mt-0.5">
            <svg
              className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400"
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
          </div>
          <div>
            <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Budget Tips
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-0.5">
              <li>• Set realistic amounts based on your spending history</li>
              <li>• You can update budgets anytime during the month</li>
              <li>• Track your progress with real-time spending alerts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
