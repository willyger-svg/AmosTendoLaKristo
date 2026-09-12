import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { orderService } from '../../../services/orders/orderService';
import { auditLogService } from '../../../services/audit/auditLogService';
import { Order, OrderStatus } from '../../../types';
import { formatPrice, formatDate } from '../../../utils/formatters';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  ExternalLink,
  ChevronDown,
  Filter
} from 'lucide-react';

export const AdminOrdersView: React.FC = () => {
  const { orders, updateOrderStatus, showToast } = useApp();
  const { currentUser, userRole, userProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q);
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);

      // Audit log
      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'order_status_updated',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: userProfile?.fullName || '',
          actorRole: userRole,
          targetType: 'order',
          targetId: orderId,
          targetTitle: `Order #${orderId}`,
          details: { newStatus }
        });
      }

      showToast({
        type: 'success',
        title: 'Hali ya Oda Imesasishwa',
        message: `Oda #${orderId} imesasishwa kuwa ${newStatus}.`
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Hitilafu',
        message: 'Imeshindwa kusasisha hali ya oda.'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200';
      case 'Out for Delivery':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200';
      case 'Submitted':
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tafuta namba ya oda, mteja au simu..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Hali Zote ({orders.length})</option>
            <option value="Submitted">Zilizopokelewa ({orders.filter(o => o.status === 'Submitted').length})</option>
            <option value="Processing">Zinazoshughulikiwa ({orders.filter(o => o.status === 'Processing').length})</option>
            <option value="Out for Delivery">Zilizo Njiani</option>
            <option value="Completed">Zilizokamilika ({orders.filter(o => o.status === 'Completed').length})</option>
            <option value="Cancelled">Zilizoghairiwa</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">Hakuna oda inayolingana na vigezo vyako</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Namba ya Oda & Tarehe</th>
                  <th className="p-4">Mteja</th>
                  <th className="p-4">Bidhaa</th>
                  <th className="p-4">Jumla ya Malipo</th>
                  <th className="p-4">Malipo</th>
                  <th className="p-4">Hali ya Oda</th>
                  <th className="p-4 text-right">Maelezo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">#{order.id}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{order.customerPhone}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{order.items.length} bidhaa</span>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {order.items.map(i => `${i.quantity}x ${i.product.title}`).join(', ')}
                      </p>
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.paymentStatus === 'successful'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {order.paymentStatus === 'successful' ? 'Imelipwa' : order.paymentStatus || 'Inasubiri'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          <option value="Submitted">Imepokelewa</option>
                          <option value="Processing">Inashughulikiwa</option>
                          <option value="Out for Delivery">Ipo Njiani</option>
                          <option value="Completed">Imekamilika</option>
                          <option value="Cancelled">Imeghairiwa</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Tazama Maelezo Kamili ya Oda"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Maelezo ya Oda #{selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-400">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Customer Info */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.customerName}</p>
                <p className="text-slate-600 dark:text-slate-300">Simu: {selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && <p className="text-slate-600 dark:text-slate-300">Barua Pepe: {selectedOrder.customerEmail}</p>}
                <p className="text-slate-600 dark:text-slate-300">
                  Uwasilishaji: {selectedOrder.deliveryMethod} {selectedOrder.deliveryAddress ? `(${selectedOrder.deliveryAddress})` : ''}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bidhaa za Oda Hii</h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.product.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.quantity} x {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <p className="font-black text-slate-900 dark:text-white">
                        {formatPrice(item.quantity * item.product.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Financials */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Jumla ya Thamani ya Oda</p>
                  <p className="text-[11px] text-slate-500">Malipo: {selectedOrder.paymentMethod.toUpperCase()} ({selectedOrder.paymentStatus === 'successful' ? 'Yamekamilika' : 'Yanasubiri'})</p>
                </div>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {formatPrice(selectedOrder.totalAmount)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
