import React, { useState, useEffect, useMemo } from 'react';
import {
  auditLogService,
  maskEmail,
  maskPhone
} from '../../../services/audit/auditLogService';
import { AdminAuditLog } from '../../../types';
import { formatTimeAgo, formatDate } from '../../../utils/formatters';
import { useAuth } from '../../../context/AuthContext';
import {
  Activity,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Lock,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  Copy,
  Check,
  X,
  CreditCard,
  Package,
  Settings,
  ShieldAlert,
  Users
} from 'lucide-react';
import { TableSkeleton } from '../../common/Skeleton';

type CategoryFilter = 'all' | 'auth' | 'orders' | 'payments' | 'inventory' | 'staff' | 'settings';
type SeverityFilter = 'all' | 'critical' | 'warning' | 'info';

export const AdminAuditLogsView: React.FC = () => {
  const { currentUser, userProfile, userRole } = useAuth();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [privacyMaskEnabled, setPrivacyMaskEnabled] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // Subscribe to real-time activity log stream
  useEffect(() => {
    setLoading(true);
    const unsubscribe = auditLogService.subscribeToActivityLogs(
      updatedLogs => {
        setLogs(updatedLogs);
        setLoading(false);
        setIsLiveConnected(true);
      },
      { limitCount: 150 }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const records = await auditLogService.getAuditLogs({ limitCount: 150 });
      setLogs(records);
    } catch (err) {
      console.warn('Failed to refresh activity logs:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = auditLogService.exportToCSV(filteredLogs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tk_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJson = (log: AdminAuditLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = logs.length;
    const signups = logs.filter(l => l.action === 'user_signup').length;
    const critical = logs.filter(l => l.severity === 'critical').length;
    const payments = logs.filter(l => l.category === 'payments' || l.action.includes('payment')).length;

    return { total, signups, critical, payments };
  }, [logs]);

  // Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Category filter
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'auth' && log.category !== 'auth' && !log.action.includes('signup') && !log.action.includes('login')) {
          return false;
        }
        if (categoryFilter !== 'auth' && log.category !== categoryFilter) {
          return false;
        }
      }

      // Severity filter
      if (severityFilter !== 'all' && log.severity !== severityFilter) {
        return false;
      }

      // Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const actionStr = (log.action || '').toLowerCase();
        const actorEmailStr = (log.actorEmail || '').toLowerCase();
        const actorNameStr = (log.actorName || '').toLowerCase();
        const targetTitleStr = (log.targetTitle || '').toLowerCase();
        const targetIdStr = (log.targetId || '').toLowerCase();
        const detailsStr = JSON.stringify(log.details || {}).toLowerCase();

        return (
          actionStr.includes(q) ||
          actorEmailStr.includes(q) ||
          actorNameStr.includes(q) ||
          targetTitleStr.includes(q) ||
          targetIdStr.includes(q) ||
          detailsStr.includes(q)
        );
      }

      return true;
    });
  }, [logs, categoryFilter, severityFilter, searchTerm]);

  // Swahili human labels for actions
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'user_signup':
        return { label: 'Usajili wa Mteja Mpya', badge: 'emerald', icon: UserPlus };
      case 'admin_login':
        return { label: 'Msimamizi Kuingia (1010)', badge: 'blue', icon: Lock };
      case 'user_login':
        return { label: 'Mtumiaji Kuingia', badge: 'slate', icon: Users };
      case 'order_status_updated':
        return { label: 'Hali ya Oda Kubadilishwa', badge: 'amber', icon: FileText };
      case 'order_created':
        return { label: 'Oda Mpya Imewekwa', badge: 'emerald', icon: FileText };
      case 'order_cancelled':
        return { label: 'Oda Imefutwa', badge: 'rose', icon: AlertTriangle };
      case 'payment_verified':
        return { label: 'Malipo Yamethibitishwa', badge: 'emerald', icon: CheckCircle2 };
      case 'payment_refunded':
        return { label: 'Pesa Zimerudishwa (Refund)', badge: 'rose', icon: CreditCard };
      case 'payment_failed':
        return { label: 'Malipo Yameshindikana', badge: 'rose', icon: ShieldAlert };
      case 'product_created':
        return { label: 'Bidhaa Mpya Katalogini', badge: 'sky', icon: Package };
      case 'product_updated':
        return { label: 'Bidhaa Imesasishwa', badge: 'slate', icon: Package };
      case 'product_deleted':
        return { label: 'Bidhaa Imeondolewa', badge: 'rose', icon: AlertTriangle };
      case 'product_toggled':
        return { label: 'Hali ya Bidhaa (Active/Inactive)', badge: 'slate', icon: Package };
      case 'inventory_adjusted':
        return { label: 'Marekebisho ya Stoo', badge: 'amber', icon: Layers };
      case 'user_role_updated':
        return { label: 'Jukumu la Mfanyakazi Kubadilishwa', badge: 'rose', icon: ShieldCheck };
      case 'store_settings_updated':
        return { label: 'Mipangilio ya Duka Kubadilishwa', badge: 'amber', icon: Settings };
      case 'ad_created':
        return { label: 'Tangazo Jipya Limeundwa', badge: 'sky', icon: Activity };
      default:
        return { label: action.replace(/_/g, ' '), badge: 'slate', icon: Activity };
    }
  };

  const renderActorDisplay = (log: AdminAuditLog) => {
    const rawEmail = log.actorEmail || '';
    const displayEmail = privacyMaskEnabled ? maskEmail(rawEmail) : rawEmail;
    const name = log.actorName || (log.actorRole === 'super_admin' ? 'Msimamizi Mkuu' : 'Mteja');

    return (
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
            {name}
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              log.actorRole === 'super_admin'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : log.actorRole === 'admin' || log.actorRole === 'staff'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : log.actorRole === 'customer'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {log.actorRole}
          </span>
        </div>
        {displayEmail && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-mono">
            {displayEmail}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Real-Time & Privacy Indicators */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Kumbukumbu za Shughuli (Activity Logs)
            </h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isLiveConnected ? 'Live Feed Hai' : 'Offline'}
              </span>
              <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Zero-Knowledge Privacy
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Mfumo salama wa kufuatilia usajili wote wa wateja wapya na vitendo vya kiutawala (admin actions) kwa uwazi kamili. Manenosiri (passwords), kadi za benki, na funguo za siri hufutwa kiotomatiki kabla ya kuhifadhiwa.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Privacy Mask Toggle */}
          <button
            onClick={() => setPrivacyMaskEnabled(!privacyMaskEnabled)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              privacyMaskEnabled
                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
            title="Washa au zima kuficha barua pepe na namba za simu"
          >
            {privacyMaskEnabled ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Faragha: Imefichwa</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Faragha: Wazi</span>
              </>
            )}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
            title="Pakua kumbukumbu kwa muundo wa CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pakua CSV</span>
          </button>

          {/* Refresh */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-slate-200 dark:border-slate-700"
            title="Sasisha Orodha"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jumla ya Matukio</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{metrics.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Matukio yote yaliyorekodiwa</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Usajili wa Wateja</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{metrics.signups}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Wateja wapya waliosajiliwa
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Vitendo Muhimu (Critical)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{metrics.critical}</p>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">
            Mabadiliko ya majukumu/mipangilio
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Malipo & Fedha</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{metrics.payments}</p>
          <p className="text-[11px] text-slate-400 mt-1">Uthibitishaji & refunds</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Zote Zilizorekodiwa', count: logs.length },
            { id: 'auth', label: 'Usajili & Kuingia (Signups)', count: metrics.signups },
            { id: 'orders', label: 'Oda (Orders)', count: logs.filter(l => l.category === 'orders').length },
            { id: 'payments', label: 'Malipo (Payments)', count: metrics.payments },
            { id: 'inventory', label: 'Katalogi & Stoo', count: logs.filter(l => l.category === 'inventory').length },
            { id: 'staff', label: 'Wafanyakazi & Majukumu', count: logs.filter(l => l.category === 'staff').length },
            { id: 'settings', label: 'Mipangilio ya Mfumo', count: logs.filter(l => l.category === 'settings').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as CategoryFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                categoryFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  categoryFilter === tab.id
                    ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Severity Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tafuta kwa jina, barua pepe, kitendo, au ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 whitespace-nowrap">Kiwango cha Uzito:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value as SeverityFilter)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Uzito Wote ({logs.length})</option>
              <option value="critical">Muhimu Sana (Critical)</option>
              <option value="warning">Tahadhari (Warning)</option>
              <option value="info">Taarifa Kawaida (Info)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              Hakuna Kumbukumbu Zilizopatikana
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || categoryFilter !== 'all' || severityFilter !== 'all'
                ? 'Jaribu kubadilisha vichujio au neno la utafutaji ili kupata matokeo.'
                : 'Shughuli mpya zitakapoingia zitaonekana hapa moja kwa moja.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Muda & Tarehe</th>
                  <th className="py-3.5 px-4">Mtekelezaji (Actor)</th>
                  <th className="py-3.5 px-4">Kitendo Kilichofanyika</th>
                  <th className="py-3.5 px-4">Lengo / Kilichoathiriwa</th>
                  <th className="py-3.5 px-4">Uzito (Severity)</th>
                  <th className="py-3.5 px-5 text-right">Maelezo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredLogs.map(log => {
                  const actionMeta = getActionLabel(log.action);
                  const ActionIcon = actionMeta.icon;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-amber-500/5 dark:hover:bg-amber-500/5 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {formatTimeAgo(log.timestamp)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {formatDate(log.timestamp)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-4 px-4 min-w-[180px]">
                        {renderActorDisplay(log)}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0 group-hover:scale-110 transition-transform">
                            <ActionIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                              {actionMeta.label}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {log.action}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-4 px-4 min-w-[200px] max-w-[260px]">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {log.targetTitle || log.targetType}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          [{log.targetType}] {log.targetId}
                        </p>
                      </td>

                      {/* Severity */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            log.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : log.severity === 'warning'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              log.severity === 'critical'
                                ? 'bg-rose-500'
                                : log.severity === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          {log.severity || 'info'}
                        </span>
                      </td>

                      {/* Action Details Button */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all group-hover:bg-amber-500 group-hover:text-slate-950"
                        >
                          Tazama
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Modal / Slide-Over */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {getActionLabel(selectedLog.action).label}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedLog.id} • {formatDate(selectedLog.timestamp)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Event Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 block">Mtekelezaji</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 truncate">
                    {selectedLog.actorName || 'System'}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">{selectedLog.actorRole}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 block">Kategoria</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 capitalize">
                    {selectedLog.category || 'general'}
                  </p>
                  <p className="text-[10px] text-slate-400">Kitengo cha mfumo</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">Uzito wa Tukio</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 uppercase tracking-wide">
                    {selectedLog.severity || 'info'}
                  </p>
                  <p className="text-[10px] text-slate-400">Zero-Knowledge Guard</p>
                </div>
              </div>

              {/* Target Details */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Kilichoathiriwa (Target Object)
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedLog.targetTitle || selectedLog.targetType}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>Aina: {selectedLog.targetType}</span>
                  <span>•</span>
                  <span>ID: {selectedLog.targetId}</span>
                </div>
              </div>

              {/* Sanitized Payload / Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Taarifa Zilizorekodiwa (Sanitized Payload)
                  </span>

                  <button
                    onClick={() => handleCopyJson(selectedLog)}
                    className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    {copiedId === selectedLog.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Imenakiliwa!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Nakili JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-60">
                  <pre>{JSON.stringify(selectedLog.details || {}, null, 2)}</pre>
                </div>

                <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                  <p>
                    <strong>Hakikisho la Faragha:</strong> Taarifa zote nyeti (nenosiri, token, namba za kadi ya benki) zimeondolewa kabisa kulingana na sera ya ulinzi wa data ya TK Stationery.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-800/40">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold rounded-xl text-xs hover:opacity-90 transition-opacity"
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
