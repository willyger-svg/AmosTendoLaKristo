import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../context/LanguageContext';
import { auditLogService } from '../../../services/audit/auditLogService';
import { StoreSettings } from '../../../types';
import {
  Settings,
  Store,
  Phone,
  CreditCard,
  Building2,
  Save,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { storeSettings, updateStoreSettings, showToast } = useApp();
  const { currentUser, userRole, userProfile } = useAuth();
  const { language } = useTranslation();

  const [form, setForm] = useState<StoreSettings>(storeSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (storeSettings) {
      setForm(storeSettings);
    }
  }, [storeSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStoreSettings(form);

      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'store_settings_updated',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: userProfile?.fullName || '',
          actorRole: userRole,
          targetType: 'settings',
          targetId: 'store_settings',
          targetTitle: 'Store Configuration',
          details: {
            storeName: form.storeName,
            supportPhone: form.supportPhone,
            whatsappOrderNumber: form.whatsappOrderNumber
          }
        });
      }

      showToast({
        type: 'success',
        title: language === 'sw' ? 'Mipangilio Imehifadhiwa' : 'Settings Saved',
        message: 'Store configurations updated in database.'
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Could not save store settings.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>Store Settings & WhatsApp Dispatch</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Global store metadata, Tanzanian mobile money receiving numbers, and order delivery fees.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Store Info */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-500" />
            <span>General Shop Identity</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={form.storeName || ''}
                onChange={e => setForm({ ...form, storeName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Storefront Currency
              </label>
              <input
                type="text"
                value={form.currency || 'TZS'}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Support Phone
              </label>
              <input
                type="text"
                value={form.supportPhone || ''}
                onChange={e => setForm({ ...form, supportPhone: e.target.value })}
                placeholder="+255 700 000 000"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Order Dispatch Line
              </label>
              <input
                type="text"
                value={form.whatsappOrderNumber || ''}
                onChange={e => setForm({ ...form, whatsappOrderNumber: e.target.value })}
                placeholder="+255 700 000 000"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Standard Delivery Fee (TZS)
              </label>
              <input
                type="number"
                min={0}
                value={form.deliveryFee || 0}
                onChange={e => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-black"
              />
            </div>
          </div>
        </div>

        {/* Tanzanian Manual Payment Accounts */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>Tanzanian Mobile Money & Bank Lipa Numbers</span>
          </h4>
          <p className="text-xs text-slate-400">
            These account credentials are automatically displayed to customers when choosing manual transfer during checkout.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                M-Pesa (Vodacom)
              </span>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Till / Lipa Namba</label>
                <input
                  type="text"
                  value={form.paymentAccounts?.mpesa?.number || ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      paymentAccounts: {
                        ...form.paymentAccounts,
                        mpesa: { ...form.paymentAccounts?.mpesa, number: e.target.value }
                      }
                    })
                  }
                  placeholder="552211"
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Account / Registered Name</label>
                <input
                  type="text"
                  value={form.paymentAccounts?.mpesa?.name || ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      paymentAccounts: {
                        ...form.paymentAccounts,
                        mpesa: { ...form.paymentAccounts?.mpesa, name: e.target.value }
                      }
                    })
                  }
                  placeholder="TK Stationery Co."
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Tigo Pesa / Mixx by Yas
              </span>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Till / Lipa Namba</label>
                <input
                  type="text"
                  value={form.paymentAccounts?.tigoPesa?.number || ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      paymentAccounts: {
                        ...form.paymentAccounts,
                        tigoPesa: { ...form.paymentAccounts?.tigoPesa, number: e.target.value }
                      }
                    })
                  }
                  placeholder="883322"
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Account / Registered Name</label>
                <input
                  type="text"
                  value={form.paymentAccounts?.tigoPesa?.name || ''}
                  onChange={e =>
                    setForm({
                      ...form,
                      paymentAccounts: {
                        ...form.paymentAccounts,
                        tigoPesa: { ...form.paymentAccounts?.tigoPesa, name: e.target.value }
                      }
                    })
                  }
                  placeholder="TK Stationery Co."
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Configurations...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
