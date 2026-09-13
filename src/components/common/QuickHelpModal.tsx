import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import {
  ShoppingBag,
  Printer,
  Camera,
  FileCheck2,
  Sparkles,
  Search,
  User,
  MessageCircle,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export const QuickHelpModal: React.FC = () => {
  const { activeModal, closeModal, navigateTo } = useApp();

  if (!activeModal || activeModal.type !== 'quick-help') {
    return null;
  }

  const options = [
    {
      id: 'stationery',
      icon: ShoppingBag,
      title: 'Nunua Vifaa vya Shule & Ofisi',
      description: 'Rimu za karatasi, madaftari, kalamu, mafaili, wino, rula na vifaa vya kompyuta.',
      tag: 'Duka la Vifaa',
      color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:border-amber-400 hover:bg-amber-100/50',
      iconBg: 'bg-amber-500 text-slate-950',
      action: () => {
        closeModal();
        navigateTo('/shop');
      }
    },
    {
      id: 'printing',
      icon: Printer,
      title: 'Chapisha au Nakili Nyaraka (Printing & Copying)',
      description: 'Uchapaji wa haraka wa Rangi au Nyeusi & Nyeupe, kuweka jalada (binding) na lamination.',
      tag: 'Huduma za Printi',
      color: 'bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:border-sky-400 hover:bg-sky-100/50',
      iconBg: 'bg-sky-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/printing');
      }
    },
    {
      id: 'photos',
      icon: Camera,
      title: 'Picha za Pasipoti na Visa',
      description: 'Picha rasmi zenye vigezo vya Uhamiaji na Balozi (35x45mm, 2x2 inchi) zilizochapishwa papo hapo.',
      tag: 'Picha za Haraka',
      color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 hover:bg-emerald-100/50',
      iconBg: 'bg-emerald-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/printing');
      }
    },
    {
      id: 'design',
      icon: Sparkles,
      title: 'Ubunifu wa Vipeperushi & Kadi',
      description: 'Flyers za matangazo, kadi za harusi na sherehe, business cards, vyeti, kalenda na mabango.',
      tag: 'Ubunifu wa Picha',
      color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:bg-purple-100/50',
      iconBg: 'bg-purple-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/printing');
      }
    },
    {
      id: 'gov-service',
      icon: FileCheck2,
      title: 'Huduma za Kiserikali (NIDA, TRA, Polisi, RITA)',
      description: 'Usaidizi wa kupata namba ya NIDA, TIN ya TRA, ripoti ya upotevu wa nyaraka ya Polisi, na vizazi RITA.',
      tag: 'Huduma Mtandaoni',
      color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:border-rose-400 hover:bg-rose-100/50',
      iconBg: 'bg-rose-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/online-services');
      }
    },
    {
      id: 'track-order',
      icon: Search,
      title: 'Fuatilia Oda au Maombi Yako',
      description: 'Ingiza namba ya oda yako kuangalia hatua ya uchapaji, ufungashaji, au maandalizi.',
      tag: 'Ufuatiliaji',
      color: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 hover:bg-indigo-100/50',
      iconBg: 'bg-indigo-600 text-white',
      action: () => {
        closeModal();
        navigateTo('/track-order');
      }
    },
    {
      id: 'account',
      icon: User,
      title: 'Akaunti Yangu ya Mteja',
      description: 'Tazama risiti zako, historia ya ununuzi, kazi za printi, na nyaraka zako zote mahali pamoja.',
      tag: 'Portal ya Mteja',
      color: 'bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-slate-400',
      iconBg: 'bg-slate-900 text-white',
      action: () => {
        closeModal();
        navigateTo('/account');
      }
    },
    {
      id: 'whatsapp-direct',
      icon: MessageCircle,
      title: 'Ongea Nasi Moja kwa Moja WhatsApp',
      description: 'Tuma nyaraka au maulizo haraka kwa huduma ya haraka kutoka kwa msimamizi wa duka.',
      tag: 'Msaada wa Papo Hapo',
      color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:border-emerald-500',
      iconBg: 'bg-emerald-600 text-white',
      action: () => {
        closeModal();
        window.open('https://wa.me/255787754202?text=Habari%20TK%20Stationery,%20nahitaji%20msaada%20wa%20huduma.', '_blank');
      }
    }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      title="Unahitaji Msaada Gani Leo?"
      size="xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Chagua huduma unayohitaji hapa chini, na tutakupeleka moja kwa moja sehemu sahihi:
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
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                      {opt.tag}
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {opt.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Unahitaji maelekezo zaidi?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              closeModal();
              navigateTo('/contact');
            }}
            className="font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
          >
            Wasiliana Nasi &rarr;
          </button>
        </div>
      </div>
    </Modal>
  );
};
