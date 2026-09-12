import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { StoreSettings } from '../../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: 'general',
  storeName: 'TK STATIONERY (Tendo La Kristo)',
  paymentWhatsAppNumber: '0787754202',
  displayPhoneNumber: '+255 787 754 202',
  businessEmail: 'info@tkstationery.co.tz',
  storeAddress: 'Manzese, Dar es Salaam (Karibu na Kituo cha Mwendokasi cha Bakhresa)',
  businessHours: 'Mon - Sat: 8:00 AM - 8:00 PM | Sun: 10:00 AM - 4:00 PM',
  darDeliveryFee: 3000,
  upcountryDeliveryFee: 7000,
  mpesaAccountName: 'TK STATIONERY & SERVICES (Lipa Namba: 5892110 / M-Pesa: 0787754202)',
  tigopesaAccountName: 'TK STATIONERY (Mixx by Yas / Tigo Pesa: 0787754202)',
  airtelMoneyAccountName: 'TK STATIONERY (Airtel Money: 0787754202)',
  bankAccountDetails: 'CRDB Bank: 0152489201900 | NMB Bank: 20810034561 (Account Name: TK STATIONERY TRADING CO.)',
  heroAnnouncementText: '',
  announcementActive: false,
  updatedAt: new Date().toISOString()
};

const SETTINGS_STORAGE_KEY = 'tk_store_settings_v1';
const SETTINGS_DOC = 'general';

export const settingsService = {
  /**
   * Fetch store settings from Firestore or Local Cache
   */
  async getSettings(): Promise<StoreSettings> {
    try {
      const docRef = doc(db, 'settings', SETTINGS_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as StoreSettings;
        const merged: StoreSettings = { ...DEFAULT_STORE_SETTINGS, ...data };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('Firestore settings fetch notice:', err);
    }

    try {
      const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(cached) };
      }
    } catch {
      // ignore
    }

    return DEFAULT_STORE_SETTINGS;
  },

  /**
   * Update store settings (Admin operation)
   */
  async updateSettings(settings: Partial<StoreSettings>, updatedBy?: string): Promise<StoreSettings> {
    const docRef = doc(db, 'settings', SETTINGS_DOC);
    const now = new Date().toISOString();
    const payload: Partial<StoreSettings> = {
      ...settings,
      updatedAt: now,
      updatedBy: updatedBy || 'admin'
    };

    try {
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      console.warn('Settings write fallback:', err);
    }

    const current = await this.getSettings();
    const updated = { ...current, ...payload };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Listen to live real-time settings changes
   */
  listenToSettings(callback: (settings: StoreSettings) => void): () => void {
    try {
      const docRef = doc(db, 'settings', SETTINGS_DOC);
      return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StoreSettings;
          const merged: StoreSettings = { ...DEFAULT_STORE_SETTINGS, ...data };
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
          callback(merged);
        } else {
          callback(DEFAULT_STORE_SETTINGS);
        }
      }, () => {
        callback(DEFAULT_STORE_SETTINGS);
      });
    } catch {
      callback(DEFAULT_STORE_SETTINGS);
      return () => {};
    }
  }
};
