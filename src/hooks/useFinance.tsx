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

// Helper to generate dynamic mock dates relative to current date (2026-06-28)
const getDateOffset = (daysAgo: number) => {
  const date = new Date(2026, 5, 28); // June 28, 2026 (0-indexed month)
  date.setDate(date.getDate() - daysAgo);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

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

const generateMockTransactions = (): Transaction[] => {
  const txs: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
    // Income
    { title: 'Bi-Weekly Salary', amount: 3500, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', date: getDateOffset(0), time: '09:00', notes: 'Primary job salary' },
    { title: 'Freelance Design Project', amount: 1200, type: 'income', category: 'Freelance', paymentMethod: 'Bank Transfer', date: getDateOffset(2), time: '14:30', notes: 'Landing page design client payment' },
    { title: 'Dividend Payout', amount: 150, type: 'income', category: 'Investments', paymentMethod: 'Bank Transfer', date: getDateOffset(10), time: '10:15', notes: 'Quarterly dividends' },
    { title: 'Bi-Weekly Salary', amount: 3500, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', date: getDateOffset(14), time: '09:00', notes: 'Primary job salary' },
    { title: 'Consulting Session', amount: 450, type: 'income', category: 'Freelance', paymentMethod: 'Bank Transfer', date: getDateOffset(16), time: '16:00', notes: '1-on-1 architecture review' },
    { title: 'Bi-Weekly Salary', amount: 3500, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', date: getDateOffset(28), time: '09:00', notes: 'Primary job salary' },

    // Rent
    { title: 'Monthly Apartment Rent', amount: 1800, type: 'expense', category: 'Housing/Rent', paymentMethod: 'Bank Transfer', date: getDateOffset(27), time: '08:00', notes: 'June rent payment' },
    { title: 'Monthly Apartment Rent', amount: 1800, type: 'expense', category: 'Housing/Rent', paymentMethod: 'Bank Transfer', date: getDateOffset(58), time: '08:00', notes: 'May rent payment' },

    // Groceries
    { title: 'Whole Foods Grocery Run', amount: 184.5, type: 'expense', category: 'Groceries', paymentMethod: 'Credit Card', date: getDateOffset(1), time: '18:15', notes: 'Weekly meal prep supplies' },
    { title: 'Organic Market Shopping', amount: 92.3, type: 'expense', category: 'Groceries', paymentMethod: 'Debit Card', date: getDateOffset(6), time: '11:00', notes: 'Fruits and vegetables' },
    { title: 'Costco Wholesale Bulk', amount: 245.8, type: 'expense', category: 'Groceries', paymentMethod: 'Credit Card', date: getDateOffset(12), time: '15:20', notes: 'Monthly bulk items' },
    { title: 'Trader Joe\'s Groceries', amount: 112.4, type: 'expense', category: 'Groceries', paymentMethod: 'Apple Pay', date: getDateOffset(19), time: '17:40', notes: 'Mid-week groceries' },

    // Dining Out
    { title: 'Sushi Dinner with Friends', amount: 145.0, type: 'expense', category: 'Dining Out', paymentMethod: 'Credit Card', date: getDateOffset(3), time: '20:30', notes: 'Split bill at Omakase' },
    { title: 'Blue Bottle Coffee', amount: 6.75, type: 'expense', category: 'Dining Out', paymentMethod: 'Apple Pay', date: getDateOffset(0), time: '08:15', notes: 'Latte & croissant' },
    { title: 'Ramen Lunch Solo', amount: 22.5, type: 'expense', category: 'Dining Out', paymentMethod: 'Cash', date: getDateOffset(5), time: '13:00', notes: 'Ramen and green tea' },
    { title: 'Artisanal Pizzeria Dinner', amount: 68.0, type: 'expense', category: 'Dining Out', paymentMethod: 'Credit Card', date: getDateOffset(8), time: '19:30', notes: 'Friday night pizza' },
    { title: 'Starbucks Coffee Combo', amount: 12.5, type: 'expense', category: 'Dining Out', paymentMethod: 'Apple Pay', date: getDateOffset(11), time: '09:00', notes: 'Coffee and bagel' },

    // Transport
    { title: 'Gas Station Refill', amount: 48.0, type: 'expense', category: 'Transport', paymentMethod: 'Credit Card', date: getDateOffset(2), time: '10:00', notes: 'Premium gas' },
    { title: 'Uber Ride to Airport', amount: 65.0, type: 'expense', category: 'Transport', paymentMethod: 'Apple Pay', date: getDateOffset(9), time: '05:45', notes: 'Business trip transfer' },
    { title: 'Gas Station Refill', amount: 42.5, type: 'expense', category: 'Transport', paymentMethod: 'Credit Card', date: getDateOffset(15), time: '17:30', notes: '' },
    { title: 'City Metro Pass', amount: 90.0, type: 'expense', category: 'Transport', paymentMethod: 'Debit Card', date: getDateOffset(26), time: '12:00', notes: 'Monthly transit card' },

    // Utilities
    { title: 'Electric Bill (ComEd)', amount: 115.4, type: 'expense', category: 'Utilities', paymentMethod: 'Bank Transfer', date: getDateOffset(10), time: '07:30', notes: 'Electricity bill' },
    { title: 'High-speed Fiber Internet', amount: 80.0, type: 'expense', category: 'Utilities', paymentMethod: 'Credit Card', date: getDateOffset(15), time: '08:00', notes: 'AT&T Fiber 1Gbps' },
    { title: 'Water & Sewage Utility', amount: 45.2, type: 'expense', category: 'Utilities', paymentMethod: 'Bank Transfer', date: getDateOffset(20), time: '10:00', notes: 'Quarterly water' },

    // Entertainment
    { title: 'Netflix Subscription', amount: 22.99, type: 'expense', category: 'Entertainment', paymentMethod: 'Credit Card', date: getDateOffset(5), time: '02:00', notes: 'Premium UHD Plan' },
    { title: 'Spotify Premium Family', amount: 16.99, type: 'expense', category: 'Entertainment', paymentMethod: 'Credit Card', date: getDateOffset(18), time: '01:00', notes: 'Monthly music plan' },
    { title: 'Movie Theatre & Snacks', amount: 38.5, type: 'expense', category: 'Entertainment', paymentMethod: 'Debit Card', date: getDateOffset(4), time: '21:00', notes: 'Sci-fi movie premiere' },
    { title: 'Gym Membership', amount: 75.0, type: 'expense', category: 'Entertainment', paymentMethod: 'Credit Card', date: getDateOffset(25), time: '06:00', notes: 'Equinox entry fee' },

    // Shopping & Healthcare
    { title: 'Ergonomic Office Chair', amount: 349.99, type: 'expense', category: 'Shopping', paymentMethod: 'Credit Card', date: getDateOffset(7), time: '13:10', notes: 'WFH setup upgrade' },
    { title: 'Nike Running Shoes', amount: 130.0, type: 'expense', category: 'Shopping', paymentMethod: 'Apple Pay', date: getDateOffset(13), time: '16:45', notes: 'Pegasus 40' },
    { title: 'Monthly Prescription Refill', amount: 35.0, type: 'expense', category: 'Healthcare', paymentMethod: 'Debit Card', date: getDateOffset(22), time: '11:15', notes: 'Vitamins & prescription' }
  ];

  return txs.map((t, idx) => ({
    ...t,
    id: `tx-${Date.now()}-${idx}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

const INITIAL_BUDGETS: Budget[] = [
  { id: 'b-1', category: 'Groceries', limit: 600 },
  { id: 'b-2', category: 'Dining Out', limit: 400 },
  { id: 'b-3', category: 'Transport', limit: 300 },
  { id: 'b-4', category: 'Entertainment', limit: 200 },
  { id: 'b-5', category: 'Shopping', limit: 500 }
];

const INITIAL_GOALS = (): Goal[] => [
  { id: 'g-1', name: 'Emergency Fund', targetAmount: 15000, currentAmount: 8500, targetDate: '2026-12-31', createdAt: new Date().toISOString() },
  { id: 'g-2', name: 'Tokyo Vacation 2027', targetAmount: 6000, currentAmount: 1800, targetDate: '2027-04-15', createdAt: new Date().toISOString() },
  { id: 'g-3', name: 'New Electric Car', targetAmount: 45000, currentAmount: 15000, targetDate: '2028-06-30', createdAt: new Date().toISOString() }
];

const INITIAL_BILLS = (): Bill[] => [
  { id: 'bill-1', title: 'Adobe Creative Cloud', amount: 54.99, dueDate: getDateOffset(-2), category: 'Utilities', status: 'pending' },
  { id: 'bill-2', title: 'Car Insurance (GEICO)', amount: 145.0, dueDate: getDateOffset(-5), category: 'Transport', status: 'paid' },
  { id: 'bill-3', title: 'High-speed Fiber Internet', amount: 80.0, dueDate: getDateOffset(-15), category: 'Utilities', status: 'paid' },
  { id: 'bill-4', title: 'Rent Invoice', amount: 1800.0, dueDate: getDateOffset(-27), category: 'Housing/Rent', status: 'paid' },
  { id: 'bill-5', title: 'Gym Membership', amount: 75.0, dueDate: getDateOffset(-25), category: 'Entertainment', status: 'paid' },
  { id: 'bill-6', title: 'Electric Bill', amount: 125.0, dueDate: getDateOffset(-10), category: 'Utilities', status: 'paid' },
  { id: 'bill-7', title: 'Cell Phone Plan (Verizon)', amount: 85.0, dueDate: getDateOffset(-22), category: 'Utilities', status: 'paid' },
  { id: 'bill-8', title: 'AWS Cloud Hosting', amount: 12.4, dueDate: getDateOffset(-20), category: 'Utilities', status: 'paid' }
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finance_transactions', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('finance_budgets', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('finance_goals', []);
  const [bills, setBills] = useLocalStorage<Bill[]>('finance_bills', []);
  const [categories, setCategories] = useLocalStorage<string[]>('finance_categories', DEFAULT_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useLocalStorage<string[]>('finance_payment_methods', DEFAULT_PAYMENT_METHODS);
  const [settings, setSettings] = useLocalStorage<UserSettings>('finance_settings', INITIAL_SETTINGS);
  const [theme, setThemeState] = useLocalStorage<'dark' | 'light'>('finance_theme', 'dark');
  const [seeded, setSeeded] = useLocalStorage<boolean>('finance_seeded', false);
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

  // Seeding initial mock data if empty and first time
  useEffect(() => {
    if (!seeded) {
      if (transactions.length === 0) {
        setTransactions(generateMockTransactions());
      }
      if (budgets.length === 0) {
        setBudgets(INITIAL_BUDGETS);
      }
      if (goals.length === 0) {
        setGoals(INITIAL_GOALS());
      }
      if (bills.length === 0) {
        setBills(INITIAL_BILLS());
      }
      setSeeded(true);
    }
  }, [seeded, transactions.length, budgets.length, goals.length, bills.length, setTransactions, setBudgets, setGoals, setBills, setSeeded]);

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
    setTransactions(generateMockTransactions());
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS());
    setBills(INITIAL_BILLS());
    setCategories(DEFAULT_CATEGORIES);
    setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    // Keep username and currency, reset monthly target to default mock size
    setSettings((prev) => ({
      ...prev,
      monthlyIncomeTarget: 8000
    }));
    toast.success('Finance tracker seeded with clean mock data!');
  }, [setTransactions, setBudgets, setGoals, setBills, setCategories, setPaymentMethods, setSettings]);

  const clearAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setBills([]);
    setCategories(DEFAULT_CATEGORIES);
    setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    setSettings(INITIAL_SETTINGS);
    setSeeded(true);
    toast.success('All local storage data cleared.');
  }, [setTransactions, setBudgets, setGoals, setBills, setCategories, setPaymentMethods, setSettings, setSeeded]);

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
