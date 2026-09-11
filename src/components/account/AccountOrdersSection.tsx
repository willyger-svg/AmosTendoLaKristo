import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { Order, OrderStatus } from '../../types';
import { formatTSh, formatDate } from '../../utils/formatters';
import { getOrderWhatsAppUrl } from '../../utils/whatsapp';
import { orderService } from '../../services/orders/orderService';
import {
  ShoppingBag,
  Search,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  CreditCard,
  X,
  FileText,
  Send,
  Loader2
} from 'lucide-react';

interface AccountOrdersSectionProps {
  orders: Order[];
  whatsappNumber: string;
  onRefresh: () => void;
  onNavigateShop: () => void;
  showToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message: string }) => void;
}

export const AccountOrdersSection: React.FC<AccountOrdersSectionProps> = ({
  orders,
  whatsappNumber,
  onRefresh,
  onNavigateShop,
  showToast
}) => {
  const { language } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Full Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Submit Payment Proof Modal state
  const [paymentProofOrder, setPaymentProofOrder] = useState<Order | null>(null);
  const [paymentProvider, setPaymentProvider] = useState('M-Pesa');
  const [paymentRefNumber, setPaymentRefNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // Filtering
  const filteredOrders = orders.filter(order => {
    const s = (order.orderStatus || order.status || '').toLowerCase();
    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (s === 'submitted' || s === 'processing' || s === 'packed' || s === 'ready' || s === 'ready_for_pickup' || s === 'out for delivery' || s === 'out_for_delivery')) ||
      (statusFilter === 'completed' && (s === 'completed' || s === 'delivered')) ||
      (statusFilter === 'cancelled' && s === 'cancelled');

    const matchesSearch =
      !searchQuery.trim() ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(it => it.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentProofOrder) return;
    if (!paymentRefNumber.trim()) {
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Weka Namba ya Muamala' : 'Reference Required',
        message: language === 'sw' ? 'Tafadhali weka namba halisi ya muamala wa malipo.' : 'Please enter the transaction reference code.'
      });
      return;
    }

    setIsSubmittingProof(true);
    try {
      const fullReference = `${paymentProvider}: ${paymentRefNumber.trim()}`;
      await orderService.submitPaymentProof(paymentProofOrder.id, fullReference, paymentNotes);
      showToast({
        type: 'success',
        title: language === 'sw' ? 'Uthibitisho Umewasilishwa' : 'Payment Proof Submitted',
        message: language === 'sw'
          ? 'Namba ya muamala imewasilishwa kwa wasimamizi wetu kuhakiki.'
          : 'Transaction reference submitted for staff verification.'
      });
      setPaymentProofOrder(null);
      setPaymentRefNumber('');
      setPaymentNotes('');
      onRefresh();
    } catch (err: any) {
      console.warn('Payment proof submission error:', err);
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Hitilafu ya Kuwasilisha' : 'Submission Failed',
        message: err.message || 'Could not submit payment reference. Please try again.'
      });
    } finally {
      setIsSubmittingProof(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search & Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'sw' ? 'Tafuta oda kwa namba au bidhaa...' : 'Search by order ID or product name...'}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
            {(['all', 'active', 'completed', 'cancelled'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors min-h-[36px] ${
                  statusFilter === f
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f === 'all'
                  ? (language === 'sw' ? 'Zote' : 'All')
                  : f === 'active'
                  ? (language === 'sw' ? 'Zinazoendelea' : 'Active')
                  : f === 'completed'
                  ? (language === 'sw' ? 'Zilizokamilika' : 'Completed')
                  : (language === 'sw' ? 'Zilizoghairiwa' : 'Cancelled')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'sw' ? 'Hakuna Oda Zilizopatikana' : 'No orders found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {orders.length === 0
                ? (language === 'sw'
                    ? 'Bado hujaweka oda yoyote ya vifaa vya ofisi au shule.'
                    : 'You have not placed any orders yet. Visit our shop to get started.')
                : (language === 'sw'
                    ? 'Hakuna oda inayolingana na kigezo cha utafutaji.'
                    : 'No orders match your current filter or search term.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateShop}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-bold transition-all min-h-[44px]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{language === 'sw' ? 'Tembelea Duka la Vifaa' : 'Browse Stationery Shop'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isPaid = (order.paymentStatus || '').toLowerCase().includes('paid');
            const statusLabel = order.orderStatus || order.status || 'Submitted';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Card Header: Order ID, Date, Badges */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        {order.id}
                      </span>
                      {/* Order Status Badge */}
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {statusLabel}
                      </span>
                      {/* Payment Status Badge */}
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isPaid ? (language === 'sw' ? 'IMELIPWA' : 'PAID') : (order.paymentStatus || 'PAYMENT PENDING')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">
                      {formatTSh(order.total || order.totalAmount || 0)}
                    </span>
                  </div>
                </div>

                {/* Items preview row */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover bg-white"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                          TK
                        </div>
                      )}
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[140px] truncate">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {item.quantity} × {formatTSh(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {order.items.length > 4 && (
                    <div className="flex items-center justify-center px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 flex-shrink-0">
                      +{order.items.length - 4} {language === 'sw' ? 'zaidi' : 'more'}
                    </div>
                  )}
                </div>

                {/* Logistics & Payment info snippet */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.deliveryMethod || 'Dar es Salaam Delivery'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.paymentMethod || 'Manual Payment'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.items.length} {language === 'sw' ? 'Aina ya Vifaa' : 'Items'}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View Details Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Tazama Maelezo' : 'View Order Details'}</span>
                    </button>

                    {/* Submit Payment Proof if unpaid */}
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => setPaymentProofOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{language === 'sw' ? 'Tuma Namba ya Muamala' : 'Submit Payment Proof'}</span>
                      </button>
                    )}
                  </div>

                  {/* WhatsApp Receipt Quick Action */}
                  <a
                    href={getOrderWhatsAppUrl(
                      order.id,
                      order.total || order.totalAmount || 0,
                      order.customerName,
                      order.items.length,
                      order.paymentMethod,
                      whatsappNumber
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Receipt</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-black text-base text-slate-900 dark:text-white">
                    {selectedOrder.id}
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedOrder.orderStatus || selectedOrder.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Items Breakdown Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  {language === 'sw' ? 'Orodha ya Vifaa Vilivyoagizwa' : 'Ordered Items'}
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.productName} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            TK
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.productName}</p>
                          <p className="text-[11px] text-slate-500">{item.quantity} × {formatTSh(item.unitPrice)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{formatTSh(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-200/70 dark:border-slate-700/60">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{language === 'sw' ? 'Jumla ya Vifaa (Subtotal):' : 'Subtotal:'}</span>
                  <span>{formatTSh(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{language === 'sw' ? 'Gharama ya Usafirishaji:' : 'Delivery Fee:'}</span>
                  <span>{formatTSh(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>{language === 'sw' ? 'Jumla Kamili:' : 'Total Amount:'}</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {formatTSh(selectedOrder.total || selectedOrder.totalAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Delivery & Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                  <h5 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase">
                    {language === 'sw' ? 'Taarifa za Usafirishaji' : 'Delivery Details'}
                  </h5>
                  <p><span className="text-slate-400">Method:</span> {selectedOrder.deliveryMethod}</p>
                  {selectedOrder.deliveryDistrict && (
                    <p><span className="text-slate-400">District:</span> {selectedOrder.deliveryDistrict}</p>
                  )}
                  {selectedOrder.deliveryAddress && (
                    <p><span className="text-slate-400">Address:</span> {selectedOrder.deliveryAddress}</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                  <h5 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase">
                    {language === 'sw' ? 'Taarifa za Malipo' : 'Payment Details'}
                  </h5>
                  <p><span className="text-slate-400">Method:</span> {selectedOrder.paymentMethod}</p>
                  <p><span className="text-slate-400">Status:</span> {selectedOrder.paymentStatus}</p>
                  {(selectedOrder as any).paymentReference && (
                    <p><span className="text-slate-400">Ref Code:</span> {(selectedOrder as any).paymentReference}</p>
                  )}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300 italic border border-amber-200/50 dark:border-amber-800/50">
                  <span className="font-bold not-italic text-[10px] uppercase block mb-0.5">Notes:</span>
                  "{selectedOrder.notes}"
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <a
                href={getOrderWhatsAppUrl(
                  selectedOrder.id,
                  selectedOrder.total || selectedOrder.totalAmount || 0,
                  selectedOrder.customerName,
                  selectedOrder.items.length,
                  selectedOrder.paymentMethod,
                  whatsappNumber
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors min-h-[44px]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Receipt</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs min-h-[44px]"
              >
                {language === 'sw' ? 'Funga' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBMIT PAYMENT PROOF MODAL */}
      {paymentProofOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitProof}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'sw' ? 'Wasilisha Uthibitisho wa Malipo' : 'Submit Payment Reference'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Order Ref: {paymentProofOrder.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPaymentProofOrder(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold">
                  {language === 'sw' ? 'Kiasi cha Kulipa:' : 'Amount to Pay:'}{' '}
                  <span className="font-mono text-sm">{formatTSh(paymentProofOrder.total || paymentProofOrder.totalAmount || 0)}</span>
                </p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  {language === 'sw'
                    ? 'Lipa kupitia M-Pesa, Tigo Pesa, au Benki kwa namba: ' + whatsappNumber
                    : 'Pay via Mobile Money or Bank to TK Stationery. Enter your transaction code below.'}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'sw' ? 'Mtandao / Benki ya Malipo' : 'Payment Provider'}
                </label>
                <select
                  value={paymentProvider}
                  onChange={e => setPaymentProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="M-Pesa">Vodacom M-Pesa</option>
                  <option value="Tigo Pesa">Tigo Pesa</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Halopesa">Halopesa</option>
                  <option value="CRDB Bank">CRDB Bank</option>
                  <option value="NMB Bank">NMB Bank</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'sw' ? 'Namba ya Muamala (Transaction ID / Reference)' : 'Transaction ID / Reference *'}
                </label>
                <input
                  type="text"
                  required
                  value={paymentRefNumber}
                  onChange={e => setPaymentRefNumber(e.target.value)}
                  placeholder="e.g., 9K872XQ12 or Ref #00129"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'sw' ? 'Maelezo ya Ziada (Hiari)' : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder={language === 'sw' ? 'Mfano: Malipo yametoka kwa jina la Fatma...' : 'e.g., Sent from Fatma phone...'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentProofOrder(null)}
                disabled={isSubmittingProof}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs min-h-[44px]"
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmittingProof}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors min-h-[44px]"
              >
                {isSubmittingProof ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'sw' ? 'Inatuma...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'sw' ? 'Wasilisha Uhakiki' : 'Submit for Verification'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
