import React, { useState } from 'react';
import { ShoppingCart, Eye, MessageSquare, Check, Plus, Minus, Heart } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatTSh } from '../../utils/formatters';
import { getProductWhatsAppUrl } from '../../utils/whatsapp';
import { Badge } from '../common/Badge';

export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openModal, navigateTo, isWishlisted, toggleWishlist } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const saved = isWishlisted(product.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlistLoading) return;
    setIsWishlistLoading(true);
    try {
      await toggleWishlist(product);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal({ type: 'quick-view', product });
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getProductWhatsAppUrl(product.name, product.price, product.sku), '_blank');
  };

  const handleCardClick = () => {
    navigateTo(`/shop/product/${product.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-300/80 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Top Badges & Wishlist Action */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          {product.isBestSeller && (
            <Badge variant="brand" size="sm">
              Inauzwa Sana
            </Badge>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">
              Punguzo {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {product.inStock ? (
            <Badge variant="success" size="sm">
              Ipo Stoo
            </Badge>
          ) : (
            <Badge variant="danger" size="sm">
              Imeisha
            </Badge>
          )}

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            title={saved ? 'Ondoa kwenye Wishlist' : 'Hifadhi kwenye Wishlist'}
            aria-label={saved ? 'Ondoa kwenye Wishlist' : 'Hifadhi kwenye Wishlist'}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-2xs active:scale-85 ${
              saved
                ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                : 'bg-white/90 hover:bg-white text-slate-500 hover:text-rose-500 border border-slate-200/80'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                saved ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Product Image Container */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <button
            type="button"
            onClick={handleQuickView}
            className="px-3.5 py-2 bg-white/95 hover:bg-white text-slate-900 text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>Tazama Haraka</span>
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            {product.category}
          </span>

          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing & Stepper */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-base font-black text-slate-950">
                {formatTSh(product.price)}
              </span>
              {product.originalPrice && (
                <span className="ml-1.5 text-xs text-slate-400 line-through">
                  {formatTSh(product.originalPrice)}
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-400 font-medium">
              kwa {product.unit || 'kimoja'}
            </span>
          </div>

          {/* Stepper & Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quantity Stepper */}
            <div
              onClick={e => e.stopPropagation()}
              className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5 shrink-0"
            >
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                aria-label="Punguza idadi"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
                aria-label="Ongeza idadi"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Imewekwa!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Weka Kikapuni</span>
                </>
              )}
            </button>

            {/* Direct WhatsApp Order Icon */}
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              title="Agiza moja kwa moja kupitia WhatsApp"
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
              aria-label="Agiza WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
