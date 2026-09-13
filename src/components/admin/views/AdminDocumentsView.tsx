import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatDate } from '../../../utils/formatters';
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';

export const AdminDocumentsView: React.FC = () => {
  const { serviceTickets, navigateTo } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  // Extract all document attachments across tickets
  const documents: {
    id: string;
    ticketId: string;
    customerName: string;
    customerPhone: string;
    serviceType: string;
    url: string;
    createdAt: string;
    status: string;
  }[] = [];

  serviceTickets.forEach(t => {
    if (t.documentUrls && t.documentUrls.length > 0) {
      t.documentUrls.forEach((url, idx) => {
        documents.push({
          id: `${t.id}-DOC-${idx + 1}`,
          ticketId: t.id,
          customerName: t.customerName || 'Mteja',
          customerPhone: t.customerPhone || '',
          serviceType: t.serviceType || 'Huduma ya Mtandaoni',
          url,
          createdAt: t.createdAt,
          status: t.status
        });
      });
    }
  });

  const filteredDocs = documents
    .filter(d => {
      if (filterStatus === 'pending') return d.status === 'pending';
      if (filterStatus === 'in_progress') return d.status === 'in_progress' || d.status === 'processing';
      if (filterStatus === 'completed') return d.status === 'completed';
      return true;
    })
    .filter(d => {
      const q = searchTerm.trim().toLowerCase();
      return (
        !q ||
        d.customerName.toLowerCase().includes(q) ||
        d.customerPhone.includes(q) ||
        d.ticketId.toLowerCase().includes(q) ||
        d.serviceType.toLowerCase().includes(q)
      );
    });

  const getCleanPhone = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.startsWith('0')) return '255' + digits.slice(1);
    if (digits.startsWith('255')) return digits;
    return digits;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-[#0F2942] to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              Hifadhi ya Nyaraka
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Viambatisho vya Wateja & Nyaraka za Kuchapisha
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Hifadhi ya Nyaraka & Viambatisho vya Huduma
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hifadhidata ya mafaili, PDF, na picha zilizopakiwa na wateja kwa ajili ya uchapishaji (printing) au maombi ya serikali mtandaoni (NIDA, TRA, RITA, Ajira Portal).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/admin/services-requests')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Tazama Tiketi za Huduma</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jumla ya Mafaili</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
            {documents.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Viambatisho vya huduma</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tiketi zenye Faili</span>
            <FolderOpen className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">
            {serviceTickets.filter(t => t.documentUrls?.length).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Maombi yenye viambatisho</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Zinazosubiri</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">
            {documents.filter(d => d.status === 'pending').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Bado hazijachapishwa/kufanyiwa kazi</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Zilizokamilika</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
            {documents.filter(d => d.status === 'completed').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Nyaraka zilizokamilika</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tafuta kwa jina la mteja, simu, tiketi..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Zote ({documents.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Zinazosubiri ({documents.filter(d => d.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Zilizokamilika ({documents.filter(d => d.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">Hakuna faili lililopatikana.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Wateja wanapotuma mafaili kwa ajili ya uchapishaji au huduma za serikali, yataonekana hapa moja kwa moja.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Nyaraka & Tarehe</th>
                  <th className="p-4">Mteja</th>
                  <th className="p-4">Huduma Husika</th>
                  <th className="p-4">Hali ya Kazi</th>
                  <th className="p-4 text-right">Fungua / Pakua</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocs.map(doc => {
                  const cleanPhone = getCleanPhone(doc.customerPhone);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{doc.id}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(doc.createdAt)}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{doc.customerName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono">{doc.customerPhone}</span>
                          {doc.customerPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-500 hover:text-emerald-600"
                              title="Wasiliana WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        <button
                          onClick={() => navigateTo('/admin/services-requests')}
                          className="font-mono text-amber-600 dark:text-amber-400 font-bold hover:underline block"
                        >
                          #{doc.ticketId}
                        </button>
                        <p className="text-[11px] text-slate-400">{doc.serviceType}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : doc.status === 'in_progress' || doc.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {doc.status === 'completed'
                            ? 'Imekamilika'
                            : doc.status === 'in_progress'
                            ? 'Inafanyiwa Kazi'
                            : 'Inasubiri'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Fungua Faili</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
