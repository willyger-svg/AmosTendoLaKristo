import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
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

      await auditLogService.logAdminAction({
        action: 'store_settings_updated',
        actorId: currentUser?.uid || userProfile?.id || 'admin_master',
        actorEmail: currentUser?.email || userProfile?.email || 'admin1010@tkstationery.co.tz',
        actorName: userProfile?.fullName || currentUser?.displayName || 'Msimamizi Mkuu',
        actorRole: userRole,
        targetType: 'settings',
        targetId: 'store_settings',
        targetTitle: 'Mipangilio ya Duka (Store Configuration)',
        details: {
          storeName: form.storeName,
          supportPhone: form.supportPhone,
          whatsappOrderNumber: form.whatsappOrderNumber
        },
        severity: 'critical',
        category: 'settings'
      });

      showToast({
        type: 'success',
        title: 'Mipangilio Imehifadhiwa',
        message: 'Mipangilio ya duka imesasishwa kikamilifu.'
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Hitilafu',
        message: 'Imeshindwa kuhifadhi mipangilio ya duka.'
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
            <span>Mipangilio ya Duka & Usafirishaji wa WhatsApp</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Taarifa kuu za duka, namba za kupokelea malipo ya simu (M-Pesa / Tigo Pesa), na gharama za uwasilishaji.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Store Info */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-500" />
            <span>Utambulisho wa Duka</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jina la Duka
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
                Sarafu ya Duka
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
                Namba ya Huduma kwa Wateja
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
                Namba ya WhatsApp ya Kupokea Oda
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
                Gharama ya Kawaida ya Uwasilishaji (TZS)
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
            <span>Namba za Malipo ya Simu (Lipa Namba)</span>
          </h4>
          <p className="text-xs text-slate-400">
            Namba hizi huonyeshwa moja kwa moja kwa wateja wanapochagua kulipa kwa mtandao wa simu wakati wa kulipia oda.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                M-Pesa (Vodacom)
              </span>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Lipa Namba / Till</label>
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
                <label className="block text-[11px] text-slate-500 mb-1">Jina Lililosajiliwa</label>
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
                <label className="block text-[11px] text-slate-500 mb-1">Lipa Namba / Till</label>
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
                <label className="block text-[11px] text-slate-500 mb-1">Jina Lililosajiliwa</label>
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
            <span>{isSaving ? 'Inahifadhi Mipangilio...' : 'Hifadhi Mipangilio Yote'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
