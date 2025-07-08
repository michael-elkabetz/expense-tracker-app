import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExpenseEntryForm } from '@/components/ExpenseEntryForm';
import { ExpenseList } from '@/components/ExpenseList';
import { useExpenseStore, useExpenseData } from '@/stores/expense-store';
import { CreateExpenseInput } from '@/types/expense';
import { formatCurrency, getCurrentMonthExpenses, getCurrentWeekExpenses } from '@/lib/expense-utils';
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

export const Dashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const { expenses, totalExpenses, isLoading } = useExpenseData();
  const { addExpense } = useExpenseStore();

  const handleAddExpense = (expenseData: CreateExpenseInput) => {
    addExpense(expenseData);
    setShowAddForm(false);
  };

  // Calculate statistics
  const currentMonthExpenses = getCurrentMonthExpenses(expenses);
  const currentWeekExpenses = getCurrentWeekExpenses(expenses);
  const monthlyTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const weeklyTotal = currentWeekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageDaily = weeklyTotal / 7;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Expense Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your expenses efficiently
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} total expense{expenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthExpenses.length} expense{currentMonthExpenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(weeklyTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {currentWeekExpenses.length} expense{currentWeekExpenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDaily)}</div>
            <p className="text-xs text-muted-foreground">
              Based on this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="mb-8">
          <ExpenseEntryForm
            onSubmit={handleAddExpense}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            Your latest expense entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseList limit={10} />
        </CardContent>
      </Card>
    </div>
  );
};