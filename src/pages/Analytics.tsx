import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  TrendingUp, 
  CreditCard, 
  PiggyBank, 
  Percent,
  Wallet
} from 'lucide-react';
import { useFinance } from '../hooks/useFinance';

const COLORS = ['#2563EB', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];

export const Analytics: React.FC = () => {
  const { transactions, settings, bills, goals, theme } = useFinance();
  const isDark = theme === 'dark';

  const hasData = transactions.length > 0;

  // 1. Group Monthly Cash Flow (Bar Chart)
  const cashFlowData = useMemo(() => {
    if (!hasData) return [];
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const monthlyGroups: { [key: string]: { name: string; Income: number; Expense: number } } = {};
    
    sorted.forEach(tx => {
      const dateObj = new Date(tx.date + 'T00:00:00');
      const key = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyGroups[key]) {
        monthlyGroups[key] = { name: key, Income: 0, Expense: 0 };
      }
      if (tx.type === 'income') {
        monthlyGroups[key].Income += tx.amount;
      } else {
        monthlyGroups[key].Expense += tx.amount;
      }
    });
    return Object.values(monthlyGroups);
  }, [transactions, hasData]);

  // 2. Expense Category Breakdown (Pie Chart)
  const categoryData = useMemo(() => {
    if (!hasData) return [];
    const groups: { [key: string]: number } = {};
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        groups[tx.category] = (groups[tx.category] || 0) + tx.amount;
      }
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions, hasData]);

  // 3. Financial Net Worth (Area Chart)
  const netWorthData = useMemo(() => {
    if (!hasData) return [];
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    const daily: { [key: string]: { date: string; balance: number } } = {};
    
    sorted.forEach(tx => {
      cumulative += tx.type === 'income' ? tx.amount : -tx.amount;
      const dayName = new Date(tx.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      daily[tx.date] = { date: dayName, balance: cumulative };
    });
    return Object.values(daily);
  }, [transactions, hasData]);

  // 4. Net Worth breakdown: Assets vs Liabilities
  const balanceVal = useMemo(() => {
    return transactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);
  }, [transactions]);

  const goalsSavingsVal = useMemo(() => {
    return goals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  }, [goals]);

  const liabilitiesVal = useMemo(() => {
    // Sum of pending bills
    return bills.filter(b => b.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  }, [bills]);

  const netWorthBreakdown = useMemo(() => {
    const assets = balanceVal + goalsSavingsVal;
    const net = assets - liabilitiesVal;
    return {
      assets,
      liabilities: liabilitiesVal,
      net
    };
  }, [balanceVal, goalsSavingsVal, liabilitiesVal]);

  // 5. Subscription Drain Metrics
  const activeSubscriptions = useMemo(() => {
    return bills.filter(b => b.status === 'pending' || b.status === 'paid');
  }, [bills]);

  const totalMonthlySubVal = useMemo(() => {
    return activeSubscriptions.reduce((acc, curr) => acc + curr.amount, 0);
  }, [activeSubscriptions]);

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-light-surface/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border custom-tooltip-shadow rounded-xl backdrop-blur-md text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{entry.name}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {settings.currencySymbol}{entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartTheme = {
    gridColor: isDark ? '#1f1f23' : '#f1f1f4',
    textColor: isDark ? '#71717a' : '#71717a',
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Insights & Deep Analytics
        </h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          Investigate spending trends, subscription drain, and historical wealth aggregation.
        </p>
      </div>

      {/* Assets & Liabilities Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Assets */}
        <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Liquid Assets</span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500"><PiggyBank className="w-4.5 h-4.5" /></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {settings.currencySymbol}{netWorthBreakdown.assets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">
            Cash ({settings.currencySymbol}{balanceVal.toLocaleString()}) + Goal Funds ({settings.currencySymbol}{goalsSavingsVal.toLocaleString()})
          </p>
        </div>

        {/* Liabilities */}
        <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Liabilities</span>
            <div className="p-1.5 rounded-md bg-red-500/10 text-red-500"><CreditCard className="w-4.5 h-4.5" /></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {settings.currencySymbol}{netWorthBreakdown.liabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">
            Unpaid bills & invoices due
          </p>
        </div>

        {/* Total Net Worth */}
        <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Worth</span>
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500"><Wallet className="w-4.5 h-4.5" /></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {settings.currencySymbol}{netWorthBreakdown.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold">
            Assets minus Liabilities
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area: Net Worth History */}
        <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex flex-col h-[350px]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Net Worth Trend
          </h4>
          <div className="flex-1 min-h-0">
            {!hasData ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">No trend details</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="netWorthGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                  <XAxis dataKey="date" tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="balance" name="Net Worth" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#netWorthGlow)" animationDuration={600} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Double Bar Chart: Cash Flow */}
        <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex flex-col h-[350px]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Cash Flow History (Income vs Expense)
          </h4>
          <div className="flex-1 min-h-0">
            {!hasData ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">No flow details</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                  <XAxis dataKey="name" tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Income" fill="#10B981" radius={[3, 3, 0, 0]} animationDuration={600} />
                  <Bar dataKey="Expense" fill="#EF4444" radius={[3, 3, 0, 0]} animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie: Expense Categories */}
        <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex flex-col h-[350px]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-amber-500" /> Category Breakdown
          </h4>
          <div className="flex-1 min-h-0">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">No expense breakdown</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', maxHeight: '50px', overflowY: 'auto' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Line Chart: Financial Trend lines */}
        <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex flex-col h-[350px]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-500" /> Cash Flow Trend Lines
          </h4>
          <div className="flex-1 min-h-0">
            {!hasData ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">No line details</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                  <XAxis dataKey="name" tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={600} />
                  <Line type="monotone" dataKey="Expense" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Subscription List Section */}
      <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-light-border dark:border-dark-border pb-4 mb-4 gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recurring Subscriptions Tracker
            </h4>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Subscriptions actively draining wealth. Total monthly leak is <span className="font-extrabold text-red-500">{settings.currencySymbol}{totalMonthlySubVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Subscription Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cycle Amount</th>
                <th className="py-3 px-4">Billing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border text-xs text-slate-700 dark:text-slate-300">
              {activeSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center font-semibold text-slate-500">
                    No active recurring invoices recorded.
                  </td>
                </tr>
              ) : (
                activeSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-light-bg/40 dark:hover:bg-dark-surface-hover/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {sub.title}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400">
                      {sub.category}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-red-500">
                      {settings.currencySymbol}{sub.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} / mo
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                        sub.status === 'paid' 
                          ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
                          : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
