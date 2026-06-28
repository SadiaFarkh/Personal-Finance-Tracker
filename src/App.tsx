import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FinanceProvider, useFinance } from './hooks/useFinance';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Modal } from './components/ui/Modal';
import { TransactionForm } from './components/transactions/TransactionForm';
import type { Transaction } from './types';
import { SetupScreen } from './components/SetupScreen';

// Lazy load pages for performance optimization
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-zinc-700 border-t-blue-600 dark:border-t-blue-500 animate-spin" />
  </div>
);

const AppContent: React.FC = () => {
  const { theme, settings } = useFinance();
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const handleAddClick = () => {
    setEditTx(null);
    setIsTxModalOpen(true);
  };

  const handleEditClick = (tx: Transaction) => {
    setEditTx(tx);
    setIsTxModalOpen(true);
  };

  if (!settings.userName) {
    return <SetupScreen />;
  }

  return (
    <div className="min-h-screen flex bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-100 theme-transition">
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Sticky Header Navbar */}
        <Navbar onAddTransactionClick={handleAddClick} />

        {/* Dynamic Page Router Wrapper */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto animate-in fade-in duration-300">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard onEditClick={handleEditClick} />} />
              <Route path="/transactions" element={<Transactions onEditClick={handleEditClick} />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Global Transaction Modal */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditTx(null);
        }}
        title={editTx ? 'Edit Transaction Entry' : 'Create Transaction Entry'}
      >
        <TransactionForm
          editingTransaction={editTx}
          onSuccess={() => {
            setIsTxModalOpen(false);
            setEditTx(null);
          }}
        />
      </Modal>

      {/* Premium Notification Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'theme-transition font-sans font-semibold text-xs rounded-xl shadow-lg border border-light-border dark:border-dark-border',
          style: {
            background: theme === 'dark' ? '#18181b' : '#ffffff',
            color: theme === 'dark' ? '#f4f4f5' : '#18181b',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </FinanceProvider>
  );
}
