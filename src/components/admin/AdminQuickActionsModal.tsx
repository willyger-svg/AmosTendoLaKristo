import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
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
  titleSw: string;
  titleEn: string;
  descSw: string;
  descEn: string;
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
  const { language } = useTranslation();

  const actions: QuickActionConfig[] = [
    {
      id: 'view_orders',
      titleSw: 'Fuatilia Oda za Wateja',
      titleEn: 'Review Customer Orders',
      descSw: 'Angalia oda mpya zilizowasilishwa na rekodi ya uwasilishaji.',
      descEn: 'Inspect recently submitted customer orders and dispatch statuses.',
      targetPath: '/admin/orders',
      requiredSection: 'orders',
      icon: ShoppingBag,
      color: 'bg-amber-500 text-slate-950'
    },
    {
      id: 'verify_payments',
      titleSw: 'Uhakiki wa Malipo (Manual Payments)',
      titleEn: 'Verify Pending Payments',
      descSw: 'Thibitisha malipo ya M-Pesa/Tigo Pesa yaliyowasilishwa.',
      descEn: 'Confirm mobile money and bank transfer receipts from customers.',
      targetPath: '/admin/payments',
      requiredSection: 'payments',
      icon: CreditCard,
      color: 'bg-emerald-500 text-white'
    },
    {
      id: 'add_product',
      titleSw: 'Ongeza Bidhaa Mpya Katalogi',
      titleEn: 'Add Catalog Product',
      descSw: 'Weka bidhaa mpya ya ofisi au shule na bei yake.',
      descEn: 'List a new office or school supply product with inventory count.',
      targetPath: '/admin/products',
      requiredSection: 'products',
      icon: PackagePlus,
      color: 'bg-blue-600 text-white'
    },
    {
      id: 'check_inventory',
      titleSw: 'Kagua Hesabu za Stoo (Inventory)',
      titleEn: 'Review Low Stock Inventory',
      descSw: 'Tazama bidhaa zinazoelekea kuisha na rekebisha idadi.',
      descEn: 'Monitor depleted items and adjust on-shelf inventory levels.',
      targetPath: '/admin/inventory',
      requiredSection: 'inventory',
      icon: Boxes,
      color: 'bg-rose-500 text-white'
    },
    {
      id: 'review_tickets',
      titleSw: 'Tiketi za Huduma (Print/Gov)',
      titleEn: 'Service Tickets Queue',
      descSw: 'Shughulikia kazi za chapisho haraka au fomu za serikali.',
      descEn: 'Process print wizard jobs or public portal document filings.',
      targetPath: '/admin/service-requests',
      requiredSection: 'service-requests',
      icon: FileCheck,
      color: 'bg-purple-600 text-white'
    },
    {
      id: 'review_quotes',
      titleSw: 'Nukuu za Mifumo & Software',
      titleEn: 'Tech Quotes & Leads',
      descSw: 'Kagua maombi ya nukuu ya mifumo na mawasiliano ya mteja.',
      descEn: 'Review tech quote requests and customer requirement specifications.',
      targetPath: '/admin/quotes',
      requiredSection: 'quotes',
      icon: Globe,
      color: 'bg-teal-600 text-white'
    },
    {
      id: 'create_ad',
      titleSw: 'Tengeneza Bango la Tangazo',
      titleEn: 'Create Promo Announcement',
      descSw: 'Weka ofa maalum au bango la punguzo la bei ukurasa wa mwanzo.',
      descEn: 'Publish a hero banner offer or seasonal discount highlight.',
      targetPath: '/admin/advertisements',
      requiredSection: 'advertisements',
      icon: Megaphone,
      color: 'bg-amber-600 text-white'
    },
    {
      id: 'customer_directory',
      titleSw: 'Orodha ya Wateja',
      titleEn: 'Customer Profiles Directory',
      descSw: 'Tazama akaunti za wateja, simu, barua pepe na rekodi zao.',
      descEn: 'Browse registered buyer accounts and activity profiles.',
      targetPath: '/admin/customers',
      requiredSection: 'customers',
      icon: Users,
      color: 'bg-indigo-600 text-white'
    },
    {
      id: 'store_settings',
      titleSw: 'Mipangilio ya Duka & Namba za Malipo',
      titleEn: 'Store & Payment Settings',
      descSw: 'Sasisha namba za WhatsApp, M-Pesa, Tigo Pesa na maelekezo.',
      descEn: 'Configure store contact phone, bank details and WhatsApp dispatch.',
      targetPath: '/admin/settings',
      requiredSection: 'settings',
      icon: Settings,
      color: 'bg-slate-700 text-white'
    },
    {
      id: 'staff_rbac',
      titleSw: 'Wafanyakazi & Majukumu (RBAC)',
      titleEn: 'Staff & Team Permissions',
      descSw: 'Gawa majukumu ya Staff, Admin au Super Admin kwa watumiaji.',
      descEn: 'Delegate operational, managerial and security privileges.',
      targetPath: '/admin/staff',
      requiredSection: 'staff',
      icon: ShieldCheck,
      color: 'bg-amber-500 text-slate-950'
    },
    {
      id: 'audit_logs',
      titleSw: 'Kumbukumbu za Usalama (Audit Logs)',
      titleEn: 'Security & Action Audit Logs',
      descSw: 'Kagua kumbukumbu rasmi za mabadiliko yaliyofanywa kwenye mfumo.',
      descEn: 'Inspect append-only audit trail of system and financial operations.',
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
                {language === 'sw' ? 'Vitendo vya Haraka vya Usimamizi' : 'Admin Quick Actions'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'sw'
                  ? 'Njia za mkato kulingana na idhini yako ya kiutendaji'
                  : 'Fast operational shortcuts tailored to your authorized role'}
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
                      {language === 'sw' ? action.titleSw : action.titleEn}
                    </p>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {language === 'sw' ? action.descSw : action.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{allowedActions.length} shortcuts available</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
