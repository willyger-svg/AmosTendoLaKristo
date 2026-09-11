import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  LayoutDashboard
} from 'lucide-react';

interface AdminSectionPlaceholderProps {
  title: string;
  subtitle: string;
  sectionCode: string;
  scheduledPhase: string;
  summaryStats?: { label: string; value: string | number; change?: string }[];
  children?: React.ReactNode;
}

export const AdminSectionPlaceholder: React.FC<AdminSectionPlaceholderProps> = ({
  title,
  subtitle,
  sectionCode,
  scheduledPhase,
  summaryStats = [],
  children
}) => {
  const { language, t } = useTranslation();
  const { navigateTo } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#0F2942] text-white border border-slate-700 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              Architecture Active
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Module: <span className="font-mono text-amber-400">/admin/{sectionCode}</span>
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">{title}</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Release Stage</p>
            <p className="text-xs font-bold text-amber-400">{scheduledPhase}</p>
          </div>
          <button
            onClick={() => navigateTo('/admin')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t('admin.nav.dashboard')}</span>
          </button>
        </div>
      </div>

      {/* Summary Stats if provided */}
      {summaryStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {summaryStats.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
              {stat.change && (
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{stat.change}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom Section Content */}
      {children && <div>{children}</div>}

      {/* Roadmap & Capabilities Notice */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {language === 'sw' ? 'Ulinzi wa Idhini & Usalama wa Data' : 'Role Isolation & Data Integrity'}
          </p>
          <p className="mt-0.5">
            {language === 'sw'
              ? 'Idhini ya eneo hili inadhibitiwa kupitia Firebase Authentication na Kanuni za Usalama za Firestore. Wateja wa kawaida hawawezi kufikia au kusoma rekodi hizi.'
              : 'Access to this administrative section is strictly authenticated via Firebase Auth and Firestore Security Rules. Customer accounts are completely barred from accessing or modifying these collections.'}
          </p>
        </div>
      </div>
    </div>
  );
};
