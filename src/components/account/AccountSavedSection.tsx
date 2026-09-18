import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SavedProduct } from '../../types';
import { formatTSh } from '../../utils/formatters';
import { savedProductsService } from '../../services/saved/savedProductsService';
import { getProductWhatsAppUrl } from '../../utils/whatsapp';
import {
  Heart,
  ShoppingCart,
  Eye,
  Trash2,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Loader2,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface AccountSavedSectionProps {
  savedProducts: SavedProduct[];
  onRefresh: () => void;
  showToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message: string }) => void;
  onNavigatePath: (path: string) => void;
}

export const AccountSavedSection: React.FC<AccountSavedSectionProps> = ({
  savedProducts,
  onRefresh,
  showToast,
  onNavigatePath
}) => {
  const { language } = useTranslation();
  const { addToCart } = useApp();
  const { currentUser } = useAuth();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    showToast({
      type: 'success',
      title: language === 'sw' ? 'Imeongezwa Kwenye Kikapu' : 'Added to Cart',
      message: `${product.name} ${language === 'sw' ? 'imeongezwa kwenye oda yako.' : 'has been added to your cart.'}`
    });
  };

  const handleAddAllToCart = () => {
    const inStockItems = savedProducts.filter(item => item.product?.inStock !== false);
    if (inStockItems.length === 0) {
      showToast({
        type: 'info',
        title: language === 'sw' ? 'Hakuna Bidhaa Stoo' : 'No Items in Stock',
        message: language === 'sw' ? 'Bidhaa zote kwenye orodha yako zimeisha stoo kwa sasa.' : 'All items in your wishlist are currently out of stock.'
      });
      return;
    }

    inStockItems.forEach(item => {
      addToCart(item.product, 1);
    });

    showToast({
      type: 'success',
      title: language === 'sw' ? 'Vyote Vimeongezwa Kikapuni!' : 'All Added to Cart!',
      message: language === 'sw'
        ? `Vifaa ${inStockItems.length} vimeongezwa kwenye kikapu chako kwa mkupuo.`
        : `${inStockItems.length} products added to your cart at once.`
    });
  };

  const handleRemove = async (productId: string) => {
    if (!currentUser) return;
    setRemovingId(productId);
    try {
      await savedProductsService.removeSavedProduct(currentUser.uid, productId);
      showToast({
        type: 'info',
        title: language === 'sw' ? 'Imeondolewa' : 'Removed',
        message: language === 'sw' ? 'Bidhaa imeondolewa kwenye orodha yako.' : 'Product removed from saved items.'
      });
      onRefresh();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Hitilafu' : 'Error',
        message: err.message || 'Could not remove product'
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!currentUser) return;
    if (savedProducts.length === 0) return;
    setIsClearing(true);
    try {
      await savedProductsService.clearAllSavedProducts(currentUser.uid);
      showToast({
        type: 'info',
        title: language === 'sw' ? 'Wishlist Imesafishwa' : 'Wishlist Cleared',
        message: language === 'sw' ? 'Vifaa vyote vimeondolewa kwenye Wishlist yako.' : 'All items removed from wishlist.'
      });
      onRefresh();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Hitilafu' : 'Error',
        message: err.message || 'Could not clear wishlist'
      });
    } finally {
      setIsClearing(false);
    }
  };

  const inStockCount = savedProducts.filter(item => item.product?.inStock !== false).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>{language === 'sw' ? 'Vifaa Ninavyovipenda (Wishlist)' : 'Saved Stationery (Wishlist)'}</span>
            </h2>
            {savedProducts.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                {savedProducts.length}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'sw'
              ? 'Vifaa na huduma za ofisi ulizozihifadhi kwenye akaunti yako ili kuziagiza kwa urahisi.'
              : 'Keep track of stationery and office essentials saved in your account to order anytime.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savedProducts.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleAddAllToCart}
                disabled={inStockCount === 0}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-xs min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                title={language === 'sw' ? 'Weka vifaa vyote vilivyopo stoo kwenye kikapu' : 'Add all in-stock items to cart'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? `Weka Zote Kikapuni (${inStockCount})` : `Add All to Cart (${inStockCount})`}</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                disabled={isClearing}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all min-h-[44px]"
                title={language === 'sw' ? 'Futa orodha yote ya vifaa vilivyohifadhiwa' : 'Clear all saved items'}
              >
                {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{language === 'sw' ? 'Safisha' : 'Clear'}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onNavigatePath('/shop')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all min-h-[44px]"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            <span>{language === 'sw' ? 'Angalia Duka Lote' : 'Browse Catalog'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Saved Products */}
      {savedProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'sw' ? 'Orodha Yako ya Wishlist Haina Kifaa Bado' : 'Your Wishlist is Empty'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              {language === 'sw'
                ? 'Gundua vitabu, kalamu, vifaa vya ofisi, mihuri na toner kisha bonyeza alama ya moyo kwenye kifaa chochote ili kukihifadhi hapa.'
                : 'Browse our stationery catalog and tap the heart icon on any product to save it securely to your account.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigatePath('/shop')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition-all active:scale-[0.98] min-h-[44px]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{language === 'sw' ? 'Tembelea Duka la Vifaa Sasa' : 'Shop Stationery Now'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedProducts.map(item => {
            const prod = item.product;
            if (!prod) return null;
            const targetPath = `/shop/product/${prod.slug || prod.id}`;

            return (
              <div
                key={item.id || item.productId}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300/80 dark:hover:border-amber-500/40 transition-all group"
              >
                {/* Image and quick actions */}
                <div
                  onClick={() => onNavigatePath(targetPath)}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 text-2xl">
                      TK
                    </div>
                  )}

                  {/* Stock tag */}
                  <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase shadow-2xs ${
                    prod.inStock
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {prod.inStock ? (language === 'sw' ? 'Ipo Dukani' : 'In Stock') : (language === 'sw' ? 'Imeisha' : 'Out of Stock')}
                  </span>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.productId);
                    }}
                    disabled={removingId === item.productId}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-xs transition-colors"
                    title={language === 'sw' ? 'Ondoa kwenye Wishlist' : 'Remove from Wishlist'}
                  >
                    {removingId === item.productId ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase text-amber-600 dark:text-amber-400">
                      {prod.category}
                    </span>
                    {prod.sku && <span className="text-slate-400 font-mono">SKU: {prod.sku}</span>}
                  </div>

                  <h4
                    onClick={() => onNavigatePath(targetPath)}
                    className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 mt-1 cursor-pointer hover:text-amber-600 transition-colors"
                  >
                    {prod.name}
                  </h4>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-950 dark:text-white">
                      {formatTSh(prod.price)}
                    </span>
                    {prod.originalPrice && prod.originalPrice > prod.price && (
                      <span className="text-[11px] text-slate-400 line-through">
                        {formatTSh(prod.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onNavigatePath(targetPath)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center shrink-0"
                    title={language === 'sw' ? 'Tazama Kifaa' : 'View Product'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <a
                    href={getProductWhatsAppUrl(prod.name, prod.price, prod.sku)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center shrink-0"
                    title={language === 'sw' ? 'Agiza WhatsApp' : 'Order on WhatsApp'}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    disabled={!prod.inStock}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50 text-xs font-bold transition-all min-h-[42px] shadow-2xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{language === 'sw' ? 'Kwenye Kikapu' : 'To Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
