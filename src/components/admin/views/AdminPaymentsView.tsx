import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { paymentService } from '../../../services/payments/paymentService';
import { auditLogService } from '../../../services/audit/auditLogService';
import { PaymentTransaction, PaymentStatus } from '../../../types';
import { formatPrice, formatDate } from '../../../utils/formatters';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Filter,
  Check,
  Smartphone,
  Building2,
  Banknote
} from 'lucide-react';
import { TableSkeleton } from '../../common/Skeleton';

export const AdminPaymentsView: React.FC = () => {
  const { showToast, orders, refreshData, navigateTo } = useApp();
  const { currentUser, userRole, userProfile } = useAuth();

  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Refund Modal State
  const [refundTarget, setRefundTarget] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const list = await paymentService.getAllPayments();
      // If Firestore returns empty, construct transactions list from orders
      if (list.length === 0 && orders.length > 0) {
        const synthesized: PaymentTransaction[] = orders.map(o => ({
          id: `PAY-${o.id}`,
          paymentId: `PAY-${o.id}`,
          orderId: o.id,
          customerId: o.customerPhone,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          provider: o.paymentMethod === 'cash' ? 'cash' : 'tigo',
          method: o.paymentMethod,
          amount: o.totalAmount,
          currency: 'TZS',
          status: o.paymentStatus || 'pending',
          reference: `REF-${o.id}`,
          createdAt: o.createdAt,
          updatedAt: o.createdAt
        }));
        setPayments(synthesized);
      } else {
        setPayments(list);
      }
    } catch (err) {
      console.warn('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [orders]);

  const handleVerify = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const res = await paymentService.verifyAndProcessPayment(
        paymentId,
        'successful',
        `ADMIN-VERIFIED-${Date.now()}`,
        currentUser?.uid || 'admin'
      );

      await auditLogService.logAdminAction({
        action: 'payment_verified',
        actorId: currentUser?.uid || userProfile?.id || 'admin_master',
        actorEmail: currentUser?.email || userProfile?.email || 'admin1010@tkstationery.co.tz',
        actorName: userProfile?.fullName || currentUser?.displayName || 'Msimamizi',
        actorRole: userRole,
        targetType: 'payment',
        targetId: paymentId,
        targetTitle: `Malipo #${paymentId}`,
        details: { status: 'successful' },
        severity: 'info',
        category: 'payments'
      });

      showToast({
        type: 'success',
        title: 'Malipo Yamethibitishwa',
        message: res.message || 'Muamala wa malipo umethibitishwa kwa mafanikio.'
      });

      setPayments(prev =>
        prev.map(p => (p.paymentId === paymentId || p.id === paymentId ? { ...p, status: 'successful' } : p))
      );
      await refreshData();
    } catch {
      showToast({
        type: 'error',
        title: 'Hitilafu',
        message: 'Imeshindwa kuthibitisha muamala wa malipo.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget || !refundReason.trim()) return;

    setIsSubmittingRefund(true);
    try {
      const res = await paymentService.refundPayment(
        refundTarget.id,
        refundTarget.amount,
        refundReason,
        currentUser?.uid || 'admin'
      );

      await auditLogService.logAdminAction({
        action: 'payment_refunded',
        actorId: currentUser?.uid || userProfile?.id || 'admin_master',
        actorEmail: currentUser?.email || userProfile?.email || 'admin1010@tkstationery.co.tz',
        actorName: userProfile?.fullName || currentUser?.displayName || 'Msimamizi',
        actorRole: userRole,
        targetType: 'payment',
        targetId: refundTarget.id,
        targetTitle: `Kurudisha Pesa kwa #${refundTarget.id}`,
        details: { amount: refundTarget.amount, reason: refundReason },
        severity: 'critical',
        category: 'payments'
      });

      showToast({
        type: res.success ? 'success' : 'error',
        title: res.success ? 'Kurudisha Fedha Kumefanikiwa' : 'Kurudisha Fedha Kumeshindikana',
        message: res.message
      });

      if (res.success) {
        setPayments(prev =>
          prev.map(p => (p.id === refundTarget.id ? { ...p, status: 'refunded' } : p))
        );
        setRefundTarget(null);
        setRefundReason('');
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Hitilafu',
        message: 'Zoezi la kurudisha fedha limeshindikana.'
      });
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      (p.customerName && p.customerName.toLowerCase().includes(q)) ||
      (p.customerPhone && p.customerPhone.includes(q)) ||
      (p.reference && p.reference.toLowerCase().includes(q));

    return matchStatus && matchSearch;
  });

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
            placeholder="Tafuta namba ya malipo, oda au kumbukumbu..."
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
            <option value="all">Miamala Yote ({payments.length})</option>
            <option value="pending">Inayosubiri Kuthibitishwa ({payments.filter(p => p.status === 'pending').length})</option>
            <option value="successful">Imekamilika ({payments.filter(p => p.status === 'successful').length})</option>
            <option value="failed">Imeshindikana ({payments.filter(p => p.status === 'failed').length})</option>
            <option value="refunded">Imerudishwa ({payments.filter(p => p.status === 'refunded').length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">Hakuna kumbukumbu za malipo zinazolingana na utafutaji wako</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Namba ya Malipo & Kumbukumbu</th>
                  <th className="p-4">Oda Iliyounganishwa</th>
                  <th className="p-4">Mlipaji / Mawasiliano</th>
                  <th className="p-4">Njia & Mtandao</th>
                  <th className="p-4">Kiasi</th>
                  <th className="p-4">Hali</th>
                  <th className="p-4 text-right">Vitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{p.paymentId || p.id}</span>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.reference || 'REF-N/A'}</p>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => navigateTo(`/admin/orders?orderId=${encodeURIComponent(p.orderId)}`)}
                        className="font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline text-left block"
                        title="Fungua oda hii"
                      >
                        #{p.orderId}
                      </button>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(p.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{p.customerName || 'Mteja'}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.customerMsisdn || p.customerPhone}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.method} ({p.provider})
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(p.amount)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'successful'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                            : p.status === 'refunded'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200'
                            : p.status === 'failed'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 animate-pulse'
                        }`}
                      >
                        {p.status === 'successful' ? 'Imelipwa' : p.status === 'pending' ? 'Inasubiri' : p.status === 'refunded' ? 'Imerudishwa' : p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleVerify(p.paymentId || p.id)}
                            disabled={processingId === (p.paymentId || p.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Thibitisha</span>
                          </button>
                        )}
                        {p.status === 'successful' && (userRole === 'admin' || userRole === 'super_admin') && (
                          <button
                            onClick={() => setRefundTarget(p)}
                            className="px-2 py-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-xs font-medium transition-colors"
                            title="Rudisha Pesa (Refund)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Rudisha Malipo ya Muamala
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inarudisha #{refundTarget.paymentId || refundTarget.id} kwa Oda #{refundTarget.orderId} (
              {formatPrice(refundTarget.amount)}).
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sababu ya Kurudisha Malipo (Ni lazima kwa kumbukumbu za kiusalama)
                </label>
                <textarea
                  required
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="mf. Mteja alighairi oda kabla ya kusafirishwa, malipo yalirudiwa mara mbili..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-amber-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRefund}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {isSubmittingRefund ? 'Inashughulikia...' : 'Thibitisha Kurudisha Malipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
