import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { handleFirestoreError, OperationType } from '../../firebase/errorHandler';
import { Product, SavedProduct } from '../../types';

const WISHLIST_LOCAL_PREFIX = 'tk_wishlist_cache_';

const getCacheKey = (userId: string) => `${WISHLIST_LOCAL_PREFIX}${userId}`;

export const savedProductsService = {
  /**
   * Listen to real-time saved wishlist products for registered customer
   */
  listenToSavedProducts(
    userId: string,
    callback: (items: SavedProduct[]) => void
  ): () => void {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const path = `users/${userId}/savedProducts`;
    try {
      const savedRef = collection(db, 'users', userId, 'savedProducts');
      const q = query(savedRef, orderBy('savedAt', 'desc'));

      return onSnapshot(
        q,
        snapshot => {
          const items = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          })) as SavedProduct[];

          // Cache in local storage for instant retrieval and offline backup
          try {
            localStorage.setItem(getCacheKey(userId), JSON.stringify(items));
          } catch {
            // Ignore storage quota errors
          }

          callback(items);
        },
        err => {
          console.warn('Saved products listener error:', err);
          // Load from local storage fallback
          try {
            const cached = localStorage.getItem(getCacheKey(userId));
            if (cached) {
              callback(JSON.parse(cached));
              return;
            }
          } catch {
            // Ignore
          }
          handleFirestoreError(err, OperationType.GET, path);
        }
      );
    } catch (e) {
      console.warn('Could not set up wishlist listener:', e);
      try {
        const cached = localStorage.getItem(getCacheKey(userId));
        if (cached) {
          callback(JSON.parse(cached));
          return () => {};
        }
      } catch {}
      callback([]);
      return () => {};
    }
  },

  /**
   * Fetch saved products once from Firestore with cached fallback
   */
  async getSavedProducts(userId: string): Promise<SavedProduct[]> {
    if (!userId) return [];
    const path = `users/${userId}/savedProducts`;

    try {
      const savedRef = collection(db, 'users', userId, 'savedProducts');
      const q = query(savedRef, orderBy('savedAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as SavedProduct[];

      try {
        localStorage.setItem(getCacheKey(userId), JSON.stringify(items));
      } catch {}

      return items;
    } catch (e) {
      console.warn('Could not fetch saved products from Firestore:', e);
      try {
        const cached = localStorage.getItem(getCacheKey(userId));
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {}
      handleFirestoreError(e, OperationType.GET, path);
    }
  },

  /**
   * Save / Bookmark a product to Firestore
   */
  async saveProduct(userId: string, product: Product): Promise<SavedProduct> {
    if (!userId) throw new Error('User must be authenticated to save to wishlist');
    const path = `users/${userId}/savedProducts/${product.id}`;

    const item: SavedProduct = {
      id: product.id,
      userId,
      productId: product.id,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug || product.id,
        price: Number(product.price) || 0,
        compareAtPrice: product.compareAtPrice || product.originalPrice,
        image: product.image,
        category: product.category,
        sku: product.sku || '',
        brand: product.brand || '',
        inStock: Boolean(product.inStock),
        stockCount: product.stockCount || 0,
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        specifications: product.specifications || {},
        rating: product.rating || 5,
        reviewCount: product.reviewCount || 0,
        tags: product.tags || [],
        unit: product.unit || 'pcs'
      },
      savedAt: new Date().toISOString()
    };

    try {
      const savedDocRef = doc(db, 'users', userId, 'savedProducts', product.id);
      await setDoc(savedDocRef, item, { merge: true });

      // Update local storage cache
      try {
        const cached = localStorage.getItem(getCacheKey(userId));
        const list: SavedProduct[] = cached ? JSON.parse(cached) : [];
        const filtered = list.filter(p => p.productId !== product.id);
        filtered.unshift(item);
        localStorage.setItem(getCacheKey(userId), JSON.stringify(filtered));
      } catch {}

      return item;
    } catch (e) {
      console.error('Error saving product to wishlist:', e);
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  /**
   * Remove a product from saved wishlist in Firestore
   */
  async removeSavedProduct(userId: string, productId: string): Promise<void> {
    if (!userId) return;
    const path = `users/${userId}/savedProducts/${productId}`;

    try {
      const savedDocRef = doc(db, 'users', userId, 'savedProducts', productId);
      await deleteDoc(savedDocRef);

      // Update local cache
      try {
        const cached = localStorage.getItem(getCacheKey(userId));
        if (cached) {
          const list: SavedProduct[] = JSON.parse(cached);
          const filtered = list.filter(p => p.productId !== productId);
          localStorage.setItem(getCacheKey(userId), JSON.stringify(filtered));
        }
      } catch {}
    } catch (e) {
      console.error('Error removing product from wishlist:', e);
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  /**
   * Clear all products from customer wishlist
   */
  async clearAllSavedProducts(userId: string): Promise<void> {
    if (!userId) return;
    const path = `users/${userId}/savedProducts`;

    try {
      const savedRef = collection(db, 'users', userId, 'savedProducts');
      const snapshot = await getDocs(savedRef);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();

      try {
        localStorage.removeItem(getCacheKey(userId));
      } catch {}
    } catch (e) {
      console.error('Error clearing wishlist in Firestore:', e);
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  /**
   * Check if a product is in customer wishlist
   */
  async isProductSaved(userId: string, productId: string): Promise<boolean> {
    if (!userId || !productId) return false;
    const path = `users/${userId}/savedProducts/${productId}`;

    try {
      const savedDocRef = doc(db, 'users', userId, 'savedProducts', productId);
      const snap = await getDoc(savedDocRef);
      return snap.exists();
    } catch (e) {
      // Fallback check from cache
      try {
        const cached = localStorage.getItem(getCacheKey(userId));
        if (cached) {
          const list: SavedProduct[] = JSON.parse(cached);
          return list.some(item => item.productId === productId);
        }
      } catch {}
      handleFirestoreError(e, OperationType.GET, path);
    }
  }
};
