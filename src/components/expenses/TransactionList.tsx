/**
 * Transaction List Component
 * A component that displays a list of all user transactions with filtering and sorting options.
 * Includes filters for transaction type (income/expense) and sorting by date or amount.
 * Features responsive design, empty states, and transaction deletion functionality.
 * Integrates with the expense store for data management.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useExpenseStore, useAuthStore } from "@/lib/zustand";
import { TransactionType, Transaction } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  getCategoryDisplayName,
  sortByDate,
  sortByAmount,
} from "@/lib/utils/helpers";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export const TransactionList: React.FC = () => {
  const { transactions, fetchTransactions, deleteTransaction } =
    useExpenseStore();
  const { user } = useAuthStore();
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id);
    }
  }, [fetchTransactions, user?.id]);

  useEffect(() => {
    let filtered = [...transactions];

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case "date-desc":
        filtered = sortByDate(filtered, false);
        break;
      case "date-asc":
        filtered = sortByDate(filtered, true);
        break;
      case "amount-desc":
        filtered = sortByAmount(filtered, false);
        break;
      case "amount-asc":
        filtered = sortByAmount(filtered, true);
        break;
    }

    setFilteredTransactions(filtered);
  }, [transactions, typeFilter, sortBy]);

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
    }
  };

  const typeFilterOptions = [
    { value: "all", label: "All Transactions" },
    { value: TransactionType.INCOME, label: "Income" },
    { value: TransactionType.EXPENSE, label: "Expense" },
  ];

  const sortOptions = [
    { value: "date-desc", label: "Date (Newest First)" },
    { value: "date-asc", label: "Date (Oldest First)" },
    { value: "amount-desc", label: "Amount (Highest First)" },
    { value: "amount-asc", label: "Amount (Lowest First)" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>

        {/* Filters and sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={typeFilterOptions}
            placeholder="Filter by type"
            className="flex-1"
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            options={sortOptions}
            placeholder="Sort by"
            className="flex-1"
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              {transactions.length === 0
                ? "No transactions yet"
                : "No transactions match your filters"}
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              {transactions.length === 0
                ? "Add your first transaction to get started"
                : "Try adjusting your filters"}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {transaction.description}
                    </h4>
                    <span
                      className={`font-semibold ${
                        transaction.type === TransactionType.INCOME
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === TransactionType.INCOME ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="capitalize">
                        {getCategoryDisplayName(transaction.category)}
                      </span>
                      <span className="text-xs">
                        {formatDate(transaction.date)}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
