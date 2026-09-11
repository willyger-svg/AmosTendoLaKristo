import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PaymentTransaction, PaymentStatus, PaymentMethod, PaymentAuditLog } from '../../types';
import { PaymentProvider, PaymentInitiateRequest, PaymentInitiateResult } from './paymentProvider';
import { mockPaymentProvider } from './providers/mockPaymentProvider';
import { tanzaniaUnifiedProvider } from './providers/tanzaniaUnifiedProvider';
import { orderService } from '../orders/orderService';
import { notificationService } from '../notifications/notificationService';
import { whatsappService } from '../notifications/whatsappService';
import { smsService } from '../notifications/smsService';
import { generateId } from '../../utils/formatters';

const COLLECTION_NAME = 'payments';
const AUDIT_COLLECTION = 'auditLogs';

export class PaymentService {
  private activeProvider: PaymentProvider;

  constructor() {
    // Select active provider based on environment configuration
    this.activeProvider = tanzaniaUnifiedProvider.isConfigured
      ? tanzaniaUnifiedProvider
      : mockPaymentProvider;
  }

  get provider(): PaymentProvider {
    return this.activeProvider;
  }

  /**
   * Initiates payment for an order and persists the transaction record to Firestore.
   */
  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResult & { transaction?: PaymentTransaction }> {
    const result = await this.activeProvider.initiatePayment(req);
    const now = new Date().toISOString();

    const paymentId = result.paymentId || generateId('TK-PAY');
    const reference = result.reference || `REF-${Date.now()}`;

    const transaction: PaymentTransaction = {
      id: paymentId,
      paymentId,
      orderId: req.orderId,
      customerId: req.customerId || '',
      customerName: req.customerName,
      customerPhone: req.customerPhone,
      customerEmail: req.customerEmail,
      provider: result.provider,
      method: req.method,
      amount: req.amount,
      currency: 'TZS',
      status: result.status,
      providerTransactionId: result.providerTransactionId,
      reference,
      customerMsisdn: req.customerMsisdn || req.customerPhone,
      createdAt: now,
      updatedAt: now,
      metadata: {
        isSandbox: result.isSandbox,
        paybillNumber: result.paybillNumber,
        accountNumber: result.accountNumber
      }
    };

    try {
      // Save payment transaction document in Firestore
      const paymentRef = doc(db, COLLECTION_NAME, paymentId);
      await setDoc(paymentRef, transaction);

      // Send initial notification if customer ID exists
      if (req.customerId) {
        await notificationService.createNotification({
          userId: req.customerId,
          orderId: req.orderId,
          type: result.status === 'pending' ? 'payment_pending' : 'order_created',
          channel: 'in_app',
          title: `Payment Initiated: ${paymentId}`,
          message: `Your payment of TSh ${req.amount.toLocaleString()} via ${req.method.toUpperCase()} for order ${req.orderId} is ${result.status}.`,
          status: 'sent',
          createdAt: now,
          actionUrl: `/track-order`
        });
      }
    } catch (err) {
      console.warn('Firestore payment record save notice:', err);
    }

    return {
      ...result,
      paymentId,
      reference,
      transaction
    };
  }

  /**
   * Authoritatively verifies and completes payment for an order.
   * Updates Payment transaction, Order paymentStatus, and triggers notifications.
   */
  async verifyAndProcessPayment(
    paymentId: string,
    verifiedStatus: PaymentStatus = 'successful',
    providerTxnId?: string,
    verifierRole: string = 'system'
  ): Promise<{ success: boolean; transaction: PaymentTransaction | null; message: string }> {
    const now = new Date().toISOString();
    let currentTxn = await this.getPaymentById(paymentId);

    if (!currentTxn) {
      return { success: false, transaction: null, message: 'Payment record not found.' };
    }

    // Idempotency: If already marked successful, don't duplicate processing or notifications
    if (currentTxn.status === 'successful' && verifiedStatus === 'successful') {
      return {
        success: true,
        transaction: currentTxn,
        message: 'Payment was already verified and processed (Idempotent call).'
      };
    }

    const updatedTxn: PaymentTransaction = {
      ...currentTxn,
      status: verifiedStatus,
      providerTransactionId: providerTxnId || currentTxn.providerTransactionId || `TXN-VER-${Date.now()}`,
      verifiedAt: verifiedStatus === 'successful' ? now : undefined,
      updatedAt: now
    };

    try {
      // 1. Update Payment record in Firestore
      const paymentRef = doc(db, COLLECTION_NAME, paymentId);
      await updateDoc(paymentRef, {
        status: updatedTxn.status,
        providerTransactionId: updatedTxn.providerTransactionId,
        verifiedAt: updatedTxn.verifiedAt || null,
        updatedAt: now
      });

      // 2. Update Order status in Firestore
      if (updatedTxn.orderId) {
        if (verifiedStatus === 'successful') {
          await orderService.updatePaymentStatus(updatedTxn.orderId, 'Paid');
          await orderService.updateOrderStatus(updatedTxn.orderId, 'Processing');
        } else if (verifiedStatus === 'failed') {
          await orderService.updatePaymentStatus(updatedTxn.orderId, 'Failed');
        }
      }

      // 3. Log Audit trail
      await this.logAudit({
        id: generateId('AUDIT'),
        paymentId,
        orderId: updatedTxn.orderId,
        action: verifiedStatus === 'successful' ? 'verified' : 'failed',
        actorRole: verifierRole,
        details: {
          verifiedStatus,
          providerTxnId: updatedTxn.providerTransactionId
        },
        timestamp: now
      });

      // 4. Trigger In-App, WhatsApp, and SMS notifications for customer
      if (updatedTxn.customerId) {
        await notificationService.createNotification({
          userId: updatedTxn.customerId,
          orderId: updatedTxn.orderId,
          type: verifiedStatus === 'successful' ? 'payment_received' : 'payment_failed',
          channel: 'in_app',
          title: verifiedStatus === 'successful' ? 'Payment Verified & Confirmed' : 'Payment Incomplete',
          message: verifiedStatus === 'successful'
            ? `Your payment of TSh ${updatedTxn.amount.toLocaleString()} for ${updatedTxn.orderId} was received. Fulfillment is underway!`
            : `Your payment attempt for ${updatedTxn.orderId} was not completed. Please retry or contact dispatch.`,
          status: 'sent',
          createdAt: now,
          actionUrl: `/track-order`
        });
      }

      // Also trigger WhatsApp template and SMS dispatch
      if (verifiedStatus === 'successful' && updatedTxn.customerPhone) {
        await smsService.sendSms({
          to: updatedTxn.customerPhone,
          message: `TK STATIONERY: Malipo ya TSh ${updatedTxn.amount.toLocaleString()} kwa Order ${updatedTxn.orderId} yamethibitishwa. Asante!`
        });
      }

      return { success: true, transaction: updatedTxn, message: `Payment marked ${verifiedStatus}.` };
    } catch (err: any) {
      console.warn('Error during payment verification:', err);
      return { success: false, transaction: currentTxn, message: err.message || 'Verification update failed' };
    }
  }

  /**
   * Retrieves single payment document by ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentTransaction | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, paymentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as PaymentTransaction;
      }
    } catch (err) {
      console.warn('Payment lookup notice:', err);
    }
    return null;
  }

  /**
   * Retrieves payments for an order
   */
  async getPaymentsByOrder(orderId: string): Promise<PaymentTransaction[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);
      const list: PaymentTransaction[] = [];
      querySnapshot.forEach(docSnap => list.push(docSnap.data() as PaymentTransaction));
      return list;
    } catch (err) {
      console.warn('Error getting payments by order:', err);
      return [];
    }
  }

  /**
   * Retrieves all payments for a specific customer
   */
  async getPaymentsByCustomer(customerId: string): Promise<PaymentTransaction[]> {
    if (!customerId) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const list: PaymentTransaction[] = [];
      querySnapshot.forEach(docSnap => list.push(docSnap.data() as PaymentTransaction));
      return list;
    } catch (err) {
      // Fallback query without sort
      try {
        const q = query(collection(db, COLLECTION_NAME), where('customerId', '==', customerId));
        const querySnapshot = await getDocs(q);
        const list: PaymentTransaction[] = [];
        querySnapshot.forEach(docSnap => list.push(docSnap.data() as PaymentTransaction));
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Alias for getPaymentsByCustomer
   */
  async getCustomerPayments(customerId: string): Promise<PaymentTransaction[]> {
    return this.getPaymentsByCustomer(customerId);
  }

  /**
   * Retrieves all payment audit logs (Staff/Admin view)
   */
  async getAuditLogs(): Promise<PaymentAuditLog[]> {
    try {
      const q = query(collection(db, AUDIT_COLLECTION), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: PaymentAuditLog[] = [];
      querySnapshot.forEach(docSnap => list.push(docSnap.data() as PaymentAuditLog));
      return list;
    } catch (err) {
      try {
        const querySnapshot = await getDocs(collection(db, AUDIT_COLLECTION));
        const list: PaymentAuditLog[] = [];
        querySnapshot.forEach(docSnap => list.push(docSnap.data() as PaymentAuditLog));
        return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Retrieves all payments in system (Staff/Admin view)
   */
  async getAllPayments(): Promise<PaymentTransaction[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: PaymentTransaction[] = [];
      querySnapshot.forEach(docSnap => list.push(docSnap.data() as PaymentTransaction));
      return list;
    } catch (err) {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const list: PaymentTransaction[] = [];
        querySnapshot.forEach(docSnap => list.push(docSnap.data() as PaymentTransaction));
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Initiates a refund request for a payment transaction
   */
  async refundPayment(paymentId: string, amount: number, reason: string, adminUid: string): Promise<{ success: boolean; message: string }> {
    const txn = await this.getPaymentById(paymentId);
    if (!txn) return { success: false, message: 'Payment record not found.' };

    const refundRes = await this.activeProvider.refundPayment(paymentId, amount, reason);
    const now = new Date().toISOString();

    const newStatus: PaymentStatus = refundRes.status === 'refunded' ? 'refunded' : 'refund_requested';

    try {
      await updateDoc(doc(db, COLLECTION_NAME, paymentId), {
        status: newStatus,
        updatedAt: now,
        'metadata.refundReason': reason,
        'metadata.refundId': refundRes.refundId || null
      });

      await this.logAudit({
        id: generateId('AUDIT'),
        paymentId,
        orderId: txn.orderId,
        action: newStatus === 'refunded' ? 'refunded' : 'refund_requested',
        actorId: adminUid,
        actorRole: 'admin',
        details: { amount, reason, refundId: refundRes.refundId },
        timestamp: now
      });

      if (txn.customerId) {
        await notificationService.createNotification({
          userId: txn.customerId,
          orderId: txn.orderId,
          type: 'system_alert',
          channel: 'in_app',
          title: `Refund Processed for ${txn.orderId}`,
          message: `A refund of TSh ${amount.toLocaleString()} was processed (${reason}).`,
          status: 'sent',
          createdAt: now
        });
      }

      return { success: true, message: `Refund marked as ${newStatus}.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Could not record refund.' };
    }
  }

  /**
   * Helper to write structured audit logs to Firestore
   */
  private async logAudit(log: PaymentAuditLog): Promise<void> {
    try {
      const ref = doc(db, AUDIT_COLLECTION, log.id);
      await setDoc(ref, log);
    } catch (err) {
      console.warn('Audit log write notice:', err);
    }
  }
}

export const paymentService = new PaymentService();
