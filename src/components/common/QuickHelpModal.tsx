import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import {
  ShoppingBag,
  Printer,
  Camera,
  FileCheck2,
  Cpu,
  Globe,
  Smartphone,
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const QuickHelpModal: React.FC = () => {
  const { activeModal, closeModal, navigateTo, openModal } = useApp();

  if (!activeModal || activeModal.type !== 'quick-help') {
    return null;
  }

  const options = [
    {
      id: 'stationery',
      icon: ShoppingBag,
      title: 'Buy Stationery & Supplies',
      description: 'Paper reams, notebooks, pens, school kits, files, and computer accessories.',
      tag: 'Store Catalog',
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-100/50',
      iconBg: 'bg-amber-500 text-slate-950',
      action: () => {
        closeModal();
        navigateTo('/shop');
      }
    },
    {
      id: 'printing',
      icon: Printer,
      title: 'Print or Copy Documents',
      description: 'High-speed B&W or color laser printing, spiral binding, and document lamination.',
      tag: 'Print Services',
      color: 'bg-sky-50 text-sky-700 border-sky-200 hover:border-sky-400 hover:bg-sky-100/50',
      iconBg: 'bg-sky-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/printing');
      }
    },
    {
      id: 'photos',
      icon: Camera,
      title: 'Get Passport Photos',
      description: 'Official biometric passport & visa photos (35x45mm, 2x2 in) printed instantly in-store.',
      tag: 'In-Store Express',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/50',
      iconBg: 'bg-emerald-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/printing');
      }
    },
    {
      id: 'gov-service',
      icon: FileCheck2,
      title: 'Government Service Assistance',
      description: 'Guided portal help for NIDA numbers, TRA TIN/tax returns, Police loss reports, and RITA.',
      tag: 'Portal Guide',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400 hover:bg-purple-100/50',
      iconBg: 'bg-purple-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/online-services');
      }
    },
    {
      id: 'it-support',
      icon: Cpu,
      title: 'Fix a Computer or Printer',
      description: 'Windows OS re-installation, hardware upgrades, malware cleaning, and network setup.',
      tag: 'Tech Diagnostics',
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400 hover:bg-rose-100/50',
      iconBg: 'bg-rose-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/it-support');
      }
    },
    {
      id: 'website',
      icon: Globe,
      title: 'Build a Website',
      description: 'Modern, mobile-responsive company websites, landing pages, and online portals.',
      tag: 'Digital Web',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100/50',
      iconBg: 'bg-indigo-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/digital-solutions');
      }
    },
    {
      id: 'mobile-app',
      icon: Smartphone,
      title: 'Build a Mobile App',
      description: 'iOS and Android mobile apps for customer ordering, tracking, and company services.',
      tag: 'Mobile Engineering',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-100/50',
      iconBg: 'bg-blue-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/digital-solutions');
      }
    },
    {
      id: 'business-system',
      icon: Layers,
      title: 'Build a Business System (POS)',
      description: 'Custom point-of-sale, inventory stock tracking, and multi-branch sales monitoring systems.',
      tag: 'Enterprise POS',
      color: 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-100',
      iconBg: 'bg-slate-900 text-white',
      action: () => {
        closeModal();
        navigateTo('/digital-solutions');
      }
    }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="What Do You Need Help With Today?"
      size="xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Select what you are looking for below, and we will take you directly to the right service, catalog, or wizard.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={opt.action}
                className={`group flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer ${opt.color}`}
              >
                <div className={`p-2.5 rounded-lg shrink-0 ${opt.iconBg} shadow-xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {opt.tag}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {opt.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Need immediate personal assistance?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              closeModal();
              navigateTo('/contact');
            }}
            className="font-bold text-amber-600 hover:text-amber-700 underline"
          >
            Contact TK Support &rarr;
          </button>
        </div>
      </div>
    </Modal>
  );
};
