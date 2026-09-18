import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Order, ServiceTicket, QuoteRequest, PaymentTransaction } from '../../types';
import { formatTSh, formatDate } from '../../utils/formatters';
import { AccountTabId } from './AccountSidebar';
import {
  Camera,
  ShoppingBag,
  Clock,
  CheckCircle2,
  FileCheck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Printer,
  Compass,
  Headphones,
  Edit3
} from 'lucide-react';

export interface AccountOverviewSectionProps {
  orders?: Order[];
  userOrders?: Order[];
  tickets?: ServiceTicket[];
  serviceTickets?: ServiceTicket[];
  userTickets?: ServiceTicket[];
  quotes?: QuoteRequest[];
  quoteRequests?: QuoteRequest[];
  userQuotes?: QuoteRequest[];
  payments?: PaymentTransaction[];
  userPayments?: PaymentTransaction[];
  savedCount?: number;
  savedProducts?: any[];
  userSavedProducts?: any[];
  documents?: any[];
  userDocuments?: any[];
  notifications?: any[];
  userNotifications?: any[];
  whatsappNumber?: string;
  onNavigateTab?: (tab: AccountTabId) => void;
  onTabChange?: (tab: AccountTabId) => void;
  onOpenPhotoModal?: () => void;
  onNavigatePath?: (path: string) => void;
  onSignOutClick?: () => void;
}

export const AccountOverviewSection: React.FC<AccountOverviewSectionProps> = ({
  orders,
  userOrders,
  tickets,
  serviceTickets,
  userTickets,
  quotes,
  quoteRequests,
  userQuotes,
  payments,
  userPayments,
  savedCount,
  savedProducts,
  userSavedProducts,
  documents,
  userDocuments,
  notifications,
  userNotifications,
  whatsappNumber = '0787754202',
  onNavigateTab: onNavigateTabProp,
  onTabChange,
  onOpenPhotoModal,
  onNavigatePath,
  onSignOutClick
}) => {
  const { currentUser, userProfile } = useAuth();
  const { language } = useTranslation();

  const effectiveOrders = orders || userOrders || [];
  const effectiveTickets = tickets || serviceTickets || userTickets || [];
  const effectiveQuotes = quotes || quoteRequests || userQuotes || [];
  const effectivePayments = payments || userPayments || [];
  const effectiveDocuments = documents || userDocuments || [];
  const effectiveSavedProducts = savedProducts || userSavedProducts || [];
  const effectiveNotifications = notifications || userNotifications || [];
  const effectiveSavedCount = savedCount !== undefined ? savedCount : effectiveSavedProducts.length;
  const onNavigateTab = onNavigateTabProp || onTabChange || (() => {});

  // Compute real metrics from loaded user data
  const totalOrders = effectiveOrders.length;

  const activeOrders = effectiveOrders.filter(o => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return s === 'submitted' || s === 'processing' || s === 'packed' || s === 'ready' || s === 'ready_for_pickup' || s === 'out for delivery' || s === 'out_for_delivery';
  }).length;

  const completedOrders = effectiveOrders.filter(o => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return s === 'completed' || s === 'delivered';
  }).length;

  const pendingTickets = effectiveTickets.filter(t => {
    const s = (t.status || '').toLowerCase();
    return s !== 'completed' && s !== 'cancelled';
  }).length;

  const activeQuotes = effectiveQuotes.filter(q => {
    const s = (q.status || '').toLowerCase();
    return s !== 'completed' && s !== 'rejected' && s !== 'cancelled';
  }).length;

  const pendingPayments = effectiveOrders.filter(o => {
    const ps = (o.paymentStatus || '').toLowerCase();
    return ps.includes('pending') || ps === 'unpaid';
  }).length;

  const recentOrders = effectiveOrders.slice(0, 3);
  const recentTickets = effectiveTickets.slice(0, 3);

  const formattedJoinDate = userProfile?.createdAt
    ? formatDate(userProfile.createdAt)
    : (currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Active Member');

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Interactive Avatar */}
            <div className="relative group flex-shrink-0">
              <button
                type="button"
                onClick={onOpenPhotoModal}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md overflow-hidden border-2 border-amber-400 hover:opacity-95 transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
                <div className="absolute inset-0 bg-slate-950/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-amber-400 mb-0.5" />
                  <span className="text-[9px] font-bold">
                    {language === 'sw' ? 'Badili' : 'Change'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenPhotoModal}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 rounded-full flex items-center justify-center shadow-md transition-colors border-2 border-white dark:border-slate-900"
                title={language === 'sw' ? 'Badili Picha ya Wasifu' : 'Change Profile Photo'}
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {userProfile?.fullName || 'TK Customer'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {language === 'sw' ? 'Akaunti Imethibitishwa' : 'Active Customer'}
                </span>
                {userProfile?.companyName && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    🏢 {userProfile.companyName}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser?.email}
                </span>
                {userProfile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {userProfile.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'sw' ? 'Mwanachama tangu:' : 'Member since:'} {formattedJoinDate}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => onNavigateTab('profile')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors min-h-[44px]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'sw' ? 'Hariri Wasifu' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Real Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalOrders}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            {language === 'sw' ? 'Jumla ya Oda' : 'Total Orders'}
          </div>
        </div>

        {/* Active Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {activeOrders}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            {language === 'sw' ? 'Oda Zinazoendelea' : 'Active Orders'}
          </div>
        </div>

        {/* Completed Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {completedOrders}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            {language === 'sw' ? 'Oda Zilizokamilika' : 'Completed Orders'}
          </div>
        </div>

        {/* Pending Services */}
        <div
          onClick={() => onNavigateTab('service-requests')}
          className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {pendingTickets}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            {language === 'sw' ? 'Tiketi za Huduma' : 'Active Tickets'}
          </div>
        </div>

        {/* Active Quotes */}
        <div
          onClick={() => onNavigateTab('quotes')}
          className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {activeQuotes}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            {language === 'sw' ? 'Nukuu za Software' : 'Tech Quotes'}
          </div>
        </div>

        {/* Pending Payments */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {pendingPayments}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            {language === 'sw' ? 'Inasubiri Malipo' : 'Pending Payment'}
          </div>
        </div>
      </div>

      {/* 3. Quick Action Hub */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          {language === 'sw' ? 'Huduma za Haraka (Quick Actions)' : 'Quick Actions'}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => onNavigatePath('/shop')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-200/80 dark:border-slate-700/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {language === 'sw' ? 'Duka la Vifaa' : 'Shop Supplies'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {language === 'sw' ? 'Nunua sasa' : 'Browse catalog'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigatePath('/track-order')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-200/80 dark:border-slate-700/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {language === 'sw' ? 'Fuatilia Oda' : 'Track Order'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {language === 'sw' ? 'Hali halisi' : 'Live status'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigatePath('/printing')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-200/80 dark:border-slate-700/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {language === 'sw' ? 'Tuma Chapisho' : 'Print Job'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {language === 'sw' ? 'Chapisha haraka' : 'High-speed'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigatePath('/online-services')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-200/80 dark:border-slate-700/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {language === 'sw' ? 'Huduma za Serikali' : 'Public Portals'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              NIDA, TRA, RITA
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigatePath('/digital-solutions')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-200/80 dark:border-slate-700/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {language === 'sw' ? 'Omba Nukuu' : 'Get Tech Quote'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {language === 'sw' ? 'Web, POS, Apps' : 'Custom Software'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigatePath('/contact')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-slate-200/80 dark:border-slate-700/80 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {language === 'sw' ? 'Msaada wa Wateja' : 'Customer Help'}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {language === 'sw' ? 'Mawasiliano' : 'Talk with us'}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Recent Activity Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>{language === 'sw' ? 'Oda za Hivi Karibuni' : 'Recent Orders'}</span>
            </h3>
            {orders.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>{language === 'sw' ? 'Tazama zote' : 'View all'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'sw' ? 'Bado hujaweka oda yoyote' : 'No orders placed yet'}
              </p>
              <button
                type="button"
                onClick={() => onNavigatePath('/shop')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                {language === 'sw' ? 'Nunua vifaa sasa →' : 'Browse stationery shop →'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => onNavigateTab('orders')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-amber-400 dark:hover:border-amber-500 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                        {order.id}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {order.orderStatus || order.status || 'Submitted'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {order.items.length} {language === 'sw' ? 'vitu' : 'items'} • {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                      {formatTSh(order.total || order.totalAmount || 0)}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      (order.paymentStatus || '').toLowerCase().includes('paid')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Service Tickets Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-500" />
              <span>{language === 'sw' ? 'Tiketi za Huduma za Hivi Karibuni' : 'Recent Service Tickets'}</span>
            </h3>
            {tickets.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigateTab('service-requests')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>{language === 'sw' ? 'Tazama zote' : 'View all'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {recentTickets.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'sw' ? 'Bado hujatuma maombi ya huduma' : 'No service tickets submitted'}
              </p>
              <button
                type="button"
                onClick={() => onNavigatePath('/printing')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                {language === 'sw' ? 'Tuma kazi ya chapisho sasa →' : 'Submit a print job →'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => onNavigateTab('service-requests')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-amber-400 dark:hover:border-amber-500 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {ticket.id}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {ticket.serviceType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 truncate font-medium">
                      {ticket.serviceTitle || ticket.description || 'Assistance Request'}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 block mb-1">
                      {ticket.status || 'Received'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
