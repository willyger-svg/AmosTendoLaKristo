import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { NotificationItem } from '../../types';
import { formatDate } from '../../utils/formatters';
import { notificationService } from '../../services/notifications/notificationService';
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  FileCheck,
  Sparkles,
  CreditCard,
  Info,
  CheckCircle2,
  ExternalLink,
  Trash2
} from 'lucide-react';

interface AccountNotificationsSectionProps {
  notifications: NotificationItem[];
  onRefresh: () => void;
  showToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message: string }) => void;
  onNavigatePath: (path: string) => void;
}

export const AccountNotificationsSection: React.FC<AccountNotificationsSectionProps> = ({
  notifications,
  onRefresh,
  showToast,
  onNavigatePath
}) => {
  const { language } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') {
      return (n.status || '').toLowerCase() !== 'read';
    }
    return true;
  });

  const unreadCount = notifications.filter(n => (n.status || '').toLowerCase() !== 'read').length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      onRefresh();
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications
      .filter(n => (n.status || '').toLowerCase() !== 'read')
      .map(n => n.id);

    if (unreadIds.length === 0) return;

    try {
      await notificationService.markAllAsRead(unreadIds);
      showToast({
        type: 'success',
        title: language === 'sw' ? 'Zote Zimesomwa' : 'All Marked as Read',
        message: language === 'sw' ? 'Taarifa zote zimetiwa alama kuwa zimesomwa.' : 'All notifications marked as read.'
      });
      onRefresh();
    } catch (err) {
      console.warn('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('order')) return <ShoppingBag className="w-4 h-4 text-amber-500" />;
    if (t.includes('service') || t.includes('ticket')) return <FileCheck className="w-4 h-4 text-purple-500" />;
    if (t.includes('quote')) return <Sparkles className="w-4 h-4 text-indigo-500" />;
    if (t.includes('payment')) return <CreditCard className="w-4 h-4 text-emerald-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>{language === 'sw' ? 'Meseji & Taarifa za Akaunti' : 'Account Notifications & Alerts'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'sw'
              ? 'Mabadiliko ya oda, uthibitisho wa malipo, na maendeleo ya huduma zako.'
              : 'Updates regarding order statuses, payments, and service ticket milestones.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors min-h-[44px]"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'sw' ? 'Tia alama zote zimesomwa' : 'Mark all as read'}</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors min-h-[36px] ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'sw' ? 'Zote' : 'All'} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors min-h-[36px] ${
                filter === 'unread'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'sw' ? 'Ambazo Hazijasomwa' : 'Unread'} ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications list */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'sw' ? 'Hakuna Taarifa Zilizopo' : 'No notifications'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {filter === 'unread'
                ? (language === 'sw' ? 'Umeshasoma taarifa zote mpya.' : 'You have caught up with all your unread notifications.')
                : (language === 'sw' ? 'Bado hakuna taarifa yoyote kwenye akaunti yako.' : 'You do not have any notifications at the moment.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(item => {
            const isRead = (item.status || '').toLowerCase() === 'read';
            return (
              <div
                key={item.id}
                onClick={() => !isRead && handleMarkAsRead(item.id)}
                className={`p-4 sm:p-5 rounded-3xl border transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                  isRead
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center flex-shrink-0 shadow-xs">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs font-bold ${isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-950 dark:text-white font-black'}`}>
                        {item.title}
                      </h4>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.message}
                    </p>

                    <p className="text-[10px] text-slate-400 pt-0.5">
                      {formatDate(item.createdAt || item.sentAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.actionUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigatePath(item.actionUrl || '/account');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors min-h-[36px]"
                    >
                      <span>{language === 'sw' ? 'Fungua' : 'Open'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {!isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item.id);
                      }}
                      className="text-slate-400 hover:text-emerald-600 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title={language === 'sw' ? 'Tia alama imesomwa' : 'Mark as read'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
