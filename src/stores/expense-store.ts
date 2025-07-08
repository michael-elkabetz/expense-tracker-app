import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Expense, Budget, CreateExpenseInput, CreateBudgetInput, ExpenseFilter } from '@/types/expense';
import { expenseStorage, budgetStorage } from '@/lib/storage';
import { generateId, filterExpenses, sortExpensesByDate } from '@/lib/expense-utils';

interface ExpenseState {
  // Data
  expenses: Expense[];
  budgets: Budget[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  filter: ExpenseFilter;
  
  // Actions
  addExpense: (input: CreateExpenseInput) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  addBudget: (input: CreateBudgetInput) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  setFilter: (filter: ExpenseFilter) => void;
  clearFilter: () => void;
  
  // Computed getters
  getFilteredExpenses: () => Expense[];
  getTotalExpenses: () => number;
  getExpensesByCategory: () => Record<string, Expense[]>;
  getBudgetProgress: () => Record<string, { budget: Budget; spent: number; remaining: number; percentage: number }>;
  
  // Utilities
  loadData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      // Initial state
      expenses: [],
      budgets: [],
      isLoading: false,
      error: null,
      filter: {},

      // Expense actions
      addExpense: (input: CreateExpenseInput) => {
        try {
          const now = new Date();
          const expense: Expense = {
            id: generateId(),
            ...input,
            createdAt: now,
            updatedAt: now
          };

          set((state) => ({
            expenses: [...state.expenses, expense],
            error: null
          }));

          // Update budget spending
          const budgets = get().budgets;
          const budget = budgets.find(b => b.category === expense.category);
          if (budget) {
            get().updateBudget(budget.id, {
              spent: budget.spent + expense.amount
            });
          }

          // Persist to localStorage
          expenseStorage.addExpense(expense);
        } catch (error) {
          set({ error: 'Failed to add expense' });
        }
      },

      updateExpense: (id: string, updates: Partial<Expense>) => {
        try {
          set((state) => ({
            expenses: state.expenses.map(expense =>
              expense.id === id
                ? { ...expense, ...updates, updatedAt: new Date() }
                : expense
            ),
            error: null
          }));

          // Persist to localStorage
          expenseStorage.updateExpense(id, updates);
        } catch (error) {
          set({ error: 'Failed to update expense' });
        }
      },

      deleteExpense: (id: string) => {
        try {
          const expense = get().expenses.find(e => e.id === id);
          if (expense) {
            set((state) => ({
              expenses: state.expenses.filter(e => e.id !== id),
              error: null
            }));

            // Update budget spending
            const budgets = get().budgets;
            const budget = budgets.find(b => b.category === expense.category);
            if (budget) {
              get().updateBudget(budget.id, {
                spent: Math.max(0, budget.spent - expense.amount)
              });
            }

            // Persist to localStorage
            expenseStorage.deleteExpense(id);
          }
        } catch (error) {
          set({ error: 'Failed to delete expense' });
        }
      },

      // Budget actions
      addBudget: (input: CreateBudgetInput) => {
        try {
          const now = new Date();
          const budget: Budget = {
            id: generateId(),
            ...input,
            spent: 0,
            createdAt: now,
            updatedAt: now
          };

          set((state) => ({
            budgets: [...state.budgets, budget],
            error: null
          }));

          // Persist to localStorage
          budgetStorage.addBudget(budget);
        } catch (error) {
          set({ error: 'Failed to add budget' });
        }
      },

      updateBudget: (id: string, updates: Partial<Budget>) => {
        try {
          set((state) => ({
            budgets: state.budgets.map(budget =>
              budget.id === id
                ? { ...budget, ...updates, updatedAt: new Date() }
                : budget
            ),
            error: null
          }));

          // Persist to localStorage
          budgetStorage.updateBudget(id, updates);
        } catch (error) {
          set({ error: 'Failed to update budget' });
        }
      },

      deleteBudget: (id: string) => {
        try {
          set((state) => ({
            budgets: state.budgets.filter(b => b.id !== id),
            error: null
          }));

          // Persist to localStorage
          budgetStorage.deleteBudget(id);
        } catch (error) {
          set({ error: 'Failed to delete budget' });
        }
      },

      // Filter actions
      setFilter: (filter: ExpenseFilter) => {
        set({ filter });
      },

      clearFilter: () => {
        set({ filter: {} });
      },

      // Computed getters
      getFilteredExpenses: () => {
        const { expenses, filter } = get();
        const filtered = filterExpenses(expenses, filter);
        return sortExpensesByDate(filtered);
      },

      getTotalExpenses: () => {
        const expenses = get().getFilteredExpenses();
        return expenses.reduce((total, expense) => total + expense.amount, 0);
      },

      getExpensesByCategory: () => {
        const expenses = get().getFilteredExpenses();
        const groups: Record<string, Expense[]> = {};
        
        expenses.forEach(expense => {
          if (!groups[expense.category]) {
            groups[expense.category] = [];
          }
          groups[expense.category].push(expense);
        });

        return groups;
      },

      getBudgetProgress: () => {
        const { budgets, expenses } = get();
        const progress: Record<string, { budget: Budget; spent: number; remaining: number; percentage: number }> = {};

        budgets.forEach(budget => {
          const categoryExpenses = expenses.filter(e => e.category === budget.category);
          const spent = categoryExpenses.reduce((total, expense) => total + expense.amount, 0);
          const remaining = Math.max(0, budget.amount - spent);
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

          progress[budget.category] = {
            budget,
            spent,
            remaining,
            percentage
          };
        });

        return progress;
      },

      // Utilities
      loadData: () => {
        try {
          set({ isLoading: true });
          
          const expenses = expenseStorage.getExpenses();
          const budgets = budgetStorage.getBudgets();
          
          set({
            expenses,
            budgets,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to load data'
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'expense-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        expenses: state.expenses,
        budgets: state.budgets
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects after rehydration
          state.expenses = state.expenses.map(expense => ({
            ...expense,
            date: new Date(expense.date),
            createdAt: new Date(expense.createdAt),
            updatedAt: new Date(expense.updatedAt)
          }));
          
          state.budgets = state.budgets.map(budget => ({
            ...budget,
            createdAt: new Date(budget.createdAt),
            updatedAt: new Date(budget.updatedAt)
          }));
        }
      }
    }
  )
);

// Hook for easy access to computed values
export const useExpenseData = () => {
  const store = useExpenseStore();
  
  return {
    expenses: store.getFilteredExpenses(),
    totalExpenses: store.getTotalExpenses(),
    expensesByCategory: store.getExpensesByCategory(),
    budgetProgress: store.getBudgetProgress(),
    isLoading: store.isLoading,
    error: store.error
  };
};