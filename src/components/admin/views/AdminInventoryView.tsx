import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../context/LanguageContext';
import { productService } from '../../../services/products/productService';
import { auditLogService } from '../../../services/audit/auditLogService';
import { AdminSectionPlaceholder } from '../AdminSectionPlaceholder';
import { Product } from '../../../types';
import { formatPrice } from '../../../utils/formatters';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  RefreshCw,
  Package
} from 'lucide-react';

export const AdminInventoryView: React.FC = () => {
  const { products, refreshData, showToast } = useApp();
  const { currentUser, userRole, userProfile } = useAuth();
  const { language } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const totalStockUnits = products.reduce((sum, p) => sum + (p.stockCount || 0), 0);
  const lowStockCount = products.filter(p => p.stockCount <= 5).length;
  const outOfStockCount = products.filter(p => p.stockCount === 0).length;

  const sortedProducts = [...products]
    .sort((a, b) => a.stockCount - b.stockCount)
    .filter(p => {
      const q = searchTerm.trim().toLowerCase();
      return !q || p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
    });

  const handleAdjustStock = async (product: Product, delta: number) => {
    const nextCount = Math.max(0, product.stockCount + delta);
    setUpdatingId(product.id);
    try {
      await productService.updateProduct(product.id, { stockCount: nextCount });
      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'inventory_adjusted',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: userProfile?.fullName || '',
          actorRole: userRole,
          targetType: 'product',
          targetId: product.id,
          targetTitle: product.name,
          details: { previousStock: product.stockCount, newStock: nextCount, delta }
        });
      }
      showToast({
        type: 'success',
        title: language === 'sw' ? 'Stoo Imesasishwa' : 'Stock Updated',
        message: `${product.name}: ${nextCount} units available.`
      });
      await refreshData();
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not adjust inventory.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminSectionPlaceholder
      title="Inventory & Warehouse Stock Control"
      subtitle="Real-time physical inventory monitoring, depletion alerts, and rapid restock adjustment."
      sectionCode="inventory"
      scheduledPhase="Phase 4B.4 (Batch Warehouse & Barcode Scanner)"
      summaryStats={[
        { label: 'Total Units in Stock', value: totalStockUnits.toLocaleString() },
        { label: 'Depleted (Out of Stock)', value: outOfStockCount, change: outOfStockCount > 0 ? 'Urgent Restock' : 'Zero Outages' },
        { label: 'Low Stock Alert (≤ 5)', value: lowStockCount },
        { label: 'Catalog SKU Count', value: products.length }
      ]}
    >
      <div className="space-y-4">
        {/* Search bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search product stock by title or SKU..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <p className="text-xs text-slate-400 hidden sm:block">
            Showing items sorted by lowest stock first
          </p>
        </div>

        {/* Stock Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">SKU & Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Health Status</th>
                  <th className="p-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</p>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{p.category}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{formatPrice(p.price)}</td>
                    <td className="p-4">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {p.stockCount}
                      </span>{' '}
                      <span className="text-slate-400 text-[11px]">units</span>
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
                        {p.stockCount === 0 ? 'Out of Stock' : p.stockCount <= 5 ? 'Low Stock' : 'Healthy'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={p.stockCount === 0 || updatingId === p.id}
                          onClick={() => handleAdjustStock(p, -1)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
                          title="Decrease 1 unit"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={updatingId === p.id}
                          onClick={() => handleAdjustStock(p, 5)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                          title="Add 5 units"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+5</span>
                        </button>
                        <button
                          disabled={updatingId === p.id}
                          onClick={() => handleAdjustStock(p, 20)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                          title="Add 20 units"
                        >
                          +20
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminSectionPlaceholder>
  );
};
