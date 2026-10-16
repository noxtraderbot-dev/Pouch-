import React from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import { formatCurrency } from '../../utils/currency.ts';
import {
  Wallet,
  ArrowRightLeft,
  FileCheck2,
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  ExternalLink,
  ArrowDownToLine,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface OverviewViewProps {
  onNavigate: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const { currentUser, accounts, transactions, notifications } = useBanking();

  const totalAvailableCents = accounts.reduce((acc, a) => acc + a.availableBalanceCents, 0);
  const totalLedgerCents = accounts.reduce((acc, a) => acc + a.ledgerBalanceCents, 0);

  const primaryChecking = accounts.find((a) => a.accountType === 'checking') || accounts[0];
  const primarySavings = accounts.find((a) => a.accountType === 'savings');

  const recentTransactions = transactions.slice(0, 5);
  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome, {currentUser?.displayName || currentUser?.email || 'Client'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Depository Account Active • Status:{' '}
            <span className="text-emerald-700 font-semibold uppercase">
              {currentUser?.status || 'active'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('transfers')}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Transfer Money</span>
          </button>
          <button
            onClick={() => onNavigate('deposits')}
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
            <span>Deposit Funds</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Liquidity */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Total Available Balance</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-semibold">
              Authoritative
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
            {formatCurrency(totalAvailableCents, 'USD')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Settled Ledger Balance:</span>
            <span className="font-semibold text-slate-700 tabular-nums font-mono">
              {formatCurrency(totalLedgerCents, 'USD')}
            </span>
          </div>
        </div>

        {/* Premier Everyday Checking */}
        {primaryChecking && (
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium truncate">{primaryChecking.accountName}</span>
              <span className="font-mono text-slate-600 text-[11px]">
                {primaryChecking.accountNumberMasked}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
              {formatCurrency(primaryChecking.availableBalanceCents, primaryChecking.currency)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Daily Transfer Limit:</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                {formatCurrency(primaryChecking.dailyTransferLimitCents, primaryChecking.currency)}
              </span>
            </div>
          </div>
        )}

        {/* High-Yield Growth Savings */}
        {primarySavings && (
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium truncate">{primarySavings.accountName}</span>
              <span className="font-mono text-slate-600 text-[11px]">
                {primarySavings.accountNumberMasked}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
              {formatCurrency(primarySavings.availableBalanceCents, primarySavings.currency)}
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" /> Annual APY Yield:
              </span>
              <span className="font-semibold text-emerald-700 font-mono">4.85% APY</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Quick Banking Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('transfers')}
            className="p-3.5 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <ArrowRightLeft className="w-5 h-5 text-slate-700 group-hover:text-slate-900 mb-2" />
            <div>
              <div className="text-xs font-semibold text-slate-900">Make Transfer</div>
              <div className="text-[11px] text-slate-500">Send money or pay</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('deposits')}
            className="p-3.5 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <ArrowDownToLine className="w-5 h-5 text-slate-700 group-hover:text-slate-900 mb-2" />
            <div>
              <div className="text-xs font-semibold text-slate-900">Deposit Check</div>
              <div className="text-[11px] text-slate-500">Remote mobile deposit</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('beneficiaries')}
            className="p-3.5 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <Users className="w-5 h-5 text-slate-700 group-hover:text-slate-900 mb-2" />
            <div>
              <div className="text-xs font-semibold text-slate-900">Payees</div>
              <div className="text-[11px] text-slate-500">Manage beneficiaries</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('statements')}
            className="p-3.5 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <FileCheck2 className="w-5 h-5 text-slate-700 group-hover:text-slate-900 mb-2" />
            <div>
              <div className="text-xs font-semibold text-slate-900">Statements</div>
              <div className="text-[11px] text-slate-500">Official monthly reports</div>
            </div>
          </button>
        </div>
      </div>

      {/* Grid: Recent Activity & Notifications Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Account Activity</h2>
              <p className="text-[11px] text-slate-500">Authoritative posting history</p>
            </div>
            {recentTransactions.length > 0 && (
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs text-slate-700 hover:text-slate-950 font-semibold flex items-center gap-1 cursor-pointer"
              >
                View All <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-xs font-semibold text-slate-800">No transactions recorded yet</h3>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Your account activity will be logged here as soon as you deposit funds or make your first transfer.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => onNavigate('deposits')}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Make Your First Deposit
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Reference</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 text-[11px]">
                        {tx.referenceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{tx.description}</div>
                        <div className="text-[11px] text-slate-500">Payee: {tx.recipientIdentifier}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            tx.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tx.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold tabular-nums text-slate-900 text-sm">
                        {formatCurrency(tx.amountCents, tx.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real Account Notifications Panel (1 column on lg) */}
        <div className="bg-white rounded-md border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Activity Notices</h2>
            </div>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs text-slate-700 hover:text-slate-950 font-semibold cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="p-4 flex-1 divide-y divide-slate-100 space-y-3">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p>No new account notices.</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div key={notif.id} className="pt-3 first:pt-0 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>}
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
