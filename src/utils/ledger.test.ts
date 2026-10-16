import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dollarsToCents,
  centsToDollars,
  formatCurrency,
} from './currency.ts';
import {
  validateTransferRequest,
  executeDoubleEntryPosting,
  isValidStateTransition,
  canPerformAction,
  COMPLIANCE_REVIEW_THRESHOLD_CENTS,
} from './ledger.ts';
import { BankAccount } from '../types/banking.ts';

const mockSourceAccount: BankAccount = {
  id: 'acc-checking-001',
  ownerUid: 'user-123',
  accountName: 'Premier Commercial Checking',
  accountType: 'checking',
  accountNumberMasked: '•••• 4912',
  accountNumberFull: '109283744912',
  routingNumber: '021000021',
  currency: 'USD',
  status: 'active',
  availableBalanceCents: 500_000, // $5,000.00
  ledgerBalanceCents: 500_000,
  pendingDebitsCents: 0,
  pendingCreditsCents: 0,
  dailyTransferLimitCents: 2_000_000, // $20,000.00
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockDestAccount: BankAccount = {
  id: 'acc-savings-002',
  ownerUid: 'user-123',
  accountName: 'High-Yield Treasury Savings',
  accountType: 'savings',
  accountNumberMasked: '•••• 8821',
  accountNumberFull: '109283748821',
  routingNumber: '021000021',
  currency: 'USD',
  status: 'active',
  availableBalanceCents: 100_000, // $1,000.00
  ledgerBalanceCents: 100_000,
  pendingDebitsCents: 0,
  pendingCreditsCents: 0,
  dailyTransferLimitCents: 1_000_000,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

test('Currency conversion handles minor units without float errors', () => {
  assert.equal(dollarsToCents('100.50'), 10050);
  assert.equal(dollarsToCents('$1,234.56'), 123456);
  assert.equal(centsToDollars(123456), 1234.56);
  assert.equal(formatCurrency(10050, 'USD'), '$100.50');
});

test('Transfer validation passes for valid amount within balance and limits', () => {
  const result = validateTransferRequest(mockSourceAccount, 100_000); // $1,000
  assert.equal(result.valid, true);
  assert.equal(result.requiresReview, false);
});

test('Transfer validation fails on zero or negative amounts', () => {
  const zeroResult = validateTransferRequest(mockSourceAccount, 0);
  assert.equal(zeroResult.valid, false);
  assert.equal(zeroResult.errorCode, 'INVALID_AMOUNT');

  const negResult = validateTransferRequest(mockSourceAccount, -500);
  assert.equal(negResult.valid, false);
});

test('Transfer validation prevents overdraft and insufficient funds', () => {
  const excessiveResult = validateTransferRequest(mockSourceAccount, 600_000); // Exceeds $5,000
  assert.equal(excessiveResult.valid, false);
  assert.equal(excessiveResult.errorCode, 'INSUFFICIENT_FUNDS');
});

test('Transfer validation flags amounts meeting compliance review threshold', () => {
  const highBalanceAccount: BankAccount = {
    ...mockSourceAccount,
    availableBalanceCents: 5_000_000, // $50,000
    ledgerBalanceCents: 5_000_000,
  };
  const highValueResult = validateTransferRequest(highBalanceAccount, COMPLIANCE_REVIEW_THRESHOLD_CENTS);
  assert.equal(highValueResult.valid, true);
  assert.equal(highValueResult.requiresReview, true);
});

test('Double-entry posting enforces balanced debit and credit accounting invariant', () => {
  const transferAmount = 150_000; // $1,500.00
  const fee = 0;
  const operationId = 'op-test-001';
  const transactionId = 'tx-test-001';

  const { updatedSource, updatedDestination, sourceEntry, destinationEntry } =
    executeDoubleEntryPosting(
      mockSourceAccount,
      mockDestAccount,
      transferAmount,
      fee,
      operationId,
      transactionId,
      'Internal account reallocation'
    );

  // Accounting invariant: debit amount must match credit amount
  assert.equal(sourceEntry.amountCents, destinationEntry.amountCents);
  assert.equal(sourceEntry.type, 'debit');
  assert.equal(destinationEntry.type, 'credit');

  // Balances after posting
  assert.equal(updatedSource.availableBalanceCents, 500_000 - 150_000);
  assert.equal(updatedDestination.availableBalanceCents, 100_000 + 150_000);
  assert.equal(sourceEntry.balanceAfterCents, 350_000);
  assert.equal(destinationEntry.balanceAfterCents, 250_000);

  // Conservation of total funds across accounts
  const initialTotal = mockSourceAccount.availableBalanceCents + mockDestAccount.availableBalanceCents;
  const finalTotal = updatedSource.availableBalanceCents + updatedDestination.availableBalanceCents;
  assert.equal(initialTotal, finalTotal);
});

test('State machine transitions adhere to strict banking lifecycle', () => {
  assert.equal(isValidStateTransition('draft', 'processing'), true);
  assert.equal(isValidStateTransition('draft', 'pending_review'), true);
  assert.equal(isValidStateTransition('pending_review', 'approved'), true);
  assert.equal(isValidStateTransition('processing', 'completed'), true);
  assert.equal(isValidStateTransition('completed', 'draft'), false); // Cannot revert completed
  assert.equal(isValidStateTransition('completed', 'cancelled'), false);
});

test('Role-based authorization enforces privileged operation boundaries', () => {
  assert.equal(canPerformAction('customer', 'initiate_transfer'), true);
  assert.equal(canPerformAction('customer', 'review_transfer'), false);
  assert.equal(canPerformAction('customer', 'adjust_ledger'), false);
  assert.equal(canPerformAction('customer', 'view_audit_logs'), false);

  assert.equal(canPerformAction('operations', 'review_transfer'), true);
  assert.equal(canPerformAction('operations', 'view_audit_logs'), true);
  assert.equal(canPerformAction('admin', 'adjust_ledger'), true);
});
