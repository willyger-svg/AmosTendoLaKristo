import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { Container } from '../components/layout/Container';
import { Button } from '../components/common/Button';
import { SectionHeader } from '../components/common/SectionHeader';
import { ProductCard } from '../components/shop/ProductCard';
import { ProductGridSkeleton, Skeleton } from '../components/common/Skeleton';
import { PrintPriceEstimator } from '../components/printing/PrintPriceEstimator';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { createWhatsAppUrl } from '../utils/whatsapp';
import { TKLogo } from '../components/common/TKLogo';
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
  ChevronRight,
  Megaphone
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo, storeSettings, advertisements, trackAdClick, products, publicServices, testimonials, isLoadingData } = useApp();
  const { t, language } = useTranslation();
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'paper' | 'school' | 'office' | 'accessories'>('all');
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const heroAds = useMemo(() => {
    return (advertisements || []).filter(a => a.isActive && (a.placement === 'hero_banner' || !a.placement));
  }, [advertisements]);

  const homeHighlightAds = useMemo(() => {
    return (advertisements || []).filter(a => a.isActive && (a.placement === 'home_highlight' || a.placement === 'sidebar'));
  }, [advertisements]);

  // Auto rotate hero ads if multiple exist
  useEffect(() => {
    if (heroAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % heroAds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroAds.length]);

  const activePromoAd = heroAds[currentAdIndex] || heroAds[0];

  const whatsappPaymentNumber = storeSettings?.paymentWhatsAppNumber || '0787754202';
  const displayPhone = storeSettings?.displayPhoneNumber || '+255 787 754 202';

  // Filter products by category for quick browsing from live collection
  const filteredProducts = (products || []).filter(product => {
    if (selectedCategoryTab === 'all') return product.featured || product.isFeatured || product.isBestSeller;
    if (selectedCategoryTab === 'paper') return product.category === 'Paper & Printing';
    if (selectedCategoryTab === 'school') return product.category === 'School Supplies';
    if (selectedCategoryTab === 'office') return product.category === 'Office Supplies';
    if (selectedCategoryTab === 'accessories') return product.category === 'Computer Accessories';
    return true;
  }).slice(0, 8);

  const featuredPublicServices = (publicServices || []).slice(0, 4);

  // Core services — focused purely on stationery, printing, passport photos, and government portal assistance
  const coreServices = [
    {
      id: 'stationery',
      title: 'Duka la Vifaa vya Ofisi na Shule',
      description: 'Daftari za counter, kalamu bora, ream za karatasi A4 na A3, mafaili ya box na vifaa vyote vya ofisi na shule.',
      icon: ShoppingBag,
      tag: '1,500+ Vifaa',
      iconBg: 'bg-amber-500 text-slate-950',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      actionText: 'Fungua Duka la Vifaa',
      path: '/shop'
    },
    {
      id: 'printing',
      title: 'Uchapaji wa Haraka (Laser Printing)',
      description: 'Uchapaji wa nyaraka nyeusi na nyeupe (B&W) na rangi kamili kwa ubora wa laser 1200 DPI bila kupoteza muda.',
      icon: Printer,
      tag: 'Dakika 5 - 15',
      iconBg: 'bg-sky-600 text-white',
      borderHover: 'hover:border-sky-400 hover:shadow-sky-500/10',
      actionText: 'Chapisha / Kokotoa Bei',
      path: '/printing'
    },
    {
      id: 'binding',
      title: 'Kufunga Vitabu na Jalada Gumu (Hardcover)',
      description: 'Spiral binding ya plastiki na waya, lamination na jalada gumu lenye herufi za dhahabu kwa ripoti na thesis za chuo.',
      icon: BookOpen,
      tag: 'Ubora wa Juu',
      iconBg: 'bg-indigo-600 text-white',
      borderHover: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
      actionText: 'Tazama Vigezo vya Binding',
      path: '/printing'
    },
    {
      id: 'passport-photos',
      title: 'Picha za Pasipoti za Papo Hapo',
      description: 'Picha za viwango rasmi kwa ajili ya NIDA, pasipoti ya kusafiria, visa, vyeti vya shule na leseni.',
      icon: Camera,
      tag: 'Papo kwa Papo',
      iconBg: 'bg-emerald-600 text-white',
      borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      actionText: 'Vigezo vya Picha',
      path: '/printing'
    },
    {
      id: 'nida-services',
      title: 'Msaada wa Vitambulisho vya NIDA',
      description: 'Kutafuta namba ya NIN mtandaoni, kupakua nakala ya kitambulisho, na ushauri wa usajili mpya.',
      icon: ShieldCheck,
      tag: 'Huduma ya Serikali',
      iconBg: 'bg-emerald-700 text-white',
      borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
      actionText: 'Pata Msaada wa NIDA',
      path: '/online-services?focus=NIDA'
    },
    {
      id: 'tra-services',
      title: 'Msaada wa TRA (TIN na Kodi)',
      description: 'Msaada wa maombi ya TIN mpya ya biashara au binafsi, marejesho ya kodi (tax returns) na ankara za malipo.',
      icon: FileText,
      tag: 'Ushuru & Kodi',
      iconBg: 'bg-amber-600 text-white',
      borderHover: 'hover:border-amber-400 hover:shadow-amber-500/10',
      actionText: 'Pata Msaada wa TRA',
      path: '/online-services?focus=TRA'
    },
    {
      id: 'police-loss-report',
      title: 'Ripoti ya Polisi ya Upotevu wa Nyaraka',
      description: 'Kujaza fomu rasmi ya mtandaoni ya upotevu wa simu, cheti, au nyaraka na kupata stakabadhi papo hapo.',
      icon: ShieldCheck,
      tag: 'Haraka & Rahisi',
      iconBg: 'bg-slate-800 text-amber-400',
      borderHover: 'hover:border-slate-400 hover:shadow-slate-500/10',
      actionText: 'Jaza Ripoti ya Upotevu',
      path: '/online-services?focus=POLICE'
    },
    {
      id: 'graphic-design',
      title: 'Ubunifu wa Vipeperushi na Kadi',
      description: 'Ubunifu wa vipeperushi vya matangazo (flyers), kadi za biashara, vyeti, kalenda na mabango safi.',
      icon: Sparkles,
      tag: 'Ubunifu Maalum',
      iconBg: 'bg-purple-600 text-white',
      borderHover: 'hover:border-purple-400 hover:shadow-purple-500/10',
      actionText: 'Agiza Ubunifu & Uchapaji',
      path: '/printing'
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
          {/* Active Promo Banner / Carousel with Uploaded Image */}
          {heroAds.length > 0 && activePromoAd && (
            <div className="mb-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900/90 border border-amber-500/40 shadow-2xl backdrop-blur-md transition-all hover:border-amber-400">
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Image Section */}
                {activePromoAd.imageUrl && (
                  <div
                    onClick={() => {
                      trackAdClick(activePromoAd.id);
                      if (activePromoAd.targetUrl) navigateTo(activePromoAd.targetUrl);
                    }}
                    className="relative md:w-5/12 h-44 sm:h-52 md:h-auto min-h-[160px] overflow-hidden cursor-pointer group shrink-0 bg-slate-950"
                  >
                    <img
                      src={activePromoAd.imageUrl}
                      alt={activePromoAd.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {activePromoAd.badgeText || 'OFA MAALUM'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between gap-3 bg-gradient-to-br from-slate-900/95 to-slate-950">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!activePromoAd.imageUrl && (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                            {activePromoAd.badgeText || 'OFA MAALUM'}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-amber-400/90 flex items-center gap-1">
                          <Megaphone className="w-3.5 h-3.5" />
                          Tangazo Rasmi la TK Stationery
                        </span>
                      </div>

                      {/* Pagination dots if multiple ads */}
                      {heroAds.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          {heroAds.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentAdIndex(idx);
                              }}
                              className={`h-2 rounded-full transition-all ${
                                idx === currentAdIndex
                                  ? 'w-6 bg-amber-400'
                                  : 'w-2 bg-slate-700 hover:bg-slate-500'
                              }`}
                              title={`Tangazo ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                      {activePromoAd.title}
                    </h4>

                    {activePromoAd.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                        {activePromoAd.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        trackAdClick(activePromoAd.id);
                        if (activePromoAd.targetUrl) navigateTo(activePromoAd.targetUrl);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <span>{activePromoAd.buttonText || 'Tazama Zaidi'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {heroAds.length > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentAdIndex(prev => (prev - 1 + heroAds.length) % heroAds.length)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors text-xs"
                          title="Tangazo lililopita"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setCurrentAdIndex(prev => (prev + 1) % heroAds.length)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors text-xs"
                          title="Tangazo lijalo"
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                  Nunua Vifaa Dukani
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigateTo('/printing')}
                  icon={<Printer className="w-4 h-4 text-sky-400" />}
                  className="w-full sm:w-auto border-slate-700 text-white hover:bg-slate-900"
                >
                  Kikokotoo cha Printing
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => navigateTo('/online-services')}
                  icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-slate-800/60"
                >
                  NIDA / TRA / Polisi
                </Button>
              </div>

              {/* Verified Trust Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">1,500+</span>
                  <span className="text-[11px] text-slate-300 block font-medium">
                    Vifaa vya Shule & Ofisi
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">Dakika 5-15</span>
                  <span className="text-[11px] text-slate-300 block font-medium">
                    Uchapaji & Passport
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">M-Pesa / Tigo</span>
                  <span className="text-[11px] text-slate-300 block font-medium">
                    Malipo Salama ya Simu
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card / Instant Order & Payment Hub */}
            <div className="lg:col-span-5 relative">
              <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <TKLogo size="md" className="shadow-lg shadow-amber-500/10" />
                    <div>
                      <span className="font-bold text-sm text-white block">
                        Mawasiliano & Malipo ya Haraka
                      </span>
                      <span className="text-[11px] text-amber-400 font-semibold block">
                        Tendo La Kristo (Amos) • Manzese
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
                      Namba ya Malipo & WhatsApp:
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
                      <span>Ongea Nasi WhatsApp</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tuma orodha ya vifaa unavyohitaji au faili ya PDF ya kuchapishwa kupitia WhatsApp kwa huduma ya haraka.
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
                      Agiza Vifaa vya Ofisi na Shule
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div
                    onClick={() => navigateTo('/printing')}
                    className="p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors border border-slate-700/50"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-2.5">
                      <Printer className="w-4 h-4 text-sky-400" />
                      Kikokotoo cha Bei ya Uchapaji
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div
                    onClick={() => navigateTo('/track-order')}
                    className="p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors border border-slate-700/50"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      Fuatilia Hali ya Oda Yako
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
              Huduma Zetu Kuu
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Huduma Zote za Ofisi Mahali Pamoja
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tumezingatia huduma muhimu zinazosaidia wanafunzi, wafanyakazi, wajasiriamali na taasisi kufanya shughuli zao kwa wepesi na uhakika.
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
                title="Vifaa Vinavyoongoza Mauzo Dukani"
                subtitle="Ream za karatasi zenye ubora, kalamu, madaftari ya counter na vifaa vya ofisi kwa bei nafuu."
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Maarufu Zote' },
                { id: 'paper', label: 'Karatasi & Ream' },
                { id: 'school', label: 'Vifaa vya Shule' },
                { id: 'office', label: 'Vifaa vya Ofisi' },
                { id: 'accessories', label: 'Vikorokoro / PC' }
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

          {isLoadingData && products.length === 0 ? (
            <ProductGridSkeleton count={8} columns="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigateTo('/shop')}
              icon={<ArrowRight className="w-4 h-4" />}
              className="bg-white border-slate-300 text-slate-900 hover:bg-slate-100 font-bold px-8 shadow-xs"
            >
              Tazama Duka Lote (Vifaa 1,500+) →
            </Button>
          </div>
        </Container>
      </section>

      {/* 3.5. SPECIAL PROMOTIONS & ANNOUNCEMENTS BANNER SECTION */}
      {homeHighlightAds.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-b border-slate-800">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 inline-flex items-center gap-1.5 mb-2">
                  <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                  Matangazo & Ofa za Leo
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Ofa Maalum & Punguzo la Bei
                </h2>
              </div>
              <button
                onClick={() => navigateTo('/shop')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Tazama Bidhaa za Ofa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={`grid grid-cols-1 ${homeHighlightAds.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
              {homeHighlightAds.map(ad => (
                <div
                  key={ad.id}
                  onClick={() => {
                    trackAdClick(ad.id);
                    if (ad.targetUrl) navigateTo(ad.targetUrl);
                  }}
                  className="group relative rounded-3xl overflow-hidden bg-slate-800/80 border border-slate-700/80 hover:border-amber-400/80 shadow-xl transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-stretch"
                >
                  {ad.imageUrl && (
                    <div className="sm:w-5/12 h-48 sm:h-auto overflow-hidden relative shrink-0 bg-slate-900">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {ad.badgeText || 'OFA'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          Tangazo
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
                        {ad.title}
                      </h3>
                      {ad.subtitle && (
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {ad.subtitle}
                        </p>
                      )}
                      {ad.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {ad.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-700/50">
                      <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        {ad.buttonText || 'Tazama Zaidi'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 4. FAST PRINT ESTIMATOR EMBED */}
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
                Kikokotoo cha Haraka cha Chapisho
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Pata Makadirio ya Bei ya Printing Kabla ya Kuagiza
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chagua idadi ya kurasa, aina ya uchapaji (Nyeusi & Nyeupe au Rangi Kamili), ukubwa wa karatasi (A4 au A3), na aina ya binding unayotaka upate gharama sahihi papo hapo.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Laser printing ya ubora wa 1200 DPI (maneno na picha nyororo)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Spiral binding na plastiki safi ya mbele na nyuma</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hardcover thesis binding kwa wanavyuo (herufi za dhahabu)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tuma kazi mtandaoni na chukua bila kukaa foleni</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo('/printing/order-service')}
                  icon={<Printer className="w-3.5 h-3.5 text-sky-600" />}
                >
                  Tuma Nyaraka Yako Mtandaoni
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
                Msaada wa Huduma za Serikali
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                Usipate Tabu na Mifumo ya Mtandaoni
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Wataalamu wetu wapo tayari kukusaidia kujaza, kufuatilia na kuchapisha nyaraka za NIDA, TRA, Polisi, RITA na maombi ya Ajira bila makosa wala usumbufu.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/online-services')}
              className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold self-start lg:self-end"
            >
              Huduma Zote za Serikali →
            </Button>
          </div>

          {isLoadingData && publicServices.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between animate-pulse">
                  <div className="space-y-2">
                    <div className="w-16 h-4 bg-slate-800 rounded" />
                    <div className="w-4/5 h-4 bg-slate-800 rounded" />
                    <div className="w-full h-3 bg-slate-800/60 rounded" />
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="w-20 h-3 bg-slate-800 rounded" />
                    <div className="w-16 h-3 bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                      Omba Msaada
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
              Hatua Rahisi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Jinsi ya Kupata Huduma TK Stationery
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Agiza ukiwa nyumbani au ofisini kwako kwa hatua 3 tu rahisi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Chagua Bidhaa au Tuma Faili
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Weka vifaa kwenye kikapu au tuma faili zako za PDF/Word za kuchapishwa moja kwa moja kupitia tovuti au WhatsApp.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black text-base flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Lipa kwa Simu ya Mkononi
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fanya malipo salama kwa M-Pesa, Tigo Pesa, Airtel Money au Lipa Namba. Tuma uthibitisho kwa sekunde chache.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Chukua Dukani au Letewa Ofisini
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kazi yako ikikamilika unaweza kuja kuichukua dukani Manzese au kuletewa moja kwa moja na msafirishaji wetu jijini Dar es Salaam.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <Container>
          <SectionHeader
            title="Wateja Wetu Wanasema Nini"
            subtitle="Wanafunzi, walimu, makampuni na wataalamu wanatuamini kwa kazi safi na ya haraka."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {(testimonials && testimonials.length > 0 ? testimonials : []).slice(0, 3).map((item, idx) => (
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
              Unahitaji Vifaa vya Ofisi na Uchapaji kwa Wingi?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              TK Stationery inatoa punguzo maalum la bei kwa taasisi, makampuni, mashule na vituo vya mafunzo kote Tanzania. Tunatoa ankara rasmi za kodi (Proforma na EFD Tax Invoice) na usafirishaji wa haraka.
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
