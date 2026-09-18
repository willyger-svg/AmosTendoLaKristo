import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  MessageSquare,
  ArrowRight,
  Printer,
  Globe,
  FileText,
  Package,
  Layers,
  ShieldCheck,
  Bell,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { formatTSh } from '../../utils/formatters';
import { createWhatsAppUrl } from '../../utils/whatsapp';
import { notificationService } from '../../services/notifications/notificationService';
import { NotificationItem } from '../../types';
import { TKLogo } from '../common/TKLogo';
import { DesktopNavigation } from './DesktopNavigation';
import { Tooltip } from '../common/Tooltip';
import { HelpCircle } from 'lucide-react';

export interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const {
    navigateTo,
    cartCount,
    cartSubtotal,
    setIsCartDrawerOpen,
    searchQuery,
    setSearchQuery,
    openModal,
    products,
    printingServices,
    publicServices
  } = useApp();

  const { currentUser, userProfile, isStaff } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      return;
    }
    const unsubscribe = notificationService.listenToUserNotifications(currentUser.uid, (items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, [currentUser?.uid]);

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllNotifs = async () => {
    if (currentUser?.uid) {
      await notificationService.markAllAsRead(currentUser.uid);
    }
  };

  // Filter items matching search from live collections
  const filteredProducts = searchQuery.trim()
    ? (products || []).filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
      ).slice(0, 4)
    : [];

  const filteredServices = searchQuery.trim()
    ? [
        ...(printingServices || []).filter(s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        ...(publicServices || []).filter(s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.agencyName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ].slice(0, 4)
    : [];

  const hasResults = filteredProducts.length > 0 || filteredServices.length > 0;

  const handleSelectProduct = (slug: string) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    navigateTo(`/shop/product/${slug}`);
  };

  const handleSelectService = (item: any) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    if ('agencyName' in item) {
      navigateTo(`/online-services`);
    } else {
      navigateTo(`/printing`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Mobile Menu & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo & Wordmark */}
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="flex items-center gap-2.5 text-left group"
            >
              <TKLogo size="md" className="group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                    TK STATIONERY
                  </span>
                  <span className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                    Tendo La Kristo
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase mt-0.5">
                  Amos Stationery • Manzese (Bakhresa)
                </span>
              </div>
            </button>
          </div>

          {/* Center: Global Search Bar */}
          <div
            ref={searchContainerRef}
            className="hidden md:block flex-1 max-w-lg relative"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Tafuta vifaa vya shule/ofisi, huduma za chapisho, NIDA, TRA..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                {hasResults ? (
                  <div className="p-3 divide-y divide-slate-100">
                    {/* Matching Products */}
                    {filteredProducts.length > 0 && (
                      <div className="py-2">
                        <div className="flex items-center justify-between px-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Vifaa vya Duka ({filteredProducts.length})
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            BIDHAA
                          </span>
                        </div>
                        <div className="space-y-1">
                          {filteredProducts.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectProduct(p.slug)}
                              className="w-full flex items-center justify-between p-2 hover:bg-amber-50/70 rounded-lg text-left transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                                <div>
                                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                                    {p.name}
                                  </p>
                                  <span className="text-[10px] text-slate-500">
                                    {p.category}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-amber-700">
                                {formatTSh(p.price)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Services */}
                    {filteredServices.length > 0 && (
                      <div className="py-2">
                        <div className="flex items-center justify-between px-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Huduma & Msaada
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                            HUDUMA
                          </span>
                        </div>
                        <div className="space-y-1">
                          {filteredServices.map((s: any, idx) => (
                            <button
                              key={s.id || idx}
                              type="button"
                              onClick={() => handleSelectService(s)}
                              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-left transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {'agencyName' in s ? (
                                  <FileText className="w-4 h-4 text-emerald-600" />
                                ) : 'categoryTag' in s ? (
                                  <Globe className="w-4 h-4 text-sky-600" />
                                ) : (
                                  <Printer className="w-4 h-4 text-amber-600" />
                                )}
                                <div>
                                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                                    {s.title}
                                  </p>
                                  <span className="text-[10px] text-slate-500">
                                    {'agencyName' in s
                                      ? s.agencyName
                                      : 'categoryTag' in s
                                      ? s.categoryTag
                                      : s.category}
                                  </span>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Hakuna matokeo yaliyopatikana kwa "{searchQuery}". Jaribu kutafuta{' '}
                    <span className="font-semibold text-slate-700">Karatasi, Kalamu, NIDA, TRA</span>, au{' '}
                    <span className="font-semibold text-slate-700">Printing</span>.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions (Quick Help, WhatsApp, Notifications, Account, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Help Modal Trigger */}
            <button
              type="button"
              onClick={() => openModal({ type: 'quick-help' })}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Unahitaji Nini?</span>
            </button>

            {/* Direct WhatsApp CTA */}
            <Tooltip content="Wasiliana na huduma kwa wateja moja kwa moja kupitia WhatsApp">
              <a
                href={createWhatsAppUrl('Habari TK Stationery! Nahitaji msaada.')}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp TK</span>
              </a>
            </Tooltip>

            {/* Admin shortcut if staff */}
            {isStaff && (
              <Tooltip content="Open Operations & Staff Dashboard">
                <button
                  type="button"
                  onClick={() => navigateTo('/admin')}
                  className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all border border-slate-300 active:scale-[0.98]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </button>
              </Tooltip>
            )}

            {/* Notifications Dropdown Bell */}
            {(currentUser || userProfile) && (
              <div ref={notifRef} className="relative">
                <Tooltip content="View notifications">
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors relative active:scale-[0.98]"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </Tooltip>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
                      <span className="text-xs font-bold text-slate-900">Notifications ({notifications.length})</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllNotifs}
                          className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          You're all caught up.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl text-left transition-colors ${
                              n.status !== 'read' ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</p>
                            <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotifOpen(false);
                          navigateTo('/account');
                        }}
                        className="text-xs font-bold text-slate-800 hover:text-amber-600 block w-full py-1"
                      >
                        Tazama Zote Kwenye Akaunti →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Language Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-black shadow-2xs">
                SW
              </span>
            </div>

            {/* Account Link / Sign In Trigger */}
            <Tooltip content={currentUser || userProfile ? (isStaff || userProfile?.role === 'super_admin' || userProfile?.role === 'admin' ? `Akaunti ya Msimamizi: ${userProfile?.fullName || 'Msimamizi'}` : `Akaunti ya Mteja: ${userProfile?.fullName || currentUser?.email}`) : 'Akaunti Yangu / Ingia'}>
              <button
                type="button"
                onClick={() => navigateTo('/account')}
                className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2 active:scale-[0.98]"
                aria-label={currentUser ? (isStaff ? 'Jopo la Usimamizi' : 'Akaunti Yangu') : 'Ingia'}
              >
                {userProfile?.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.fullName || 'Picha ya Wasifu'}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400/80 shadow-2xs"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="hidden lg:inline text-xs font-medium text-slate-700 max-w-[120px] truncate">
                  {currentUser || userProfile ? (userProfile?.fullName ? userProfile.fullName.split(' ')[0] : (isStaff ? 'Msimamizi' : 'Akaunti')) : 'Ingia'}
                </span>
              </button>
            </Tooltip>

            {/* Shopping Cart Drawer Trigger */}
            <Tooltip content="Tazama kikapu chako cha manunuzi">
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-xs active:scale-[0.98]"
                aria-label={`Kikapu chenye bidhaa ${cartCount}`}
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-xs font-bold">
                  {cartSubtotal > 0 ? formatTSh(cartSubtotal) : 'Kikapu'}
                </span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tafuta vifaa, uchapaji, NIDA, TRA..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 text-xs text-slate-900 rounded-lg border border-transparent focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Desktop Main Navigation Bar */}
      <DesktopNavigation />
    </header>
  );
};

