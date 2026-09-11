import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/auth/authService';
import { formatDate } from '../../utils/formatters';
import {
  Settings,
  Languages,
  Moon,
  Sun,
  Laptop,
  KeyRound,
  ShieldCheck,
  Mail,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface AccountSettingsSectionProps {
  onSignOut: () => void;
  showToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message: string }) => void;
  onNavigatePath: (path: string) => void;
}

export const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  onSignOut,
  showToast,
  onNavigatePath
}) => {
  const { currentUser, userProfile } = useAuth();
  const { language, setLanguage } = useTranslation();
  const { theme, setTheme } = useApp();

  const [isSendingReset, setIsSendingReset] = useState(false);

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;

    setIsSendingReset(true);
    try {
      await authService.resetPassword(currentUser.email);
      showToast({
        type: 'success',
        title: language === 'sw' ? 'Barua Pepe Imetumwa' : 'Reset Email Sent',
        message: language === 'sw'
          ? `Kiungo cha kubadilisha nenosiri kimetumwa kwa ${currentUser.email}. Tafadhali kagua kikasha chako au spam.`
          : `A password reset link has been sent to ${currentUser.email}. Please check your inbox or spam folder.`
      });
    } catch (err: any) {
      console.warn('Password reset error:', err);
      showToast({
        type: 'error',
        title: language === 'sw' ? 'Hitilafu' : 'Error',
        message: err.message || 'Could not send password reset email.'
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. App Preferences (Language & Theme) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-amber-500" />
            <span>{language === 'sw' ? 'Lugha & Muonekano (Language & Theme)' : 'Language & Display Preferences'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'sw'
              ? 'Chagua lugha unayoipendelea na mwanga wa skrini.'
              : 'Customize the portal display language and appearance.'}
          </p>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {language === 'sw' ? 'Lugha ya Mfumo' : 'Portal Language'}
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setLanguage('sw')}
              className={`p-3.5 rounded-2xl border text-left transition-all min-h-[44px] ${
                language === 'sw'
                  ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-slate-900 dark:text-white font-bold ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Kiswahili</span>
                {language === 'sw' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Lugha ya Taifa ya Tanzania</span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3.5 rounded-2xl border text-left transition-all min-h-[44px] ${
                language === 'en'
                  ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-slate-900 dark:text-white font-bold ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">English</span>
                {language === 'en' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Standard English</span>
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            {language === 'sw' ? 'Muonekano wa Skrini (Theme)' : 'Display Theme'}
          </label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all min-h-[44px] ${
                theme === 'light'
                  ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-slate-900 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-[11px]">{language === 'sw' ? 'Mchana' : 'Light'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all min-h-[44px] ${
                theme === 'dark'
                  ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-white font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px]">{language === 'sw' ? 'Giza' : 'Dark'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all min-h-[44px] ${
                theme === 'system'
                  ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-slate-900 dark:text-white font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Laptop className="w-4 h-4 text-slate-500" />
              <span className="text-[11px]">{language === 'sw' ? 'Kiotomatiki' : 'System'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Account Security & Password */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>{language === 'sw' ? 'Usalama & Nenosiri' : 'Account Security & Password'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'sw'
              ? 'Badilisha au fanya upya nenosiri lako kupitia barua pepe yako salama.'
              : 'Manage your password and review account security status.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'sw' ? 'Weka Upya Nenosiri (Password Reset)' : 'Reset Account Password'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'sw'
                ? `Barua pepe yenye kiungo cha kuweka nenosiri jipya itatumwa kwa ${currentUser?.email}.`
                : `We will send a secure password reset link to ${currentUser?.email}.`}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isSendingReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 text-xs font-bold transition-colors flex-shrink-0 min-h-[44px]"
          >
            {isSendingReset ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'sw' ? 'Inatuma...' : 'Sending...'}</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>{language === 'sw' ? 'Tuma Kiungo cha Nenosiri' : 'Send Reset Email'}</span>
              </>
            )}
          </button>
        </div>

        {/* Security Diagnostics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Authentication Provider:</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Firebase Secure Auth (Email & Password)</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">User Unique ID:</span>
            <p className="font-mono text-slate-700 dark:text-slate-300 truncate">
              {currentUser?.uid}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Session & Sign Out */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>{language === 'sw' ? 'Kipindi cha Akaunti (Session)' : 'Active Session'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'sw'
              ? 'Ukimaliza shughuli zako, unaweza kutoka kwenye akaunti yako ili kulinda usalama wa vifaa na nukuu zako.'
              : 'Sign out of your TK Stationery account to protect your orders and sensitive documents.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>{language === 'sw' ? 'Toka kwenye Akaunti' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );
};
