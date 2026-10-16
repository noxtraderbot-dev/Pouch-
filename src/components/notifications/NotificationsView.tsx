import React from 'react';
import { useBanking } from '../../context/BankingContext.tsx';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Shield,
  Info,
  Check,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useBanking();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-md border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security & Activity Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Persistent audit notifications for account transactions, security events, and compliance notices
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllNotificationsAsRead}
            className="text-xs text-slate-700 hover:text-slate-950 font-semibold px-3 py-1.5 bg-slate-100 rounded cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-xs divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h2 className="text-xs font-semibold text-slate-800">No notifications</h2>
            <p className="text-[11px] text-slate-500 mt-1">You are all caught up on account and security alerts.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            return (
              <div
                key={notif.id}
                className={`p-4 flex items-start justify-between gap-3 text-xs transition-colors ${
                  !notif.read ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {notif.type === 'security' ? (
                      <Shield className="w-4 h-4 text-amber-600" />
                    ) : notif.type === 'compliance' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                    ) : (
                      <Info className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xs">{notif.message}</p>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
