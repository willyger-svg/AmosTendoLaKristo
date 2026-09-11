import React from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import { formatTSh } from '../../utils/formatters';
import { createWhatsAppUrl } from '../../utils/whatsapp';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartCount,
    navigateTo
  } = useApp();

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    navigateTo('/checkout');
  };

  const handleWhatsAppCheckout = () => {
    const summary = cart
      .map(item => `• ${item.product.name} (x${item.quantity}) - TSh ${(item.product.price * item.quantity).toLocaleString()}`)
      .join('\n');

    const msg = `Hello TK Stationery! 👋\n\nI would like to order the following items from my cart:\n\n${summary}\n\n*Cart Total: ${formatTSh(cartSubtotal)}*\n\nPlease confirm availability and delivery dispatch.`;
    window.open(createWhatsAppUrl(msg), '_blank');
  };

  return (
    <Drawer
      isOpen={isCartDrawerOpen}
      onClose={() => setIsCartDrawerOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-500" />
          <span>Shopping Cart ({cartCount})</span>
        </div>
      }
      maxWidth="md"
    >
      {cart.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Explore our stationery, office supplies, computer accessories, and reams of paper.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setIsCartDrawerOpen(false);
              navigateTo('/shop');
            }}
          >
            Browse Stationery Store
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between -mx-6 -my-6">
          {/* Scrollable Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-100">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-500">
                {cartCount} {cartCount === 1 ? 'item' : 'items'} in your order
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                Clear Cart
              </button>
            </div>

            {cart.map(item => (
              <div key={item.product.id} className="pt-4 flex gap-3.5 items-start">
                {/* Thumbnail */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatTSh(item.product.price)} each
                  </p>

                  <div className="flex items-center justify-between mt-2.5">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-md bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-950">
                        {formatTSh(item.product.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Footer Summary */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatTSh(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Estimated Delivery</span>
                <span className="text-slate-500">Calculated at checkout</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>Cart Total</span>
                <span className="text-amber-600">{formatTSh(cartSubtotal)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleProceedToCheckout}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="whatsapp"
                size="md"
                fullWidth
                onClick={handleWhatsAppCheckout}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Instant WhatsApp Order
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe Store Pickup or Local Dar es Salaam Dispatch</span>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};
