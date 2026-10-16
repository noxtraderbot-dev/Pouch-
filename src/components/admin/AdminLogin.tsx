/**
 * Hidden Admin Authentication Interface
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Logo } from '../common/Logo.tsx';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="text-xl font-semibold text-center text-slate-900 mb-2">Administrative Access</h2>
        <p className="text-xs text-center text-slate-500 mb-6">
          Authorized treasury personnel only. Sign in to access customer support inbox and compliance queue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
              placeholder="Enter administrator password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="text-xs font-semibold text-red-600">Incorrect password. Please verify your credentials.</p>}
          
          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer text-xs font-semibold shadow-xs"
          >
            Authenticate & Access Portal
          </button>

          <button
            type="button"
            onClick={() => {
              setPassword('admin123');
              onSuccess();
            }}
            className="w-full py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold rounded-md text-xs transition-colors cursor-pointer"
          >
            Demo One-Click Sign In (admin123)
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '';
              window.location.pathname = '/';
            }}
            className="block text-center text-xs text-slate-500 hover:text-slate-800 pt-2 cursor-pointer"
          >
            Return to Homepage
          </a>
        </form>
      </div>
    </div>
  );
};
