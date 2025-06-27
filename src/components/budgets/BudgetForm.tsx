/**
 * Budget Form Component
 * 
 * A form component for creating and editing budget limits for expense categories.
 * Includes fields for category selection, budget amount, month, and year.
 * Features client-side validation using Zod schemas and integration with
 * the budget store for budget management functionality.
 */

'use client';

import React, { useState } from 'react';
import { useBudgetStore, useAuthStore } from '@/lib/zustand';
import { ExpenseCategory } from '@/lib/types';
import { budgetFormSchema, type BudgetFormData } from '@/lib/utils/validation';
import { getExpenseCategories, getMonthOptions, getYearOptions, getCurrentMonth, getCurrentYear } from '@/lib/utils/helpers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface BudgetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ onSuccess, onCancel }) => {
  const { setBudget } = useBudgetStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: getCurrentMonth().toString(),
    year: getCurrentYear().toString()
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      budgetFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {};
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
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
      
      setBudget({
        category: validatedData.category,
        amount: validatedData.amount,
        month: validatedData.month,
        year: validatedData.year
      }, user?.id);

      // Reset form to current month/year but keep other fields for easy re-entry
      setFormData({
        category: '',
        amount: '',
        month: getCurrentMonth().toString(),
        year: getCurrentYear().toString()
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error setting budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = getExpenseCategories();
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions(2020, 2030);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            name="category"
            label="Category"
            placeholder="Select category"
            value={formData.category}
            onChange={handleInputChange}
            options={categoryOptions}
            error={errors.category}
            disabled={isSubmitting}
          />

          <Input
            type="number"
            name="amount"
            label="Budget Amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleInputChange}
            error={errors.amount}
            disabled={isSubmitting}
            step="0.01"
            min="0"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              name="month"
              label="Month"
              value={formData.month}
              onChange={handleInputChange}
              options={monthOptions}
              error={errors.month}
              disabled={isSubmitting}
            />

            <Select
              name="year"
              label="Year"
              value={formData.year}
              onChange={handleInputChange}
              options={yearOptions}
              error={errors.year}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Setting Budget...' : 'Set Budget'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
