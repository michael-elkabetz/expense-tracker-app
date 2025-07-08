import { Expense, Budget } from '@/types/expense';

// Storage keys
const STORAGE_KEYS = {
  EXPENSES: 'expenses',
  BUDGETS: 'budgets',
  LAST_SYNC: 'lastSync'
} as const;

// Generic storage utilities
export const storage = {
  // Get item from localStorage with type safety
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key: ${key}`, error);
      return defaultValue;
    }
  },

  // Set item in localStorage with type safety
  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key: ${key}`, error);
    }
  },

  // Remove item from localStorage
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage for key: ${key}`, error);
    }
  },

  // Clear all data
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }
};

// Expense storage utilities
export const expenseStorage = {
  // Get all expenses
  getExpenses: (): Expense[] => {
    const expenses = storage.getItem(STORAGE_KEYS.EXPENSES, []);
    // Convert date strings back to Date objects
    return expenses.map((expense: any) => ({
      ...expense,
      date: new Date(expense.date),
      createdAt: new Date(expense.createdAt),
      updatedAt: new Date(expense.updatedAt)
    }));
  },

  // Save expenses
  saveExpenses: (expenses: Expense[]): void => {
    storage.setItem(STORAGE_KEYS.EXPENSES, expenses);
  },

  // Add single expense
  addExpense: (expense: Expense): void => {
    const expenses = expenseStorage.getExpenses();
    expenses.push(expense);
    expenseStorage.saveExpenses(expenses);
  },

  // Update expense
  updateExpense: (id: string, updates: Partial<Expense>): void => {
    const expenses = expenseStorage.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updates, updatedAt: new Date() };
      expenseStorage.saveExpenses(expenses);
    }
  },

  // Delete expense
  deleteExpense: (id: string): void => {
    const expenses = expenseStorage.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    expenseStorage.saveExpenses(filtered);
  },

  // Get expense by ID
  getExpenseById: (id: string): Expense | null => {
    const expenses = expenseStorage.getExpenses();
    return expenses.find(e => e.id === id) || null;
  }
};

// Budget storage utilities
export const budgetStorage = {
  // Get all budgets
  getBudgets: (): Budget[] => {
    const budgets = storage.getItem(STORAGE_KEYS.BUDGETS, []);
    // Convert date strings back to Date objects
    return budgets.map((budget: any) => ({
      ...budget,
      createdAt: new Date(budget.createdAt),
      updatedAt: new Date(budget.updatedAt)
    }));
  },

  // Save budgets
  saveBudgets: (budgets: Budget[]): void => {
    storage.setItem(STORAGE_KEYS.BUDGETS, budgets);
  },

  // Add single budget
  addBudget: (budget: Budget): void => {
    const budgets = budgetStorage.getBudgets();
    budgets.push(budget);
    budgetStorage.saveBudgets(budgets);
  },

  // Update budget
  updateBudget: (id: string, updates: Partial<Budget>): void => {
    const budgets = budgetStorage.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates, updatedAt: new Date() };
      budgetStorage.saveBudgets(budgets);
    }
  },

  // Delete budget
  deleteBudget: (id: string): void => {
    const budgets = budgetStorage.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    budgetStorage.saveBudgets(filtered);
  },

  // Get budget by category
  getBudgetByCategory: (category: string): Budget | null => {
    const budgets = budgetStorage.getBudgets();
    return budgets.find(b => b.category === category) || null;
  }
};

// Sync utilities
export const syncStorage = {
  // Get last sync timestamp
  getLastSync: (): Date | null => {
    const timestamp = storage.getItem(STORAGE_KEYS.LAST_SYNC, null);
    return timestamp ? new Date(timestamp) : null;
  },

  // Set last sync timestamp
  setLastSync: (date: Date = new Date()): void => {
    storage.setItem(STORAGE_KEYS.LAST_SYNC, date.toISOString());
  },

  // Check if data needs sync (older than 5 minutes)
  needsSync: (): boolean => {
    const lastSync = syncStorage.getLastSync();
    if (!lastSync) return true;
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSync < fiveMinutesAgo;
  }
};