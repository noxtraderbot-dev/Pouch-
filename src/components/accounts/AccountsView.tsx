import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import { formatCurrency } from '../../utils/currency.ts';
import {
  Wallet,
  Building2,
  Lock,
  Unlock,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRightLeft,
  FileCheck2,
} from 'lucide-react';

interface AccountsViewProps {
  onNavigate: (tab: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ onNavigate }) => {
  const { accounts, toggleAccountStatus } = useBanking();
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Authorized Bank Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional depository accounts with FDIC insurance up to $250,000 per depositor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('transfers')}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Transfer Between Accounts</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {accounts.map((account) => {
          const isRevealed = revealedIds[account.id];
          const isFrozen = account.status === 'frozen';

          return (
            <div
              key={account.id}
              className={`bg-white rounded-md border transition-all shadow-xs flex flex-col justify-between ${
                isFrozen ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div className="p-5">
                {/* Account Type Badge & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    {account.accountType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        account.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {account.status}
                    </span>
                  </div>
                </div>

                {/* Account Name & Balance */}
                <h2 className="text-sm font-bold text-slate-900 mb-1">{account.accountName}</h2>
                <div className="text-2xl font-bold text-slate-900 tabular-nums my-2">
                  {formatCurrency(account.availableBalanceCents, account.currency)}
                </div>

                <div className="text-xs text-slate-500 flex items-center justify-between pb-3 border-b border-slate-100">
                  <span>Ledger Balance:</span>
                  <span className="font-semibold text-slate-700 tabular-nums font-mono">
                    {formatCurrency(account.ledgerBalanceCents, account.currency)}
                  </span>
                </div>

                {/* Identifiers & Details */}
                <div className="mt-4 space-y-2.5 text-xs">
                  {/* Account Number */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Number:</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-800">
                      <span>{isRevealed ? account.accountNumberFull : account.accountNumberMasked}</span>
                      <button
                        onClick={() => toggleReveal(account.id)}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title={isRevealed ? 'Hide account number' : 'Show account number'}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopy(account.accountNumberFull, `acc-${account.id}`)}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title="Copy account number"
                      >
                        {copiedField === `acc-${account.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Routing Transit */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Routing (ABA):</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-800">
                      <span>{account.routingNumber}</span>
                      <button
                        onClick={() => handleCopy(account.routingNumber, `routing-${account.id}`)}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title="Copy routing number"
                      >
                        {copiedField === `routing-${account.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Daily Outbound Limit */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Daily Transfer Limit:</span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {formatCurrency(account.dailyTransferLimitCents, account.currency)}
                    </span>
                  </div>

                  {/* Wire Routing */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Swift/BIC Identifier:</span>
                    <span className="font-mono text-slate-700">MFTUS33NYC</span>
                  </div>
                </div>
              </div>

              {/* Account Operational Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => onNavigate('statements')}
                  className="text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Statement</span>
                </button>

                <button
                  onClick={() => toggleAccountStatus(account.id)}
                  className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                    isFrozen
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isFrozen ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unfreeze Account</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Freeze Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
