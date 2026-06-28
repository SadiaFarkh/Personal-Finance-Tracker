import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Plus 
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { Modal } from '../ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { billSchema } from '../../types';
import type { BillInput } from '../../types';

export const UpcomingBills: React.FC = () => {
  const { bills, payBill, deleteBill, addBill, settings, categories } = useFinance();
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BillInput>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      title: '',
      amount: '' as unknown as number,
      dueDate: '',
      category: ''
    }
  });

  const onAddBillSubmit = (data: BillInput) => {
    addBill(data);
    reset();
    setIsAddBillOpen(false);
  };

  // Sort bills: pending first, then overdue, then paid, then by due date
  const sortedBills = [...bills].sort((a, b) => {
    if (a.status === 'pending' && b.status === 'paid') return -1;
    if (a.status === 'paid' && b.status === 'pending') return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const todayStr = '2026-06-28';
  const today = new Date(todayStr + 'T00:00:00');

  const getBillStatus = (bill: typeof bills[0]) => {
    if (bill.status === 'paid') return { label: 'Paid', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    
    const dueDate = new Date(bill.dueDate + 'T00:00:00');
    if (dueDate < today) {
      return { label: 'Overdue', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    }
    
    return { label: 'Pending', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  };

  return (
    <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Upcoming Bills & Invoices
        </h3>
        <button
          onClick={() => setIsAddBillOpen(true)}
          className="p-1.5 rounded-lg border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-surface-hover cursor-pointer transition-colors"
          title="Schedule new bill reminder"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Bill List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
        {sortedBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500">No scheduled bills</p>
            <p className="text-[10px] text-slate-400 max-w-[180px]">Add your subscription renewal fees or utility bills.</p>
          </div>
        ) : (
          sortedBills.map((bill) => {
            const status = getBillStatus(bill);
            const isOverdue = status.label === 'Overdue';
            const isPaid = bill.status === 'paid';
            const dueDateFormatted = new Date(bill.dueDate + 'T00:00:00').toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div 
                key={bill.id}
                className={`p-3 rounded-xl border theme-transition flex items-center justify-between gap-3 ${
                  isOverdue 
                    ? 'border-red-500/20 bg-red-500/[0.02]' 
                    : 'border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg/30'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isPaid ? 'bg-emerald-500/10 text-emerald-500' : isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                      {bill.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      <span>Due: {dueDateFormatted}</span>
                      <span>•</span>
                      <span className="truncate">{bill.category}</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Price */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {settings.currencySymbol}{bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isPaid && (
                      <button
                        onClick={() => payBill(bill.id)}
                        className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors"
                        title="Mark as paid (deducts balance)"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                      title="Delete bill reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Bill Modal */}
      <Modal
        isOpen={isAddBillOpen}
        onClose={() => setIsAddBillOpen(false)}
        title="Schedule Upcoming Bill"
      >
        <form onSubmit={handleSubmit(onAddBillSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Bill / Subscription Title
            </label>
            <input
              type="text"
              placeholder="e.g. Adobe Creative Cloud, Gas Bill"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none ${
                errors.title ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
              }`}
              {...register('title')}
            />
            {errors.title && <span className="text-[11px] text-red-500 font-semibold">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none ${
                  errors.amount ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
                }`}
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && <span className="text-[11px] text-red-500 font-semibold">{errors.amount.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer ${
                  errors.dueDate ? 'border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
                }`}
                {...register('dueDate')}
              />
              {errors.dueDate && <span className="text-[11px] text-red-500 font-semibold">{errors.dueDate.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-light-surface dark:bg-dark-surface text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer ${
                errors.category ? 'border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
              }`}
              {...register('category')}
            >
              <option value="" disabled>-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="text-[11px] text-red-500 font-semibold">{errors.category.message}</span>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 font-semibold text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-md hover:shadow-lg"
            >
              Schedule Bill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
