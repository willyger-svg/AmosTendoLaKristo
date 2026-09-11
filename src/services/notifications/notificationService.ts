import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { NotificationItem, NotificationType } from '../../types';
import { generateId } from '../../utils/formatters';

const COLLECTION_NAME = 'notifications';

// In-memory idempotency cache: Key = `${userId}_${type}_${orderId || ticketId || quoteId}` -> timestamp
const notificationDeduplicationCache = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export class NotificationService {
  /**
   * Creates an in-app notification with idempotency protection.
   */
  async createNotification(
    item: Omit<NotificationItem, 'id'> & { id?: string }
  ): Promise<{ success: boolean; notification: NotificationItem | null; isDuplicate: boolean }> {
    const dedupeKey = `${item.userId}_${item.type}_${item.orderId || item.ticketId || item.quoteId || item.title}`;
    const nowMs = Date.now();
    const lastSentTime = notificationDeduplicationCache.get(dedupeKey);

    if (lastSentTime && nowMs - lastSentTime < DEDUPLICATION_WINDOW_MS) {
      console.info(`[NotificationService] Idempotency suppressed duplicate notification: ${dedupeKey}`);
      return { success: true, notification: null, isDuplicate: true };
    }

    const id = item.id || generateId('TK-NOTIF');
    const now = new Date().toISOString();

    const newNotification: NotificationItem = {
      id,
      userId: item.userId,
      orderId: item.orderId,
      ticketId: item.ticketId,
      quoteId: item.quoteId,
      type: item.type,
      channel: item.channel || 'in_app',
      title: item.title,
      message: item.message,
      status: item.status || 'sent',
      createdAt: item.createdAt || now,
      sentAt: item.sentAt || now,
      actionUrl: item.actionUrl,
      metadata: item.metadata
    };

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(docRef, newNotification);
      notificationDeduplicationCache.set(dedupeKey, nowMs);
      return { success: true, notification: newNotification, isDuplicate: false };
    } catch (err) {
      console.warn('Notification save notice:', err);
      return { success: false, notification: newNotification, isDuplicate: false };
    }
  }

  /**
   * Retrieves notifications for a specific user (Customer or Admin)
   */
  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', 'in', [userId, 'all', 'customer']),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const list: NotificationItem[] = [];
      querySnapshot.forEach(docSnap => list.push(docSnap.data() as NotificationItem));
      return list;
    } catch (err) {
      // Fallback query without sorting index requirement
      try {
        const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const list: NotificationItem[] = [];
        querySnapshot.forEach(docSnap => list.push(docSnap.data() as NotificationItem));
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Retrieves all notifications for staff and admin dashboard
   */
  async getAllNotifications(): Promise<NotificationItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const list: NotificationItem[] = [];
      querySnapshot.forEach(docSnap => list.push(docSnap.data() as NotificationItem));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      return [];
    }
  }

  /**
   * Marks single notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION_NAME, notificationId);
      await updateDoc(docRef, {
        status: 'read',
        readAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.warn('Error marking notification as read:', err);
      return false;
    }
  }

  /**
   * Marks all notifications for a user as read
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const list = await this.getUserNotifications(userId);
      const unread = list.filter(n => n.status !== 'read');
      const now = new Date().toISOString();

      await Promise.all(
        unread.map(n =>
          updateDoc(doc(db, COLLECTION_NAME, n.id), {
            status: 'read',
            readAt: now
          })
        )
      );
      return true;
    } catch (err) {
      console.warn('Error marking all as read:', err);
      return false;
    }
  }

  /**
   * Counts unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    const list = await this.getUserNotifications(userId);
    return list.filter(n => n.status !== 'read').length;
  }

  /**
   * Realtime listener for active notifications
   */
  listenToUserNotifications(userId: string, callback: (items: NotificationItem[]) => void): () => void {
    if (!userId) return () => {};
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
      return onSnapshot(
        q,
        snapshot => {
          const items: NotificationItem[] = [];
          snapshot.forEach(doc => items.push(doc.data() as NotificationItem));
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(items);
        },
        err => {
          console.warn('Notification snapshot notice:', err);
        }
      );
    } catch (err) {
      return () => {};
    }
  }
}

export const notificationService = new NotificationService();
