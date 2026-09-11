import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminSectionId } from '../utils/adminPermissions';

// Modular Views
import { AdminOverviewPage } from './admin/AdminOverviewPage';
import { AdminOrdersView } from '../components/admin/views/AdminOrdersView';
import { AdminPaymentsView } from '../components/admin/views/AdminPaymentsView';
import { AdminProductsView } from '../components/admin/views/AdminProductsView';
import { AdminCategoriesView } from '../components/admin/views/AdminCategoriesView';
import { AdminInventoryView } from '../components/admin/views/AdminInventoryView';
import { AdminCustomersView } from '../components/admin/views/AdminCustomersView';
import { AdminServiceRequestsView } from '../components/admin/views/AdminServiceRequestsView';
import { AdminQuotesView } from '../components/admin/views/AdminQuotesView';
import { AdminDocumentsView } from '../components/admin/views/AdminDocumentsView';
import { AdminAdvertisementsView } from '../components/admin/views/AdminAdvertisementsView';
import { AdminContentView } from '../components/admin/views/AdminContentView';
import { AdminServicesCatalogView } from '../components/admin/views/AdminServicesCatalogView';
import { AdminNotificationsView } from '../components/admin/views/AdminNotificationsView';
import { AdminStaffView } from '../components/admin/views/AdminStaffView';
import { AdminAuditLogsView } from '../components/admin/views/AdminAuditLogsView';
import { AdminSettingsView } from '../components/admin/views/AdminSettingsView';

export const AdminDashboardPage: React.FC = () => {
  const { currentPath } = useApp();
  const { t, language } = useTranslation();

  const getSectionFromPath = (path: string): AdminSectionId => {
    if (path === '/admin' || path === '/admin/' || path === '/admin/dashboard') return 'dashboard';
    if (path.startsWith('/admin/orders')) return 'orders';
    if (path.startsWith('/admin/payments')) return 'payments';
    if (path.startsWith('/admin/products')) return 'products';
    if (path.startsWith('/admin/categories')) return 'categories';
    if (path.startsWith('/admin/inventory')) return 'inventory';
    if (path.startsWith('/admin/customers')) return 'customers';
    if (path.startsWith('/admin/service-requests')) return 'service-requests';
    if (path.startsWith('/admin/quotes')) return 'quotes';
    if (path.startsWith('/admin/documents')) return 'documents';
    if (path.startsWith('/admin/advertisements')) return 'advertisements';
    if (path.startsWith('/admin/content')) return 'content';
    if (path.startsWith('/admin/services')) return 'services';
    if (path.startsWith('/admin/notifications')) return 'notifications';
    if (path.startsWith('/admin/staff')) return 'staff';
    if (path.startsWith('/admin/audit-logs')) return 'audit-logs';
    if (path.startsWith('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeSectionId = getSectionFromPath(currentPath);

  const getSectionMetadata = (section: AdminSectionId) => {
    switch (section) {
      case 'orders':
        return {
          title: language === 'sw' ? 'Mlolongo wa Oda (Orders)' : 'Orders Fulfillment Queue',
          breadcrumbs: [{ label: t('admin.nav.orders') }]
        };
      case 'payments':
        return {
          title: language === 'sw' ? 'Malipo ya Kitanzania (Ledger)' : 'Payments & Transaction Ledger',
          breadcrumbs: [{ label: t('admin.nav.payments') }]
        };
      case 'products':
        return {
          title: language === 'sw' ? 'Katalogi ya Bidhaa' : 'Stationery Products Catalog',
          breadcrumbs: [{ label: t('admin.nav.products') }]
        };
      case 'categories':
        return {
          title: language === 'sw' ? 'Makundi ya Bidhaa' : 'Product Categories & Taxonomies',
          breadcrumbs: [{ label: t('admin.nav.categories') }]
        };
      case 'inventory':
        return {
          title: language === 'sw' ? 'Usimamizi wa Stoo' : 'Inventory & Warehouse Stock',
          breadcrumbs: [{ label: t('admin.nav.inventory') }]
        };
      case 'customers':
        return {
          title: language === 'sw' ? 'Orodha ya Wateja' : 'Customer Accounts Directory',
          breadcrumbs: [{ label: t('admin.nav.customers') }]
        };
      case 'service-requests':
        return {
          title: language === 'sw' ? 'Maombi ya Huduma (Print & Portals)' : 'Print & Portal Service Requests',
          breadcrumbs: [{ label: t('admin.nav.service_requests') }]
        };
      case 'quotes':
        return {
          title: language === 'sw' ? 'Nukuu za Mifumo (Quotes)' : 'Software & Tech Quotes',
          breadcrumbs: [{ label: t('admin.nav.quotes') }]
        };
      case 'documents':
        return {
          title: language === 'sw' ? 'Hifadhi ya Nyaraka za Wateja' : 'Customer Documents Repository',
          breadcrumbs: [{ label: t('admin.nav.documents') }]
        };
      case 'advertisements':
        return {
          title: language === 'sw' ? 'Mabango ya Matangazo (CMS)' : 'Advertisements & Banners CMS',
          breadcrumbs: [{ label: t('admin.nav.advertisements') }]
        };
      case 'content':
        return {
          title: language === 'sw' ? 'Maudhui ya Ukurasa Mkuu' : 'Homepage Content & Merchandising',
          breadcrumbs: [{ label: t('admin.nav.content') }]
        };
      case 'services':
        return {
          title: language === 'sw' ? 'Katalogi ya Huduma za Umma' : 'Public Portals & IT Services',
          breadcrumbs: [{ label: t('admin.nav.services') }]
        };
      case 'notifications':
        return {
          title: language === 'sw' ? 'Kituo cha Arifa' : 'Operations Notification Center',
          breadcrumbs: [{ label: t('admin.nav.notifications') }]
        };
      case 'staff':
        return {
          title: language === 'sw' ? 'Usimamizi wa Wafanyakazi (RBAC)' : 'Staff & Team RBAC Management',
          breadcrumbs: [{ label: t('admin.nav.staff') }]
        };
      case 'audit-logs':
        return {
          title: language === 'sw' ? 'Kumbukumbu za Usalama (Audit)' : 'Security Audit Trail',
          breadcrumbs: [{ label: t('admin.nav.audit_logs') }]
        };
      case 'settings':
        return {
          title: language === 'sw' ? 'Mipangilio ya Duka & WhatsApp' : 'Store Settings & Payment Numbers',
          breadcrumbs: [{ label: t('admin.nav.settings') }]
        };
      case 'dashboard':
      default:
        return {
          title: language === 'sw' ? 'Kituo Kikuu cha Uongozi' : 'Control Center Overview',
          breadcrumbs: []
        };
    }
  };

  const { title, breadcrumbs } = getSectionMetadata(activeSectionId);

  const renderSectionView = () => {
    switch (activeSectionId) {
      case 'orders':
        return <AdminOrdersView />;
      case 'payments':
        return <AdminPaymentsView />;
      case 'products':
        return <AdminProductsView />;
      case 'categories':
        return <AdminCategoriesView />;
      case 'inventory':
        return <AdminInventoryView />;
      case 'customers':
        return <AdminCustomersView />;
      case 'service-requests':
        return <AdminServiceRequestsView />;
      case 'quotes':
        return <AdminQuotesView />;
      case 'documents':
        return <AdminDocumentsView />;
      case 'advertisements':
        return <AdminAdvertisementsView />;
      case 'content':
        return <AdminContentView />;
      case 'services':
        return <AdminServicesCatalogView />;
      case 'notifications':
        return <AdminNotificationsView />;
      case 'staff':
        return <AdminStaffView />;
      case 'audit-logs':
        return <AdminAuditLogsView />;
      case 'settings':
        return <AdminSettingsView />;
      case 'dashboard':
      default:
        return <AdminOverviewPage />;
    }
  };

  return (
    <AdminLayout
      activeSectionId={activeSectionId}
      pageTitle={title}
      breadcrumbs={breadcrumbs}
    >
      {renderSectionView()}
    </AdminLayout>
  );
};
