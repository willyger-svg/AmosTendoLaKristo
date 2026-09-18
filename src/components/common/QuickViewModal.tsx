import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { formatTSh } from '../../utils/formatters';
import { getProductWhatsAppUrl } from '../../utils/whatsapp';
import { ShoppingCart, MessageSquare, Check, Plus, Minus, ShieldCheck, Truck, Heart } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const { activeModal, closeModal, addToCart, navigateTo, isWishlisted, toggleWishlist } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  if (!activeModal || activeModal.type !== 'quick-view') return null;

  const { product } = activeModal;
  const isSaved = isWishlisted(product.id);

  const handleToggleWishlist = async () => {
    if (isWishlistLoading) return;
    setIsWishlistLoading(true);
    try {
      await toggleWishlist(product);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      closeModal();
    }, 800);
  };

  const handleViewFullDetails = () => {
    closeModal();
    navigateTo(`/shop/product/${product.slug}`);
  };

  return (
    <Modal isOpen={true} onClose={closeModal} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Product Image */}
        <div className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            {product.inStock ? (
              <Badge variant="success" size="sm">
                In Stock ({product.stockCount} left)
              </Badge>
            ) : (
              <Badge variant="danger" size="sm">
                Out of Stock
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            title={isSaved ? 'Ondoa kwenye Wishlist' : 'Hifadhi kwenye Wishlist'}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs active:scale-90 ${
              isSaved
                ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                : 'bg-white/90 hover:bg-white text-slate-500 hover:text-rose-500 border border-slate-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-amber-600">
                {product.category}
              </span>
              <span>SKU: {product.sku}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">
                {formatTSh(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatTSh(product.originalPrice)}
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">
                / {product.unit || 'unit'}
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quick Specifications */}
          {product.specifications && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Key Specifications:
              </span>
              {Object.entries(product.specifications).slice(0, 3).map(([k, v]) => (
                <div key={k} className="flex justify-between text-slate-600">
                  <span className="text-slate-500">{k}:</span>
                  <span className="font-medium text-slate-900">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stepper & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleAddToCart}
                disabled={!product.inStock}
                icon={isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              >
                {isAdded ? 'Added to Cart!' : `Add to Cart (${formatTSh(product.price * quantity)})`}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="whatsapp"
                size="sm"
                fullWidth
                onClick={() => window.open(getProductWhatsAppUrl(product.name, product.price, product.sku), '_blank')}
                icon={<MessageSquare className="w-3.5 h-3.5" />}
              >
                Order on WhatsApp
              </Button>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={handleViewFullDetails}
              >
                Full Details &rarr;
              </Button>
            </div>

            {/* Wishlist Toggle Button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={isWishlistLoading}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                isSaved
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
              <span>{isSaved ? 'Kipo Kwenye Wishlist Yako (Ondoa)' : 'Hifadhi Kwenye Wishlist (Unayopenda)'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
