import React, { useRef, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { AccountTabId } from './AccountSidebar';
import {
  LayoutDashboard,
  ShoppingBag,
  FileCheck,
  Sparkles,
  FolderOpen,
  User,
  Bell,
  Heart,
  Settings
} from 'lucide-react';

interface AccountMobileNavProps {
  currentTab?: AccountTabId;
  activeTab?: AccountTabId;
  onTabChange: (tab: AccountTabId) => void;
  counts?: Partial<{
    orders: number;
    tickets: number;
    quotes: number;
    documents: number;
    saved: number;
    unreadNotifications: number;
  }>;
  badges?: Record<string, number>;
}

export const AccountMobileNav: React.FC<AccountMobileNavProps> = ({
  currentTab,
  activeTab,
  onTabChange,
  counts,
  badges
}) => {
  const { language } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedTab = currentTab || activeTab || 'overview';

  const safeCounts = {
    orders: counts?.orders ?? badges?.orders ?? 0,
    tickets: counts?.tickets ?? badges?.['service-requests'] ?? badges?.tickets ?? 0,
    quotes: counts?.quotes ?? badges?.quotes ?? 0,
    documents: counts?.documents ?? badges?.documents ?? 0,
    saved: counts?.saved ?? badges?.saved ?? 0,
    unreadNotifications: counts?.unreadNotifications ?? badges?.notifications ?? 0
  };

  const tabs: { id: AccountTabId; label: string; icon: React.ReactNode; badge?: number; highlightBadge?: boolean }[] = [
    {
      id: 'overview',
      label: language === 'sw' ? 'Muhtasari' : 'Overview',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />
    },
    {
      id: 'orders',
      label: language === 'sw' ? 'Oda' : 'Orders',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      badge: safeCounts.orders
    },
    {
      id: 'service-requests',
      label: language === 'sw' ? 'Huduma' : 'Services',
      icon: <FileCheck className="w-3.5 h-3.5" />,
      badge: safeCounts.tickets
    },
    {
      id: 'quotes',
      label: language === 'sw' ? 'Nukuu' : 'Quotes',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      badge: safeCounts.quotes
    },
    {
      id: 'documents',
      label: language === 'sw' ? 'Nyaraka' : 'Documents',
      icon: <FolderOpen className="w-3.5 h-3.5" />,
      badge: safeCounts.documents
    },
    {
      id: 'saved',
      label: language === 'sw' ? 'Zilizohifadhiwa' : 'Saved',
      icon: <Heart className="w-3.5 h-3.5" />,
      badge: safeCounts.saved
    },
    {
      id: 'profile',
      label: language === 'sw' ? 'Wasifu' : 'Profile',
      icon: <User className="w-3.5 h-3.5" />
    },
    {
      id: 'notifications',
      label: language === 'sw' ? 'Taarifa' : 'Alerts',
      icon: <Bell className="w-3.5 h-3.5" />,
      badge: safeCounts.unreadNotifications,
      highlightBadge: safeCounts.unreadNotifications > 0
    },
    {
      id: 'settings',
      label: language === 'sw' ? 'Mipangilio' : 'Settings',
      icon: <Settings className="w-3.5 h-3.5" />
    }
  ];

  // Auto-scroll active item into view on small screens
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        const container = scrollRef.current;
        const scrollLeft = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [selectedTab]);

  return (
    <div className="lg:hidden w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 sticky top-16 z-20 py-2.5 shadow-xs">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
      >
        {tabs.map(tab => {
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-active={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[44px] flex-shrink-0 transition-all ${
                isActive
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    tab.highlightBadge
                      ? 'bg-rose-500 text-white'
                      : isActive
                      ? 'bg-slate-800 dark:bg-amber-400 text-amber-300 dark:text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
