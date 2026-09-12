import React from 'react';
import {
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Mail,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TK_PHONE_DISPLAY, createWhatsAppUrl } from '../../utils/whatsapp';

export const Footer: React.FC = () => {
  const { navigateTo, storeSettings } = useApp();
  const phoneDisplay = storeSettings?.displayPhoneNumber || storeSettings?.paymentWhatsAppNumber || TK_PHONE_DISPLAY;
  const rawWhatsApp = storeSettings?.paymentWhatsAppNumber || '0787754202';

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs">
                TK
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight leading-none block">
                  TK STATIONERY
                </span>
                <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase">
                  Stationery • Printing • Digital Solutions
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Kituo chako namba moja cha vifaa vya shule na ofisi, uchapaji wa nyaraka (laser printing, binding, passport photos), na msaada wa huduma za serikali mtandaoni (NIDA, TRA, Polisi, RITA) jijini Dar es Salaam.
            </p>

            {/* Direct WhatsApp CTA */}
            <div className="pt-2">
              <a
                href={createWhatsAppUrl('Hello TK Stationery! I need assistance.', rawWhatsApp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp: {phoneDisplay}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Shop Departments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 border-b border-slate-800 pb-2">
              Shop Stationery
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'School Supplies', path: '/shop?category=School Supplies' },
                { label: 'Office Supplies', path: '/shop?category=Office Supplies' },
                { label: 'Writing & Pens', path: '/shop?category=Writing Materials' },
                { label: 'Paper Reams & Rolls', path: '/shop?category=Paper & Printing' },
                { label: 'Files & Folders', path: '/shop?category=Files & Folders' },
                { label: 'Computer Accessories', path: '/shop?category=Computer Accessories' },
                { label: 'Track My Order', path: '/track-order' }
              ].map(link => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => navigateTo(link.path)}
                    className="text-slate-400 hover:text-amber-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services & Assistance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 border-b border-slate-800 pb-2">
              Huduma Kuu
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'Huduma za Serikali (NIDA/TRA)', path: '/online-services' },
                { label: 'Uchapaji wa Nyaraka (Printing)', path: '/printing' },
                { label: 'Binding na Hardcover Thesis', path: '/printing' },
                { label: 'Picha za Pasipoti (Passport)', path: '/printing' },
                { label: 'Uchapaji wa Risiti & Ankara', path: '/printing' },
                { label: 'Kikokotoo cha Bei ya Printing', path: '/printing' },
                { label: 'Ripoti ya Polisi ya Upotevu', path: '/online-services?focus=POLICE' }
              ].map(link => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => navigateTo(link.path)}
                    className="text-slate-400 hover:text-amber-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Location & Operating Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 border-b border-slate-800 pb-2">
              Store & Operations
            </h4>

            <div className="flex items-start gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Manzese, Dar es Salaam (Karibia na Kituo cha Mwendokasi cha Bakhresa)</span>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p>Mon - Sat: 8:00 AM - 7:30 PM</p>
                <p className="text-slate-500">Sun & Holidays: 10:00 AM - 4:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{TK_PHONE_DISPLAY}</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="py-6 border-b border-slate-800/80">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs text-slate-400 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-200">Legal Compliance & Public Service Notice:</strong>{' '}
              TK Stationery is an independent private stationery, document processing, and technology bureau.
              TK Stationery is <strong>NOT</strong> an official government institution, department, or agent of NIDA, TRA, Police Force, RITA, NAPA, or any government ministry.
              Official government statutory fees are paid directly to government accounts via <strong>GePG Control Numbers</strong>. TK Stationery only charges independent fees for document typing, scanning, printing, and digital portal navigation.
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Mock preview */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TK Stationery. All Rights Reserved.</p>

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-slate-400">Supported Methods:</span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 text-[10px] font-semibold">
              M-Pesa / Tigo Pesa
            </span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 text-[10px] font-semibold">
              Cash on Delivery
            </span>
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400 text-[10px] font-semibold">
              Bank Transfer
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
