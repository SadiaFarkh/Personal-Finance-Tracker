import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import type { Budget, BudgetInput } from '../../types';
import { budgetSchema } from '../../types';
import { Modal } from '../ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const BudgetTracker: React.FC = () => {
  const { budgets, transactions, addBudget, editBudget, deleteBudget, settings, categories } = useFinance();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: '',
      limit: '' as unknown as number
    }
  });

  const onBudgetSubmit = (data: BudgetInput) => {
    if (editingBudget) {
      editBudget(editingBudget.id, data.limit);
      setEditingBudget(null);
    } else {
      addBudget(data.category, data.limit);
    }
    reset();
    setIsAddOpen(false);
  };

  const handleEditClick = (b: Budget) => {
    setEditingBudget(b);
    setValue('category', b.category);
    setValue('limit', b.limit);
    setIsAddOpen(true);
  };

  // Group current month spending by category
  const monthlySpendingByCategory = useMemo(() => {
    const spending: { [key: string]: number } = {};
    const now = new Date(2026, 5, 28);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const txDate = new Date(tx.date + 'T00:00:00');
        if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
          spending[tx.category] = (spending[tx.category] || 0) + tx.amount;
        }
      }
    });
    return spending;
  }, [transactions]);

  return (
    <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Monthly Category Budgets
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Set and track spending limits for the current calendar month.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBudget(null);
            reset();
            setIsAddOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Budgets Progress List */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <p className="text-xs font-semibold text-slate-500">No active category budgets configured.</p>
            <p className="text-[10px] text-slate-400 max-w-[220px] mt-1">Set monthly thresholds to avoid overspending on your categories.</p>
          </div>
        ) : (
          budgets.map((b) => {
            const spent = monthlySpendingByCategory[b.category] || 0;
            const percentage = Math.min(100, Math.round((spent / b.limit) * 100));
            const isOver = spent > b.limit;
            
            // Color scheme based on percentage
            let barColor = 'bg-emerald-500 shadow-emerald-500/10';
            let textColor = 'text-emerald-500';
            if (percentage >= 80 && percentage < 100) {
              barColor = 'bg-amber-500 shadow-amber-500/10';
              textColor = 'text-amber-500';
            } else if (isOver) {
              barColor = 'bg-red-500 shadow-red-500/10';
              textColor = 'text-red-500';
            }

            return (
              <div 
                key={b.id}
                className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg/20 space-y-3"
              >
                {/* Meta details */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {b.category}
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      Spent {settings.currencySymbol}{spent.toLocaleString(undefined, { minimumFractionDigits: 2 })} of {settings.currencySymbol}{b.limit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  
                  {/* Indicators & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-xs font-extrabold ${textColor}`}>
                        {percentage}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(b)}
                        className="p-1 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors"
                        title="Edit limit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBudget(b.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                        title="Delete budget limit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  {/* Status Tip */}
                  <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                    {isOver ? (
                      <span className="text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Over Budget by {settings.currencySymbol}{(spent - b.limit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    ) : percentage >= 80 ? (
                      <span className="text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Approaching threshold limit
                      </span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Under Budget threshold
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Set Budget Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingBudget(null);
        }}
        title={editingBudget ? 'Edit Monthly Budget' : 'Set Category Budget'}
      >
        <form onSubmit={handleSubmit(onBudgetSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-light-surface dark:bg-dark-surface text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none ${
                editingBudget ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              disabled={!!editingBudget}
              {...register('category')}
            >
              <option value="" disabled>-- Select Category --</option>
              {categories
                // Filter out categories that already have budgets (if not editing)
                .filter(cat => editingBudget || !budgets.some(b => b.category === cat))
                .map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              }
            </select>
            {errors.category && <span className="text-[11px] text-red-500 font-semibold">{errors.category.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Monthly Limit Amount
            </label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              {...register('limit', { valueAsNumber: true })}
            />
            {errors.limit && <span className="text-[11px] text-red-500 font-semibold">{errors.limit.message}</span>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 font-semibold text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-md hover:shadow-lg"
            >
              {editingBudget ? 'Save Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
