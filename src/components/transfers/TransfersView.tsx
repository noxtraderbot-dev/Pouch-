import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import { dollarsToCents, formatCurrency } from '../../utils/currency.ts';
import {
  ArrowRightLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
  Building,
} from 'lucide-react';
import { COMPLIANCE_REVIEW_THRESHOLD_CENTS } from '../../utils/ledger.ts';

export const TransfersView: React.FC = () => {
  const { accounts, beneficiaries, executeTransfer } = useBanking();

  // Form State
  const [sourceAccountId, setSourceAccountId] = useState<string>(accounts[0]?.id || '');
  const [transferType, setTransferType] = useState<'internal' | 'beneficiary' | 'manual'>('internal');
  const [destinationAccountId, setDestinationAccountId] = useState<string>(accounts[1]?.id || '');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(beneficiaries[0]?.id || '');
  const [manualRecipient, setManualRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [description, setDescription] = useState('');

  // Workflow State: 'form' | 'review' | 'success' | 'error'
  const [step, setStep] = useState<'form' | 'review' | 'success' | 'error'>('form');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    referenceNumber: string;
    requiresReview: boolean;
    amountCents: number;
    feeCents: number;
    totalDebitCents: number;
    sourceName: string;
    recipientName: string;
    description: string;
  } | null>(null);

  const sourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];
  const destAccount = accounts.find((a) => a.id === destinationAccountId);
  const selectedBeneficiary = beneficiaries.find((b) => b.id === selectedBeneficiaryId);

  const amountCents = dollarsToCents(amountInput);
  const wireFeeCents = transferType === 'manual' ? 1500 : 0; // $15.00 wire fee for external
  const totalDebitCents = amountCents + wireFeeCents;

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (amountCents <= 0) {
      setFormError('Please enter a valid transfer amount greater than $0.00.');
      return;
    }

    if (sourceAccount.status !== 'active') {
      setFormError(`Source account is ${sourceAccount.status}. Cannot process outbound transfers.`);
      return;
    }

    if (sourceAccount.availableBalanceCents < totalDebitCents) {
      setFormError(
        `Insufficient funds. Available: ${formatCurrency(
          sourceAccount.availableBalanceCents
        )}, Total Required: ${formatCurrency(totalDebitCents)}.`
      );
      return;
    }

    if (amountCents > sourceAccount.dailyTransferLimitCents) {
      setFormError(
        `Transfer exceeds account daily limit of ${formatCurrency(sourceAccount.dailyTransferLimitCents)}.`
      );
      return;
    }

    if (transferType === 'internal' && sourceAccountId === destinationAccountId) {
      setFormError('Source and destination accounts must be different for internal transfers.');
      return;
    }

    if (transferType === 'manual' && !manualRecipient.trim()) {
      setFormError('Please enter a valid recipient name or account identifier.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please provide a mandatory payment memo or reference description.');
      return;
    }

    setStep('review');
  };

  const handleConfirmAndExecute = async () => {
    setIsSubmitting(true);
    setFormError(null);

    let recipientIdentifier = '';
    let category: 'transfer' | 'payment' | 'wire' = 'transfer';
    let isInternal = false;

    if (transferType === 'internal') {
      recipientIdentifier = destAccount ? `${destAccount.accountName} (${destAccount.accountNumberMasked})` : '';
      category = 'transfer';
      isInternal = true;
    } else if (transferType === 'beneficiary') {
      recipientIdentifier = selectedBeneficiary
        ? `${selectedBeneficiary.name} - ${selectedBeneficiary.bankName} (${selectedBeneficiary.accountNumberMasked})`
        : '';
      category = 'wire';
    } else {
      recipientIdentifier = manualRecipient.trim();
      category = 'wire';
    }

    const res = await executeTransfer({
      sourceAccountId,
      destinationAccountId: transferType === 'internal' ? destinationAccountId : undefined,
      recipientIdentifier,
      beneficiaryId: transferType === 'beneficiary' ? selectedBeneficiaryId : undefined,
      amountCents,
      description,
      category,
      isInternal,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || 'Transfer execution failed.');
      setStep('error');
    } else {
      setLastReceipt({
        referenceNumber: res.referenceNumber || 'MFT-PENDING',
        requiresReview: !!res.requiresReview,
        amountCents,
        feeCents: wireFeeCents,
        totalDebitCents,
        sourceName: sourceAccount.accountName,
        recipientName: recipientIdentifier,
        description,
      });
      setStep('success');
    }
  };

  const resetForm = () => {
    setAmountInput('');
    setDescription('');
    setManualRecipient('');
    setStep('form');
    setFormError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Transfer Money & Payments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Move funds instantly between your accounts or send external payments with dual-step confirmation
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Transfer</span>
        </div>
      </div>

      {/* STEP 1: FORM */}
      {step === 'form' && (
        <form onSubmit={handleProceedToReview} className="bg-white p-6 rounded-md border border-slate-200 shadow-xs space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Transfer Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Transfer Channel & Destination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTransferType('internal')}
                className={`py-2 px-3 text-xs rounded border text-left font-medium transition-colors cursor-pointer ${
                  transferType === 'internal'
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>Internal Transfer</div>
                <div className={`text-[10px] ${transferType === 'internal' ? 'text-amber-300' : 'text-slate-500'}`}>
                  Between personal accounts
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTransferType('beneficiary')}
                className={`py-2 px-3 text-xs rounded border text-left font-medium transition-colors cursor-pointer ${
                  transferType === 'beneficiary'
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>Verified Beneficiary</div>
                <div className={`text-[10px] ${transferType === 'beneficiary' ? 'text-amber-300' : 'text-slate-500'}`}>
                  Saved payees
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTransferType('manual')}
                className={`py-2 px-3 text-xs rounded border text-left font-medium transition-colors cursor-pointer ${
                  transferType === 'manual'
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>External Transfer</div>
                <div className={`text-[10px] ${transferType === 'manual' ? 'text-amber-300' : 'text-slate-500'}`}>
                  Wire or ACH to external accounts
                </div>
              </button>
            </div>
          </div>

          {/* Source Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Account (Debited)
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded font-medium focus:bg-white focus:border-slate-900 focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} ({acc.accountNumberMasked}) — Available:{' '}
                  {formatCurrency(acc.availableBalanceCents, acc.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Selection depending on Type */}
          {transferType === 'internal' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Account (Credited)
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded font-medium focus:bg-white focus:border-slate-900 focus:outline-none"
              >
                {accounts
                  .filter((a) => a.id !== sourceAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} ({acc.accountNumberMasked}) — Current:{' '}
                      {formatCurrency(acc.availableBalanceCents, acc.currency)}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {transferType === 'beneficiary' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Beneficiary
              </label>
              {beneficiaries.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No beneficiaries saved yet. You can add one in the Beneficiaries tab.
                </p>
              ) : (
                <select
                  value={selectedBeneficiaryId}
                  onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded font-medium focus:bg-white focus:border-slate-900 focus:outline-none"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.bankName} ({b.accountNumberMasked})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* ... */}

          {transferType === 'manual' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Account Number or Email
                </label>
                <input
                  type="text"
                  value={manualRecipient}
                  onChange={(e) => setManualRecipient(e.target.value)}
                  placeholder="e.g. Account Number or Recipient Email"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
              <input
                type="text"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded font-mono text-base font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Available to transfer: {formatCurrency(sourceAccount.availableBalanceCents)}</span>
              {amountCents >= COMPLIANCE_REVIEW_THRESHOLD_CENTS && (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Requires compliance approval (&gt;$10,000)
                </span>
              )}
            </div>
          </div>

          {/* Payment Description / Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Memo / Transaction Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Q4 Vendor retainer payment / Invoice #9482"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Review Authoritative Transfer</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: REVIEW MODAL / SCREEN */}
      {step === 'review' && (
        <div className="bg-white p-6 rounded-md border border-slate-200 shadow-md space-y-5 animate-in fade-in">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">Review Transfer Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please verify the financial details before final ledger commitment.
            </p>
          </div>

          <div className="bg-slate-50 rounded border border-slate-200 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Source Account:</span>
              <span className="font-semibold text-slate-900">
                {sourceAccount.accountName} ({sourceAccount.accountNumberMasked})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Recipient / Beneficiary:</span>
              <span className="font-semibold text-slate-900">
                {transferType === 'internal'
                  ? `${destAccount?.accountName} (${destAccount?.accountNumberMasked})`
                  : transferType === 'beneficiary'
                  ? `${selectedBeneficiary?.name} (${selectedBeneficiary?.bankName})`
                  : manualRecipient}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Transfer Principal:</span>
              <span className="font-bold text-slate-900 text-sm tabular-nums">
                {formatCurrency(amountCents)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Regulatory & Processing Fee:</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                {wireFeeCents === 0 ? 'FREE ($0.00)' : formatCurrency(wireFeeCents)}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-900">Total Debit to Account:</span>
              <span className="font-bold text-slate-950 font-mono text-base tabular-nums">
                {formatCurrency(totalDebitCents)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Transaction Memo:</span>
              <span className="font-medium text-slate-700 italic max-w-xs truncate">
                "{description}"
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Security Verification:</span>
              <span className="text-emerald-700 font-medium">Standard 256-Bit TLS Verified</span>
            </div>
          </div>

          {amountCents >= COMPLIANCE_REVIEW_THRESHOLD_CENTS && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>High-Value Compliance Gate:</strong> This transaction meets the $10,000 threshold and will enter the Operations Transfer Review queue for authorized sign-off.
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('form')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50 cursor-pointer"
            >
              Back & Modify
            </button>
            <button
              type="button"
              onClick={handleConfirmAndExecute}
              disabled={isSubmitting}
              className="px-5 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Committing to Ledger...' : 'Confirm & Authorize Debit'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION RECEIPT */}
      {step === 'success' && lastReceipt && (
        <div className="bg-white p-6 rounded-md border border-slate-200 shadow-md space-y-5 animate-in fade-in">
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {lastReceipt.requiresReview ? 'Transfer Submitted for Review' : 'Transfer Successfully Executed'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authoritative transaction reference identifier:{' '}
              <span className="font-mono font-bold text-slate-900">{lastReceipt.referenceNumber}</span>
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span
                className={`font-semibold uppercase ${
                  lastReceipt.requiresReview ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {lastReceipt.requiresReview ? 'PENDING COMPLIANCE REVIEW' : 'COMPLETED & SETTLED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Debited:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatCurrency(lastReceipt.totalDebitCents)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Debited From:</span>
              <span className="text-slate-800 font-medium">{lastReceipt.sourceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transferred To:</span>
              <span className="text-slate-800 font-medium">{lastReceipt.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Memo:</span>
              <span className="text-slate-800 italic">"{lastReceipt.description}"</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Initiate Another Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
