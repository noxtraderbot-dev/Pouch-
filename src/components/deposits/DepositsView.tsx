import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import { formatCurrency, dollarsToCents } from '../../utils/currency.ts';
import {
  ArrowDownToLine,
  Building2,
  Copy,
  Check,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DepositsView: React.FC = () => {
  const { accounts, depositFunds } = useBanking();
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [checkAmountInput, setCheckAmountInput] = useState('');
  const [checkMemo, setCheckMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<{ amountCents: number; accountName: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDepositCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = dollarsToCents(checkAmountInput);
    if (amountCents <= 0 || !selectedAccount) return;

    setIsSubmitting(true);
    setTimeout(() => {
      depositFunds(
        selectedAccount.id,
        amountCents,
        checkMemo.trim() || 'Mobile Remote Check Deposit'
      );
      setDepositSuccess({
        amountCents,
        accountName: selectedAccount.accountName,
      });
      setIsSubmitting(false);
      setCheckAmountInput('');
      setCheckMemo('');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Deposits & Inbound Wires</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add funds to your checking or savings accounts via Remote Mobile Check Deposit or Federal Reserve Fedwire
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Remote Check Capture Form */}
        <div className="bg-white p-6 rounded-md border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Camera className="w-4 h-4 text-slate-800" />
            <h2 className="text-sm font-bold text-slate-900">Mobile Check Deposit</h2>
          </div>

          {depositSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-xs space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Check Deposit Cleared & Credited</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Successfully credited <strong>{formatCurrency(depositSuccess.amountCents)}</strong> to{' '}
                <strong>{depositSuccess.accountName}</strong>. Your updated balance is now available for transfers.
              </p>
              <button
                onClick={() => setDepositSuccess(null)}
                className="w-full py-2 bg-slate-900 text-white rounded font-semibold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Deposit Another Check
              </button>
            </div>
          ) : (
            <form onSubmit={handleDepositCheck} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destination Account (Credited)
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-medium focus:bg-white focus:border-slate-900 focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} ({acc.accountNumberMasked}) — Current: {formatCurrency(acc.availableBalanceCents)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Check Amount ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="text"
                    value={checkAmountInput}
                    onChange={(e) => setCheckAmountInput(e.target.value)}
                    placeholder="e.g. 500.00"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded font-mono text-base font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Check Issuer / Reference Memo
                </label>
                <input
                  type="text"
                  value={checkMemo}
                  onChange={(e) => setCheckMemo(e.target.value)}
                  placeholder="e.g. Customer invoice payment / Payroll check"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="p-3 border border-dashed border-slate-300 rounded bg-slate-50 text-center text-slate-500">
                <Camera className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-[11px]">Digital Front & Back Check Photo Capture (Simulated)</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Transmitting Check Verification...' : 'Submit Deposit'}
              </button>
            </form>
          )}
        </div>

        {/* Wire & Direct Deposit Routing Instructions */}
        <div className="bg-white p-6 rounded-md border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-slate-800" />
            <h2 className="text-sm font-bold text-slate-900">Direct Deposit & Inbound Wire Instructions</h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Share these details with your employer or sending institution to receive electronic payroll or wire disbursements directly into your account.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-slate-500 block text-[11px]">Financial Institution</span>
                <span className="font-semibold text-slate-900">JP Morgan Chase Bank, N.A.</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Member FDIC</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-slate-500 block text-[11px]">ABA Routing Transit (ACH & Wire)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">021000021</span>
              </div>
              <button
                onClick={() => handleCopy('021000021', 'wire-routing')}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                {copiedField === 'wire-routing' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {selectedAccount && (
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block text-[11px]">Account Number ({selectedAccount.accountName})</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedAccount.accountNumberFull}</span>
                </div>
                <button
                  onClick={() => handleCopy(selectedAccount.accountNumberFull, 'wire-acc')}
                  className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  {copiedField === 'wire-acc' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-slate-500 block text-[11px]">SWIFT / BIC (International Inbound)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">MFTUS33NYC</span>
              </div>
              <button
                onClick={() => handleCopy('MFTUS33NYC', 'wire-swift')}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                {copiedField === 'wire-swift' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
