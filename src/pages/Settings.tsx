import React, { useState } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  DollarSign, 
  Trash2, 
  RotateCcw, 
  ShieldAlert, 
  Save,
  Download,
  Upload,
  Info,
  Coins,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

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

const settingsValidationSchema = z.object({
  userName: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  monthlyIncomeTarget: z.number().refine(val => !isNaN(val) && val > 0, 'Income target must be greater than zero'),
  currencyIndex: z.string().min(1, 'Currency is required'),
});

type SettingsFormValues = z.infer<typeof settingsValidationSchema>;

export const Settings: React.FC = () => {
  const { settings, updateSettings, resetToMockData, clearAllData } = useFinance();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [avatar, setAvatar] = useState<string>(settings.avatar || '');

  // Find index of current currency in CURRENCIES
  const defaultCurrencyIdx = CURRENCIES.findIndex(c => c.code === settings.currency) ?? 0;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsValidationSchema),
    defaultValues: {
      userName: settings.userName,
      monthlyIncomeTarget: settings.monthlyIncomeTarget,
      currencyIndex: String(defaultCurrencyIdx === -1 ? 0 : defaultCurrencyIdx)
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

  const onSettingsSubmit = (data: SettingsFormValues) => {
    const selectedCurrIdx = Number(data.currencyIndex);
    const selectedCurr = CURRENCIES[selectedCurrIdx];
    
    updateSettings({
      userName: data.userName,
      monthlyIncomeTarget: data.monthlyIncomeTarget,
      currency: selectedCurr.code,
      currencySymbol: selectedCurr.symbol,
      avatar: avatar || undefined
    });
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    setAvatar('');
  };

  const handleExportData = () => {
    try {
      const data = {
        transactions: localStorage.getItem('finance_transactions') ? JSON.parse(localStorage.getItem('finance_transactions')!) : [],
        budgets: localStorage.getItem('finance_budgets') ? JSON.parse(localStorage.getItem('finance_budgets')!) : [],
        goals: localStorage.getItem('finance_goals') ? JSON.parse(localStorage.getItem('finance_goals')!) : [],
        bills: localStorage.getItem('finance_bills') ? JSON.parse(localStorage.getItem('finance_bills')!) : [],
        categories: localStorage.getItem('finance_categories') ? JSON.parse(localStorage.getItem('finance_categories')!) : [],
        paymentMethods: localStorage.getItem('finance_payment_methods') ? JSON.parse(localStorage.getItem('finance_payment_methods')!) : [],
        settings: localStorage.getItem('finance_settings') ? JSON.parse(localStorage.getItem('finance_settings')!) : {}
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aura_finance_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Database backup exported successfully!');
    } catch (e) {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Validate structure roughly
        if (json.transactions && Array.isArray(json.transactions)) {
          localStorage.setItem('finance_transactions', JSON.stringify(json.transactions));
          if (json.budgets) localStorage.setItem('finance_budgets', JSON.stringify(json.budgets));
          if (json.goals) localStorage.setItem('finance_goals', JSON.stringify(json.goals));
          if (json.bills) localStorage.setItem('finance_bills', JSON.stringify(json.bills));
          if (json.categories) localStorage.setItem('finance_categories', JSON.stringify(json.categories));
          if (json.paymentMethods) localStorage.setItem('finance_payment_methods', JSON.stringify(json.paymentMethods));
          if (json.settings) localStorage.setItem('finance_settings', JSON.stringify(json.settings));
          
          toast.success('Database restored successfully! Reloading...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('Invalid backup file format: Missing transactions');
        }
      } catch (err) {
        toast.error('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
  };

  const isFormDirty = isDirty || avatar !== (settings.avatar || '');

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Global Preferences
        </h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          Configure profile metrics, select default regional currencies, and manage local storage databases.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Settings (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settings Form */}
          <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-light-border dark:border-dark-border pb-3">
              Profile Settings
            </h3>
            
            <form onSubmit={handleSubmit(onSettingsSubmit)} className="space-y-4">
              {/* Photo Upload (Optional) */}
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

              {/* User Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none ${
                      errors.userName ? 'border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
                    }`}
                    {...register('userName')}
                  />
                </div>
                {errors.userName && <span className="text-[11px] text-red-500 font-semibold mt-1 block">{errors.userName.message}</span>}
              </div>

              {/* Income Target */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Monthly Income Target
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none ${
                      errors.monthlyIncomeTarget ? 'border-red-500' : 'border-light-border dark:border-dark-border focus:border-blue-500'
                    }`}
                    {...register('monthlyIncomeTarget', { valueAsNumber: true })}
                  />
                </div>
                {errors.monthlyIncomeTarget && <span className="text-[11px] text-red-500 font-semibold mt-1 block">{errors.monthlyIncomeTarget.message}</span>}
              </div>

              {/* Currency Select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Currency (Region)
                </label>
                <select
                  className="w-full px-3 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-none focus:border-blue-500"
                  {...register('currencyIndex')}
                >
                  {CURRENCIES.map((c, idx) => (
                    <option key={c.code} value={idx}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormDirty}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 font-semibold text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50 transition-colors shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* About Section */}
          <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-light-border dark:border-dark-border pb-3 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-500" /> About Aura Finance
            </h3>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Aura Finance Wealth Analytics</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Version 1.0.0 (OLED Edition)</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Aura Finance is a premium SaaS-style wealth tracking portal running entirely on client-side state. It operates using standard browser local database sandboxes (LocalStorage) without external tracking, keeping your banking privacy completely secure.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['React 19', 'TypeScript', 'Tailwind CSS v4', 'Recharts', 'React Hook Form', 'Zod', 'Framer Motion'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-[9px] font-bold text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Management & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Backup & Restore */}
          <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-light-border dark:border-dark-border pb-3">
              Backup & Restore
            </h3>

            <div className="space-y-4 text-xs font-medium text-slate-500">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Export Ledger</span>
                <p className="text-[10px] leading-normal">
                  Download a complete backup JSON database file containing all transactions, budgets, goals, and configs.
                </p>
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg border border-light-border dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-surface-hover text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Backup (JSON)</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-light-border dark:border-dark-border">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Import Ledger</span>
                <p className="text-[10px] leading-normal">
                  Upload a previously exported JSON backup file to overwrite your current local tracker.
                </p>
                <label className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg border border-light-border dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-surface-hover text-slate-700 dark:text-slate-300 cursor-pointer transition-colors text-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Database Control */}
          <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-light-border dark:border-dark-border pb-3">
              Database Maintenance
            </h3>

            <div className="space-y-4">
              {/* Load Mock Data */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Reseed Database</span>
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                  Resets all local records and generates dynamic, rich finance mock entries.
                </p>
                <button
                  onClick={resetToMockData}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Mock Data</span>
                </button>
              </div>

              {/* Clear Database */}
              <div className="space-y-1 pt-2 border-t border-light-border dark:border-dark-border text-xs">
                <span className="font-bold text-red-500">Wipe Database</span>
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                  Permanently wipes all local transactions, budgets, goals, and customized category registers.
                </p>
                
                {showClearConfirm ? (
                  <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20 mt-2 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex gap-2 text-[10px] font-semibold text-red-500 items-start">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Warning: This cannot be undone. Are you absolutely sure?</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleClearData}
                        className="py-1 px-2 text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                      >
                        Yes, Wipe
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="py-1 px-2 text-[10px] font-bold border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-surface-hover"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Wipe All Data</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
