import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ServiceTicket, OrderStatus } from '../../types';
import { sanitizeString, sanitizeId } from '../../utils/sanitize';

const SERVICE_REQUESTS_COLLECTION = 'serviceRequests';

export const serviceRequestService = {
  /**
   * Create new service request ticket
   */
  async createServiceRequest(input: Partial<ServiceTicket> & { customerName: string; customerPhone: string; serviceType: string }): Promise<ServiceTicket> {
    let prefix = 'TK-SRV';
    const st = input.serviceType.toLowerCase();
    if (st.includes('print')) prefix = 'TK-PRT';
    else if (st.includes('gov') || st.includes('nida') || st.includes('public')) prefix = 'TK-GOV';
    else if (st.includes('it') || st.includes('tech')) prefix = 'TK-IT';
    else if (st.includes('design') || st.includes('graphic')) prefix = 'TK-DES';

    const rawId = input.id || `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = sanitizeId(rawId);

    const ticketDoc: ServiceTicket = {
      id,
      ticketId: id,
      customerId: sanitizeId(input.customerId || ''),
      serviceType: sanitizeString(input.serviceType),
      serviceTitle: sanitizeString(input.serviceTitle || `${input.serviceType} Assistance`),
      customerName: sanitizeString(input.customerName),
      customerPhone: sanitizeString(input.customerPhone),
      customerEmail: sanitizeString(input.customerEmail || ''),
      description: sanitizeString(input.description || ''),
      status: (input.status as OrderStatus) || 'Submitted',
      priority: input.priority || 'normal',
      estimatedCost: sanitizeString(input.estimatedCost || 'Assessment Pending'),
      assignedStaffId: sanitizeId(input.assignedStaffId || ''),
      assignedStaffName: sanitizeString(input.assignedStaffName || ''),
      internalNotes: sanitizeString(input.internalNotes || ''),
      details: input.details || {},
      fileName: sanitizeString(input.fileName || ''),
      fileUrl: input.fileUrl || '',
      createdAt: input.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore
    await setDoc(doc(db, SERVICE_REQUESTS_COLLECTION, id), {
      ...ticketDoc,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp()
    });

    return ticketDoc;
  },

  /**
   * Fetch tickets for a specific authenticated customer
   */
  async getUserServiceRequests(customerId: string): Promise<ServiceTicket[]> {
    try {
      if (!customerId) return [];
      const colRef = collection(db, SERVICE_REQUESTS_COLLECTION);
      const q = query(colRef, where('customerId', '==', customerId));
      const snapshot = await getDocs(q);

      const tickets: ServiceTicket[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        tickets.push({
          id: d.id,
          ...data
        } as ServiceTicket);
      });

      return tickets.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      console.warn('Error fetching user service tickets:', err);
      return [];
    }
  },

  /**
   * Admin: Fetch all service tickets across system
   */
  async getAllServiceRequests(): Promise<ServiceTicket[]> {
    try {
      const colRef = collection(db, SERVICE_REQUESTS_COLLECTION);
      const snapshot = await getDocs(colRef);

      const tickets: ServiceTicket[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        tickets.push({
          id: d.id,
          ...data
        } as ServiceTicket);
      });

      return tickets.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      console.warn('Error fetching all service tickets:', err);
      return [];
    }
  },

  /**
   * Fetch single ticket by tracking ID (public or authenticated)
   */
  async getServiceRequestById(ticketId: string): Promise<ServiceTicket | null> {
    try {
      const docRef = doc(db, SERVICE_REQUESTS_COLLECTION, ticketId.trim());
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data
        } as ServiceTicket;
      }
      return null;
    } catch (err) {
      console.warn('Error fetching ticket by ID:', err);
      return null;
    }
  },

  /**
   * Admin: Update ticket status
   */
  async updateServiceRequestStatus(ticketId: string, status: OrderStatus): Promise<void> {
    const docRef = doc(db, SERVICE_REQUESTS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Admin: Assign staff to ticket
   */
  async assignStaff(ticketId: string, assignedStaffId: string, assignedStaffName: string): Promise<void> {
    const docRef = doc(db, SERVICE_REQUESTS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      assignedStaffId,
      assignedStaffName,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Admin: Update internal notes
   */
  async addInternalNotes(ticketId: string, internalNotes: string): Promise<void> {
    const docRef = doc(db, SERVICE_REQUESTS_COLLECTION, ticketId);
    await updateDoc(docRef, {
      internalNotes,
      updatedAt: new Date().toISOString()
    });
  }
};
