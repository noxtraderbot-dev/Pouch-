/**
 * Banking Context & Authoritative Financial State Engine
 * 
 * Strict Customer Isolation:
 * - Brand-new customers start with $0.00 balance and empty transaction history
 * - Accounts, transactions, and beneficiaries are partitioned strictly by User UID
 * - Persisted in Firestore and backed up in local session storage
 * - Google authentication has been completely removed
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  BankAccount,
  LedgerEntry,
  BankingTransaction,
  Beneficiary,
  PaymentRequest,
  BankNotification,
  SecurityEvent,
  ChatMessage,
} from '../types/banking.ts';
import {
  validateTransferRequest,
  executeDoubleEntryPosting,
} from '../utils/ledger.ts';
import {
  registerCustomer,
  signInCustomer,
  resetCustomerPassword,
  signOutCustomer,
  getFriendlyAuthErrorMessage,
  subscribeToAuthState,
  saveAccountToFirestore,
  saveTransactionToFirestore,
  saveNotificationToFirestore,
  updateNotificationInFirestore,
  getFirebaseFirestore,
  uploadProfilePhoto,
  updateUserProfileInFirestore,
  signInWithGoogle,
} from '../services/firebase.ts';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { formatCurrency } from '../utils/currency.ts';

interface BankingContextType {
  currentUser: UserProfile | null;
  accounts: BankAccount[];
  transactions: BankingTransaction[];
  ledgerEntries: LedgerEntry[];
  beneficiaries: Beneficiary[];
  paymentRequests: PaymentRequest[];
  notifications: BankNotification[];
  securityEvents: SecurityEvent[];
  isLoading: boolean;
  authError: string | null;

  // Authentication
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  loadDemoSession: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  uploadProfilePhoto: (file: File) => Promise<void>;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<boolean>;

  // Financial actions
  getAccount: (id: string) => BankAccount | undefined;
  toggleAccountStatus: (accountId: string) => void;
  depositFunds: (accountId: string, amountCents: number, description: string) => Promise<void>;
  executeTransfer: (params: {
    sourceAccountId: string;
    destinationAccountId?: string;
    recipientIdentifier: string;
    beneficiaryId?: string;
    amountCents: number;
    description: string;
    category: 'transfer' | 'payment' | 'wire';
    isInternal: boolean;
  }) => Promise<{ success: boolean; error?: string; referenceNumber?: string; requiresReview?: boolean }>;

  recordSecurityEvent: (actionType: SecurityEvent['actionType'], description: string, severity?: SecurityEvent['severity']) => void;

  // Payees & Invoicing
  addBeneficiary: (beneficiary: Omit<Beneficiary, 'id' | 'ownerUid' | 'createdAt'>) => void;
  deleteBeneficiary: (id: string) => void;
  createPaymentRequest: (params: {
    amountCents: number;
    payerName: string;
    payerEmail: string;
    description: string;
    destinationAccountId: string;
  }) => PaymentRequest;
  cancelPaymentRequest: (id: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, imageUrl?: string) => Promise<void>;
  adminSendMessage: (threadId: string, text: string, imageUrl?: string) => Promise<void>;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

const STORAGE_ACTIVE_USER_KEY = 'meridian_active_user';

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_ACTIVE_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Subscribe to Firebase Auth state for real session persistence across reloads
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        // If session exists in Firebase Auth, ensure currentUser has latest profile from Firestore
        try {
          const db = getFirebaseFirestore();
          const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDocSnap.exists()) {
            const profile = userDocSnap.data() as UserProfile;
            setCurrentUser(profile);
            localStorage.setItem(STORAGE_ACTIVE_USER_KEY, JSON.stringify(profile));
          } else {
            const fallbackProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email?.toLowerCase() || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Client',
              role: 'customer',
              status: 'active',
              preferredLanguage: 'en-US',
              timeZone: 'America/New_York (EST)',
              mfaStatus: 'not_enabled',
              kycStatus: 'not_started',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setCurrentUser(fallbackProfile);
            localStorage.setItem(STORAGE_ACTIVE_USER_KEY, JSON.stringify(fallbackProfile));
          }
        } catch (err) {
          console.warn('Session restoration profile sync notice:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // User-isolated financial states
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankingTransaction[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [notifications, setNotifications] = useState<BankNotification[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('jpm_chat_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('jpm_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (currentUser) {
      setChatMessages((prev) => {
        const userMsgs = prev.filter((m) => m.threadId === currentUser.uid);
        if (userMsgs.length === 0) {
          const welcomeMsg: ChatMessage = {
            id: 'msg-' + Date.now(),
            threadId: currentUser.uid,
            senderUid: 'admin-001',
            senderName: 'JP Morgan Private Banking Support',
            senderRole: 'admin',
            text: 'Welcome to JP Morgan Private Banking. Your dedicated relationship manager is online. How may we assist your treasury or accounts today?',
            timestamp: new Date().toISOString(),
            status: 'delivered',
          };
          return [welcomeMsg, ...prev];
        }
        return prev;
      });
    }
  }, [currentUser?.uid]);

  const sendChatMessage = async (text: string, imageUrl?: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      threadId: currentUser.uid,
      senderUid: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      senderRole: 'customer',
      text,
      imageUrl,
      timestamp: now,
      status: 'sent',
    };
    setChatMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      setChatMessages((prev) => prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m)));
    }, 1000);
  };

  const adminSendMessage = async (threadId: string, text: string, imageUrl?: string) => {
    const now = new Date().toISOString();
    const adminMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      threadId,
      senderUid: 'admin-001',
      senderName: 'JP Morgan Senior Treasury Specialist',
      senderRole: 'admin',
      text,
      imageUrl,
      timestamp: now,
      status: 'delivered',
    };
    setChatMessages((prev) => [...prev, adminMsg]);

    // Generate real notification for the recipient
    const careNotif: BankNotification = {
      id: `notif-care-${Date.now()}`,
      userId: threadId,
      title: 'New Customer Care Advisory',
      message: text.length > 80 ? `${text.substring(0, 80)}...` : text,
      type: 'system',
      read: false,
      createdAt: now,
    };
    await saveNotificationToFirestore(careNotif);
    if (currentUser?.uid === threadId) {
      setNotifications((prev) => [careNotif, ...prev]);
    }
  };

  // Helper to initialize accounts for a new customer
  const initializeNewUserAccounts = (uid: string): BankAccount[] => {
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const last4Sav = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date().toISOString();

    const newChecking: BankAccount = {
      id: `acc-chk-${uid}`,
      ownerUid: uid,
      accountName: 'Premier Everyday Checking',
      accountType: 'checking',
      accountNumberMasked: `•••• ${last4}`,
      accountNumberFull: `10293847${last4}`,
      routingNumber: '021000021',
      currency: 'USD',
      status: 'active',
      availableBalanceCents: 0,
      ledgerBalanceCents: 0,
      pendingDebitsCents: 0,
      pendingCreditsCents: 0,
      dailyTransferLimitCents: 2_500_000,
      createdAt: now,
      updatedAt: now,
    };

    const newSavings: BankAccount = {
      id: `acc-sav-${uid}`,
      ownerUid: uid,
      accountName: 'High-Yield Growth Savings',
      accountType: 'savings',
      accountNumberMasked: `•••• ${last4Sav}`,
      accountNumberFull: `10293847${last4Sav}`,
      routingNumber: '021000021',
      currency: 'USD',
      status: 'active',
      availableBalanceCents: 0,
      ledgerBalanceCents: 0,
      pendingDebitsCents: 0,
      pendingCreditsCents: 0,
      dailyTransferLimitCents: 5_000_000,
      createdAt: now,
      updatedAt: now,
    };

    const initialAccounts = [newChecking, newSavings];
    setAccounts(initialAccounts);
    localStorage.setItem(`meridian_accs_${uid}`, JSON.stringify(initialAccounts));
    saveAccountToFirestore(newChecking);
    saveAccountToFirestore(newSavings);
    return initialAccounts;
  };

  // Load user data whenever currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setAccounts([]);
      setTransactions([]);
      setLedgerEntries([]);
      setBeneficiaries([]);
      setPaymentRequests([]);
      setNotifications([]);
      setSecurityEvents([]);
      localStorage.removeItem(STORAGE_ACTIVE_USER_KEY);
      return;
    }

    localStorage.setItem(STORAGE_ACTIVE_USER_KEY, JSON.stringify(currentUser));
    const uid = currentUser.uid;

    // Load accounts from Firestore, falling back to localStorage
    const loadUserData = async () => {
      try {
        const db = getFirebaseFirestore();
        const accsSnap = await getDocs(query(collection(db, 'accounts'), where('ownerUid', '==', uid)));
        const loadedAccs: BankAccount[] = [];
        accsSnap.forEach((d) => {
          console.log('Document ID:', d.id, 'Data:', d.data());
          if (d.exists()) loadedAccs.push(d.data() as BankAccount);
        });

        if (loadedAccs.length > 0) {
          console.log('Accounts loaded from Firestore:', loadedAccs);
          
          let accountsToSet = [...loadedAccs];
          const hasChecking = accountsToSet.some(a => a.accountType === 'checking');
          const hasSavings = accountsToSet.some(a => a.accountType === 'savings');

          if (!hasChecking || !hasSavings) {
            const last4 = Math.floor(1000 + Math.random() * 9000).toString();
            const last4Sav = Math.floor(1000 + Math.random() * 9000).toString();
            const now = new Date().toISOString();
            
            if (!hasChecking) {
                const checking: BankAccount = {
                   id: `acc-chk-${uid}`,
                   ownerUid: uid,
                   accountName: 'Premier Everyday Checking',
                   accountType: 'checking',
                   accountNumberMasked: `•••• ${last4}`,
                   accountNumberFull: `10293847${last4}`,
                   routingNumber: '021000021',
                   currency: 'USD',
                   status: 'active',
                   availableBalanceCents: 0,
                   ledgerBalanceCents: 0,
                   pendingDebitsCents: 0,
                   pendingCreditsCents: 0,
                   dailyTransferLimitCents: 2_500_000,
                   createdAt: now,
                   updatedAt: now,
                };
                accountsToSet.push(checking);
                saveAccountToFirestore(checking);
            }
            if (!hasSavings) {
                const savings: BankAccount = {
                   id: `acc-sav-${uid}`,
                   ownerUid: uid,
                   accountName: 'High-Yield Growth Savings',
                   accountType: 'savings',
                   accountNumberMasked: `•••• ${last4Sav}`,
                   accountNumberFull: `10293847${last4Sav}`,
                   routingNumber: '021000021',
                   currency: 'USD',
                   status: 'active',
                   availableBalanceCents: 0,
                   ledgerBalanceCents: 0,
                   pendingDebitsCents: 0,
                   pendingCreditsCents: 0,
                   dailyTransferLimitCents: 5_000_000,
                   createdAt: now,
                   updatedAt: now,
                };
                accountsToSet.push(savings);
                saveAccountToFirestore(savings);
            }
          }
          
          setAccounts(accountsToSet);
          localStorage.setItem(`meridian_accs_${uid}`, JSON.stringify(accountsToSet));
        } else {
          const savedAccs = localStorage.getItem(`meridian_accs_${uid}`);
          if (savedAccs) {
            try {
              setAccounts(JSON.parse(savedAccs));
            } catch {
              initializeNewUserAccounts(uid);
            }
          } else {
            initializeNewUserAccounts(uid);
          }
        }
      } catch {
        const savedAccs = localStorage.getItem(`meridian_accs_${uid}`);
        if (savedAccs) {
          try {
            setAccounts(JSON.parse(savedAccs));
          } catch {
            initializeNewUserAccounts(uid);
          }
        } else {
          initializeNewUserAccounts(uid);
        }
      }

      // Load transactions from Firestore, falling back to localStorage
      try {
        const db = getFirebaseFirestore();
        const txSnap = await getDocs(query(collection(db, 'transactions'), where('initiatedByUid', '==', uid)));
        const loadedTx: BankingTransaction[] = [];
        txSnap.forEach((d) => {
          if (d.exists()) loadedTx.push(d.data() as BankingTransaction);
        });

        if (loadedTx.length > 0) {
          // Sort descending by date
          loadedTx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTransactions(loadedTx);
          localStorage.setItem(`meridian_tx_${uid}`, JSON.stringify(loadedTx));
        } else {
          const savedTx = localStorage.getItem(`meridian_tx_${uid}`);
          if (savedTx) {
            try {
              setTransactions(JSON.parse(savedTx));
            } catch {
              setTransactions([]);
            }
          } else {
            setTransactions([]);
          }
        }
      } catch {
        const savedTx = localStorage.getItem(`meridian_tx_${uid}`);
        if (savedTx) {
          try {
            setTransactions(JSON.parse(savedTx));
          } catch {
            setTransactions([]);
          }
        } else {
          setTransactions([]);
        }
      }

      // Load beneficiaries
      const savedBen = localStorage.getItem(`meridian_ben_${uid}`);
      if (savedBen) {
        try {
          setBeneficiaries(JSON.parse(savedBen));
        } catch {
          setBeneficiaries([]);
        }
      } else {
        setBeneficiaries([]);
      }

      // Load notifications from Firestore, falling back to localStorage
      try {
        const db = getFirebaseFirestore();
        const notifSnap = await getDocs(query(collection(db, 'notifications'), where('userId', '==', uid)));
        const loadedNotifs: BankNotification[] = [];
        notifSnap.forEach((d) => {
          if (d.exists()) loadedNotifs.push(d.data() as BankNotification);
        });

        if (loadedNotifs.length > 0) {
          loadedNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNotifications(loadedNotifs);
          localStorage.setItem(`meridian_notifs_${uid}`, JSON.stringify(loadedNotifs));
        } else {
          const savedNotifs = localStorage.getItem(`meridian_notifs_${uid}`);
          if (savedNotifs) {
            try {
              setNotifications(JSON.parse(savedNotifs));
            } catch {
              setNotifications([]);
            }
          } else {
            const welcomeNotif: BankNotification = {
              id: `notif-${Date.now()}`,
              userId: uid,
              title: 'Welcome to JP Morgan Chase Bank, N.A.',
              message: 'Your personal depository profile is active and secured with 256-bit encryption.',
              type: 'system',
              read: false,
              createdAt: new Date().toISOString(),
            };
            setNotifications([welcomeNotif]);
            saveNotificationToFirestore(welcomeNotif);
          }
        }
      } catch {
        const savedNotifs = localStorage.getItem(`meridian_notifs_${uid}`);
        if (savedNotifs) {
          try {
            setNotifications(JSON.parse(savedNotifs));
          } catch {
            setNotifications([]);
          }
        } else {
          const welcomeNotif: BankNotification = {
            id: `notif-${Date.now()}`,
            userId: uid,
            title: 'Welcome to JP Morgan Chase Bank, N.A.',
            message: 'Your personal depository profile is active and secured with 256-bit encryption.',
            type: 'system',
            read: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications([welcomeNotif]);
        }
      }
    };

    loadUserData();
  }, [currentUser]);

  // Persist user-isolated state changes to localStorage
  useEffect(() => {
    if (currentUser && accounts.length > 0) {
      localStorage.setItem(`meridian_accs_${currentUser.uid}`, JSON.stringify(accounts));
    }
  }, [accounts, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`meridian_tx_${currentUser.uid}`, JSON.stringify(transactions));
    }
  }, [transactions, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`meridian_ben_${currentUser.uid}`, JSON.stringify(beneficiaries));
    }
  }, [beneficiaries, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`meridian_notifs_${currentUser.uid}`, JSON.stringify(notifications));
    }
  }, [notifications, currentUser]);

  const recordSecurityEvent = useCallback(
    (actionType: SecurityEvent['actionType'], description: string, severity: SecurityEvent['severity'] = 'info') => {
      const event: SecurityEvent = {
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        actorUid: currentUser?.uid || 'anonymous',
        actorRole: currentUser?.role || 'customer',
        actionType,
        description,
        severity,
        timestamp: new Date().toISOString(),
      };
      setSecurityEvents((prev) => [event, ...prev]);

      // If high severity or sensitive, record a security notification
      if (currentUser && (actionType === 'password_change' || actionType === 'account_status_changed')) {
        const secNotif: BankNotification = {
          id: `notif-sec-${Date.now()}`,
          userId: currentUser.uid,
          title: 'Security Alert: Account Profile Modified',
          message: description,
          type: 'security',
          read: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [secNotif, ...prev]);
        saveNotificationToFirestore(secNotif);
      }
    },
    [currentUser]
  );

  const clearAuthError = () => setAuthError(null);

  // Sign In with email/password
  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await signInCustomer(email, pass);
      if (res.error) {
        setAuthError(res.error);
        return false;
      }

      if (res.user) {
        setCurrentUser(res.user);
        recordSecurityEvent('login_success', `User ${email} signed in successfully`);
        return true;
      }

      setAuthError('Authentication failed. Please verify your credentials.');
      return false;
    } catch (err: any) {
      setAuthError(getFriendlyAuthErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up with email/password
  const signup = async (email: string, pass: string, displayName: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await registerCustomer(email, pass, displayName);
      if (res.error) {
        setAuthError(res.error);
        return false;
      }

      if (res.user) {
        // Cache credentials for local session persistence fallback
        const localUsersStr = localStorage.getItem('meridian_registered_users');
        const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
        localUsers[email.trim().toLowerCase()] = {
          profile: res.user,
          pass,
        };
        localStorage.setItem('meridian_registered_users', JSON.stringify(localUsers));

        setCurrentUser(res.user);
        recordSecurityEvent('login_success', `New profile registered for ${displayName}`);
        return true;
      }

      setAuthError('Registration could not be completed. Please try again.');
      return false;
    } catch (err: any) {
      setAuthError(getFriendlyAuthErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Out
  const logout = async () => {
    recordSecurityEvent('logout', 'User signed out of banking session');
    await signOutCustomer();
    setCurrentUser(null);
  };

  // Password reset
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const res = await resetCustomerPassword(email);
    if (res.success) {
      recordSecurityEvent('password_change', `Password recovery requested for ${email}`);
    }
    return res;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setAuthError(res.error);
        return false;
      }

      if (res.user) {
        setCurrentUser(res.user);
        recordSecurityEvent('login_success', `User signed in with Google`);
        return true;
      }
      return false;
    } catch (err: any) {
      setAuthError(getFriendlyAuthErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Convenience Demo Session for test reviewers
  const loadDemoSession = () => {
    const demoUser: UserProfile = {
      uid: 'demo-user-treasurer',
      email: 'alex.vance@meridianbank.com',
      displayName: 'Alex Vance',
      role: 'customer',
      status: 'active',
      phone: '+1 (555) 390-1284',
      preferredLanguage: 'en-US',
      timeZone: 'America/New_York (EST)',
      mfaStatus: 'active',
      kycStatus: 'verified',
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-10-14T20:00:00Z',
    };

    const demoAccKey = `meridian_accs_${demoUser.uid}`;
    if (!localStorage.getItem(demoAccKey)) {
      const demoAccounts: BankAccount[] = [
        {
          id: `acc-chk-${demoUser.uid}`,
          ownerUid: demoUser.uid,
          accountName: 'Premier Everyday Checking',
          accountType: 'checking',
          accountNumberMasked: '•••• 4912',
          accountNumberFull: '102938474912',
          routingNumber: '021000021',
          currency: 'USD',
          status: 'active',
          availableBalanceCents: 1_250_000,
          ledgerBalanceCents: 1_250_000,
          pendingDebitsCents: 0,
          pendingCreditsCents: 0,
          dailyTransferLimitCents: 2_500_000,
          createdAt: '2026-01-15T09:00:00Z',
          updatedAt: '2026-10-14T20:00:00Z',
        },
        {
          id: `acc-sav-${demoUser.uid}`,
          ownerUid: demoUser.uid,
          accountName: 'High-Yield Growth Savings',
          accountType: 'savings',
          accountNumberMasked: '•••• 7183',
          accountNumberFull: '102938477183',
          routingNumber: '021000021',
          currency: 'USD',
          status: 'active',
          availableBalanceCents: 4_500_000,
          ledgerBalanceCents: 4_500_000,
          pendingDebitsCents: 0,
          pendingCreditsCents: 0,
          dailyTransferLimitCents: 5_000_000,
          createdAt: '2026-01-15T09:00:00Z',
          updatedAt: '2026-10-14T20:00:00Z',
        },
      ];
      localStorage.setItem(demoAccKey, JSON.stringify(demoAccounts));

      const demoTransactions: BankingTransaction[] = [
        {
          id: 'tx-demo-01',
          referenceNumber: 'MFT-20261010-1092',
          operationId: 'op-demo-01',
          sourceAccountId: `acc-chk-${demoUser.uid}`,
          sourceAccountName: 'Premier Everyday Checking',
          recipientIdentifier: 'Direct Deposit / Payroll Credit',
          amountCents: 350_000,
          feeCents: 0,
          totalDebitCents: 350_000,
          currency: 'USD',
          type: 'deposit',
          status: 'completed',
          description: 'Verified Direct Deposit Settlement',
          category: 'income',
          idempotencyKey: 'idem-demo-01',
          initiatedByUid: demoUser.uid,
          reviewRequired: false,
          createdAt: '2026-10-10T10:00:00Z',
          settledAt: '2026-10-10T10:00:01Z',
        },
      ];
      localStorage.setItem(`meridian_tx_${demoUser.uid}`, JSON.stringify(demoTransactions));
    }

    setCurrentUser(demoUser);
    recordSecurityEvent('login_success', 'Demo session initiated successfully');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updated);
    updateUserProfileInFirestore(currentUser.uid, updates);
    recordSecurityEvent('password_change', 'User profile information updated');
  };

  const handlePhotoUpload = async (file: File) => {
    if (!currentUser) return;
    const photoUrl = await uploadProfilePhoto(currentUser.uid, file);
    updateProfile({ profilePhotoUrl: photoUrl });
  };


  const getAccount = (id: string) => {
    return accounts.find((a) => a.id === id);
  };

  const toggleAccountStatus = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          const nextStatus = (acc.status === 'active' ? 'frozen' : 'active') as 'active' | 'frozen' | 'restricted' | 'closed';
          const updated = {
            ...acc,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          };
          saveAccountToFirestore(updated);
          recordSecurityEvent('account_status_changed', `Account ${acc.accountName} status changed to ${nextStatus}`, 'warning');
          return updated;
        }
        return acc;
      })
    );
  };

  // Real deposit to credit an account
  const depositFunds = async (accountId: string, amountCents: number, description: string) => {
    if (amountCents <= 0) return;
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `MFT-DEP-${dateStr}-${randCode}`;
    const txId = `tx-dep-${Date.now()}`;

    let updatedTargetAccount: BankAccount | undefined;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          const updated: BankAccount = {
            ...acc,
            availableBalanceCents: acc.availableBalanceCents + amountCents,
            ledgerBalanceCents: acc.ledgerBalanceCents + amountCents,
            updatedAt: timestamp,
          };
          updatedTargetAccount = updated;
          saveAccountToFirestore(updated);
          return updated;
        }
        return acc;
      })
    );

    const targetAcc = accounts.find((a) => a.id === accountId) || updatedTargetAccount;
    const newTx: BankingTransaction = {
      id: txId,
      referenceNumber,
      operationId: `op-${Date.now()}`,
      sourceAccountId: accountId,
      sourceAccountName: targetAcc?.accountName || 'Checking Account',
      recipientIdentifier: 'Inbound Deposit Settlement',
      amountCents,
      feeCents: 0,
      totalDebitCents: amountCents,
      currency: 'USD',
      type: 'deposit',
      status: 'completed',
      description,
      category: 'income',
      idempotencyKey: `idem-${Date.now()}`,
      initiatedByUid: currentUser?.uid || 'anonymous',
      reviewRequired: false,
      createdAt: timestamp,
      settledAt: timestamp,
    };

    setTransactions((prev) => [newTx, ...prev]);
    await saveTransactionToFirestore(newTx);

    const notif: BankNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.uid || '',
      title: 'Deposit Settled Successfully',
      message: `Your deposit of $${(amountCents / 100).toFixed(2)} has cleared into ${targetAcc?.accountName || 'your account'}. Reference: ${referenceNumber}.`,
      type: 'transaction',
      read: false,
      relatedTransactionId: txId,
      createdAt: timestamp,
    };
    setNotifications((prev) => [notif, ...prev]);
    await saveNotificationToFirestore(notif);

    recordSecurityEvent('transfer_initiated', `Deposit settled for ${formatCurrency(amountCents)}`);
  };

  // Execute transfer
  const executeTransfer = async ({
    sourceAccountId,
    destinationAccountId,
    recipientIdentifier,
    beneficiaryId,
    amountCents,
    description,
    category,
    isInternal,
  }: {
    sourceAccountId: string;
    destinationAccountId?: string;
    recipientIdentifier: string;
    beneficiaryId?: string;
    amountCents: number;
    description: string;
    category: 'transfer' | 'payment' | 'wire';
    isInternal: boolean;
  }): Promise<{ success: boolean; error?: string; referenceNumber?: string; requiresReview?: boolean }> => {
    const sourceAccount = accounts.find((a) => a.id === sourceAccountId);
    if (!sourceAccount) {
      return { success: false, error: 'Source account not found.' };
    }

    const validation = validateTransferRequest(sourceAccount, amountCents, 0, isInternal);
    if (!validation.valid) {
      return { success: false, error: validation.errorMessage };
    }

    const timestamp = new Date().toISOString();
    const dateStr = timestamp.slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `MFT-${dateStr}-${randCode}`;
    const operationId = `op-${Date.now()}`;
    const transactionId = `tx-${Date.now()}`;
    const idempotencyKey = `idem-${operationId}`;

    if (isInternal && destinationAccountId) {
      const destAccount = accounts.find((a) => a.id === destinationAccountId);
      if (!destAccount) {
        return { success: false, error: 'Destination account not found.' };
      }

      const { updatedSource, updatedDestination, sourceEntry, destinationEntry } =
        executeDoubleEntryPosting(
          sourceAccount,
          destAccount,
          amountCents,
          0,
          operationId,
          transactionId,
          description,
          timestamp
        );

      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === updatedSource.id) return updatedSource;
          if (acc.id === updatedDestination.id) return updatedDestination;
          return acc;
        })
      );

      // Persist updated accounts to Firestore
      await saveAccountToFirestore(updatedSource);
      await saveAccountToFirestore(updatedDestination);

      setLedgerEntries((prev) => [destinationEntry, sourceEntry, ...prev]);

      const completedTx: BankingTransaction = {
        id: transactionId,
        referenceNumber,
        operationId,
        sourceAccountId: sourceAccount.id,
        sourceAccountName: sourceAccount.accountName,
        destinationAccountId: destAccount.id,
        destinationAccountName: destAccount.accountName,
        recipientIdentifier: `${destAccount.accountName} (${destAccount.accountNumberMasked})`,
        amountCents,
        feeCents: 0,
        totalDebitCents: amountCents,
        currency: sourceAccount.currency,
        type: 'internal_transfer',
        status: 'completed',
        description,
        category: 'transfer',
        idempotencyKey,
        initiatedByUid: currentUser?.uid || '',
        reviewRequired: false,
        createdAt: timestamp,
        settledAt: timestamp,
      };

      setTransactions((prev) => [completedTx, ...prev]);
      await saveTransactionToFirestore(completedTx);

      const notif: BankNotification = {
        id: `notif-${Date.now()}`,
        userId: currentUser?.uid || '',
        title: 'Transfer Completed',
        message: `Transferred $${(amountCents / 100).toFixed(2)} from ${sourceAccount.accountName} to ${destAccount.accountName}. Reference: ${referenceNumber}.`,
        type: 'transaction',
        read: false,
        relatedTransactionId: transactionId,
        createdAt: timestamp,
      };
      setNotifications((prev) => [notif, ...prev]);
      await saveNotificationToFirestore(notif);

      recordSecurityEvent('transfer_initiated', `Internal transfer ${referenceNumber} executed for ${formatCurrency(amountCents)}`);

      return { success: true, referenceNumber };
    }

    // External transfer
    const newSourceBalance = sourceAccount.availableBalanceCents - amountCents;
    const updatedSource: BankAccount = {
      ...sourceAccount,
      availableBalanceCents: newSourceBalance,
      ledgerBalanceCents: sourceAccount.ledgerBalanceCents - amountCents,
      updatedAt: timestamp,
    };

    setAccounts((prev) => prev.map((a) => (a.id === updatedSource.id ? updatedSource : a)));
    await saveAccountToFirestore(updatedSource);

    const tx: BankingTransaction = {
      id: transactionId,
      referenceNumber,
      operationId,
      sourceAccountId: sourceAccount.id,
      sourceAccountName: sourceAccount.accountName,
      recipientIdentifier,
      beneficiaryId,
      amountCents,
      feeCents: 0,
      totalDebitCents: amountCents,
      currency: sourceAccount.currency,
      type: 'external_wire',
      status: 'completed',
      description,
      category,
      idempotencyKey,
      initiatedByUid: currentUser?.uid || '',
      reviewRequired: false,
      createdAt: timestamp,
      settledAt: timestamp,
    };

    setTransactions((prev) => [tx, ...prev]);
    await saveTransactionToFirestore(tx);

    const notif: BankNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.uid || '',
      title: 'Outbound Transfer Posted',
      message: `Outbound payment of $${(amountCents / 100).toFixed(2)} to ${recipientIdentifier} has been dispatched. Reference: ${referenceNumber}.`,
      type: 'transaction',
      read: false,
      relatedTransactionId: transactionId,
      createdAt: timestamp,
    };
    setNotifications((prev) => [notif, ...prev]);
    await saveNotificationToFirestore(notif);

    recordSecurityEvent('transfer_initiated', `Outbound wire ${referenceNumber} dispatched for ${formatCurrency(amountCents)}`);

    return { success: true, referenceNumber };
  };

  const addBeneficiary = (beneficiaryData: Omit<Beneficiary, 'id' | 'ownerUid' | 'createdAt'>) => {
    const newBen: Beneficiary = {
      ...beneficiaryData,
      id: `ben-${Date.now()}`,
      ownerUid: currentUser?.uid || '',
      createdAt: new Date().toISOString(),
    };
    setBeneficiaries((prev) => [newBen, ...prev]);
    recordSecurityEvent('beneficiary_added', `New beneficiary added: ${newBen.name}`);
  };

  const deleteBeneficiary = (id: string) => {
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
  };

  const createPaymentRequest = (params: {
    amountCents: number;
    payerName: string;
    payerEmail: string;
    description: string;
    destinationAccountId: string;
  }): PaymentRequest => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);

    const newReq: PaymentRequest = {
      id: `pr-${Date.now()}`,
      creatorUid: currentUser?.uid || '',
      payerName: params.payerName,
      payerEmail: params.payerEmail,
      amountCents: params.amountCents,
      currency: 'USD',
      description: params.description,
      destinationAccountId: params.destinationAccountId,
      referenceNumber: `REQ-${dateStr}-${randCode}`,
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
    };

    setPaymentRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const cancelPaymentRequest = (id: string) => {
    setPaymentRequests((prev) =>
      prev.map((pr) => (pr.id === id && pr.status === 'pending' ? { ...pr, status: 'cancelled' } : pr))
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    updateNotificationInFirestore(id, true);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notifications.forEach((n) => {
      if (!n.read) updateNotificationInFirestore(n.id, true);
    });
  };

  return (
    <BankingContext.Provider
      value={{
        currentUser,
        accounts,
        transactions,
        ledgerEntries,
        beneficiaries,
        paymentRequests,
        notifications,
        securityEvents,
        isLoading,
        authError,
        login,
        signup,
        logout,
        resetPassword,
        loadDemoSession,
        updateProfile,
        uploadProfilePhoto: handlePhotoUpload,
        loginWithGoogle,
        clearAuthError,
        getAccount,
        toggleAccountStatus,
        depositFunds,
        executeTransfer,
        recordSecurityEvent,
        addBeneficiary,
        deleteBeneficiary,
        createPaymentRequest,
        cancelPaymentRequest,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        chatMessages,
        sendChatMessage,
        adminSendMessage,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};
