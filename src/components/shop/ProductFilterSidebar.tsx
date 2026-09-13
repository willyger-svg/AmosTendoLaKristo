import React from 'react';
import { ProductCategory, productCategories } from '../../types';
import { Filter, X, Check } from 'lucide-react';
import { Button } from '../common/Button';

export interface FilterState {
  category: ProductCategory;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
}

export interface ProductFilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
  isMobileDrawer = false,
  onCloseMobileDrawer
}) => {
  const handleCategorySelect = (cat: ProductCategory) => {
    onFilterChange({ ...filters, category: cat });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as any });
  };

  const handleStockToggle = () => {
    onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>Vichujio ({totalResults})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold hover:underline"
          >
            Weka Upya
          </button>
          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Sort Option */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Panga Vifaa Kwa
        </label>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
        >
          <option value="featured">Vilivyoangaziwa & Pendekezo</option>
          <option value="price-asc">Bei: Ndogo hadi Kubwa (TSh)</option>
          <option value="price-desc">Bei: Kubwa hadi Ndogo (TSh)</option>
          <option value="rating">Vilivyopendwa Zaidi</option>
        </select>
      </div>

      {/* Categories Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          Makundi ya Vifaa
        </label>
        <div className="space-y-1">
          {productCategories.map(cat => {
            const isSelected = filters.category === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          Upatikanaji
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={handleStockToggle}
            className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
          />
          <span>Onyesha Vifaa Vilivyopo Dukani Tu</span>
        </label>
      </div>

      {/* Direct WhatsApp Bulk Ordering Note */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
        <p className="font-bold text-slate-900">Unahitaji Vifaa kwa Jumla au Ofisi?</p>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Tunatoa bei nafuu ya jumla kwa maboksi ya karatasi za ream, kalamu, na vifaa maalum vya shule na ofisi.
        </p>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => window.open('https://wa.me/255787754202?text=Habari%20TK%20Stationery,%20nahitaji%20nukuu%20ya%20vifaa%20vya%20jumla.', '_blank')}
        >
          Ulizia Bei ya Jumla (WhatsApp)
        </Button>
      </div>
    </div>
  );
};
