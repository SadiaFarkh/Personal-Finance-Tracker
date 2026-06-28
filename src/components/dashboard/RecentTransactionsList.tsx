import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Copy, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  CreditCard,
  Notebook
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import type { Transaction } from '../../types';
import { Modal } from '../ui/Modal';

interface RecentTransactionsListProps {
  onEditClick: (tx: Transaction) => void;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({ onEditClick }) => {
  const { transactions, duplicateTransaction, deleteTransaction, settings } = useFinance();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Take the most recent 5 transactions
  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Recent Activity
        </h3>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
        {recentTxs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <p className="text-xs font-semibold text-slate-500">No recent transactions</p>
            <p className="text-[10px] text-slate-400 max-w-[180px]">Add an expense or income to populate recent activity.</p>
          </div>
        ) : (
          recentTxs.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div 
                key={tx.id}
                className="p-3 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg/30 hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover transition-colors flex items-center justify-between gap-3 group relative cursor-pointer"
                onClick={() => setSelectedTx(tx)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <p className={`text-xs font-bold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'}{settings.currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>

                  {/* Actions overlay hover on desktop, always visible on mobile/small elements */}
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-dark-surface-hover text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                      title="View details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditClick(tx)}
                      className="p-1 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => duplicateTransaction(tx.id)}
                      className="p-1 rounded hover:bg-purple-500/10 text-slate-400 hover:text-purple-500 cursor-pointer transition-colors"
                      title="Duplicate transaction"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
        title="Transaction Ledger Details"
      >
        {selectedTx && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                  selectedTx.type === 'income' 
                    ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-red-500 bg-red-500/10 border-red-500/20'
                }`}>
                  {selectedTx.type}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {selectedTx.title}
                </h4>
              </div>
              <div className="text-right">
                <p className={`text-base font-extrabold ${selectedTx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {selectedTx.type === 'income' ? '+' : '-'}{settings.currencySymbol}{selectedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Category</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{selectedTx.category}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Payment Method</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  {selectedTx.paymentMethod}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Date</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {new Date(selectedTx.date + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">Time</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {selectedTx.time}
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-3 border-t border-light-border dark:border-dark-border">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block text-xs">Notes</span>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 flex gap-1.5 items-start leading-relaxed bg-light-bg dark:bg-dark-bg/40 p-3 rounded-lg border border-light-border dark:border-dark-border">
                <Notebook className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{selectedTx.notes || 'No remarks provided.'}</span>
              </p>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setSelectedTx(null);
                  onEditClick(selectedTx);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors"
              >
                Edit Transaction
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
