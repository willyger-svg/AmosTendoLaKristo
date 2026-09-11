import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProductCard } from '../components/shop/ProductCard';
import { mockProducts } from '../data/products';
import { formatTSh } from '../utils/formatters';
import { getProductWhatsAppUrl } from '../utils/whatsapp';
import {
  ShoppingCart,
  MessageSquare,
  Check,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Package,
  Store
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { currentPath, addToCart, navigateTo, showToast, products } = useApp();

  // Extract slug or id from route /shop/product/:slug
  const slug = currentPath.replace('/shop/product/', '').replace('/', '');
  const product = products.find(p => p.slug === slug || p.id === slug) || mockProducts.find(p => p.slug === slug) || products[0] || mockProducts[0];

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id && p.isActive !== false)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    showToast({
      type: 'success',
      title: 'Added to Cart',
      message: `${quantity}x ${product.name} has been added.`
    });
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleDirectWhatsApp = () => {
    window.open(getProductWhatsAppUrl(product.name, product.price, product.sku), '_blank');
  };

  return (
    <div className="py-8 space-y-12">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Shop', path: '/shop' },
            { label: product.category, path: `/shop?category=${product.category}` },
            { label: product.name }
          ]}
        />

        {/* Main Product Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4 items-start">
          {/* Left: Product Images */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isBestSeller && (
                  <Badge variant="brand" size="md">
                    Best Seller
                  </Badge>
                )}
                {product.originalPrice && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-xs">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Pricing, Specs & Buying Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-bold uppercase tracking-wider text-amber-600">
                  {product.category}
                </span>
                <span className="font-mono text-slate-400">SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-slate-800">{product.rating || 4.9}</span>
                  <span className="text-slate-400 font-normal">({product.reviewCount || 28} verified reviews)</span>
                </div>

                <div className="h-3 w-px bg-slate-200" />

                <div>
                  {product.inStock ? (
                    <Badge variant="success" size="sm">
                      In Stock ({product.stockCount} Available)
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="sm">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Price block */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">Unit Price</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-slate-950">
                    {formatTSh(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      {formatTSh(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Sold per {product.unit || 'unit'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Stepper & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Stepper */}
                <div className="flex items-center justify-between sm:justify-center border border-slate-300 rounded-xl bg-white p-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-950">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  icon={isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                >
                  {isAdded ? 'Added to Cart!' : `Add to Cart (${formatTSh(product.price * quantity)})`}
                </Button>
              </div>

              {/* Direct WhatsApp Order CTA */}
              <Button
                variant="whatsapp"
                size="lg"
                fullWidth
                onClick={handleDirectWhatsApp}
                icon={<MessageSquare className="w-5 h-5" />}
              >
                Order This Item on WhatsApp ({formatTSh(product.price * quantity)})
              </Button>
            </div>

            {/* Delivery & Collection Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Store className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Instant Store Collection</span>
                  <span className="text-slate-500">Pick up ready at TK Stationery Center within 30 minutes.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Dar es Salaam Dispatch</span>
                  <span className="text-slate-500">Doorstep delivery via trusted courier or bodaboda.</span>
                </div>
              </div>
            </div>

            {/* Specifications Table */}
            {product.specifications && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Product Technical Specifications
                </h3>
                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between p-3 bg-white hover:bg-slate-50">
                      <span className="text-slate-500 font-medium">{key}</span>
                      <span className="text-slate-900 font-bold text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Showcase */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-slate-200 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">
              Related Items in {product.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
