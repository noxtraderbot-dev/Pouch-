/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BankingProvider, useBanking } from './context/BankingContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { MobileMoreDrawer } from './components/common/MobileMoreDrawer';
import { FloatingSupportButton } from './components/common/FloatingSupportButton';
import { OverviewView } from './components/dashboard/OverviewView';
import { AccountsView } from './components/accounts/AccountsView';
import { TransfersView } from './components/transfers/TransfersView';
import { BeneficiariesView } from './components/beneficiaries/BeneficiariesView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { DepositsView } from './components/deposits/DepositsView';
import { WithdrawalsView } from './components/withdrawals/WithdrawalsView';
import { PaymentRequestsView } from './components/payments/PaymentRequestsView';
import { StatementsView } from './components/statements/StatementsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ProfileView } from './components/profile/ProfileView';
import { SecurityView } from './components/security/SecurityView';
import { SupportView } from './components/support/SupportView';
import { CustomerCareChatView } from './components/support/CustomerCareChatView';
import { VideoAnalysisView } from './components/video/VideoAnalysisView';
import { PublicLanding } from './components/public/PublicLanding';
import { AuthModal } from './components/public/AuthModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

const BankingAppInner: React.FC = () => {
  const { currentUser, isLoading } = useBanking();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [publicAuthModal, setPublicAuthModal] = useState<'signin' | 'signup' | null>(null);

  // Admin routing state
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminPath, setIsAdminPath] = useState(() => {
    return (
      window.location.pathname === '/admin' ||
      window.location.hash === '#admin' ||
      window.location.search.includes('admin=true')
    );
  });

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminPath(
        window.location.pathname === '/admin' ||
        window.location.hash === '#admin' ||
        window.location.search.includes('admin=true')
      );
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-3"></div>
        <div className="text-xs font-semibold text-slate-700">Connecting to Secure Banking Gateway...</div>
      </div>
    );
  }

  // Handle Admin Portal Experience
  if (isAdminPath || isAdminPortalOpen) {
    if (isAdminUnlocked) {
      return (
        <AdminDashboard
          onBackToApp={() => {
            setIsAdminUnlocked(false);
            setIsAdminPortalOpen(false);
            if (window.location.hash === '#admin') {
              window.location.hash = '';
            }
            if (window.location.pathname === '/admin') {
              window.history.pushState(null, '', '/');
              setIsAdminPath(false);
            }
          }}
        />
      );
    }

    return (
      <AdminLogin
        onSuccess={() => {
          setIsAdminUnlocked(true);
        }}
      />
    );
  }

  // 1. Unauthenticated Experience: Complete Public Banking Landing Page First
  if (!currentUser) {
    return (
      <>
        <PublicLanding
          onSignInSuccess={() => setActiveTab('overview')}
          onOpenAuth={(mode) => setPublicAuthModal(mode)}
          onOpenAdmin={() => setIsAdminPortalOpen(true)}
        />
        {publicAuthModal && (
          <AuthModal
            initialMode={publicAuthModal}
            onClose={() => setPublicAuthModal(null)}
            onSuccess={() => {
              setPublicAuthModal(null);
              setActiveTab('overview');
            }}
          />
        )}
      </>
    );
  }

  // 2. Authenticated Experience: Customer Banking Application
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-16 lg:pb-0 relative">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAdmin={() => setIsAdminPortalOpen(true)}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'overview' && <OverviewView onNavigate={setActiveTab} />}
          {activeTab === 'accounts' && <AccountsView onNavigate={setActiveTab} />}
          {activeTab === 'transfers' && <TransfersView />}
          {activeTab === 'beneficiaries' && <BeneficiariesView onNavigate={setActiveTab} />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'deposits' && <DepositsView />}
          {activeTab === 'withdrawals' && <WithdrawalsView />}
          {activeTab === 'video-analysis' && <VideoAnalysisView />}
          {activeTab === 'payment-requests' && <PaymentRequestsView />}
          {activeTab === 'statements' && <StatementsView />}
          {activeTab === 'notifications' && <NotificationsView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'security' && <SecurityView />}
          {activeTab === 'support' && <SupportView />}
          {activeTab === 'customer-care' && <CustomerCareChatView />}
        </main>
      </div>

      {/* Floating Customer Care Button */}
      <FloatingSupportButton
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Mobile Persistent Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMore={() => setIsMobileMoreOpen(true)}
      />

      {/* Mobile More Drawer */}
      <MobileMoreDrawer
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <BankingProvider>
      <BankingAppInner />
    </BankingProvider>
  );
}
