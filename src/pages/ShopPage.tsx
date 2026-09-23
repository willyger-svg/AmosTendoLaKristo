import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { ProductCard } from '../components/shop/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import {
  ProductFilterSidebar,
  FilterState
} from '../components/shop/ProductFilterSidebar';
import { ProductCategory } from '../types';
import { Search, Filter, SlidersHorizontal, Package, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';

export const ShopPage: React.FC = () => {
  const { searchQuery, setSearchQuery, products, advertisements, trackAdClick, navigateTo, isLoadingData } = useApp();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Top banner advertisement if configured
  const shopTopAd = useMemo(() => {
    return (advertisements || []).find(a => a.isActive && (a.placement === 'shop_top' || a.placement === 'hero_banner'));
  }, [advertisements]);

  // Initialize filters
  const [filters, setFilters] = useState<FilterState>({
    category: 'All Categories',
    minPrice: 0,
    maxPrice: 200000,
    inStockOnly: false,
    sortBy: 'featured'
  });

  // Check URL query parameters for category
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) {
      setFilters(prev => ({ ...prev, category: cat as ProductCategory }));
    }
  }, []);

  const resetFilters = () => {
    setFilters({
      category: 'All Categories',
      minPrice: 0,
      maxPrice: 200000,
      inStockOnly: false,
      sortBy: 'featured'
    });
    setSearchQuery('');
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const activeProducts = products.filter(p => p.isActive !== false);
    return activeProducts.filter(p => {
      // Category filter
      if (filters.category !== 'All Categories' && p.category !== filters.category) {
        return false;
      }
      // Stock filter
      if (filters.inStockOnly && !p.inStock) {
        return false;
      }
      // Price filter
      if (p.price < filters.minPrice || p.price > filters.maxPrice) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchTag = p.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchCat && !matchTag) return false;
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // featured default
    });
  }, [filters, searchQuery, products]);

  return (
    <div className="py-8 space-y-6">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: 'Duka la Vifaa', path: '/shop' },
            ...(filters.category !== 'All Categories'
              ? [{ label: filters.category }]
              : [])
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Duka la Vifaa vya Ofisi na Shule
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kalamu asilia, madaftari, ream za karatasi, mafaili, vifaa vya shule na vifaa vya kompyuta Dar es Salaam.
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileFilterOpen(true)}
              icon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Vichujio ({filteredProducts.length})
            </Button>
          </div>
        </div>

        {/* Shop Promotional Banner uploaded by Admin */}
        {shopTopAd && (
          <div
            onClick={() => {
              trackAdClick(shopTopAd.id);
              if (shopTopAd.targetUrl) navigateTo(shopTopAd.targetUrl);
            }}
            className="my-5 rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-400/40 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:border-amber-400 transition-all shadow-xs"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              {shopTopAd.imageUrl && (
                <img
                  src={shopTopAd.imageUrl}
                  alt={shopTopAd.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-amber-300/40 shrink-0 shadow-xs"
                />
              )}
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  {shopTopAd.badgeText || 'OFA DUKANI'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  {shopTopAd.title}
                </h3>
                {shopTopAd.subtitle && (
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                    {shopTopAd.subtitle}
                  </p>
                )}
              </div>
            </div>

            <span className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-bold shrink-0 hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs">
              {shopTopAd.buttonText || 'Tazama Ofa'}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <ProductFilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetFilters}
                totalResults={filteredProducts.length}
              />
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
              <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
                onClick={() => setIsMobileFilterOpen(false)}
              />
              <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-4 overflow-y-auto z-10">
                <ProductFilterSidebar
                  filters={filters}
                  onFilterChange={f => {
                    setFilters(f);
                    setIsMobileFilterOpen(false);
                  }}
                  onReset={resetFilters}
                  totalResults={filteredProducts.length}
                  isMobileDrawer={true}
                  onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Category Chips */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
              <span className="text-xs font-bold text-slate-600">
                Inaonyesha vifaa {filteredProducts.length} kati ya {products.length}
              </span>

              {searchQuery && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs text-amber-900">
                  <span>Utafutaji: "{searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="font-bold hover:text-amber-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Grid */}
            {isLoadingData && products.length === 0 ? (
              <ProductGridSkeleton count={6} columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Hakuna kifaa kilichopatikana kwa vigezo hivi
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Jaribu kubadili maneno ya utafutaji au weka upya vichujio ili kuona vifaa vyote vya duka.
                </p>
                <Button variant="primary" size="sm" onClick={resetFilters}>
                  Weka Upya Vichujio Vyote
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
