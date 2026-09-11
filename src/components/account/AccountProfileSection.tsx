import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { authService } from '../../services/auth/authService';
import { formatDate } from '../../utils/formatters';
import {
  User,
  Camera,
  Mail,
  Phone,
  Building,
  FileBadge,
  MapPin,
  Compass,
  CheckCircle2,
  Shield,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AccountProfileSectionProps {
  onOpenPhotoModal: () => void;
  showToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message: string }) => void;
}

const TANZANIA_REGIONS = [
  'Dar es Salaam',
  'Arusha',
  'Dodoma',
  'Mwanza',
  'Morogoro',
  'Mbeya',
  'Tanga',
  'Kilimanjaro (Moshi)',
  'Zanzibar Mjini Magharibi',
  'Zanzibar Kaskazini',
  'Zanzibar Kusini',
  'Kagera',
  'Iringa',
  'Kigoma',
  'Mara (Musoma)',
  'Manyara (Babati)',
  'Ruvuma (Songea)',
  'Shinyanga',
  'Singida',
  'Tabora',
  'Mtwara',
  'Lindi',
  'Geita',
  'Katavi',
  'Njombe',
  'Simiyu',
  'Songwe',
  'Pwani (Kibaha)'
];

export const AccountProfileSection: React.FC<AccountProfileSectionProps> = ({
  onOpenPhotoModal,
  showToast
}) => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { language } = useTranslation();

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
  const [tin, setTin] = useState(userProfile?.tin || '');
  const [region, setRegion] = useState(userProfile?.region || 'Dar es Salaam');
  const [street, setStreet] = useState(userProfile?.street || '');
  const [address, setAddress] = useState(userProfile?.address || '');

  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setPhone(userProfile.phone || '');
      setCompanyName(userProfile.companyName || '');
      setTin(userProfile.tin || '');
      setRegion(userProfile.region || 'Dar es Salaam');
      setStreet(userProfile.street || '');
      setAddress(userProfile.address || '');
    }
  }, [userProfile]);

  const handleReset = () => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setPhone(userProfile.phone || '');
      setCompanyName(userProfile.companyName || '');
      setTin(userProfile.tin || '');
      setRegion(userProfile.region || 'Dar es Salaam');
      setStreet(userProfile.street || '');
      setAddress(userProfile.address || '');
      setValidationError(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setValidationError(null);

    // Validation
    const cleanName = fullName.trim();
    if (cleanName.length < 3) {
      setValidationError(
        language === 'sw'
          ? 'Tafadhali weka jina kamili lenye angalau herufi 3.'
          : 'Full name must contain at least 3 characters.'
      );
      return;
    }

    const cleanPhone = phone.trim();
    if (cleanPhone && cleanPhone.replace(/[^0-9]/g, '').length < 9) {
      setValidationError(
        language === 'sw'
          ? 'Namba ya simu si sahihi. Tafadhali weka namba halisi (mfano 07XXXXXXXX au 06XXXXXXXX).'
          : 'Invalid phone format. Please enter a valid mobile number.'
      );
      return;
    }

    setIsSaving(true);
    try {
      await authService.updateProfile(currentUser.uid, {
        fullName: cleanName,
        phone: cleanPhone,
        companyName: companyName.trim(),
        tin: tin.trim(),
        region: region.trim(),
        street: street.trim(),
        address: address.trim()
      });

      await refreshUserProfile();

      showToast({
        type: 'success',
        title: language === 'sw' ? 'Wasifu Umeboreshwa' : 'Profile Updated',
        message: language === 'sw'
          ? 'Taarifa zako za wasifu zimehifadhiwa kwa mafanikio.'
          : 'Your account profile details have been saved successfully.'
      });
    } catch (err: any) {
      console.warn('Update profile error:', err);
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Hitilafu ya Kuhifadhi' : 'Save Error',
        message: err.message || 'Could not update profile details.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Photo and Identity */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with click to change */}
          <div className="relative group flex-shrink-0">
            <button
              type="button"
              onClick={onOpenPhotoModal}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-3xl shadow-md overflow-hidden border-2 border-amber-400 hover:opacity-95 transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              title={language === 'sw' ? 'Badili Picha ya Wasifu' : 'Change Profile Photo'}
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.fullName || 'User Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(userProfile?.fullName || currentUser?.email || 'TK').charAt(0).toUpperCase()}</span>
              )}
              <div className="absolute inset-0 bg-slate-950/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-amber-400 mb-0.5" />
                <span className="text-[10px] font-bold">
                  {language === 'sw' ? 'Badili Picha' : 'Change Photo'}
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={onOpenPhotoModal}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 rounded-full flex items-center justify-center shadow-md transition-colors border-2 border-white dark:border-slate-900"
              title={language === 'sw' ? 'Badili Picha ya Wasifu' : 'Change Profile Photo'}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left min-w-0 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {userProfile?.fullName || 'TK Customer'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {language === 'sw' ? 'Akaunti ya Mteja' : 'Customer Account'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentUser?.email}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {language === 'sw' ? 'Akaunti ilifunguliwa:' : 'Account created:'}{' '}
              {userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'Member'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenPhotoModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors min-h-[44px]"
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'sw' ? 'Pakia Picha Mpya' : 'Upload Photo'}</span>
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            <span>{language === 'sw' ? 'Taarifa za Kibinafsi & Biashara' : 'Personal & Business Details'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'sw'
              ? 'Taarifa hizi hutumiwa kwenye ankara, risiti za TRA, na uwasilishaji wa vifaa.'
              : 'These details are used on invoices, receipts, and order deliveries.'}
          </p>
        </div>

        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {language === 'sw' ? 'Jina Kamili (Full Name) *' : 'Full Name *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g., Juma Rashidi Mwamba"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Email (Read-Only) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {language === 'sw' ? 'Barua Pepe (Email Address)' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed min-h-[44px]"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {language === 'sw' ? 'Barua pepe imeunganishwa na mfumo wa usalama na haiwezi kubadilishwa hapa.' : 'Email is linked to your security credentials.'}
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {language === 'sw' ? 'Namba ya Simu (Phone Number)' : 'Phone Number'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0712 345 678 / +255 7..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Company / Business Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {language === 'sw' ? 'Jina la Kampuni au Ofisi (Hiari)' : 'Company / Office Name (Optional)'}
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g., Acacia Consultants Ltd"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* TIN Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {language === 'sw' ? 'Namba ya TIN ya TRA (Hiari)' : 'TRA TIN Number (Optional)'}
            </label>
            <div className="relative">
              <FileBadge className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tin}
                onChange={e => setTin(e.target.value)}
                placeholder="e.g., 123-456-789"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-mono rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Region / City */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {language === 'sw' ? 'Mkoa / Jiji (Region / City)' : 'Region / City'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              >
                {TANZANIA_REGIONS.map(reg => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Street / Ward */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {language === 'sw' ? 'Mtaa / Kata / Eneo' : 'Street / Area / Ward'}
            </label>
            <div className="relative">
              <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder="e.g., Kariakoo, Msimbazi Street"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Full Delivery Address */}
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {language === 'sw' ? 'Anwani Kamili ya Usafirishaji (Delivery Address)' : 'Full Delivery Address'}
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g., Jengo la City Mall, Ghorofa ya 2, Ofisi Na. 204, Dar es Salaam"
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Security / System metadata snippet */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Customer ID: <code className="font-mono text-slate-700 dark:text-slate-300">{currentUser?.uid.slice(0, 14)}...</code></span>
          </div>
          <div>
            <span>Role: <strong className="text-slate-700 dark:text-slate-300 uppercase">Customer</strong></span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Rejesha Awali' : 'Reset'}</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-black shadow-md transition-all min-h-[44px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'sw' ? 'Inahifadhi...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{language === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
