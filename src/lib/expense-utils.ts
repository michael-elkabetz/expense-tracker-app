import { format, isToday, isYesterday, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Expense, ExpenseFilter, ExpenseCategory } from '@/types/expense';

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format amount as currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date for display
export const formatDate = (date: Date): string => {
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

// Format date for input fields
export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Filter expenses based on criteria
export const filterExpenses = (expenses: Expense[], filter: ExpenseFilter): Expense[] => {
  return expenses.filter(expense => {
    // Category filter
    if (filter.categories && filter.categories.length > 0) {
      if (!filter.categories.includes(expense.category)) {
        return false;
      }
    }

    // Date range filter
    if (filter.dateFrom) {
      if (expense.date < filter.dateFrom) {
        return false;
      }
    }

    if (filter.dateTo) {
      if (expense.date > filter.dateTo) {
        return false;
      }
    }

    // Amount range filter
    if (filter.amountMin !== undefined) {
      if (expense.amount < filter.amountMin) {
        return false;
      }
    }

    if (filter.amountMax !== undefined) {
      if (expense.amount > filter.amountMax) {
        return false;
      }
    }

    // Search term filter
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      const matchesDescription = expense.description.toLowerCase().includes(searchTerm);
      const matchesCategory = expense.category.toLowerCase().includes(searchTerm);
      const matchesAmount = expense.amount.toString().includes(searchTerm);
      
      if (!matchesDescription && !matchesCategory && !matchesAmount) {
        return false;
      }
    }

    return true;
  });
};

// Sort expenses by date (newest first)
export const sortExpensesByDate = (expenses: Expense[]): Expense[] => {
  return [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Group expenses by date
export const groupExpensesByDate = (expenses: Expense[]): Record<string, Expense[]> => {
  const groups: Record<string, Expense[]> = {};
  
  expenses.forEach(expense => {
    const dateKey = format(expense.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(expense);
  });

  return groups;
};

// Calculate total amount for expenses
export const calculateTotal = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// Calculate spending by category
export const calculateSpendingByCategory = (expenses: Expense[]): Record<ExpenseCategory, number> => {
  const spending: Record<ExpenseCategory, number> = {
    food: 0,
    transportation: 0,
    utilities: 0,
    entertainment: 0,
    shopping: 0,
    healthcare: 0,
    education: 0,
    housing: 0,
    travel: 0,
    other: 0
  };

  expenses.forEach(expense => {
    spending[expense.category] += expense.amount;
  });

  return spending;
};

// Get expenses for current month
export const getCurrentMonthExpenses = (expenses: Expense[]): Expense[] => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  return expenses.filter(expense => 
    expense.date >= monthStart && expense.date <= monthEnd
  );
};

// Get expenses for current week
export const getCurrentWeekExpenses = (expenses: Expense[]): Expense[] => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  return expenses.filter(expense => 
    expense.date >= weekStart && expense.date <= weekEnd
  );
};

// Get expenses for date range
export const getExpensesInRange = (expenses: Expense[], startDate: Date, endDate: Date): Expense[] => {
  return expenses.filter(expense => 
    expense.date >= startDate && expense.date <= endDate
  );
};

// Calculate daily average spending
export const calculateDailyAverage = (expenses: Expense[], days: number): number => {
  const total = calculateTotal(expenses);
  return days > 0 ? total / days : 0;
};

// Get top spending categories
export const getTopSpendingCategories = (expenses: Expense[], limit: number = 5): Array<{
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}> => {
  const categorySpending = calculateSpendingByCategory(expenses);
  const total = calculateTotal(expenses);

  const categories = Object.entries(categorySpending)
    .map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);

  return categories;
};

// Validate expense data
export const validateExpenseData = (data: any): boolean => {
  return (
    data &&
    typeof data.amount === 'number' &&
    data.amount > 0 &&
    typeof data.description === 'string' &&
    data.description.trim().length > 0 &&
    typeof data.category === 'string' &&
    data.date instanceof Date &&
    !isNaN(data.date.getTime())
  );
};