import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../context/LanguageContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminMobileDrawer } from './AdminMobileDrawer';
import { AdminGlobalSearchModal } from './AdminGlobalSearchModal';
import { AdminQuickActionsModal } from './AdminQuickActionsModal';
import { canAccessSection, AdminSectionId } from '../../utils/adminPermissions';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSectionId?: AdminSectionId;
  pageTitle: string;
  breadcrumbs?: { label: string; path?: string }[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeSectionId = 'dashboard',
  pageTitle,
  breadcrumbs = []
}) => {
  const { currentUser, userProfile, userRole, loading: authLoading } = useAuth();
  const { navigateTo } = useApp();
  const { t, language } = useTranslation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tk_admin_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('tk_admin_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <Lock className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-200">Verifying Administrative Privileges...</p>
        <p className="text-xs text-slate-500 mt-1">TK Stationery Security Protocol</p>
      </div>
    );
  }

  // 2. Not Signed In State
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-white">
              {language === 'sw' ? 'Jopo la Usimamizi Linahitaji Kuingia' : 'Administrative Authentication Required'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'sw'
                ? 'Eneo hili limetengwa kwa wafanyakazi na wasimamizi wa TK Stationery pekee. Tafadhali ingia kwa akaunti yako ya kiutawala.'
                : 'This workspace is strictly restricted to authorized TK Stationery staff and managers. Please authenticate with your staff credentials.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => navigateTo('/admin/login')}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'sw' ? 'Ingia Jopo la Admin' : 'Sign In to Admin Portal'}</span>
            </button>
            <button
              onClick={() => navigateTo('/')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'sw' ? 'Rudi Tovuti Kuu' : 'Return to Storefront'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Customer Role (Denied from Admin Area)
  if (userRole === 'customer') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center text-white shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-white">
              {language === 'sw' ? 'Ufikiaji Umekataliwa (Access Denied)' : 'Administrative Access Denied'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'sw'
                ? `Umeingia kama "${userProfile?.fullName || 'Customer'}" ukiwa na akaunti ya mteja. Akaunti za wateja hazina ruhusa ya kufikia eneo la utawala.`
                : `You are signed in as "${userProfile?.fullName || 'Customer'}" with a retail customer profile. Customers cannot access administrative management tools.`}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => navigateTo('/account')}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
            >
              {language === 'sw' ? 'Nenda Akaunti Yangu ya Mteja' : 'Go to My Customer Account'}
            </button>
            <button
              onClick={() => navigateTo('/')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-semibold transition-all"
            >
              {language === 'sw' ? 'Rudi Duka Kuu' : 'Return to Shop'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Section Permission Check (Staff / Admin specific capabilities)
  const isSectionAllowed = canAccessSection(userRole, activeSectionId as AdminSectionId);
  if (!isSectionAllowed) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
        <AdminHeader
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickActions={() => setIsQuickActionsOpen(true)}
          pageTitle="Permission Restricted"
          breadcrumbs={breadcrumbs}
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {language === 'sw' ? 'Huna Idhini ya Eneo Hili' : 'Section Permission Restricted'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'sw'
                ? `Jukumu lako la "${userRole}" haliruhusiwi kufikia sehemu ya /admin/${activeSectionId}. Wasiliana na Super Admin kufunguliwa idhini.`
                : `Your current role (${userRole}) is not authorized to access /admin/${activeSectionId}. Please contact a Super Administrator for role delegation.`}
            </p>
            <button
              onClick={() => navigateTo('/admin')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              {language === 'sw' ? 'Rudi Dashibodi Kuu' : 'Return to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authorized Admin Workspace Shell
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-row overflow-x-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 sticky top-0 h-screen z-40">
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile Navigation Drawer */}
      <AdminMobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Global Search Modal */}
      <AdminGlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Quick Actions Modal */}
      <AdminQuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
      />

      {/* Main Administrative Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickActions={() => setIsQuickActionsOpen(true)}
          pageTitle={pageTitle}
          breadcrumbs={breadcrumbs}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
