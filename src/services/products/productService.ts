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
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product, ProductCategory } from '../../types';
import { initialProducts } from '../seed/initialSeedData';

const PRODUCTS_COLLECTION = 'products';
const DELETED_PRODUCTS_KEY = 'tk_deleted_product_ids_v2';

export const getDeletedProductIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
};

export const markProductIdAsDeleted = (id: string): void => {
  try {
    const set = getDeletedProductIds();
    set.add(id);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

export interface ProductFilterOptions {
  category?: ProductCategory | 'All';
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  includeInactive?: boolean;
  sortBy?: 'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export const productService = {
  /**
   * Fetch products with multi-attribute filtering & sorting
   */
  async getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
    const deletedIds = getDeletedProductIds();
    try {
      const colRef = collection(db, PRODUCTS_COLLECTION);
      let q = query(colRef);

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // If collection is empty, trigger initial seed in background (excluding any deleted IDs)
        await this.seedProductsIfEmpty();
        return this.filterLocally(
          initialProducts
            .filter(p => !deletedIds.has(p.id))
            .map(p => ({ ...p, isActive: p.isActive ?? true })),
          options
        );
      }

      const products: Product[] = [];
      snapshot.forEach(docSnap => {
        if (deletedIds.has(docSnap.id)) return;
        const data = docSnap.data();
        if (data.isDeleted) return;

        const p: Product = {
          id: docSnap.id,
          slug: data.slug || docSnap.id,
          name: data.name || data.title || 'Bidhaa',
          title: data.title || data.name || 'Bidhaa',
          category: data.category || 'Other Stationery',
          categoryId: data.categoryId || '',
          price: Number(data.price) || 0,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : data.originalPrice,
          inStock: data.inStock ?? (Number(data.stockCount ?? data.stockQuantity) > 0),
          stockCount: Number(data.stockCount ?? data.stockQuantity ?? 0),
          stockQuantity: Number(data.stockQuantity ?? data.stockCount ?? 0),
          lowStockThreshold: data.lowStockThreshold ?? 5,
          sku: data.sku || '',
          brand: data.brand || '',
          rating: Number(data.rating) || 5,
          reviewCount: Number(data.reviewCount) || 0,
          featured: data.featured ?? data.isFeatured ?? false,
          isFeatured: data.isFeatured ?? data.featured ?? false,
          isActive: data.isActive ?? true,
          isBestSeller: data.isBestSeller ?? false,
          isNew: data.isNew ?? false,
          shortDescription: data.shortDescription || '',
          description: data.description || '',
          specifications: data.specifications || {},
          image: data.image || '',
          images: data.images || (data.image ? [data.image] : []),
          galleryImages: data.galleryImages || [],
          tags: data.tags || [],
          unit: data.unit || 'Piece',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || ''
        };
        products.push(p);
      });

      return this.filterLocally(products, options);
    } catch (err) {
      console.warn('Error fetching products from Firestore, using baseline catalog fallback:', err);
      const deletedIds = getDeletedProductIds();
      return this.filterLocally(
        initialProducts
          .filter(p => !deletedIds.has(p.id))
          .map(p => ({ ...p, isActive: true })),
        options
      );
    }
  },

  /**
   * Filter and sort products in-memory for fast and comprehensive client responsiveness
   */
  filterLocally(products: Product[], options: ProductFilterOptions): Product[] {
    return products.filter(product => {
      // Inactive filter
      if (!options.includeInactive && product.isActive === false) {
        return false;
      }

      // Category filter
      if (options.category && options.category !== 'All') {
        if (product.category !== options.category) {
          return false;
        }
      }

      // Featured filter
      if (options.featuredOnly && !product.featured && !product.isFeatured) {
        return false;
      }

      // In-stock filter
      if (options.inStockOnly && (!product.inStock || product.stockCount <= 0)) {
        return false;
      }

      // Price filter
      if (options.minPrice !== undefined && product.price < options.minPrice) {
        return false;
      }
      if (options.maxPrice !== undefined && product.price > options.maxPrice) {
        return false;
      }

      // Search Query filter (name, brand, sku, description, tags)
      if (options.searchQuery && options.searchQuery.trim() !== '') {
        const queryTerm = options.searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(queryTerm);
        const matchesBrand = product.brand.toLowerCase().includes(queryTerm);
        const matchesSku = product.sku.toLowerCase().includes(queryTerm);
        const matchesDesc = product.shortDescription?.toLowerCase().includes(queryTerm) ||
                            product.description?.toLowerCase().includes(queryTerm);
        const matchesTags = product.tags?.some(tag => tag.toLowerCase().includes(queryTerm));

        if (!matchesName && !matchesBrand && !matchesSku && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (options.sortBy === 'price-asc') return a.price - b.price;
      if (options.sortBy === 'price-desc') return b.price - a.price;
      if (options.sortBy === 'rating') return b.rating - a.rating;
      if (options.sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return a.name.localeCompare(b.name);
    });
  },

  /**
   * Get single product by ID or Slug
   */
  async getProduct(idOrSlug: string): Promise<Product | null> {
    try {
      // First try by doc ID
      const docRef = doc(db, PRODUCTS_COLLECTION, idOrSlug);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          ...data
        } as Product;
      }

      // Otherwise try query by slug
      const colRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(colRef, where('slug', '==', idOrSlug), limit(1));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const d = querySnap.docs[0];
        return {
          id: d.id,
          ...d.data()
        } as Product;
      }

      // Fallback to baseline catalog
      const fallback = initialProducts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
      return fallback ? { ...fallback, isActive: true } : null;
    } catch (err) {
      console.warn('Error fetching product detail, using fallback:', err);
      const fallback = initialProducts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
      return fallback ? { ...fallback, isActive: true } : null;
    }
  },

  /**
   * Admin: Create product in Firestore
   */
  async createProduct(productData: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const id = productData.id || `prod-${Date.now()}`;
    const rawName = productData.name || (productData as any).title || 'Bidhaa Mpya';
    const slug =
      productData.slug ||
      rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      `bidhaa-${id}`;

    const newProduct: Product = {
      ...productData,
      id,
      slug,
      name: rawName,
      title: (productData as any).title || rawName,
      isActive: productData.isActive ?? true,
      inStock: (productData.stockCount ?? 0) > 0,
      stockCount: Number(productData.stockCount ?? 0),
      stockQuantity: Number(productData.stockCount ?? 0),
      lowStockThreshold: productData.lowStockThreshold ?? 5,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, PRODUCTS_COLLECTION, id), newProduct);
    } catch (err) {
      console.warn('Firestore setDoc notice on product creation:', err);
    }
    return newProduct;
  },

  /**
   * Admin: Update product details
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.stockCount !== undefined) {
      payload.inStock = updates.stockCount > 0;
      payload.stockQuantity = updates.stockCount;
    }

    await updateDoc(docRef, payload);
  },

  /**
   * Admin: Toggle active state (Soft Delete / Archive)
   */
  async toggleProductActive(id: string, isActive: boolean): Promise<void> {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
      isActive,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Admin: Update stock quantity
   */
  async updateStock(id: string, newStockCount: number): Promise<void> {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
      stockCount: newStockCount,
      stockQuantity: newStockCount,
      inStock: newStockCount > 0,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Admin: Permanently delete product from Firestore and prevent resurrection
   */
  async deleteProduct(id: string): Promise<void> {
    markProductIdAsDeleted(id);
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    } catch (err) {
      console.warn('Firestore deleteDoc notice on product:', err);
    }

    try {
      // Record tombstone so any other clients or listeners also ignore this product ID
      await setDoc(doc(db, 'deleted_records', `prod_${id}`), {
        type: 'product',
        targetId: id,
        deletedAt: new Date().toISOString()
      }, { merge: true });
    } catch {
      // ignore
    }
  },

  /**
   * Admin: Remove product image completely (leaves product with no image)
   */
  async clearProductImage(id: string): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        image: '',
        images: [],
        galleryImages: [],
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore clearProductImage notice:', err);
    }
  },

  /**
   * Realtime listener for live products from Firestore collection
   */
  listenToProducts(callback: (products: Product[]) => void): Unsubscribe {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(
      colRef,
      snapshot => {
        const deletedIds = getDeletedProductIds();
        if (snapshot.empty) {
          this.seedProductsIfEmpty();
          callback(
            initialProducts
              .filter(p => !deletedIds.has(p.id))
              .map(p => ({ ...p, isActive: p.isActive ?? true }))
          );
          return;
        }

        const items: Product[] = [];
        snapshot.forEach(docSnap => {
          if (deletedIds.has(docSnap.id)) return;
          const data = docSnap.data();
          if (data.isDeleted) return;

          items.push({
            id: docSnap.id,
            slug: data.slug || docSnap.id,
            name: data.name || data.title || 'Bidhaa',
            title: data.title || data.name || 'Bidhaa',
            category: data.category || 'Other Stationery',
            categoryId: data.categoryId || '',
            price: Number(data.price) || 0,
            originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
            compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : data.originalPrice,
            inStock: data.inStock ?? (Number(data.stockCount ?? data.stockQuantity) > 0),
            stockCount: Number(data.stockCount ?? data.stockQuantity ?? 0),
            stockQuantity: Number(data.stockQuantity ?? data.stockCount ?? 0),
            lowStockThreshold: data.lowStockThreshold ?? 5,
            sku: data.sku || '',
            brand: data.brand || '',
            rating: Number(data.rating) || 5,
            reviewCount: Number(data.reviewCount) || 0,
            featured: data.featured ?? data.isFeatured ?? false,
            isFeatured: data.isFeatured ?? data.featured ?? false,
            isActive: data.isActive ?? true,
            isBestSeller: data.isBestSeller ?? false,
            isNew: data.isNew ?? false,
            shortDescription: data.shortDescription || '',
            description: data.description || '',
            specifications: data.specifications || {},
            image: data.image || '',
            images: data.images || (data.image ? [data.image] : []),
            galleryImages: data.galleryImages || [],
            tags: data.tags || [],
            unit: data.unit || 'Piece',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || ''
          });
        });
        callback(items);
      },
      error => {
        console.warn('Realtime listener error on products:', error);
        const deletedIds = getDeletedProductIds();
        callback(
          initialProducts
            .filter(p => !deletedIds.has(p.id))
            .map(p => ({ ...p, isActive: true }))
        );
      }
    );
  },

  /**
   * Seed Firestore initial catalogue if empty
   */
  async seedProductsIfEmpty(): Promise<void> {
    try {
      const deletedIds = getDeletedProductIds();
      const snap = await getDocs(query(collection(db, PRODUCTS_COLLECTION), limit(1)));
      if (snap.empty) {
        for (const item of initialProducts) {
          if (deletedIds.has(item.id)) continue;
          const itemDoc = {
            ...item,
            isActive: true,
            isFeatured: item.featured ?? false,
            stockQuantity: item.stockCount,
            lowStockThreshold: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(doc(db, PRODUCTS_COLLECTION, item.id), itemDoc);
        }
      }
    } catch (err) {
      console.warn('Initial seed skipped or permission denied:', err);
    }
  }
};
