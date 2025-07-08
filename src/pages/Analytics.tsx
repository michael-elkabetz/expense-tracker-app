import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { useExpenseData } from '@/stores/expense-store';
import { formatCurrency, getCurrentMonthExpenses, getCurrentWeekExpenses, getTopSpendingCategories } from '@/lib/expense-utils';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, subWeeks } from 'date-fns';
import { PieChart, BarChart3, TrendingUp, Calendar, DollarSign, Target, ArrowUp, ArrowDown } from 'lucide-react';

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const { expenses, totalExpenses, budgetProgress, isLoading } = useExpenseData();

  // Filter expenses based on time range
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    
    switch (timeRange) {
      case 'week':
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        return expenses.filter(expense => expense.date >= weekStart && expense.date <= weekEnd);
      
      case 'month':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        return expenses.filter(expense => expense.date >= monthStart && expense.date <= monthEnd);
      
      default:
        return expenses;
    }
  }, [expenses, timeRange]);

  // Calculate analytics data
  const analytics = useMemo(() => {
    const currentTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const currentCount = filteredExpenses.length;
    
    // Calculate previous period for comparison
    const now = new Date();
    let previousExpenses = [];
    
    if (timeRange === 'week') {
      const prevWeekStart = startOfWeek(subWeeks(now, 1));
      const prevWeekEnd = endOfWeek(subWeeks(now, 1));
      previousExpenses = expenses.filter(expense => expense.date >= prevWeekStart && expense.date <= prevWeekEnd);
    } else if (timeRange === 'month') {
      const prevMonthStart = startOfMonth(subMonths(now, 1));
      const prevMonthEnd = endOfMonth(subMonths(now, 1));
      previousExpenses = expenses.filter(expense => expense.date >= prevMonthStart && expense.date <= prevMonthEnd);
    }
    
    const previousTotal = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const change = currentTotal - previousTotal;
    const changePercent = previousTotal > 0 ? (change / previousTotal) * 100 : 0;
    
    const topCategories = getTopSpendingCategories(filteredExpenses, 5);
    const averageExpense = currentCount > 0 ? currentTotal / currentCount : 0;
    
    return {
      currentTotal,
      currentCount,
      previousTotal,
      change,
      changePercent,
      topCategories,
      averageExpense
    };
  }, [filteredExpenses, expenses, timeRange]);

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
            <PieChart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Analyze your spending patterns and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'all') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={(value: 'pie' | 'bar' | 'line') => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.currentTotal)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {analytics.change !== 0 && (
                <>
                  {analytics.change > 0 ? (
                    <ArrowUp className="w-3 h-3 text-red-500" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-green-500" />
                  )}
                  <span className={analytics.change > 0 ? 'text-red-500' : 'text-green-500'}>
                    {Math.abs(analytics.changePercent).toFixed(1)}%
                  </span>
                </>
              )}
              <span>vs last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.currentCount}</div>
            <p className="text-xs text-muted-foreground">
              expense{analytics.currentCount !== 1 ? 's' : ''} this {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.averageExpense)}</div>
            <p className="text-xs text-muted-foreground">
              per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(budgetProgress).length}
            </div>
            <p className="text-xs text-muted-foreground">
              active budgets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AnalyticsChart
          expenses={filteredExpenses}
          type={chartType}
          title={`Spending by Category (${timeRange === 'all' ? 'All Time' : timeRange === 'week' ? 'This Week' : 'This Month'})`}
          description="Breakdown of your expenses by category"
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>
              Your highest expense categories this {timeRange}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topCategories.length > 0 ? (
              <div className="space-y-4">
                {analytics.topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(category.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No expense data for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      {Object.keys(budgetProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
            <CardDescription>
              How you're tracking against your budget limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(budgetProgress).map(([category, progress]) => (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category}</h4>
                    <Badge variant={progress.percentage > 100 ? 'destructive' : progress.percentage > 80 ? 'secondary' : 'default'}>
                      {Math.round(progress.percentage)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent:</span>
                      <span>{formatCurrency(progress.spent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Budget:</span>
                      <span>{formatCurrency(progress.budget.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining:</span>
                      <span className={progress.remaining < 0 ? 'text-red-500' : 'text-green-500'}>
                        {progress.remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(progress.remaining))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};