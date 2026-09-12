import React from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { formatTSh } from '../utils/formatters';
import { createWhatsAppUrl } from '../utils/whatsapp';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartCount,
    navigateTo
  } = useApp();

  const handleWhatsAppOrder = () => {
    const summary = cart
      .map(
        item =>
          `• ${item.product.name} (Qty: ${item.quantity}) - TSh ${(
            item.product.price * item.quantity
          ).toLocaleString()}`
      )
      .join('\n');

    const msg = `Habari TK Stationery! 👋\n\nNingependa kuagiza vifaa hivi kutoka kwenye kikapu changu:\n\n${summary}\n\n*Jumla ya Malipo: ${formatTSh(
      cartSubtotal
    )}*\n\nTafadhali thibitisha upatikanaji na maandalizi ya mzigo wangu.`;

    window.open(createWhatsAppUrl(msg), '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="py-16">
        <Container size="md">
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-5 shadow-xs">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Kikapu Chako Kiko Tupu</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Huna vifaa vyovyote kwenye kikapu chako kwa sasa. Tembelea duka letu kupata vifaa vya shule, ream za karatasi, na vifaa vya ofisi.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigateTo('/shop')}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Angalia Vifaa vya Duka
              </Button>
            </div>
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
            { label: 'Duka la Vifaa', path: '/shop' },
            { label: 'Kikapu Chako cha Manunuzi' }
          ]}
        />

        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kikapu cha Manunuzi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kagua vifaa ulivyochagua kabla ya kukamilisha malipo na usafirishaji.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
          >
            Futa Kikapu Chote
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Cart Items Table */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {cart.map(item => (
              <div
                key={item.product.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                      {item.product.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatTSh(item.product.price)} kila kimoja
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Stepper */}
                  <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-white rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-white rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="text-sm font-black text-slate-950 min-w-[90px] text-right">
                    {formatTSh(item.product.price * item.quantity)}
                  </span>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Ondoa kifaa hiki"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Muhtasari wa Malipo
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Jumla ya Vifaa ({cartCount})</span>
                  <span className="font-semibold text-slate-900">{formatTSh(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Makadirio ya Usafiri</span>
                  <span className="text-slate-500">Bure Kuchukua Dukani / Bodaboda TSh 3,000+</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-950 pt-3 border-t border-slate-200">
                  <span>Jumla Kuu</span>
                  <span className="text-amber-600">{formatTSh(cartSubtotal)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigateTo('/checkout')}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Endelea na Malipo & Oda
                </Button>

                <Button
                  variant="whatsapp"
                  size="md"
                  fullWidth
                  onClick={handleWhatsAppOrder}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Agiza Moja kwa Moja WhatsApp
                </Button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigateTo('/shop')}
                  className="text-xs text-slate-500 hover:text-slate-900 underline"
                >
                  &larr; Endelea Kununua Vifaa
                </button>
              </div>
            </div>

            {/* Guarantees Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Vifaa Halisi na Vyenye Ubora</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Chapa asilia ikiwemo Faber-Castell, Double A, Casio, na Deli. Tuna dhamana ya kubadilisha kifaa chochote chenye hitilafu dukani kwetu Manzese.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
