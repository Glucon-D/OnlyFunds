/**
 * Budget Form Component
 *
 * A form component for creating and editing budget limits for expense categories.
 * Includes fields for category selection, budget amount, month, and year.
 * Features client-side validation using Zod schemas and integration with
 * the budget store for budget management functionality.
 */

"use client";

import React, { useState, useEffect } from "react";
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
import { Select } from "@/components/ui/Select";

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

  // Handle ESC key press to close the form
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onCancel) {
        onCancel();
      }
    };

    // Add event listener when component mounts
    document.addEventListener("keydown", handleEscapeKey);

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onCancel]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
          {/* Category Selection with Enhanced Styling */}
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
            <Select
              name="category"
              placeholder="Choose a category to budget for"
              value={formData.category}
              onChange={handleInputChange}
              options={categoryOptions}
              error={errors.category}
              disabled={isSubmitting}
              className="transition-all duration-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
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
                  $
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
                Budget: ${parseFloat(formData.amount || "0").toLocaleString()}
              </p>
            )}
          </div>

          {/* Period Selection with Enhanced Layout */}
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
              <div className="space-y-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Month
                </label>
                <Select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  options={monthOptions}
                  error={errors.month}
                  disabled={isSubmitting}
                  className="transition-all duration-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Year
                </label>
                <Select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  options={yearOptions}
                  error={errors.year}
                  disabled={isSubmitting}
                  className="transition-all duration-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
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
  );
};
