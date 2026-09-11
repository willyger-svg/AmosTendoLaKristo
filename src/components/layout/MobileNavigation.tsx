import React from 'react';
import {
  X,
  Home,
  ShoppingBag,
  FileText,
  Printer,
  Sparkles,
  Cpu,
  Globe,
  Search,
  MessageSquare,
  User,
  Info,
  PhoneCall,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createWhatsAppUrl, TK_PHONE_DISPLAY } from '../../utils/whatsapp';
import { HelpCircle } from 'lucide-react';

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose
}) => {
  const { navigateTo, currentPath, openModal } = useApp();
  const { currentUser, userProfile } = useAuth();

  if (!isOpen) return null;

  const handleNav = (path: string) => {
    onClose();
    navigateTo(path);
  };

  const handleQuickHelp = () => {
    onClose();
    openModal({ type: 'quick-help' });
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { label: 'Shop Stationery', path: '/shop', icon: <ShoppingBag className="w-5 h-5" />, badge: 'Store' },
    { label: 'Online Public Services', path: '/online-services', icon: <ShieldCheck className="w-5 h-5" />, badge: 'NIDA/TRA' },
    { label: 'Printing & Document Hub', path: '/printing', icon: <Printer className="w-5 h-5" /> },
    { label: 'Graphic Design Studio', path: '/graphic-design', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'IT Support & Hardware', path: '/it-support', icon: <Cpu className="w-5 h-5" /> },
    { label: 'Digital Solutions & Software', path: '/digital-solutions', icon: <Globe className="w-5 h-5" />, badge: 'Systems' },
    { label: 'Track Order / Ticket', path: '/track-order', icon: <Search className="w-5 h-5" /> },
    { label: 'Customer Account', path: '/account', icon: <User className="w-5 h-5" /> },
    { label: 'About TK Stationery', path: '/about', icon: <Info className="w-5 h-5" /> },
    { label: 'Contact Us', path: '/contact', icon: <PhoneCall className="w-5 h-5" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">
              TK
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                TK STATIONERY
              </h3>
              <p className="text-[10px] text-amber-400 font-medium">
                Dar es Salaam, Tanzania
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Quick Help Button */}
          <button
            type="button"
            onClick={handleQuickHelp}
            className="w-full flex items-center justify-between p-3 mb-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-xs active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-slate-950" />
              <span>What Do You Need?</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-950 opacity-70" />
          </button>

          {navLinks.map(item => {
            const active =
              item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path);

            const isAccount = item.path === '/account';
            const hasAvatar = isAccount && currentUser && userProfile?.avatarUrl;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {hasAvatar ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt="Account Avatar"
                      className="w-5 h-5 rounded-full object-cover border border-amber-400"
                    />
                  ) : (
                    <span className={active ? 'text-amber-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                  )}
                  <span>
                    {isAccount && currentUser && userProfile?.fullName
                      ? userProfile.fullName
                      : item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-sm bg-slate-100 text-slate-700">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Drawer Contact & Helpline */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          <a
            href={createWhatsAppUrl('Hello TK Stationery! I need assistance.')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp ({TK_PHONE_DISPLAY})</span>
          </a>
        </div>
      </div>
    </div>
  );
};
