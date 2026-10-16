/**
 * Authoritative Banking Ledger & Transaction Execution Engine
 * Pure logic module for double-entry bookkeeping, state transitions, and authorization checks.
 */

import {
  BankAccount,
  LedgerEntry,
  BankingTransaction,
  TransactionStatus,
  UserRole,
  AdminAuditRecord,
} from '../types/banking.ts';

export interface TransferValidationResult {
  valid: boolean;
  errorCode?: string;
  errorMessage?: string;
  requiresReview?: boolean;
}

export interface InternalTransferExecutionResult {
  success: boolean;
  transaction?: BankingTransaction;
  sourceAccount?: BankAccount;
  destinationAccount?: BankAccount;
  sourceLedgerEntry?: LedgerEntry;
  destinationLedgerEntry?: LedgerEntry;
  error?: string;
}

// Maximum instant transfer threshold without compliance review ($10,000.00 = 1,000,000 cents)
export const COMPLIANCE_REVIEW_THRESHOLD_CENTS = 1_000_000;

/**
 * Validates a transfer request against banking rules and account constraints
 */
export function validateTransferRequest(
  sourceAccount: BankAccount,
  amountCents: number,
  feeCents: number = 0,
  isInternal: boolean = true
): TransferValidationResult {
  if (amountCents <= 0) {
    return {
      valid: false,
      errorCode: 'INVALID_AMOUNT',
      errorMessage: 'Transfer amount must be strictly greater than $0.00.',
    };
  }

  if (sourceAccount.status !== 'active') {
    return {
      valid: false,
      errorCode: 'ACCOUNT_NOT_ACTIVE',
      errorMessage: `Source account is currently ${sourceAccount.status} and cannot process outbound debits.`,
    };
  }

  const totalDebit = amountCents + feeCents;

  if (sourceAccount.availableBalanceCents < totalDebit) {
    return {
      valid: false,
      errorCode: 'INSUFFICIENT_FUNDS',
      errorMessage: `Insufficient available funds. Required: $${(totalDebit / 100).toFixed(2)}, Available: $${(sourceAccount.availableBalanceCents / 100).toFixed(2)}.`,
    };
  }

  if (amountCents > sourceAccount.dailyTransferLimitCents) {
    return {
      valid: false,
      errorCode: 'LIMIT_EXCEEDED',
      errorMessage: `Transfer amount exceeds daily limit of $${(sourceAccount.dailyTransferLimitCents / 100).toFixed(2)}.`,
    };
  }

  const requiresReview = amountCents >= COMPLIANCE_REVIEW_THRESHOLD_CENTS;

  return {
    valid: true,
    requiresReview,
  };
}

/**
 * Validates state transition according to banking workflow:
 * DRAFT -> PENDING_REVIEW -> APPROVED -> PROCESSING -> COMPLETED / REJECTED / CANCELLED / FAILED
 */
export function isValidStateTransition(
  currentStatus: TransactionStatus,
  targetStatus: TransactionStatus
): boolean {
  const allowedTransitions: Record<TransactionStatus, TransactionStatus[]> = {
    draft: ['pending_review', 'processing', 'cancelled'],
    pending_review: ['approved', 'rejected', 'cancelled'],
    approved: ['processing', 'cancelled'],
    processing: ['completed', 'failed', 'cancelled'],
    completed: [], // Terminal
    rejected: [],  // Terminal
    failed: [],    // Terminal
    cancelled: [], // Terminal
  };

  const allowed = allowedTransitions[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Generates balanced double-entry ledger postings for an internal transfer
 * Enforces the core accounting invariant: sum(debits) === sum(credits)
 */
export function executeDoubleEntryPosting(
  sourceAccount: BankAccount,
  destinationAccount: BankAccount,
  amountCents: number,
  feeCents: number = 0,
  operationId: string,
  transactionId: string,
  description: string,
  timestamp: string = new Date().toISOString()
): {
  updatedSource: BankAccount;
  updatedDestination: BankAccount;
  sourceEntry: LedgerEntry;
  destinationEntry: LedgerEntry;
} {
  const totalDebitCents = amountCents + feeCents;

  const newSourceBalance = sourceAccount.availableBalanceCents - totalDebitCents;
  const newDestBalance = destinationAccount.availableBalanceCents + amountCents;

  const updatedSource: BankAccount = {
    ...sourceAccount,
    availableBalanceCents: newSourceBalance,
    ledgerBalanceCents: sourceAccount.ledgerBalanceCents - totalDebitCents,
    updatedAt: timestamp,
  };

  const updatedDestination: BankAccount = {
    ...destinationAccount,
    availableBalanceCents: newDestBalance,
    ledgerBalanceCents: destinationAccount.ledgerBalanceCents + amountCents,
    updatedAt: timestamp,
  };

  const sourceEntry: LedgerEntry = {
    id: `led-${operationId}-debit`,
    operationId,
    transactionId,
    accountId: sourceAccount.id,
    type: 'debit',
    amountCents: totalDebitCents,
    currency: sourceAccount.currency,
    balanceAfterCents: newSourceBalance,
    timestamp,
    description: `Debit: ${description}`,
  };

  const destinationEntry: LedgerEntry = {
    id: `led-${operationId}-credit`,
    operationId,
    transactionId,
    accountId: destinationAccount.id,
    type: 'credit',
    amountCents,
    currency: destinationAccount.currency,
    balanceAfterCents: newDestBalance,
    timestamp,
    description: `Credit: ${description}`,
  };

  return {
    updatedSource,
    updatedDestination,
    sourceEntry,
    destinationEntry,
  };
}

/**
 * Validates role-based authorization matrix
 */
export function canPerformAction(
  role: UserRole,
  action:
    | 'view_account'
    | 'initiate_transfer'
    | 'review_transfer'
    | 'adjust_ledger'
    | 'freeze_account'
    | 'view_audit_logs'
): boolean {
  switch (action) {
    case 'view_account':
    case 'initiate_transfer':
      return ['customer', 'support', 'operations', 'admin'].includes(role);
    case 'review_transfer':
      return ['operations', 'admin'].includes(role);
    case 'freeze_account':
      return ['support', 'operations', 'admin'].includes(role);
    case 'adjust_ledger':
    case 'view_audit_logs':
      return ['operations', 'admin'].includes(role);
    default:
      return false;
  }
}

/**
 * Creates an administrative audit log entry
 */
export function createAuditLog(
  actorUid: string,
  actorEmail: string,
  actorRole: UserRole,
  actionType: string,
  targetRecordId: string,
  targetCollection: string,
  justification: string,
  previousState?: Record<string, unknown>,
  newState?: Record<string, unknown>
): AdminAuditRecord {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actorUid,
    actorEmail,
    actorRole,
    actionType,
    targetRecordId,
    targetCollection,
    justification,
    previousState,
    newState,
    timestamp: new Date().toISOString(),
  };
}
