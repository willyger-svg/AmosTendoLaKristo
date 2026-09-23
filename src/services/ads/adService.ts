import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Advertisement } from '../../types';
import { generateId } from '../../utils/formatters';

const ADS_COLLECTION = 'advertisements';
const ADS_STORAGE_KEY = 'tk_ads_cache_v1';
const DELETED_ADS_KEY = 'tk_deleted_ad_ids_v1';

export const getDeletedAdIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_ADS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
};

export const markAdIdAsDeleted = (id: string): void => {
  try {
    const set = getDeletedAdIds();
    set.add(id);
    localStorage.setItem(DELETED_ADS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

export const unmarkAdIdAsDeleted = (id: string): void => {
  try {
    const set = getDeletedAdIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(DELETED_ADS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch {
    // ignore
  }
};

export const mockAdvertisements: Advertisement[] = [
  {
    id: 'ad-hero-01',
    title: 'Huduma ya Chapisho Haraka & Vifaa vya Shule',
    subtitle: 'High-Speed Document Hub & Back-to-School Offers',
    description: 'Pata punguzo la 15% kwenye vitabu, karatasi za A4 rim, na huduma ya binding wiki hii!',
    badgeText: 'OFFA MAALUM YA WIKI',
    buttonText: 'Angalia Vifaa Sasa',
    targetUrl: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
    placement: 'hero_banner',
    isActive: true,
    priority: 1,
    viewsCount: 1420,
    clicksCount: 185,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad-promo-gov',
    title: 'Usaidizi wa Haraka wa TRA, NIDA, RITA & Ajira Portal',
    subtitle: 'Huduma za Serikali Mtandaoni Bila Foleni',
    description: 'Tuma maombi au fanya marekebisho ya TIN, NIDA namba na vyeti vya kuzaliwa ndani ya dakika chache.',
    badgeText: 'USAIDIZI WA UHAKIKA',
    buttonText: 'Pata Usaidizi wa Portal',
    targetUrl: '/online-services',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    placement: 'home_highlight',
    isActive: true,
    priority: 2,
    viewsCount: 890,
    clicksCount: 112,
    createdAt: new Date().toISOString()
  }
];

export const adService = {
  /**
   * Fetch all active ads for a specific placement or all active ads
   */
  async getActiveAds(placement?: string): Promise<Advertisement[]> {
    const deletedIds = getDeletedAdIds();
    try {
      const colRef = collection(db, ADS_COLLECTION);
      const snapshot = await getDocs(colRef);
      const list: Advertisement[] = [];
      snapshot.forEach(d => {
        if (deletedIds.has(d.id)) return;
        const data = d.data() as Advertisement;
        if (data.isActive) {
          if (!placement || data.placement === placement) {
            list.push({ ...data, id: d.id });
          }
        }
      });
      if (list.length > 0) {
        const sorted = list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        try {
          localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(sorted));
        } catch {
          // ignore
        }
        return sorted;
      }
    } catch (err) {
      console.warn('Firestore ads fetch fallback:', err);
    }

    try {
      const cached = localStorage.getItem(ADS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Advertisement[];
        const filtered = parsed.filter(a => !deletedIds.has(a.id) && a.isActive && (!placement || a.placement === placement));
        if (filtered.length > 0) return filtered;
      }
    } catch {
      // ignore
    }

    return mockAdvertisements.filter(a => !deletedIds.has(a.id) && a.isActive && (!placement || a.placement === placement));
  },

  /**
   * Admin: Get all ads (active & inactive)
   */
  async getAllAds(): Promise<Advertisement[]> {
    const deletedIds = getDeletedAdIds();
    try {
      const colRef = collection(db, ADS_COLLECTION);
      const snapshot = await getDocs(colRef);
      const list: Advertisement[] = [];
      snapshot.forEach(d => {
        if (deletedIds.has(d.id)) return;
        list.push({ ...d.data(), id: d.id } as Advertisement);
      });
      if (list.length > 0) {
        return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }
    } catch (err) {
      console.warn('Firestore all ads fetch notice:', err);
    }

    try {
      const cached = localStorage.getItem(ADS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Advertisement[];
        const filtered = parsed.filter(a => !deletedIds.has(a.id));
        if (filtered.length > 0) return filtered;
      }
    } catch {
      // ignore
    }

    return mockAdvertisements.filter(a => !deletedIds.has(a.id));
  },

  /**
   * Admin: Create or edit ad
   */
  async saveAd(ad: Partial<Advertisement>): Promise<Advertisement> {
    const id = ad.id || generateId('AD');
    unmarkAdIdAsDeleted(id);
    const now = new Date().toISOString();
    const payload: Advertisement = {
      id,
      title: ad.title || 'Special Promotion',
      subtitle: ad.subtitle || '',
      description: ad.description || '',
      badgeText: ad.badgeText || 'PROMO',
      buttonText: ad.buttonText || 'Learn More',
      targetUrl: ad.targetUrl || '/shop',
      imageUrl: ad.imageUrl || 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
      placement: ad.placement || 'hero_banner',
      isActive: ad.isActive !== undefined ? ad.isActive : true,
      startDate: ad.startDate || now,
      endDate: ad.endDate,
      priority: Number(ad.priority || 1),
      viewsCount: Number(ad.viewsCount || 0),
      clicksCount: Number(ad.clicksCount || 0),
      createdAt: ad.createdAt || now,
      updatedAt: now
    };

    // Update local cache immediately
    try {
      const cached = localStorage.getItem(ADS_STORAGE_KEY);
      let list: Advertisement[] = cached ? JSON.parse(cached) : [...mockAdvertisements];
      const existingIdx = list.findIndex(a => a.id === id);
      if (existingIdx >= 0) {
        list[existingIdx] = payload;
      } else {
        list.unshift(payload);
      }
      localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }

    try {
      const docRef = doc(db, ADS_COLLECTION, id);
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      console.warn('Ad write fallback:', err);
    }

    return payload;
  },

  async updateAd(adId: string, updates: Partial<Advertisement>): Promise<Advertisement> {
    return this.saveAd({ ...updates, id: adId });
  },

  async createAd(ad: Partial<Advertisement>): Promise<Advertisement> {
    return this.saveAd(ad);
  },

  /**
   * Admin: Delete ad permanently
   */
  async deleteAd(adId: string): Promise<void> {
    markAdIdAsDeleted(adId);

    // Remove from local cache immediately
    try {
      const cached = localStorage.getItem(ADS_STORAGE_KEY);
      if (cached) {
        const list: Advertisement[] = JSON.parse(cached);
        const filtered = list.filter(a => a.id !== adId);
        localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }

    try {
      const docRef = doc(db, ADS_COLLECTION, adId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Ad delete notice:', err);
    }

    try {
      await setDoc(doc(db, 'deleted_records', `ad_${adId}`), {
        type: 'ad',
        targetId: adId,
        deletedAt: new Date().toISOString()
      }, { merge: true });
    } catch {
      // ignore
    }
  },

  /**
   * Track ad click
   */
  async recordClick(adId: string): Promise<void> {
    try {
      const docRef = doc(db, ADS_COLLECTION, adId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cur = (snap.data().clicksCount || 0) + 1;
        await updateDoc(docRef, { clicksCount: cur });
      }
    } catch {
      // ignore
    }
  }
};
