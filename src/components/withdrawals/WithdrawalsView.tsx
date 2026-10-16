import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import { formatCurrency, dollarsToCents } from '../../utils/currency.ts';
import {
  ArrowUpFromLine,
  Building,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const WithdrawalsView: React.FC = () => {
  const { accounts, executeTransfer, recordSecurityEvent } = useBanking();
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [amountInput, setAmountInput] = useState('');
  const [destBank, setDestBank] = useState('');
  const [destRouting, setDestRouting] = useState('');
  const [destAccount, setDestAccount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ success: boolean; ref?: string; error?: string } | null>(null);

  const sourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];
  const amountCents = dollarsToCents(amountInput);
  const wireFeeCents = 2500; // $25.00 domestic outbound wire fee
  const totalDebitCents = amountCents + wireFeeCents;

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultMessage(null);

    if (amountCents <= 0) {
      setResultMessage({ success: false, error: 'Please enter a valid withdrawal amount.' });
      return;
    }

    if (sourceAccount.availableBalanceCents < totalDebitCents) {
      setResultMessage({
        success: false,
        error: `Insufficient available funds. Required: ${formatCurrency(totalDebitCents)}, Available: ${formatCurrency(sourceAccount.availableBalanceCents)}.`,
      });
      return;
    }

    if (destRouting.length < 9) {
      setResultMessage({ success: false, error: 'Target routing transit must be a valid 9-digit ABA code.' });
      return;
    }

    setIsSubmitting(true);

    const res = await executeTransfer({
      sourceAccountId,
      recipientIdentifier: `${destBank} (Acct: •••• ${destAccount.slice(-4)})`,
      amountCents: totalDebitCents,
      description: `Outbound Fedwire Withdrawal to ${destBank}: ${memo || 'Corporate Liquidity Distribution'}`,
      category: 'wire',
      isInternal: false,
    });

    setIsSubmitting(false);

    if (res.success) {
      setResultMessage({ success: true, ref: res.referenceNumber });
      recordSecurityEvent('transfer_initiated', `Outbound withdrawal ${res.referenceNumber} processed: ${formatCurrency(amountCents)}`);
      setAmountInput('');
      setDestBank('');
      setDestRouting('');
      setDestAccount('');
      setMemo('');
    } else {
      setResultMessage({ success: false, error: res.error });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Outbound Funds Withdrawal</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Initiate Federal Reserve Wire or Automated Clearing House disbursement to external institutions
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md border border-slate-200 shadow-xs space-y-5">
        {resultMessage && (
          <div
            className={`p-3.5 rounded text-xs flex items-start gap-2.5 ${
              resultMessage.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-red-50 border border-red-200 text-red-900'
            }`}
          >
            {resultMessage.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              {resultMessage.success ? (
                <>
                  <strong className="block font-semibold">Withdrawal Dispatched to Fedwire Queue</strong>
                  <span>Reference ID: <code className="font-mono font-bold">{resultMessage.ref}</code>. Funds have been debited from your authoritative ledger.</span>
                </>
              ) : (
                <>
                  <strong className="block font-semibold">Withdrawal Rejected by Validation Engine</strong>
                  <span>{resultMessage.error}</span>
                </>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Source Account (Debited)
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-medium focus:bg-white focus:border-slate-900 focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} ({acc.accountNumberMasked}) — Available: {formatCurrency(acc.availableBalanceCents)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Withdrawal Amount ($ USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
              <input
                type="text"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded font-mono text-base font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                required
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Standard Fedwire Processing Fee: <strong>$25.00</strong></span>
              <span>Total Debit: <strong className="text-slate-900">{formatCurrency(totalDebitCents)}</strong></span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-600" /> External Beneficiary Institution
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block font-medium text-slate-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={destBank}
                  onChange={(e) => setDestBank(e.target.value)}
                  placeholder="e.g. Citibank, N.A."
                  className="w-full p-2 bg-white border border-slate-300 rounded focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">ABA Routing (9 Digits)</label>
                <input
                  type="text"
                  value={destRouting}
                  onChange={(e) => setDestRouting(e.target.value)}
                  placeholder="021000089"
                  maxLength={9}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-mono focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={destAccount}
                  onChange={(e) => setDestAccount(e.target.value)}
                  placeholder="9842109841"
                  className="w-full p-2 bg-white border border-slate-300 rounded font-mono focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Beneficiary Reference Memo
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="e.g. Treasury sweeps to commercial operating fund"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying Reserves & Reserving Funds...' : 'Authorize Outbound Wire Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
};
