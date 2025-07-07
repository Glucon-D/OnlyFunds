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
import {
  getExpenseCategories,
  getMonthOptions,
  getYearOptions,
  getCurrentMonth,
  getCurrentYear,
} from "@/lib/utils/helpers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";

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
    amount: "",
    month: (defaultMonth || getCurrentMonth()).toString(),
    year: (defaultYear || getCurrentYear()).toString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

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

  // Handle ESC key press to close the form
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCancel) {
        onCancel();
      }
    };

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      setBudget(
        {
          category: validatedData.category,
          amount: validatedData.amount,
          month: validatedData.month,
          year: validatedData.year,
        },
        user?.id
      );

      // Reset form to default month/year but keep other fields for easy re-entry
      setFormData({
        category: "",
        amount: "",
        month: (defaultMonth || getCurrentMonth()).toString(),
        year: (defaultYear || getCurrentYear()).toString(),
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error setting budget:", error);
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

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Close Button in Top Right Corner */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-slate-200 dark:border-slate-600"
          aria-label="Close form"
        >
          <svg
            className="w-4 h-4 text-slate-600 dark:text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Enhanced Header */}
      <div className="text-center mb-8 p-6 pb-0">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg mb-4">
          <svg
            className="w-8 h-8 text-white"
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Create Budget
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Set a spending limit for a specific category and period
        </p>
      </div>

      {/* Enhanced Form */}
      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection with Custom Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Category
            </label>
            
            <div className="relative">
              <motion.button
                ref={categoryTriggerRef}
                type="button"
                className={`w-full px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 bg-white/80 dark:bg-slate-800/80 text-left ${
                  formData.category 
                    ? "text-slate-800 dark:text-slate-100" 
                    : "text-slate-500 dark:text-slate-400"
                } ${showCategoryDropdown ? '' : 'border-2 border-emerald-200 dark:border-emerald-800'} ${errors.category ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                aria-expanded={showCategoryDropdown}
                aria-haspopup="true"
                aria-label="Select category"
                disabled={isSubmitting}
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    {formData.category || "Choose a category to budget for"}
                  </div>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                      showCategoryDropdown ? "rotate-180" : ""
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
              {showCategoryDropdown && (
                <motion.div
                  ref={categoryDropdownRef}
                  className="absolute top-full left-0 mt-2 w-full rounded-xl shadow-2xl border z-50 bg-white/90 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 backdrop-blur-xl origin-top"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownMenuVariants}
                >
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {categoryOptions.map((option, index) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: option.value }));
                          setShowCategoryDropdown(false);
                          if (errors.category) {
                            setErrors(prev => ({ ...prev, category: "" }));
                          }
                        }}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-800 dark:hover:text-emerald-100 ${
                          formData.category === option.value
                            ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100"
                            : ""
                        }`}
                        variants={dropdownItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        custom={index}
                        tabIndex={showCategoryDropdown ? 0 : -1}
                      >
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {option.label}
                          </p>
                          {formData.category === option.value && (
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
            {errors.category && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Amount Input with Enhanced Styling */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              Budget Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                  ₹
                </span>
              </div>
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
                className="pl-8 text-lg font-medium transition-all duration-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {formData.amount && !errors.amount && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center">
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
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
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
              Budget Period
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Month Dropdown */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Month
                </label>
                <div className="relative">
                  <motion.button
                    ref={monthTriggerRef}
                    type="button"
                    className={`w-full px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-left ${showMonthDropdown ? '' : 'border-2 border-emerald-200 dark:border-emerald-800'}`}
                    onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                    aria-expanded={showMonthDropdown}
                    aria-haspopup="true"
                    aria-label="Select month"
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center justify-between">
                      <span>{monthOptions.find(opt => opt.value.toString() === formData.month)?.label || "Month"}</span>
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
                      className="absolute top-full left-0 mt-2 w-full rounded-xl shadow-2xl border z-50 bg-white/90 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 backdrop-blur-xl origin-top"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownMenuVariants}
                    >
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {monthOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, month: option.value.toString() }));
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
                <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Year
                </label>
                <div className="relative">
                  <motion.button
                    ref={yearTriggerRef}
                    type="button"
                    className={`w-full px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-left ${showYearDropdown ? '' : 'border-2 border-emerald-200 dark:border-emerald-800'}`}
                    onClick={() => setShowYearDropdown(!showYearDropdown)}
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
                      className="absolute top-full left-0 mt-2 w-full rounded-xl shadow-2xl border z-50 bg-white/90 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800 backdrop-blur-xl origin-top"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownMenuVariants}
                    >
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {yearOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, year: option.value.toString() }));
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

          {/* Enhanced Action Buttons */}
          <div className="flex justify-around flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="submit"
              className=" bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
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
                className=" border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Helper Text */}
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0"
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
            <div>
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                Budget Tips
              </h4>
              <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
                <li>• Set realistic amounts based on your spending history</li>
                <li>• You can update budgets anytime during the month</li>
                <li>• Track your progress with real-time spending alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
