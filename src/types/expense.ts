import { z } from 'zod';

// Expense category schema
export const ExpenseCategorySchema = z.enum([
  'food',
  'transportation',
  'utilities',
  'entertainment',
  'shopping',
  'healthcare',
  'education',
  'housing',
  'travel',
  'other'
]);

// Expense schema
export const ExpenseSchema = z.object({
  id: z.string(),
  amount: z.number().positive('Amount must be positive'),
  category: ExpenseCategorySchema,
  description: z.string().min(1, 'Description is required'),
  date: z.date(),
  receiptImage: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Budget schema
export const BudgetSchema = z.object({
  id: z.string(),
  category: ExpenseCategorySchema,
  amount: z.number().positive('Budget amount must be positive'),
  period: z.enum(['monthly', 'weekly', 'yearly']),
  spent: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Filter schema
export const ExpenseFilterSchema = z.object({
  categories: z.array(ExpenseCategorySchema).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
  searchTerm: z.string().optional()
});

// Type exports
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type Budget = z.infer<typeof BudgetSchema>;
export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>;

// Create expense input schema (without generated fields)
export const CreateExpenseSchema = ExpenseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

// Create budget input schema (without generated fields)
export const CreateBudgetSchema = BudgetSchema.omit({
  id: true,
  spent: true,
  createdAt: true,
  updatedAt: true
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;

// Category display labels
export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  transportation: 'Transportation',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  healthcare: 'Healthcare',
  education: 'Education',
  housing: 'Housing',
  travel: 'Travel',
  other: 'Other'
};

// Category colors for UI
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: 'bg-orange-100 text-orange-800',
  transportation: 'bg-blue-100 text-blue-800',
  utilities: 'bg-green-100 text-green-800',
  entertainment: 'bg-purple-100 text-purple-800',
  shopping: 'bg-pink-100 text-pink-800',
  healthcare: 'bg-red-100 text-red-800',
  education: 'bg-indigo-100 text-indigo-800',
  housing: 'bg-yellow-100 text-yellow-800',
  travel: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-800'
};