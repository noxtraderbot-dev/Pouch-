import React from 'react';
import { Headphones, MessageSquare } from 'lucide-react';
import { useBanking } from '../../context/BankingContext';

interface FloatingSupportButtonProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const FloatingSupportButton: React.FC<FloatingSupportButtonProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { chatMessages, currentUser } = useBanking();

  // If already on customer-care chat page, don't show floating button or show as active
  if (activeTab === 'customer-care') {
    return null;
  }

  // Count unread admin messages for this user
  const userThreadMessages = chatMessages.filter(
    (m) => m.threadId === (currentUser?.uid || 'guest') && m.senderRole === 'admin'
  );

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-5 z-40">
      <button
        onClick={() => setActiveTab('customer-care')}
        className="group flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl border border-slate-700 transition-all transform hover:-translate-y-0.5 cursor-pointer"
        aria-label="Contact Customer Care"
      >
        <div className="relative">
          <Headphones className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          {userThreadMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
          )}
        </div>
        <span className="text-xs font-semibold tracking-wide pr-1 hidden sm:inline">
          Customer Care
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 hidden sm:inline"></span>
      </button>
    </div>
  );
};
