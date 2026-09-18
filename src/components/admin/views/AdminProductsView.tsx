import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { productService } from '../../../services/products/productService';
import { auditLogService } from '../../../services/audit/auditLogService';
import { Product, ProductCategory } from '../../../types';
import { formatPrice } from '../../../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  Boxes,
  Tag
} from 'lucide-react';
import { TableSkeleton } from '../../common/Skeleton';

export const AdminProductsView: React.FC = () => {
  const { products, refreshData, showToast, addProduct, updateProductInState, removeProductFromState, isLoadingData } = useApp();
  const { currentUser, userRole, userProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Paper & Printing');
  const [price, setPrice] = useState<number>(10000);
  const [originalPrice, setOriginalPrice] = useState<number>(12000);
  const [stockCount, setStockCount] = useState<number>(50);
  const [sku, setSku] = useState('TK-GEN-001');
  const [brand, setBrand] = useState('TK Stationery');
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: ProductCategory[] = [
    'Paper & Printing',
    'Writing Materials',
    'Files & Folders',
    'School Supplies',
    'Office Supplies',
    'Computer Accessories',
    'Other Stationery'
  ];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory('Paper & Printing');
    setPrice(10000);
    setOriginalPrice(12000);
    setStockCount(50);
    setSku(`TK-${Date.now().toString().slice(-6)}`);
    setBrand('TK Stationery');
    setShortDescription('');
    setImageUrl('https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.name || p.title || '');
    setCategory(p.category);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || p.price);
    setStockCount(p.stockCount);
    setSku(p.sku || '');
    setBrand(p.brand || 'TK Stationery');
    setShortDescription(p.shortDescription || '');
    setImageUrl(p.image || p.images?.[0] || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const productPayload: any = {
        name: title.trim(),
        title: title.trim(),
        category,
        price: Number(price),
        originalPrice: Number(originalPrice),
        stockCount: Number(stockCount),
        sku,
        brand,
        shortDescription,
        description: shortDescription,
        image: imageUrl,
        images: [imageUrl],
        isActive: true,
        unit: 'Piece'
      };

      if (editingProduct) {
        updateProductInState(editingProduct.id, productPayload);
        await productService.updateProduct(editingProduct.id, productPayload);
        if (currentUser) {
          await auditLogService.logAdminAction({
            action: 'product_updated',
            actorId: currentUser.uid,
            actorEmail: currentUser.email || '',
            actorName: userProfile?.fullName || '',
            actorRole: userRole,
            targetType: 'product',
            targetId: editingProduct.id,
            targetTitle: title,
            details: { price, stockCount, category }
          });
        }
        showToast({
          type: 'success',
          title: 'Bidhaa Imesasishwa',
          message: `${title} imesasishwa kwa mafanikio.`
        });
      } else {
        const created = await productService.createProduct(productPayload);
        addProduct(created);
        if (currentUser) {
          await auditLogService.logAdminAction({
            action: 'product_created',
            actorId: currentUser.uid,
            actorEmail: currentUser.email || '',
            actorName: userProfile?.fullName || '',
            actorRole: userRole,
            targetType: 'product',
            targetId: created.id,
            targetTitle: title,
            details: { price, stockCount, category }
          });
        }
        showToast({
          type: 'success',
          title: 'Bidhaa Mpya Imeongezwa',
          message: `${title} imeongezwa kwenye katalogi kwa ufanisi.`
        });
      }

      await refreshData();
      setIsAddModalOpen(false);
    } catch {
      showToast({
        type: 'error',
        title: 'Hitilafu',
        message: 'Imeshindwa kuhifadhi taarifa za bidhaa.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const nextActive = !product.isActive;
      updateProductInState(product.id, { isActive: nextActive });
      await productService.updateProduct(product.id, { isActive: nextActive });
      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'product_toggled',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: userProfile?.fullName || '',
          actorRole: userRole,
          targetType: 'product',
          targetId: product.id,
          targetTitle: product.name || product.title || '',
          details: { isActive: nextActive }
        });
      }
      await refreshData();
    } catch {
      showToast({ type: 'error', title: 'Hitilafu', message: 'Imeshindwa kubadili hali ya bidhaa.' });
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const prodName = product.name || product.title || 'Bidhaa hii';
    if (!window.confirm(`Je, una uhakika unataka kuiondoa bidhaa "${prodName}" kwenye duka?`)) {
      return;
    }
    try {
      removeProductFromState(product.id);
      await productService.deleteProduct(product.id);
      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'product_deleted',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: userProfile?.fullName || '',
          actorRole: userRole,
          targetType: 'product',
          targetId: product.id,
          targetTitle: prodName,
          details: { id: product.id }
        });
      }
      showToast({
        type: 'success',
        title: 'Bidhaa Imeondolewa',
        message: `"${prodName}" imeondolewa kwenye katalogi.`
      });
      await refreshData();
    } catch {
      showToast({ type: 'error', title: 'Hitilafu', message: 'Imeshindwa kuondoa bidhaa.' });
    }
  };

  const filteredProducts = products.filter(p => {
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const q = searchTerm.trim().toLowerCase();
    const pName = (p.name || p.title || '').toLowerCase();
    const matchSearch =
      !q ||
      pName.includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tafuta kwa jina, SKU au chapa..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Makundi Yote ({products.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c} ({products.filter(p => p.category === c).length})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ongeza Bidhaa Mpya</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoadingData && products.length === 0 ? (
          <TableSkeleton rows={6} columns={6} />
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">Hakuna bidhaa inayolingana na utafutaji wako</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Taarifa ya Bidhaa</th>
                  <th className="p-4">Kundi</th>
                  <th className="p-4">Bei</th>
                  <th className="p-4">Idadi Stoo</th>
                  <th className="p-4">Hali</th>
                  <th className="p-4 text-right">Vitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                            {p.name || p.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {p.category}
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(p.price)}
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
                        {p.stockCount} zipo
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {p.isActive ? 'Inatumika' : 'Imezimwa'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Hariri Bidhaa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Futa Bidhaa"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
              {editingProduct ? 'Hariri Bidhaa ya Katalogi' : 'Ongeza Bidhaa Mpya ya Vifaa'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jina la Bidhaa *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="mf. Ream ya Karatasi A4 80gsm (Box ya 5)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kundi la Bidhaa *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ProductCategory)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Namba ya SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bei ya Kuuza (TZS) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bei ya Awali (TZS)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={e => setOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Idadi ya Bidhaa Stoo *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stockCount}
                    onChange={e => setStockCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kiungo cha Picha (URL)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maelezo Mafupi
                </label>
                <textarea
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  {isSubmitting ? 'Inahifadhi...' : editingProduct ? 'Sasisha Bidhaa' : 'Unda Bidhaa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
