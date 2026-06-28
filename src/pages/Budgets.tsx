import React from 'react';
import { BudgetTracker } from '../components/budgets/BudgetTracker';
import { SavingsGoals } from '../components/budgets/SavingsGoals';

export const Budgets: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Budgets & Financial Targets
        </h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          Establish monthly spending boundaries and monitor your progress towards savings goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <BudgetTracker />
        <SavingsGoals />
      </div>
    </div>
  );
};
export default Budgets;
