import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Order, OrderStatus } from '../../types';
import { sanitizeString, sanitizeId } from '../../utils/sanitize';

const ORDERS_COLLECTION = 'orders';

export const orderService = {
  /**
   * Create new customer order with authoritative total calculation & data validation
   */
  async createOrder(orderInput: Partial<Order> & { customerName: string; customerPhone: string; items: any[] }): Promise<Order> {
    const rawId = orderInput.id || `TK-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = sanitizeId(rawId);

    // Authoritative calculation of subtotal and total
    const sanitizedItems = (orderInput.items || []).map((item: any) => {
      const unitPrice = Math.max(0, Number(item.unitPrice || item.price || (item.product && item.product.price) || 0));
      const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));
      return {
        productId: sanitizeId(item.productId || (item.product && item.product.id) || 'item'),
        productName: sanitizeString(item.productName || (item.product && item.product.name) || 'Stationery Item'),
        unitPrice,
        quantity,
        totalPrice: Number(item.totalPrice) || (unitPrice * quantity),
        image: item.image || (item.product && item.product.image) || ''
      };
    });

    const subtotal = sanitizedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = Math.max(0, Number(orderInput.deliveryFee || 0));
    const total = subtotal + deliveryFee;

    const orderDoc: Order = {
      id,
      orderId: id,
      customerId: sanitizeId(orderInput.customerId || ''),
      customerName: sanitizeString(orderInput.customerName),
      customerPhone: sanitizeString(orderInput.customerPhone),
      customerEmail: sanitizeString(orderInput.customerEmail || ''),
      items: sanitizedItems,
      subtotal,
      deliveryFee,
      total,
      totalAmount: total,
      deliveryMethod: sanitizeString(orderInput.deliveryMethod || 'Store Pickup'),
      fulfillmentMethod: sanitizeString(orderInput.fulfillmentMethod || orderInput.deliveryMethod || 'Store Pickup'),
      deliveryAddress: sanitizeString(orderInput.deliveryAddress || ''),
      deliveryDistrict: sanitizeString(orderInput.deliveryDistrict || ''),
      paymentMethod: sanitizeString(orderInput.paymentMethod || 'Cash / Pay at Store'),
      paymentStatus: (orderInput.paymentStatus as any) || 'Pending (Pay on Delivery/Pickup)',
      status: (orderInput.status as OrderStatus) || 'Submitted',
      orderStatus: (orderInput.status as OrderStatus) || 'Submitted',
      notes: sanitizeString(orderInput.notes || ''),
      createdAt: orderInput.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore
    await setDoc(doc(db, ORDERS_COLLECTION, id), {
      ...orderDoc,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp()
    });

    return orderDoc;
  },

  /**
   * Fetch orders for a specific authenticated customer
   */
  async getUserOrders(customerId: string): Promise<Order[]> {
    try {
      if (!customerId) return [];
      const colRef = collection(db, ORDERS_COLLECTION);
      const q = query(colRef, where('customerId', '==', customerId));
      const snapshot = await getDocs(q);

      const orders: Order[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        orders.push({
          id: d.id,
          ...data
        } as Order);
      });

      return orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      console.warn('Error fetching user orders:', err);
      return [];
    }
  },

  /**
   * Listen to orders for a specific authenticated customer in real time
   */
  listenToUserOrders(customerId: string, callback: (orders: Order[]) => void): () => void {
    if (!customerId) {
      callback([]);
      return () => {};
    }
    try {
      const colRef = collection(db, ORDERS_COLLECTION);
      const q = query(colRef, where('customerId', '==', customerId));
      return onSnapshot(
        q,
        snapshot => {
          const orders: Order[] = [];
          snapshot.forEach(d => {
            const data = d.data();
            orders.push({
              id: d.id,
              ...data
            } as Order);
          });
          orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          callback(orders);
        },
        err => {
          console.warn('Real-time customer orders listener warning:', err);
        }
      );
    } catch (err) {
      console.warn('Error establishing customer orders listener:', err);
      return () => {};
    }
  },

  /**
   * Admin: Fetch all orders across system
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const colRef = collection(db, ORDERS_COLLECTION);
      const snapshot = await getDocs(colRef);

      const orders: Order[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        orders.push({
          id: d.id,
          ...data
        } as Order);
      });

      return orders.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      console.warn('Error fetching all orders:', err);
      return [];
    }
  },

  /**
   * Fetch single order by tracking ID (public or authenticated)
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId.trim());
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data
        } as Order;
      }
      return null;
    } catch (err) {
      console.warn('Error fetching order by ID:', err);
      return null;
    }
  },

  /**
   * Admin: Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status,
      orderStatus: status,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Admin: Update order payment status
   */
  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<void> {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      paymentStatus,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Customer: Submit payment reference or proof note for verification
   */
  async submitPaymentProof(orderId: string, reference: string, notes?: string): Promise<void> {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      paymentReference: reference.trim(),
      ...(notes ? { notes: notes.trim() } : {}),
      updatedAt: new Date().toISOString()
    });
  }
};
