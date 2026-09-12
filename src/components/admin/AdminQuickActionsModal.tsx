import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { canAccessSection } from '../../utils/adminPermissions';
import {
  Zap,
  X,
  ShoppingBag,
  CreditCard,
  PackagePlus,
  Boxes,
  FileCheck,
  Globe,
  Megaphone,
  Users,
  Settings,
  ShieldCheck,
  History,
  ArrowRight
} from 'lucide-react';

interface AdminQuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickActionConfig {
  id: string;
  title: string;
  desc: string;
  targetPath: string;
  requiredSection: any;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const AdminQuickActionsModal: React.FC<AdminQuickActionsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { navigateTo } = useApp();
  const { userRole } = useAuth();

  const actions: QuickActionConfig[] = [
    {
      id: 'view_orders',
      title: 'Fuatilia Oda za Wateja',
      desc: 'Angalia oda mpya zilizowasilishwa na rekodi ya uwasilishaji.',
      targetPath: '/admin/orders',
      requiredSection: 'orders',
      icon: ShoppingBag,
      color: 'bg-amber-500 text-slate-950'
    },
    {
      id: 'verify_payments',
      title: 'Uhakiki wa Malipo (Manual Payments)',
      desc: 'Thibitisha malipo ya M-Pesa na Tigo Pesa yaliyowasilishwa na wateja.',
      targetPath: '/admin/payments',
      requiredSection: 'payments',
      icon: CreditCard,
      color: 'bg-emerald-500 text-white'
    },
    {
      id: 'add_product',
      title: 'Ongeza Bidhaa Mpya',
      desc: 'Weka bidhaa mpya ya ofisi au shule na bei yake kwenye katalogi.',
      targetPath: '/admin/products',
      requiredSection: 'products',
      icon: PackagePlus,
      color: 'bg-blue-600 text-white'
    },
    {
      id: 'check_inventory',
      title: 'Kagua Hesabu za Stoo (Inventory)',
      desc: 'Tazama bidhaa zinazoelekea kuisha na rekebisha idadi ya stoo.',
      targetPath: '/admin/inventory',
      requiredSection: 'inventory',
      icon: Boxes,
      color: 'bg-rose-500 text-white'
    },
    {
      id: 'review_tickets',
      title: 'Tiketi za Huduma (Print/Gov)',
      desc: 'Shughulikia kazi za uchapishaji wa haraka au fomu za serikali.',
      targetPath: '/admin/service-requests',
      requiredSection: 'service-requests',
      icon: FileCheck,
      color: 'bg-purple-600 text-white'
    },
    {
      id: 'review_quotes',
      title: 'Nukuu za Mifumo & Software',
      desc: 'Kagua maombi ya nukuu ya mifumo na mawasiliano ya mteja.',
      targetPath: '/admin/quotes',
      requiredSection: 'quotes',
      icon: Globe,
      color: 'bg-teal-600 text-white'
    },
    {
      id: 'create_ad',
      title: 'Tengeneza Bango la Tangazo',
      desc: 'Weka ofa maalum au bango la punguzo la bei ukurasa wa mwanzo.',
      targetPath: '/admin/advertisements',
      requiredSection: 'advertisements',
      icon: Megaphone,
      color: 'bg-amber-600 text-white'
    },
    {
      id: 'customer_directory',
      title: 'Orodha ya Wateja',
      desc: 'Tazama akaunti za wateja, namba za simu, barua pepe na rekodi zao.',
      targetPath: '/admin/customers',
      requiredSection: 'customers',
      icon: Users,
      color: 'bg-indigo-600 text-white'
    },
    {
      id: 'store_settings',
      title: 'Mipangilio ya Duka & Namba za Malipo',
      desc: 'Sasisha namba za WhatsApp, M-Pesa, Tigo Pesa na maelekezo ya duka.',
      targetPath: '/admin/settings',
      requiredSection: 'settings',
      icon: Settings,
      color: 'bg-slate-700 text-white'
    },
    {
      id: 'staff_rbac',
      title: 'Wafanyakazi & Majukumu (RBAC)',
      desc: 'Gawa majukumu ya Staff, Admin au Super Admin kwa watumiaji.',
      targetPath: '/admin/staff',
      requiredSection: 'staff',
      icon: ShieldCheck,
      color: 'bg-amber-500 text-slate-950'
    },
    {
      id: 'audit_logs',
      title: 'Kumbukumbu za Usalama (Audit Logs)',
      desc: 'Kagua kumbukumbu rasmi za mabadiliko yaliyofanywa kwenye mfumo.',
      targetPath: '/admin/audit-logs',
      requiredSection: 'audit-logs',
      icon: History,
      color: 'bg-slate-900 text-amber-400'
    }
  ];

  const allowedActions = actions.filter(a => canAccessSection(userRole, a.requiredSection));

  const handleSelect = (path: string) => {
    navigateTo(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Vitendo vya Haraka vya Usimamizi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Njia za mkato kulingana na idhini yako ya kiutendaji
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allowedActions.map(action => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => handleSelect(action.targetPath)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 bg-white dark:bg-slate-800/50 hover:bg-amber-50/50 dark:hover:bg-slate-800 cursor-pointer transition-all flex items-start gap-3 group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${action.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                      {action.title}
                    </p>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {action.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Njia {allowedActions.length} za mkato zinapatikana</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
          >
            Funga
          </button>
        </div>
      </div>
    </div>
  );
};
