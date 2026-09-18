import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice, formatDate } from '../../../utils/formatters';
import { UserProfile } from '../../../types';
import {
  Users,
  Search,
  Phone,
  Mail,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  User,
  Calendar
} from 'lucide-react';
import { KpiGridSkeleton, TableSkeleton } from '../../common/Skeleton';

interface UnifiedCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  orderCount: number;
  totalSpend: number;
  lastActive: string;
  accountType: 'registered' | 'guest';
  role?: string;
  city?: string;
}

export const AdminCustomersView: React.FC = () => {
  const { orders, navigateTo } = useApp();
  const { getAllUsers } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'registered' | 'buyers' | 'repeat'>('all');
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAllUsers()
      .then(users => {
        if (isMounted) {
          setRegisteredUsers(users);
          setLoadingUsers(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingUsers(false);
      });
    return () => {
      isMounted = false;
    };
  }, [getAllUsers]);

  // Build unified customer map
  const customerMap = new Map<string, UnifiedCustomer>();

  // 1. Add all registered users
  registeredUsers.forEach(u => {
    const key = (u.phone || u.email || u.id).trim().toLowerCase();
    customerMap.set(key, {
      id: u.id,
      name: u.fullName || 'Mteja Aliyesajiliwa',
      phone: u.phone || '',
      email: u.email || '',
      orderCount: 0,
      totalSpend: 0,
      lastActive: u.createdAt || new Date().toISOString(),
      accountType: 'registered',
      role: u.role,
      city: u.city || u.region || ''
    });
  });

  // 2. Overlay order data
  orders.forEach(o => {
    const phoneKey = o.customerPhone?.trim().toLowerCase();
    const emailKey = o.customerEmail?.trim().toLowerCase();
    const nameKey = o.customerName?.trim().toLowerCase();

    let matchedKey: string | null = null;
    if (phoneKey && customerMap.has(phoneKey)) matchedKey = phoneKey;
    else if (emailKey && customerMap.has(emailKey)) matchedKey = emailKey;

    if (matchedKey) {
      const existing = customerMap.get(matchedKey)!;
      existing.orderCount += 1;
      existing.totalSpend += o.totalAmount || 0;
      if (new Date(o.createdAt) > new Date(existing.lastActive)) {
        existing.lastActive = o.createdAt;
      }
      if (!existing.phone && o.customerPhone) existing.phone = o.customerPhone;
      if (!existing.email && o.customerEmail) existing.email = o.customerEmail;
    } else {
      const newKey = phoneKey || emailKey || nameKey || o.id;
      if (!customerMap.has(newKey)) {
        customerMap.set(newKey, {
          id: o.id,
          name: o.customerName || 'Mteja wa Dukani',
          phone: o.customerPhone || '',
          email: o.customerEmail || '',
          orderCount: 1,
          totalSpend: o.totalAmount || 0,
          lastActive: o.createdAt,
          accountType: 'guest'
        });
      } else {
        const existing = customerMap.get(newKey)!;
        existing.orderCount += 1;
        existing.totalSpend += o.totalAmount || 0;
        if (new Date(o.createdAt) > new Date(existing.lastActive)) {
          existing.lastActive = o.createdAt;
        }
      }
    }
  });

  const customerList = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpend - a.totalSpend || new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );

  const totalRevenue = customerList.reduce((sum, c) => sum + c.totalSpend, 0);
  const registeredCount = customerList.filter(c => c.accountType === 'registered').length;
  const repeatCount = customerList.filter(c => c.orderCount > 1).length;

  const filteredCustomers = customerList.filter(c => {
    if (filterType === 'registered' && c.accountType !== 'registered') return false;
    if (filterType === 'buyers' && c.orderCount === 0) return false;
    if (filterType === 'repeat' && c.orderCount <= 1) return false;

    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
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
              Usimamizi wa Wateja
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Daftari Kamili la Wanunuzi & Akaunti Zilizosajiliwa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Wateja & Akaunti za Watumiaji wa TK Stationery
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hifadhidata ya wateja wote waliojisajili kwenye tovuti pamoja na wateja walioweka oda. Unaweza kuwasiliana nao moja kwa moja kwa WhatsApp au kupiga simu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/admin/orders')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tazama Oda za Wateja</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {loadingUsers ? (
        <KpiGridSkeleton count={4} />
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterType === 'all'
              ? 'bg-slate-900 text-white border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jumla ya Wateja</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
            {customerList.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Kwenye kanzidata ya mfumo</p>
        </div>

        <div
          onClick={() => setFilterType('registered')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterType === 'registered'
              ? 'bg-amber-950/40 border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Waliojisajili</span>
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">
            {registeredCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Wana akaunti rasmi mtandaoni</p>
        </div>

        <div
          onClick={() => setFilterType('repeat')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterType === 'repeat'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Wateja wa Kudumu</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
            {repeatCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Walionunua zaidi ya mara 1</p>
        </div>

        <div
          onClick={() => setFilterType('buyers')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterType === 'buyers'
              ? 'bg-blue-950/40 border-blue-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Thamani ya Manunuzi</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg font-black mt-2 text-blue-600 dark:text-blue-400 truncate">
            {formatPrice(totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Kupitia oda zilizothibitishwa</p>
        </div>
      </div>
      )}

      {/* Search & Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tafuta mteja kwa jina, simu, barua pepe..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Wote ({customerList.length})
          </button>
          <button
            onClick={() => setFilterType('registered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterType === 'registered'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Waliojisajili ({registeredCount})
          </button>
          <button
            onClick={() => setFilterType('repeat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterType === 'repeat'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Wateja wa Kudumu ({repeatCount})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {loadingUsers ? (
          <TableSkeleton rows={6} columns={7} />
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">Hakuna mteja anayelingana na utafutaji.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Mteja</th>
                  <th className="p-4">Simu</th>
                  <th className="p-4">Barua Pepe</th>
                  <th className="p-4">Oda Zilizowekwa</th>
                  <th className="p-4">Jumla ya Manunuzi</th>
                  <th className="p-4">Tarehe / Mara ya Mwisho</th>
                  <th className="p-4 text-right">Wasiliana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map(c => {
                  const cleanPhone = getCleanPhone(c.phone);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                                  c.accountType === 'registered'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {c.accountType === 'registered' ? 'Akaunti Rasmi' : 'Mteja wa Dukani'}
                              </span>
                              {c.city && (
                                <span className="text-[10px] text-slate-400">
                                  • {c.city}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {c.phone || <span className="text-slate-400 italic">Haijawekwa</span>}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {c.email ? (
                          <span className="truncate block max-w-[180px]">{c.email}</span>
                        ) : (
                          <span className="text-slate-400 italic">Haijawekwa</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {c.orderCount} {c.orderCount === 1 ? 'oda' : 'oda'}
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900 dark:text-white">
                        {formatPrice(c.totalSpend)}
                      </td>
                      <td className="p-4 text-slate-400">
                        {formatDate(c.lastActive)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.phone && (
                            <>
                              <a
                                href={`tel:${c.phone}`}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                                title="Piga Simu"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                                title="Mtumie Ujumbe WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => navigateTo('/admin/orders')}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors"
                            title="Tazama Oda"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
