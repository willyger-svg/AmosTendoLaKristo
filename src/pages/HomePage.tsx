import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { Container } from '../components/layout/Container';
import { Button } from '../components/common/Button';
import { SectionHeader } from '../components/common/SectionHeader';
import { ProductCard } from '../components/shop/ProductCard';
import { PrintPriceEstimator } from '../components/printing/PrintPriceEstimator';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { mockProducts } from '../data/products';
import { publicServicesData } from '../data/publicServices';
import { mockTestimonials } from '../data/orders';
import { createWhatsAppUrl } from '../utils/whatsapp';
import {
  ShoppingBag,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Camera,
  Check,
  PhoneCall,
  CreditCard,
  Truck,
  FileText,
  Search,
  BookOpen,
  FolderArchive,
  Layers,
  HelpCircle,
  Award,
  Zap,
  Building2,
  ChevronRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo, storeSettings, advertisements, trackAdClick } = useApp();
  const { t, language } = useTranslation();
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'paper' | 'school' | 'office' | 'accessories'>('all');

  const heroAds = advertisements.filter(a => a.isActive && (a.placement === 'hero_banner' || !a.placement));
  const activePromoAd = heroAds[0];

  const whatsappPaymentNumber = storeSettings?.paymentWhatsAppNumber || '0787754202';
  const displayPhone = storeSettings?.displayPhoneNumber || '+255 787 754 202';

  // Filter products by category for quick browsing
  const filteredProducts = mockProducts.filter(product => {
    if (selectedCategoryTab === 'all') return product.featured || product.isBestSeller;
    if (selectedCategoryTab === 'paper') return product.category === 'Paper & Printing';
    if (selectedCategoryTab === 'school') return product.category === 'School Supplies';
    if (selectedCategoryTab === 'office') return product.category === 'Office Supplies';
    if (selectedCategoryTab === 'accessories') return product.category === 'Computer Accessories';
    return true;
  }).slice(0, 8);

  const featuredPublicServices = publicServicesData.slice(0, 4);

  // Core services — focused purely on stationery, printing, passport photos, and government portal assistance
  const coreServices = [
    {
      id: 'stationery',
      title: language === 'sw' ? 'Duka la Vifaa vya Ofisi na Shule' : 'Stationery & Office Store',
      description: language === 'sw'
        ? 'Daftari za counter, kalamu bora, ream za karatasi A4/A3, mafaili ya box na vifaa vyote vya ofisi.'
        : 'Quality counter books, premium pens, A4/A3 paper reams, box files, and everyday office supplies.',
      icon: ShoppingBag,
      tag: '1,500+ Bidhaa',
      iconBg: 'bg-amber-500 text-slate-950',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      actionText: language === 'sw' ? 'Fungua Duka la Vifaa' : 'Shop Supplies',
      path: '/shop'
    },
    {
      id: 'printing',
      title: language === 'sw' ? 'Uchapaji wa Haraka (Laser Printing)' : 'High-Speed Document Printing',
      description: language === 'sw'
        ? 'Uchapaji wa nyaraka nyeusi na nyeupe (B&W) na rangi kamili kwa ubora wa laser 1200 DPI bila kupoteza muda.'
        : 'Rapid crisp B&W and vivid full-color laser printing for reports, booklets, agreements, and forms.',
      icon: Printer,
      tag: 'Dakika 5 - 15',
      iconBg: 'bg-sky-600 text-white',
      borderHover: 'hover:border-sky-400 hover:shadow-sky-500/10',
      actionText: language === 'sw' ? 'Chapisha / Kokotoa Bei' : 'Print & Estimate',
      path: '/printing'
    },
    {
      id: 'binding',
      title: language === 'sw' ? 'Binding na Jalada Gumu (Hardcover)' : 'Binding & Hardcover Finishing',
      description: language === 'sw'
        ? 'Spiral binding ya plastiki, wire binding, lamination na jalada gumu lenye herufi za dhahabu kwa ripoti na thesis.'
        : 'Plastic comb spiral, wire binding, thermal binding, and gold-embossed hardcover university thesis books.',
      icon: BookOpen,
      tag: 'Ubora wa Juu',
      iconBg: 'bg-indigo-600 text-white',
      borderHover: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
      actionText: language === 'sw' ? 'Tazama Vigezo vya Binding' : 'View Binding Options',
      path: '/printing'
    },
    {
      id: 'passport-photos',
      title: language === 'sw' ? 'Picha za Pasipoti za Papo Hapo' : 'Studio Passport-Size Photos',
      description: language === 'sw'
        ? 'Picha za viwango vya kimataifa kwa ajili ya NIDA, pasipoti ya kusafiria, visa, vyeti na usajili wa shule.'
        : 'Instant compliant passport photos with white, blue, or red studio backgrounds plus digital softcopy.',
      icon: Camera,
      tag: 'Papo kwa Papo',
      iconBg: 'bg-emerald-600 text-white',
      borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      actionText: language === 'sw' ? 'Vigezo vya Picha' : 'Photo Details',
      path: '/printing'
    },
    {
      id: 'nida-services',
      title: language === 'sw' ? 'Msaada wa NIDA (Namba & NIN)' : 'NIDA NIN & Identity Services',
      description: language === 'sw'
        ? 'Kutafuta namba ya NIDA mtandaoni, kupakua kopi ya kitambulisho, na maelekezo ya usajili mpya.'
        : 'Instant national ID number (NIN) retrieval, downloadable verification cards, and filing assistance.',
      icon: ShieldCheck,
      tag: 'Huduma ya Serikali',
      iconBg: 'bg-emerald-700 text-white',
      borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
      actionText: language === 'sw' ? 'Pata Msaada wa NIDA' : 'Get NIDA Support',
      path: '/online-services?focus=NIDA'
    },
    {
      id: 'tra-services',
      title: language === 'sw' ? 'Msaada wa TRA (TIN & Tax Returns)' : 'TRA TIN & Tax Returns Support',
      description: language === 'sw'
        ? 'Msaada wa maombi ya TIN mpya ya biashara au binafsi, marejesho ya kodi (tax filing) na ankara za kodi.'
        : 'Individual and corporate TIN application guidance, Nil returns assistance, and tax clearance support.',
      icon: FileText,
      tag: 'Ushuru & Kodi',
      iconBg: 'bg-amber-600 text-white',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      actionText: language === 'sw' ? 'Pata Msaada wa TRA' : 'TRA Assistance',
      path: '/online-services?focus=TRA'
    },
    {
      id: 'police-loss-report',
      title: language === 'sw' ? 'Ripoti ya Polisi ya Upotevu' : 'Police Loss Report (Upotevu)',
      description: language === 'sw'
        ? 'Kujaza fomu ya mtandaoni ya kuripoti simu, cheti, au nyaraka zilizopotea na kupata stakabadhi rasmi.'
        : 'Assisted electronic police loss report filing with genuine reference number printing within minutes.',
      icon: ShieldCheck,
      tag: 'Haraka & Rahisi',
      iconBg: 'bg-slate-800 text-amber-400',
      borderHover: 'hover:border-slate-400 hover:shadow-slate-500/10',
      actionText: language === 'sw' ? 'Jaza Ripoti ya Polisi' : 'Fill Loss Report',
      path: '/online-services?focus=POLICE'
    },
    {
      id: 'graphic-design',
      title: language === 'sw' ? 'Ubunifu wa Graphics & Vipeperushi' : 'Graphic & Certificate Design',
      description: language === 'sw'
        ? 'Ubunifu wa vipeperushi vya matangazo (flyers), kadi za biashara (business cards), vyeti na mabango.'
        : 'Clean flyers, corporate business cards, letterheads, certificates, and vibrant promotional graphics.',
      icon: Sparkles,
      tag: 'Ubunifu Maalum',
      iconBg: 'bg-purple-600 text-white',
      borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      actionText: language === 'sw' ? 'Tazama Sampuli' : 'View Samples',
      path: '/graphic-design'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section
        className="relative text-white pt-10 pb-16 sm:pt-16 sm:pb-24 overflow-hidden border-b border-slate-800"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.96) 0%, rgba(15, 23, 42, 0.92) 50%, rgba(2, 6, 23, 0.97) 100%), url('https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=2000&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <Container>
          {/* Active Promo Banner if configured */}
          {activePromoAd && (
            <div
              onClick={() => {
                trackAdClick(activePromoAd.id);
                if (activePromoAd.targetUrl) navigateTo(activePromoAd.targetUrl);
              }}
              className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-400/40 cursor-pointer hover:border-amber-400 transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  {activePromoAd.badgeText || 'OFA MAALUM'}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">{activePromoAd.title}</h4>
                  {activePromoAd.subtitle && <p className="text-xs text-slate-300">{activePromoAd.subtitle}</p>}
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                {activePromoAd.buttonText || 'Tazama Zaidi'} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {language === 'sw' ? 'Vifaa vya Shule & Ofisi,' : 'Quality Stationery,'} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                  {language === 'sw' ? 'Uchapaji wa Haraka na Huduma za Mtandao.' : 'Fast Printing & Online Services.'}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {language === 'sw'
                  ? 'TK Stationery inakupa daftari, kalamu, ream za karatasi, uchapaji wa laser wa haraka (B&W na Rangi), binding ya vitabu na thesis, picha za pasipoti, na msaada wa huduma za serikali (NIDA, TRA, Polisi). Tupo Manzese, Dar es Salaam (karibia na kituo cha mwendokasi cha Bakhresa).'
                  : 'Your trusted partner in Manzese, Dar es Salaam (near Bakhresa BRT / Mwendokasi bus station) for quality school & office stationery, rapid laser printing, spiral & hardcover thesis binding, instant passport photos, and guided public portal support.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigateTo('/shop')}
                  icon={<ShoppingBag className="w-4 h-4 text-slate-950" />}
                  className="w-full sm:w-auto shadow-lg shadow-amber-500/20"
                >
                  {language === 'sw' ? 'Nunua Vifaa Dukani' : 'Shop Stationery'}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigateTo('/printing')}
                  icon={<Printer className="w-4 h-4 text-sky-400" />}
                  className="w-full sm:w-auto border-slate-700 text-white hover:bg-slate-900"
                >
                  {language === 'sw' ? 'Kikokotoo cha Printing' : 'Instant Print Calculator'}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => navigateTo('/online-services')}
                  icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-slate-800/60"
                >
                  {language === 'sw' ? 'NIDA / TRA / Polisi' : 'Government Portals'}
                </Button>
              </div>

              {/* Verified Trust Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">1,500+</span>
                  <span className="text-[11px] text-slate-300 block font-medium">
                    {language === 'sw' ? 'Vifaa vya Shule & Ofisi' : 'Stationery Items'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">Dakika 5-15</span>
                  <span className="text-[11px] text-slate-300 block font-medium">
                    {language === 'sw' ? 'Uchapaji & Passport' : 'Fast Document Print'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">M-Pesa / Tigo</span>
                  <span className="text-[11px] text-slate-300 block font-medium">
                    {language === 'sw' ? 'Malipo Salama ya Simu' : 'Mobile Payments'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card / Instant Order & Payment Hub */}
            <div className="lg:col-span-5 relative">
              <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">
                        {language === 'sw' ? 'Mawasiliano & Malipo ya Haraka' : 'Fast Order & Payment Desk'}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        M-Pesa • Tigo Pesa • Airtel Money • Cash
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Duka Lipo Wazi
                  </span>
                </div>

                {/* WhatsApp Payment Number highlight */}
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {language === 'sw' ? 'Namba ya Malipo & WhatsApp:' : 'Payment / WhatsApp Line:'}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      Inapatikana Sasa
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-black text-amber-400 tracking-wider font-mono">
                      {whatsappPaymentNumber}
                    </span>
                    <a
                      href={createWhatsAppUrl(whatsappPaymentNumber, 'Habari TK Stationery! Nahitaji huduma / kuagiza vifaa.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {language === 'sw'
                      ? 'Tuma orodha ya vifaa unavyohitaji au faili ya PDF ya kuchapishwa kupitia WhatsApp kwa huduma ya haraka.'
                      : 'Send your shopping list or PDF documents directly to our WhatsApp desk for prompt processing.'}
                  </p>
                </div>

                {/* Quick Shortcuts */}
                <div className="space-y-2 pt-1">
                  <div
                    onClick={() => navigateTo('/shop')}
                    className="p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors border border-slate-700/50"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      {language === 'sw' ? 'Agiza Vifaa vya Ofisi na Shule' : 'Order Stationery Items'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div
                    onClick={() => navigateTo('/printing')}
                    className="p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors border border-slate-700/50"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-2.5">
                      <Printer className="w-4 h-4 text-sky-400" />
                      {language === 'sw' ? 'Kikokotoo cha Bei ya Uchapaji' : 'Instant Print Calculator'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div
                    onClick={() => navigateTo('/track-order')}
                    className="p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors border border-slate-700/50"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      {language === 'sw' ? 'Fuatilia Hali ya Oda Yako' : 'Track Existing Order Status'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. CORE SERVICES SECTION (STATIONERY, PRINTING, PASSPORT, GOVERNMENT SERVICES) */}
      <section>
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 inline-block">
              {language === 'sw' ? 'Huduma Zetu Kuu' : 'Core Offerings'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {language === 'sw' ? 'Huduma Zote Mahali Pamoja' : 'Everything Under One Roof'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {language === 'sw'
                ? 'Tumezingatia huduma muhimu zinazosaidia wanafunzi, wafanyakazi, wajasiriamali na taasisi kufanya shughuli zao kwa wepesi na uhakika.'
                : 'Focused on high-demand everyday essentials: dependable stationery, precision printing, fast binding, and essential government portal filing.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coreServices.map(service => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => navigateTo(service.path)}
                  className={`bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xs flex flex-col justify-between ${service.borderHover}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${service.iconBg} shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {service.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {service.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>{service.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. FEATURED PRODUCTS & POPULAR STATIONERY ITEMS */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <SectionHeader
                title={language === 'sw' ? 'Vifaa Vinavyoongoza Mauzo Dukani' : 'Best Selling Stationery'}
                subtitle={language === 'sw'
                  ? 'Ream za karatasi zenye ubora, kalamu, madaftari ya counter na vifaa vya ofisi kwa bei nafuu.'
                  : 'Top-rated paper reams, writing instruments, notebooks, and office accessories.'}
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: language === 'sw' ? 'Maarufu Zote' : 'All Popular' },
                { id: 'paper', label: language === 'sw' ? 'Karatasi & Ream' : 'Paper & Printing' },
                { id: 'school', label: language === 'sw' ? 'Vifaa vya Shule' : 'School' },
                { id: 'office', label: language === 'sw' ? 'Vifaa vya Ofisi' : 'Office' },
                { id: 'accessories', label: language === 'sw' ? 'Vikorokoro / PC' : 'Accessories' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategoryTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategoryTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigateTo('/shop')}
              icon={<ArrowRight className="w-4 h-4" />}
              className="bg-white border-slate-300 text-slate-900 hover:bg-slate-100 font-bold px-8 shadow-xs"
            >
              {language === 'sw' ? 'Tazama Duka Lote (Bidhaa 1,500+) →' : 'Browse Full Catalog (1,500+ Items) →'}
            </Button>
          </div>
        </Container>
      </section>

      {/* 4. FAST PRINT ESTIMATOR EMBED */}
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
                {language === 'sw' ? 'Kikokotoo cha Haraka cha Chapisho' : 'Instant Print Calculator'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {language === 'sw'
                  ? 'Pata Makadirio ya Bei ya Printing Kabla ya Kuagiza'
                  : 'Calculate Your Print Job Cost Instantly'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'sw'
                  ? 'Chagua idadi ya kurasa, aina ya uchapaji (Nyeusi & Nyeupe au Rangi Kamili), ukubwa wa karatasi (A4 au A3), na aina ya binding unayotaka upate gharama sahihi papo hapo.'
                  : 'Specify page count, color options (B&W or Full Color), paper format (A4/A3), and binding preference to calculate your exact cost.'}
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'sw' ? 'Laser printing ya ubora wa 1200 DPI (maneno na picha nyororo)' : 'High-density 1200 DPI laser printing'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'sw' ? 'Spiral binding na plastiki safi ya mbele na nyuma' : 'Fast spiral binding with clear protective covers'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'sw' ? 'Hardcover thesis binding kwa wanavyuo (herufi za dhahabu)' : 'Hardcover golden-embossed thesis binding'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'sw' ? 'Tuma kazi mtandaoni na chukua bila kukaa foleni' : 'Upload online and pick up without queuing'}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo('/printing/order-service')}
                  icon={<Printer className="w-3.5 h-3.5 text-sky-600" />}
                >
                  {language === 'sw' ? 'Tuma Nyaraka Yako Mtandaoni' : 'Upload Document Directly'}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <PrintPriceEstimator />
            </div>
          </div>
        </Container>
      </section>

      {/* 5. PUBLIC ONLINE SERVICES SECTION */}
      <section
        className="relative text-white py-16 rounded-3xl mx-4 sm:mx-8 overflow-hidden shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.94), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 inline-block">
                {language === 'sw' ? 'Msaada wa Huduma za Serikali' : 'Government Services Assistance'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                {language === 'sw' ? 'Usipate Tabu na Mifumo ya Mtandaoni' : 'Hassle-Free Public Portal Support'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                {language === 'sw'
                  ? 'Wataalamu wetu wapo tayari kukusaidia kujaza, kufuatilia na kuchapisha nyaraka za NIDA, TRA, Polisi, RITA na maombi ya Ajira bila makosa wala usumbufu.'
                  : 'Our experienced staff assists you in filing, checking, and printing documentation for NIDA, TRA, Police, RITA, and Ajira portals.'}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/online-services')}
              className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold self-start lg:self-end"
            >
              {language === 'sw' ? 'Huduma Zote za Serikali →' : 'View All Portals →'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredPublicServices.map(srv => (
              <div key={srv.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {srv.agencyName || srv.code}
                  </span>
                  <h3 className="font-bold text-sm text-white leading-snug">{srv.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{srv.shortDescription}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 font-semibold text-[11px] truncate max-w-[140px]">
                    {srv.tkAssistanceFeeNote?.split(':')[0] || 'Gharama ya Msaada'}
                  </span>
                  <button
                    onClick={() => navigateTo('/online-services')}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    {language === 'sw' ? 'Omba Msaada' : 'Apply'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <DisclaimerBanner />
          </div>
        </Container>
      </section>

      {/* 6. HOW IT WORKS / JINSI INAVYOFANYA KAZI */}
      <section>
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {language === 'sw' ? 'Hatua Rahisi' : 'Simple Steps'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === 'sw' ? 'Jinsi ya Kupata Huduma TK Stationery' : 'How Ordering Works'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {language === 'sw'
                ? 'Agiza ukiwa nyumbani au ofisini kwako kwa hatua 3 tu rahisi.'
                : 'Order from anywhere in Dar es Salaam in 3 effortless steps.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {language === 'sw' ? 'Chagua Bidhaa au Tuma Faili' : 'Select Items or Upload'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'sw'
                  ? 'Weka vifaa kwenye kikapu au tuma faili zako za PDF/Word za kuchapishwa moja kwa moja kupitia tovuti au WhatsApp.'
                  : 'Add stationery products to cart or send your documents via our website or direct WhatsApp line.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black text-base flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {language === 'sw' ? 'Lipa kwa Simu ya Mkononi' : 'Pay via Mobile Money'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'sw'
                  ? 'Fanya malipo salama kwa M-Pesa, Tigo Pesa, Airtel Money au Lipa Namba. Tuma uthibitisho kwa sekunde chache.'
                  : 'Complete payment conveniently via M-Pesa, Tigo Pesa, or Airtel Money with quick automated verification.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {language === 'sw' ? 'Chukua Dukani au Letewa Ofisini' : 'Pick Up or Delivery'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'sw'
                  ? 'Kazi yako ikikamilika unaweza kuja kuichukua dukani au kuletewa moja kwa moja na msafirishaji wetu jijini Dar es Salaam.'
                  : 'Pick up your completed order at our store or enjoy prompt motorcycle delivery straight to your door.'}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <Container>
          <SectionHeader
            title={language === 'sw' ? 'Wateja Wetu Wanasema Nini' : 'What Our Customers Say'}
            subtitle={language === 'sw'
              ? 'Wanafunzi, walimu, makampuni na wataalamu wanatuamini kwa kazi safi na ya haraka.'
              : 'Trusted by students, teachers, businesses, and professionals in Dar es Salaam.'}
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {mockTestimonials.slice(0, 3).map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{item.comment}"
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                    <p className="text-[10px] text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 8. WHOLESALE & CORPORATE SUPPLY BANNER */}
      <section className="mx-4 sm:mx-8">
        <div
          className="relative rounded-3xl overflow-hidden text-white p-8 sm:p-12 shadow-2xl"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.90) 50%, rgba(15, 23, 42, 0.96) 100%), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="max-w-3xl space-y-5 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Oda za Jumla • Mashule, Vyuo na Mashirika</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {language === 'sw'
                ? 'Unahitaji Vifaa vya Ofisi na Uchapaji kwa Wingi?'
                : 'Looking for Bulk Stationery & Printing Supplies?'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {language === 'sw'
                ? 'TK Stationery inatoa punguzo maalum la bei kwa taasisi, makampuni, mashule na vituo vya mafunzo kote Tanzania. Tunatoa ankara rasmi za kodi (Proforma & EFD Tax Invoice) na usafirishaji wa haraka.'
                : 'TK Stationery offers tailored wholesale discounts for institutions, corporate offices, schools, and organizations across Tanzania with official tax invoicing.'}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href={createWhatsAppUrl(whatsappPaymentNumber, 'Habari TK Stationery! Ninahitaji vifaa vya jumla / quotation ya ofisi au shule.')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ongea Nasi WhatsApp</span>
              </a>

              <a
                href={`tel:${whatsappPaymentNumber}`}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-900/20"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Piga: {displayPhone}</span>
              </a>

              <button
                type="button"
                onClick={() => navigateTo('/contact')}
                className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 backdrop-blur-xs transition-all"
              >
                Fika Dukani / Wasiliana Nasi
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
