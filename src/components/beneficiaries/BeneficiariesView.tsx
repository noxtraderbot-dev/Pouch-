import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import {
  Users,
  Plus,
  Trash2,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRightLeft,
} from 'lucide-react';
import { formatNumberMasked } from '../../utils/currency.ts';

interface BeneficiariesViewProps {
  onNavigate: (tab: string) => void;
}

export const BeneficiariesView: React.FC<BeneficiariesViewProps> = ({ onNavigate }) => {
  const { beneficiaries, addBeneficiary, deleteBeneficiary } = useBanking();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !bankName.trim() || !accountNumber.trim()) {
      setFormError('Name, Bank Name, and Account Number are required.');
      return;
    }

    if (routingNumber.length < 9) {
      setFormError('ABA Routing transit number must be at least 9 numeric digits.');
      return;
    }

    addBeneficiary({
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@vendor.com`,
      bankName: bankName.trim(),
      routingOrBic: routingNumber.trim(),
      accountNumberMasked: formatNumberMasked(accountNumber.trim()),
      currency: 'USD',
      verified: true,
    });

    setName('');
    setNickname('');
    setEmail('');
    setBankName('');
    setRoutingNumber('');
    setAccountNumber('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-md border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Approved Beneficiaries</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified corporate and commercial payees authorized for electronic fund transfers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Beneficiary</span>
        </button>
      </div>

      {/* Beneficiaries Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
        {beneficiaries.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h2 className="text-xs font-semibold text-slate-800">No beneficiaries registered</h2>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Add your trusted vendors, corporate partners, or personal recipients to enable fast outbound transfers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Payee Legal Entity</th>
                  <th className="py-2.5 px-4">Depository Bank</th>
                  <th className="py-2.5 px-4">Account Number</th>
                  <th className="py-2.5 px-4">Routing / BIC</th>
                  <th className="py-2.5 px-4">Verification</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {beneficiaries.map((ben) => (
                  <tr key={ben.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ben.name}</div>
                      {ben.nickname && (
                        <div className="text-[11px] text-slate-500 italic">{ben.nickname}</div>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono">{ben.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ben.bankName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {ben.accountNumberMasked}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {ben.routingOrBic}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onNavigate('transfers')}
                        className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-[11px] font-medium cursor-pointer inline-flex items-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-slate-500" /> Transfer
                      </button>
                      <button
                        onClick={() => deleteBeneficiary(ben.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove beneficiary"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Approved Beneficiary</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAdd} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payee Legal Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Industrial Logistics LLC"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nickname / Internal Reference
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Primary Logistics Partner"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notification Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@vendor.com"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Depository Bank Name *
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. JPMorgan Chase Bank, N.A."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ABA Routing (9 Digits) *
                  </label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="021000021"
                    maxLength={9}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono focus:bg-white focus:border-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="482019484912"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono focus:bg-white focus:border-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Save Beneficiary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
