import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { auditLogService } from '../../services/audit/auditLogService';
import { AdminAuditLog } from '../../types';
import { formatPrice, formatTimeAgo, formatDate } from '../../utils/formatters';
import { canAccessSection, ADMIN_ROLE_CONFIGS } from '../../utils/adminPermissions';
import {
  ShoppingBag,
  CreditCard,
  Package,
  Boxes,
  FileCheck,
  Globe,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  History,
  Store,
  ExternalLink,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const { orders, products, serviceTickets, quoteRequests, navigateTo, isLoadingData, refreshData } = useApp();
  const { userProfile, userRole } = useAuth();

  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentAudit = async () => {
      setLoadingLogs(true);
      try {
        const logs = await auditLogService.getAuditLogs({ limitCount: 8 });
        setAuditLogs(logs);
      } catch (err) {
        console.warn('Failed to fetch overview audit logs:', err);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchRecentAudit();
  }, []);

  // Compute Real Metrics
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Submitted' || o.status === 'Processing');
  const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'completed' || o.status === 'delivered');
  const grossRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

  const pendingPayments = orders.filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'failed');
  const activeTickets = serviceTickets.filter(t => t.status === 'Received' || t.status === 'In Progress');
  const pendingQuotes = quoteRequests.filter(q => q.status === 'Received' || q.status === 'New');

  const lowStockProducts = products.filter(p => p.stockCount <= 5);
  const outOfStockProducts = products.filter(p => p.stockCount === 0);

  // Derive unique customers from orders
  const customerPhones = new Set(orders.map(o => o.customerPhone).filter(Boolean));
  const uniqueCustomerCount = customerPhones.size;

  const roleConfig = ADMIN_ROLE_CONFIGS[userRole] || ADMIN_ROLE_CONFIGS.customer;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0F2942] to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-black ${roleConfig.badgeClass}`}>
                {roleConfig.labelSw || roleConfig.labelEn}
              </span>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Kituo cha Amri (Muda Halisi)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {`Habari, ${userProfile?.fullName?.split(' ')[0] || 'Msimamizi'}`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Muhtasari wa wakati halisi wa mauzo, maombi ya wateja, malipo na hesabu za duka la TK Stationery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('/admin/orders')}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shughulikia Oda Zilizopo</span>
              {pendingOrders.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-black">
                  {pendingOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigateTo('/admin/payments')}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Hakiki Malipo</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative Background Graphic */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Core Real-Time Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Orders */}
        <div
          onClick={() => navigateTo('/admin/orders')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Jumla ya Oda
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalOrdersCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedOrders.length} Zimekamilika</span>
              <span>•</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">{pendingOrders.length} Zinazosubiri</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Revenue Completed */}
        <div
          onClick={() => navigateTo('/admin/orders')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mapato ya Oda Zilizokamilika
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(grossRevenue)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kutoka oda zilizothibitishwa
            </p>
          </div>
        </div>

        {/* Metric 3: Active Service Tickets */}
        <div
          onClick={() => navigateTo('/admin/service-requests')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tiketi za Huduma
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{activeTickets.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Jumla ya tiketi {serviceTickets.length} zimewasilishwa
            </p>
          </div>
        </div>

        {/* Metric 4: Low Stock Inventory Alert */}
        <div
          onClick={() => navigateTo('/admin/inventory')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Uhaba wa Stoo
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              lowStockProducts.length > 0
                ? 'bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
            }`}>
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{lowStockProducts.length}</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
              {outOfStockProducts.length > 0 ? `Bidhaa ${outOfStockProducts.length} zimeisha kabisa` : 'Zinahitaji kuongezwa stoo'}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Jumla ya Bidhaa</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">Bidhaa {products.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Maombi ya Bei</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">Maombi {pendingQuotes.length} yanaendelea</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Malipo Yanayosubiri</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">Miamala {pendingPayments.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Wateja Waliojisajili</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">Wateja {uniqueCustomerCount} wa kipekee</p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Left (Recent Orders Queue), Right (Audit Trail & Low Stock) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Oda za Hivi Karibuni
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mlolongo wa oda zilizowasilishwa mtandaoni
              </p>
            </div>
            <button
              onClick={() => navigateTo('/admin/orders')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Tazama Zote</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {orders.slice(0, 6).map(order => {
              const statusLabel =
                order.status === 'Completed'
                  ? 'Imekamilika'
                  : order.status === 'Processing'
                  ? 'Inashughulikiwa'
                  : order.status === 'Cancelled'
                  ? 'Imeghairiwa'
                  : 'Imewasilishwa';

              return (
                <div
                  key={order.id}
                  onClick={() => navigateTo('/admin/orders')}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {order.customerName}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400">#{order.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        Bidhaa {order.items.length} • {order.customerPhone} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                        order.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : order.status === 'Processing'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Low Stock Alerts & Recent Audit Activity */}
        <div className="space-y-6">
          {/* Low Stock Watchlist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-rose-500" />
                <span>Uhaba wa Stoo</span>
              </h3>
              <button
                onClick={() => navigateTo('/admin/inventory')}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Kagua Stoo
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 space-y-2">
              {lowStockProducts.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                  <span>Bidhaa zote {products.length} zipo kwa kiwango cha kuridhisha.</span>
                </div>
              ) : (
                lowStockProducts.slice(0, 4).map(product => (
                  <div
                    key={product.id}
                    onClick={() => navigateTo('/admin/inventory')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {product.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {product.category}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-black flex-shrink-0 ${
                        product.stockCount === 0
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {product.stockCount === 0 ? 'Imeisha' : `Baki ${product.stockCount}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Audit Stream */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-500" />
                <span>Kumbukumbu za Usalama (Audit)</span>
              </h3>
              {canAccessSection(userRole, 'audit-logs') && (
                <button
                  onClick={() => navigateTo('/admin/audit-logs')}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Fungua Zote
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 space-y-2.5">
              {loadingLogs ? (
                <div className="py-6 text-center text-xs text-slate-400">Inapakia kumbukumbu...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <ShieldCheck className="w-5 h-5 mx-auto text-slate-300 dark:text-slate-700 mb-1" />
                  <span>Hakuna mabadiliko ya kiutawala yaliyorekodiwa bado.</span>
                </div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="text-xs space-y-0.5 border-b border-slate-100 dark:border-slate-800/60 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 capitalize truncate max-w-[140px]">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatTimeAgo(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Na <span className="font-semibold text-slate-700 dark:text-slate-300">{log.actorName || log.actorRole}</span> • lengwa: {log.targetType} #{log.targetId.slice(-6)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
