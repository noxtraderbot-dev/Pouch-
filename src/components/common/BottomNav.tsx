import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  History,
  Menu,
  User,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMore: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMore,
}) => {
  const tabs = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transfers', label: 'Transfer', icon: ArrowRightLeft },
    { id: 'transactions', label: 'Activity', icon: History },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 py-1.5 px-2 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors cursor-pointer ${
              isActive ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded ${isActive ? 'bg-slate-100 text-slate-950' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}

      {/* More / Menu Drawer toggle */}
      <button
        onClick={onOpenMore}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors cursor-pointer ${
          ['statements', 'beneficiaries', 'deposits', 'withdrawals', 'profile', 'security', 'support'].includes(
            activeTab
          )
            ? 'text-slate-900 font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className="p-1 rounded">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5">More</span>
      </button>
    </nav>
  );
};
