import React from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { createWhatsAppUrl } from '../utils/whatsapp';
import {
  Building2,
  ShieldCheck,
  Award,
  Users,
  Target,
  Sparkles,
  MapPin,
  Clock,
  MessageSquare,
  Printer,
  ShoppingBag,
  Globe
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="py-8 space-y-16">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'About TK Stationery' }]} />

        {/* Hero Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden mt-4">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Founded in Dar es Salaam, Tanzania</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              More Than Just a Stationery Shop
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              TK Stationery is Tanzania’s comprehensive business services, document printing, citizen portal assistance, and digital solutions bureau. We exist to solve everyday educational, administrative, and technological hurdles for people and enterprises.
            </p>
          </div>
        </div>

        {/* 1. Our Story & Purpose */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Our Founding Story
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Bridging Physical Supplies & Modern Digital Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Traditional stationery shops only sell pens and notebooks. When customers need to register for NIDA, pay TRA taxes with a control number, format a university thesis with gold binding, or build an inventory POS system for their retail shop, they are forced to run between different disconnected locations.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>TK Stationery</strong> brings all these critical capabilities under one trusted roof. We supply genuine stationery from leading global manufacturers while deploying software engineers to build custom web and mobile business systems.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1">
              <span className="text-3xl font-black text-amber-600 block">1,500+</span>
              <span className="font-bold text-xs">Products in Stock</span>
              <p className="text-[11px] text-amber-800">From school compass sets to bulk paper reams.</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1">
              <span className="text-3xl font-black text-emerald-600 block">5,000+</span>
              <span className="font-bold text-xs">Portals Assisted</span>
              <p className="text-[11px] text-emerald-800">Accurate online typing for NIDA & TRA.</p>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200 text-sky-950 space-y-1">
              <span className="text-3xl font-black text-sky-600 block">1200 DPI</span>
              <span className="font-bold text-xs">Laser Print Quality</span>
              <p className="text-[11px] text-sky-800">High-speed production printing engines.</p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-1">
              <span className="text-3xl font-black text-indigo-600 block">100%</span>
              <span className="font-bold text-xs">Customer Satisfaction</span>
              <p className="text-[11px] text-indigo-800">Verified physical support in Dar es Salaam.</p>
            </div>
          </div>
        </div>

        {/* 2. Core Pillars */}
        <div className="pt-8">
          <SectionHeader
            eyebrow="Our Combined Ecosystem"
            title="The 9 Core Divisions of TK Stationery"
            subtitle="Explore our integrated business departments."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: '1. Stationery & Office Supplies Store', desc: 'Retail and wholesale notebooks, pens, markers, and office supplies.' },
              { title: '2. Online Public Assistance Center', desc: 'Guided typing and filing for NIDA, TRA, Police, RITA, and NAPA.' },
              { title: '3. Printing & Document Services', desc: 'Laser printing, photocopy, scanning, binding, lamination, and passport photos.' },
              { title: '4. Graphic Design & Branding', desc: 'Logos, banners, company profiles, letterheads, and flyer design.' },
              { title: '5. IT Support & Hardware Repair', desc: 'PC diagnostic, OS installation, antivirus protection, and printer maintenance.' },
              { title: '6. Website Development', desc: 'Mobile-responsive modern websites for businesses, law firms, and schools.' },
              { title: '7. Mobile & Web Application Engineering', desc: 'Custom apps with M-Pesa mobile money and real-time synchronization.' },
              { title: '8. Business & System Development', desc: 'POS systems, barcode scanners, and multi-store inventory software.' },
              { title: '9. Digital Monitoring Solutions', desc: 'Live branch sales analytics, daily WhatsApp reports, and audit logs.' }
            ].map(div => (
              <div key={div.title} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {div.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {div.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};
