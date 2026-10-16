import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import { Logo } from './Logo.tsx';
import {
  Shield,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveTab, onOpenAdmin }) => {
  const { currentUser, logout, notifications, markAllNotificationsAsRead } = useBanking();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <Logo size="sm" light={true} />
        </div>

        {/* Center: Security Session Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full text-xs text-slate-300">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Banking Session</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] text-slate-400 font-mono">TLS 1.3 / AES-256</span>
        </div>

        {/* Right: Notifications & Customer Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded relative cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-md shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">Notifications ({unreadCount} new)</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No notifications recorded.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                          !notif.read ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-xs">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab('notifications');
                    }}
                    className="text-xs text-slate-700 hover:text-slate-950 font-medium cursor-pointer"
                  >
                    View All Activity Notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800 text-slate-200 cursor-pointer"
              aria-label="User profile options"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
                {currentUser?.profilePhotoUrl ? (
                  <img src={currentUser.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-amber-300">
                    {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
                  </span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-white truncate max-w-[140px]">
                  {currentUser?.displayName || 'Authorized Account'}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {currentUser?.email}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-md shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {currentUser?.displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    {currentUser?.email}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setActiveTab('profile');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" /> Profile & Settings
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setActiveTab('security');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-500" /> Security Center
                </button>

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenAdmin) {
                        onOpenAdmin();
                      } else {
                        window.location.hash = '#admin';
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-amber-700 bg-amber-50/60 hover:bg-amber-100/60 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Administrative Portal
                  </button>
                )}

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
