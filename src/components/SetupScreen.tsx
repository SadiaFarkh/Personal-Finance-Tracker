import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Coins, User, DollarSign, ArrowRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee (₨)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar ($)' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar ($)' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar ($)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (د.إ)' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal (ر.س)' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan (¥)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar ($)' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (R$)' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso ($)' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira (₺)' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble (₽)' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won (₩)' },
  { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar ($)' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong (₫)' },
];

const setupSchema = z.object({
  userName: z.string().min(1, 'Display Name is required').max(50, 'Name is too long'),
  monthlyIncomeTarget: z.number().refine(val => !isNaN(val) && val > 0, 'Income target must be greater than zero'),
  currencyIndex: z.string().min(1, 'Currency selection is required'),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export const SetupScreen: React.FC = () => {
  const { updateSettings } = useFinance();
  const [avatar, setAvatar] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      userName: '',
      monthlyIncomeTarget: '' as unknown as number,
      currencyIndex: '0'
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 1MB to prevent localstorage overflow
      if (file.size > 1024 * 1024) {
        alert('File size exceeds 1MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: SetupFormValues) => {
    const selectedCurr = CURRENCIES[Number(data.currencyIndex)];
    updateSettings({
      userName: data.userName,
      currency: selectedCurr.code,
      currencySymbol: selectedCurr.symbol,
      monthlyIncomeTarget: data.monthlyIncomeTarget,
      avatar: avatar || undefined
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4 md:p-6 theme-transition overflow-hidden relative">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] p-6 md:p-8 rounded-3xl border theme-transition border-light-border dark:border-dark-border bg-light-surface/80 dark:bg-dark-surface/60 backdrop-blur-xl shadow-2xl relative z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 dark:bg-blue-500 text-white items-center justify-center shadow-lg shadow-blue-500/25">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome to Aura Finance
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Create your local account profile to initialize your wealth tracking dashboard. Your data is kept 100% private in browser local storage.
            </p>
          </div>
        </div>

        {/* Profile Setup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar Upload (Optional) */}
          <div className="flex flex-col items-center space-y-2 pb-2">
            <div className="relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                onChange={handleImageChange}
              />
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-light-border dark:border-dark-border group-hover:border-blue-500 overflow-hidden flex items-center justify-center bg-light-bg dark:bg-dark-bg/60 transition-colors relative z-10">
                {avatar ? (
                  <img src={avatar} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">
                    <Camera className="w-6 h-6 mx-auto mb-0.5" />
                    <span className="text-[9px] font-bold block leading-none">Photo</span>
                  </div>
                )}
              </div>
              {avatar && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAvatar('');
                  }}
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow z-30 text-xs font-bold"
                  title="Remove photo"
                >
                  ×
                </button>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              Profile Photo (Optional)
            </span>
          </div>

          {/* Display Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Your Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none ${
                  errors.userName ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
                }`}
                {...register('userName')}
              />
            </div>
            {errors.userName && <span className="text-[10px] text-red-500 font-semibold block">{errors.userName.message}</span>}
          </div>

          {/* Monthly Income Target */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Monthly Income Target
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number"
                placeholder="e.g. 5000"
                className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none ${
                  errors.monthlyIncomeTarget ? 'border-red-500 focus:border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
                }`}
                {...register('monthlyIncomeTarget', { valueAsNumber: true })}
              />
            </div>
            {errors.monthlyIncomeTarget && <span className="text-[10px] text-red-500 font-semibold block">{errors.monthlyIncomeTarget.message}</span>}
          </div>

          {/* Currency Select */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Select Currency
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none focus:border-blue-500"
              {...register('currencyIndex')}
            >
              {CURRENCIES.map((c, idx) => (
                <option key={c.code} value={idx}>{c.name}</option>
              ))}
            </select>
            {errors.currencyIndex && <span className="text-[10px] text-red-500 font-semibold block">{errors.currencyIndex.message}</span>}
          </div>

          {/* Setup CTA Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 font-bold text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-lg shadow-blue-500/20 mt-6"
          >
            <span>Initialize Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
