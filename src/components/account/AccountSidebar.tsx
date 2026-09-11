import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  ShoppingBag,
  FileCheck,
  Sparkles,
  FolderOpen,
  User,
  Bell,
  Heart,
  Settings,
  ShieldCheck,
  LogOut,
  Camera,
  CheckCircle2
} from 'lucide-react';

export type AccountTabId =
  | 'overview'
  | 'orders'
  | 'service-requests'
  | 'quotes'
  | 'documents'
  | 'profile'
  | 'notifications'
  | 'saved'
  | 'settings';

interface AccountSidebarProps {
  currentTab: AccountTabId;
  onTabChange: (tab: AccountTabId) => void;
  onOpenPhotoModal: () => void;
  counts: {
    orders: number;
    tickets: number;
    quotes: number;
    documents: number;
    saved: number;
    unreadNotifications: number;
  };
  onSignOut: () => void;
  onGoToAdmin?: () => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  currentTab,
  onTabChange,
  onOpenPhotoModal,
  counts,
  onSignOut,
  onGoToAdmin
}) => {
  const { currentUser, userProfile, isAdmin, isStaff } = useAuth();
  const { t, language } = useTranslation();

  const navItems: { id: AccountTabId; label: string; icon: React.ReactNode; badge?: number; highlightBadge?: boolean }[] = [
    {
      id: 'overview',
      label: language === 'sw' ? 'Muhtasari wa Dashibodi' : 'Account Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'orders',
      label: language === 'sw' ? 'Oda Zangu za Vifaa' : 'My Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: counts.orders
    },
    {
      id: 'service-requests',
      label: language === 'sw' ? 'Tiketi za Huduma' : 'Service Requests',
      icon: <FileCheck className="w-4 h-4" />,
      badge: counts.tickets
    },
    {
      id: 'quotes',
      label: language === 'sw' ? 'Nukuu za Software' : 'Tech Quotes',
      icon: <Sparkles className="w-4 h-4" />,
      badge: counts.quotes
    },
    {
      id: 'documents',
      label: language === 'sw' ? 'Nyaraka na Mafaili' : 'My Documents',
      icon: <FolderOpen className="w-4 h-4" />,
      badge: counts.documents
    },
    {
      id: 'saved',
      label: language === 'sw' ? 'Bidhaa Zilizohifadhiwa' : 'Saved Products',
      icon: <Heart className="w-4 h-4" />,
      badge: counts.saved
    },
    {
      id: 'profile',
      label: language === 'sw' ? 'Wasifu & Taarifa' : 'Customer Profile',
      icon: <User className="w-4 h-4" />
    },
    {
      id: 'notifications',
      label: language === 'sw' ? 'Taarifa & Meseji' : 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: counts.unreadNotifications,
      highlightBadge: counts.unreadNotifications > 0
    },
    {
      id: 'settings',
      label: language === 'sw' ? 'Mipangilio ya Akaunti' : 'Account Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
      {/* Customer Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Quick Upload Trigger */}
          <div className="relative group flex-shrink-0">
            <button
              type="button"
              onClick={onOpenPhotoModal}
              className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs overflow-hidden border-2 border-amber-400 hover:opacity-90 transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              title={language === 'sw' ? 'Badili Picha ya Wasifu' : 'Change Profile Photo'}
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.fullName || 'User Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(userProfile?.fullName || currentUser?.email || 'TK').charAt(0).toUpperCase()}</span>
              )}
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-slate-950/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-amber-400" />
              </div>
            </button>
            <button
              type="button"
              onClick={onOpenPhotoModal}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 rounded-full flex items-center justify-center shadow-xs border border-white dark:border-slate-900 transition-colors"
              title={language === 'sw' ? 'Pakia Picha' : 'Upload photo'}
            >
              <Camera className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="overflow-hidden min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {userProfile?.fullName || 'TK Customer'}
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {currentUser?.email}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{language === 'sw' ? 'Mteja Hai' : 'Active Account'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2.5 shadow-xs space-y-1">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                isActive
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={isActive ? 'text-amber-400 dark:text-slate-950' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${
                    item.highlightBadge
                      ? 'bg-rose-500 text-white animate-pulse'
                      : isActive
                      ? 'bg-slate-800 dark:bg-amber-400 text-amber-300 dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Separator */}
        <div className="pt-2 my-1 border-t border-slate-100 dark:border-slate-800" />

        {/* Staff/Admin Shortcut if permitted */}
        {(isAdmin || isStaff) && onGoToAdmin && (
          <button
            type="button"
            onClick={onGoToAdmin}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/70 dark:hover:bg-amber-950/40 transition-colors min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>{language === 'sw' ? 'Nenda Jopo la Admin' : 'Go to Admin Portal'}</span>
          </button>
        )}

        {/* Sign Out Action */}
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('account.sign_out', 'Toka kwenye Akaunti')}</span>
        </button>
      </nav>
    </aside>
  );
};
