import { UserRole } from '../types';

export type AdminSectionId =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'customers'
  | 'service-requests'
  | 'quotes'
  | 'payments'
  | 'documents'
  | 'advertisements'
  | 'content'
  | 'services'
  | 'notifications'
  | 'staff'
  | 'audit-logs'
  | 'settings';

export type AdminPermission =
  | 'view_dashboard'
  | 'manage_orders'
  | 'view_orders'
  | 'manage_payments'
  | 'view_payments'
  | 'manage_service_requests'
  | 'manage_quotes'
  | 'view_inventory'
  | 'manage_inventory'
  | 'manage_products'
  | 'manage_categories'
  | 'view_customers'
  | 'manage_customers'
  | 'view_documents'
  | 'manage_ads'
  | 'manage_content'
  | 'manage_services'
  | 'view_notifications'
  | 'manage_notifications'
  | 'manage_staff'
  | 'view_audit_logs'
  | 'manage_settings';

export interface AdminRoleMeta {
  role: UserRole;
  labelSw: string;
  labelEn: string;
  badgeClass: string;
  descriptionSw: string;
  descriptionEn: string;
}

export const ADMIN_ROLE_CONFIGS: Record<UserRole, AdminRoleMeta> = {
  super_admin: {
    role: 'super_admin',
    labelSw: 'Msimamizi Mkuu (Super Admin)',
    labelEn: 'Super Administrator',
    badgeClass: 'bg-amber-500 text-slate-950 font-black',
    descriptionSw: 'Ufikiaji kamili wa mfumo, majukumu ya wafanyakazi, kumbukumbu za usalama na mipangilio mikuu.',
    descriptionEn: 'Full system access, staff role delegation, audit logs, and critical store settings.'
  },
  admin: {
    role: 'admin',
    labelSw: 'Msimamizi (Admin)',
    labelEn: 'Administrator',
    badgeClass: 'bg-blue-600 text-white font-bold',
    descriptionSw: 'Usimamizi wa bidhaa, bei, hesabu za stoo, wateja, matangazo, maudhui na mipangilio ya duka.',
    descriptionEn: 'Catalog, pricing, inventory management, customer support, ads, and store settings.'
  },
  staff: {
    role: 'staff',
    labelSw: 'Mfanyakazi wa Utendaji (Staff)',
    labelEn: 'Operations Staff',
    badgeClass: 'bg-emerald-600 text-white font-bold',
    descriptionSw: 'Utekelezaji wa oda, uhakiki wa malipo ya duka, tiketi za huduma, na nukuu za wateja.',
    descriptionEn: 'Daily order processing, payment verification, service tickets, and quote leads.'
  },
  customer: {
    role: 'customer',
    labelSw: 'Mteja (Customer)',
    labelEn: 'Customer',
    badgeClass: 'bg-slate-200 text-slate-800 font-medium',
    descriptionSw: 'Akaunti ya mnunuzi wa kawaida. Haina idhini ya jopo la utawala.',
    descriptionEn: 'Public retail customer account. No administrative privileges.'
  }
};

/**
 * Checks if a user role has access to view a specific admin section/route
 */
export function canAccessSection(role: UserRole | undefined, section: AdminSectionId): boolean {
  if (!role || role === 'customer') return false;

  // Super Admin can access everything
  if (role === 'super_admin') return true;

  // Admin access matrix
  if (role === 'admin') {
    // Admin cannot access super_admin-only sections (staff role changes, security audit logs)
    if (section === 'staff' || section === 'audit-logs') return false;
    return true;
  }

  // Staff access matrix (operational tasks only)
  if (role === 'staff') {
    switch (section) {
      case 'dashboard':
      case 'orders':
      case 'payments':
      case 'service-requests':
      case 'quotes':
      case 'inventory':
      case 'notifications':
      case 'documents':
        return true;
      // Staff cannot manage catalog, ads, content, staff, audit, settings, categories
      case 'products':
      case 'categories':
      case 'customers':
      case 'advertisements':
      case 'content':
      case 'services':
      case 'staff':
      case 'audit-logs':
      case 'settings':
      default:
        return false;
    }
  }

  return false;
}

/**
 * Checks if a user has a specific granular permission
 */
export function hasPermission(role: UserRole | undefined, permission: AdminPermission): boolean {
  if (!role || role === 'customer') return false;
  if (role === 'super_admin') return true;

  if (role === 'admin') {
    if (permission === 'manage_staff' || permission === 'view_audit_logs') {
      return false;
    }
    return true;
  }

  if (role === 'staff') {
    switch (permission) {
      case 'view_dashboard':
      case 'view_orders':
      case 'manage_orders':
      case 'view_payments':
      case 'manage_payments':
      case 'manage_service_requests':
      case 'manage_quotes':
      case 'view_inventory':
      case 'manage_inventory':
      case 'view_notifications':
      case 'view_documents':
        return true;
      default:
        return false;
    }
  }

  return false;
}
