import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { notificationService } from '../../services/notifications/notificationService';
import { NotificationItem } from '../../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  CreditCard,
  FileCheck,
  Globe,
  X,
  ExternalLink,
  Check
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters';

interface AdminNotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection: (path: string) => void;
}

export const AdminNotificationsPopover: React.FC<AdminNotificationsPopoverProps> = ({
  isOpen,
  onClose,
  onNavigateToSection
}) => {
  const { userProfile, userRole } = useAuth();
  const { orders, serviceTickets, quoteRequests } = useApp();
  const { t, language } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Load notifications
  useEffect(() => {
    if (!isOpen) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Fetch notifications addressed to admin or staff or all
        const staffList = await notificationService.getUserNotifications('admin');
        const allList = await notificationService.getUserNotifications('all');
        const userList = userProfile ? await notificationService.getUserNotifications(userProfile.id) : [];

        const combined = [...staffList, ...allList, ...userList];
        // Deduplicate by ID
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // If no remote notifications exist yet, generate contextual live operational notices from current state
        if (unique.length === 0) {
          const generated: NotificationItem[] = [];
          const now = new Date().toISOString();

          // Check pending orders
          const pendingOrders = orders.filter(o => o.status === 'Submitted');
          if (pendingOrders.length > 0) {
            generated.push({
              id: 'gen-orders-pending',
              userId: 'admin',
              orderId: pendingOrders[0].id,
              type: 'system_alert',
              channel: 'in_app',
              title: `${pendingOrders.length} Pending Order(s) Awaiting Review`,
              message: `Latest: Order #${pendingOrders[0].id} from ${pendingOrders[0].customerName}`,
              status: 'sent',
              createdAt: pendingOrders[0].createdAt || now,
              actionUrl: '/admin/orders'
            });
          }

          // Check active tickets
          const pendingTickets = serviceTickets.filter(t => t.status === 'Received');
          if (pendingTickets.length > 0) {
            generated.push({
              id: 'gen-tickets-received',
              userId: 'admin',
              type: 'ticket_created',
              channel: 'in_app',
              title: `${pendingTickets.length} New Service Ticket(s)`,
              message: `Ticket #${pendingTickets[0].id} (${pendingTickets[0].serviceType}) requires staff attention`,
              status: 'sent',
              createdAt: pendingTickets[0].createdAt || now,
              actionUrl: '/admin/service-requests'
            });
          }

          // Check quotes
          const pendingQuotes = quoteRequests.filter(q => q.status === 'Received');
          if (pendingQuotes.length > 0) {
            generated.push({
              id: 'gen-quotes-received',
              userId: 'admin',
              type: 'quote_received',
              channel: 'in_app',
              title: `${pendingQuotes.length} Tech Quote Lead(s)`,
              message: `Project quote for ${pendingQuotes[0].serviceCategory} from ${pendingQuotes[0].name}`,
              status: 'sent',
              createdAt: pendingQuotes[0].createdAt || now,
              actionUrl: '/admin/quotes'
            });
          }

          setNotifications(generated);
        } else {
          setNotifications(unique.slice(0, 20));
        }
      } catch (err) {
        console.warn('Failed to load operational notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen, userProfile, orders, serviceTickets, quoteRequests]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status: 'read' as const, readAt: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      for (const n of notifications) {
        if (n.status !== 'read') {
          await notificationService.markAsRead(n.id);
        }
      }
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' as const, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.warn('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (n.actionUrl) {
      onNavigateToSection(n.actionUrl);
    } else if (n.orderId) {
      onNavigateToSection('/admin/orders');
    } else {
      onNavigateToSection('/admin/notifications');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col max-h-[75vh] animate-fadeIn"
    >
      {/* Popover Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('admin.notifications.title')}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => n.status !== 'read') && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              {t('admin.notifications.mark_all_read')}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Popover Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <span className="inline-block w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading operational alerts...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-emerald-500" />
            <p className="text-xs font-medium">{t('admin.notifications.empty')}</p>
          </div>
        ) : (
          notifications.map(n => {
            const isUnread = n.status !== 'read';
            const Icon =
              n.type === 'order_created' || n.type === 'order_status_update'
                ? ShoppingBag
                : n.type === 'payment_verified' || n.type === 'payment_pending'
                ? CreditCard
                : n.type === 'service_ticket_update'
                ? FileCheck
                : AlertTriangle;

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 rounded-xl cursor-pointer transition-all border flex items-start gap-3 relative group ${
                  isUnread
                    ? 'bg-amber-50/70 dark:bg-slate-800/90 border-amber-200 dark:border-amber-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isUnread
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold truncate ${isUnread ? 'text-slate-950 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </p>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 ml-1.5" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {n.message}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                    <span>{formatTimeAgo(n.createdAt)}</span>
                    {isUnread && (
                      <button
                        onClick={e => handleMarkAsRead(n.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-amber-500 flex items-center gap-1"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Popover Footer */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <button
          onClick={() => {
            onNavigateToSection('/admin/notifications');
            onClose();
          }}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5"
        >
          <span>View All System Notifications</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
