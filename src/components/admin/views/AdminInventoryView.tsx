import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { productService } from '../../../services/products/productService';
import { auditLogService } from '../../../services/audit/auditLogService';
import { Product } from '../../../types';
import { formatPrice } from '../../../utils/formatters';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Package,
  PlusCircle,
  TrendingDown,
  RefreshCw,
  SlidersHorizontal,
  Edit,
  Download
} from 'lucide-react';
import { KpiGridSkeleton, TableSkeleton } from '../../common/Skeleton';
import { salesExportService } from '../../../services/export/salesExportService';

export const AdminInventoryView: React.FC = () => {
  const { products, refreshData, showToast, navigateTo, isLoadingData } = useApp();
  const { currentUser, userRole, userProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'out_of_stock' | 'low_stock' | 'healthy'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const totalStockUnits = products.reduce((sum, p) => sum + (p.stockCount || 0), 0);
  const lowStockProducts = products.filter(p => p.stockCount > 0 && p.stockCount <= 5);
  const outOfStockProducts = products.filter(p => p.stockCount === 0);
  const healthyStockProducts = products.filter(p => p.stockCount > 5);

  const totalStockValue = products.reduce((sum, p) => sum + (p.price * (p.stockCount || 0)), 0);

  const filteredProducts = products
    .filter(p => {
      if (filterMode === 'out_of_stock') return p.stockCount === 0;
      if (filterMode === 'low_stock') return p.stockCount > 0 && p.stockCount <= 5;
      if (filterMode === 'healthy') return p.stockCount > 5;
      return true;
    })
    .filter(p => {
      const q = searchTerm.trim().toLowerCase();
      return (
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.stockCount - b.stockCount);

  const handleAdjustStock = async (product: Product, delta: number) => {
    const nextCount = Math.max(0, (product.stockCount || 0) + delta);
    setUpdatingId(product.id);
    try {
      await productService.updateProduct(product.id, { stockCount: nextCount });
      await auditLogService.logAdminAction({
        action: 'inventory_adjusted',
        actorId: currentUser?.uid || userProfile?.id || 'admin_master',
        actorEmail: currentUser?.email || userProfile?.email || 'admin1010@tkstationery.co.tz',
        actorName: userProfile?.fullName || currentUser?.displayName || 'Msimamizi',
        actorRole: userRole,
        targetType: 'product',
        targetId: product.id,
        targetTitle: product.title,
        details: { previousStock: product.stockCount, newStock: nextCount, delta },
        severity: 'warning',
        category: 'inventory'
      });
      showToast({
        type: 'success',
        title: 'Stoo Imesasishwa',
        message: `${product.title}: zimebaki ${nextCount} stoo.`
      });
      await refreshData();
    } catch {
      showToast({ type: 'error', title: 'Hitilafu', message: 'Imeshindwa kurekebisha idadi ya stoo.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0F2942] to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              Udhibiti wa Stoo
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Hesabu na Upatikanaji wa Bidhaa Dukani
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Hesabu ya Vitu & Bidhaa Zilizopo Stoo
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Fuatilia idadi ya vifaa vilivyopo stoo kwa wakati halisi, ongeza idadi ya vitu vipya vilivyoingia, na tambua bidhaa zinazokaribia kuisha.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigateTo('/admin/products')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ongeza Bidhaa Mpya</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoadingData && products.length === 0 ? (
        <KpiGridSkeleton count={4} />
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterMode('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterMode === 'all'
              ? 'bg-slate-900 text-white border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jumla ya Vitu Stoo</span>
            <Boxes className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
            {totalStockUnits.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Aina {products.length} za bidhaa</p>
        </div>

        <div
          onClick={() => setFilterMode('out_of_stock')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterMode === 'out_of_stock'
              ? 'bg-rose-950/40 border-rose-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Zilizokwisha Kabisa</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-rose-600 dark:text-rose-400">
            {outOfStockProducts.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Zinahitaji kuagizwa haraka</p>
        </div>

        <div
          onClick={() => setFilterMode('low_stock')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterMode === 'low_stock'
              ? 'bg-amber-950/40 border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Uhaba wa Stoo (≤ 5)</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">
            {lowStockProducts.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Zinaelekea kuisha</p>
        </div>

        <div
          onClick={() => setFilterMode('healthy')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterMode === 'healthy'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Thamani ya Stoo</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-black mt-2 text-emerald-600 dark:text-emerald-400 truncate">
            {formatPrice(totalStockValue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{healthyStockProducts.length} zipo salama</p>
        </div>
      </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tafuta bidhaa kwa jina, SKU au kundi..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Zote ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('out_of_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterMode === 'out_of_stock'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            Zilizokwisha ({outOfStockProducts.length})
          </button>
          <button
            onClick={() => setFilterMode('low_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterMode === 'low_stock'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Uhaba (≤ 5) ({lowStockProducts.length})
          </button>
          <button
            onClick={() => setFilterMode('healthy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterMode === 'healthy'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Zilizo Salama ({healthyStockProducts.length})
          </button>

          <button
            type="button"
            onClick={() => {
              salesExportService.exportInventoryToCsv(filteredProducts);
              showToast({
                type: 'success',
                title: 'Stoo Imepakuliwa',
                message: `Orodha ya bidhaa (${filteredProducts.length}) imepakuliwa kwenye CSV.`
              });
            }}
            disabled={filteredProducts.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
            title="Pakua jedwali la hesabu za stoo kwenye faili la Excel/CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pakua Orodha ({filteredProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoadingData && products.length === 0 ? (
          <TableSkeleton rows={6} columns={6} />
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">Hakuna bidhaa inayolingana na vigezo vya utafutaji.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">SKU & Jina la Bidhaa</th>
                  <th className="p-4">Kundi</th>
                  <th className="p-4">Bei ya Kipande</th>
                  <th className="p-4">Zilizopo Stoo</th>
                  <th className="p-4">Hali ya Stoo</th>
                  <th className="p-4 text-right">Ongeza Haraka Stoo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=120&q=80'}
                          alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{formatPrice(p.price)}</td>
                    <td className="p-4">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {p.stockCount}
                      </span>{' '}
                      <span className="text-slate-400 text-[11px]">zipo</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stockCount === 0
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'
                            : p.stockCount <= 5
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {p.stockCount === 0 ? 'Imeisha Kabisa' : p.stockCount <= 5 ? 'Uhaba Mkubwa' : 'Ipo Salama'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={p.stockCount === 0 || updatingId === p.id}
                          onClick={() => handleAdjustStock(p, -1)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
                          title="Punguza 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={updatingId === p.id}
                          onClick={() => handleAdjustStock(p, 1)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                          title="Ongeza 1"
                        >
                          +1
                        </button>
                        <button
                          disabled={updatingId === p.id}
                          onClick={() => handleAdjustStock(p, 5)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                          title="Ongeza 5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+5</span>
                        </button>
                        <button
                          disabled={updatingId === p.id}
                          onClick={() => handleAdjustStock(p, 20)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                          title="Ongeza 20"
                        >
                          +20
                        </button>
                        <button
                          onClick={() => navigateTo(`/admin/products?edit=${p.id}`)}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors ml-1"
                          title="Hariri taarifa zote za bidhaa hii"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
