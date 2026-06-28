import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Zap,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';

export const MetricsGrid: React.FC = () => {
  const { transactions, settings } = useFinance();

  // Helper: check if date falls in current month/year/week
  const now = new Date(2026, 5, 28); // Standardized today date for consistency
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Start of week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const startOfYear = new Date(currentYear, 0, 1);

  // Initial calculations
  let totalIncome = 0;
  let totalExpenses = 0;
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  let highestExpenseVal = 0;
  let highestIncomeVal = 0;
  let incomeCount = 0;
  
  let todaySpending = 0;
  let weeklySpending = 0;
  let monthlySpending = 0;
  let yearlySpending = 0;

  const todayStr = '2026-06-28';

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date + 'T00:00:00');
    const amt = tx.amount;

    if (tx.type === 'income') {
      totalIncome += amt;
      incomeCount++;
      if (amt > highestIncomeVal) highestIncomeVal = amt;

      // Current month income
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
        monthlyIncome += amt;
      }
    } else {
      totalExpenses += amt;
      if (amt > highestExpenseVal) highestExpenseVal = amt;

      // Current month expense
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
        monthlyExpenses += amt;
      }

      // Spending ranges
      if (tx.date === todayStr) {
        todaySpending += amt;
      }
      if (txDate >= startOfWeek && txDate <= now) {
        weeklySpending += amt;
      }
      if (txDate >= startOfMonth && txDate <= now) {
        monthlySpending += amt;
      }
      if (txDate >= startOfYear && txDate <= now) {
        yearlySpending += amt;
      }
    }
  });

  const totalBalance = totalIncome - totalExpenses;
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;

  const formatCurrency = (val: number) => {
    return `${settings.currencySymbol}${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const mainMetrics = [
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      icon: Wallet,
      color: totalBalance >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10',
      description: 'Accumulated net worth',
    },
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10',
      description: 'Lifetime earnings',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'text-red-500 bg-red-500/10',
      description: 'Lifetime outflow',
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: Percent,
      color: savingsRate >= 20 ? 'text-blue-500 bg-blue-500/10' : 'text-amber-500 bg-amber-500/10',
      description: 'Ideal is 20% or higher',
    },
  ];

  const subMetrics = [
    { label: 'Monthly Income', value: `${formatCurrency(monthlyIncome)} / ${formatCurrency(settings.monthlyIncomeTarget)}`, icon: ArrowUpRight, color: 'text-emerald-500' },
    { label: 'Monthly Expense', value: formatCurrency(monthlyExpenses), icon: ArrowDownRight, color: 'text-red-500' },
    { label: 'Highest Income', value: formatCurrency(highestIncomeVal), icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Highest Expense', value: formatCurrency(highestExpenseVal), icon: TrendingDown, color: 'text-red-500' },
    { label: 'Average Income', value: formatCurrency(avgIncome), icon: DollarSign, color: 'text-blue-500' },
    { label: 'Today Spending', value: formatCurrency(todaySpending), icon: Calendar, color: 'text-amber-500' },
    { label: 'Weekly Spending', value: formatCurrency(weeklySpending), icon: Zap, color: 'text-rose-500' },
    { label: 'Yearly Spending', value: formatCurrency(yearlySpending), icon: Calendar, color: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainMetrics.map((m, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {m.title}
              </span>
              <div className={`p-2 rounded-lg ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none mb-1">
              {m.value}
            </h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {m.description}
            </p>
          </div>
        ))}
      </div>

      {/* Secondary Metrics Card */}
      <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
          Financial Statistics & Indicators
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {subMetrics.map((m, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                <span className="text-xs font-semibold truncate">{m.label}</span>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
