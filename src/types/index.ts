import { z } from 'zod';

export const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  amount: z.number().refine(val => !isNaN(val) && val > 0, 'Amount must be greater than zero'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be a valid YYYY-MM-DD date'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters'),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export interface Transaction extends TransactionInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit: z.number().refine(val => !isNaN(val) && val > 0, 'Limit must be greater than zero'),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

export interface Budget extends BudgetInput {
  id: string;
}

export const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Goal name is too long'),
  targetAmount: z.number().refine(val => !isNaN(val) && val > 0, 'Target amount must be greater than zero'),
  currentAmount: z.number().refine(val => !isNaN(val) && val >= 0, 'Current amount cannot be negative'),
  targetDate: z.string().min(1, 'Target date is required'),
});

export type GoalInput = z.infer<typeof goalSchema>;

export interface Goal extends GoalInput {
  id: string;
  createdAt: string;
}

export const billSchema = z.object({
  title: z.string().min(1, 'Bill title is required').max(100, 'Bill title is too long'),
  amount: z.number().refine(val => !isNaN(val) && val > 0, 'Amount must be greater than zero'),
  dueDate: z.string().min(1, 'Due date is required'),
  category: z.string().min(1, 'Category is required'),
});

export type BillInput = z.infer<typeof billSchema>;

export interface Bill extends BillInput {
  id: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface UserSettings {
  userName: string;
  currency: string;
  currencySymbol: string;
  monthlyIncomeTarget: number;
  avatar?: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  paymentMethod: string;
  type: 'all' | 'income' | 'expense';
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
}

export interface SortOptions {
  field: 'date' | 'amount' | 'title';
  order: 'asc' | 'desc';
}
