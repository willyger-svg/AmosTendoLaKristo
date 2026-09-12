import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { auditLogService } from '../../../services/audit/auditLogService';
import { ServiceTicket } from '../../../types';
import { formatPrice, formatDate } from '../../../utils/formatters';
import {
  FileCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  Printer,
  FileText
} from 'lucide-react';

export const AdminServiceRequestsView: React.FC = () => {
  const { serviceTickets, updateTicketStatus, showToast } = useApp();
  const { currentUser, userRole, userProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredTickets = serviceTickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerPhone.includes(q) ||
      t.serviceType.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (ticketId: string, newStatus: any) => {
    setUpdatingId(ticketId);
    try {
      await updateTicketStatus(ticketId, newStatus);
      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'ticket_status_updated',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: userProfile?.fullName || '',
          actorRole: userRole,
          targetType: 'service_request',
          targetId: ticketId,
          targetTitle: `Ticket #${ticketId}`,
          details: { newStatus }
        });
      }
      showToast({
        type: 'success',
        title: 'Hali ya Tiketi Imesasishwa',
        message: `Tiketi #${ticketId} imebadilishwa kuwa ${newStatus}.`
      });
    } catch {
      showToast({ type: 'error', title: 'Hitilafu', message: 'Imeshindwa kubadilisha hali ya tiketi.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tafuta namba ya tiketi, mteja au huduma..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Hali Zote ({serviceTickets.length})</option>
            <option value="Received">Zilizopokelewa ({serviceTickets.filter(t => t.status === 'Received').length})</option>
            <option value="In Progress">Zinazofanyiwa Kazi ({serviceTickets.filter(t => t.status === 'In Progress').length})</option>
            <option value="Completed">Zilizokamilika ({serviceTickets.filter(t => t.status === 'Completed').length})</option>
            <option value="Cancelled">Zilizoghairiwa</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">Hakuna tiketi za huduma zinazolingana na utafutaji wako</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Tiketi na Tarehe</th>
                  <th className="p-4">Mteja</th>
                  <th className="p-4">Aina ya Huduma</th>
                  <th className="p-4">Gharama Inayokadiriwa</th>
                  <th className="p-4">Hali ya Sasa</th>
                  <th className="p-4 text-right">Hatua na Maelezo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">#{t.id}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(t.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{t.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{t.customerPhone}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t.serviceType}</span>
                      </span>
                      {t.printOptions && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Nakala {t.printOptions.copies} • {t.printOptions.colorMode} • {t.printOptions.paperSize}
                        </p>
                      )}
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(t.estimatedCost || 0)}
                    </td>
                    <td className="p-4">
                      <select
                        value={t.status}
                        disabled={updatingId === t.id}
                        onChange={e => handleStatusChange(t.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer ${
                          t.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                            : t.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200'
                            : t.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200'
                        }`}
                      >
                        <option value="Received">Imepokelewa</option>
                        <option value="In Progress">Inafanyiwa Kazi</option>
                        <option value="Completed">Imekamilika</option>
                        <option value="Cancelled">Imeghairiwa</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Tazama Maelezo Kamili ya Tiketi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Tiketi #{selectedTicket.id}
                </h3>
                <p className="text-xs text-slate-400">{formatDate(selectedTicket.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">{selectedTicket.customerName}</p>
                <p className="text-slate-600 dark:text-slate-300">Simu: {selectedTicket.customerPhone}</p>
                <p className="text-slate-600 dark:text-slate-300">Huduma: {selectedTicket.serviceType}</p>
              </div>

              {selectedTicket.requirements && (
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Maelekezo ya Mteja:</h4>
                  <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedTicket.requirements}
                  </p>
                </div>
              )}

              {selectedTicket.documentUrls && selectedTicket.documentUrls.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Faili Zilizopakiwa:</h4>
                  <div className="space-y-1">
                    {selectedTicket.documentUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 rounded-lg text-amber-600 dark:text-amber-400 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate">Pakua Kiambatisho #{idx + 1}</span>
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
