import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Product,
  CartItem,
  Order,
  ServiceTicket,
  QuoteRequest,
  ActiveModal,
  ToastMessage,
  StoreSettings,
  Advertisement,
  BaseService,
  PublicServiceItem,
  Testimonial
} from '../types';
import { orderService } from '../services/orders/orderService';
import { serviceRequestService } from '../services/services/serviceRequestService';
import { quoteService } from '../services/quotes/quoteService';
import { productService } from '../services/products/productService';
import { servicesCatalogService } from '../services/services/servicesCatalogService';
import { settingsService, DEFAULT_STORE_SETTINGS } from '../services/settings/settingsService';
import { adService, mockAdvertisements } from '../services/ads/adService';

interface AppContextType {
  // Navigation & Routing
  currentPath: string;
  routeParams: Record<string, string>;
  navigateTo: (path: string) => void;

  // Cart Management
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Modals
  activeModal: ActiveModal;
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Data persistence for Firestore & Local Fallback
  orders: Order[];
  serviceTickets: ServiceTicket[];
  quoteRequests: QuoteRequest[];
  products: Product[];
  printingServices: BaseService[];
  publicServices: PublicServiceItem[];
  testimonials: Testimonial[];
  storeSettings: StoreSettings;
  advertisements: Advertisement[];
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<StoreSettings>;
  refreshAds: () => Promise<void>;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  addProduct: (product: Product) => void;
  updateProductInState: (id: string, updates: Partial<Product>) => void;
  removeProductFromState: (id: string) => void;
  createOrder: (order: Partial<Order> & { customerName: string; customerPhone: string; items: any[] }) => Promise<Order>;
  createServiceTicket: (ticket: Partial<ServiceTicket> & { customerName: string; customerPhone: string; serviceType: string }) => Promise<ServiceTicket>;
  createQuoteRequest: (quote: Partial<QuoteRequest> & { customerName: string; customerPhone: string; projectType: string }) => Promise<QuoteRequest>;
  updateOrderStatus: (orderId: string, status: any) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: any) => Promise<void>;

  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'tk_stationery_cart_v1';
const ORDERS_STORAGE_KEY = 'tk_stationery_orders_v1';
const TICKETS_STORAGE_KEY = 'tk_stationery_tickets_v1';
const QUOTES_STORAGE_KEY = 'tk_stationery_quotes_v1';
const PRODUCTS_STORAGE_KEY = 'tk_stationery_products_cache_v1';

// Scrub legacy mock/demo records so only real user transactions persist
const sanitizeOrders = (rawOrders: any[]): Order[] => {
  if (!Array.isArray(rawOrders)) return [];
  const fakeIds = ['TK-ORD-1042', 'TK-ORD-1043', 'TK-ORD-1044', 'TK-ORD-1045'];
  const fakeNames = ['Juma Ramadhani', 'Neema Mwamburi', 'Baraka Shadrack', 'Amina Kassim'];
  return rawOrders.filter(o => o && o.id && !fakeIds.includes(o.id) && !fakeNames.includes(o.customerName));
};

const sanitizeTickets = (rawTickets: any[]): ServiceTicket[] => {
  if (!Array.isArray(rawTickets)) return [];
  const fakeIds = ['TK-PRT-4091', 'TK-GOV-2088', 'TK-IT-3012'];
  const fakeNames = ['Emmanuel Lyimo', 'Fatma Said', 'Rashid Bakari'];
  return rawTickets.filter(t => t && t.id && !fakeIds.includes(t.id) && !fakeNames.includes(t.customerName));
};

const sanitizeQuotes = (rawQuotes: any[]): QuoteRequest[] => {
  if (!Array.isArray(rawQuotes)) return [];
  const fakeIds = ['TK-QTE-7714', 'TK-QTE-7715'];
  const fakeNames = ['Goodluck Mtei', 'Advocate Sarah Mwakipesile'];
  return rawQuotes.filter(q => q && q.id && !fakeIds.includes(q.id) && !fakeNames.includes(q.customerName));
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Routing based on window.location.hash or memory path
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  });

  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  const navigateTo = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const cleanPath = hash || '/';
      setCurrentPath(cleanPath);

      // Extract simple params if any
      if (cleanPath.startsWith('/shop/product/')) {
        const slug = cleanPath.replace('/shop/product/', '');
        setRouteParams({ productSlug: slug });
      } else if (cleanPath.startsWith('/online-services/')) {
        const slug = cleanPath.replace('/online-services/', '');
        setRouteParams({ serviceSlug: slug });
      } else {
        setRouteParams({});
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Cart State with LocalStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [cart]);

  // Persistent Collections State (Initialized strictly empty or sanitized real records)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? sanitizeOrders(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>(() => {
    try {
      const saved = localStorage.getItem(TICKETS_STORAGE_KEY);
      return saved ? sanitizeTickets(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(() => {
    try {
      const saved = localStorage.getItem(QUOTES_STORAGE_KEY);
      return saved ? sanitizeQuotes(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [printingServices, setPrintingServices] = useState<BaseService[]>([]);
  const [publicServices, setPublicServices] = useState<PublicServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(mockAdvertisements);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Sync products cache to localStorage whenever products state updates
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('Products cache storage error:', e);
    }
  }, [products]);

  // Sync orders to localStorage whenever real orders change
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Orders storage error:', e);
    }
  }, [orders]);

  // Sync service tickets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(serviceTickets));
    } catch (e) {
      console.warn('Tickets storage error:', e);
    }
  }, [serviceTickets]);

  // Sync quote requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quoteRequests));
    } catch (e) {
      console.warn('Quotes storage error:', e);
    }
  }, [quoteRequests]);

  // Admin In-State Product Modifiers
  const addProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev.filter(p => p.id !== newProd.id)]);
  };

  const updateProductInState = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const removeProductFromState = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Synchronize settings & ads
  const refreshAds = useCallback(async () => {
    try {
      const ads = await adService.getActiveAds();
      if (ads.length > 0) {
        setAdvertisements(ads);
      }
    } catch (e) {
      console.warn('Ads sync error:', e);
    }
  }, []);

  const updateStoreSettings = async (newSettings: Partial<StoreSettings>): Promise<StoreSettings> => {
    const updated = await settingsService.updateSettings(newSettings);
    setStoreSettings(updated);
    return updated;
  };

  // Synchronize with Firestore on boot
  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // Settings
      const settings = await settingsService.getSettings();
      setStoreSettings(settings);

      // Ads
      const ads = await adService.getActiveAds();
      if (ads.length > 0) {
        setAdvertisements(ads);
      }

      // Products
      const firestoreProducts = await productService.getProducts({ includeInactive: true });
      if (firestoreProducts.length > 0) {
        setProducts(firestoreProducts);
      }

      // Live Services & Public Portal Services & Testimonials from Firestore
      const [livePrinting, livePublic, liveTestimonials] = await Promise.all([
        servicesCatalogService.getPrintingServices(),
        servicesCatalogService.getPublicServices(),
        servicesCatalogService.getTestimonials()
      ]);
      if (livePrinting.length > 0) setPrintingServices(livePrinting);
      if (livePublic.length > 0) setPublicServices(livePublic);
      if (liveTestimonials.length > 0) setTestimonials(liveTestimonials);

      // Orders
      const firestoreOrders = await orderService.getAllOrders();
      setOrders(sanitizeOrders(firestoreOrders));

      // Tickets
      const firestoreTickets = await serviceRequestService.getAllServiceRequests();
      setServiceTickets(sanitizeTickets(firestoreTickets));

      // Quotes
      const firestoreQuotes = await quoteService.getAllQuotes();
      setQuoteRequests(sanitizeQuotes(firestoreQuotes));
    } catch (err) {
      console.warn('Firestore synchronization notice:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    // Realtime settings listener
    const unsubSettings = settingsService.listenToSettings((liveSettings) => {
      setStoreSettings(liveSettings);
    });

    // Realtime products listener from Firestore
    const unsubProducts = productService.listenToProducts((liveProducts) => {
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      }
    });

    // Realtime printing services listener from Firestore
    const unsubPrinting = servicesCatalogService.listenToPrintingServices((liveServices) => {
      if (liveServices && liveServices.length > 0) {
        setPrintingServices(liveServices);
      }
    });

    // Realtime public portal services listener from Firestore
    const unsubPublic = servicesCatalogService.listenToPublicServices((livePublic) => {
      if (livePublic && livePublic.length > 0) {
        setPublicServices(livePublic);
      }
    });

    // Realtime testimonials listener from Firestore
    const unsubTestimonials = servicesCatalogService.listenToTestimonials((liveTestimonials) => {
      if (liveTestimonials && liveTestimonials.length > 0) {
        setTestimonials(liveTestimonials);
      }
    });

    return () => {
      unsubSettings();
      unsubProducts();
      unsubPrinting();
      unsubPublic();
      unsubTestimonials();
    };
  }, []);


  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(serviceTickets));
    } catch (e) {
      console.warn(e);
    }
  }, [serviceTickets]);

  useEffect(() => {
    try {
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quoteRequests));
    } catch (e) {
      console.warn(e);
    }
  }, [quoteRequests]);

  // Modal State
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    showToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} (Qty: ${quantity}) has been added.`
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Item was removed from your shopping cart.'
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Persistent Creators
  const createOrder = async (orderInput: Partial<Order> & { customerName: string; customerPhone: string; items: any[] }): Promise<Order> => {
    try {
      const created = await orderService.createOrder(orderInput);
      setOrders(prev => [created, ...prev.filter(o => o.id !== created.id)]);
      return created;
    } catch (err) {
      console.warn('Fallback to local order creation:', err);
      const fallbackId = orderInput.id || `TK-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackOrder: Order = {
        id: fallbackId,
        customerName: orderInput.customerName,
        customerPhone: orderInput.customerPhone,
        customerEmail: orderInput.customerEmail,
        items: orderInput.items,
        subtotal: orderInput.subtotal || cartSubtotal,
        deliveryFee: orderInput.deliveryFee || 0,
        total: orderInput.total || (orderInput.subtotal || cartSubtotal) + (orderInput.deliveryFee || 0),
        totalAmount: orderInput.total || (orderInput.subtotal || cartSubtotal) + (orderInput.deliveryFee || 0),
        deliveryMethod: orderInput.deliveryMethod || 'Store Pickup',
        deliveryAddress: orderInput.deliveryAddress,
        deliveryDistrict: orderInput.deliveryDistrict,
        paymentMethod: orderInput.paymentMethod || 'Cash / Pay at Store',
        paymentStatus: orderInput.paymentStatus || 'Pending (Pay on Delivery/Pickup)',
        status: orderInput.status || 'Submitted',
        orderStatus: orderInput.status || 'Submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setOrders(prev => [fallbackOrder, ...prev]);
      return fallbackOrder;
    }
  };

  const createServiceTicket = async (ticketInput: Partial<ServiceTicket> & { customerName: string; customerPhone: string; serviceType: string }): Promise<ServiceTicket> => {
    try {
      const created = await serviceRequestService.createServiceRequest(ticketInput);
      setServiceTickets(prev => [created, ...prev.filter(t => t.id !== created.id)]);
      return created;
    } catch (err) {
      console.warn('Fallback to local ticket creation:', err);
      const fallbackId = ticketInput.id || `TK-SRV-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackTicket: ServiceTicket = {
        id: fallbackId,
        serviceType: ticketInput.serviceType,
        serviceTitle: ticketInput.serviceTitle || `${ticketInput.serviceType} Assistance`,
        customerName: ticketInput.customerName,
        customerPhone: ticketInput.customerPhone,
        customerEmail: ticketInput.customerEmail,
        status: ticketInput.status || 'Submitted',
        estimatedCost: ticketInput.estimatedCost || 'Assessment Pending',
        details: ticketInput.details || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setServiceTickets(prev => [fallbackTicket, ...prev]);
      return fallbackTicket;
    }
  };

  const createQuoteRequest = async (quoteInput: Partial<QuoteRequest> & { customerName: string; customerPhone: string; projectType: string }): Promise<QuoteRequest> => {
    try {
      const created = await quoteService.createQuote(quoteInput);
      setQuoteRequests(prev => [created, ...prev.filter(q => q.id !== created.id)]);
      return created;
    } catch (err) {
      console.warn('Fallback to local quote creation:', err);
      const fallbackId = quoteInput.id || `TK-QTE-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackQuote: QuoteRequest = {
        id: fallbackId,
        projectType: quoteInput.projectType,
        businessScale: quoteInput.businessScale || 'Growing SME',
        features: quoteInput.features || [],
        timeline: quoteInput.timeline || '2-4 Weeks',
        estimatedRange: quoteInput.estimatedRange || 'Estimate Upon Consultation',
        customerName: quoteInput.customerName,
        customerCompany: quoteInput.customerCompany || 'Individual',
        customerPhone: quoteInput.customerPhone,
        customerEmail: quoteInput.customerEmail || '',
        projectNotes: quoteInput.projectNotes || '',
        status: quoteInput.status || 'New',
        createdAt: new Date().toISOString()
      };
      setQuoteRequests(prev => [fallbackQuote, ...prev]);
      return fallbackQuote;
    }
  };

  const updateOrderStatus = async (orderId: string, status: any) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status, orderStatus: status, updatedAt: new Date().toISOString() } : o))
    );
    try {
      await orderService.updateOrderStatus(orderId, status);
    } catch (err) {
      console.warn('Firestore order status update notice:', err);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: any) => {
    setServiceTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
    try {
      await serviceRequestService.updateServiceRequestStatus(ticketId, status);
    } catch (err) {
      console.warn('Firestore ticket status update notice:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        routeParams,
        navigateTo,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        activeModal,
        openModal: setActiveModal,
        closeModal: () => setActiveModal(null),
        toasts,
        showToast,
        removeToast,
        orders,
        serviceTickets,
        quoteRequests,
        products,
        printingServices,
        publicServices,
        testimonials,
        addProduct,
        updateProductInState,
        removeProductFromState,
        storeSettings,
        advertisements,
        updateStoreSettings,
        refreshAds,
        isLoadingData,
        refreshData,
        createOrder,
        createServiceTicket,
        createQuoteRequest,
        updateOrderStatus,
        updateTicketStatus,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
