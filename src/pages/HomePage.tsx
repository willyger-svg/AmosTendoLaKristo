import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { Container } from '../components/layout/Container';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SectionHeader } from '../components/common/SectionHeader';
import { ProductCard } from '../components/shop/ProductCard';
import { PrintPriceEstimator } from '../components/printing/PrintPriceEstimator';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { mockProducts } from '../data/products';
import { publicServicesData } from '../data/publicServices';
import { digitalSolutionsData } from '../data/digitalSolutions';
import { mockTestimonials } from '../data/orders';
import { formatTSh } from '../utils/formatters';
import { createWhatsAppUrl } from '../utils/whatsapp';
import {
  ShoppingBag,
  FileCheck2,
  Printer,
  Sparkles,
  Cpu,
  Globe,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Building2,
  Camera,
  Smartphone,
  Settings,
  BarChart3,
  Zap,
  Check,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  CreditCard,
  Banknote,
  Truck,
  Store,
  Tag
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo, openModal, storeSettings, advertisements, trackAdClick } = useApp();
  const { t, language } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'stationery' | 'printing' | 'public' | 'tech'>('all');

  const featuredProducts = mockProducts.filter(p => p.featured || p.isBestSeller).slice(0, 8);
  const featuredPublicServices = publicServicesData.slice(0, 4);

  const heroAds = advertisements.filter(a => a.isActive && (a.placement === 'hero_banner' || !a.placement));
  const activePromoAd = heroAds[0];

  const whatsappPaymentNumber = storeSettings?.paymentWhatsAppNumber || '0787754202';
  const displayPhone = storeSettings?.displayPhoneNumber || '+255 787 754 202';

  // The 10 distinct services requested for Section 2
  const serviceCards = [
    {
      id: 'stationery',
      category: 'stationery',
      title: language === 'sw' ? 'Nunua Vifaa vya Ofisi na Shule' : 'Buy Stationery',
      description: language === 'sw'
        ? 'Daftari, kalamu, ream za karatasi, vifaa vya shule, mafaili na vikorokoro vya kompyuta.'
        : 'Notebooks, pens, paper reams, school kits, files, and computer accessories.',
      icon: ShoppingBag,
      tag: '1,500+ Items',
      color: 'hover:border-amber-400 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-500 text-slate-950',
      actionText: language === 'sw' ? 'Fungua Duka' : 'Shop Store',
      path: '/shop'
    },
    {
      id: 'printing',
      category: 'printing',
      title: language === 'sw' ? 'Chapisha Nyaraka (Printing)' : 'Print Documents',
      description: language === 'sw'
        ? 'Uchapaji wa haraka B&W na rangi, spiral binding, na jalada gumu la vitabu/thesis.'
        : 'High-speed B&W and full-color laser printing, spiral binding, and hardcover thesis finishing.',
      icon: Printer,
      tag: 'Instant Estimate',
      color: 'hover:border-sky-400 hover:shadow-sky-500/10',
      iconBg: 'bg-sky-600 text-white',
      actionText: language === 'sw' ? 'Chapisha Sasa' : 'Print Now',
      path: '/printing'
    },
    {
      id: 'photos',
      category: 'printing',
      title: language === 'sw' ? 'Picha za Passport & Studio' : 'Passport Photos',
      description: language === 'sw'
        ? 'Picha za pasipoti za papo hapo zenye background nyeupe/bluu na nakala za kidijitali.'
        : 'Studio passport-size photos with instant background replacement and digital copies.',
      icon: Camera,
      tag: '5-Min Pickup',
      color: 'hover:border-amber-400 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-600 text-white',
      actionText: language === 'sw' ? 'Tazama Vigezo' : 'View Options',
      path: '/printing'
    },
    {
      id: 'public-services',
      category: 'public',
      title: language === 'sw' ? 'Msaada wa Huduma za Serikali' : 'Online Services Assistance',
      description: language === 'sw'
        ? 'Msaada wa kuomba NIDA, TIN ya TRA, Ripoti ya Polisi ya Upotevu, RITA, na NAPA.'
        : 'Step-by-step typing and filing for NIDA, TRA TIN, Police Loss Reports, RITA, and NAPA.',
      icon: ShieldCheck,
      tag: 'Portal Support',
      color: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-600 text-white',
      actionText: language === 'sw' ? 'Pata Msaada' : 'Get Assisted',
      path: '/online-services'
    },
    {
      id: 'graphic-design',
      category: 'tech',
      title: language === 'sw' ? 'Ubunifu wa Graphics & Brand' : 'Graphic Design',
      description: language === 'sw'
        ? 'Nembo za kisasa (logos), vipeperushi (flyers), mabango, company profiles na vitambulisho.'
        : 'Custom logos, flyers, banners, company profiles, letterheads, and brand identity kits.',
      icon: Sparkles,
      tag: 'Creative Studio',
      color: 'hover:border-purple-400 hover:shadow-purple-500/10',
      iconBg: 'bg-purple-600 text-white',
      actionText: language === 'sw' ? 'Tazama Kazi' : 'Explore Designs',
      path: '/graphic-design'
    },
    {
      id: 'it-support',
      category: 'tech',
      title: language === 'sw' ? 'Huduma za IT & Matengenezo' : 'IT Support & Hardware',
      description: language === 'sw'
        ? 'Matengenezo ya kompyuta (PC repair), Windows OS, kusanidi printa na kuweka antivirus.'
        : 'PC maintenance, Windows OS repair, printer configuration, and antivirus diagnostics.',
      icon: Cpu,
      tag: 'Diagnostics',
      color: 'hover:border-rose-400 hover:shadow-rose-500/10',
      iconBg: 'bg-rose-600 text-white',
      actionText: language === 'sw' ? 'Pata Fundi' : 'Book Service',
      path: '/it-support'
    },
    {
      id: 'website-dev',
      category: 'tech',
      title: language === 'sw' ? 'Kutengeneza Tovuti & Systems' : 'Website Development',
      description: language === 'sw'
        ? 'Tovuti za kisasa za kampuni, mifumo ya mtandaoni na web applications zinazofanya kazi haraka.'
        : 'Fast, responsive company websites, landing pages, and web applications built to scale.',
      icon: Globe,
      tag: 'Web Tech',
      color: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
      iconBg: 'bg-indigo-600 text-white',
      actionText: language === 'sw' ? 'Jenga Tovuti' : 'Build Website',
      path: '/digital-solutions'
    },
    {
      id: 'mobile-app',
      category: 'tech',
      title: language === 'sw' ? 'Programu za Simu (Mobile Apps)' : 'Mobile App Development',
      description: language === 'sw'
        ? 'Mobile apps za Android na iOS zilizoboreshwa kwa biashara na huduma za Tanzania.'
        : 'Android and iOS applications tailored for Tanzanian business operations and customer reach.',
      icon: Smartphone,
      tag: 'Mobile Apps',
      color: 'hover:border-blue-400 hover:shadow-blue-500/10',
      iconBg: 'bg-blue-600 text-white',
      actionText: language === 'sw' ? 'Tengeneza App' : 'Build App',
      path: '/digital-solutions'
    },
    {
      id: 'business-systems',
      category: 'tech',
      title: language === 'sw' ? 'Mifumo ya Biashara (POS Systems)' : 'Business Systems (POS)',
      description: language === 'sw'
        ? 'Point of sale, stoo ya bidhaa matawini, risiti za kielektroniki na usimamizi wa mauzo.'
        : 'Point of sale, multi-branch inventory, receipt generation, and staff sales tracking.',
      icon: Settings,
      tag: 'Retail & POS',
      color: 'hover:border-teal-400 hover:shadow-teal-500/10',
      iconBg: 'bg-teal-600 text-white',
      actionText: language === 'sw' ? 'Tazama Demo' : 'View Systems',
      path: '/digital-solutions'
    },
    {
      id: 'business-monitoring',
      category: 'tech',
      title: language === 'sw' ? 'Ufuatiliaji wa Faida & Ripoti' : 'Business Monitoring',
      description: language === 'sw'
        ? 'Dashibodi za mapato ya kila siku, taarifa za bidhaa zilizobaki na ripoti za moja kwa moja.'
        : 'Executive dashboards, daily profit analytics, branch stock alerts, and automated reports.',
      icon: BarChart3,
      tag: 'Analytics',
      color: 'hover:border-amber-400 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-600 text-white',
      actionText: language === 'sw' ? 'Omba Nukuu' : 'View Demo',
      path: '/digital-solutions'
    }
  ];

  const filteredServices = selectedFilter === 'all'
    ? serviceCards
    : serviceCards.filter(s => s.category === selectedFilter);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section
        className="relative text-white pt-10 pb-16 sm:pt-16 sm:pb-24 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.94) 0%, rgba(15, 23, 42, 0.88) 50%, rgba(2, 6, 23, 0.95) 100%), url('https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=2000&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

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
                  {activePromoAd.badgeText || 'PROMO'}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Stationery • Printing • Digital Solutions</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {language === 'sw' ? 'Vifaa, Chapisho & Teknolojia.' : 'Everything You Need.'} <br className="hidden sm:inline" />
                <span className="text-amber-400">{language === 'sw' ? 'Mahali Pamoja.' : 'One Place.'}</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {language === 'sw'
                  ? 'Kuanzia vifaa vya shule na ofisi, uchapaji wa haraka wa nyaraka, msaada wa huduma za serikali mtandaoni (NIDA, TRA, Polisi), hadi mifumo ya kisasa ya programu za biashara.'
                  : 'From everyday school and office stationery to high-speed document printing, online government service assistance (NIDA, TRA, Police), and custom business software systems.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigateTo('/shop')}
                  icon={<ShoppingBag className="w-4 h-4 text-slate-950" />}
                  className="w-full sm:w-auto"
                >
                  {t('hero.cta_shop', 'Nunua Vifaa')}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigateTo('/printing')}
                  icon={<Printer className="w-4 h-4 text-amber-400" />}
                  className="w-full sm:w-auto border-slate-700 text-white hover:bg-slate-900"
                >
                  {t('hero.cta_print', 'Chapisha Nyaraka')}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => navigateTo('/online-services')}
                  icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  className="w-full sm:w-auto text-slate-300 hover:text-white"
                >
                  {t('hero.cta_portal', 'Huduma za Serikali')}
                </Button>
              </div>

              {/* Verified Trust Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">1,500+</span>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {language === 'sw' ? 'Vifaa vya Shule & Ofisi' : 'Stationery Products'}
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">2-4 Hrs</span>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {language === 'sw' ? 'Usafirishaji Dar es Salaam' : 'Dar Delivery Speed'}
                  </span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">100%</span>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {language === 'sw' ? 'Huduma ya Uhakika' : 'Verified Reliability'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Interactive Card / Manual Payment Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-2xl backdrop-blur-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">
                        {language === 'sw' ? 'Malipo Salama ya Simu' : 'Fast Manual Payments'}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        M-Pesa • Tigo Pesa • Airtel • Cash
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                {/* WhatsApp Payment Number highlight */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {language === 'sw' ? 'Namba ya Malipo & WhatsApp ya TK:' : 'TK Payment / WhatsApp Number:'}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-black text-amber-400 tracking-wider font-mono">
                      {whatsappPaymentNumber}
                    </span>
                    <a
                      href={createWhatsAppUrl(whatsappPaymentNumber, 'Habari TK Stationery, nahitaji msaada wa vifaa/huduma.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {language === 'sw'
                      ? 'Lipa kwa simu, kisha tuma risiti moja kwa moja WhatsApp kwa uthibitisho wa haraka.'
                      : 'Pay via Mobile Money, then send receipt on WhatsApp for instant order processing.'}
                  </p>
                </div>

                {/* Quick actions list */}
                <div className="space-y-2 pt-1">
                  <div
                    onClick={() => navigateTo('/shop')}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      {language === 'sw' ? 'Agiza Vifaa vya Ofisi/Shule' : 'Order Stationery Items'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div
                    onClick={() => navigateTo('/printing')}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <Printer className="w-4 h-4 text-sky-400" />
                      {language === 'sw' ? 'Kikokotoo cha Bei ya Printing' : 'Instant Print Calculator'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div
                    onClick={() => navigateTo('/track-order')}
                    className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      {language === 'sw' ? 'Fuatilia Hali ya Oda Yako' : 'Track Existing Order'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. THE 10 PILLARS OF SERVICES */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <SectionHeader
                title={language === 'sw' ? 'Huduma Zetu Kamili 10' : 'Our 10 Core Services'}
                subtitle={language === 'sw'
                  ? 'Kila kitu unachohitaji kwa ofisi, shule, uchapaji, serikali mtandaoni na teknolojia.'
                  : 'Complete suite of stationery, document printing, government portals, and tech solutions.'}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: language === 'sw' ? 'Zote (All)' : 'All 10' },
                { id: 'stationery', label: 'Stationery' },
                { id: 'printing', label: 'Printing' },
                { id: 'public', label: 'Gov Portals' },
                { id: 'tech', label: 'Tech & POS' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredServices.map(service => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => navigateTo(service.path)}
                  className={`bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xs flex flex-col justify-between ${service.color}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
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

                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>{service.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. FEATURED PRODUCTS PREVIEW */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <SectionHeader
              title={language === 'sw' ? 'Vifaa Vinavyoongoza Mauzo' : 'Best Selling Stationery'}
              subtitle={language === 'sw'
                ? 'Karatasi za ubora wa juu, kalamu, madaftari, na vifaa vya kielektroniki.'
                : 'Top-rated paper reams, writing instruments, notebooks, and office accessories.'}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('/shop')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {language === 'sw' ? 'Tazama Duka Lote' : 'View Full Catalog'}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* 4. PRINTING CALCULATOR EMBED */}
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                {language === 'sw' ? 'Kikokotoo cha Chapisho' : 'Instant Print Calculator'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {language === 'sw'
                  ? 'Kokotoa Bei ya Chapisho Papo Hapo'
                  : 'Calculate Your Print Job Cost Instantly'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'sw'
                  ? 'Chagua idadi ya kurasa, aina ya rangi (B&W au Full Color), ukubwa wa karatasi (A4/A3), na aina ya binding upate makadirio halisi kabla ya kutuma kazi yako.'
                  : 'Specify page count, color options (B&W or Full Color), paper format (A4/A3), and binding preference to calculate your exact cost.'}
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'sw' ? 'Uchapaji wa laser wenye ubora wa 1200 DPI' : 'High-density 1200 DPI laser printing'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'sw' ? 'Spiral binding na jalada la plastiki kwa haraka' : 'Fast spiral binding with clear covers'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'sw' ? 'Hardcover thesis binding kwa wanafunzi wa chuo' : 'Hardcover golden-embossed thesis binding'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <PrintPriceEstimator />
            </div>
          </div>
        </Container>
      </section>

      {/* 5. PUBLIC SERVICES ASSISTANCE SECTION */}
      <section
        className="relative text-white py-16 rounded-3xl mx-4 sm:mx-8 overflow-hidden shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.92), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                {language === 'sw' ? 'Msaada wa Serikali Mtandaoni' : 'Government Services Assistance'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                {language === 'sw' ? 'Usipate Shida na Mifumo ya Mtandaoni' : 'Fast Public Portal Assistance'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                {language === 'sw'
                  ? 'Wataalamu wetu wapo tayari kukusaidia kujaza, kufuatilia na kuchapisha nyaraka za NIDA, TRA, Polisi, RITA na NAPA bila makosa.'
                  : 'Our certified clerks assist you in filing and printing documentation for NIDA, TRA, Police, RITA, and NAPA.'}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigateTo('/online-services')}
              className="bg-emerald-600 text-white hover:bg-emerald-500 font-bold"
            >
              {language === 'sw' ? 'Huduma Zote za Serikali →' : 'View All Portals →'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredPublicServices.map(srv => (
              <div key={srv.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {srv.agencyName || srv.code}
                  </span>
                  <h3 className="font-bold text-sm text-white leading-snug">{srv.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{srv.shortDescription}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 font-semibold text-[11px] truncate max-w-[140px]">
                    {srv.tkAssistanceFeeNote?.split(':')[0] || 'Assistance'}
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

      {/* 6. TESTIMONIALS & TRUST */}
      <section>
        <Container>
          <SectionHeader
            title={language === 'sw' ? 'Wateja Wetu Wanasema Nini' : 'What Our Customers Say'}
            subtitle={language === 'sw'
              ? 'Zaidi ya wateja 5,000, shule na makampuni ya Dar es Salaam wanatuamini.'
              : 'Trusted by over 5,000 students, businesses, and professionals in Dar es Salaam.'}
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

      {/* 7. WHOLESALE, SCHOOL & CORPORATE SUPPLIES BANNER */}
      <section className="mx-4 sm:mx-8">
        <div
          className="relative rounded-3xl overflow-hidden text-white p-8 sm:p-12 shadow-2xl"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.88) 50%, rgba(15, 23, 42, 0.95) 100%), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80')`,
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
                ? 'TK Stationery inatoa punguzo maalum la bei kwa taasisi, makampuni, mashule na vituo vya mafunzo kote Tanzania. Tunatoa ankara rasmi (Proforma & EFD Tax Invoice) na usafirishaji wa haraka.'
                : 'TK Stationery offers tailored wholesale discounts for institutions, corporate offices, schools, and organizations across Tanzania with official tax invoicing.'}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href={createWhatsAppUrl(whatsappPaymentNumber, 'Habari TK Stationery! Ninahitaji vifaa vya jumla / quotation ya ofisi.')}
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
                className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 backdrop-blur-sm transition-all"
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
