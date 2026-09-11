import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { formatTSh, generateId } from '../utils/formatters';
import { paymentService } from '../services/payments/paymentService';
import { getOrderWhatsAppUrl } from '../utils/whatsapp';
import { Order, PaymentMethod, PaymentTransaction } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Store,
  CreditCard,
  Phone,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Building2,
  Banknote,
  Copy,
  Check,
  Truck
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, cartSubtotal, createOrder, clearCart, showToast, navigateTo, storeSettings } = useApp();
  const { currentUser, userProfile } = useAuth();
  const { t, language } = useTranslation();

  const [customerName, setCustomerName] = useState(userProfile?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || userProfile?.email || '');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile?.address || '');
  
  // Tanzanian Payment Method Selection (Manual / Mobile Money / Bank / Store)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [orderNotes, setOrderNotes] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [paymentTxn, setPaymentTxn] = useState<PaymentTransaction | null>(null);

  const whatsappPaymentNumber = storeSettings?.paymentWhatsAppNumber || '0787754202';
  const deliveryFee = deliveryMethod === 'delivery' ? (storeSettings?.darDeliveryFee || 3000) : 0;
  const totalAmount = cartSubtotal + deliveryFee;

  useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName && !customerName) setCustomerName(userProfile.fullName);
      if (userProfile.phone && !customerPhone) setCustomerPhone(userProfile.phone);
      if (userProfile.email && !customerEmail) setCustomerEmail(userProfile.email);
      if (userProfile.address && !deliveryAddress) setDeliveryAddress(userProfile.address);
    }
  }, [userProfile]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast({
      type: 'info',
      title: 'Imenakiliwa (Copied)',
      message: `${text} imenakiliwa kwenye clipboard.`
    });
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Taarifa Zinakosekana' : 'Missing Contact Details',
        message: language === 'sw' ? 'Tafadhali weka jina na namba yako ya simu.' : 'Please enter your name and phone number.'
      });
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Anwani ya Usafirishaji Inahitajika' : 'Delivery Address Required',
        message: language === 'sw' ? 'Tafadhali taja mtaa au jengo lako la Dar es Salaam.' : 'Please specify your delivery address or landmark.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = generateId('TK-ORD');
      const orderItems = cart.map(c => ({
        productId: c.product.id,
        productName: c.product.name,
        unitPrice: c.product.price,
        quantity: c.quantity,
        totalPrice: c.product.price * c.quantity,
        image: c.product.image
      }));

      const paymentMethodLabel =
        paymentMethod === 'mpesa'
          ? 'M-Pesa (0787754202)'
          : paymentMethod === 'tigopesa'
          ? 'Tigo Pesa (0787754202)'
          : paymentMethod === 'airtelmoney'
          ? 'Airtel Money (0787754202)'
          : paymentMethod === 'bank'
          ? 'Bank Transfer (CRDB/NMB)'
          : paymentMethod === 'cash_on_delivery'
          ? 'Cash on Delivery'
          : 'Cash at Store (Store Pickup)';

      const newOrderPayload: Order = {
        id: orderId,
        orderId,
        customerId: currentUser?.uid || '',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        items: orderItems,
        subtotal: cartSubtotal,
        deliveryFee,
        total: totalAmount,
        totalAmount,
        deliveryMethod: deliveryMethod === 'delivery' ? 'Dar es Salaam Delivery' : 'Store Pickup',
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress.trim() : undefined,
        paymentMethod: paymentMethodLabel,
        paymentStatus: 'pending',
        status: 'Submitted',
        orderStatus: 'Submitted',
        notes: orderNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Create order in Firestore
      const savedOrder = await createOrder(newOrderPayload);
      setCompletedOrder(savedOrder);
      clearCart();

      // 2. Log manual payment transaction
      const payResult = await paymentService.initiatePayment({
        orderId,
        customerId: currentUser?.uid || '',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        amount: totalAmount,
        currency: 'TZS',
        method: paymentMethod,
        customerMsisdn: customerPhone.trim(),
        notes: orderNotes.trim()
      });

      if (payResult.transaction) {
        setPaymentTxn(payResult.transaction);
      }

      showToast({
        type: 'success',
        title: language === 'sw' ? 'Oda Imepokelewa!' : 'Order Placed!',
        message: language === 'sw' ? `Oda #${orderId} imesajiliwa kikamilifu.` : `Order #${orderId} has been successfully logged.`
      });
    } catch (err: any) {
      console.warn('Place order error:', err);
      showToast({
        type: 'error',
        title: 'Submission Error',
        message: err.message || 'Could not complete order. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // PAYMENT RESULT & MANUAL PAYMENT INSTRUCTIONS
  // ----------------------------------------------------
  if (completedOrder) {
    const isPaid = completedOrder.paymentStatus === 'Paid';
    const isPending = !isPaid;
    const whatsAppChatUrl = getOrderWhatsAppUrl(
      completedOrder.id,
      completedOrder.total,
      completedOrder.customerName,
      completedOrder.items.length,
      completedOrder.paymentMethod,
      whatsappPaymentNumber
    );

    return (
      <div className="py-12">
        <Container size="md">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
            {/* Header Status Badge */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-amber-100 text-amber-600">
                <Clock className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {language === 'sw' ? 'Oda Imesajiliwa • Inasubiri Malipo' : 'Order Registered • Payment Pending'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Order Ref: {completedOrder.id}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {language === 'sw'
                    ? `Asante, ${completedOrder.customerName}. Oda yako imehifadhiwa. Tafadhali kamilisha malipo kwa maelekezo hapa chini.`
                    : `Thank you, ${completedOrder.customerName}. Your order is saved. Please complete payment using the instructions below.`}
                </p>
              </div>
            </div>

            {/* Manual Payment Instructions Card (WhatsApp Number 0787754202) */}
            <div className="p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border-2 border-amber-400 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  {t('payment.manual_title', 'Maelekezo ya Malipo (Manual Payment)')}
                </span>
                <span className="text-xs font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                  TZS {formatTSh(completedOrder.total)}
                </span>
              </div>

              {/* Number Showcase */}
              <div className="p-4 bg-white rounded-xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">
                    {t('payment.send_to_number', 'Namba ya Malipo / WhatsApp ya TK Stationery:')}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-wider font-mono">
                    {whatsappPaymentNumber}
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    (M-Pesa / Tigo Pesa / Airtel Money / WhatsApp Receipt)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(whatsappPaymentNumber, 'number')}
                  icon={copiedText === 'number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedText === 'number' ? 'Imenakiliwa' : 'Copy Number'}
                </Button>
              </div>

              {/* Steps */}
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Tuma kiasi cha <strong>{formatTSh(completedOrder.total)}</strong> kwenda namba <strong>{whatsappPaymentNumber}</strong> au akaunti ya benki.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Weka kumbukumbu ya oda yako: <strong>{completedOrder.id}</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Bofya kitufe cha kijani cha WhatsApp hapa chini kutuma risiti / picha ya muamala moja kwa moja.</span>
                </div>
              </div>

              {/* Direct WhatsApp Confirmation Button */}
              <div className="pt-2">
                <a
                  href={whatsAppChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>{t('payment.confirm_whatsapp', 'Thibitisha Malipo Kupitia WhatsApp')}</span>
                </a>
              </div>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-3 max-w-lg mx-auto">
              <div className="flex justify-between font-semibold text-slate-700 pb-2 border-b border-slate-200">
                <span>{language === 'sw' ? 'Muhtasari wa Oda:' : 'Order Summary:'}</span>
                <span>{completedOrder.items.length} {language === 'sw' ? 'Bidhaa' : 'Items'}</span>
              </div>

              <div className="space-y-1">
                {completedOrder.items.map(it => (
                  <div key={it.productId} className="flex justify-between text-slate-600">
                    <span>• {it.productName} (x{it.quantity})</span>
                    <span className="font-bold text-slate-900">{formatTSh(it.totalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>{language === 'sw' ? 'Njia ya Usafirishaji:' : 'Delivery Method:'}</span>
                  <span className="font-bold text-slate-900">
                    {completedOrder.deliveryMethod === 'Dar es Salaam Delivery'
                      ? `Courier Dispatch (${completedOrder.deliveryAddress})`
                      : 'Store Pickup (TK Center Mwenge)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'sw' ? 'Njia ya Malipo:' : 'Payment Method:'}</span>
                  <span className="font-bold text-slate-900">{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'sw' ? 'Hali ya Oda (Order Status):' : 'Order Status:'}</span>
                  <span className="font-bold text-blue-600">{completedOrder.status || 'Submitted'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'sw' ? 'Hali ya Malipo (Payment Status):' : 'Payment Status:'}</span>
                  <span className="font-bold text-amber-600">PENDING (Inasubiri Uhakiki)</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>{language === 'sw' ? 'Jumla Kuu:' : 'Total Amount:'}</span>
                  <span className="text-amber-600">{formatTSh(completedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigateTo('/track-order')}
              >
                {t('btn.track', 'Fuatilia Oda')}
              </Button>

              <Button
                variant="ghost"
                size="md"
                onClick={() => navigateTo('/shop')}
              >
                {language === 'sw' ? 'Endelea Kununua' : 'Continue Shopping'}
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ----------------------------------------------------
  // EMPTY CART GUARD
  // ----------------------------------------------------
  if (cart.length === 0) {
    return (
      <div className="py-16">
        <Container size="sm">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'sw' ? 'Kikapu chako kiko tupu' : 'Your cart is empty'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'sw'
                ? 'Tafadhali chagua vifaa kabla ya kuelekea kwenye malipo.'
                : 'Please add stationery items before proceeding to checkout.'}
            </p>
            <Button variant="primary" size="md" onClick={() => navigateTo('/shop')}>
              {language === 'sw' ? 'Tazama Vifaa' : 'Browse Stationery'}
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <Container>
        <Breadcrumbs
          items={[
            { label: 'Shop', path: '/shop' },
            { label: 'Cart', path: '/cart' },
            { label: 'Checkout' }
          ]}
        />

        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === 'sw' ? 'Kamilisha Oda & Malipo' : 'Checkout & Manual Payment'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'sw'
              ? 'Weka anwani yako ya Dar es Salaam na chagua njia ya malipo (M-Pesa, Tigo Pesa, Airtel au Taslimu).'
              : 'Specify your delivery address and preferred Tanzanian manual payment method.'}
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Contact Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>1. {language === 'sw' ? 'Taarifa za Mpokeaji' : 'Recipient Information'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={language === 'sw' ? 'Jina Kamili / Kampuni' : 'Full Name / Company'}
                  placeholder="e.g. Amisa Bakari"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                />

                <Input
                  label={language === 'sw' ? 'Namba ya Simu ya Mpokeaji' : 'Recipient Phone Number'}
                  placeholder="e.g. 0784 123 456"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label={language === 'sw' ? 'Barua Pepe (Si lazima)' : 'Email Address (Optional)'}
                type="email"
                placeholder="e.g. amisa@gmail.com"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
            </div>

            {/* 2. Delivery Method */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>2. {language === 'sw' ? 'Njia ya Kupokea Vifaa' : 'Fulfillment Method'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all ${
                    deliveryMethod === 'delivery'
                      ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-900 block">
                      {language === 'sw' ? 'Usafirishaji Dar es Salaam' : 'Dar es Salaam Delivery'} (+{formatTSh(storeSettings?.darDeliveryFee || 3000)})
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {language === 'sw'
                        ? 'Tunakuletea hadi mlangoni kwako ndani ya masaa 2–4.'
                        : 'Dispatched to your home, office, or school within 2–4 hours.'}
                    </span>
                  </div>
                  {deliveryMethod === 'delivery' && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-900 block">
                      {language === 'sw' ? 'Kuchukua Dukani (Bure)' : 'Store Pickup (Free)'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {language === 'sw'
                        ? 'Chukua vifaa vyako TK Stationery Center (Mwenge/Shekilango).'
                        : 'Pick up ready at TK Stationery Center (Mwenge/Shekilango).'}
                    </span>
                  </div>
                  {deliveryMethod === 'pickup' && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="pt-2">
                  <Input
                    label={language === 'sw' ? 'Mtaa / Jengo / Alama ya Eneo (Dar es Salaam)' : 'Street / Building / Landmark in Dar'}
                    placeholder="e.g. Mwenge, Karibu na Posta, Floor 2"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* 3. Tanzanian Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>3. {language === 'sw' ? 'Chagua Njia ya Malipo' : 'Select Payment Method'}</span>
                </h3>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                  Manual Payment
                </span>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  {
                    id: 'mpesa',
                    label: 'Vodacom M-Pesa',
                    icon: <Smartphone className="w-4 h-4 text-red-600" />,
                    desc: `Tuma kwa namba: ${whatsappPaymentNumber}`
                  },
                  {
                    id: 'tigopesa',
                    label: 'Tigo Pesa (Mixx)',
                    icon: <Smartphone className="w-4 h-4 text-blue-600" />,
                    desc: `Tuma kwa namba: ${whatsappPaymentNumber}`
                  },
                  {
                    id: 'airtelmoney',
                    label: 'Airtel Money',
                    icon: <Smartphone className="w-4 h-4 text-red-500" />,
                    desc: `Tuma kwa namba: ${whatsappPaymentNumber}`
                  },
                  {
                    id: 'bank',
                    label: 'Benki (CRDB / NMB)',
                    icon: <Building2 className="w-4 h-4 text-emerald-600" />,
                    desc: 'Akaunti ya Benki ya Kampuni'
                  },
                  {
                    id: 'cash_at_store',
                    label: 'Taslimu Dukani',
                    icon: <Store className="w-4 h-4 text-amber-600" />,
                    desc: 'Lipa dukani Mwenge'
                  },
                  {
                    id: 'cash_on_delivery',
                    label: 'Taslimu Wakati wa Kupokea',
                    icon: <Banknote className="w-4 h-4 text-slate-700" />,
                    desc: 'Lipa courier anapofika'
                  }
                ].map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      paymentMethod === pm.id
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        {pm.icon}
                        {pm.label}
                      </span>
                      {paymentMethod === pm.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-500 leading-snug">
                      {pm.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Instructions banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {language === 'sw' ? 'Maelekezo ya Uhakiki wa Malipo:' : 'Payment Verification Guide:'}
                </span>
                <p>
                  {language === 'sw'
                    ? `Baada ya kuweka oda, utapata muhtasari na namba ya oda. Tuma malipo kwa namba ${whatsappPaymentNumber} kisha bofya kitufe cha WhatsApp kutuma uthibitisho kwa mhudumu wetu.`
                    : `After placing the order, you will receive an order reference. Send payment to ${whatsappPaymentNumber} and send the receipt on WhatsApp to confirm dispatch.`}
                </p>
              </div>
            </div>

            {/* 4. Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2 shadow-xs">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {language === 'sw' ? 'Maelezo ya Ziada (Si lazima)' : 'Order Notes / Delivery Instructions'}
              </label>
              <textarea
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                placeholder="e.g. Tafadhali piga simu kabla ya kuleta..."
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-200">
              {language === 'sw' ? 'Muhtasari wa Malipo' : 'Order Summary'}
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900">{formatTSh(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{language === 'sw' ? 'Jumla ya Vifaa:' : 'Items Subtotal:'}</span>
                <span className="font-bold text-slate-900">{formatTSh(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'sw' ? 'Ada ya Usafirishaji:' : 'Delivery Fee:'}</span>
                <span className="font-bold text-slate-900">
                  {deliveryFee === 0 ? (language === 'sw' ? 'BURE' : 'FREE') : formatTSh(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>{language === 'sw' ? 'Jumla Kuu:' : 'Total Amount:'}</span>
                <span className="text-amber-600">{formatTSh(totalAmount)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-3 text-sm font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (language === 'sw' ? 'Inasajili Oda...' : 'Placing Order...')
                : (language === 'sw' ? `Thibitisha Oda (${formatTSh(totalAmount)})` : `Place Order (${formatTSh(totalAmount)})`)}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
};
