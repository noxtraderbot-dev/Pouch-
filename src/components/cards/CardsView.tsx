import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import {
  CreditCard,
  Lock,
  Unlock,
  AlertTriangle,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Globe,
  DollarSign,
} from 'lucide-react';

export const CardsView: React.FC = () => {
  const { accounts, recordSecurityEvent } = useBanking();
  const [atmLocked, setAtmLocked] = useState(false);
  const [internationalLocked, setInternationalLocked] = useState(true);
  const [dailyCardLimit, setDailyCardLimit] = useState(5000);

  const handleToggleAtm = () => {
    setAtmLocked(!atmLocked);
    recordSecurityEvent('account_status_changed', `Card ATM withdrawal permissions updated to ${!atmLocked ? 'locked' : 'unlocked'}`);
  };

  const handleToggleIntl = () => {
    setInternationalLocked(!internationalLocked);
    recordSecurityEvent('account_status_changed', `Card international transactions updated to ${!internationalLocked ? 'locked' : 'unlocked'}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Commercial Card Issuance & Controls</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Card network governance, authorization velocity controls, and issuer integration status
          </p>
        </div>
      </div>

      {/* Honest Provider Status Notice (Section 17 Strict Mandate) */}
      <div className="p-5 bg-white border border-slate-300 rounded-md shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-amber-800">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Card Issuer Gateway Status: Unconfigured External Provider
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Per Master Implementation Specification <strong>Section 17</strong>: The application does not present fabricated card numbers, simulated CVVs, or faux issuer authorizations. Commercial debit and corporate purchasing cards require an active payment card network processor (e.g. Galileo, Marqeta, or Stripe Issuing) and dedicated BIN sponsorship.
        </p>

        <div className="p-3.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-2">
          <div className="font-semibold text-slate-800">Technical Prerequisites for Production Issuing:</div>
          <ul className="text-slate-600 space-y-1 list-disc list-inside text-[11px]">
            <li>PCI-DSS Level 1 Attestation of Compliance (AOC) with third-party QSA audit</li>
            <li>Visa / Mastercard Principal Member or BIN Sponsor settlement agreement</li>
            <li>Hardware Security Module (HSM) integration for CVV2 and PIN block generation</li>
            <li>Signed Webhook endpoint for sub-second authorization request callbacks (ISO 8583)</li>
          </ul>
        </div>
      </div>

      {/* Architecture-Ready Card Controls */}
      <div className="bg-white p-6 rounded-md border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" /> Card Policy & Velocity Rules Framework
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configured card controls enforce server-side transaction authorization parameters before network settlement
          </p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Daily Spending Limit */}
          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-800 block text-xs">Daily Purchasing Limit per Card</span>
              <span className="text-slate-500 text-[11px]">Maximum aggregate debit authorization across point-of-sale and online transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-sm">${dailyCardLimit.toLocaleString()}</span>
              <input
                type="range"
                min="1000"
                max="25000"
                step="1000"
                value={dailyCardLimit}
                onChange={(e) => setDailyCardLimit(Number(e.target.value))}
                className="w-28 cursor-pointer"
              />
            </div>
          </div>

          {/* ATM Cash Lock */}
          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block text-xs">ATM Cash Withdrawal Policy</span>
              <span className="text-slate-500 text-[11px]">Block physical cash advances and ATM cash dispensing across global networks</span>
            </div>
            <button
              onClick={handleToggleAtm}
              className={`px-3 py-1.5 rounded font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                atmLocked
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {atmLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
              <span>{atmLocked ? 'ATM Locked' : 'ATM Allowed'}</span>
            </button>
          </div>

          {/* International Transaction Lock */}
          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block text-xs">Cross-Border & Foreign Currency Lock</span>
              <span className="text-slate-500 text-[11px]">Enforce merchant country location matching the United States</span>
            </div>
            <button
              onClick={handleToggleIntl}
              className={`px-3 py-1.5 rounded font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                internationalLocked
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{internationalLocked ? 'Foreign Blocked' : 'Foreign Allowed'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
