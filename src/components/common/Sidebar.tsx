import React from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  Users,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  Video,
  FileText,
  FileCheck2,
  Bell,
  UserCog,
  ShieldCheck,
  HelpCircle,
  Headphones,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAdmin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenAdmin }) => {
  const { notifications, chatMessages, currentUser } = useBanking();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const adminReplies = chatMessages.filter(
    (m) => m.threadId === (currentUser?.uid || 'guest') && m.senderRole === 'admin'
  ).length;

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transfers', label: 'Transfers & Pay', icon: ArrowRightLeft },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    { id: 'transactions', label: 'Activity & History', icon: History },
    { id: 'deposits', label: 'Deposits & Wires', icon: ArrowDownToLine },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpFromLine },
    { id: 'video-analysis', label: 'Video KYC & AI', icon: Video },
    { id: 'customer-care', label: 'Customer Care Chat', icon: Headphones, badge: adminReplies },
    { id: 'payment-requests', label: 'Invoices & Requests', icon: FileText },
    { id: 'statements', label: 'Statements', icon: FileCheck2 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile Settings', icon: UserCog },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'support', label: 'Help Desk & FAQ', icon: HelpCircle },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col justify-between w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 shrink-0">
      <div className="overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          Online Banking
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin Portal Quick Link & Routing Notice */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-2">
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded text-xs font-semibold transition-colors cursor-pointer border border-slate-800 shadow-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin & Ops Console</span>
          </button>
        )}

        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
          <div className="flex items-center justify-between font-medium text-slate-700">
            <span>Routing Transit (ABA):</span>
            <span className="font-mono text-slate-900 font-bold">021000021</span>
          </div>
          <div className="text-[10px] text-slate-400">
            JP Morgan Chase Bank, N.A. • Member FDIC
          </div>
        </div>
      </div>
    </aside>
  );
};
