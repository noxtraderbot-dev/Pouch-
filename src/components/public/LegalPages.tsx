import React from 'react';
import { X, Building2, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'disclosures';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const content = {
    terms: {
      title: 'Institutional Commercial Banking Terms of Service',
      date: 'Effective Date: October 14, 2026',
      sections: [
        {
          heading: '1. Depository Agreement & Account Authority',
          text: 'These Commercial Banking Terms of Service govern all business, personal, and escrow accounts maintained with JP Morgan Chase Bank, N.A. ("Bank"). By establishing or utilizing an account, the Client confirms that all authorized signatories possess requisite corporate power and authorization.',
        },
        {
          heading: '2. Electronic Funds Transfers & Ledger Settlement',
          text: 'Transfers executed through the platform are governed by Article 4A of the Uniform Commercial Code (UCC 4A) and Federal Reserve Regulation J for Fedwire transfers. Internal transfers between accounts within the Bank are settled immediately on the authoritative double-entry ledger. External outbound transfers are subject to automated fraud screening, velocity limits, and daily cut-off deadlines.',
        },
        {
          heading: '3. Security Controls & Dual Authorization',
          text: 'The Client agrees to maintain strict security of all credentials, cryptographic session keys, and two-factor authentication devices. Transfers meeting or exceeding compliance thresholds require designated administrative review prior to final settlement.',
        },
      ],
    },
    privacy: {
      title: 'Institutional Financial Privacy Policy',
      date: 'Last Revised: October 14, 2026',
      sections: [
        {
          heading: '1. Information Collected for Banking Operations',
          text: 'We collect personal identification data, corporate formation records, and transactional ledger entries necessary to provide depository services, satisfy Bank Secrecy Act / Anti-Money Laundering (BSA/AML) compliance, and verify authorized account holders.',
        },
        {
          heading: '2. Data Minimization & Non-Disclosure',
          text: 'JP Morgan Chase Bank, N.A. does not sell client financial data or personal information. Account records are transmitted strictly over encrypted TLS 1.3 channels and stored in access-controlled environments meeting SOC 2 Type II standards.',
        },
        {
          heading: '3. Security Logs and Audit Retention',
          text: 'In accordance with federal regulatory mandates, electronic transaction records, security event logs, and administrative audit histories are retained in immutable storage for auditing and regulatory examination.',
        },
      ],
    },
    disclosures: {
      title: 'Schedule of Fees & Regulatory Disclosures',
      date: 'Effective Schedule: Q4 2026',
      sections: [
        {
          heading: '1. Fee Schedule for Depository Accounts',
          text: '• Internal Account-to-Account Transfers: $0.00 (Free)\n• Inbound Fedwire & ACH Transfers: $0.00 (Free)\n• Standard Outbound ACH Disbursements: $0.00 (Free)\n• Outbound Domestic Fedwire: $15.00 per wire\n• Monthly Depository Maintenance: $0.00 with minimum $10,000 composite balance',
        },
        {
          heading: '2. Federal Deposit Insurance Corporation (FDIC) Insurance',
          text: 'Funds on deposit with JP Morgan Chase Bank, N.A. are insured by the FDIC up to $250,000 for each account ownership category. Additional coverage may be structured through reciprocal deposit placement programs.',
        },
        {
          heading: '3. Availability of Funds (Regulation CC)',
          text: 'Electronic direct deposits and internal transfers are available on the day of deposit. Checks deposited remotely are held for standard clearing verification (up to 2 business days).',
        },
      ],
    },
  }[type];

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col p-6 animate-in fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">{content.title}</h2>
              <span className="text-[10px] text-slate-500 font-mono">{content.date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-700 leading-relaxed pr-1">
          {content.sections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="font-bold text-slate-900 text-xs">{sec.heading}</h3>
              <p className="whitespace-pre-line text-slate-600 text-[11px] leading-relaxed">
                {sec.text}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
