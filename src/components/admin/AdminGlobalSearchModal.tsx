import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { canAccessSection } from '../../utils/adminPermissions';
import {
  Search,
  X,
  ShoppingBag,
  Package,
  FileCheck,
  Globe,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

interface AdminGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  type: 'order' | 'product' | 'ticket' | 'quote';
  title: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  targetPath: string;
  rawItem: any;
}

export const AdminGlobalSearchModal: React.FC<AdminGlobalSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const { orders, products, serviceTickets, quoteRequests, navigateTo } = useApp();
  const { userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation & Shortcuts (Escape, Up, Down, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo<SearchResultItem[]>(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];

    const list: SearchResultItem[] = [];

    // 1. Search Orders
    orders.forEach(order => {
      const matchId = order.id.toLowerCase().includes(q);
      const matchCustomer = order.customerName.toLowerCase().includes(q) || order.customerPhone.includes(q);
      const matchItems = order.items.some(item => item.product.title.toLowerCase().includes(q));

      if (matchId || matchCustomer || matchItems) {
        list.push({
          id: order.id,
          type: 'order',
          title: `Oda #${order.id} • ${order.customerName}`,
          subtitle: `Bidhaa ${order.items.length} • ${formatPrice(order.totalAmount)} • ${order.customerPhone}`,
          badge: order.status,
          badgeClass: order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
          targetPath: '/admin/orders',
          rawItem: order
        });
      }
    });

    // 2. Search Products
    products.forEach(product => {
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      const matchSku = product.sku?.toLowerCase().includes(q);

      if (matchTitle || matchCat || matchSku) {
        list.push({
          id: product.id,
          type: 'product',
          title: product.title,
          subtitle: `Kategoria: ${product.category} • Stoo: vipande ${product.stockCount} • ${formatPrice(product.price)}`,
          badge: product.stockCount <= 5 ? 'Stoo Chini' : 'Inapatikana',
          badgeClass: product.stockCount <= 5 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200',
          targetPath: canAccessSection(userRole, 'products') ? '/admin/products' : '/admin/inventory',
          rawItem: product
        });
      }
    });

    // 3. Search Service Tickets
    serviceTickets.forEach(ticket => {
      const matchId = ticket.id.toLowerCase().includes(q);
      const matchCustomer = ticket.customerName.toLowerCase().includes(q) || ticket.customerPhone.includes(q);
      const matchType = ticket.serviceType.toLowerCase().includes(q);

      if (matchId || matchCustomer || matchType) {
        list.push({
          id: ticket.id,
          type: 'ticket',
          title: `Tiketi #${ticket.id} • ${ticket.serviceType}`,
          subtitle: `Mteja: ${ticket.customerName} (${ticket.customerPhone})`,
          badge: ticket.status,
          badgeClass: ticket.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200',
          targetPath: '/admin/service-requests',
          rawItem: ticket
        });
      }
    });

    // 4. Search Quotes
    quoteRequests.forEach(quote => {
      const matchId = quote.id.toLowerCase().includes(q);
      const matchCustomer = quote.customerName.toLowerCase().includes(q) || quote.customerPhone.includes(q);
      const matchProj = quote.projectType.toLowerCase().includes(q);

      if (matchId || matchCustomer || matchProj) {
        list.push({
          id: quote.id,
          type: 'quote',
          title: `Ombi la Bei #${quote.id} • ${quote.projectType}`,
          subtitle: `Mteja: ${quote.customerName} (${quote.customerPhone}) • Muda: ${quote.timeline || 'Kawaida'}`,
          badge: quote.status,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          targetPath: '/admin/quotes',
          rawItem: quote
        });
      }
    });

    return list.slice(0, 15);
  }, [searchTerm, orders, products, serviceTickets, quoteRequests, userRole]);

  const handleSelect = (item: SearchResultItem) => {
    navigateTo(item.targetPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tafuta oda, bidhaa, tiketi, maombi ya bei au mteja..."
            className="w-full bg-transparent border-0 text-base font-medium text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Search Results / Empty State */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {searchTerm.trim() === '' ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">
                Andika neno la utafutaji (k.m namba ya oda, jina la bidhaa au simu ya mteja)
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-sm font-medium">
                Hakuna matokeo yaliyopatikana.
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon =
                item.type === 'order'
                  ? ShoppingBag
                  : item.type === 'product'
                  ? Package
                  : item.type === 'ticket'
                  ? FileCheck
                  : Globe;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border border-transparent hover:border-amber-200 dark:hover:border-slate-700 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-3" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{results.length} matokeo yamepatikana</span>
          <div className="flex items-center gap-2">
            <span>Bonyeza</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              ESC
            </kbd>
            <span>kufunga</span>
          </div>
        </div>
      </div>
    </div>
  );
};
