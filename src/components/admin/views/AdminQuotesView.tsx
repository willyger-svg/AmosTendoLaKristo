import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { auditLogService } from '../../../services/audit/auditLogService';
import { QuoteRequest } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import {
  Globe,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Building,
  Mail,
  Phone
} from 'lucide-react';

export const AdminQuotesView: React.FC = () => {
  const { quoteRequests, updateQuoteStatus, showToast } = useApp();
  const { currentUser, userRole, userProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredQuotes = quoteRequests.filter(q => {
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    const term = searchTerm.trim().toLowerCase();
    const matchSearch =
      !term ||
      q.id.toLowerCase().includes(term) ||
      q.name.toLowerCase().includes(term) ||
      q.phone.includes(term) ||
      (q.organization && q.organization.toLowerCase().includes(term)) ||
      q.serviceCategory.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (quoteId: string, newStatus: any) => {
    setUpdatingId(quoteId);
    try {
      await updateQuoteStatus(quoteId, newStatus);
      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'quote_status_updated',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: userProfile?.fullName || '',
          actorRole: userRole,
          targetType: 'quote',
          targetId: quoteId,
          targetTitle: `Quote #${quoteId}`,
          details: { newStatus }
        });
      }
      showToast({
        type: 'success',
        title: 'Hali ya Nukuu Imesasishwa',
        message: `Nukuu #${quoteId} imesasishwa kuwa ${newStatus}.`
      });
    } catch {
      showToast({ type: 'error', title: 'Hitilafu', message: 'Imeshindwa kuboresha hali ya nukuu.' });
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
            placeholder="Search quote ID, client or company..."
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
            <option value="all">All Quote Leads ({quoteRequests.length})</option>
            <option value="Received">Received ({quoteRequests.filter(q => q.status === 'Received').length})</option>
            <option value="In Review">In Review</option>
            <option value="Quoted">Quoted</option>
            <option value="Declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Globe className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">No tech quotes matching your filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Quote ID & Date</th>
                  <th className="p-4">Client & Org</th>
                  <th className="p-4">Solution Track</th>
                  <th className="p-4">Timeline / Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredQuotes.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">#{q.id}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(q.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{q.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {q.organization ? `${q.organization} • ` : ''}{q.phone}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{q.serviceCategory}</span>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{q.projectDescription}</p>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <p className="font-semibold">{q.timeline || 'Flexible'}</p>
                      <p className="text-[11px] text-slate-400">{q.budget || 'Custom Scope'}</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={q.status}
                        disabled={updatingId === q.id}
                        onChange={e => handleStatusChange(q.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border text-xs font-bold focus:outline-none cursor-pointer bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        <option value="Received">Received</option>
                        <option value="In Review">In Review</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedQuote(q)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="View Full RFP Details"
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

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Tech Quote #{selectedQuote.id}
                </h3>
                <p className="text-xs text-slate-400">{formatDate(selectedQuote.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">{selectedQuote.name}</p>
                {selectedQuote.organization && (
                  <p className="text-slate-600 dark:text-slate-300">Company: {selectedQuote.organization}</p>
                )}
                <p className="text-slate-600 dark:text-slate-300">Phone: {selectedQuote.phone}</p>
                {selectedQuote.email && (
                  <p className="text-slate-600 dark:text-slate-300">Email: {selectedQuote.email}</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Project Specification:</h4>
                <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedQuote.projectDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">Target Timeline</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedQuote.timeline || 'Flexible'}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">Indicative Budget</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedQuote.budget || 'Custom Scope'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
