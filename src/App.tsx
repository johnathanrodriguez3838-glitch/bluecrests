/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import TransferPage from './components/TransferPage';
import CardsPage from './components/CardsPage';
import NotificationsPage from './components/NotificationsPage';
import SummaryPage from './components/SummaryPage';
import StocksPage from './components/StocksPage';
import LoginPage from './components/LoginPage';
import { RestrictedModal, SelectTransferTypeModal, TransferSuccessModal, TransferCodeModal } from './components/Modals';
import { motion, AnimatePresence } from 'motion/react';
import { USER_DATA, TRANSACTIONS, PROFILE_IMAGE } from './constants';
import { cn } from './lib/utils';
import { FileText, User as UserIcon, CreditCard, Bell, History, Shield, Key } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRestrictedModalOpen, setIsRestrictedModalOpen] = useState(false);
  const [isSelectTypeModalOpen, setIsSelectTypeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isTransferCodeModalOpen, setIsTransferCodeModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [balance, setBalance] = useState(USER_DATA.balance);
  const [transferCount, setTransferCount] = useState(0);
  const [lastTransfer, setLastTransfer] = useState<{ amount: number; recipientName: string; bankName: string; accountNumber: string } | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<{
    txnId: string;
    amount: number;
    recipientName: string;
    bankName: string;
    accountNumber: string;
  } | null>(null);

  const handleVerifyTransferCode = useCallback(() => {
    if (!pendingTransfer) return;

    // Increment count of completed/initiated transfers
    setTransferCount(prev => prev + 1);

    // Deduct standard balance
    setBalance(prev => Math.max(0, prev - pendingTransfer.amount));

    // Update pending transaction state in history to Pending
    setTransactions(prev => prev.map(t => 
      t.id === pendingTransfer.txnId ? { ...t, status: 'Pending' as const } : t
    ));

    // Store details for success modal display
    setLastTransfer({
      amount: pendingTransfer.amount,
      recipientName: pendingTransfer.recipientName,
      bankName: pendingTransfer.bankName,
      accountNumber: pendingTransfer.accountNumber
    });

    setIsTransferCodeModalOpen(false);
    setIsSuccessModalOpen(true);
  }, [pendingTransfer]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleActionClick = (id: string) => {
    const routingMap: Record<string, string> = {
      'transfer': 'show-modal',
      'intl-transfer': 'intl-transfer',
      'local-transfer': 'local-transfer',
      'history': 'history',
      'card': 'atm',
      'atm': 'atm',
      'account': 'details',
      'details': 'details',
      'stocks': 'stocks',
    };

    if (id === 'transfer') {
      setIsSelectTypeModalOpen(true);
    } else if (id === 'logout') {
      handleLogout();
    } else if (routingMap[id]) {
      setActiveTab(routingMap[id]);
    }
  };

  const handleTransferTypeSelect = (type: string) => {
    setIsSelectTypeModalOpen(false);
    setActiveTab(type === 'local' ? 'local-transfer' : 'intl-transfer');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onActionClick={handleActionClick} balance={balance} transactions={transactions} />;
      case 'local-transfer':
      case 'intl-transfer':
        return (
          <TransferPage 
            availableBalance={balance} 
            onTransferSubmit={(data) => {
              if (transferCount >= 3) {
                // 4th and beyond is restricted
                setIsRestrictedModalOpen(true);
              } else {
                // Submit step, initially showing "Pending"
                const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
                const newTxn = {
                  id: txnId,
                  name: data.recipientName,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                  amount: data.amount,
                  type: 'debit' as const,
                  status: 'Pending' as const,
                  category: data.description || 'Fund Transfer'
                };

                // Add to history in 'Pending' status
                setTransactions(prev => [newTxn, ...prev]);

                // Store details for verification
                setPendingTransfer({
                  txnId,
                  amount: data.amount,
                  recipientName: data.recipientName,
                  bankName: data.bankName,
                  accountNumber: data.accountNumber
                });

                // Open transfer authorization pin code modal
                setIsTransferCodeModalOpen(true);
              }
            }} 
          />
        );
      case 'details':
        return (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-brand-blue-dark mb-8 tracking-tight">Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {[
                { label: 'Full Name', value: `${USER_DATA.surname} ${USER_DATA.middleName} ${USER_DATA.lastName}` },
                { label: 'Account Number', value: USER_DATA.accountNumber },
                { label: 'Status', value: 'Verified (Level 3)', color: 'text-emerald-500' },
                { label: 'Date of Birth', value: USER_DATA.dob },
                { label: 'Phone Number', value: USER_DATA.phone },
                { label: 'Email Address', value: USER_DATA.email },
                { label: 'Country', value: USER_DATA.country },
                { label: 'Occupation', value: USER_DATA.occupation },
                { label: 'Home Address', value: USER_DATA.address, full: true },
              ].map((item) => (
                <div key={item.label} className={item.full ? 'md:col-span-2' : ''}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className={item.color || "text-base font-bold text-slate-900"}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transaction History</h2>
              <button className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                Download Statement
              </button>
            </div>
            <div className="overflow-x-auto -mx-6 md:mx-0">
              <div className="min-w-[800px] px-6 md:px-0">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100 italic">
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Transaction ID</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-5 pl-2">
                          <p className="text-[11px] font-mono font-bold text-slate-400">#{trx.id}</p>
                        </td>
                        <td className="py-5">
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">{trx.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{trx.category}</p>
                          </div>
                        </td>
                        <td className="py-5">
                          <p className="text-[11px] font-bold text-slate-500">{trx.date}</p>
                        </td>
                        <td className="py-5">
                          <span className={cn(
                            "px-3 py-1 text-[9px] font-bold rounded-full uppercase tracking-widest",
                            trx.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {trx.status}
                          </span>
                        </td>
                        <td className="py-5 text-right pr-2">
                          <p className={cn(
                            "text-sm font-bold",
                            trx.type === 'credit' ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {trx.type === 'credit' ? '+' : '-'}${trx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'summary':
        return <SummaryPage />;
      case 'atm':
        return <CardsPage />;
      case 'stocks':
        return <StocksPage />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6 font-bold">
              ?
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Section Under Maintenance</h2>
            <p className="text-sm text-slate-500 max-w-xs">This feature is temporarily unavailable while we upgrade our systems.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-light">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <RestrictedModal 
        isOpen={isRestrictedModalOpen} 
        onClose={() => setIsRestrictedModalOpen(false)} 
      />
      
      <SelectTransferTypeModal 
        isOpen={isSelectTypeModalOpen} 
        onClose={() => setIsSelectTypeModalOpen(false)}
        onSelect={handleTransferTypeSelect}
      />

      <TransferSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setActiveTab('dashboard');
        }}
        amount={lastTransfer?.amount || 0}
        recipientName={lastTransfer?.recipientName || ''}
        bankName={lastTransfer?.bankName || ''}
        accountNumber={lastTransfer?.accountNumber || ''}
      />

      <TransferCodeModal
        isOpen={isTransferCodeModalOpen}
        onClose={() => setIsTransferCodeModalOpen(false)}
        onVerify={handleVerifyTransferCode}
        amount={pendingTransfer?.amount || 0}
      />
    </div>
  );
}

