import React from 'react';
import { useApp } from '../../../context/AppContext';
import { AdminSectionPlaceholder } from '../AdminSectionPlaceholder';
import { Layout, Megaphone, Layers, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AdminContentView: React.FC = () => {
  const { advertisements, navigateTo } = useApp();

  const activeAdsCount = advertisements.filter(a => a.isActive).length;

  const sections = [
    {
      name: 'Hero Carousel & Dynamic Announcements',
      status: 'Live & Connected',
      details: `${activeAdsCount} active promotional slides configured`,
      action: () => navigateTo('/admin/advertisements'),
      actionLabel: 'Edit Banners'
    },
    {
      name: 'Specialized Service Portals Showcase',
      status: 'Live',
      details: 'Fast access to Printing Wizard & Public Government Portals (TRA, NIDA, RITA)',
      action: () => navigateTo('/admin/services'),
      actionLabel: 'View Services'
    },
    {
      name: 'Top Selling Products & Featured Grid',
      status: 'Live & Synchronized',
      details: 'Dynamic catalog feed driven by Firestore collection',
      action: () => navigateTo('/admin/products'),
      actionLabel: 'Manage Items'
    },
    {
      name: 'Enterprise & School Supplies Callout',
      status: 'Active',
      details: 'Institutional bulk procurement and quote estimation portal',
      action: () => navigateTo('/admin/quotes'),
      actionLabel: 'View RFP Leads'
    }
  ];

  return (
    <AdminSectionPlaceholder
      title="Homepage Content & CMS Architecture"
      subtitle="Modular section visibility, marketing banners, and visual merchandising controls."
      sectionCode="content"
      scheduledPhase="Phase 4B.7 (Drag & Drop Homepage Layout Editor)"
      summaryStats={[
        { label: 'Homepage Sections', value: '4 Modules' },
        { label: 'Active Promotional Banners', value: activeAdsCount },
        { label: 'CMS Architecture', value: 'Decoupled', change: 'Zero Downtime Edits' },
        { label: 'Sync Status', value: 'Live Storefront' }
      ]}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {sections.map((sec, idx) => (
          <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold flex-shrink-0">
                <Layout className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sec.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{sec.details}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {sec.status}
              </span>
              <button
                onClick={sec.action}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>{sec.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminSectionPlaceholder>
  );
};
