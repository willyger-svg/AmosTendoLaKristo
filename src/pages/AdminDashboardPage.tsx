import React from 'react';
import { useApp } from '../context/AppContext';
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
          title: 'Mlolongo wa Oda (Orders)',
          breadcrumbs: [{ label: 'Oda za Wateja' }]
        };
      case 'payments':
        return {
          title: 'Malipo ya Kitanzania (Ledger)',
          breadcrumbs: [{ label: 'Malipo' }]
        };
      case 'products':
        return {
          title: 'Katalogi ya Bidhaa',
          breadcrumbs: [{ label: 'Bidhaa' }]
        };
      case 'categories':
        return {
          title: 'Makundi ya Bidhaa',
          breadcrumbs: [{ label: 'Kategoria' }]
        };
      case 'inventory':
        return {
          title: 'Usimamizi wa Stoo',
          breadcrumbs: [{ label: 'Hesabu ya Stoo' }]
        };
      case 'customers':
        return {
          title: 'Orodha ya Wateja',
          breadcrumbs: [{ label: 'Wateja' }]
        };
      case 'service-requests':
        return {
          title: 'Maombi ya Huduma (Print & Portals)',
          breadcrumbs: [{ label: 'Maombi ya Huduma' }]
        };
      case 'quotes':
        return {
          title: 'Nukuu za Mifumo (Quotes)',
          breadcrumbs: [{ label: 'Nukuu za Bei' }]
        };
      case 'documents':
        return {
          title: 'Hifadhi ya Nyaraka za Wateja',
          breadcrumbs: [{ label: 'Nyaraka & Faili' }]
        };
      case 'advertisements':
        return {
          title: 'Mabango ya Matangazo (CMS)',
          breadcrumbs: [{ label: 'Mabango ya Matangazo' }]
        };
      case 'content':
        return {
          title: 'Maudhui ya Ukurasa Mkuu',
          breadcrumbs: [{ label: 'Maudhui ya Tovuti' }]
        };
      case 'services':
        return {
          title: 'Katalogi ya Huduma za Umma',
          breadcrumbs: [{ label: 'Usimamizi wa Huduma' }]
        };
      case 'notifications':
        return {
          title: 'Kituo cha Arifa',
          breadcrumbs: [{ label: 'Arifa za Mfumo' }]
        };
      case 'staff':
        return {
          title: 'Usimamizi wa Wafanyakazi (RBAC)',
          breadcrumbs: [{ label: 'Wafanyakazi & Majukumu' }]
        };
      case 'audit-logs':
        return {
          title: 'Kumbukumbu za Usalama (Audit)',
          breadcrumbs: [{ label: 'Kumbukumbu za Mfumo' }]
        };
      case 'settings':
        return {
          title: 'Mipangilio ya Duka & WhatsApp',
          breadcrumbs: [{ label: 'Mipangilio ya Mfumo' }]
        };
      case 'dashboard':
      default:
        return {
          title: 'Kituo Kikuu cha Uongozi',
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
