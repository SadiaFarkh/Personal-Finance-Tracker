import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  PieChart, 
  Target, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Wallet,
  Coins
} from 'lucide-react';
import { useFinance } from '../hooks/useFinance';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { theme, setTheme, settings, transactions } = useFinance();

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

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 hidden md:flex flex-col border-r theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface z-30">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            Aura Finance
          </h1>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">
            OLED Pro Edition
          </span>
        </div>
      </div>

      {/* Wallet Summary */}
      <div className="p-4 mx-4 my-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg/50">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
          <Wallet className="w-3.5 h-3.5" />
          <span>Available Balance</span>
        </div>
        <p className={`text-lg font-bold tracking-tight ${totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {settings.currencySymbol}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:shadow-blue-600/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-dark-surface-hover'
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle & Profile */}
      <div className="p-4 border-t border-light-border dark:border-dark-border space-y-4">
        {/* Theme Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold rounded-lg border border-light-border dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-surface-hover text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-500" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            Theme: {theme === 'dark' ? 'OLED Dark' : 'Light Mode'}
          </span>
          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Toggle</span>
        </button>

        {/* User Profile Card */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-light-border dark:border-dark-border text-blue-600 dark:text-blue-400 font-bold shrink-0">
            {settings.avatar ? (
              <img src={settings.avatar} alt={settings.userName} className="w-full h-full object-cover" />
            ) : (
              settings.userName.split(' ').map(n => n[0]).join('').toUpperCase()
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100 leading-tight">
              {settings.userName}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Pro Account
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
