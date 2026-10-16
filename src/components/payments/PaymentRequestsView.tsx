import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import { formatCurrency, dollarsToCents } from '../../utils/currency.ts';
import {
  FileText,
  Plus,
  Copy,
  Check,
  Clock,
  XCircle,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const PaymentRequestsView: React.FC = () => {
  const { paymentRequests, accounts, createPaymentRequest, cancelPaymentRequest } = useBanking();
  const [showModal, setShowModal] = useState(false);

  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [description, setDescription] = useState('');
  const [destAccountId, setDestAccountId] = useState(accounts[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cents = dollarsToCents(amountInput);
    if (cents <= 0 || !payerName.trim() || !description.trim()) return;

    createPaymentRequest({
      amountCents: cents,
      payerName: payerName.trim(),
      payerEmail: payerEmail.trim(),
      description: description.trim(),
      destinationAccountId: destAccountId,
    });

    setPayerName('');
    setPayerEmail('');
    setAmountInput('');
    setDescription('');
    setShowModal(false);
  };

  const handleCopyLink = (ref: string) => {
    const link = `https://meridianbank.com/pay/${ref}`;
    navigator.clipboard.writeText(link);
    setCopiedId(ref);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Commercial Invoicing & Payment Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue formal digital payment orders to clients and counterparties with automated ledger reconciliation
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Create Payment Request</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        {paymentRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h2 className="text-xs font-semibold text-slate-800">No payment requests created</h2>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Create electronic invoices and payment links for your corporate clients.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Order Ref #</th>
                  <th className="py-2.5 px-4">Payer Contact</th>
                  <th className="py-2.5 px-4">Description / Purpose</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Expires</th>
                  <th className="py-2.5 px-4 text-right">Requested Amount</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {req.referenceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{req.payerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{req.payerEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate font-medium">
                      {req.description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(req.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-slate-900 text-sm">
                      {formatCurrency(req.amountCents, req.currency)}
                    </td>
                    <td className="py-3 px-4 text-center space-x-1.5">
                      <button
                        onClick={() => handleCopyLink(req.referenceNumber)}
                        className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                        title="Copy payment link"
                      >
                        {copiedId === req.referenceNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5 inline" />
                        )}
                      </button>
                      {req.status === 'pending' && (
                        <button
                          onClick={() => cancelPaymentRequest(req.id)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Cancel request"
                        >
                          <XCircle className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Generate Commercial Payment Order
            </h2>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payer Company or Individual Name *
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="e.g. Zenith Analytics Corp"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payer Email Address
                </label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  placeholder="ap@zenithanalytics.com"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requested Amount ($ USD) *
                </label>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 8,750.00"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deposit Destination Account
                </label>
                <select
                  value={destAccountId}
                  onChange={(e) => setDestAccountId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} ({a.accountNumberMasked})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Invoice Memo / Line Item Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Consulting services for Q3 security auditing and compliance"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Generate Invoice Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
