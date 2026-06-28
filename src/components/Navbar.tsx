import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  PlusCircle, 
  Coins, 
  LayoutDashboard, 
  ArrowUpDown, 
  Target, 
  PieChart, 
  Settings as SettingsIcon,
  Sun,
  Moon,
  Wallet
} from 'lucide-react';
import { useFinance } from '../hooks/useFinance';

interface NavbarProps {
  onAddTransactionClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddTransactionClick }) => {
  const location = useLocation();
  const { settings, theme, setTheme, transactions } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/transactions':
        return 'Transactions Ledger';
      case '/budgets':
        return 'Budgets & Financial Goals';
      case '/analytics':
        return 'Insights & Deep Analytics';
      case '/settings':
        return 'Global Settings';
      default:
        return 'Aura Finance';
    }
  };

  const totalBalance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowUpDown },
    { name: 'Budgets & Goals', path: '/budgets', icon: Target },
    { name: 'Analytics & Insights', path: '/analytics', icon: PieChart },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      <header className="h-16 sticky top-0 flex items-center justify-between px-6 border-b theme-transition border-light-border dark:border-dark-border bg-light-surface/90 dark:bg-dark-surface/90 backdrop-blur-md z-20 w-full md:pl-70">
        {/* Page Title for Desktop */}
        <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white hidden md:block">
          {getPageTitle()}
        </h2>

        {/* Mobile Logo & Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-blue-600" />
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              Aura
            </h1>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onAddTransactionClick}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 cursor-pointer transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex justify-start">
          <div className="w-72 h-full bg-light-surface dark:bg-dark-surface p-6 border-r border-light-border dark:border-dark-border flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-light-border dark:border-dark-border mb-6">
                <div className="flex items-center gap-3">
                  <Coins className="w-6 h-6 text-blue-600" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Aura Finance</h2>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Mobile Mode</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-light-border dark:border-dark-border text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet Summary */}
              <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg/50 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Available Balance</span>
                </div>
                <p className={`text-lg font-bold ${totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {settings.currencySymbol}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-surface-hover dark:hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4.5 h-4.5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer section inside drawer */}
            <div className="space-y-4 pt-6 border-t border-light-border dark:border-dark-border">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold rounded-lg border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-500" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  Theme: {theme === 'dark' ? 'OLED Dark' : 'Light Mode'}
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-600">Toggle</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-light-border dark:border-dark-border text-blue-600 dark:text-blue-400 font-bold shrink-0">
                  {settings.avatar ? (
                    <img src={settings.avatar} alt={settings.userName} className="w-full h-full object-cover" />
                  ) : (
                    settings.userName.split(' ').map(n => n[0]).join('').toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{settings.userName}</h4>
                  <span className="text-xs text-slate-500">Pro Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
