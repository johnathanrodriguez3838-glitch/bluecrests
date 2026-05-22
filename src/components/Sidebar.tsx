import { 
  LayoutDashboard, 
  User, 
  FileText, 
  TrendingUp, 
  Send, 
  Globe, 
  History, 
  CreditCard, 
  Shield, 
  Key,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
}

const MENU_ITEMS = [
  { section: 'MENU', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'details', label: 'Account Details', icon: User },
    { id: 'summary', label: 'Account Summary', icon: FileText },
    { id: 'stocks', label: 'Stocks & Trading', icon: TrendingUp },
  ]},
  { section: 'FUND TRANSFER', items: [
    { id: 'local-transfer', label: 'Local Transfer', icon: Send },
    { id: 'intl-transfer', label: 'International Transfer', icon: Globe },
    { id: 'history', label: 'Transfer History', icon: History },
  ]},
  { section: 'ACCOUNT', items: [
    { id: 'atm', label: 'ATM Card', icon: CreditCard },
    { id: 'pin', label: 'Transaction Pin', icon: Shield },
    { id: 'password', label: 'Account Password', icon: Key },
  ]}
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside className={cn(
        "bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 transform lg:translate-x-0 w-64 shadow-2xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#003399] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
            Blue Crest
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">International</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 custom-scrollbar overflow-y-auto">
        {MENU_ITEMS.map((section) => (
          <div key={section.section} className="mb-6">
            <h3 className="px-4 text-[10px] font-bold text-slate-400 tracking-[0.15em] mb-4">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    activeTab === item.id 
                      ? "bg-[#003399] text-white shadow-md shadow-blue-900/10" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Savings Goal</span>
            <span className="text-xs text-white font-bold">74%</span>
          </div>
          <div className="w-full bg-slate-700 h-1 rounded-full mb-3">
            <div className="bg-[#00f2fe] h-full rounded-full" style={{ width: '74%' }} />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">You're $2,400 away from your summer trip goal.</p>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
    </>
  );
}
