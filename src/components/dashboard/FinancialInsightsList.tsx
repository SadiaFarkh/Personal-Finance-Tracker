import React, { useMemo } from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';

interface InsightItem {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export const FinancialInsightsList: React.FC = () => {
  const { transactions, budgets, settings, bills } = useFinance();

  const insights = useMemo((): InsightItem[] => {
    const list: InsightItem[] = [];
    if (transactions.length === 0) {
      return [{
        id: 'no-data',
        type: 'info',
        title: 'Gathering Financial Data',
        description: 'Once you enter a few transactions, Aura\'s financial engine will display real-time insights.',
        icon: Info
      }];
    }

    const now = new Date(2026, 5, 28);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Calculations
    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySpending: { [key: string]: number } = {};
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach(tx => {
      const txDate = new Date(tx.date + 'T00:00:00');
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
          monthlyIncome += tx.amount;
        }
      } else {
        totalExpenses += tx.amount;
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
        if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
          monthlyExpenses += tx.amount;
        }
      }
    });

    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // 1. Savings Rate Insight
    if (savingsRate >= 30) {
      list.push({
        id: 'savings-excellent',
        type: 'success',
        title: 'Outstanding Savings Rate',
        description: `Your lifetime savings rate is ${savingsRate.toFixed(1)}%, which is well above the recommended 20% benchmark. You are building wealth rapidly!`,
        icon: CheckCircle2
      });
    } else if (savingsRate > 0 && savingsRate < 20) {
      list.push({
        id: 'savings-low',
        type: 'warning',
        title: 'Increase Your Savings',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income. Look for small expenses to trim down.`,
        icon: AlertTriangle
      });
    } else if (savingsRate <= 0 && totalIncome > 0) {
      list.push({
        id: 'savings-negative',
        type: 'warning',
        title: 'Negative Cash Flow Warning',
        description: 'You are spending more than you earn! Your expenses exceed your total income. Review your discretionary budgets immediately.',
        icon: AlertTriangle
      });
    }

    // 2. Highest Spending Category
    const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const percentOfExpenses = totalExpenses > 0 ? (topAmount / totalExpenses) * 100 : 0;
      
      if (percentOfExpenses > 35 && topCategory !== 'Housing/Rent') {
        list.push({
          id: 'category-heavy',
          type: 'warning',
          title: `Heavy Outflow on ${topCategory}`,
          description: `${topCategory} accounts for ${percentOfExpenses.toFixed(1)}% of your total expenditures (${settings.currencySymbol}${topAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}). Consider setting a budget here to control outflow.`,
          icon: TrendingUp
        });
      } else {
        list.push({
          id: 'category-info',
          type: 'info',
          title: `Primary Expense Driver`,
          description: `Your highest expenditure category is ${topCategory}, consuming ${settings.currencySymbol}${topAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} of your overall spending.`,
          icon: Info
        });
      }
    }

    // 3. Housing Cost Ratio
    const housingSpend = categorySpending['Housing/Rent'] || 0;
    if (housingSpend > 0 && totalIncome > 0) {
      const housingRatio = (housingSpend / totalIncome) * 100;
      if (housingRatio > 35) {
        list.push({
          id: 'housing-heavy',
          type: 'warning',
          title: 'High Housing Costs',
          description: `Your housing costs eat up ${housingRatio.toFixed(1)}% of your income. Experts advise keeping housing under 30% of gross earnings to avoid being house-poor.`,
          icon: AlertTriangle
        });
      } else {
        list.push({
          id: 'housing-ideal',
          type: 'success',
          title: 'Ideal Housing Allocation',
          description: `Your housing represents ${housingRatio.toFixed(1)}% of your lifetime earnings, which falls comfortably within the recommended 30% threshold.`,
          icon: CheckCircle2
        });
      }
    }

    // 4. Budget Check
    // Check if any budget is exceeded by actual spending in that category
    let budgetExceededCount = 0;
    let worstCategory = '';
    let worstExcess = 0;

    budgets.forEach(b => {
      const actual = categorySpending[b.category] || 0;
      if (actual > b.limit) {
        budgetExceededCount++;
        const excess = actual - b.limit;
        if (excess > worstExcess) {
          worstExcess = excess;
          worstCategory = b.category;
        }
      }
    });

    if (budgetExceededCount > 0) {
      list.push({
        id: 'budget-exceeded',
        type: 'warning',
        title: `${budgetExceededCount} Active Budget Limit${budgetExceededCount > 1 ? 's' : ''} Exceeded`,
        description: `You have overspent on ${budgetExceededCount} budget category. The largest overrun is in ${worstCategory}, exceeding your limit by ${settings.currencySymbol}${worstExcess.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
        icon: AlertTriangle
      });
    } else if (budgets.length > 0) {
      list.push({
        id: 'budget-good',
        type: 'success',
        title: 'Perfect Budget Discipline',
        description: 'Excellent financial self-control! You are currently within limits on all defined category budgets.',
        icon: CheckCircle2
      });
    }

    // 5. Subscription Drain
    const activeRecurringBills = bills.filter(b => b.status === 'pending' || b.status === 'paid');
    const totalRecurringCost = activeRecurringBills.reduce((acc, curr) => acc + curr.amount, 0);
    if (activeRecurringBills.length >= 5) {
      list.push({
        id: 'subscription-drain',
        type: 'info',
        title: 'Multiple Active Recurring Commitments',
        description: `You are tracking ${activeRecurringBills.length} recurring bills totaling ${settings.currencySymbol}${totalRecurringCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} per cycle. Inspect if any memberships can be cancelled.`,
        icon: DollarSign
      });
    }

    return list;
  }, [transactions, budgets, settings, bills]);

  return (
    <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 pb-4 border-b border-light-border dark:border-dark-border mb-4">
        <Lightbulb className="w-5 h-5 text-blue-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Aura Financial Insights
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
        {insights.map((insight) => {
          const Icon = insight.icon;
          const bgColors = {
            success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            info: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
          };
          return (
            <div 
              key={insight.id}
              className={`p-3 rounded-xl border theme-transition flex gap-3 ${
                insight.type === 'warning' 
                  ? 'border-amber-500/20 bg-amber-500/[0.01]' 
                  : insight.type === 'success'
                  ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                  : 'border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg/30'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 h-fit ${bgColors[insight.type]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {insight.title}
                </h4>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
