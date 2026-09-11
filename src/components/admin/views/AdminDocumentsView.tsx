import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { AdminSectionPlaceholder } from '../AdminSectionPlaceholder';
import { formatDate } from '../../../utils/formatters';
import { FileText, Download, ExternalLink, Search, Clock, CheckCircle2 } from 'lucide-react';

export const AdminDocumentsView: React.FC = () => {
  const { serviceTickets } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

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
          customerName: t.customerName,
          customerPhone: t.customerPhone,
          serviceType: t.serviceType,
          url,
          createdAt: t.createdAt,
          status: t.status
        });
      });
    }
  });

  const filteredDocs = documents.filter(d => {
    const q = searchTerm.trim().toLowerCase();
    return (
      !q ||
      d.customerName.toLowerCase().includes(q) ||
      d.customerPhone.includes(q) ||
      d.ticketId.toLowerCase().includes(q) ||
      d.serviceType.toLowerCase().includes(q)
    );
  });

  return (
    <AdminSectionPlaceholder
      title="Customer Document Repository"
      subtitle="Centralized management of confidential files, government portal attachments, and print job PDFs."
      sectionCode="documents"
      scheduledPhase="Phase 4B.6 (Document OCR & Storage Archiving)"
      summaryStats={[
        { label: 'Active Attached Files', value: documents.length },
        { label: 'Associated Service Tickets', value: serviceTickets.filter(t => t.documentUrls?.length).length },
        { label: 'Security Status', value: 'Isolated', change: 'Firebase Storage Rules Enforced' },
        { label: 'Cloud Bucket Path', value: '/service-documents/' }
      ]}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search document by client or ticket..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Confidential customer attachments
          </p>
        </div>

        {/* Documents Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {filteredDocs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold">No uploaded document attachments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">File ID & Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Linked Service Ticket</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Access File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{doc.id}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(doc.createdAt)}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{doc.customerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{doc.customerPhone}</p>
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">#{doc.ticketId}</span>
                        <p className="text-[11px] text-slate-400">{doc.serviceType}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Open File</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminSectionPlaceholder>
  );
};
