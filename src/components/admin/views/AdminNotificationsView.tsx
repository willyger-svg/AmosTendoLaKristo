import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { notificationService } from '../../../services/notifications/notificationService';
import { NotificationItem } from '../../../types';
import { formatTimeAgo, formatDate } from '../../../utils/formatters';
import { Bell, Check, Trash2, ShoppingBag, FileCheck, Globe, CreditCard, ExternalLink } from 'lucide-react';

export const AdminNotificationsView: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const list = await notificationService.getAllNotifications();
      setNotifications(list);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status: 'read' } : n))
      );
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not mark notification as read.' });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(currentUser?.uid || 'admin');
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      showToast({ type: 'success', title: 'Success', message: 'All notifications marked as read.' });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not mark all as read.' });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'service':
        return <FileCheck className="w-4 h-4 text-purple-500" />;
      case 'quote':
        return <Globe className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Operational Notification Center</span>
          </h3>
          <p className="text-xs text-slate-400">Live operational events, customer orders, and payment alerts</p>
        </div>

        {notifications.some(n => n.status !== 'read') && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">No notifications recorded</p>
          </div>
        ) : (
          notifications.map(n => {
            const isRead = n.status === 'read';
            return (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  isRead ? 'bg-transparent' : 'bg-amber-50/40 dark:bg-amber-950/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono pt-1">
                      {formatDate(n.createdAt)} • {formatTimeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.actionUrl && (
                    <button
                      onClick={() => navigateTo(n.actionUrl!)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors"
                      title="Open Resource"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  {!isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
