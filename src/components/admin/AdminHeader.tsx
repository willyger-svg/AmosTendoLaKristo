import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AdminNotificationsPopover } from './AdminNotificationsPopover';
import { ADMIN_ROLE_CONFIGS } from '../../utils/adminPermissions';
import {
  Menu,
  Search,
  Zap,
  Store,
  RefreshCw,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  User,
  ChevronRight,
  Camera
} from 'lucide-react';

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenQuickActions: () => void;
  pageTitle: string;
  breadcrumbs?: { label: string; path?: string }[];
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenQuickActions,
  pageTitle,
  breadcrumbs = []
}) => {
  const { navigateTo, refreshData, isLoadingData, showToast, orders, serviceTickets, openModal } = useApp();
  const { userProfile, userRole, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const roleConfig = ADMIN_ROLE_CONFIGS[userRole] || ADMIN_ROLE_CONFIGS.customer;

  // Count unread or pending items for notification bell
  const pendingItemsCount =
    orders.filter(o => o.status === 'Submitted').length +
    serviceTickets.filter(t => t.status === 'Received').length;

  // Handle outside click for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const handleSyncFirestore = async () => {
    try {
      await refreshData();
      showToast({
        type: 'success',
        title: 'Firestore Imesawazishwa',
        message: 'Mifumo na kumbukumbu za hivi karibuni zimesasishwa.'
      });
    } catch {
      showToast({
        type: 'warning',
        title: 'Onyo la Usawazishaji',
        message: 'Imeshindwa kusawazisha kumbukumbu za hivi karibuni kutoka seva.'
      });
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <header className="h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left side: Hamburger + Title + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Fungua Menyu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
            <span
              onClick={() => navigateTo('/admin')}
              className="hover:text-amber-500 cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>TK Admin</span>
            </span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                {crumb.path ? (
                  <span
                    onClick={() => navigateTo(crumb.path!)}
                    className="hover:text-amber-500 cursor-pointer transition-colors truncate"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <span className="text-slate-700 dark:text-slate-200 truncate font-bold">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Tools & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500 text-xs font-medium transition-all"
        >
          <Search className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden lg:inline">Tafuta oda, bidhaa, wateja...</span>
          <span className="lg:hidden">Tafuta</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Tafuta"
        >
          <Search className="w-4 h-4 text-amber-500" />
        </button>

        {/* Quick Actions Button */}
        <button
          onClick={onOpenQuickActions}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
          title="Vitendo vya Haraka"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span className="hidden md:inline">Vitendo vya Haraka</span>
        </button>

        {/* Live Storefront Link */}
        <button
          onClick={() => navigateTo('/')}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          title="Tovuti Kuu"
        >
          <Store className="w-3.5 h-3.5 text-blue-500" />
          <span>Tovuti Kuu</span>
        </button>

        {/* Sync Firestore Button */}
        <button
          onClick={handleSyncFirestore}
          disabled={isLoadingData}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Sawazisha Data"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${isLoadingData ? 'animate-spin' : ''}`} />
        </button>

        {/* Operational Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Taarifa za Mfumo"
          >
            <Bell className="w-4 h-4" />
            {pendingItemsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          <AdminNotificationsPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onNavigateToSection={path => {
              navigateTo(path);
              setIsNotificationsOpen(false);
            }}
          />
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Badili Mwonekano"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs border border-slate-700 overflow-hidden flex-shrink-0">
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                (userProfile?.fullName || 'AD').slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px]">
                {userProfile?.fullName || 'Msimamizi'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Staff'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-transform" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fadeIn">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {userProfile?.fullName || 'Msimamizi'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {userProfile?.email || 'admin@tkstationery.co.tz'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${roleConfig.badgeClass}`}>
                    {roleConfig.labelSw || roleConfig.labelEn}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Imeidhinishwa
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    openModal({ type: 'profile-photo' });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors"
                >
                  <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Badili Picha ya Wasifu</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('/admin/settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Mipangilio ya Mfumo</span>
                </button>

                <button
                  onClick={() => {
                    navigateTo('/');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Store className="w-4 h-4 text-blue-500" />
                  <span>Tovuti Kuu</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={async () => {
                    setIsProfileOpen(false);
                    await logout();
                    navigateTo('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Toka Kwenye Akaunti</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
