import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { USER_DATA } from '@/src/constants';
import { motion } from 'motion/react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (step === 1) {
      if (email.toLowerCase() !== USER_DATA.email.toLowerCase()) {
        setError('Invalid email address. Access denied.');
        return;
      }
    } else if (step === 2) {
      if (password !== USER_DATA.password) {
        setError('Invalid password. Authentication failed.');
        return;
      }
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setStep(step + 1);
    }, 800);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin === USER_DATA.pin) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 1000);
    } else {
      setError('Invalid security pin. Please try again.');
      setPin(['', '', '', '']);
      document.getElementById('pin-0')?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      >
        {/* Left Side - Brand Branding */}
        <div className="md:w-[45%] bg-[#003399] p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 to-[#003399] opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Blue Crest</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight">Welcome Back</h1>
            <p className="text-blue-100/80 text-lg mb-12">Securely manage your finances with ease.</p>

            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">Bank-Level Security</p>
                  <p className="text-blue-200/60 text-sm">256–bit encryption active</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">Secure Login</p>
                  <p className="text-blue-200/60 text-sm">Protected authentication</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
              <p className="text-slate-500 font-medium">Verify your identity to access portal.</p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-10">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all", step >= 1 ? "bg-[#003399] text-white" : "bg-slate-100 text-slate-400")}>1</div>
              <div className={cn("h-px w-8 transition-colors", step >= 2 ? "bg-[#003399]" : "bg-slate-100")} />
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all", step >= 2 ? "bg-[#003399] text-white" : "bg-slate-100 text-slate-400")}>2</div>
              <div className={cn("h-px w-8 transition-colors", step >= 3 ? "bg-[#003399]" : "bg-slate-100")} />
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all", step >= 3 ? "bg-[#003399] text-white" : "bg-slate-100 text-slate-400")}>3</div>
            </div>

            {step === 1 && (
              <motion.form 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={nextStep} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Email Address</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-semibold focus:bg-white focus:border-blue-200 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {error && step === 1 && (
                  <p className="text-xs font-bold text-rose-500 text-center bg-rose-50 py-3 rounded-lg border border-rose-100 italic">
                    {error}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#003399] text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={nextStep} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-semibold focus:bg-white focus:border-blue-200 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {error && step === 2 && (
                  <p className="text-xs font-bold text-rose-500 text-center bg-rose-50 py-3 rounded-lg border border-rose-100 italic">
                    {error}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#003399] text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify Identity <ArrowRight className="w-5 h-5" /></>}
                </button>
                <button onClick={() => setStep(1)} className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-[#003399]">Or use another email</button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={verifyPin} 
                className="space-y-8"
              >
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-center">Enter 4-Digit Secure PIN</label>
                  <div className="flex justify-center gap-4 max-w-sm mx-auto">
                    {pin.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`pin-${idx}`}
                        type="password"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handlePinChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-14 h-14 text-center bg-slate-50 border border-slate-100 rounded-xl text-xl font-bold focus:bg-white focus:border-blue-200 outline-none transition-all"
                        required
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-rose-500 text-center bg-rose-50 py-3 rounded-lg border border-rose-100 italic">
                    {error}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#003399] text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Enter Dashboard <ArrowRight className="w-5 h-5" /></>}
                </button>
              </motion.form>
            )}

            <div className="mt-12 pt-8 border-t border-slate-50 text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Support: <span className="text-[#003399]">0800 BLUE CREST</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
