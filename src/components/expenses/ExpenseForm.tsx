/**
 * Enhanced Professional Expense Form Component
 *
 * A beautifully designed form component for adding new income and expense transactions.
 * Features professional UI design, keyboard shortcuts, enhanced validation feedback,
 * dynamic category options, smooth animations, and seamless integration with the
 * website's theme system.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useExpenseStore, useAuthStore } from "@/lib/zustand";
import { TransactionType, ExpenseCategory, IncomeCategory } from "@/lib/types";
import { transactionFormSchema } from "@/lib/utils/validation";
import {
  getExpenseCategories,
  getIncomeCategories,
  formatDateInput,
} from "@/lib/utils/helpers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ExpenseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { addTransaction } = useExpenseStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    category: "",
    date: formatDateInput(new Date()),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC to close
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel?.();
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
  }, [onCancel]);

  const handleReset = useCallback(() => {
    setFormData({
      type: "",
      amount: "",
      description: "",
      category: "",
      date: formatDateInput(new Date()),
    });
    setErrors({});
    firstInputRef.current?.focus();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Reset category when transaction type changes
    if (name === "type" && formData.category) {
      setFormData((prev) => ({ ...prev, category: "" }));
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

  const validateForm = (): boolean => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first field with error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = formRef.current?.querySelector(
          `[name="${firstErrorField}"]`
        ) as HTMLElement;
        element?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedData = transactionFormSchema.parse(formData);

      addTransaction(
        {
          type: validatedData.type,
          amount: validatedData.amount,
          description: validatedData.description,
          category: validatedData.category as ExpenseCategory | IncomeCategory,
          date: validatedData.date,
        },
        user?.id
      );

      // Show success animation
      setShowSuccessAnimation(true);

      // Reset form after brief delay
      setTimeout(() => {
        setFormData({
          type: "",
          amount: "",
          description: "",
          category: "",
          date: formatDateInput(new Date()),
        });
        setShowSuccessAnimation(false);
        onSuccess?.();
      }, 1200);
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const transactionTypeOptions = [
    {
      value: TransactionType.EXPENSE,
      label: "💸 Expense",
    },
    {
      value: TransactionType.INCOME,
      label: "💰 Income",
    },
  ];

  if (showSuccessAnimation) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div
          className="rounded-2xl p-8 text-center shadow-xl border animate-fade-in"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"
            style={{ backgroundColor: "var(--success)" }}
          >
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Transaction Added!
          </h3>
          <p
            className="text-sm"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Your transaction has been successfully recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Enhanced Form */}
      <div
        className="rounded-2xl p-6 shadow-xl border backdrop-blur-sm"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {/* Transaction Type */}
          <div className="relative">
            <Select
              ref={firstInputRef}
              name="type"
              label="Transaction Type"
              placeholder="Choose transaction type"
              value={formData.type}
              onChange={handleInputChange}
              options={transactionTypeOptions}
              error={errors.type}
              disabled={isSubmitting}
              onFocus={() => setFocusedField("type")}
              onBlur={() => setFocusedField(null)}
              className={`transition-all duration-300 ${
                focusedField === "type"
                  ? "ring-2 ring-emerald-500 ring-opacity-50"
                  : ""
              }`}
            />
          </div>

          {/* Amount Input with Currency Symbol */}
          <div className="relative">
            <label
              htmlFor="amount"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Amount
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                style={{ color: "var(--foreground-secondary)" }}
              >
                <span className="text-lg font-medium">$</span>
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
                onFocus={() => setFocusedField("amount")}
                onBlur={() => setFocusedField(null)}
                className={`pl-8 text-lg font-medium transition-all duration-300 ${
                  focusedField === "amount"
                    ? "ring-2 ring-emerald-500 ring-opacity-50"
                    : ""
                }`}
              />
            </div>
          </div>

          {/* Description with Icon */}
          <div className="relative">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Description
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                style={{ color: "var(--foreground-secondary)" }}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <Input
                type="text"
                name="description"
                placeholder="Enter transaction description"
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                disabled={isSubmitting}
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                className={`pl-10 transition-all duration-300 ${
                  focusedField === "description"
                    ? "ring-2 ring-emerald-500 ring-opacity-50"
                    : ""
                }`}
              />
            </div>
          </div>

          {/* Category with Animation */}
          {formData.type && (
            <div className="animate-slide-in">
              <Select
                name="category"
                label="Category"
                placeholder="Select a category"
                value={formData.category}
                onChange={handleInputChange}
                options={getCategoryOptions()}
                error={errors.category}
                disabled={isSubmitting}
                onFocus={() => setFocusedField("category")}
                onBlur={() => setFocusedField(null)}
                className={`transition-all duration-300 ${
                  focusedField === "category"
                    ? "ring-2 ring-emerald-500 ring-opacity-50"
                    : ""
                }`}
              />
            </div>
          )}

          {/* Date with Icon */}
          <div className="relative">
            <label
              htmlFor="date"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Date
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                style={{ color: "var(--foreground-secondary)" }}
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                error={errors.date}
                disabled={isSubmitting}
                onFocus={() => setFocusedField("date")}
                onBlur={() => setFocusedField(null)}
                className={`pl-10 transition-all duration-300 ${
                  focusedField === "date"
                    ? "ring-2 ring-emerald-500 ring-opacity-50"
                    : ""
                }`}
              />
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center">
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
                  Add Transaction
                </div>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
