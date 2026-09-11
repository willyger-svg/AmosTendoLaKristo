import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SavedProduct } from '../../types';
import { formatTSh } from '../../utils/formatters';
import { savedProductsService } from '../../services/saved/savedProductsService';
import {
  Heart,
  ShoppingCart,
  Eye,
  Trash2,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Loader2
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

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    showToast({
      type: 'success',
      title: language === 'sw' ? 'Imeongezwa Kwenye Kikapu' : 'Added to Cart',
      message: `${product.name} ${language === 'sw' ? 'imeongezwa kwenye oda yako.' : 'has been added to your cart.'}`
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>{language === 'sw' ? 'Bidhaa Zilizohifadhiwa (Wishlist)' : 'Saved Stationery Products'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'sw'
              ? 'Vifaa ulivyoviweka akiba ili kuvinunua baadaye kwa urahisi.'
              : 'Keep track of office and school supplies you want to purchase later.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigatePath('/shop')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-bold transition-all min-h-[44px]"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{language === 'sw' ? 'Angalia Duka Lote' : 'Browse Catalog'}</span>
        </button>
      </div>

      {/* Grid of Saved Products */}
      {savedProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'sw' ? 'Huna Bidhaa Zilizohifadhiwa' : 'No saved products yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {language === 'sw'
                ? 'Tembelea duka letu na uhifadhi vifaa unavyopenda kwa kubofya alama ya moyo.'
                : 'Browse our stationery collection and click the heart icon on any product to save it here.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigatePath('/shop')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-xs transition-colors min-h-[44px]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{language === 'sw' ? 'Tembelea Duka la Vifaa' : 'Shop Stationery Now'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedProducts.map(item => {
            const prod = item.product;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group"
              >
                {/* Image and quick actions */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
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
                  <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                    prod.inStock
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-rose-500/90 text-white'
                  }`}>
                    {prod.inStock ? (language === 'sw' ? 'Ipo Dukani' : 'In Stock') : (language === 'sw' ? 'Imeisha' : 'Out of Stock')}
                  </span>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    disabled={removingId === item.productId}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-xs transition-colors"
                    title={language === 'sw' ? 'Ondoa' : 'Remove'}
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
                  <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                    {prod.category}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                    {prod.name}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {formatTSh(prod.price)}
                    </span>
                    {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                      <span className="text-[11px] text-slate-400 line-through">
                        {formatTSh(prod.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onNavigatePath(`/shop/product/${prod.id}`)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title={language === 'sw' ? 'Tazama Bidhaa' : 'View Product'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    disabled={!prod.inStock}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 disabled:opacity-50 text-xs font-bold transition-all min-h-[44px]"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{language === 'sw' ? 'Weka Kwenye Kikapu' : 'Add to Cart'}</span>
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
