import React, { useState, useEffect } from 'react';
import { Search, X, DollarSign } from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';

export const TransactionFilters: React.FC = () => {
  const { filters, setFilters, categories, paymentMethods } = useFinance();
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery: localSearch }));
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [localSearch, setFilters]);

  // Sync local search with external filter changes (e.g. reset)
  useEffect(() => {
    setLocalSearch(filters.searchQuery);
  }, [filters.searchQuery]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      paymentMethod: 'all',
      type: 'all',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
    setLocalSearch('');
  };

  const isFiltered = 
    filters.searchQuery !== '' ||
    filters.category !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.type !== 'all' ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '' ||
    filters.startDate !== '' ||
    filters.endDate !== '';

  return (
    <div className="p-5 rounded-2xl border theme-transition border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
      {/* Top Search & Reset Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions by title or payee..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border bg-transparent text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none theme-transition"
          />
        </div>
        
        {/* Reset Buttons */}
        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Advanced Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-light-border dark:border-dark-border">
        {/* Type Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Payment Method
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="all">All Methods</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-2 py-1 text-[11px] rounded-lg border border-light-border dark:border-dark-border bg-transparent text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-2 py-1 text-[11px] rounded-lg border border-light-border dark:border-dark-border bg-transparent text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Amount Range Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Min Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2 w-3 h-3 text-slate-400" />
              <input
                type="number"
                placeholder="Min"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="w-full pl-6 pr-2 py-1 text-xs rounded-lg border border-light-border dark:border-dark-border bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Max Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2 w-3 h-3 text-slate-400" />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="w-full pl-6 pr-2 py-1 text-xs rounded-lg border border-light-border dark:border-dark-border bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
