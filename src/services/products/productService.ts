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
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product, ProductCategory } from '../../types';
import { mockProducts } from '../../data/products';

const PRODUCTS_COLLECTION = 'products';

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
    try {
      const colRef = collection(db, PRODUCTS_COLLECTION);
      let q = query(colRef);

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // If collection is empty, trigger initial seed in background
        await this.seedProductsIfEmpty();
        return this.filterLocally(mockProducts.map(p => ({ ...p, isActive: p.isActive ?? true })), options);
      }

      const products: Product[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const p: Product = {
          id: docSnap.id,
          slug: data.slug || docSnap.id,
          name: data.name || '',
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
      return this.filterLocally(mockProducts.map(p => ({ ...p, isActive: true })), options);
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
      const fallback = mockProducts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
      return fallback ? { ...fallback, isActive: true } : null;
    } catch (err) {
      console.warn('Error fetching product detail, using fallback:', err);
      const fallback = mockProducts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
      return fallback ? { ...fallback, isActive: true } : null;
    }
  },

  /**
   * Admin: Create product in Firestore
   */
  async createProduct(productData: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const id = productData.id || `prod-${Date.now()}`;
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProduct: Product = {
      ...productData,
      id,
      slug,
      isActive: productData.isActive ?? true,
      inStock: (productData.stockCount ?? 0) > 0,
      stockQuantity: productData.stockCount,
      lowStockThreshold: productData.lowStockThreshold ?? 5,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, PRODUCTS_COLLECTION, id), newProduct);
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
   * Seed Firestore initial catalogue if empty
   */
  async seedProductsIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(query(collection(db, PRODUCTS_COLLECTION), limit(1)));
      if (snap.empty) {
        for (const item of mockProducts) {
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
