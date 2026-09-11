import React from 'react';
import { useApp } from '../../../context/AppContext';
import { AdminSectionPlaceholder } from '../AdminSectionPlaceholder';
import { Briefcase, Printer, FileText, Globe, ArrowRight } from 'lucide-react';

export const AdminServicesCatalogView: React.FC = () => {
  const { serviceTickets, navigateTo } = useApp();

  const servicesList = [
    {
      id: 'print-binding',
      name: 'Document Printing & Finishing Wizard',
      category: 'Printing & Stationery',
      description: 'Black & white, color, spiral binding, lamination, and project report printing.',
      basePrice: '500 TZS / page',
      ticketCount: serviceTickets.filter(t => t.serviceType.toLowerCase().includes('print')).length
    },
    {
      id: 'nida',
      name: 'NIDA National ID Online Assistance',
      category: 'Government Portals',
      description: 'Application filling, tracking numbers, and lost document replacement submission.',
      basePrice: '3,000 TZS',
      ticketCount: serviceTickets.filter(t => t.serviceType.toLowerCase().includes('nida')).length
    },
    {
      id: 'tra-tin',
      name: 'TRA Taxpayer Identification Number (TIN)',
      category: 'Government Portals',
      description: 'Individual and business TIN certificate processing and filing guidance.',
      basePrice: '5,000 TZS',
      ticketCount: serviceTickets.filter(t => t.serviceType.toLowerCase().includes('tra') || t.serviceType.toLowerCase().includes('tin')).length
    },
    {
      id: 'rita',
      name: 'RITA e-Certificates (Birth / Death / Marriage)',
      category: 'Government Portals',
      description: 'e-RITA verification, expedited submission, and certificate collection assistance.',
      basePrice: '4,000 TZS',
      ticketCount: serviceTickets.filter(t => t.serviceType.toLowerCase().includes('rita')).length
    },
    {
      id: 'brela',
      name: 'BRELA Business Registration (ORS)',
      category: 'Corporate & Legal',
      description: 'Business name clearance, annual returns, and memorandum incorporation.',
      basePrice: '15,000 TZS',
      ticketCount: serviceTickets.filter(t => t.serviceType.toLowerCase().includes('brela')).length
    },
    {
      id: 'ajira',
      name: 'Ajira Portal (Public Service Recruitment Secretariat)',
      category: 'Government Portals',
      description: 'Profile setup, CV formatting, cert certification, and job vacancy application.',
      basePrice: '2,500 TZS',
      ticketCount: serviceTickets.filter(t => t.serviceType.toLowerCase().includes('ajira')).length
    }
  ];

  return (
    <AdminSectionPlaceholder
      title="Public Portals & IT Services Catalog"
      subtitle="Operational service directory, automated fee structures, and intake configurations."
      sectionCode="services"
      scheduledPhase="Phase 4B.8 (Dynamic Service Pricing & Custom Intake Forms)"
      summaryStats={[
        { label: 'Active Services Offered', value: servicesList.length },
        { label: 'Total Tickets Processed', value: serviceTickets.length },
        { label: 'Primary Intake Channel', value: 'Web & WhatsApp' },
        { label: 'Compliance Status', value: '100% Active' }
      ]}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {servicesList.map(srv => (
          <div
            key={srv.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{srv.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{srv.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Base Fee</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{srv.basePrice}</p>
              </div>

              <button
                onClick={() => navigateTo('/admin/service-requests')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>{srv.ticketCount} Tickets</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminSectionPlaceholder>
  );
};
