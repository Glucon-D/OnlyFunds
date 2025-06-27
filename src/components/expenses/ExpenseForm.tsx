/**
 * Expense Form Component
 * 
 * A form component for adding new income and expense transactions.
 * Includes fields for amount, date, description, category, and transaction type.
 * Features dynamic category options based on transaction type, client-side
 * validation using Zod schemas, and integration with the expense store.
 */

'use client';

import React, { useState } from 'react';
import { useExpenseStore, useAuthStore } from '@/lib/zustand';
import { TransactionType, ExpenseCategory, IncomeCategory } from '@/lib/types';
import { transactionFormSchema } from '@/lib/utils/validation';
import { getExpenseCategories, getIncomeCategories, formatDateInput } from '@/lib/utils/helpers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ExpenseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, onCancel }) => {
  const { addTransaction } = useExpenseStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    category: '',
    date: formatDateInput(new Date())
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

    // Reset category when transaction type changes
    if (name === 'type' && formData.category) {
      setFormData(prev => ({ ...prev, category: '' }));
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

      if (error && typeof error === 'object' && 'errors' in error) {
        (error as { errors: Array<{ path?: string[]; message: string }> }).errors.forEach((err) => {
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
      const validatedData = transactionFormSchema.parse(formData);
      
      addTransaction({
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category as ExpenseCategory | IncomeCategory,
        date: validatedData.date
      }, user?.id);

      // Reset form
      setFormData({
        type: '',
        amount: '',
        description: '',
        category: '',
        date: formatDateInput(new Date())
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const transactionTypeOptions = [
    { value: TransactionType.EXPENSE, label: 'Expense' },
    { value: TransactionType.INCOME, label: 'Income' }
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            name="type"
            label="Transaction Type"
            placeholder="Select transaction type"
            value={formData.type}
            onChange={handleInputChange}
            options={transactionTypeOptions}
            error={errors.type}
            disabled={isSubmitting}
          />

          <Input
            type="number"
            name="amount"
            label="Amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleInputChange}
            error={errors.amount}
            disabled={isSubmitting}
            step="0.01"
            min="0"
          />

          <Input
            type="text"
            name="description"
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
            disabled={isSubmitting}
          />

          {formData.type && (
            <Select
              name="category"
              label="Category"
              placeholder="Select category"
              value={formData.category}
              onChange={handleInputChange}
              options={getCategoryOptions()}
              error={errors.category}
              disabled={isSubmitting}
            />
          )}

          <Input
            type="date"
            name="date"
            label="Date"
            value={formData.date}
            onChange={handleInputChange}
            error={errors.date}
            disabled={isSubmitting}
          />

          <div className="flex space-x-3">
            <Button
              type="submit"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
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
