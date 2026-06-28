import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Check, Loader2 } from 'lucide-react';
import { transactionSchema } from '../../types';
import type { TransactionInput, Transaction } from '../../types';
import { useFinance } from '../../hooks/useFinance';

interface TransactionFormProps {
  editingTransaction?: Transaction | null;
  onSuccess: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  editingTransaction, 
  onSuccess 
}) => {
  const { 
    categories, 
    paymentMethods, 
    addTransaction, 
    editTransaction, 
    addCategory, 
    addPaymentMethod 
  } = useFinance();
  
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  
  // Custom Category and Payment Method input toggles
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [customCatVal, setCustomCatVal] = useState('');
  const [showCustomPay, setShowCustomPay] = useState(false);
  const [customPayVal, setCustomPayVal] = useState('');

  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: '',
      amount: '' as unknown as number,
      type: 'expense',
      category: '',
      paymentMethod: '',
      date: currentDate,
      time: currentTime,
      notes: ''
    }
  });

  // If in edit mode, populate data
  useEffect(() => {
    if (editingTransaction) {
      setTxType(editingTransaction.type);
      reset({
        title: editingTransaction.title,
        amount: editingTransaction.amount,
        type: editingTransaction.type,
        category: editingTransaction.category,
        paymentMethod: editingTransaction.paymentMethod,
        date: editingTransaction.date,
        time: editingTransaction.time,
        notes: editingTransaction.notes || ''
      });
    } else {
      setTxType('expense');
      reset({
        title: '',
        amount: '' as unknown as number,
        type: 'expense',
        category: '',
        paymentMethod: '',
        date: currentDate,
        time: currentTime,
        notes: ''
      });
    }
  }, [editingTransaction, reset, currentDate, currentTime]);

  const handleTypeChange = (type: 'income' | 'expense') => {
    setTxType(type);
    setValue('type', type);
    // Reset category when type changes to avoid cross-contamination
    setValue('category', '');
  };

  const onFormSubmit = (data: TransactionInput) => {
    if (editingTransaction) {
      editTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }
    reset();
    onSuccess();
  };

  const handleAddCustomCategory = () => {
    if (!customCatVal.trim()) return;
    const added = addCategory(customCatVal.trim());
    if (added) {
      setValue('category', customCatVal.trim());
      setCustomCatVal('');
      setShowCustomCat(false);
    }
  };

  const handleAddCustomPaymentMethod = () => {
    if (!customPayVal.trim()) return;
    const added = addPaymentMethod(customPayVal.trim());
    if (added) {
      setValue('paymentMethod', customPayVal.trim());
      setCustomPayVal('');
      setShowCustomPay(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Type Toggle Tabs */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg/40">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
              txType === 'expense'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/10'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
              txType === 'income'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Title / Payee
        </label>
        <input
          id="title"
          type="text"
          placeholder="e.g. Whole Foods, Monthly Salary"
          className={`w-full px-3 py-2 text-sm rounded-lg border theme-transition bg-transparent text-slate-900 dark:text-slate-100 ${
            errors.title 
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none' 
              : 'border-light-border dark:border-dark-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          }`}
          {...register('title')}
        />
        {errors.title && (
          <span className="text-[11px] text-red-500 mt-1 block font-semibold">{errors.title.message}</span>
        )}
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Amount
        </label>
        <div className="relative">
          <input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            className={`w-full px-3 py-2 text-sm rounded-lg border theme-transition bg-transparent text-slate-900 dark:text-slate-100 ${
              errors.amount 
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none' 
                : 'border-light-border dark:border-dark-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
            }`}
            {...register('amount', { valueAsNumber: true })}
          />
        </div>
        {errors.amount && (
          <span className="text-[11px] text-red-500 mt-1 block font-semibold">{errors.amount.message}</span>
        )}
      </div>

      {/* Category Dropdown & Custom Option */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Category
          </label>
          <button
            type="button"
            onClick={() => setShowCustomCat(!showCustomCat)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showCustomCat ? 'Cancel' : 'New Custom'}</span>
          </button>
        </div>

        {showCustomCat ? (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <input
              type="text"
              placeholder="Custom Category name"
              value={customCatVal}
              onChange={(e) => setCustomCatVal(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border bg-transparent text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomCategory}
              className="px-3 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white flex items-center justify-center cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <select
            id="category"
            className={`w-full px-3 py-2 text-sm rounded-lg border theme-transition bg-light-surface dark:bg-dark-surface text-slate-900 dark:text-slate-100 cursor-pointer ${
              errors.category 
                ? 'border-red-500 focus:border-red-500 focus:outline-none' 
                : 'border-light-border dark:border-dark-border focus:border-blue-500 focus:outline-none'
            }`}
            {...register('category')}
          >
            <option value="" disabled>-- Select Category --</option>
            {categories
              .filter(cat => {
                const lowerCat = cat.toLowerCase();
                // Filter salary/investments/freelance for income, others for expense, roughly
                if (txType === 'income') {
                  return lowerCat.includes('salary') || lowerCat.includes('freelance') || lowerCat.includes('investment') || lowerCat.includes('refund') || lowerCat.includes('bonus');
                } else {
                  return !(lowerCat.includes('salary') || lowerCat.includes('freelance') || lowerCat.includes('bonus'));
                }
              })
              .map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))
            }
            {/* Fallback show all if the selection gets messed up */}
            <option disabled className="text-slate-400">--- All Categories ---</option>
            {categories.map((cat) => (
              <option key={`all-${cat}`} value={cat}>{cat}</option>
            ))}
          </select>
        )}
        {errors.category && (
          <span className="text-[11px] text-red-500 mt-1 block font-semibold">{errors.category.message}</span>
        )}
      </div>

      {/* Payment Method Dropdown & Custom Option */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="paymentMethod" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Payment Method
          </label>
          <button
            type="button"
            onClick={() => setShowCustomPay(!showCustomPay)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showCustomPay ? 'Cancel' : 'New Custom'}</span>
          </button>
        </div>

        {showCustomPay ? (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <input
              type="text"
              placeholder="Custom Method name"
              value={customPayVal}
              onChange={(e) => setCustomPayVal(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border bg-transparent text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomPaymentMethod}
              className="px-3 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white flex items-center justify-center cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <select
            id="paymentMethod"
            className={`w-full px-3 py-2 text-sm rounded-lg border theme-transition bg-light-surface dark:bg-dark-surface text-slate-900 dark:text-slate-100 cursor-pointer ${
              errors.paymentMethod 
                ? 'border-red-500 focus:border-red-500 focus:outline-none' 
                : 'border-light-border dark:border-dark-border focus:border-blue-500 focus:outline-none'
            }`}
            {...register('paymentMethod')}
          >
            <option value="" disabled>-- Select Payment Method --</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        )}
        {errors.paymentMethod && (
          <span className="text-[11px] text-red-500 mt-1 block font-semibold">{errors.paymentMethod.message}</span>
        )}
      </div>

      {/* Date & Time Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            className={`w-full px-3 py-2 text-sm rounded-lg border theme-transition bg-transparent text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-1 ${
              errors.date ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500 focus:ring-blue-500'
            }`}
            {...register('date')}
          />
          {errors.date && (
            <span className="text-[11px] text-red-500 mt-1 block font-semibold">{errors.date.message}</span>
          )}
        </div>
        <div>
          <label htmlFor="time" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Time
          </label>
          <input
            id="time"
            type="time"
            className={`w-full px-3 py-2 text-sm rounded-lg border theme-transition bg-transparent text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-1 ${
              errors.time ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500 focus:ring-blue-500'
            }`}
            {...register('time')}
          />
          {errors.time && (
            <span className="text-[11px] text-red-500 mt-1 block font-semibold">{errors.time.message}</span>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          rows={2}
          placeholder="Add transaction remarks, receipt numbers or tags..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border theme-transition bg-transparent text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
          {...register('notes')}
        />
        {errors.notes && (
          <span className="text-[11px] text-red-500 mt-1 block font-semibold">{errors.notes.message}</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{editingTransaction ? 'Save Changes' : 'Add Transaction'}</span>
          )}
        </button>
      </div>
    </form>
  );
};
