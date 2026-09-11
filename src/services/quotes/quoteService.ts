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
import { QuoteRequest } from '../../types';

const QUOTES_COLLECTION = 'quotes';

export const quoteService = {
  /**
   * Create new tech quote inquiry
   */
  async createQuote(input: Partial<QuoteRequest> & { customerName: string; customerPhone: string; projectType: string }): Promise<QuoteRequest> {
    const id = input.id || `TK-QTE-${Math.floor(1000 + Math.random() * 9000)}`;

    const quoteDoc: QuoteRequest = {
      id,
      quoteId: id,
      customerId: input.customerId || '',
      customerName: input.customerName.trim(),
      customerCompany: input.customerCompany?.trim() || 'Individual',
      customerPhone: input.customerPhone.trim(),
      customerEmail: input.customerEmail?.trim() || '',
      projectType: input.projectType,
      businessScale: input.businessScale || 'Growing SME',
      features: input.features || [],
      timeline: input.timeline || '2-4 Weeks',
      estimatedRange: input.estimatedRange || 'Estimate Upon Consultation',
      projectNotes: input.projectNotes || '',
      internalNotes: input.internalNotes || '',
      status: input.status || 'New',
      createdAt: input.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore
    await setDoc(doc(db, QUOTES_COLLECTION, id), {
      ...quoteDoc,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp()
    });

    return quoteDoc;
  },

  /**
   * Fetch quotes for a specific customer
   */
  async getUserQuotes(customerId: string): Promise<QuoteRequest[]> {
    try {
      if (!customerId) return [];
      const colRef = collection(db, QUOTES_COLLECTION);
      const q = query(colRef, where('customerId', '==', customerId));
      const snapshot = await getDocs(q);

      const quotes: QuoteRequest[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        quotes.push({
          id: d.id,
          ...data
        } as QuoteRequest);
      });

      return quotes.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      console.warn('Error fetching user quotes:', err);
      return [];
    }
  },

  /**
   * Admin: Fetch all quotes across system
   */
  async getAllQuotes(): Promise<QuoteRequest[]> {
    try {
      const colRef = collection(db, QUOTES_COLLECTION);
      const snapshot = await getDocs(colRef);

      const quotes: QuoteRequest[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        quotes.push({
          id: d.id,
          ...data
        } as QuoteRequest);
      });

      return quotes.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      console.warn('Error fetching all quotes:', err);
      return [];
    }
  },

  /**
   * Fetch quote by ID
   */
  async getQuoteById(quoteId: string): Promise<QuoteRequest | null> {
    try {
      const docRef = doc(db, QUOTES_COLLECTION, quoteId.trim());
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data
        } as QuoteRequest;
      }
      return null;
    } catch (err) {
      console.warn('Error fetching quote by ID:', err);
      return null;
    }
  },

  /**
   * Admin: Update quote status
   */
  async updateQuoteStatus(quoteId: string, status: string): Promise<void> {
    const docRef = doc(db, QUOTES_COLLECTION, quoteId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Admin: Update internal notes
   */
  async addInternalNotes(quoteId: string, internalNotes: string): Promise<void> {
    const docRef = doc(db, QUOTES_COLLECTION, quoteId);
    await updateDoc(docRef, {
      internalNotes,
      updatedAt: new Date().toISOString()
    });
  }
};
