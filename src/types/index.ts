export type UserRole = 'customer' | 'staff' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserRole;
  address?: string;
  city?: string;
  region?: string;
  street?: string;
  companyName?: string;
  tin?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  languagePreference?: 'sw' | 'en';
  themePreference?: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt?: string;
}

export type ProductCategory =
  | 'All'
  | 'School Supplies'
  | 'Office Supplies'
  | 'Writing Materials'
  | 'Paper & Printing'
  | 'Files & Folders'
  | 'Computer Accessories'
  | 'Other Stationery';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'All',
  'School Supplies',
  'Office Supplies',
  'Writing Materials',
  'Paper & Printing',
  'Files & Folders',
  'Computer Accessories',
  'Other Stationery'
];

export const productCategories = PRODUCT_CATEGORIES;

export interface Product {
  id: string;
  slug: string;
  name: string;
  title?: string;
  category: ProductCategory;
  categoryId?: string;
  price: number; // in TZS (TSh)
  originalPrice?: number;
  compareAtPrice?: number;
  inStock: boolean;
  stockCount: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  sku: string;
  brand: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  shortDescription: string;
  description: string;
  specifications: Record<string, string>;
  image: string;
  images?: string[];
  galleryImages?: string[];
  tags: string[];
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'Submitted'
  | 'pending'
  | 'confirmed'
  | 'Processing'
  | 'processing'
  | 'packed'
  | 'Ready'
  | 'ready_for_pickup'
  | 'Out for Delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'Completed'
  | 'completed'
  | 'Cancelled'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image: string;
}

export interface Order {
  id: string;
  orderId?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalAmount?: number;
  deliveryMethod: 'Store Pickup' | 'Dar es Salaam Delivery' | 'Regional Courier' | string;
  fulfillmentMethod?: string;
  deliveryAddress?: string;
  deliveryDistrict?: string;
  paymentMethod: 'Cash / Pay at Store' | 'Mobile Money (M-Pesa / Tigo Pesa / Airtel Money)' | 'Bank / Store payment' | string;
  paymentStatus: 'Pending (Pay on Delivery/Pickup)' | 'Simulated Verification' | 'Paid' | 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded' | string;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type ServiceCategory = 'Printing' | 'Graphic Design' | 'IT Support' | 'Online Services' | 'Digital Solutions';

export interface BaseService {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  shortDescription: string;
  description: string;
  turnaroundTime: string;
  pricingLabel: string;
  startingPrice?: number;
  iconName: string;
  features: string[];
  requirements?: string[];
  disclaimer?: string;
}

export interface PublicServiceItem {
  id: string;
  slug: string;
  code: 'NIDA' | 'NAPA' | 'TRA' | 'POLICE' | 'RITA' | 'OTHER';
  title: string;
  agencyName: string;
  officialPortalUrlPlaceholder: string;
  shortDescription: string;
  fullDescription: string;
  typicalRequirements: string[];
  estimatedAssistanceTime: string;
  tkAssistanceFeeNote: string;
  officialGovFeeNote: string;
  importantDisclaimer: string;
  features: string[];
  icon: string;
}

export interface ServiceTicket {
  id: string;
  ticketId?: string;
  customerId?: string;
  serviceType: 'Printing' | 'Public Service' | 'Public Services' | 'Graphic Design' | 'IT Support' | string;
  serviceTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
  status: OrderStatus;
  priority?: 'normal' | 'high' | 'urgent';
  estimatedCost: number | string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  internalNotes?: string;
  details: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  fileName?: string;
  fileUrl?: string;
}

export interface QuoteRequest {
  id: string;
  quoteId?: string;
  customerId?: string;
  projectType: 'Website Development' | 'Mobile App Development' | 'Web Application' | 'Business POS & System' | 'Monitoring Dashboard' | 'Custom Software' | string;
  businessScale: 'Solo / Startup' | 'Growing SME' | 'Corporate / Multi-Branch' | string;
  features: string[];
  timeline: string;
  estimatedRange: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerEmail: string;
  projectNotes: string;
  internalNotes?: string;
  status: 'New' | 'In Review' | 'Proposal Sent' | 'Closed' | 'new' | 'reviewing' | 'discovery' | 'proposal_sent' | 'negotiation' | 'approved' | 'rejected' | 'completed' | string;
  createdAt: string;
  updatedAt?: string;
}

export interface PrintJobConfig {
  printType: 'bw' | 'color';
  paperSize: 'A4' | 'A3' | 'A5';
  paperWeight: '80gsm Standard' | '100gsm Smooth' | '120gsm Heavy' | 'Glossy Photo Paper';
  sided: 'single' | 'double';
  binding: 'none' | 'staple' | 'spiral' | 'tape' | 'hardcover';
  lamination: 'none' | 'gloss' | 'matte';
  pageCount: number;
  copies: number;
  notes?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization?: string;
  rating: number;
  comment: string;
  serviceUsed: string;
  date?: string;
  createdAt?: string;
  isDemo?: boolean;
}

export type ActiveModal =
  | null
  | { type: 'quick-view'; product: Product }
  | { type: 'quick-help' }
  | { type: 'print-wizard' }
  | { type: 'quote-builder'; initialCategory?: string }
  | { type: 'public-service-wizard'; serviceId?: string; title?: string; agency?: string; service?: PublicServiceItem }
  | { type: 'public-service-request'; service: PublicServiceItem }
  | { type: 'it-support-booking'; serviceTitle?: string }
  | { type: 'design-brief'; serviceTitle?: string }
  | { type: 'confirm-dialog'; title: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void; isDestructive?: boolean }
  | { type: 'auth-modal'; mode?: 'login' | 'register' | 'forgot' };

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'processing'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded';

export type PaymentMethod =
  | 'mpesa'
  | 'tigopesa'
  | 'airtelmoney'
  | 'bank'
  | 'cash_on_delivery'
  | 'cash_at_store';

export type PaymentProviderType =
  | 'mpesa'
  | 'tigopesa'
  | 'airtelmoney'
  | 'bank_transfer'
  | 'cash'
  | 'tanzania_unified'
  | 'mock_sandbox';

export interface PaymentTransaction {
  id: string;
  paymentId?: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  provider: string;
  method: PaymentMethod | string;
  amount: number;
  currency: 'TZS';
  status: PaymentStatus;
  providerTransactionId?: string;
  reference: string;
  customerMsisdn?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export type NotificationChannel = 'in_app' | 'whatsapp' | 'sms' | 'email';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'read';
export type NotificationType =
  | 'order_created'
  | 'payment_received'
  | 'payment_pending'
  | 'payment_failed'
  | 'order_confirmed'
  | 'order_processing'
  | 'order_ready'
  | 'order_dispatched'
  | 'order_completed'
  | 'ticket_created'
  | 'ticket_updated'
  | 'quote_received'
  | 'quote_updated'
  | 'low_stock_alert'
  | 'system_alert';

export interface NotificationItem {
  id: string;
  userId: string; // customer uid or 'admin' / 'staff'
  orderId?: string;
  ticketId?: string;
  quoteId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  sentAt?: string;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type AdminActionType =
  | 'user_signup'
  | 'admin_login'
  | 'user_login'
  | 'user_role_updated'
  | 'order_status_updated'
  | 'order_created'
  | 'order_cancelled'
  | 'payment_verified'
  | 'payment_failed'
  | 'payment_refunded'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'product_toggled'
  | 'inventory_adjusted'
  | 'store_settings_updated'
  | 'ad_created'
  | 'ad_updated'
  | 'ad_deleted'
  | 'ticket_status_updated'
  | 'quote_status_updated'
  | 'category_created'
  | 'category_deleted'
  | 'document_uploaded'
  | 'document_deleted'
  | 'system_sync'
  | string;

export interface AdminAuditLog {
  id: string;
  action: AdminActionType;
  actorId: string;
  actorEmail?: string;
  actorName?: string;
  actorRole: UserRole | 'system';
  targetType: 'order' | 'payment' | 'product' | 'category' | 'inventory' | 'customer' | 'user' | 'service_request' | 'quote' | 'ad' | 'settings' | 'user_role' | 'document' | 'system';
  targetId: string;
  targetTitle?: string;
  details: Record<string, any>;
  timestamp: string;
  severity?: 'info' | 'warning' | 'critical';
  category?: 'auth' | 'orders' | 'payments' | 'inventory' | 'staff' | 'settings' | 'content' | 'general';
  privacyStatus?: 'redacted' | 'zero_knowledge';
}

export interface PaymentAuditLog {
  id: string;
  paymentId: string;
  orderId: string;
  action: 'initiated' | 'callback_received' | 'verified' | 'failed' | 'cancelled' | 'refund_requested' | 'refunded' | 'manual_override';
  actorId?: string;
  actorRole?: string;
  details: Record<string, any>;
  timestamp: string;
}

export type Language = 'sw' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface StoreSettings {
  id?: string;
  storeName: string;
  paymentWhatsAppNumber: string; // Default: '0787754202'
  displayPhoneNumber: string;
  businessEmail: string;
  storeAddress: string;
  businessHours: string;
  darDeliveryFee: number;
  upcountryDeliveryFee: number;
  mpesaAccountName: string;
  tigopesaAccountName: string;
  airtelMoneyAccountName: string;
  bankAccountDetails: string;
  heroAnnouncementText: string;
  announcementActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export type AdPlacement = 'hero_banner' | 'popup_modal' | 'sidebar' | 'footer_banner' | 'home_highlight';

export interface Advertisement {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badgeText?: string;
  buttonText?: string;
  targetUrl: string;
  imageUrl: string;
  placement: AdPlacement;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  priority?: number;
  viewsCount?: number;
  clicksCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  relatedType: 'order' | 'service_request' | 'quote' | 'direct_upload';
  relatedId?: string;
  relatedTitle?: string;
  createdAt: string;
  notes?: string;
}

export interface SavedProduct {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  savedAt: string;
}



