/**
 * Professional Public Banking Landing Page for JP MORGAN with 3D Visual Sections
 */

import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Wallet,
  ArrowRightLeft,
  FileCheck2,
  Users,
  CheckCircle2,
  PhoneCall,
  Clock,
  ChevronDown,
  ChevronUp,
  Percent,
  Check,
} from 'lucide-react';
import { Logo } from '../common/Logo.tsx';
import savingsPiggyBankImg from '../../assets/images/savings_piggy_bank_1792060820326.jpg';
import savingsMoneyJarImg from '../../assets/images/savings_money_jar_1792060835434.jpg';
import savingsCoinsBanknotesImg from '../../assets/images/savings_coins_banknotes_1792060851696.jpg';

import vaultDoorCompleteImg from '../../assets/images/vault_door_complete_1792060872355.jpg';
import vaultLockingMechanismImg from '../../assets/images/vault_locking_mechanism_1792060893666.jpg';
import vaultInteriorImg from '../../assets/images/vault_interior_1792060914736.jpg';

import { ImageCarousel } from './ImageCarousel.tsx';
import { LegalModal } from './LegalPages.tsx';

interface PublicLandingProps {
  onSignInSuccess: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenAdmin?: () => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({ onSignInSuccess, onOpenAuth, onOpenAdmin }) => {
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'disclosures' | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I open an account with JP Morgan?',
      a: 'Opening an account takes less than 3 minutes online. Click "Open an Account", provide your legal name and contact details, and create your secure password credentials. Your account will be established instantly with access to online banking.',
    },
    {
      q: 'Are deposits insured by the FDIC?',
      a: 'Yes. Qualifying depository accounts at JP Morgan are FDIC-insured up to the standard statutory maximum of $250,000 per depositor for each ownership category.',
    },
    {
      q: 'What types of fund transfers are supported?',
      a: 'We support real-time instant transfers between your accounts, outbound and inbound Automated Clearing House (ACH) network payments, and expedited same-day Federal Reserve Fedwire disbursements.',
    },
    {
      q: 'How does JP Morgan protect my account against fraud?',
      a: 'We utilize bank-grade 256-bit TLS encryption, mandatory multi-factor authentication, dual-control transfer review thresholds, and continuous automated transaction velocity monitoring.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      {/* Institutional Top Public Header — Buttons Removed as Requested */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Logo light={true} />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
            <a href="#accounts" className="hover:text-white transition-colors">
              Accounts
            </a>
            <a href="#savings-3d" className="hover:text-white transition-colors">
              Savings Experience
            </a>
            <a href="#transfers" className="hover:text-white transition-colors">
              Transfers & Payments
            </a>
            <a href="#vault-3d" className="hover:text-white transition-colors">
              Secure Vault
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
            <button
              onClick={() => setLegalModalType('disclosures')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Fee Schedule
            </button>
            <a href="#faq" className="hover:text-white transition-colors">
              Support
            </a>
            <a
              href="#admin"
              onClick={(e) => {
                if (onOpenAdmin) {
                  e.preventDefault();
                  onOpenAdmin();
                }
              }}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Admin Portal
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-white border-b border-slate-200 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Global Financial Services & Institutional Banking</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto font-serif">
              Global Financial Leadership and Uncompromising Security
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Experience transparent depository checking, high-yield savings, real-time double-entry internal settlement, and nationwide Fedwire disbursements.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 text-white font-bold rounded text-sm hover:bg-slate-800 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Create Account in Minutes</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
              <button
                onClick={() => onOpenAuth('signin')}
                className="w-full sm:w-auto px-7 py-3.5 bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded text-sm hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Sign In to Online Banking
              </button>
            </div>

            {/* Visual Architecture & Financial Services Banner */}
            <div className="pt-8 max-w-4xl mx-auto">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
                  alt="JP Morgan Headquarters"
                  className="w-full h-72 sm:h-96 object-cover object-center group-hover:scale-105 transition duration-700 opacity-90"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20 text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase rounded mb-2">
                      Institutional Grade
                    </span>
                    <h3 className="text-white text-lg sm:text-2xl font-bold tracking-tight font-serif">
                      Secure Digital Treasury & Asset Management
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Routing: 021000021</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Credibility badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>FDIC Insured up to $250,000</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>256-Bit TLS Bank-Grade Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Account Opening Fees</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Accounts & Depository Products */}
        <section id="accounts" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
              Personal & Commercial Accounts Designed for Growth
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear terms, zero hidden maintenance surcharges, and comprehensive online management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Checking */}
            <div className="bg-white p-7 rounded-md border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-900">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Premier Everyday Checking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your core transactional hub with unlimited digital ACH transfers, remote check deposit, and transparent electronic monthly statements.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>$0 Monthly Maintenance with qualifying activity</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant internal account-to-account settlement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Digital check clearing with 2-day availability</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded hover:bg-slate-800 cursor-pointer"
                >
                  Open Checking Account
                </button>
              </div>
            </div>

            {/* Savings */}
            <div className="bg-white p-7 rounded-md border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-amber-50 rounded-md flex items-center justify-center text-amber-700">
                  <Percent className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">High-Yield Growth Savings</h3>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold font-mono">
                    4.85% APY
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Accelerate your liquid reserves with daily compounded interest, automated sweep rules, and complete liquidity whenever needed.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Top-tier market-leading interest yield</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No lock-in periods or withdrawal penalties</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>FDIC insured up to federal maximum limits</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded hover:bg-slate-800 cursor-pointer"
                >
                  Open Savings Account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Visual Section One: Premium Savings Experience */}
        <section id="savings-3d" className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-amber-400 font-medium">
                <Percent className="w-3.5 h-3.5" />
                <span>Thoughtful Accumulation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif">
                Make Every Saving Count.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Build toward your goals with a smarter, more thoughtful way to save. Experience real-time coin accumulation and automated compounding designed for long-term security.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Open Savings Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative flex flex-col items-center">
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 relative h-80 sm:h-96">
                <ImageCarousel
                  images={[
                    { url: savingsPiggyBankImg, alt: 'Classic ceramic piggy bank with gold coins' },
                    { url: savingsMoneyJarImg, alt: 'Glass savings jar filled with banknotes and coins' },
                    { url: savingsCoinsBanknotesImg, alt: 'Neatly organized stacks of currency and bullion coins' }
                  ]}
                  intervalMs={2000}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Transfers & Money Movement */}
        <section id="transfers" className="bg-white border-b border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
                Seamless Payment Convenience & Settlement Rails
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Move funds with double-entry precision and dual-step confirmation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-50 rounded-md border border-slate-200 space-y-3">
                <div className="w-9 h-9 bg-white rounded flex items-center justify-center text-slate-800 border border-slate-200">
                  <ArrowRightLeft className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Instant Internal Transfers</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Transfer between your checking, savings, and reserve accounts with zero fees and immediate double-entry ledger settlement.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-md border border-slate-200 space-y-3">
                <div className="w-9 h-9 bg-white rounded flex items-center justify-center text-slate-800 border border-slate-200">
                  <Building2 className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Federal Reserve Fedwire</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Execute high-value commercial disbursements through domestic Fedwire channels with same-day settlement before standard cut-off times.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-md border border-slate-200 space-y-3">
                <div className="w-9 h-9 bg-white rounded flex items-center justify-center text-slate-800 border border-slate-200">
                  <FileCheck2 className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Digital Invoicing & Payees</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Save verified business beneficiaries and create formal payment requests with shareable reference identifiers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Visual Section Two: Premium Vault Experience */}
        <section id="vault-3d" className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative flex flex-col items-center order-2 lg:order-1">
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 relative h-80 sm:h-96">
                <ImageCarousel
                  images={[
                    { url: vaultDoorCompleteImg, alt: 'Complete circular steel bank vault door' },
                    { url: vaultLockingMechanismImg, alt: 'Close-up precision vault door locking mechanism' },
                    { url: vaultInteriorImg, alt: 'Secure private depository vault interior with safety deposit boxes' }
                  ]}
                  intervalMs={2000}
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-800 font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-700" />
                <span>Absolute Asset Protection</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
                Your Money Deserves a Strong Foundation.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Keep your financial goals in focus with a banking experience designed around clarity, control, and confidence. Our high-security architecture protects your reserves at every layer.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Explore Account Security</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        </section>





        {/* Section 3: Institutional Security */}
        <section id="security" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
              Bank-Grade Security Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Rigorous controls designed to safeguard your corporate and personal assets at all times
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-2">
              <Lock className="w-5 h-5 text-slate-800" />
              <h3 className="text-xs font-bold text-slate-900">256-Bit TLS Encryption</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                All communications and financial data movements travel through encrypted TLS 1.3 tunnels.
              </p>
            </div>

            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-2">
              <ShieldCheck className="w-5 h-5 text-slate-800" />
              <h3 className="text-xs font-bold text-slate-900">FDIC Deposit Insurance</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Eligible deposits are insured up to $250,000 per depositor under federal regulatory protections.
              </p>
            </div>

            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-2">
              <Clock className="w-5 h-5 text-slate-800" />
              <h3 className="text-xs font-bold text-slate-900">Session Guard & Inactivity</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Automatic session timeout policies prevent unauthorized access from abandoned devices.
              </p>
            </div>

            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs space-y-2">
              <Users className="w-5 h-5 text-slate-800" />
              <h3 className="text-xs font-bold text-slate-900">Dual Authorization Controls</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                High-value disbursements undergo compliance review before final settlement execution.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: FAQ */}
        <section id="faq" className="bg-white border-t border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
                Frequently Asked Banking Questions
              </h2>
              <p className="text-xs text-slate-500">
                Clear answers regarding accounts, transfers, and security
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-slate-200 rounded-md overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 bg-slate-50 hover:bg-slate-100/70 text-left font-semibold text-slate-900 flex justify-between items-center cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white text-slate-600 leading-relaxed border-t border-slate-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Prominent Bottom CTA Bar */}
        <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif">
              Ready to Establish Your Commercial or Personal Account?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join thousands of businesses and individuals who rely on JP Morgan for authoritative ledger management.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors shadow-sm cursor-pointer"
              >
                Create Account in Minutes
              </button>
              <button
                onClick={() => onOpenAuth('signin')}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded text-xs transition-colors cursor-pointer border border-slate-700"
              >
                Sign In to Existing Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Conventional Banking Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold tracking-wider font-serif">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>JP MORGAN & CO.</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Global financial services firm providing commercial treasury, investment banking, and asset management.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Charter #8491-FED • Routing Transit: 021000021
            </div>
          </div>

          <div>
            <div className="text-white font-semibold mb-2.5">Banking Products</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>Premier Everyday Checking</li>
              <li>High-Yield Growth Savings (4.85% APY)</li>
              <li>Client Escrow & Reserve Depository</li>
              <li>Same-Day Fedwire & Electronic ACH</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-2.5">Legal & Disclosures</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => setLegalModalType('terms')}
                  className="hover:text-white cursor-pointer"
                >
                  Commercial Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLegalModalType('privacy')}
                  className="hover:text-white cursor-pointer"
                >
                  Financial Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLegalModalType('disclosures')}
                  className="hover:text-white cursor-pointer"
                >
                  Schedule of Fees & Disclosures
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-2.5">Assistance & Support</div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                <span>Client Desk: +1 (800) 555-0199</span>
              </div>
              <div>24/7 Fraud Hotline: +1 (888) 555-LOCK</div>
              <div>Headquarters: 383 Madison Avenue, New York, NY</div>
              <div className="pt-1.5">
                <a
                  href="#admin"
                  onClick={(e) => {
                    if (onOpenAdmin) {
                      e.preventDefault();
                      onOpenAdmin();
                    }
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Administrative & Ops Portal</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 JP Morgan Chase & Co. All rights reserved. Member FDIC. Equal Housing Lender.
          </div>
          <div>
            Standard Deposit Insurance up to $250,000 per depositor.
          </div>
        </div>
      </footer>

      {/* Legal Disclosures Modal */}
      {legalModalType && (
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </div>
  );
};
