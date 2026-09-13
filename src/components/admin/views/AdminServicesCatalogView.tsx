import React from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Briefcase,
  Printer,
  FileText,
  Globe,
  ArrowRight,
  ShieldCheck,
  Building,
  UserCheck,
  FileBadge,
  Sparkles,
  Layers,
  PhoneCall
} from 'lucide-react';

export const AdminServicesCatalogView: React.FC = () => {
  const { serviceTickets, navigateTo } = useApp();

  const servicesList = [
    {
      id: 'print-binding',
      name: 'Uchapishaji Nyaraka & Kufunga Vitabu (Printing & Binding)',
      category: 'Uchapishaji & Vifaa',
      description: 'Kuchapa rangi na nyeusi/nyeupe, spiral binding, hardcover, lamination, na machapisho ya ripoti za miradi na shule.',
      basePrice: 'Kuanzia Tsh 500 / ukurasa',
      ticketCount: serviceTickets.filter(t => t.serviceType?.toLowerCase().includes('print')).length,
      icon: Printer,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    },
    {
      id: 'nida',
      name: 'NIDA - Msaada wa Namba & Vitambulisho vya Taifa',
      category: 'Huduma za Serikali Mtandaoni',
      description: 'Kujaza fomu za maombi, ufuatiliaji wa namba ya NIDA mtandaoni, na msaada wa kupata barua au nakala ya kitambulisho kilichopotea.',
      basePrice: 'Tsh 3,000',
      ticketCount: serviceTickets.filter(t => t.serviceType?.toLowerCase().includes('nida')).length,
      icon: UserCheck,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'tra-tin',
      name: 'TRA - Namba ya Utambulisho wa Mlipa Kodi (TIN)',
      category: 'Huduma za Serikali Mtandaoni',
      description: 'Usajili wa TIN ya biashara na binafsi, kuwasilisha ritani, na maombi ya uhakiki wa cheti cha TIN mtandaoni.',
      basePrice: 'Tsh 5,000',
      ticketCount: serviceTickets.filter(t => t.serviceType?.toLowerCase().includes('tra') || t.serviceType?.toLowerCase().includes('tin')).length,
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'rita',
      name: 'RITA - Vyeti vya Kuzaliwa, Vifo na Ndoa Mtandaoni',
      category: 'Huduma za Serikali Mtandaoni',
      description: 'Usajili na uhakiki wa e-RITA, kupakia nyaraka za hospitali au vijiji, na ufuatiliaji wa cheti rasmi cha kuzaliwa.',
      basePrice: 'Tsh 4,000',
      ticketCount: serviceTickets.filter(t => t.serviceType?.toLowerCase().includes('rita')).length,
      icon: FileBadge,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    },
    {
      id: 'brela',
      name: 'BRELA - Usajili wa Kampuni na Majina ya Biashara (ORS)',
      category: 'Huduma za Biashara & Sheria',
      description: 'Upekuzi wa jina la biashara (name search), kuandaa fomu za usajili, na uwasilishaji kwenye mfumo wa ORS BRELA.',
      basePrice: 'Tsh 15,000',
      ticketCount: serviceTickets.filter(t => t.serviceType?.toLowerCase().includes('brela')).length,
      icon: Building,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'ajira',
      name: 'Ajira Portal (Sekretarieti ya Ajira Katika Utumishi wa Umma)',
      category: 'Ajira & Wasifu',
      description: 'Kufungua wasifu wa Ajira Portal, kuunganisha vyeti vya NECTA/NACTE, kuweka CV, na kutuma maombi ya nafasi za kazi serikalini.',
      basePrice: 'Tsh 3,000',
      ticketCount: serviceTickets.filter(t => t.serviceType?.toLowerCase().includes('ajira')).length,
      icon: Briefcase,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    }
  ];

  const totalTickets = serviceTickets.length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0F2942] to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              Katalogi ya Huduma
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Uchapishaji & Vituo vya Serikali Mtandaoni
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Huduma za Mtandaoni & Uchapishaji (Services Catalog)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Muhtasari wa huduma zote zinazotolewa na TK Stationery ikiwemo vituo rasmi vya serikali (NIDA, TRA, RITA, BRELA, Ajira) pamoja na uchapishaji wa nyaraka.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/admin/service-requests')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <Briefcase className="w-4 h-4" />
            <span>Tazama Maombi Yote ({totalTickets})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Huduma Zinazotolewa</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
            {servicesList.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Zipo hai mtandaoni</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jumla ya Tiketi</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">
            {totalTickets}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Maombi yaliyowekwa na wateja</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Njia Kuu ya Mapokezi</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-base font-black mt-2 text-emerald-600 dark:text-emerald-400">
            Tovuti & WhatsApp
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Huduma ya moja kwa moja</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hali ya Mfumo</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-base font-black mt-2 text-amber-600 dark:text-amber-400">
            100% Inafanya Kazi
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Salama na imethibitishwa</p>
        </div>
      </div>

      {/* Services List Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Orodha ya Huduma & Viwango vya Gharama</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Gharama elekezi na idadi ya maombi ya wateja kwa kila huduma
            </p>
          </div>
          <button
            onClick={() => navigateTo('/admin/service-requests')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Tazama Maombi Yote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {servicesList.map(srv => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 ${srv.iconBg}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {srv.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                      {srv.description}
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {srv.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Gharama Elekezi</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                      {srv.basePrice}
                    </p>
                  </div>

                  <button
                    onClick={() => navigateTo('/admin/service-requests')}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white dark:bg-slate-800 dark:hover:bg-amber-500 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>Tiketi ({srv.ticketCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
