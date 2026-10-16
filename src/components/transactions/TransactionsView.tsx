import React, { useState, useMemo } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import { formatCurrency } from '../../utils/currency.ts';
import { BankingTransaction } from '../../types/banking.ts';
import {
  Search,
  Filter,
  FileCheck2,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { transactions, ledgerEntries, accounts } = useBanking();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Transaction for Details Drawer
  const [selectedTx, setSelectedTx] = useState<BankingTransaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.recipientIdentifier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchesAccount =
        accountFilter === 'all' ||
        tx.sourceAccountId === accountFilter ||
        tx.destinationAccountId === accountFilter;

      return matchesSearch && matchesType && matchesStatus && matchesAccount;
    });
  }, [transactions, searchTerm, typeFilter, statusFilter, accountFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Find corresponding ledger postings for selected transaction
  const relatedLedgerEntries = useMemo(() => {
    if (!selectedTx) return [];
    return ledgerEntries.filter((l) => l.transactionId === selectedTx.id);
  }, [selectedTx, ledgerEntries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account Activity & Transaction History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified transaction records backed by authoritative double-entry balances
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded">
          Total Records: <strong>{filteredTransactions.length}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search memo, ref #, or payee..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="internal_transfer">Internal Transfers</option>
            <option value="external_wire">Wire Transfers</option>
            <option value="ach_transfer">ACH Transfers</option>
            <option value="deposit">Deposits</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed & Settled</option>
            <option value="pending_review">Pending Compliance Review</option>
            <option value="processing">Processing</option>
            <option value="rejected">Rejected / Cancelled</option>
          </select>
        </div>

        {/* Account Filter */}
        <div>
          <select
            value={accountFilter}
            onChange={(e) => {
              setAccountFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountName} ({acc.accountNumberMasked})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No transactions matched your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Reference ID</th>
                  <th className="py-2.5 px-4">Description / Memo</th>
                  <th className="py-2.5 px-4">Recipient / Payee</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Debit / Credit</th>
                  <th className="py-2.5 px-4 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 text-[11px]">
                      {tx.referenceNumber}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-semibold text-slate-900">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] truncate max-w-[150px]">
                      {tx.recipientIdentifier}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.status === 'pending_review'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tx.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-slate-900 text-sm">
                      {formatCurrency(tx.amountCents, tx.currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="text-slate-400 hover:text-slate-900 p-1"
                        title="View Ledger Detail"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing Page <strong className="text-slate-900">{currentPage}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Drawer / Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Transaction Posting Audit</h2>
                <div className="text-xs font-mono text-slate-500">Ref: {selectedTx.referenceNumber}</div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Operation Identifier:</span>
                  <span className="font-mono text-slate-900">{selectedTx.operationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Idempotency Key:</span>
                  <span className="font-mono text-slate-700">{selectedTx.idempotencyKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created Timestamp:</span>
                  <span className="font-mono text-slate-700">{selectedTx.createdAt}</span>
                </div>
                {selectedTx.settledAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Settlement Timestamp:</span>
                    <span className="font-mono text-slate-700">{selectedTx.settledAt}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Posting Breakdown
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Principal Amount:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(selectedTx.amountCents, selectedTx.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Processing Fee:</span>
                  <span className="text-slate-700 tabular-nums">
                    {formatCurrency(selectedTx.feeCents, selectedTx.currency)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold">
                  <span className="text-slate-900">Total Authoritative Debit:</span>
                  <span className="text-slate-950 font-mono text-sm tabular-nums">
                    {formatCurrency(selectedTx.totalDebitCents, selectedTx.currency)}
                  </span>
                </div>
              </div>

              {/* Associated Ledger Entries */}
              {relatedLedgerEntries.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Double-Entry Postings
                  </div>
                  <div className="space-y-1.5">
                    {relatedLedgerEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] flex justify-between"
                      >
                        <span className="capitalize text-slate-700 font-semibold">{entry.type}</span>
                        <span className="text-slate-900 font-bold">{formatCurrency(entry.amountCents)}</span>
                        <span className="text-slate-500">Bal After: {formatCurrency(entry.balanceAfterCents)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
