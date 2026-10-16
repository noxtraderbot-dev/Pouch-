import React, { useState } from 'react';
import {
  HelpCircle,
  PhoneCall,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const SupportView: React.FC = () => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What are the daily Fedwire and ACH cut-off times?',
      a: 'Same-day outbound Fedwire transfers must be submitted before 4:30 PM Eastern Time. Standard outbound ACH disbursements settle within 1–2 business days. Inbound wires credited continuously upon Federal Reserve confirmation.',
    },
    {
      q: 'How does double-entry accounting protect corporate balances?',
      a: 'Every internal reallocation or external debit is represented by mathematically balanced debit and credit entries. Balances cannot be artificially inflated or manufactured without corresponding balancing ledger entries.',
    },
    {
      q: 'What triggers a compliance transfer review?',
      a: 'Transfers meeting or exceeding $10,000.00 (or those flagged by velocity risk models) enter an administrative review queue requiring secondary operational approval before settlement.',
    },
    {
      q: 'Are deposits insured by the Federal Deposit Insurance Corporation (FDIC)?',
      a: 'Yes, qualifying depository accounts held at JP Morgan Chase Bank, N.A. are FDIC insured up to $250,000 per depositor for each account ownership category.',
    },
  ];

  const handleTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Support & Assistance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            24/7 Commercial treasury desk, fraud resolution, and verified communications
          </p>
        </div>
      </div>

      {/* Emergency Contact Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-md border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-800">
            <PhoneCall className="w-5 h-5 text-slate-700" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-900">Commercial Treasury Desk</div>
            <div className="font-mono text-slate-600 mt-0.5">+1 (800) 555-0199 (Ext. 4)</div>
            <div className="text-[10px] text-slate-400">Monday–Friday 8:00 AM – 7:00 PM EST</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-md border border-red-200 shadow-xs flex items-center gap-3 bg-red-50/20">
          <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center text-red-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-red-950">24/7 Priority Fraud & Wire Stop Hotline</div>
            <div className="font-mono text-red-700 font-bold mt-0.5">+1 (888) 555-LOCK</div>
            <div className="text-[10px] text-red-600">Immediate account freezing & investigation</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Secure Message Ticket Desk */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Open Secure Banker Inquiry</h2>
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ticket dispatched. A relationship manager will respond via encrypted channel within 2 hours.</span>
            </div>
          )}

          <form onSubmit={handleTicket} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject / Inquiry Type *</label>
              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Inbound wire tracer request"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                rows={4}
                placeholder="Please state transaction references, amounts, and relevant details..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              Transmit Encrypted Inquiry
            </button>
          </form>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <HelpCircle className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Frequently Asked Operational Inquiries</h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100/70 text-left font-semibold text-slate-900 flex justify-between items-center cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="p-3 bg-white text-slate-600 leading-relaxed border-t border-slate-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
