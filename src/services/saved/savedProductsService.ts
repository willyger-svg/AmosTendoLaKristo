import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product, SavedProduct } from '../../types';

export const savedProductsService = {
  /**
   * Listen to real-time saved products for customer
   */
  listenToSavedProducts(
    userId: string,
    callback: (items: SavedProduct[]) => void
  ): () => void {
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
          callback(items);
        },
        err => {
          console.warn('Saved products listener error:', err);
          callback([]);
        }
      );
    } catch (e) {
      console.warn('Could not listen to saved products:', e);
      callback([]);
      return () => {};
    }
  },

  /**
   * Fetch saved products once
   */
  async getSavedProducts(userId: string): Promise<SavedProduct[]> {
    try {
      const savedRef = collection(db, 'users', userId, 'savedProducts');
      const q = query(savedRef, orderBy('savedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as SavedProduct[];
    } catch (e) {
      console.warn('Could not fetch saved products:', e);
      return [];
    }
  },

  /**
   * Save / Bookmark a product
   */
  async saveProduct(userId: string, product: Product): Promise<SavedProduct> {
    const savedDocRef = doc(db, 'users', userId, 'savedProducts', product.id);
    const item: SavedProduct = {
      id: product.id,
      userId,
      productId: product.id,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug || product.id,
        price: product.price,
        compareAtPrice: product.compareAtPrice || product.originalPrice,
        image: product.image,
        category: product.category,
        sku: product.sku || '',
        brand: product.brand || '',
        inStock: product.inStock,
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

    await setDoc(savedDocRef, item, { merge: true });
    return item;
  },

  /**
   * Remove a product from saved
   */
  async removeSavedProduct(userId: string, productId: string): Promise<void> {
    const savedDocRef = doc(db, 'users', userId, 'savedProducts', productId);
    await deleteDoc(savedDocRef);
  },

  /**
   * Check if a product is saved
   */
  async isProductSaved(userId: string, productId: string): Promise<boolean> {
    try {
      const savedDocRef = doc(db, 'users', userId, 'savedProducts', productId);
      const snap = await getDoc(savedDocRef);
      return snap.exists();
    } catch {
      return false;
    }
  }
};
