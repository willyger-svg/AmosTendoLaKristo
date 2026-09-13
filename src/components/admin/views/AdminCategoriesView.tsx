import React from 'react';
import { useApp } from '../../../context/AppContext';
import { ProductCategory } from '../../../types';
import { formatPrice } from '../../../utils/formatters';
import {
  FolderTree,
  Tag,
  ArrowRight,
  Package,
  Layers,
  PlusCircle,
  TrendingUp,
  Boxes
} from 'lucide-react';

interface CategoryMetadata {
  key: ProductCategory;
  labelSwahili: string;
  description: string;
  iconBg: string;
}

const CATEGORY_META: CategoryMetadata[] = [
  {
    key: 'Paper & Printing',
    labelSwahili: 'Karatasi & Vifaa vya Uchapishaji',
    description: 'Ream za A4, A3, karatasi za picha, bahasha, na vifaa vya kuchapisha.',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
  },
  {
    key: 'Writing Materials',
    labelSwahili: 'Vifaa vya Kuandikia & Kalamu',
    description: 'Kalamu za wino, gel pens, marker za ubao, highlighter, na penseli za ubora.',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  },
  {
    key: 'Files & Folders',
    labelSwahili: 'Faili, Folda & Vihifadhi Nyaraka',
    description: 'Box files, spring files, flat files, na mifuko ya plastiki ya kuhifadhia kumbukumbu.',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  },
  {
    key: 'Office Supplies',
    labelSwahili: 'Vifaa vya Ofisi & Madawati',
    description: 'Staplers, pini za stapler, perforators, gundi, mikasi, mkanda wa gundi, na kalkuleta.',
    iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  },
  {
    key: 'School Supplies',
    labelSwahili: 'Vifaa vya Shule & Wanafunzi',
    description: 'Daftari, madaftari ya ripoti, seti za hisabati (geometry set), na rula.',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
  },
  {
    key: 'Computer Accessories',
    labelSwahili: 'Vifaa vya Kompyuta & Teknolojia',
    description: 'Flash drives, wireless mouse, keyboards, nyaya za HDMI, toner, na cartridges za mashine.',
    iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
  },
  {
    key: 'Other Stationery',
    labelSwahili: 'Vifaa Vinginevyo vya Stationery',
    description: 'Vifaa mbalimbali na mahitaji maalum ya maduka na ofisi.',
    iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
  }
];

export const AdminCategoriesView: React.FC = () => {
  const { products, navigateTo } = useApp();

  const totalStockUnits = products.reduce((sum, p) => sum + (p.stockCount || 0), 0);
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * (p.stockCount || 0)), 0);

  const categoryStats = CATEGORY_META.map(meta => {
    const items = products.filter(p => p.category === meta.key);
    const totalStock = items.reduce((sum, p) => sum + (p.stockCount || 0), 0);
    const stockVal = items.reduce((sum, p) => sum + (p.price * (p.stockCount || 0)), 0);
    const prices = items.map(p => p.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const pct = products.length ? Math.round((items.length / products.length) * 100) : 0;

    return {
      ...meta,
      count: items.length,
      totalStock,
      stockValue: stockVal,
      minPrice,
      maxPrice,
      percentage: pct
    };
  });

  const topCategory = [...categoryStats].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0F2942] to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              Makundi ya Bidhaa
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Muundo & Uainishaji wa Katalogi
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Makundi ya Bidhaa & Usimamizi wa Idara
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Panga na ufuatilie bidhaa zote kulingana na makundi ya ofisi, shule, uchapishaji, na vifaa vya kompyuta ili kurahisisha wateja kupata wanachohitaji kwa urahisi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/admin/products')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ongeza Bidhaa Kwenye Kundi</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jumla ya Makundi</span>
            <FolderTree className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
            {CATEGORY_META.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Makundi rasmi ya duka</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Bidhaa Zilizopangwa</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">
            {products.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">100% ziko kwenye makundi</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Kundi Linaloongoza</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-base font-black mt-2 text-emerald-600 dark:text-emerald-400 truncate">
            {topCategory?.labelSwahili.split('&')[0] || 'Ofisi'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{topCategory?.count || 0} bidhaa tofauti</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Vitu Vyote Stoo</span>
            <Boxes className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black mt-2 text-amber-600 dark:text-amber-400 truncate">
            {totalStockUnits.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{formatPrice(totalStockValue)} thamani</p>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-500" />
              <span>Orodha Kamili ya Makundi ya Bidhaa</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tazama idadi ya bidhaa, zilizopo stoo, na masafa ya bei kwa kila kundi
            </p>
          </div>
          <button
            onClick={() => navigateTo('/admin/products')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Dhibiti Bidhaa Zote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {categoryStats.map(stat => (
            <div
              key={stat.key}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 ${stat.iconBg}`}
                >
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {stat.labelSwahili}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {stat.key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    {stat.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-400">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {stat.count} {stat.count === 1 ? 'bidhaa' : 'bidhaa'}
                    </span>
                    <span>•</span>
                    <span>{stat.totalStock.toLocaleString()} vitu stoo</span>
                    <span>•</span>
                    <span>Inachukua {stat.percentage}% ya duka</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-center">
                {stat.count > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Masafa ya Bei</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                      {formatPrice(stat.minPrice)} – {formatPrice(stat.maxPrice)}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigateTo('/admin/products')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Tazama Bidhaa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
