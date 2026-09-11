import React, { useState, useEffect } from 'react';
import { auditLogService } from '../../../services/audit/auditLogService';
import { AdminAuditLog } from '../../../types';
import { formatTimeAgo, formatDate } from '../../../utils/formatters';
import { History, ShieldCheck, Search, Filter, RefreshCw, Lock } from 'lucide-react';

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const records = await auditLogService.getAuditLogs({ limitCount: 100 });
      setLogs(records);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
      (log.actorName && log.actorName.toLowerCase().includes(q)) ||
      log.targetId.toLowerCase().includes(q) ||
      log.targetType.toLowerCase().includes(q);
    return matchAction && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Immutable Security Audit Trail
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              Append-Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-resistant ledger recording every administrative mutation, status change, and payment verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search action, actor email or target ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Actions ({logs.length})</option>
            <option value="order_status_updated">Order Status Updated</option>
            <option value="payment_verified">Payment Verified</option>
            <option value="payment_refunded">Payment Refunded</option>
            <option value="product_created">Product Created</option>
            <option value="product_updated">Product Updated</option>
            <option value="inventory_adjusted">Inventory Adjusted</option>
            <option value="user_role_updated">User Role Updated</option>
            <option value="store_settings_updated">Store Settings Updated</option>
            <option value="ad_created">Ad Banner Created</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading security logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">No audit logs matching query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action Recorded</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Metadata Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors font-mono">
                    <td className="p-4">
                      <p className="text-slate-900 dark:text-white font-bold">{formatDate(log.timestamp)}</p>
                      <p className="text-[10px] text-slate-400 font-sans">{formatTimeAgo(log.timestamp)}</p>
                    </td>
                    <td className="p-4 font-sans">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{log.actorName || log.actorEmail || 'System'}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{log.actorRole}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-sans">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{log.targetTitle || log.targetType}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {log.targetId}</p>
                    </td>
                    <td className="p-4 max-w-xs truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
