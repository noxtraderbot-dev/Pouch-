import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import { formatCurrency } from '../../utils/currency.ts';
import {
  FileCheck2,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const StatementsView: React.FC = () => {
  const { accounts, transactions, currentUser } = useBanking();
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [statementPeriod, setStatementPeriod] = useState<'september' | 'october' | 'ytd'>('october');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const handlePrint = () => {
    window.print();
  };

  // Reconcile statement period
  const periodLabel =
    statementPeriod === 'october'
      ? 'October 1, 2026 – October 31, 2026'
      : statementPeriod === 'september'
      ? 'September 1, 2026 – September 30, 2026'
      : 'January 1, 2026 – October 14, 2026';

  const relevantTransactions = transactions.filter(
    (t) => t.sourceAccountId === selectedAccount.id || t.destinationAccountId === selectedAccount.id
  );

  const closingBalance = selectedAccount.availableBalanceCents;
  // Compute approximate opening balance from transactions
  const totalDebits = relevantTransactions.reduce((acc, t) => acc + t.totalDebitCents, 0);
  const openingBalance = closingBalance + totalDebits;

  return (
    <div className="space-y-6">
      {/* Header & Controls (Hidden in print) */}
      <div className="print:hidden bg-white p-5 rounded-md border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Official Account Statements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Periodic audited ledger statements for commercial compliance and tax reporting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Official Statement</span>
          </button>
        </div>
      </div>

      {/* Selector Toolbar (Hidden in print) */}
      <div className="print:hidden bg-white p-4 rounded-md border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div>
          <label className="block text-slate-500 font-semibold mb-1">Target Account:</label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded font-medium focus:bg-white focus:outline-none"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.accountName} ({a.accountNumberMasked})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-500 font-semibold mb-1">Reporting Cycle:</label>
          <select
            value={statementPeriod}
            onChange={(e) => setStatementPeriod(e.target.value as any)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded font-medium focus:bg-white focus:outline-none"
          >
            <option value="october">Current Cycle (October 2026)</option>
            <option value="september">Previous Cycle (September 2026)</option>
            <option value="ytd">Year-to-Date (2026 YTD)</option>
          </select>
        </div>
      </div>

      {/* Printable Statement Document (Formatted as a formal bank statement) */}
      <div className="bg-white p-8 sm:p-10 rounded-md border border-slate-300 shadow-sm max-w-4xl mx-auto space-y-6 text-slate-900">
        {/* Statement Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-slate-900" />
              <span className="font-bold tracking-wider text-lg">MERIDIAN FEDERAL TRUST</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">Charter #8491-FED • Member FDIC</div>
            <div className="text-xs text-slate-600 mt-2">
              100 Wall Street, 24th Floor<br />
              New York, NY 10005, United States
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-sm font-bold tracking-tight uppercase">Account Statement</div>
            <div className="text-xs font-semibold text-slate-700">{periodLabel}</div>
            <div className="text-xs text-slate-500 font-mono">Statement Date: October 14, 2026</div>
          </div>
        </div>

        {/* Client & Account Summary Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs p-4 bg-slate-50 rounded border border-slate-200">
          <div>
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Account Holder
            </div>
            <div className="font-semibold text-slate-900 text-sm">{currentUser?.displayName}</div>
            <div className="text-slate-600 font-mono text-[11px]">{currentUser?.email}</div>
            <div className="text-slate-500 text-[11px] mt-1">Status: Active Depository Client</div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Account Information
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account Title:</span>
              <span className="font-semibold">{selectedAccount.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account Number:</span>
              <span className="font-mono font-semibold">{selectedAccount.accountNumberMasked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Routing Transit (ABA):</span>
              <span className="font-mono">{selectedAccount.routingNumber}</span>
            </div>
          </div>
        </div>

        {/* Ledger Balance Summary */}
        <div className="grid grid-cols-3 gap-4 border-y border-slate-200 py-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Opening Balance</span>
            <span className="font-bold text-slate-900 text-base tabular-nums">
              {formatCurrency(openingBalance, selectedAccount.currency)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Total Debits / Withdrawals</span>
            <span className="font-bold text-slate-900 text-base tabular-nums">
              {formatCurrency(totalDebits, selectedAccount.currency)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Ending Settled Balance</span>
            <span className="font-bold text-slate-950 text-base tabular-nums font-mono">
              {formatCurrency(closingBalance, selectedAccount.currency)}
            </span>
          </div>
        </div>

        {/* Itemized Transactions Table */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Itemized Ledger Postings
          </h2>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Reference #</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {relevantTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500 italic">
                    No transactions posted during this cycle.
                  </td>
                </tr>
              ) : (
                relevantTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-800 font-medium">
                      {tx.referenceNumber}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{tx.description}</td>
                    <td className="py-2 px-3 capitalize text-slate-600 text-[11px]">
                      {tx.type.replace('_', ' ')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                      {formatCurrency(tx.amountCents, tx.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Regulatory Disclosures & FDIC Notice */}
        <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 leading-relaxed space-y-1">
          <p>
            <strong>Federal Disclosures:</strong> In case of errors or questions about your electronic transactions, notify JP Morgan Chase Bank, N.A. customer service immediately. We must hear from you no later than 60 days after we sent the FIRST statement on which the problem appeared.
          </p>
          <p>
            Deposits are insured up to the standard maximum deposit insurance amount of $250,000 per depositor, per insured depository institution, for each account ownership category.
          </p>
        </div>
      </div>
    </div>
  );
};
