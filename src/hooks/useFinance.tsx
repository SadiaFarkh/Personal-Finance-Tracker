import React, { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react';
import type { 
  Transaction, TransactionInput, 
  Budget, Goal, GoalInput, 
  Bill, BillInput, 
  UserSettings, FilterOptions, SortOptions 
} from '../types';
import { useLocalStorage } from './useLocalStorage';
import toast from 'react-hot-toast';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  bills: Bill[];
  categories: string[];
  paymentMethods: string[];
  settings: UserSettings;
  theme: 'dark' | 'light';
  filters: FilterOptions;
  sorting: SortOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  setSorting: React.Dispatch<React.SetStateAction<SortOptions>>;
  
  // Actions
  addTransaction: (tx: TransactionInput) => void;
  editTransaction: (id: string, tx: TransactionInput) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (id: string) => void;
  
  addCategory: (category: string) => boolean;
  addPaymentMethod: (method: string) => boolean;
  
  addBudget: (category: string, limit: number) => void;
  editBudget: (id: string, limit: number) => void;
  deleteBudget: (id: string) => void;
  
  addGoal: (goal: GoalInput) => void;
  editGoal: (id: string, goal: GoalInput) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  
  addBill: (bill: BillInput) => void;
  payBill: (id: string) => void;
  deleteBill: (id: string) => void;
  
  updateSettings: (settings: Partial<UserSettings>) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  resetToMockData: () => void;
  clearAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Housing/Rent',
  'Groceries',
  'Dining Out',
  'Transport',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare'
];

const DEFAULT_PAYMENT_METHODS = [
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Apple Pay'
];

const INITIAL_SETTINGS: UserSettings = {
  userName: '',
  currency: 'USD',
  currencySymbol: '$',
  monthlyIncomeTarget: 5000
};

const INITIAL_FILTERS: FilterOptions = {
  searchQuery: '',
  category: 'all',
  paymentMethod: 'all',
  type: 'all',
  minAmount: '',
  maxAmount: '',
  startDate: '',
  endDate: ''
};

const INITIAL_SORTING: SortOptions = {
  field: 'date',
  order: 'desc'
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finance_transactions_v2', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('finance_budgets_v2', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('finance_goals_v2', []);
  const [bills, setBills] = useLocalStorage<Bill[]>('finance_bills_v2', []);
  const [categories, setCategories] = useLocalStorage<string[]>('finance_categories_v2', DEFAULT_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useLocalStorage<string[]>('finance_payment_methods_v2', DEFAULT_PAYMENT_METHODS);
  const [settings, setSettings] = useLocalStorage<UserSettings>('finance_settings_v2', INITIAL_SETTINGS);
  const [theme, setThemeState] = useLocalStorage<'dark' | 'light'>('finance_theme_v2', 'dark');
  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);
  const [sorting, setSorting] = useState<SortOptions>(INITIAL_SORTING);
  const [, startTransition] = useTransition();

  // Apply dark mode theme class to document element on mount & change
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Sync bills with payment status of transactions dynamically (e.g. if paid via transactions, mark as paid)
  // Or handle paying bills manually: when paid, we insert a transaction and update the bill.
  const payBill = useCallback((id: string) => {
    setBills((prevBills) => {
      const billIndex = prevBills.findIndex((b) => b.id === id);
      if (billIndex === -1) return prevBills;
      
      const bill = prevBills[billIndex];
      if (bill.status === 'paid') return prevBills;

      // Mark the bill as paid
      const updated = [...prevBills];
      updated[billIndex] = { ...bill, status: 'paid' };

      // Add a corresponding transaction automatically
      const now = new Date();
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        title: `Paid Bill: ${bill.title}`,
        amount: bill.amount,
        type: 'expense',
        category: bill.category,
        paymentMethod: 'Credit Card', // default
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        notes: `Auto-generated from bill payment. Due date: ${bill.dueDate}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      // Add transaction inside startTransition to keep UI responsive
      startTransition(() => {
        setTransactions((prevTxs) => [newTx, ...prevTxs]);
      });

      toast.success(`Bill "${bill.title}" paid! Generated transaction.`);
      return updated;
    });
  }, [setBills, setTransactions]);

  const addTransaction = useCallback((txInput: TransactionInput) => {
    const now = new Date();
    const newTx: Transaction = {
      ...txInput,
      id: `tx-${Date.now()}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    setTransactions((prev) => [newTx, ...prev]);
    toast.success('Transaction added successfully!');
  }, [setTransactions]);

  const editTransaction = useCallback((id: string, txInput: TransactionInput) => {
    const now = new Date();
    setTransactions((prev) => 
      prev.map((t) => (t.id === id ? { ...t, ...txInput, updatedAt: now.toISOString() } : t))
    );
    toast.success('Transaction updated!');
  }, [setTransactions]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success('Transaction deleted');
  }, [setTransactions]);

  const duplicateTransaction = useCallback((id: string) => {
    const original = transactions.find((t) => t.id === id);
    if (!original) {
      toast.error('Transaction not found');
      return;
    }
    const now = new Date();
    const duplicated: Transaction = {
      ...original,
      id: `tx-${Date.now()}`,
      title: `${original.title} (Copy)`,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    setTransactions((prev) => [duplicated, ...prev]);
    toast.success('Transaction duplicated!');
  }, [transactions, setTransactions]);

  const addCategory = useCallback((category: string): boolean => {
    const clean = category.trim();
    if (!clean) return false;
    if (categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      toast.error('Category already exists');
      return false;
    }
    setCategories((prev) => [...prev, clean]);
    toast.success(`Category "${clean}" added!`);
    return true;
  }, [categories, setCategories]);

  const addPaymentMethod = useCallback((method: string): boolean => {
    const clean = method.trim();
    if (!clean) return false;
    if (paymentMethods.some((p) => p.toLowerCase() === clean.toLowerCase())) {
      toast.error('Payment method already exists');
      return false;
    }
    setPaymentMethods((prev) => [...prev, clean]);
    toast.success(`Payment method "${clean}" added!`);
    return true;
  }, [paymentMethods, setPaymentMethods]);

  const addBudget = useCallback((category: string, limit: number) => {
    // If budget already exists for category, update it, else add
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category === category);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], limit };
        toast.success(`Updated budget limit for ${category}`);
        return updated;
      }
      const newBudget: Budget = {
        id: `b-${Date.now()}`,
        category,
        limit
      };
      toast.success(`Set budget for ${category}`);
      return [...prev, newBudget];
    });
  }, [setBudgets]);

  const editBudget = useCallback((id: string, limit: number) => {
    setBudgets((prev) => 
      prev.map((b) => (b.id === id ? { ...b, limit } : b))
    );
    toast.success('Budget limit updated');
  }, [setBudgets]);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    toast.success('Budget configuration removed');
  }, [setBudgets]);

  const addGoal = useCallback((goalInput: GoalInput) => {
    const newGoal: Goal = {
      ...goalInput,
      id: `g-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setGoals((prev) => [...prev, newGoal]);
    toast.success('Savings goal created!');
  }, [setGoals]);

  const editGoal = useCallback((id: string, goalInput: GoalInput) => {
    setGoals((prev) => 
      prev.map((g) => (g.id === id ? { ...g, ...goalInput } : g))
    );
    toast.success('Goal settings updated');
  }, [setGoals]);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success('Goal deleted');
  }, [setGoals]);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setGoals((prev) => {
      const goal = prev.find((g) => g.id === id);
      if (!goal) return prev;
      
      const newAmount = goal.currentAmount + amount;
      
      // Add corresponding transaction automatically to subtract balance
      const now = new Date();
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        title: `Goal Transfer: ${goal.name}`,
        amount: amount,
        type: 'expense',
        category: 'Investments',
        paymentMethod: 'Bank Transfer',
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        notes: `Allocated funds towards goal "${goal.name}"`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      // Add transaction inside startTransition to keep UI responsive
      startTransition(() => {
        setTransactions((prevTxs) => [newTx, ...prevTxs]);
      });

      toast.success(`Allocated ${settings.currencySymbol}${amount} to "${goal.name}"!`);
      return prev.map((g) => (g.id === id ? { ...g, currentAmount: newAmount } : g));
    });
  }, [setGoals, setTransactions, settings.currencySymbol]);

  const addBill = useCallback((billInput: BillInput) => {
    const newBill: Bill = {
      ...billInput,
      id: `bill-${Date.now()}`,
      status: 'pending'
    };
    setBills((prev) => [...prev, newBill]);
    toast.success('Upcoming bill scheduled!');
  }, [setBills]);

  const deleteBill = useCallback((id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    toast.success('Bill reminder deleted');
  }, [setBills]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    toast.success('Settings updated!');
  }, [setSettings]);

  const setTheme = useCallback((t: 'dark' | 'light') => {
    setThemeState(t);
    toast.success(`Switched to ${t === 'dark' ? 'OLED Dark' : 'Light'} mode`);
  }, [setThemeState]);

  const resetToMockData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setBills([]);
    setCategories(DEFAULT_CATEGORIES);
    setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    // Keep username and currency, preserve monthly income target
    setSettings((prev) => ({
      ...prev,
      monthlyIncomeTarget: prev.monthlyIncomeTarget || 5000
    }));
    toast.success('Finance ledger and records reset successfully!');
  }, [setTransactions, setBudgets, setGoals, setBills, setCategories, setPaymentMethods, setSettings]);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setBills([]);
    setCategories(DEFAULT_CATEGORIES);
    setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    setSettings(INITIAL_SETTINGS);
    toast.success('All local storage data cleared.');
  }, [setTransactions, setBudgets, setGoals, setBills, setCategories, setPaymentMethods, setSettings]);

  return (
    <FinanceContext.Provider value={{
      transactions,
      budgets,
      goals,
      bills,
      categories,
      paymentMethods,
      settings,
      theme,
      filters,
      sorting,
      setFilters,
      setSorting,
      addTransaction,
      editTransaction,
      deleteTransaction,
      duplicateTransaction,
      addCategory,
      addPaymentMethod,
      addBudget,
      editBudget,
      deleteBudget,
      addGoal,
      editGoal,
      deleteGoal,
      contributeToGoal,
      addBill,
      payBill,
      deleteBill,
      updateSettings,
      setTheme,
      resetToMockData,
      clearAllData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
