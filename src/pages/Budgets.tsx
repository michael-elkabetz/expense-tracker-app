import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetCard } from '@/components/BudgetCard';
import { BudgetForm } from '@/components/BudgetForm';
import { useExpenseStore, useExpenseData } from '@/stores/expense-store';
import { CreateBudgetInput, Budget } from '@/types/expense';
import { formatCurrency } from '@/lib/expense-utils';
import { Plus, TrendingUp, Target, AlertTriangle } from 'lucide-react';

export const Budgets = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { budgets, budgetProgress, isLoading } = useExpenseData();
  const { addBudget, updateBudget, deleteBudget } = useExpenseStore();

  const handleAddBudget = (budgetData: CreateBudgetInput) => {
    addBudget(budgetData);
    setShowAddForm(false);
  };

  const handleUpdateBudget = (budgetData: CreateBudgetInput) => {
    if (editingBudget) {
      updateBudget(editingBudget.id, budgetData);
      setEditingBudget(null);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setShowAddForm(false);
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
  };

  // Calculate overall budget statistics
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = Object.values(budgetProgress).reduce((sum, progress) => sum + progress.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overBudgetCount = Object.values(budgetProgress).filter(progress => progress.percentage > 100).length;
  const nearLimitCount = Object.values(budgetProgress).filter(progress => progress.percentage > 80 && progress.percentage <= 100).length;

  // Get existing categories for the form
  const existingCategories = budgets.map(budget => budget.category);

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
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Budget Management</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Set spending limits and track your progress
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Budget
        </Button>
      </div>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
              <p className="text-xs text-muted-foreground">
                Across {budgets.length} categor{budgets.length !== 1 ? 'ies' : 'y'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-muted-foreground">
                {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : '0%'} of total budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totalRemaining < 0 ? '-' : ''}{formatCurrency(Math.abs(totalRemaining))}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalRemaining < 0 ? 'Over budget' : 'Available to spend'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="font-medium text-red-600">{overBudgetCount}</span> over budget
                </div>
                <div className="text-sm">
                  <span className="font-medium text-yellow-600">{nearLimitCount}</span> near limit
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Budget Form */}
      {(showAddForm || editingBudget) && (
        <div className="mb-8">
          <BudgetForm
            onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget}
            onCancel={editingBudget ? handleCancelEdit : () => setShowAddForm(false)}
            defaultValues={editingBudget ? {
              category: editingBudget.category,
              amount: editingBudget.amount,
              period: editingBudget.period
            } : undefined}
            existingCategories={existingCategories}
          />
        </div>
      )}

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">No budgets created yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by creating your first budget to track spending limits
            </p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const progress = budgetProgress[budget.category] || {
              spent: 0,
              remaining: budget.amount,
              percentage: 0
            };
            
            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                spent={progress.spent}
                remaining={progress.remaining}
                percentage={progress.percentage}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};