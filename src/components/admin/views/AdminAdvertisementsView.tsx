import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { adService } from '../../../services/ads/adService';
import { auditLogService } from '../../../services/audit/auditLogService';
import { Advertisement, AdPlacement } from '../../../types';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { ImageUploadField } from '../../common/ImageUploadField';

export const AdminAdvertisementsView: React.FC = () => {
  const { advertisements, refreshAds, showToast } = useApp();
  const { currentUser, userRole, userProfile } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [badgeText, setBadgeText] = useState('PROMO');
  const [buttonText, setButtonText] = useState('Tazama Zaidi');
  const [targetUrl, setTargetUrl] = useState('/shop');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80');
  const [placement, setPlacement] = useState<AdPlacement>('hero_banner');
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingAd(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setBadgeText('PROMO');
    setButtonText('Tazama Zaidi');
    setTargetUrl('/shop');
    setImageUrl('https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80');
    setPlacement('hero_banner');
    setIsActive(true);
    setPriority(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setSubtitle(ad.subtitle || '');
    setDescription(ad.description || '');
    setBadgeText(ad.badgeText || 'PROMO');
    setButtonText(ad.buttonText || 'Tazama Zaidi');
    setTargetUrl(ad.targetUrl || '/shop');
    setImageUrl(ad.imageUrl);
    setPlacement(ad.placement);
    setIsActive(ad.isActive);
    setPriority(ad.priority || 1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<Advertisement> = {
        title,
        subtitle,
        description,
        badgeText,
        buttonText,
        targetUrl,
        imageUrl,
        placement,
        isActive,
        priority: Number(priority)
      };

      if (editingAd) {
        await adService.updateAd(editingAd.id, payload);
        if (currentUser) {
          await auditLogService.logAdminAction({
            action: 'ad_updated',
            actorId: currentUser.uid,
            actorEmail: currentUser.email || '',
            actorName: userProfile?.fullName || '',
            actorRole: userRole,
            targetType: 'ad',
            targetId: editingAd.id,
            targetTitle: title,
            details: { placement, isActive }
          });
        }
        showToast({
          type: 'success',
          title: 'Tangazo Limesasishwa',
          message: `${title} limehifadhiwa kwa mafanikio.`
        });
      } else {
        const created = await adService.createAd(payload);
        if (currentUser) {
          await auditLogService.logAdminAction({
            action: 'ad_created',
            actorId: currentUser.uid,
            actorEmail: currentUser.email || '',
            actorName: userProfile?.fullName || '',
            actorRole: userRole,
            targetType: 'ad',
            targetId: created.id,
            targetTitle: title,
            details: { placement, isActive }
          });
        }
        showToast({
          type: 'success',
          title: 'Tangazo Jipya Limeundwa',
          message: `${title} limechapishwa kwenye tovuti.`
        });
      }

      await refreshAds();
      setIsModalOpen(false);
    } catch {
      showToast({ type: 'error', title: 'Hitilafu', message: 'Imeshindwa kuhifadhi tangazo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      const next = !ad.isActive;
      await adService.updateAd(ad.id, { isActive: next });
      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'ad_updated',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: userProfile?.fullName || '',
          actorRole: userRole,
          targetType: 'ad',
          targetId: ad.id,
          targetTitle: ad.title,
          details: { isActive: next }
        });
      }
      await refreshAds();
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not toggle ad status.' });
    }
  };

  const handleDelete = async (ad: Advertisement) => {
    if (!window.confirm(`Are you sure you want to delete "${ad.title}"?`)) return;
    try {
      await adService.deleteAd(ad.id);
      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'ad_deleted',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: userProfile?.fullName || '',
          actorRole: userRole,
          targetType: 'ad',
          targetId: ad.id,
          targetTitle: ad.title
        });
      }
      showToast({ type: 'success', title: 'Deleted', message: 'Ad deleted from database.' });
      await refreshAds();
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not delete ad.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            <span>Mabango na Matangazo ya Duka</span>
          </h3>
          <p className="text-xs text-slate-400">Simamia mabango ya kuteleza, matangazo ya pop-up na ofa maalum za dukani</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Bango Jipya la Tangazo</span>
        </button>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advertisements.map(ad => (
          <div
            key={ad.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col group"
          >
            {/* Banner Image Preview */}
            <div className="relative h-44 bg-slate-950 overflow-hidden">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                  {ad.badgeText || 'OFFA'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                  {ad.placement}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h4 className="text-sm font-black text-white truncate drop-shadow-md">{ad.title}</h4>
                {ad.subtitle && <p className="text-xs text-slate-300 truncate">{ad.subtitle}</p>}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1 text-xs">
                <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                  {ad.description || 'Hakuna maelezo yaliyowekwa.'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">Uelekeo: {ad.targetUrl}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(ad)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    ad.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}
                >
                  {ad.isActive ? 'Lipo Hewani' : 'Limefichwa'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(ad)}
                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Hariri Bango"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Futa Bango"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">
              {editingAd ? 'Hariri Bango la Tangazo' : 'Unda Bango Jipya la Tangazo'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kichwa Kikuu cha Habari *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="mf. Karibu Muhula Mpya — Punguzo la 20%"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kichwa Kidogo
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="mf. Vifaa vyote vya ofisi na shule"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Maandishi ya Beji (Lebo)
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={e => setBadgeText(e.target.value)}
                    placeholder="mf. OFFA MAALUM"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Maandishi ya Kitufe (CTA)
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={e => setButtonText(e.target.value)}
                    placeholder="Nunua Sasa"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ukurasa wa Kuelekea / URL
                  </label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    placeholder="/shop"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Eneo la Kuweka Tangazo
                  </label>
                  <select
                    value={placement}
                    onChange={e => setPlacement(e.target.value as AdPlacement)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="hero_banner">Bango Kuu la Juu (Hero Slider)</option>
                    <option value="home_highlight">Bango la Vivutio vya Nyumbani</option>
                    <option value="popup_modal">Tangazo Linalojitokeza (Popup)</option>
                    <option value="sidebar">Bango la Pembeni (Sidebar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kipaumbele cha Kuonyesha
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={priority}
                    onChange={e => setPriority(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Picha ya Tangazo / Bango *"
                value={imageUrl}
                onChange={url => setImageUrl(url)}
                folder="ads"
                itemId={editingAd?.id || `ad_${Date.now()}`}
                aspectRatio="banner"
                helpText="Pakia picha ya bango kutoka simu au kompyuta yako (inapendekezwa ukubwa mpana wa 1200x400 au 800x400)."
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maelezo ya Tangazo
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ad_is_active"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <label htmlFor="ad_is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Liruhusu lionekane mara moja (Lipo Hewani)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  {isSubmitting ? 'Inahifadhi...' : editingAd ? 'Sasisha Tangazo' : 'Chapisha Tangazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
