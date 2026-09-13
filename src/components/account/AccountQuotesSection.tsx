import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { QuoteRequest } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  Sparkles,
  Search,
  Plus,
  Eye,
  X,
  MessageSquare,
  Calendar,
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AccountQuotesSectionProps {
  quotes: QuoteRequest[];
  whatsappNumber: string;
  onNavigatePath: (path: string) => void;
}

export const AccountQuotesSection: React.FC<AccountQuotesSectionProps> = ({
  quotes,
  whatsappNumber,
  onNavigatePath
}) => {
  const { language } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const filteredQuotes = quotes.filter(quote => {
    const s = (quote.status || '').toLowerCase();
    const isCompleted = s === 'completed' || s === 'accepted' || s === 'delivered';
    const isActive = !isCompleted && s !== 'rejected' && s !== 'cancelled';

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && isActive) ||
      (filter === 'completed' && isCompleted);

    const matchesSearch =
      !search.trim() ||
      quote.id.toLowerCase().includes(search.toLowerCase()) ||
      quote.projectType.toLowerCase().includes(search.toLowerCase()) ||
      (quote.projectNotes || '').toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={language === 'sw' ? 'Tafuta nukuu ya mradi au software...' : 'Search tech quotes...'}
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

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['all', 'active', 'completed'] as const).map(f => (
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
                    ? (language === 'sw' ? 'Zinazoendelea' : 'Active')
                    : (language === 'sw' ? 'Zilizokamilika' : 'Completed')}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigatePath('/online-services')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black whitespace-nowrap shadow-xs transition-colors min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'sw' ? 'Omba Nukuu Mpya' : 'New Quote'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quote Cards */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'sw' ? 'Hakuna Nukuu za Software' : 'No quotes found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {quotes.length === 0
                ? (language === 'sw'
                    ? 'Bado hujaomba makisio au nukuu ya mradi wa software, website, au mfumo wa POS.'
                    : 'You have not submitted any tech or software quote inquiries yet.')
                : (language === 'sw'
                    ? 'Hakuna nukuu inayolingana na kigezo ulichochagua.'
                    : 'No quote requests match your filter.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigatePath('/online-services')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-bold transition-all min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'sw' ? 'Omba Nukuu ya Huduma Sasa' : 'Explore Online Services'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map(quote => (
            <div
              key={quote.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {quote.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {quote.projectType}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {quote.status || 'Under Review'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatDate(quote.createdAt)} • {quote.businessScale || 'SME'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                    {quote.estimatedRange || 'Estimate Pending'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Timeline: {quote.timeline || 'TBD'}
                  </span>
                </div>
              </div>

              {/* Feature Badges */}
              {quote.features && quote.features.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {quote.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {quote.projectNotes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {quote.projectNotes}
                </p>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(quote)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Tazama Makisio' : 'View Quote Details'}</span>
                </button>

                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Habari TK Stationery, naomba kufuatilia Nukuu ya Mradi:\nRef: ${quote.id}\nAina: ${quote.projectType}\nHali: ${quote.status || 'Active'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Consultant</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {selectedQuote.id}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedQuote.projectType} • {formatDate(selectedQuote.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Scale:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedQuote.businessScale}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Budget Range:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">{selectedQuote.estimatedRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Timeline:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedQuote.timeline}</span>
                </div>
              </div>

              {selectedQuote.features && selectedQuote.features.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                    {language === 'sw' ? 'Vipengele Vilivyoombwa' : 'Requested Features'}
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedQuote.features.map((f, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedQuote.projectNotes && (
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'sw' ? 'Maelezo ya Mradi' : 'Project Specifications'}
                  </h5>
                  <p className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedQuote.projectNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
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
