import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Copy, 
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

interface TransactionListTableProps {
  onEditClick: (tx: Transaction) => void;
}

export const TransactionListTable: React.FC<TransactionListTableProps> = ({ onEditClick }) => {
  const { 
    transactions, 
    filters, 
    sorting, 
    setSorting, 
    duplicateTransaction, 
    deleteTransaction, 
    settings 
  } = useFinance();
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Filter Transactions
  const filteredTxs = useMemo(() => {
    return transactions.filter(tx => {
      // Search Title or Notes
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesNotes = tx.notes?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNotes) return false;
      }
      
      // Type Filter
      if (filters.type !== 'all' && tx.type !== filters.type) return false;
      
      // Category Filter
      if (filters.category !== 'all' && tx.category !== filters.category) return false;
      
      // Payment Method Filter
      if (filters.paymentMethod !== 'all' && tx.paymentMethod !== filters.paymentMethod) return false;
      
      // Min Amount Filter
      if (filters.minAmount && tx.amount < Number(filters.minAmount)) return false;
      
      // Max Amount Filter
      if (filters.maxAmount && tx.amount > Number(filters.maxAmount)) return false;
      
      // Start Date Filter
      if (filters.startDate && new Date(tx.date + 'T00:00:00') < new Date(filters.startDate + 'T00:00:00')) return false;
      
      // End Date Filter
      if (filters.endDate && new Date(tx.date + 'T00:00:00') > new Date(filters.endDate + 'T00:00:00')) return false;
      
      return true;
    });
  }, [transactions, filters]);

  // 2. Sort Transactions
  const sortedTxs = useMemo(() => {
    return [...filteredTxs].sort((a, b) => {
      const field = sorting.field;
      const order = sorting.order === 'asc' ? 1 : -1;
      
      if (field === 'amount') {
        return (a.amount - b.amount) * order;
      }
      
      if (field === 'date') {
        const timeA = new Date(`${a.date}T${a.time}`).getTime();
        const timeB = new Date(`${b.date}T${b.time}`).getTime();
        return (timeA - timeB) * order;
      }
      
      // Default alphabetical
      const valA = String(a[field]).toLowerCase();
      const valB = String(b[field]).toLowerCase();
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });
  }, [filteredTxs, sorting]);

  // 3. Paginated Transactions
  const paginatedTxs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedTxs.slice(start, start + itemsPerPage);
  }, [sortedTxs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sortedTxs.length / itemsPerPage));

  // Reset page when filtering
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleSort = (field: typeof sorting.field) => {
    setSorting(prev => {
      if (prev.field === field) {
        return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { field, order: 'desc' };
    });
  };

  const SortIndicator = ({ field }: { field: typeof sorting.field }) => {
    if (sorting.field !== field) return null;
    return sorting.order === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 ml-1 inline text-blue-500" /> 
      : <ChevronDown className="w-3.5 h-3.5 ml-1 inline text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border bg-light-bg/40 dark:bg-dark-bg/10">
              <th 
                onClick={() => handleSort('title')}
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none"
              >
                Title / Payee <SortIndicator field="title" />
              </th>
              <th 
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none"
              >
                Category
              </th>
              <th 
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none"
              >
                Payment Method
              </th>
              <th 
                onClick={() => handleSort('date')}
                className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none"
              >
                Date <SortIndicator field="date" />
              </th>
              <th 
                onClick={() => handleSort('amount')}
                className="px-6 py-4.5 text-right text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none"
              >
                Amount <SortIndicator field="amount" />
              </th>
              <th className="px-6 py-4.5 text-right text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border text-xs">
            {paginatedTxs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold">
                  No transactions match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedTxs.map((tx) => {
                const isIncome = tx.type === 'income';
                const dateObj = new Date(tx.date + 'T00:00:00');
                const dateStr = dateObj.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <tr 
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-light-bg/40 dark:hover:bg-dark-surface-hover/30 cursor-pointer group transition-colors"
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md ${
                          isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        </div>
                        <span>{tx.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-slate-500 dark:text-slate-400">
                      {tx.category}
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-slate-500 dark:text-slate-400">
                      {tx.paymentMethod}
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-slate-500 dark:text-slate-400">
                      {dateStr}
                    </td>
                    <td className={`px-6 py-4.5 text-right font-extrabold ${
                      isIncome ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {isIncome ? '+' : '-'}{settings.currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-dark-surface-hover text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditClick(tx)}
                          className="p-1.5 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateTransaction(tx.id)}
                          className="p-1.5 rounded hover:bg-purple-500/10 text-slate-400 hover:text-purple-500 cursor-pointer transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {sortedTxs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
          <span>
            Showing {Math.min(sortedTxs.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
            {Math.min(sortedTxs.length, currentPage * itemsPerPage)} of {sortedTxs.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-surface-hover transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow'
                    : 'border border-light-border dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-surface-hover text-slate-600 dark:text-slate-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-surface-hover transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
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
