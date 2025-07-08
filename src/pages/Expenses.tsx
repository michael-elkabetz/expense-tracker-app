import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExpenseEntryForm } from '@/components/ExpenseEntryForm';
import { ExpenseList } from '@/components/ExpenseList';
import { useExpenseStore } from '@/stores/expense-store';
import { CreateExpenseInput, Expense } from '@/types/expense';
import { Plus, FileText } from 'lucide-react';

export const Expenses = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { addExpense, updateExpense } = useExpenseStore();

  const handleAddExpense = (expenseData: CreateExpenseInput) => {
    addExpense(expenseData);
    setShowAddForm(false);
  };

  const handleUpdateExpense = (expenseData: CreateExpenseInput) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
      setEditingExpense(null);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">All Expenses</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            View, manage, and organize all your expenses
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Add/Edit Expense Form */}
      {(showAddForm || editingExpense) && (
        <div className="mb-8">
          <ExpenseEntryForm
            onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
            onCancel={editingExpense ? handleCancelEdit : () => setShowAddForm(false)}
            defaultValues={editingExpense ? {
              amount: editingExpense.amount,
              category: editingExpense.category,
              description: editingExpense.description,
              date: editingExpense.date,
              receiptImage: editingExpense.receiptImage
            } : undefined}
          />
        </div>
      )}

      {/* Expense List */}
      <ExpenseList 
        onEditExpense={handleEditExpense}
        showActions={true}
      />
    </div>
  );
};