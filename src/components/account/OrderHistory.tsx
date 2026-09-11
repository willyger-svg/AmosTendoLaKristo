import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orders/orderService';
import { formatTSh, formatDate, formatTimeAgo } from '../../utils/formatters';
import { getOrderWhatsAppUrl } from '../../utils/whatsapp';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  X,
  Send,
  Printer,
  Eye,
  MapPin,
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export interface OrderHistoryProps {
  initialOrders?: Order[];
  whatsappNumber?: string;
  showToast?: (toast: { type: 'success' | 'error' | 'info' | 'warning'; message: string }) => void;
  onNavigatePath?: (path: string) => void;
  className?: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  initialOrders,
  whatsappNumber = '0787754202',
  showToast,
  onNavigatePath,
  className = ''
}) => {
  const { currentUser, userProfile } = useAuth();
  const { language } = useTranslation();

  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialOrders || initialOrders.length === 0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Payment Proof Modal State
  const [paymentProofOrder, setPaymentProofOrder] = useState<Order | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState<string>('');
  const [paymentNotesInput, setPaymentNotesInput] = useState<string>('');
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);

  // Fetch and sync orders directly from Firestore
  useEffect(() => {
    if (!currentUser?.uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Set up real-time listener from Firestore
    const unsubscribe = orderService.listenToUserOrders(currentUser.uid, (fetchedOrders) => {
      setOrders(fetchedOrders);
      setLastSyncedAt(new Date());
      setIsLoading(false);
      setIsRefreshing(false);
    });

    // Also run immediate fetch as fallback
    orderService.getUserOrders(currentUser.uid).then((fallbackOrders) => {
      if (fallbackOrders.length > 0) {
        setOrders(fallbackOrders);
        setLastSyncedAt(new Date());
      }
      setIsLoading(false);
    }).catch(err => {
      console.warn('Direct orders fetch notice:', err);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  // Handle manual refresh
  const handleManualRefresh = async () => {
    if (!currentUser?.uid) return;
    setIsRefreshing(true);
    try {
      const fetched = await orderService.getUserOrders(currentUser.uid);
      setOrders(fetched);
      setLastSyncedAt(new Date());
      if (showToast) {
        showToast({
          type: 'success',
          message: language === 'sw' ? 'Oda zimesasishwa kutoka Firestore.' : 'Orders refreshed from Firestore.'
        });
      }
    } catch (err: any) {
      console.error('Error refreshing orders:', err);
      if (showToast) {
        showToast({
          type: 'error',
          message: language === 'sw' ? 'Imeshindikana kusasisha oda.' : 'Could not refresh orders.'
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Copy order ID helper
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (showToast) {
      showToast({
        type: 'info',
        message: language === 'sw' ? `Namba ya oda ${id} imenakiliwa.` : `Order ID ${id} copied to clipboard.`
      });
    }
  };

  // Submit payment reference to Firestore
  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentProofOrder || !paymentRefInput.trim()) return;

    setIsSubmittingProof(true);
    try {
      await orderService.submitPaymentProof(
        paymentProofOrder.id,
        paymentRefInput.trim(),
        paymentNotesInput.trim()
      );

      // Update local state immediately
      setOrders(prev =>
        prev.map(o =>
          o.id === paymentProofOrder.id
            ? { ...o, paymentReference: paymentRefInput.trim(), notes: paymentNotesInput.trim() || o.notes }
            : o
        )
      );

      if (showToast) {
        showToast({
          type: 'success',
          message: language === 'sw'
            ? 'Uthibitisho wa malipo umewasilishwa. Uthibitishaji unaendelea.'
            : 'Payment reference submitted successfully. Verification in progress.'
        });
      }

      setPaymentProofOrder(null);
      setPaymentRefInput('');
      setPaymentNotesInput('');
    } catch (err: any) {
      console.error('Error submitting payment proof:', err);
      if (showToast) {
        showToast({
          type: 'error',
          message: err.message || (language === 'sw' ? 'Imeshindikana kuwasilisha malipo.' : 'Failed to submit payment reference.')
        });
      }
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Status Filter
      const rawStatus = (order.orderStatus || order.status || 'submitted').toLowerCase();
      if (statusFilter === 'active') {
        const isNotActive = rawStatus === 'completed' || rawStatus === 'delivered' || rawStatus === 'cancelled';
        if (isNotActive) return false;
      } else if (statusFilter === 'completed') {
        const isCompleted = rawStatus === 'completed' || rawStatus === 'delivered';
        if (!isCompleted) return false;
      } else if (statusFilter === 'cancelled') {
        if (rawStatus !== 'cancelled') return false;
      }

      // 2. Search Query (order ID, item names, notes, payment reference)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const idMatch = (order.id || '').toLowerCase().includes(query);
        const refMatch = (order.paymentReference || '').toLowerCase().includes(query);
        const itemMatch = (order.items || []).some(item =>
          (item.productName || item.productId || '').toLowerCase().includes(query)
        );
        const notesMatch = (order.notes || '').toLowerCase().includes(query);

        if (!idMatch && !refMatch && !itemMatch && !notesMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Get status pill styling & icon
  const getStatusBadge = (status?: string) => {
    const s = (status || 'submitted').toLowerCase();
    switch (s) {
      case 'completed':
      case 'delivered':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: CheckCircle2,
          label: language === 'sw' ? 'Imekamilika' : 'Completed'
        };
      case 'processing':
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          icon: RefreshCw,
          label: language === 'sw' ? 'Inaandaliwa' : 'Processing'
        };
      case 'packed':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          icon: Package,
          label: language === 'sw' ? 'Imefungashwa' : 'Packed'
        };
      case 'ready':
      case 'ready_for_pickup':
        return {
          bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          icon: Package,
          label: language === 'sw' ? 'Tayari Kuchukuliwa' : 'Ready for Pickup'
        };
      case 'out for delivery':
      case 'out_for_delivery':
        return {
          bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          icon: Truck,
          label: language === 'sw' ? 'Inasafirishwa' : 'Out for Delivery'
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: AlertCircle,
          label: language === 'sw' ? 'Imeghairiwa' : 'Cancelled'
        };
      case 'submitted':
      default:
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: Clock,
          label: language === 'sw' ? 'Imewasilishwa' : 'Submitted'
        };
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header & Live Sync Status Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'sw' ? 'Historia ya Oda' : 'Order History'}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {orders.length}
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {language === 'sw' ? 'Muunganisho wa moja kwa moja wa Firestore' : 'Live Firestore Sync'}
              </span>
              <span>•</span>
              <span>{formatTimeAgo(lastSyncedAt.toISOString())}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all disabled:opacity-50 min-h-[38px]"
            title={language === 'sw' ? 'Sasisha orodha' : 'Refresh list'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span>{isRefreshing ? (language === 'sw' ? 'Inapakua...' : 'Syncing...') : (language === 'sw' ? 'Sasisha' : 'Refresh')}</span>
          </button>

          {onNavigatePath && (
            <button
              type="button"
              onClick={() => onNavigatePath('/shop')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-bold transition-all min-h-[38px] shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{language === 'sw' ? 'Agiza Vifaa Vipya' : 'Shop Items'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Controls: Search Bar & Status Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'sw' ? 'Tafuta kwa namba ya oda (TK-ORD), bidhaa...' : 'Search by order ID (TK-ORD), product...'}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'active', 'completed', 'cancelled'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors min-h-[36px] ${
                  statusFilter === tab
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab === 'all'
                  ? (language === 'sw' ? 'Oda Zote' : 'All Orders')
                  : tab === 'active'
                  ? (language === 'sw' ? 'Zinazoendelea' : 'Active')
                  : tab === 'completed'
                  ? (language === 'sw' ? 'Zilizokamilika' : 'Completed')
                  : (language === 'sw' ? 'Zilizoghairiwa' : 'Cancelled')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Orders Content Area */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-amber-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {language === 'sw' ? 'Inapakua historia ya oda kutoka Firestore...' : 'Fetching your order history from Firestore...'}
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 sm:p-14 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {orders.length === 0
                ? (language === 'sw' ? 'Hakuna Oda Zilizopatikana' : 'No Order History Yet')
                : (language === 'sw' ? 'Hakuna Oda Inayolingana' : 'No Matching Orders')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {orders.length === 0
                ? (language === 'sw'
                    ? 'Bado hujaweka oda yoyote ya vifaa vya ofisi, vitabu au karatasi kwenye mfumo wetu.'
                    : 'You have not placed any orders yet. Visit our shop to purchase stationery, reams, and office supplies.')
                : (language === 'sw'
                    ? 'Hakuna oda inayolingana na maneno au kigezo cha utafutaji ulichochagua.'
                    : 'No orders match your filter criteria or search keyword.')}
            </p>
          </div>

          {orders.length === 0 && onNavigatePath && (
            <button
              type="button"
              onClick={() => onNavigatePath('/shop')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-bold transition-all min-h-[44px] shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{language === 'sw' ? 'Anza Kununua Vifaa Dukan' : 'Browse Stationery Store'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusConfig = getStatusBadge(order.orderStatus || order.status);
            const StatusIcon = statusConfig.icon;
            const isPaid = (order.paymentStatus || '').toLowerCase().includes('paid');
            const isCashOnDelivery = (order.paymentMethod || '').toLowerCase().includes('cash');
            const hasPaymentRef = Boolean(order.paymentReference);
            const itemsCount = (order.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                {/* 1. Card Top Row: Order ID, Date, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {order.id}
                      </span>
                      <button
                        type="button"
                        onClick={e => handleCopyId(order.id, e)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                        title={language === 'sw' ? 'Nakili namba ya oda' : 'Copy order ID'}
                      >
                        {copiedId === order.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Payment Status Tag */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                          isPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isPaid
                          ? (language === 'sw' ? 'Imelipwa' : 'Paid')
                          : (language === 'sw' ? 'Inasubiri Malipo' : 'Unpaid')}
                      </span>
                    </div>

                    {/* Order Date & Relative Time */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(order.createdAt)}</span>
                      <span>•</span>
                      <span className="text-[11px]">{formatTimeAgo(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Order Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${statusConfig.bg}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Items Preview Grid */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'sw' ? `Vitu Vilivyoagizwa (${itemsCount})` : `Order Items (${itemsCount})`}
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {(order.items || []).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {item.productName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {formatTSh(item.unitPrice)} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-slate-900 dark:text-white">
                            {formatTSh(item.totalPrice || item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {order.items && order.items.length > 3 && (
                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          {language === 'sw'
                            ? `+ Vitu vingine ${order.items.length - 3}... Tazama vyote`
                            : `+ ${order.items.length - 3} more items... View all`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Total & Fulfillment Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate max-w-xs">
                      {order.deliveryMethod === 'Store Pickup'
                        ? (language === 'sw' ? 'Kuchukua Dukan (Mwenge / Shekilango)' : 'Store Pickup (Mwenge / Shekilango)')
                        : (order.deliveryAddress || order.deliveryDistrict || 'Dar es Salaam Delivery')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                        {language === 'sw' ? 'Jumla Kuu' : 'Total Amount'}
                      </span>
                      <span className="font-black text-base text-slate-900 dark:text-white">
                        {formatTSh(order.total || order.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    {/* View Details Modal Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors min-h-[36px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Maelezo Kamili' : 'Order Details'}</span>
                    </button>

                    {/* WhatsApp Inquire */}
                    <a
                      href={getOrderWhatsAppUrl(
                        order.id,
                        order.total || order.totalAmount || 0,
                        order.customerName,
                        itemsCount,
                        order.paymentMethod,
                        whatsappNumber
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors min-h-[36px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Ulizia WhatsApp' : 'WhatsApp Support'}</span>
                    </a>
                  </div>

                  {/* Payment Reference Button or Paid Indicator */}
                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentProofOrder(order);
                        setPaymentRefInput(order.paymentReference || '');
                        setPaymentNotesInput(order.notes || '');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors min-h-[36px] shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>
                        {hasPaymentRef
                          ? (language === 'sw' ? 'Badili Namba ya Muamala' : 'Update Payment Ref')
                          : (language === 'sw' ? 'Wasilisha Malipo ya Simu' : 'Submit Payment Ref')}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Full Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  {language === 'sw' ? 'Risiti ya Oda' : 'Order Receipt'}
                </span>
                <h3 className="text-lg font-black font-mono mt-0.5">{selectedOrder.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Order Status & Date Information */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{language === 'sw' ? 'Hali ya Oda' : 'Order Status'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {getStatusBadge(selectedOrder.orderStatus || selectedOrder.status).label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{language === 'sw' ? 'Tarehe ya Kuagiza' : 'Order Date'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{language === 'sw' ? 'Hali ya Malipo' : 'Payment Status'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.paymentStatus || 'Pending'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{language === 'sw' ? 'Njia ya Malipo' : 'Payment Method'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.paymentMethod || 'Cash'}</span>
                </div>
                {selectedOrder.paymentReference && (
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                    <span className="text-slate-500 dark:text-slate-400">{language === 'sw' ? 'Kumbukumbu ya Malipo' : 'Payment Reference'}</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{selectedOrder.paymentReference}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {language === 'sw' ? 'Orodha ya Vitu' : 'Order Items'}
                </h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">{formatTSh(item.unitPrice)} × {item.quantity}</p>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatTSh(item.totalPrice || item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{language === 'sw' ? 'Jumla ya Vitu' : 'Subtotal'}</span>
                  <span>{formatTSh(selectedOrder.subtotal || selectedOrder.total || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{language === 'sw' ? 'Gharama ya Usafirishaji' : 'Delivery Fee'}</span>
                  <span>{formatTSh(selectedOrder.deliveryFee || 0)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>{language === 'sw' ? 'Jumla Kuu' : 'Grand Total'}</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {formatTSh(selectedOrder.total || selectedOrder.totalAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-4 text-xs space-y-1.5">
                <span className="font-bold text-amber-900 dark:text-amber-300 block">
                  {language === 'sw' ? 'Mbinu ya Kupokea' : 'Fulfillment Details'}
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>{selectedOrder.deliveryMethod || 'Store Pickup'}:</strong>{' '}
                  {selectedOrder.deliveryAddress || selectedOrder.deliveryDistrict || 'Duka Kuu — Shekilango / Mwenge, Dar es Salaam'}
                </p>
                {selectedOrder.notes && (
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] pt-1">
                    <em>"{selectedOrder.notes}"</em>
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'sw' ? 'Chapisha Risiti' : 'Print'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                {language === 'sw' ? 'Funga' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Submit Payment Reference Modal */}
      {paymentProofOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 sm:p-6 bg-amber-500 text-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5 font-bold">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-black text-base">
                  {language === 'sw' ? 'Wasilisha Malipo ya Simu' : 'Submit Payment Reference'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentProofOrder(null)}
                className="p-1 rounded-lg hover:bg-amber-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPaymentProof} className="p-5 sm:p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{language === 'sw' ? 'Namba ya Oda' : 'Order ID'}:</span>
                  <span className="font-mono font-bold">{paymentProofOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{language === 'sw' ? 'Kiasi Kinacholipwa' : 'Amount Due'}:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">
                    {formatTSh(paymentProofOrder.total || paymentProofOrder.totalAmount || 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  {language === 'sw' ? 'Namba ya Muamala (M-Pesa / Tigo Pesa / Airtel)' : 'Transaction Reference Code'} *
                </label>
                <input
                  type="text"
                  required
                  value={paymentRefInput}
                  onChange={e => setPaymentRefInput(e.target.value)}
                  placeholder="Mf. 9K284LM901 au MPESA-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  {language === 'sw' ? 'Maelezo ya Ziada (Hiari)' : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={paymentNotesInput}
                  onChange={e => setPaymentNotesInput(e.target.value)}
                  placeholder={language === 'sw' ? 'Jina la mtumaji wa pesa au maelekezo...' : 'Sender mobile number or payer name...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentProofOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProof || !paymentRefInput.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingProof ? (language === 'sw' ? 'Inawasilisha...' : 'Submitting...') : (language === 'sw' ? 'Thibitisha Malipo' : 'Submit Proof')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
