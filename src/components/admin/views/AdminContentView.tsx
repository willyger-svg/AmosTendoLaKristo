import React from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Layout,
  Megaphone,
  Layers,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const AdminContentView: React.FC = () => {
  const { advertisements, products, services, navigateTo } = useApp();

  const activeAds = advertisements.filter(a => a.isActive);

  const sections = [
    {
      title: 'Mabango ya Matangazo (Hero Banners)',
      description: 'Mabango yanayozunguka ukurasa wa mbele kuelezea ofa, huduma mpya, na bidhaa maalum.',
      status: `${activeAds.length} Mabango Yanayoonekana`,
      statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200',
      action: () => navigateTo('/admin/advertisements'),
      actionLabel: 'Dhibiti Mabango',
      icon: Megaphone,
      accent: 'text-amber-500'
    },
    {
      title: 'Vituo vya Huduma za Serikali & Mtandaoni',
      description: 'Huduma za NIDA, TRA TIN, RITA Vyeti, Ajira Portal, na BRELA zinazoonekana ukurasa wa mbele.',
      status: `${services.length} Huduma Zilizounganishwa`,
      statusColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200',
      action: () => navigateTo('/admin/services'),
      actionLabel: 'Dhibiti Huduma',
      icon: Layers,
      accent: 'text-blue-500'
    },
    {
      title: 'Katalogi ya Bidhaa Zinazoangaziwa (Storefront)',
      description: 'Bidhaa zote za duka zinazopangwa kwa bei, punguzo, na upatikanaji wa stoo.',
      status: `${products.length} Bidhaa Dukani`,
      statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200',
      action: () => navigateTo('/admin/products'),
      actionLabel: 'Dhibiti Bidhaa',
      icon: ShoppingBag,
      accent: 'text-emerald-500'
    },
    {
      title: 'Maombi ya Bei ya Jumla & Taasisi (B2B RFP)',
      description: 'Fomu na njia ya ofisi, shule, na makampuni kuomba nukuu za bei (Quotation).',
      status: 'Mfumo Upo Tayari',
      statusColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200',
      action: () => navigateTo('/admin/quotes'),
      actionLabel: 'Tazama Maombi',
      icon: FileText,
      accent: 'text-purple-500'
    },
    {
      title: 'Mipangilio ya Mawasiliano & Taarifa za Duka',
      description: 'Namba za WhatsApp, barua pepe, anwani ya Mbezi Beach, na maelezo ya kiutawala.',
      status: 'Taarifa Zimehakikiwa',
      statusColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      action: () => navigateTo('/admin/settings'),
      actionLabel: 'Fungua Mipangilio',
      icon: Sliders,
      accent: 'text-slate-500'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0F2942] to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              Usimamizi wa Maudhui
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Mabango, Sehemu za Tovuti & Matangazo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Maudhui ya Tovuti & Mabango ya Matangazo (CMS)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dhibiti jinsi wateja wanavyoona tovuti ya TK Stationery — badilisha mabango ya juu, panga bidhaa zinazoangaziwa, na hakiki taarifa za huduma mtandaoni.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-md flex items-center gap-2 active:scale-95"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Fungua Duka Kuu (Live Preview)</span>
          </button>
        </div>
      </div>

      {/* Content Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4 hover:border-amber-400/60 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${sec.accent}`} />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sec.statusColor}`}
                  >
                    {sec.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {sec.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <button
                  onClick={sec.action}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white dark:bg-slate-800 dark:hover:bg-amber-500 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>{sec.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
