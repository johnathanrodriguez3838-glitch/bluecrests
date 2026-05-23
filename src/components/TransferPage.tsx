import React, { useState } from 'react';
import { Send, User, Building2, CreditCard, FileText, Globe, Hash } from 'lucide-react';

interface TransferSubmitData {
  recipientName: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  amount: number;
  description: string;
}

export default function TransferPage({ 
  onTransferSubmit,
  availableBalance
}: { 
  onTransferSubmit: (data: TransferSubmitData) => void;
  availableBalance: number;
}) {
  const [transferType, setTransferType] = useState<'local' | 'intl'>('local');
  const [recipientName, setRecipientName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTransferSubmit({
      recipientName: recipientName || 'Unspecified Recipient',
      bankName,
      accountNumber,
      routingNumber: routingNumber || undefined,
      amount: parseFloat(amount) || 0,
      description: description || 'Fund Transfer'
    });
    
    // Clear form
    setRecipientName('');
    setBankName('');
    setAccountNumber('');
    setRoutingNumber('');
    setAmount('');
    setDescription('');
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {transferType === 'local' ? <Send className="w-5 h-5 text-brand-primary" /> : <Globe className="w-5 h-5 text-brand-primary" />}
            {transferType === 'local' ? 'Fund Transfer' : 'International Transfer'}
          </h2>
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 w-full sm:w-auto">
            <button 
              onClick={() => setTransferType('local')}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${transferType === 'local' ? 'bg-white text-[#003399]" shadow-sm' : 'text-slate-400'}`}
            >
              Local
            </button>
            <button 
              onClick={() => setTransferType('intl')}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${transferType === 'intl' ? 'bg-white text-[#003399]" shadow-sm' : 'text-slate-400'}`}
            >
              International
            </button>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recipient Account Holder Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. John Doe" 
                  className="w-full h-14 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-100 rounded-2xl pl-12 pr-4 text-sm font-semibold outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recipient Bank Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Chase Bank" 
                  className="w-full h-14 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-100 rounded-2xl pl-12 pr-4 text-sm font-semibold outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recipient Account Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Account Number"
                  className="w-full h-14 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-100 rounded-2xl pl-12 pr-4 text-sm font-semibold outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Routing Number (Optional)</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="9-digit routing number (optional)" 
                  className="w-full h-14 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-100 rounded-2xl pl-12 pr-4 text-sm font-semibold outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" 
                  className="w-full h-14 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-100 rounded-2xl pl-10 pr-4 text-sm font-semibold outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
            <div className="relative">
              <FileText className="absolute left-4 top-6 w-5 h-5 text-slate-300" />
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this for?"
                className="w-full h-32 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-100 rounded-2xl pl-12 pr-4 py-5 text-sm font-semibold outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-4 text-center">
            <button 
              type="submit"
              className="w-full bg-[#003399] text-white font-bold py-5 rounded-[1.5rem] hover:bg-blue-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10 active:scale-95 transform"
            >
              <Send className="w-5 h-5" />
              {transferType === 'local' ? 'Transfer Now' : 'Initiate International Transfer'}
            </button>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">
              Total available balance: ${availableBalance.toLocaleString()}.00
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
