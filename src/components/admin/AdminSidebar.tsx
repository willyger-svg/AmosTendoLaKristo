import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { canAccessSection, AdminSectionId, ADMIN_ROLE_CONFIGS } from '../../utils/adminPermissions';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  FileCheck,
  Globe,
  Package,
  FolderTree,
  Boxes,
  Users,
  FileText,
  Megaphone,
  Layers,
  Wrench,
  Bell,
  ShieldCheck,
  History,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
  ShieldAlert
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void; // Called when clicking link on mobile to close drawer
}

interface NavItemConfig {
  id: AdminSectionId;
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  badgeVariant?: 'amber' | 'blue' | 'emerald' | 'rose' | 'slate';
}

interface NavGroupConfig {
  groupTitle: string;
  items: NavItemConfig[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onNavigate
}) => {
  const { currentPath, navigateTo, orders, serviceTickets, quoteRequests, products } = useApp();
  const { userProfile, userRole, logout } = useAuth();

  // Calculate live badge counts
  const pendingOrdersCount = orders.filter(o => o.status === 'Submitted' || o.status === 'Processing').length;
  const activeTicketsCount = serviceTickets.filter(t => t.status === 'Received' || t.status === 'In Progress').length;
  const newQuotesCount = quoteRequests.filter(q => q.status === 'Received' || q.status === 'New').length;
  const lowStockCount = products.filter(p => p.stockCount <= 5).length;

  const roleConfig = ADMIN_ROLE_CONFIGS[userRole] || ADMIN_ROLE_CONFIGS.customer;

  const navGroups: NavGroupConfig[] = [
    {
      groupTitle: 'Muhtasari',
      items: [
        {
          id: 'dashboard',
          path: '/admin',
          label: 'Dashibodi Kuu',
          icon: LayoutDashboard
        }
      ]
    },
    {
      groupTitle: 'Mauzo & Stoo',
      items: [
        {
          id: 'orders',
          path: '/admin/orders',
          label: 'Oda za Wateja',
          icon: ShoppingBag,
          badgeCount: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeVariant: 'amber'
        },
        {
          id: 'payments',
          path: '/admin/payments',
          label: 'Malipo',
          icon: CreditCard
        },
        {
          id: 'products',
          path: '/admin/products',
          label: 'Bidhaa',
          icon: Package
        },
        {
          id: 'categories',
          path: '/admin/categories',
          label: 'Kategoria',
          icon: FolderTree
        },
        {
          id: 'inventory',
          path: '/admin/inventory',
          label: 'Hesabu ya Stoo',
          icon: Boxes,
          badgeCount: lowStockCount > 0 ? lowStockCount : undefined,
          badgeVariant: 'rose'
        }
      ]
    },
    {
      groupTitle: 'Wateja & Huduma',
      items: [
        {
          id: 'customers',
          path: '/admin/customers',
          label: 'Wateja',
          icon: Users
        },
        {
          id: 'service-requests',
          path: '/admin/service-requests',
          label: 'Maombi ya Huduma',
          icon: FileCheck,
          badgeCount: activeTicketsCount > 0 ? activeTicketsCount : undefined,
          badgeVariant: 'blue'
        },
        {
          id: 'quotes',
          path: '/admin/quotes',
          label: 'Nukuu za Bei',
          icon: Globe,
          badgeCount: newQuotesCount > 0 ? newQuotesCount : undefined,
          badgeVariant: 'emerald'
        },
        {
          id: 'documents',
          path: '/admin/documents',
          label: 'Nyaraka & Faili',
          icon: FileText
        }
      ]
    },
    {
      groupTitle: 'Maudhui & Matangazo',
      items: [
        {
          id: 'advertisements',
          path: '/admin/advertisements',
          label: 'Mabango ya Matangazo',
          icon: Megaphone
        },
        {
          id: 'content',
          path: '/admin/content',
          label: 'Maudhui ya Tovuti',
          icon: Layers
        },
        {
          id: 'services',
          path: '/admin/services',
          label: 'Usimamizi wa Huduma',
          icon: Wrench
        },
        {
          id: 'notifications',
          path: '/admin/notifications',
          label: 'Arifa za Mfumo',
          icon: Bell
        }
      ]
    },
    {
      groupTitle: 'Mfumo & Usalama',
      items: [
        {
          id: 'staff',
          path: '/admin/staff',
          label: 'Wafanyakazi & Majukumu',
          icon: ShieldCheck
        },
        {
          id: 'audit-logs',
          path: '/admin/activity-logs',
          label: 'Activity Logs (Shughuli)',
          icon: Activity
        },
        {
          id: 'settings',
          path: '/admin/settings',
          label: 'Mipangilio ya Mfumo',
          icon: Settings
        }
      ]
    }
  ];

  const handleLinkClick = (path: string) => {
    navigateTo(path);
    if (onNavigate) {
      onNavigate();
    }
  };

  const isCurrentActive = (itemPath: string, itemId: string) => {
    if (itemId === 'dashboard') {
      return currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/dashboard';
    }
    if (itemId === 'audit-logs') {
      return currentPath.startsWith('/admin/activity-logs') || currentPath.startsWith('/admin/audit-logs');
    }
    return currentPath === itemPath || currentPath.startsWith(itemPath + '/');
  };

  return (
    <aside
      className={`bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-all duration-300 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div
          onClick={() => handleLinkClick('/admin')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            TK
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-wide truncate">TK Stationery</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              </div>
              <p className="text-[11px] font-semibold text-amber-400/90 truncate uppercase tracking-wider">
                Kituo cha Usimamizi
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Panua menyu' : 'Kunja menyu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map(group => {
          // Filter items by role capability
          const accessibleItems = group.items.filter(item => canAccessSection(userRole, item.id));
          if (accessibleItems.length === 0) return null;

          return (
            <div key={group.groupTitle} className="space-y-1">
              {!isCollapsed && (
                <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  {group.groupTitle}
                </h4>
              )}

              <div className="space-y-0.5">
                {accessibleItems.map(item => {
                  const Icon = item.icon;
                  const active = isCurrentActive(item.path, item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleLinkClick(item.path)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative min-h-[44px] ${
                        active
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          active ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                        }`}
                      />

                      {!isCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}

                      {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            active
                              ? 'bg-slate-950 text-amber-400'
                              : item.badgeVariant === 'rose'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : item.badgeVariant === 'emerald'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : item.badgeVariant === 'blue'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {item.badgeCount}
                        </span>
                      )}

                      {/* Floating Tooltip if collapsed */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                          {item.label}
                          {item.badgeCount !== undefined && ` (${item.badgeCount})`}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User & Role Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950">
        <div className={`flex items-center gap-3 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-sm border border-slate-700 flex-shrink-0 overflow-hidden">
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.fullName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              (userProfile?.fullName || 'AD').slice(0, 2).toUpperCase()
            )}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {userProfile?.fullName || 'Msimamizi'}
              </p>
              <span className={`inline-block text-[9px] px-2 py-0.5 rounded-md ${roleConfig.badgeClass}`}>
                {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : 'Mhudumu (Staff)'}
              </span>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={() => logout()}
              title="Toka kwenye akaunti"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
