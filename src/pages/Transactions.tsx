import React from 'react';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionListTable } from '../components/transactions/TransactionListTable';
import type { Transaction } from '../types';

interface TransactionsProps {
  onEditClick: (tx: Transaction) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ onEditClick }) => {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Transactions Ledger
        </h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          Search, filter, sort, duplicate, and manage your income and expenses.
        </p>
      </div>

      {/* Filters */}
      <TransactionFilters />

      {/* Ledger Table */}
      <TransactionListTable onEditClick={onEditClick} />
    </div>
  );
};
export default Transactions;
