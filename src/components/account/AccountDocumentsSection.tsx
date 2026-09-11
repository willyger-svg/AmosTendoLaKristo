import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { CustomerDocument, ServiceTicket } from '../../types';
import { formatDate } from '../../utils/formatters';
import { documentService } from '../../services/documents/documentService';
import {
  FolderOpen,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AccountDocumentsSectionProps {
  documents: CustomerDocument[];
  serviceTickets: ServiceTicket[];
  showToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message: string }) => void;
  onRefresh: () => void;
}

export const AccountDocumentsSection: React.FC<AccountDocumentsSectionProps> = ({
  documents,
  serviceTickets,
  showToast,
  onRefresh
}) => {
  const { currentUser } = useAuth();
  const { language } = useTranslation();

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState<'direct_upload' | 'order' | 'service_request' | 'quote'>('direct_upload');
  const [relatedTitle, setRelatedTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine direct documents with any service ticket attachments
  const allConsolidatedDocs: {
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
    source: string;
    createdAt: string;
    isDeletable: boolean;
  }[] = [
    ...documents.map(d => ({
      id: d.id,
      name: d.name,
      fileUrl: d.fileUrl,
      fileType: d.fileType,
      fileSize: d.fileSize,
      source: d.relatedTitle || (d.relatedType === 'direct_upload' ? 'Personal Cloud' : d.relatedType),
      createdAt: d.createdAt,
      isDeletable: true
    })),
    // Attachments from service requests
    ...serviceTickets
      .filter(t => t.fileUrl)
      .map(t => ({
        id: `ticket_${t.id}`,
        name: t.fileName || `Attachment (${t.id})`,
        fileUrl: t.fileUrl || '',
        fileType: t.fileName?.split('.').pop() || 'document',
        source: `${t.serviceType} (${t.id})`,
        createdAt: t.createdAt,
        isDeletable: false
      }))
  ];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '--';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocIcon = (name: string, type: string) => {
    const ext = (name || '').split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-rose-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext) || type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-amber-500" />;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = documentService.validateDocumentFile(file);
      if (!validation.isValid) {
        showToast({
          type: 'error',
          title: language === 'sw' ? 'Faili Halifai' : 'Invalid File',
          message: (language === 'sw' ? validation.errorSw : validation.errorEn) || 'File validation failed'
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await documentService.uploadDocument(
        currentUser.uid,
        selectedFile,
        {
          relatedType: documentCategory,
          relatedTitle: relatedTitle || selectedFile.name,
          notes
        },
        progress => setUploadProgress(progress)
      );

      showToast({
        type: 'success',
        title: language === 'sw' ? 'Faili Limepakiwa' : 'Document Uploaded',
        message: language === 'sw' ? 'Faili lako limehifadhiwa salama kwenye akaunti yako.' : 'Document has been securely saved to your account.'
      });

      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setRelatedTitle('');
      setNotes('');
      setUploadProgress(0);
      onRefresh();
    } catch (err: any) {
      console.warn('Document upload error:', err);
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Hitilafu ya Kupakia' : 'Upload Failed',
        message: err.message || 'Could not upload document'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!currentUser) return;
    const confirm = window.confirm(
      language === 'sw'
        ? 'Una uhakika unataka kufuta faili hili?'
        : 'Are you sure you want to permanently delete this document?'
    );
    if (!confirm) return;

    setIsDeletingId(docId);
    try {
      await documentService.deleteDocument(currentUser.uid, docId, fileUrl);
      showToast({
        type: 'success',
        title: language === 'sw' ? 'Faili Limefutwa' : 'Document Deleted',
        message: language === 'sw' ? 'Faili limeondolewa kikamilifu.' : 'Document removed successfully.'
      });
      onRefresh();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Hitilafu' : 'Error',
        message: err.message || 'Could not delete document'
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-500" />
            <span>{language === 'sw' ? 'Nyaraka & Mafaili ya Mteja' : 'Customer Document Vault'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'sw'
              ? 'Hifadhi salama ya nyaraka zako za kuchapa, fomu za serikali, na risiti.'
              : 'Secure cloud storage for your print files, government applications, and receipts.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-xs transition-colors min-h-[44px]"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{language === 'sw' ? 'Pakia Faili Jipya' : 'Upload Document'}</span>
        </button>
      </div>

      {/* Documents List / Empty State */}
      {allConsolidatedDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'sw' ? 'Hakuna Nyaraka Zilizohifadhiwa' : 'No documents in your vault'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {language === 'sw'
                ? 'Pakia vitambulisho, fomu za TRA/NIDA, au faili unalotaka lichapishwe dukani.'
                : 'Upload files you need printed or documents from your online service applications.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-bold transition-all min-h-[44px]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{language === 'sw' ? 'Pakia Faili la Kwanza' : 'Upload First Document'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allConsolidatedDocs.map(docItem => (
            <div
              key={docItem.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center flex-shrink-0">
                  {getDocIcon(docItem.name, docItem.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={docItem.name}>
                    {docItem.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {docItem.source}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDate(docItem.createdAt)} • {formatFileSize(docItem.fileSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={docItem.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline min-h-[36px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Pakua' : 'Download'}</span>
                </a>

                {docItem.isDeletable && (
                  <button
                    type="button"
                    onClick={() => handleDelete(docItem.id, docItem.fileUrl)}
                    disabled={isDeletingId === docItem.id}
                    className="text-slate-400 hover:text-rose-600 p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title={language === 'sw' ? 'Futa' : 'Delete'}
                  >
                    {isDeletingId === docItem.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'sw' ? 'Pakia Nyaraka Kwenye Akaunti' : 'Upload Document'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {language === 'sw' ? 'Bofya au kokota faili hapa' : 'Click to select or drag and drop'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      PDF, Word, Excel, Images (Max 15MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar if uploading */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span>{language === 'sw' ? 'Inapakia...' : 'Uploading...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'sw' ? 'Aina ya Nyaraka' : 'Document Category'}
                </label>
                <select
                  value={documentCategory}
                  onChange={e => setDocumentCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="direct_upload">{language === 'sw' ? 'Faili Binafsi (Personal Storage)' : 'Personal Storage'}</option>
                  <option value="service_request">{language === 'sw' ? 'Kwa ajili ya Huduma / Chapisho' : 'For Print / Online Service'}</option>
                  <option value="quote">{language === 'sw' ? 'Kwa ajili ya Nukuu ya Software' : 'For Tech Quote'}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'sw' ? 'Jina au Kichwa cha Nyaraka' : 'Document Label / Title'}
                </label>
                <input
                  type="text"
                  value={relatedTitle}
                  onChange={e => setRelatedTitle(e.target.value)}
                  placeholder={language === 'sw' ? 'Mfano: Cheti cha Kuzaliwa au Kitambulisho' : 'e.g., Company Registration Certificate'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'sw' ? 'Maelezo ya Ziada (Hiari)' : 'Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={language === 'sw' ? 'Maelezo yoyote kuhusu faili hili...' : 'Any instructions regarding this file...'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-bold min-h-[44px]"
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors min-h-[44px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'sw' ? 'Inapakia...' : 'Uploading...'}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>{language === 'sw' ? 'Hifadhi Faili' : 'Save Document'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
