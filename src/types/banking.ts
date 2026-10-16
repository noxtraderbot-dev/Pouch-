/**
 * Banking domain types and data models
 * Follows strict financial data architecture principles:
 * - Amounts represented in integer minor units (cents)
 * - Explicit separation of identity, profile, account, ledger, and transaction states
 * - Invariant accounting checks and role models
 */

export type UserRole = 'customer' | 'support' | 'operations' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'pending_verification';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  preferredLanguage: string;
  timeZone: string;
  mfaStatus: 'not_enabled' | 'pending_setup' | 'active';
  kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'checking' | 'savings' | 'treasury' | 'escrow';
export type AccountStatus = 'active' | 'frozen' | 'restricted' | 'closed';

export interface BankAccount {
  id: string;
  ownerUid: string;
  accountName: string;
  accountType: AccountType;
  accountNumberMasked: string; // e.g. "•••• 4892"
  accountNumberFull: string;
  routingNumber: string;
  currency: 'USD' | 'EUR' | 'GBP';
  status: AccountStatus;
  availableBalanceCents: number; // e.g. 100000 = $1,000.00
  ledgerBalanceCents: number;
  pendingDebitsCents: number;
  pendingCreditsCents: number;
  dailyTransferLimitCents: number;
  createdAt: string;
  updatedAt: string;
}

export type LedgerEntryType = 'debit' | 'credit';

export interface LedgerEntry {
  id: string;
  operationId: string;
  transactionId: string;
  accountId: string;
  type: LedgerEntryType;
  amountCents: number; // Positive integer
  currency: string;
  balanceAfterCents: number;
  timestamp: string;
  description: string;
}

export type TransactionType =
  | 'internal_transfer'
  | 'external_wire'
  | 'ach_transfer'
  | 'deposit'
  | 'withdrawal'
  | 'payment_request_settlement';

export type TransactionStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'failed'
  | 'cancelled';

export interface BankingTransaction {
  id: string;
  referenceNumber: string; // e.g. "MFT-20261014-9402"
  operationId: string;
  sourceAccountId: string;
  sourceAccountName: string;
  destinationAccountId?: string;
  destinationAccountName?: string;
  recipientIdentifier: string; // e.g. email, masked account, or beneficiary name
  beneficiaryId?: string;
  amountCents: number;
  feeCents: number;
  totalDebitCents: number;
  currency: 'USD' | 'EUR' | 'GBP';
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  category: 'transfer' | 'income' | 'payment' | 'fee' | 'wire';
  idempotencyKey: string;
  initiatedByUid: string;
  reviewRequired: boolean;
  reviewedByUid?: string;
  reviewReason?: string;
  reviewTimestamp?: string;
  failureReason?: string;
  createdAt: string;
  settledAt?: string;
}

export interface Beneficiary {
  id: string;
  ownerUid: string;
  name: string;
  nickname?: string;
  email: string;
  accountNumberMasked: string;
  routingOrBic: string;
  bankName: string;
  currency: 'USD' | 'EUR' | 'GBP';
  verified: boolean;
  createdAt: string;
}

export interface PaymentRequest {
  id: string;
  creatorUid: string;
  payerName: string;
  payerEmail: string;
  amountCents: number;
  currency: 'USD' | 'EUR' | 'GBP';
  description: string;
  destinationAccountId: string;
  referenceNumber: string;
  status: 'pending' | 'paid' | 'cancelled' | 'expired';
  paidAt?: string;
  createdAt: string;
  expiresAt: string;
}

export interface DepositOrder {
  id: string;
  accountId: string;
  amountCents: number;
  currency: 'USD' | 'EUR' | 'GBP';
  method: 'check_deposit' | 'wire_inbound' | 'ach_direct';
  reference: string;
  status: 'initiated' | 'pending' | 'processing' | 'completed' | 'rejected';
  memo: string;
  createdAt: string;
}

export interface WithdrawalOrder {
  id: string;
  accountId: string;
  amountCents: number;
  currency: 'USD' | 'EUR' | 'GBP';
  destinationBank: string;
  destinationRouting: string;
  destinationAccountMasked: string;
  reference: string;
  status: 'initiated' | 'pending_review' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface BankNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'transaction' | 'security' | 'system' | 'compliance';
  read: boolean;
  relatedTransactionId?: string;
  createdAt: string;
}

export interface SecurityEvent {
  id: string;
  actorUid: string;
  actorRole: UserRole;
  actionType:
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'password_change'
    | 'transfer_initiated'
    | 'transfer_reviewed'
    | 'beneficiary_added'
    | 'account_status_changed';
  targetReference?: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface AdminAuditRecord {
  id: string;
  actorUid: string;
  actorEmail: string;
  actorRole: UserRole;
  actionType: string;
  targetRecordId: string;
  targetCollection: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  justification: string;
  timestamp: string;
}

export interface FirebaseDeploymentStatus {
  suppliedProjectId: string;
  isProjectIdentityVerified: boolean;
  authAccessible: boolean;
  firestoreAccessible: boolean;
  analyticsAccessible: boolean;
  activeDataEngine: 'firebase_connected' | 'secure_isolated_local';
  warningMessage?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string; // User UID
  senderUid: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  imageUrl?: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}
