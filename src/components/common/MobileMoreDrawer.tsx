import React from 'react';
import {
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  FileCheck2,
  FileText,
  UserCog,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Building2,
} from 'lucide-react';
import { useBanking } from '../../context/BankingContext.tsx';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const { logout, currentUser } = useBanking();

  if (!isOpen) return null;

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  const moreItems = [
    { id: 'deposits', label: 'Deposits & Inbound Wires', icon: ArrowDownToLine },
    { id: 'withdrawals', label: 'Withdrawals & Disbursements', icon: ArrowUpFromLine },
    { id: 'beneficiaries', label: 'Approved Beneficiaries', icon: Users },
    { id: 'statements', label: 'Account Statements', icon: FileCheck2 },
    { id: 'payment-requests', label: 'Invoices & Payment Orders', icon: FileText },
    { id: 'profile', label: 'Profile & Preferences', icon: UserCog },
    { id: 'security', label: 'Security & Two-Factor (MFA)', icon: ShieldCheck },
    { id: 'support', label: 'Customer Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl border-t border-slate-200 p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-800" />
            <div>
              <span className="font-bold text-slate-900 text-sm">Banking Services Menu</span>
              <div className="text-[10px] text-slate-500 font-mono">{currentUser?.displayName}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-left flex flex-col justify-between cursor-pointer space-y-2 transition-colors"
              >
                <Icon className="w-5 h-5 text-slate-700" />
                <span className="font-semibold text-slate-900">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full py-2.5 bg-red-50 text-red-700 rounded-md text-xs font-semibold hover:bg-red-100 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
