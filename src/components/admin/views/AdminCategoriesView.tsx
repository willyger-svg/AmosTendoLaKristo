import React from 'react';
import { useApp } from '../../../context/AppContext';
import { AdminSectionPlaceholder } from '../AdminSectionPlaceholder';
import { ProductCategory } from '../../../types';
import { formatPrice } from '../../../utils/formatters';
import { FolderTree, Layers, Package, Tag, ArrowRight } from 'lucide-react';

export const AdminCategoriesView: React.FC = () => {
  const { products, navigateTo } = useApp();

  const standardCategories: ProductCategory[] = [
    'Paper & Printing',
    'Writing Materials',
    'Files & Folders',
    'School Supplies',
    'Office Supplies',
    'Computer Accessories',
    'Other Stationery'
  ];

  const categoryStats = standardCategories.map(cat => {
    const items = products.filter(p => p.category === cat);
    const totalStock = items.reduce((sum, p) => sum + (p.stockCount || 0), 0);
    const prices = items.map(p => p.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const pct = products.length ? Math.round((items.length / products.length) * 100) : 0;

    return {
      category: cat,
      count: items.length,
      totalStock,
      minPrice,
      maxPrice,
      percentage: pct
    };
  });

  return (
    <AdminSectionPlaceholder
      title="Product Categories & Classification Architecture"
      subtitle="Structured taxonomy of office supplies, paper reams, tech accessories, and educational materials."
      sectionCode="categories"
      scheduledPhase="Phase 4B.3 (Advanced Catalog Taxonomies)"
      summaryStats={[
        { label: 'Active Taxonomies', value: standardCategories.length },
        { label: 'Categorized Products', value: products.length },
        { label: 'Top Segment', value: categoryStats.sort((a, b) => b.count - a.count)[0]?.category || 'N/A' },
        { label: 'Taxonomy Status', value: 'Synced', change: '100% Assigned' }
      ]}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-500" />
              <span>Current Catalog Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Live item and inventory metrics by classification</p>
          </div>
          <button
            onClick={() => navigateTo('/admin/products')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Manage Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {categoryStats.map(stat => (
            <div
              key={stat.category}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{stat.category}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {stat.count} products ({stat.percentage}% of catalog) • {stat.totalStock} units in stock
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-center">
                <div className="text-right">
                  <p className="text-[11px] font-medium text-slate-400">Price Span</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatPrice(stat.minPrice)} – {formatPrice(stat.maxPrice)}
                  </p>
                </div>

                <button
                  onClick={() => navigateTo('/admin/products')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  View Items
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminSectionPlaceholder>
  );
};
