import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Laptop,
} from 'lucide-react';

export const SecurityView: React.FC = () => {
  const { currentUser, securityEvents, recordSecurityEvent } = useBanking();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 10) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 10 characters in length.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    recordSecurityEvent('password_change', 'User password successfully updated', 'info');
    setStatusMessage({ type: 'success', text: 'Password credentials successfully updated and session key refreshed.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security & Access Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-factor authentication governance, encrypted credential lifecycle, and security event auditing
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Security Score: Optimal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: MFA & Active Sessions */}
        <div className="space-y-6">
          {/* Multi-Factor Authentication */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Multi-Factor Authentication (MFA)</h2>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  currentUser?.mfaStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                {currentUser?.mfaStatus === 'active' ? 'Active' : currentUser?.mfaStatus === 'pending_setup' ? 'Pending setup' : 'Not enabled'}
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Hardware FIDO2 Security Keys or TOTP authenticator tokens are mandated for all financial movements and privileged administration operations.
            </p>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Primary MFA Method:</span>
                <span className="font-mono text-slate-900">TOTP Authenticator (RFC 6238)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Backup Phone Number:</span>
                <span className="font-mono text-slate-700">{currentUser?.phone || '+1 (555) •••• 9011'}</span>
              </div>
            </div>
          </div>

          {/* Active Session Details */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Laptop className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Active Authenticated Session</h2>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Encryption Suite:</span>
                <span className="font-mono font-medium text-slate-800">TLS 1.3 / AES_256_GCM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Session IP Geolocation:</span>
                <span className="font-medium text-slate-800">New York, US (Verified)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Idle Inactivity Timeout:</span>
                <span className="font-mono text-slate-800">15 Minutes</span>
              </div>
            </div>
          </div>

          {/* KYC Verification */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">KYC Verification</h2>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  currentUser?.kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                {currentUser?.kycStatus || 'Not started'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Verify your identity to unlock higher transfer limits and additional financial services.
            </p>
          </div>
        </div>

        {/* Right: Password Lifecycle Update */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Change Password Credentials</h2>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Institutional Password (min 10 characters) *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              Update Credentials
            </button>
          </form>
        </div>
      </div>

      {/* Security Events Audit Log (Section 21) */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Recent Security Activity Log</h2>
          <p className="text-[11px] text-slate-500">Log of your recent sign-in activity, password updates, and account security changes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Event Classification</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {securityEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                    {new Date(evt.timestamp).toLocaleDateString()} {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-800 capitalize">
                    {evt.actionType.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">{evt.description}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : evt.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
