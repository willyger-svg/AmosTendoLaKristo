import React from 'react';
import { MapPin, Clock, Search, MessageSquare, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { createWhatsAppUrl } from '../../utils/whatsapp';

export const TopBar: React.FC = () => {
  const { navigateTo, storeSettings } = useApp();
  const { theme, setTheme, isDark } = useTheme();

  const currentPhone = storeSettings?.paymentWhatsAppNumber || '0787754202';
  const displayPhone = storeSettings?.displayPhoneNumber || '0787754202';

  return (
    <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left Info */}
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{storeSettings?.storeAddress || 'Manzese, Dar es Salaam (Karibia na Kituo cha Mwendokasi cha Bakhresa)'}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{storeSettings?.businessHours || 'Jumatatu - Jumamosi: Saa 2:00 Asubuhi - Saa 2:00 Usiku'}</span>
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
          {/* WhatsApp / Helpline Link */}
          <a
            href={createWhatsAppUrl('Habari TK Stationery! Nahitaji huduma / maelekezo.', currentPhone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp / Malipo: {displayPhone}</span>
          </a>

          <div className="h-3 w-px bg-slate-700 hidden sm:block" />

          {/* Track Order */}
          <button
            type="button"
            onClick={() => navigateTo('/track-order')}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold hover:underline transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Fuatilia Oda / Tiketi</span>
          </button>

          <div className="h-3 w-px bg-slate-700 hidden sm:block" />

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
            title="Badili Muonekano (Mwangaza / Giza)"
            aria-label="Badili Muonekano"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

