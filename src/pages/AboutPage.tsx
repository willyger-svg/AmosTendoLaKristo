import React from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { createWhatsAppUrl } from '../utils/whatsapp';
import { TKLogo } from '../components/common/TKLogo';
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
        <Breadcrumbs items={[{ label: 'Kuhusu TK Stationery' }]} />

        {/* Hero Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden mt-4">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <TKLogo size="2xl" className="shrink-0 shadow-2xl shadow-amber-500/20" />
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>TK Stationery • Tendo La Kristo (Amos) — Manzese, Dar es Salaam</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Zaidi ya Duka la Kawaida la Vifaa
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                TK Stationery (Tendo La Kristo - Amos Stationery) ni kituo chako kikuu cha vifaa vya shule na ofisi, uchapishaji wa kisasa wa laser, picha za pasipoti za papo hapo, na msaada wa huduma zote za serikali mtandaoni jijini Dar es Salaam (Manzese karibu na Bakhresa Mwendokasi).
              </p>
            </div>
          </div>
        </div>

        {/* 1. Our Story & Purpose */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Historia na Lengo Letu
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Kuunganisha Vifaa Bora vya Ofisi na Huduma za Kisasa za Kidijitali
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Maduka mengi ya kawaida ya vifaa huuza tu kalamu na daftari. Wateja wanapohitaji kusajili vitambulisho vya NIDA, kulipa kodi za TRA kwa control number, kuweka jalada gumu lenye herufi za dhahabu kwenye thesis, au kupata mifumo ya mauzo ya biashara, wanalazimika kutembea sehemu nyingi tofauti.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>TK Stationery</strong> inakuletea huduma hizi zote muhimu chini ya paa moja la kuaminika. Tunakuletea vifaa halisi na vya ubora wa juu huku tukitoa huduma za kiufundi na za kiofisi zenye kasi na uhakika mkubwa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1">
              <span className="text-3xl font-black text-amber-600 block">1,500+</span>
              <span className="font-bold text-xs">Vifaa Stoo</span>
              <p className="text-[11px] text-amber-800">Kuanzia vifaa vya wanafunzi hadi ream za karatasi kwa wingi.</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1">
              <span className="text-3xl font-black text-emerald-600 block">5,000+</span>
              <span className="font-bold text-xs">Wateja Waliosaidiwa</span>
              <p className="text-[11px] text-emerald-800">Ujazaji sahihi wa fomu za NIDA, TRA, Polisi na RITA.</p>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200 text-sky-950 space-y-1">
              <span className="text-3xl font-black text-sky-600 block">1200 DPI</span>
              <span className="font-bold text-xs">Ubora wa Laser Printing</span>
              <p className="text-[11px] text-sky-800">Mashine za kisasa zenye kasi kubwa na rangi safi.</p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-1">
              <span className="text-3xl font-black text-indigo-600 block">100%</span>
              <span className="font-bold text-xs">Uaminifu kwa Wateja</span>
              <p className="text-[11px] text-indigo-800">Duka lipo wazi Manzese kwa huduma ya moja kwa moja.</p>
            </div>
          </div>
        </div>

        {/* 2. Core Pillars */}
        <div className="pt-8">
          <SectionHeader
            eyebrow="Mfumo Wetu wa Huduma"
            title="Idara na Huduma Kuu za TK Stationery"
            subtitle="Fahamu huduma zetu zote zilizounganishwa kukuhudumia kikamilifu."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: '1. Duka la Vifaa vya Shule na Ofisi', desc: 'Uuzaji wa jumla na rejareja wa madaftari, kalamu, mafaili ya box na vifaa vyote vya ofisi.' },
              { title: '2. Kituo cha Msaada wa Mifumo ya Serikali', desc: 'Msaada wa kitaalamu wa kujaza fomu mtandaoni kwa NIDA, TRA, Polisi, RITA na Ajira Portal.' },
              { title: '3. Uchapaji na Utengenezaji wa Nyaraka', desc: 'Printing ya laser, photocopy, kudurufu, binding ya spiral/hardcover, lamination na passport photos.' },
              { title: '4. Ubunifu wa Graphics na Chapa', desc: 'Nembo za biashara, vipeperushi (flyers), kadi za biashara, vyeti vya heshima na mabango.' },
              { title: '5. Matengenezo ya Kompyuta na Printer', desc: 'Ukaguzi wa kompyuta, kufunga mifumo (Windows/Office), antivirus na huduma za printer.' },
              { title: '6. Utengenezaji wa Tovuti za Kisasa', desc: 'Tovuti za kisasa zinazofunguka haraka kwenye simu kwa ajili ya biashara, shule na ofisi.' },
              { title: '7. Mifumo ya Mauzo na Stoo (POS)', desc: 'Mifumo ya usimamizi wa stoo na mauzo ya maduka kwa kutumia barcode na risiti.' },
              { title: '8. Masuluhisho ya Kidijitali ya Biashara', desc: 'Uunganishaji wa mifumo ya malipo ya simu (M-Pesa, Tigo Pesa) na ripoti za kila siku.' },
              { title: '9. Usimamizi na Ripoti za Mauzo', desc: 'Mifumo ya kutuma ripoti za mauzo ya matawi moja kwa moja kwa njia ya WhatsApp na mtandao.' }
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

