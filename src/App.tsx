import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { CartDrawer } from './components/shop/CartDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { PrintRequestModal } from './components/printing/PrintRequestModal';
import { PublicServiceWizardModal } from './components/common/PublicServiceWizardModal';
import { QuickHelpModal } from './components/common/QuickHelpModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PrintingPage } from './pages/PrintingPage';
import { OnlineServicesPage } from './pages/OnlineServicesPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

const AppContent: React.FC = () => {
  const { currentPath } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  // 1. Dedicated standalone admin login view
  if (currentPath === '/admin/login') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-amber-400 selection:text-slate-950">
        <AdminLoginPage />
        <ToastContainer />
      </div>
    );
  }

  const renderCurrentPage = () => {
    // Route matching
    if (currentPath === '/' || currentPath === '') {
      return <HomePage />;
    }

    if (currentPath.startsWith('/shop/product/')) {
      return <ProductDetailPage />;
    }

    if (currentPath.startsWith('/shop')) {
      return <ShopPage />;
    }

    if (currentPath === '/cart') {
      return <CartPage />;
    }

    if (currentPath === '/checkout') {
      return <CheckoutPage />;
    }

    if (currentPath === '/printing') {
      return <PrintingPage />;
    }

    if (currentPath.startsWith('/online-services')) {
      return <OnlineServicesPage />;
    }

    if (currentPath === '/graphic-design') {
      return <PrintingPage />;
    }

    if (currentPath === '/it-support' || currentPath === '/digital-solutions') {
      return <OnlineServicesPage />;
    }

    if (currentPath === '/track-order') {
      return <TrackOrderPage />;
    }

    if (currentPath === '/login' || currentPath === '/register') {
      return <CustomerLoginPage />;
    }

    if (currentPath === '/account' || currentPath.startsWith('/account/')) {
      return <CustomerAccountPage />;
    }

    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      return <AdminDashboardPage />;
    }

    if (currentPath === '/about') {
      return <AboutPage />;
    }

    if (currentPath === '/contact') {
      return <ContactPage />;
    }

    // Default fallback
    return <HomePage />;
  };

  const isAdminSection = currentPath === '/admin' || currentPath.startsWith('/admin/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {!isAdminSection && <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />}

      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {!isAdminSection && <Footer />}
      {!isAdminSection && (
        <MobileNavigation
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Global Interactive Overlays */}
      <CartDrawer />
      <QuickViewModal />
      <QuickHelpModal />
      <ConfirmModal />
      <PrintRequestModal />
      <PublicServiceWizardModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

