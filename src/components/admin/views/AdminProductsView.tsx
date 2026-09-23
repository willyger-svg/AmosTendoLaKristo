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
  Tag,
  ExternalLink,
  Globe,
  UploadCloud,
  Sparkles,
  Layers,
  Check,
  ImageOff
} from 'lucide-react';
import { TableSkeleton } from '../../common/Skeleton';
import { ImageUploadField, MultiImageUploadField } from '../../common/ImageUploadField';

export const AdminProductsView: React.FC = () => {
  const { products, refreshData, showToast, addProduct, updateProductInState, removeProductFromState, clearProductImage, isLoadingData, navigateTo } = useApp();
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
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
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
    setGalleryImages([]);
    setIsActive(true);
    setIsFeatured(false);
    setIsBestSeller(false);
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
    setShortDescription(p.shortDescription || p.description || '');
    setImageUrl(p.image || p.images?.[0] || '');
    setGalleryImages(p.galleryImages || (p.images && p.images.length > 1 ? p.images.slice(1) : []));
    setIsActive(p.isActive ?? true);
    setIsFeatured(p.isFeatured ?? p.featured ?? false);
    setIsBestSeller(p.isBestSeller ?? false);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!imageUrl && galleryImages.length === 0) {
      showToast({
        type: 'info',
        title: 'Picha Inahitajika',
        message: 'Tafadhali pakia picha ya bidhaa ili ionekane vizuri mtandaoni.'
      });
    }

    setIsSubmitting(true);
    try {
      const primaryImage = imageUrl.trim() || (galleryImages[0] || '');
      const allImages = primaryImage ? [primaryImage, ...galleryImages.filter(g => g !== primaryImage)] : [];

      const productPayload: any = {
        name: title.trim(),
        title: title.trim(),
        category,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        compareAtPrice: originalPrice ? Number(originalPrice) : undefined,
        stockCount: Number(stockCount),
        stockQuantity: Number(stockCount),
        inStock: Number(stockCount) > 0,
        sku,
        brand,
        shortDescription,
        description: shortDescription,
        image: primaryImage,
        images: allImages,
        galleryImages: galleryImages,
        isActive,
        isFeatured,
        featured: isFeatured,
        isBestSeller,
        unit: 'Piece'
      };

      if (editingProduct) {
        updateProductInState(editingProduct.id, productPayload);
        await productService.updateProduct(editingProduct.id, productPayload);
        try {
          await auditLogService.logAdminAction({
            action: 'product_updated',
            actorId: currentUser?.uid || userProfile?.id || 'admin_master',
            actorEmail: currentUser?.email || userProfile?.email || 'admin1010@tkstationery.co.tz',
            actorName: userProfile?.fullName || currentUser?.displayName || 'Msimamizi',
            actorRole: userRole,
            targetType: 'product',
            targetId: editingProduct.id,
            targetTitle: title,
            details: { price, stockCount, category, hasImage: !!primaryImage },
            severity: 'info',
            category: 'inventory'
          });
        } catch (auditErr) {
          console.warn('Audit log notice:', auditErr);
        }
        showToast({
          type: 'success',
          title: 'Bidhaa Imesasishwa',
          message: `${title} imesasishwa na picha yake imehifadhiwa mtandaoni.`
        });
      } else {
        const created = await productService.createProduct(productPayload);
        addProduct(created);
        try {
          await auditLogService.logAdminAction({
            action: 'product_created',
            actorId: currentUser?.uid || userProfile?.id || 'admin_master',
            actorEmail: currentUser?.email || userProfile?.email || 'admin1010@tkstationery.co.tz',
            actorName: userProfile?.fullName || currentUser?.displayName || 'Msimamizi',
            actorRole: userRole,
            targetType: 'product',
            targetId: created.id,
            targetTitle: title,
            details: { price, stockCount, category, hasImage: !!primaryImage },
            severity: 'info',
            category: 'inventory'
          });
        } catch (auditErr) {
          console.warn('Audit log notice:', auditErr);
        }
        showToast({
          type: 'success',
          title: 'Bidhaa Mpya Ipo Mtandaoni!',
          message: `${title} imepakiwa na kuwekwa mtandaoni tayari kwa mauzo.`
        });
      }

      await refreshData();
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Save product error:', err);
      showToast({
        type: 'error',
        title: 'Hitilafu',
        message: err?.message ? `Hitilafu: ${err.message}` : 'Imeshindwa kuhifadhi taarifa za bidhaa.'
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
      await auditLogService.logAdminAction({
        action: 'product_toggled',
        actorId: currentUser?.uid || userProfile?.id || 'admin_master',
        actorEmail: currentUser?.email || userProfile?.email || 'admin1010@tkstationery.co.tz',
        actorName: userProfile?.fullName || currentUser?.displayName || 'Msimamizi',
        actorRole: userRole,
        targetType: 'product',
        targetId: product.id,
        targetTitle: product.name || product.title || '',
        details: { isActive: nextActive },
        severity: 'info',
        category: 'inventory'
      });
      await refreshData();
    } catch {
      showToast({ type: 'error', title: 'Hitilafu', message: 'Imeshindwa kubadili hali ya bidhaa.' });
    }
  };

  const handleClearImage = async (product: Product) => {
    const prodName = product.name || product.title || 'Bidhaa hii';
    if (!window.confirm(`Je, una uhakika unataka kufuta kabisa picha ya "${prodName}" bila kuiondoa bidhaa nzima?`)) {
      return;
    }
    try {
      await clearProductImage(product.id);
      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'product_updated',
          actorId: currentUser?.uid || userProfile?.id || 'admin_master',
          actorEmail: currentUser?.email || userProfile?.email || 'admin1010@tkstationery.co.tz',
          actorName: userProfile?.fullName || currentUser?.displayName || 'Msimamizi',
          actorRole: userRole,
          targetType: 'product',
          targetId: product.id,
          targetTitle: prodName,
          details: { action: 'image_cleared' },
          severity: 'info',
          category: 'inventory'
        });
      }
      showToast({
        type: 'success',
        title: 'Picha Imefutwa',
        message: `Picha ya "${prodName}" imefutwa kabisa bila kurudi tena.`
      });
      await refreshData();
    } catch {
      showToast({ type: 'error', title: 'Hitilafu', message: 'Imeshindwa kufuta picha ya bidhaa.' });
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const prodName = product.name || product.title || 'Bidhaa hii';
    if (!window.confirm(`Je, una uhakika unataka kuiondoa bidhaa "${prodName}" moja kwa moja na kabisa kwenye duka (bila kurudi tena)?`)) {
      return;
    }
    try {
      removeProductFromState(product.id);
      await productService.deleteProduct(product.id);
      await auditLogService.logAdminAction({
        action: 'product_deleted',
        actorId: currentUser?.uid || userProfile?.id || 'admin_master',
        actorEmail: currentUser?.email || userProfile?.email || 'admin1010@tkstationery.co.tz',
        actorName: userProfile?.fullName || currentUser?.displayName || 'Msimamizi',
        actorRole: userRole,
        targetType: 'product',
        targetId: product.id,
        targetTitle: prodName,
        details: { id: product.id },
        severity: 'critical',
        category: 'inventory'
      });
      showToast({
        type: 'success',
        title: 'Bidhaa Imeondolewa Moja kwa Moja',
        message: `"${prodName}" imeondolewa kabisa bila kurudi tena.`
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
                {filteredProducts.map(p => {
                  const productImagesCount = (p.images?.length || 0) + (p.galleryImages?.length || 0);
                  const displayImage = p.image || p.images?.[0];
                  const onlineUrl = `/shop/product/${p.slug || p.id}`;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Image Box with multi-image indicator */}
                          <div className="relative w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs group">
                            {displayImage ? (
                              <img src={displayImage} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            {productImagesCount > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-slate-950/80 text-white text-[9px] font-black px-1 rounded">
                                +{productImagesCount - 1}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                                {p.name || p.title}
                              </p>
                              {p.isFeatured && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                  Maalum
                                </span>
                              )}
                              {p.isBestSeller && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                  Inauzwa Sana
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span>SKU: {p.sku || 'N/A'}</span>
                              <span>•</span>
                              <span>{p.brand || 'TK Stationery'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {p.category}
                      </td>
                      <td className="p-4">
                        <div className="font-black text-slate-900 dark:text-white">
                          {formatPrice(p.price)}
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatPrice(p.originalPrice)}
                          </div>
                        )}
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
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            p.isActive
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                          title="Bofya kubadili hali mtandaoni"
                        >
                          {p.isActive ? 'Mtandaoni (Live)' : 'Imezimwa (Draft)'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Online Store Button */}
                          <button
                            onClick={() => navigateTo(onlineUrl)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                            title="Tazama Bidhaa Hii Mtandaoni Dukani"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Hariri Bidhaa na Picha"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {Boolean(p.image || (p.images && p.images.length > 0)) && (
                            <button
                              onClick={() => handleClearImage(p)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                              title="Futa Picha ya Bidhaa Hii Moja kwa Moja"
                            >
                              <ImageOff className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Futa Bidhaa Moja kwa Moja"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

              {/* Primary Image Upload Field */}
              <ImageUploadField
                label="Picha Kuu ya Bidhaa (Kwa Ajili ya Kuuza Mtandaoni)"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                folder="products"
                itemId={editingProduct?.id || sku}
                helpText="Pakia picha ya bidhaa kutoka simu au kompyuta yako. Picha inaboreshwa na kuhifadhiwa mtandaoni tayari kwa wateja kuinunua."
                required
              />

              {/* Gallery Images Upload Field */}
              <MultiImageUploadField
                label="Picha za Ziada za Kifaa (Gallery)"
                values={galleryImages}
                onChange={(urls) => setGalleryImages(urls)}
                folder="products"
                itemId={editingProduct?.id || sku}
                maxImages={5}
                helpText="Unaweza kuongeza picha za pembe tofauti au maelezo ya ndani ya bidhaa."
              />

              {/* Visibility and Online Store Controls */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-500" />
                  <span>Hali ya Bidhaa Mtandaoni (Store Visibility)</span>
                </p>

                <div className="space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Weka Moja kwa Moja Mtandaoni (Active in Online Shop)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Bidhaa itaonekana mara moja kwenye duka na wateja wataweza kuiweka kwenye kikapu au kuagiza kwa WhatsApp.
                      </p>
                    </div>
                  </label>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Bidhaa Maalum (Featured)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBestSeller}
                        onChange={(e) => setIsBestSeller(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Inayopendwa (Best Seller)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maelezo Mafupi ya Bidhaa
                </label>
                <textarea
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  rows={2}
                  placeholder="Maelezo mafupi kuhusu kifaa hiki yatakayoonekana kwa mteja..."
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
