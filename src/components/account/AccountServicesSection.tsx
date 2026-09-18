import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ServiceTicket } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  FileCheck,
  Search,
  Plus,
  Eye,
  X,
  ExternalLink,
  MessageSquare,
  Printer,
  Globe,
  Cpu,
  Palette,
  Clock,
  UserCheck,
  ShoppingBag
} from 'lucide-react';

export interface AccountServicesSectionProps {
  tickets?: ServiceTicket[];
  serviceTickets?: ServiceTicket[];
  whatsappNumber?: string;
  onNavigatePath?: (path: string) => void;
}

export const AccountServicesSection: React.FC<AccountServicesSectionProps> = ({
  tickets,
  serviceTickets,
  whatsappNumber = '0787754202',
  onNavigatePath = (_path: string) => {}
}) => {
  const { language } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);

  const effectiveTickets = tickets || serviceTickets || [];

  const filteredTickets = effectiveTickets.filter(ticket => {
    const s = (ticket.status || '').toLowerCase();
    const isCompleted = s === 'completed';
    const isCancelled = s === 'cancelled';
    const isActive = !isCompleted && !isCancelled;

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && isActive) ||
      (filter === 'completed' && isCompleted) ||
      (filter === 'cancelled' && isCancelled);

    const matchesSearch =
      !search.trim() ||
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      (ticket.serviceType || '').toLowerCase().includes(search.toLowerCase()) ||
      (ticket.serviceTitle || '').toLowerCase().includes(search.toLowerCase()) ||
      (ticket.description || '').toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getServiceIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('print')) return <Printer className="w-4 h-4 text-emerald-600" />;
    if (t.includes('it') || t.includes('tech')) return <Cpu className="w-4 h-4 text-blue-600" />;
    if (t.includes('design') || t.includes('graphic')) return <Palette className="w-4 h-4 text-purple-600" />;
    return <Globe className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters & Request Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={language === 'sw' ? 'Tafuta tiketi ya huduma...' : 'Search service tickets...'}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'active', 'completed', 'cancelled'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors min-h-[36px] ${
                  filter === f
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f === 'all'
                  ? (language === 'sw' ? 'Zote' : 'All')
                  : f === 'active'
                  ? (language === 'sw' ? 'Zinazoshughulikiwa' : 'Active')
                  : f === 'completed'
                  ? (language === 'sw' ? 'Zilizokamilika' : 'Completed')
                  : (language === 'sw' ? 'Zilizofungwa' : 'Closed')}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Service Action Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
            {language === 'sw' ? 'Omba Huduma Mpya:' : 'Request Service:'}
          </span>
          <button
            type="button"
            onClick={() => onNavigatePath('/printing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold whitespace-nowrap hover:bg-emerald-100 transition-colors min-h-[36px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Chapisho Jipya' : 'Print Job'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigatePath('/online-services')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold whitespace-nowrap hover:bg-purple-100 transition-colors min-h-[36px]"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Huduma za Serikali' : 'Online / Government'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigatePath('/shop')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold whitespace-nowrap hover:bg-amber-100 transition-colors min-h-[36px]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Vifaa vya Ofisi' : 'Stationery'}</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <FileCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'sw' ? 'Hakuna Tiketi za Huduma' : 'No service requests found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {tickets.length === 0
                ? (language === 'sw'
                    ? 'Bado hujatuma maombi yoyote ya uchapaji au huduma za kiserikali.'
                    : 'You have not submitted any service requests yet.')
                : (language === 'sw'
                    ? 'Hakuna tiketi inayolingana na kigezo cha sasa.'
                    : 'No requests match your current search or filter.')}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigatePath('/printing')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-bold transition-all min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'sw' ? 'Tuma Kazi ya Kuchapa' : 'New Print Request'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigatePath('/online-services')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all min-h-[44px]"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'sw' ? 'Huduma za Mtandao (NIDA/TRA)' : 'Online Portals'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => {
            const isCompleted = (ticket.status || '').toLowerCase() === 'completed';
            return (
              <div
                key={ticket.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {getServiceIcon(ticket.serviceType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          {ticket.id}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {ticket.serviceType}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {ticket.status || 'Received'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1">
                        {ticket.serviceTitle || ticket.serviceType}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">
                      {formatDate(ticket.createdAt)}
                    </span>
                    {ticket.estimatedCost && (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                        {ticket.estimatedCost}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description snippet */}
                {ticket.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {ticket.description}
                  </p>
                )}

                {/* Meta Row: Assigned Staff & Uploaded File */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 flex-wrap">
                    {ticket.assignedStaffName && (
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Staff: {ticket.assignedStaffName}</span>
                      </span>
                    )}
                    {ticket.fileName && (
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="font-mono text-[11px] underline truncate max-w-[180px]">
                          📎 {ticket.fileName}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Tazama Maelezo' : 'Details'}</span>
                    </button>

                    {/* WhatsApp follow-up */}
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Habari TK Stationery, naomba kufuatilia maendeleo ya ombi langu la huduma:\nTiketi: ${ticket.id}\nAina: ${ticket.serviceType}\nHali: ${ticket.status || 'Active'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Follow-up</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                  {getServiceIcon(selectedTicket.serviceType)}
                </div>
                <div>
                  <h3 className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {selectedTicket.id}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedTicket.serviceType} • {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold uppercase text-amber-600 dark:text-amber-400">{selectedTicket.status || 'Received'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Cost:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.estimatedCost || 'Assessment Pending'}</span>
                </div>
                {selectedTicket.assignedStaffName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Specialist:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.assignedStaffName}</span>
                  </div>
                )}
              </div>

              <div>
                <h5 className="font-bold text-slate-900 dark:text-white mb-1">
                  {language === 'sw' ? 'Maelezo ya Ombi' : 'Request Description'}
                </h5>
                <p className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedTicket.description || 'No description entered.'}
                </p>
              </div>

              {selectedTicket.fileUrl && (
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'sw' ? 'Faili Lililoambatanishwa' : 'Attached File'}
                  </h5>
                  <a
                    href={selectedTicket.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-medium"
                  >
                    <span className="truncate pr-2">{selectedTicket.fileName || 'View Document'}</span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs min-h-[44px]"
              >
                {language === 'sw' ? 'Funga' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
