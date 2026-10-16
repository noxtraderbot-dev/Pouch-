import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import {
  User,
  Mail,
  Phone,
  Globe,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, uploadProfilePhoto } = useBanking();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [timeZone, setTimeZone] = useState(currentUser?.timeZone || 'America/New_York (EST)');
  const [preferredLanguage, setPreferredLanguage] = useState(currentUser?.preferredLanguage || 'en-US');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim(),
      phone: phone.trim(),
      timeZone,
      preferredLanguage,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        await uploadProfilePhoto(e.target.files[0]);
      } catch (err) {
        console.error('Photo upload failed', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal information, contact details, and account preferences.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser?.profilePhotoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.displayName}`}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border border-slate-200"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full text-[10px]">
                Uploading...
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-slate-700 hover:text-slate-900 font-medium underline"
          >
            Change Photo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md border border-slate-200 shadow-xs space-y-5 text-xs">
        {savedFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile settings saved successfully.</span>
          </div>
        )}

        {/* Identity & Role Info */}
        <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-slate-600" /> Account Identity
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-slate-500 block text-[11px]">Email Address</span>
              <span className="font-mono font-medium text-slate-900">{currentUser?.email}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Telephone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-mono focus:bg-white focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Timezone
            </label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
            >
              <option value="America/New_York (EST)">Eastern Time</option>
              <option value="America/Chicago (CST)">Central Time</option>
              <option value="America/Denver (MST)">Mountain Time</option>
              <option value="America/Los_Angeles (PST)">Pacific Time</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Preferred Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-slate-900 focus:outline-none"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-US">Español (US)</option>
              <option value="fr-CA">Français (CA)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
