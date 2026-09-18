import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { OrderTrackingSkeleton } from '../components/common/Skeleton';
import { formatTSh, formatDate } from '../utils/formatters';
import { createWhatsAppUrl } from '../utils/whatsapp';
import { orderService } from '../services/orders/orderService';
import { serviceRequestService } from '../services/services/serviceRequestService';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Printer,
  FileCheck,
  AlertCircle,
  Truck,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Order, ServiceTicket } from '../types';

export const TrackOrderPage: React.FC = () => {
  const { orders, serviceTickets } = useApp();

  const [searchCode, setSearchCode] = useState('TK-ORD-88219');
  const [searched, setSearched] = useState(true);
  const [isSearchingFirestore, setIsSearchingFirestore] = useState(false);
  const [remoteOrder, setRemoteOrder] = useState<Order | null>(null);
  const [remoteTicket, setRemoteTicket] = useState<ServiceTicket | null>(null);

  const matchedOrder = remoteOrder || orders.find(
    o =>
      o.id.toLowerCase() === searchCode.trim().toLowerCase() ||
      o.customerPhone.replace(/\s+/g, '') === searchCode.trim().replace(/\s+/g, '')
  );

  const matchedTicket = remoteTicket || serviceTickets.find(
    t =>
      t.id.toLowerCase() === searchCode.trim().toLowerCase() ||
      t.customerPhone.replace(/\s+/g, '') === searchCode.trim().replace(/\s+/g, '')
  );

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearched(true);
    setRemoteOrder(null);
    setRemoteTicket(null);

    const term = searchCode.trim();
    if (!term) return;

    setIsSearchingFirestore(true);
    try {
      if (term.toUpperCase().startsWith('TK-ORD') || term.toUpperCase().startsWith('ORD')) {
        const ord = await orderService.getOrderById(term);
        if (ord) setRemoteOrder(ord);
      } else {
        const [ord, tkt] = await Promise.all([
          orderService.getOrderById(term),
          serviceRequestService.getServiceRequestById(term)
        ]);
        if (ord) setRemoteOrder(ord);
        if (tkt) setRemoteTicket(tkt);
      }
    } catch (err) {
      console.warn('Firestore tracking lookup notice:', err);
    } finally {
      setIsSearchingFirestore(false);
    }
  };

  const getStatusSteps = (status: string) => {
    const allSteps = ['Submitted', 'Processing', 'Ready', 'Out for Delivery', 'Completed'];
    const currentIdx = allSteps.indexOf(status);

    return allSteps.map((step, idx) => ({
      label: step,
      isCompleted: idx <= (currentIdx === -1 ? 0 : currentIdx),
      isCurrent: idx === currentIdx
    }));
  };

  const getServiceStatusSteps = (status: string) => {
    const allSteps = ['Submitted', 'In Review', 'Processing', 'Ready For Pickup', 'Completed'];
    const currentIdx = allSteps.indexOf(status);

    return allSteps.map((step, idx) => ({
      label: step,
      isCompleted: idx <= (currentIdx === -1 ? 0 : currentIdx),
      isCurrent: idx === currentIdx
    }));
  };

  return (
    <div className="py-8 space-y-12">
      <Container size="lg">
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Track Order or Ticket' }]} />

        {/* Header & Search Form */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Live Fulfillment & Service Tracking
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Track Your Stationery Order or Service Ticket
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Enter your Reference ID (e.g. <span className="text-amber-400 font-mono">TK-ORD-88219</span>, <span className="text-amber-400 font-mono">TK-PRT-44021</span>) or registered phone number.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              placeholder="e.g. TK-ORD-88219 or 0712 345 678"
              className="flex-1 px-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSearchingFirestore}
              icon={isSearchingFirestore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            >
              {isSearchingFirestore ? 'Searching...' : 'Track'}
            </Button>
          </form>

          {/* Quick sample chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
            <span>Quick test codes:</span>
            {['TK-ORD-88219', 'TK-PRT-44021', 'TK-NID-10492'].map(code => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setSearchCode(code);
                  setSearched(true);
                  handleSearch();
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-mono text-[11px] border border-slate-700 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searched && (
          <div className="space-y-8">
            {isSearchingFirestore ? (
              <OrderTrackingSkeleton />
            ) : (
              <>
                {/* Matched Product Order */}
                {matchedOrder && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-500" />
                      <h2 className="text-lg font-bold text-slate-900">
                        Stationery Order: {matchedOrder.id}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Placed on {formatDate(matchedOrder.createdAt)} by {matchedOrder.customerName}
                    </p>
                  </div>

                  <Badge variant="brand" size="md">
                    Status: {matchedOrder.status || matchedOrder.orderStatus}
                  </Badge>
                </div>

                {/* Progress Steps Timeline */}
                <div className="py-4">
                  <div className="grid grid-cols-5 gap-2">
                    {getStatusSteps(matchedOrder.status || matchedOrder.orderStatus || 'Submitted').map((st, i) => (
                      <div key={st.label} className="flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            st.isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {st.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                            st.isCompleted ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-slate-500 block">
                      Ordered Items ({matchedOrder.items?.length || 0})
                    </span>
                    <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      {matchedOrder.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span>{it.productName} (x{it.quantity})</span>
                          <span className="font-bold text-slate-900">
                            {formatTSh(it.totalPrice || (it.unitPrice * it.quantity) || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold uppercase tracking-wider text-slate-500 block">
                      Fulfillment & Payment
                    </span>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Method:</span>
                        <span className="font-bold text-slate-900 uppercase">
                          {matchedOrder.deliveryMethod || matchedOrder.fulfillmentMethod || 'Store Pickup'} ({matchedOrder.deliveryAddress || 'TK Store Pickup'})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment:</span>
                        <span className="font-bold text-slate-900 uppercase">{matchedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm">
                        <span className="text-slate-900">Total Amount:</span>
                        <span className="text-amber-600">{formatTSh(matchedOrder.total || matchedOrder.totalAmount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Update Link */}
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="whatsapp"
                    size="sm"
                    onClick={() => {
                      const msg = `Hello TK Stationery! 👋\n\nI am checking on order status for *${matchedOrder.id}* (Customer: ${matchedOrder.customerName}).\nPlease provide an update.`;
                      window.open(createWhatsAppUrl(msg), '_blank');
                    }}
                    icon={<MessageSquare className="w-4 h-4" />}
                  >
                    Ask Dispatch on WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {/* Matched Service Ticket */}
            {matchedTicket && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <h2 className="text-lg font-bold text-slate-900">
                        Service Ticket: {matchedTicket.id}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted on {formatDate(matchedTicket.createdAt)} for {matchedTicket.customerName}
                    </p>
                  </div>

                  <Badge variant="success" size="md">
                    Status: {matchedTicket.status}
                  </Badge>
                </div>

                {/* Service Progress Timeline */}
                <div className="py-4">
                  <div className="grid grid-cols-5 gap-2">
                    {getServiceStatusSteps(matchedTicket.status).map((st, i) => (
                      <div key={st.label} className="flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            st.isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {st.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                            st.isCompleted ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {matchedTicket.serviceTitle}
                  </h4>
                  {matchedTicket.description && (
                    <p className="text-slate-600">{matchedTicket.description}</p>
                  )}
                  {matchedTicket.fileName && (
                    <p className="text-slate-500 font-medium">
                      Attached Document: <span className="font-bold text-slate-800">{matchedTicket.fileName}</span>
                    </p>
                  )}
                  <p className="text-slate-700 font-bold pt-1">
                    Estimated Cost / Fee: <span className="text-amber-600">{formatTSh(matchedTicket.estimatedCost || 10000)}</span>
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="whatsapp"
                    size="sm"
                    onClick={() => {
                      const msg = `Hello TK Stationery! 👋\n\nI am checking on ticket status for *${matchedTicket.id}* (${matchedTicket.serviceTitle} for ${matchedTicket.customerName}).\nPlease provide an update.`;
                      window.open(createWhatsAppUrl(msg), '_blank');
                    }}
                    icon={<MessageSquare className="w-4 h-4" />}
                  >
                    Chat with Operator on WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {/* No match found */}
            {!matchedOrder && !matchedTicket && (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No Reference Found for "{searchCode}"
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Please double-check your Order Reference ID or registered phone number. If you just placed an order, please allow 1-2 minutes for receipt processing.
                </p>
              </div>
            )}
            </>
          )}
        </div>
        )}
      </Container>
    </div>
  );
};
