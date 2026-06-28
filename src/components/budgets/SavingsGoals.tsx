import React, { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, PiggyBank, ArrowRight } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { Modal } from '../ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema } from '../../types';
import type { Goal, GoalInput } from '../../types';
import toast from 'react-hot-toast';

export const SavingsGoals: React.FC = () => {
  const { goals, addGoal, editGoal, deleteGoal, contributeToGoal, settings, transactions } = useFinance();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Contribution modal state
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  // Calculate current available balance to verify if contribution is valid
  const currentBalance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: '' as unknown as number,
      currentAmount: 0,
      targetDate: ''
    }
  });

  const onGoalSubmit = (data: GoalInput) => {
    if (editingGoal) {
      editGoal(editingGoal.id, data);
      setEditingGoal(null);
    } else {
      addGoal(data);
    }
    reset();
    setIsAddOpen(false);
  };

  const handleEditClick = (g: Goal) => {
    setEditingGoal(g);
    setValue('name', g.name);
    setValue('targetAmount', g.targetAmount);
    setValue('currentAmount', g.currentAmount);
    setValue('targetDate', g.targetDate);
    setIsAddOpen(true);
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;
    
    const amt = Number(contributeAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amt > currentBalance) {
      toast.error('Insufficient available balance to complete transfer');
      return;
    }

    contributeToGoal(contributeGoal.id, amt);
    setContributeAmount('');
    setContributeGoal(null);
  };

  return (
    <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Savings Goals
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Allocate funds from your balance to track savings targets.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            reset();
            setIsAddOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center text-center py-10">
            <p className="text-xs font-semibold text-slate-500">No savings goals created.</p>
            <p className="text-[10px] text-slate-400 max-w-[220px] mt-1">Define long-term purchase targets, wedding or vacation plans.</p>
          </div>
        ) : (
          goals.map((g) => {
            const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const isCompleted = g.currentAmount >= g.targetAmount;
            const targetDateFormatted = new Date(g.targetDate + 'T00:00:00').toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric'
            });

            return (
              <div 
                key={g.id}
                className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg/20 space-y-4"
              >
                {/* Meta details */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2.5 items-start">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      <PiggyBank className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {g.name}
                      </h4>
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        Target date: {targetDateFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(g)}
                      className="p-1 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>
                      {settings.currencySymbol}{g.currentAmount.toLocaleString()} of {settings.currencySymbol}{g.targetAmount.toLocaleString()}
                    </span>
                    <span className={isCompleted ? 'text-emerald-500 font-bold' : 'text-blue-500 font-bold'}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500 shadow-emerald-500/10' : 'bg-blue-600 shadow-blue-500/10'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Contribute trigger button */}
                {!isCompleted && (
                  <button
                    onClick={() => {
                      setContributeGoal(g);
                      setContributeAmount('');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-blue-500/20 dark:border-blue-500/10 bg-blue-500/[0.03] hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs cursor-pointer transition-colors"
                  >
                    <span>Contribute Funds</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {isCompleted && (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/[0.03] text-emerald-500 font-bold text-xs border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Goal Met Successfully</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Set Goal Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingGoal(null);
        }}
        title={editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
      >
        <form onSubmit={handleSubmit(onGoalSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Goal Name / Target Item
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency Fund, New Laptop"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
              }`}
              {...register('name')}
            />
            {errors.name && <span className="text-[11px] text-red-500 font-semibold">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Target Savings Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none ${
                  errors.targetAmount ? 'border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
                }`}
                {...register('targetAmount', { valueAsNumber: true })}
              />
              {errors.targetAmount && <span className="text-[11px] text-red-500 font-semibold">{errors.targetAmount.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Initial Savings Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none ${
                  errors.currentAmount ? 'border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
                }`}
                {...register('currentAmount', { valueAsNumber: true })}
              />
              {errors.currentAmount && <span className="text-[11px] text-red-500 font-semibold">{errors.currentAmount.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer ${
                errors.targetDate ? 'border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
              }`}
              {...register('targetDate')}
            />
            {errors.targetDate && <span className="text-[11px] text-red-500 font-semibold">{errors.targetDate.message}</span>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 font-semibold text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-md hover:shadow-lg"
            >
              {editingGoal ? 'Save Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribute Funds Modal */}
      <Modal
        isOpen={contributeGoal !== null}
        onClose={() => setContributeGoal(null)}
        title={contributeGoal ? `Allocate Funds: ${contributeGoal.name}` : 'Contribute Funds'}
      >
        <form onSubmit={handleContributeSubmit} className="space-y-4">
          <div className="p-3 bg-light-bg dark:bg-dark-bg/40 rounded-xl border border-light-border dark:border-dark-border text-xs space-y-1">
            <div className="flex justify-between font-semibold text-slate-500">
              <span>Your Available Balance:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {settings.currencySymbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-slate-500">
              <span>Goal Target Remaining:</span>
              <span className="font-bold text-blue-500">
                {settings.currencySymbol}{contributeGoal ? (contributeGoal.targetAmount - contributeGoal.currentAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Contribution Amount
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              max={currentBalance}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 font-semibold text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-md hover:shadow-lg"
            >
              Transfer Funds to Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
