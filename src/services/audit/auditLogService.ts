import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AdminAuditLog, UserRole } from '../../types';
import { generateId } from '../../utils/formatters';

const AUDIT_COLLECTION = 'auditLogs';
const LOCAL_AUDIT_KEY = 'tk_admin_audit_cache_v1';

// Sensitive keys that must NEVER be persisted in audit logs
const SENSITIVE_KEYS = [
  'password',
  'newPassword',
  'currentPassword',
  'token',
  'secret',
  'apiKey',
  'cardNumber',
  'cvv',
  'pin'
];

function sanitizeDetails(details: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(details || {})) {
    if (SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeDetails(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class AuditLogService {
  /**
   * Authoritatively logs an administrative action to Firestore auditLogs collection.
   * Automatically sanitizes details to strip passwords and payment credentials.
   */
  async logAdminAction(
    entry: {
      action: string;
      actorId: string;
      actorEmail?: string;
      actorName?: string;
      actorRole: UserRole | 'system';
      targetType: AdminAuditLog['targetType'];
      targetId: string;
      targetTitle?: string;
      details?: Record<string, any>;
    }
  ): Promise<AdminAuditLog> {
    const now = new Date().toISOString();
    const id = generateId('AUDIT');

    const log: AdminAuditLog = {
      id,
      action: entry.action,
      actorId: entry.actorId || 'system',
      actorEmail: entry.actorEmail || '',
      actorName: entry.actorName || '',
      actorRole: entry.actorRole || 'staff',
      targetType: entry.targetType,
      targetId: entry.targetId,
      targetTitle: entry.targetTitle || '',
      details: sanitizeDetails(entry.details || {}),
      timestamp: now
    };

    try {
      const ref = doc(db, AUDIT_COLLECTION, id);
      await setDoc(ref, log);
    } catch (err) {
      console.warn('AuditLog Firestore persistence notice:', err);
    }

    // Cache locally
    try {
      const cached = this.getCachedLogs();
      const updated = [log, ...cached].slice(0, 100);
      localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(updated));
    } catch {
      // LocalStorage non-fatal
    }

    return log;
  }

  /**
   * Retrieves audit logs for Super Admin / Admin inspection.
   */
  async getAuditLogs(options?: {
    limitCount?: number;
    targetType?: string;
    action?: string;
  }): Promise<AdminAuditLog[]> {
    const max = options?.limitCount || 50;

    try {
      const constraints: any[] = [orderBy('timestamp', 'desc'), limit(max)];
      if (options?.targetType) {
        constraints.unshift(where('targetType', '==', options.targetType));
      }

      const q = query(collection(db, AUDIT_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);
      const list: AdminAuditLog[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as AdminAuditLog);
      });

      if (list.length > 0) {
        return list;
      }
    } catch (err) {
      // If composite index is pending or query fails, try basic fallback
      try {
        const qFallback = query(collection(db, AUDIT_COLLECTION), limit(max));
        const snapshot = await getDocs(qFallback);
        const list: AdminAuditLog[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as AdminAuditLog);
        });
        if (list.length > 0) {
          return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
      } catch (innerErr) {
        console.warn('AuditLog fetch fallback notice:', innerErr);
      }
    }

    // Return cached logs if Firestore has no records yet
    return this.getCachedLogs();
  }

  private getCachedLogs(): AdminAuditLog[] {
    try {
      const saved = localStorage.getItem(LOCAL_AUDIT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

export const auditLogService = new AuditLogService();
