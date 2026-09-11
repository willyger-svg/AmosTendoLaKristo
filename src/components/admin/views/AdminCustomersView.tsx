import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { AdminSectionPlaceholder } from '../AdminSectionPlaceholder';
import { formatPrice, formatDate } from '../../../utils/formatters';
import { Users, Search, Phone, Mail, ShoppingBag, ArrowRight } from 'lucide-react';

interface AggregatedCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  orderCount: number;
  totalSpend: number;
  lastOrderDate: string;
  accountType: 'registered' | 'guest';
}

export const AdminCustomersView: React.FC = () => {
  const { orders, navigateTo } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Aggregate customers from orders
  const customerMap = new Map<string, AggregatedCustomer>();

  orders.forEach(o => {
    const key = o.customerPhone || o.customerEmail || o.customerName;
    if (!key) return;

    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: key,
        name: o.customerName || 'Customer',
        phone: o.customerPhone || '',
        email: o.customerEmail,
        orderCount: 1,
        totalSpend: o.totalAmount || 0,
        lastOrderDate: o.createdAt,
        accountType: o.customerEmail ? 'registered' : 'guest'
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.orderCount += 1;
      existing.totalSpend += o.totalAmount || 0;
      if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.createdAt;
      }
    }
  });

  const customerList = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpend - a.totalSpend
  );

  const filteredCustomers = customerList.filter(c => {
    const q = searchTerm.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q));
  });

  const totalRevenue = customerList.reduce((sum, c) => sum + c.totalSpend, 0);

  return (
    <AdminSectionPlaceholder
      title="Customer Directory & Retail Accounts"
      subtitle="Complete database of verified retail buyers, corporate liaisons, and repeat stationery clients."
      sectionCode="customers"
      scheduledPhase="Phase 4B.5 (Customer Loyalty & B2B Credit Facilities)"
      summaryStats={[
        { label: 'Unique Customers', value: customerList.length },
        { label: 'Lifetime Retail Value', value: formatPrice(totalRevenue) },
        { label: 'Repeat Buyers (>1 order)', value: customerList.filter(c => c.orderCount > 1).length },
        { label: 'Registered Verified', value: customerList.filter(c => c.accountType === 'registered').length }
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
              placeholder="Search customer by name, phone or email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Ranked by lifetime purchase value
          </p>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Total Orders</th>
                    <th className="p-4">Lifetime Spend</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4 text-right">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                            <span className="text-[10px] text-slate-400 capitalize">{c.accountType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                        {c.phone || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {c.email || 'N/A'}
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {c.orderCount} order(s)
                      </td>
                      <td className="p-4 font-black text-slate-900 dark:text-white">
                        {formatPrice(c.totalSpend)}
                      </td>
                      <td className="p-4 text-slate-400">
                        {formatDate(c.lastOrderDate)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigateTo('/admin/orders')}
                          className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors"
                          title="View customer orders"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
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
