import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { AreaChart as AreaIcon, BarChart2, PieChart as PieIcon, LineChart as LineIcon, AlertCircle } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';

const COLORS = [
  '#2563EB', // Blue
  '#10B981', // Emerald
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export const ChartsSection: React.FC = () => {
  const { transactions, settings, theme } = useFinance();
  const [activeTab, setActiveTab] = useState<'flow' | 'categories' | 'trends' | 'weekly'>('flow');

  const isDark = theme === 'dark';

  // Check if data is empty
  const hasData = transactions.length > 0;

  // 1. Group Monthly Cash Flow (Income vs Expense)
  const monthlyFlowData = useMemo(() => {
    if (!hasData) return [];
    
    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const monthlyGroups: { [key: string]: { name: string; income: number; expense: number } } = {};
    
    sorted.forEach(tx => {
      const dateObj = new Date(tx.date + 'T00:00:00');
      // e.g. "Jun 2026" or "Jun"
      const monthYear = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      
      if (!monthlyGroups[monthYear]) {
        monthlyGroups[monthYear] = { name: monthYear, income: 0, expense: 0 };
      }
      
      if (tx.type === 'income') {
        monthlyGroups[monthYear].income += tx.amount;
      } else {
        monthlyGroups[monthYear].expense += tx.amount;
      }
    });

    return Object.values(monthlyGroups);
  }, [transactions, hasData]);

  // 2. Group Expense Categories (Pie Chart)
  const categoryData = useMemo(() => {
    if (!hasData) return [];
    
    const expensesByCategory: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.amount;
      }
    });

    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, hasData]);

  // 3. Financial Net Worth Trend (Cumulative Balance Area Chart)
  const trendData = useMemo(() => {
    if (!hasData) return [];
    
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Accumulate balance over time
    let cumulativeBalance = 0;
    const dailyBalance: { [key: string]: { date: string; balance: number; income: number; expense: number } } = {};
    
    sorted.forEach(tx => {
      const dateStr = tx.date;
      if (tx.type === 'income') {
        cumulativeBalance += tx.amount;
      } else {
        cumulativeBalance -= tx.amount;
      }
      
      if (!dailyBalance[dateStr]) {
        dailyBalance[dateStr] = {
          date: new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          balance: 0,
          income: tx.type === 'income' ? tx.amount : 0,
          expense: tx.type === 'expense' ? tx.amount : 0,
        };
      } else {
        if (tx.type === 'income') dailyBalance[dateStr].income += tx.amount;
        else dailyBalance[dateStr].expense += tx.amount;
      }
      
      dailyBalance[dateStr].balance = cumulativeBalance;
    });

    return Object.values(dailyBalance);
  }, [transactions, hasData]);

  // 4. Last 7 Days Spending (Weekly Bar Chart)
  const weeklyData = useMemo(() => {
    if (!hasData) return [];
    const spending: { [key: string]: number } = {};
    
    // Initialize last 7 days
    const baseDate = new Date(2026, 5, 28); // Standardized June 28, 2026
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const key = d.toISOString().split('T')[0];
      spending[key] = 0;
    }
    
    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date in spending) {
        spending[tx.date] += tx.amount;
      }
    });

    return Object.entries(spending).map(([dateStr, amount]) => {
      const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
      return { day: dayName, spending: amount };
    });
  }, [transactions, hasData]);

  // Custom premium tooltip
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
    tooltipBg: isDark ? '#18181b' : '#ffffff',
  };

  return (
    <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex flex-col h-[400px]">
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-light-border dark:border-dark-border mb-4 gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Financial Visualizations
        </h3>
        
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg/40 self-start">
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'flow'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Cash Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <AreaIcon className="w-3.5 h-3.5" />
            <span>Net Worth</span>
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span>Weekly Outflow</span>
          </button>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center">
        {!hasData ? (
          /* Empty State Chart */
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border border-light-border dark:border-dark-border text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Chart Data Available</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Add some transactions above to generate real-time interactive financial diagrams.
              </p>
            </div>
          </div>
        ) : (
          /* Render Active Chart */
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'flow' ? (
              <BarChart data={monthlyFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                <XAxis dataKey="name" tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#27272a30' : '#f4f4f580' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} animationDuration={600} />
                <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} animationDuration={600} />
              </BarChart>
            ) : activeTab === 'categories' ? (
              categoryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-slate-400">No Expense Categories Found</p>
                </div>
              ) : (
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', maxHeight: '50px', overflowY: 'auto' }} />
                </PieChart>
              )
            ) : activeTab === 'trends' ? (
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                <XAxis dataKey="date" tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="balance" name="Net Worth" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#balanceGlow)" animationDuration={600} />
              </AreaChart>
            ) : (
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                <XAxis dataKey="day" tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.textColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#27272a30' : '#f4f4f580' }} />
                <Bar dataKey="spending" name="Daily Outflow" fill="#EF4444" radius={[4, 4, 0, 0]} animationDuration={600}>
                  {weeklyData.map((_, index) => (
                    <Cell key={`cell-weekly-${index}`} fill="#EF4444" fillOpacity={0.85 + (index * 0.02)} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
