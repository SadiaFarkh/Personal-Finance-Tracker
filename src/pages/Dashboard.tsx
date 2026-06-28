import React from 'react';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { ChartsSection } from '../components/dashboard/ChartsSection';
import { UpcomingBills } from '../components/dashboard/UpcomingBills';
import { RecentTransactionsList } from '../components/dashboard/RecentTransactionsList';
import { FinancialInsightsList } from '../components/dashboard/FinancialInsightsList';
import { useFinance } from '../hooks/useFinance';
import type { Transaction } from '../types';

interface DashboardProps {
  onEditClick: (tx: Transaction) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onEditClick }) => {
  const { settings } = useFinance();

  // Get current date string
  const todayFormatted = new Date(2026, 5, 28).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-light-border dark:border-dark-border pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome Back, {settings.userName}!
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Here is a dynamic visualization of your financial landscape for {todayFormatted}.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <MetricsGrid />

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartsSection />
        </div>
        <div className="lg:col-span-1">
          <UpcomingBills />
        </div>
      </div>

      {/* Activity and Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactionsList onEditClick={onEditClick} />
        <FinancialInsightsList />
      </div>
    </div>
  );
};
export default Dashboard;
