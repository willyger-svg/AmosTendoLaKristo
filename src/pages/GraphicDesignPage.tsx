import React from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { graphicDesignServices } from '../data/services';
import { createWhatsAppUrl } from '../utils/whatsapp';
import {
  Sparkles,
  Palette,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  Layers,
  ArrowRight,
  Printer
} from 'lucide-react';

export const GraphicDesignPage: React.FC = () => {
  const { openModal } = useApp();

  const handleRequestDesign = (title: string) => {
    openModal({ type: 'print-wizard' });
  };

  const samplePortfolio = [
    {
      title: 'Safari Lodge Corporate Brand Identity',
      category: 'Branding & Stationery',
      image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Modern Coffee Shop Packaging & Menu',
      category: 'Print & Packaging',
      image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Law Chambers Letterhead & Business Cards',
      category: 'Corporate Stationery',
      image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=600&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="py-8 space-y-16">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Graphic Design Studio' }]} />

        {/* Hero Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden mt-4">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creative Design & Corporate Branding</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Graphic Design & Visual Brand Identity
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We turn concepts into striking visual identities. From company logos and high-impact marketing flyers to complete corporate stationery packs and product labels ready for precision printing.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => openModal({ type: 'print-wizard' })}
                icon={<Palette className="w-4 h-4" />}
              >
                Request Custom Design Quote
              </Button>

              <Button
                variant="whatsapp"
                size="md"
                onClick={() => window.open(createWhatsAppUrl('Hello TK Stationery! I need a graphic designer for a project.'), '_blank')}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Chat with Design Lead
              </Button>
            </div>
          </div>
        </div>

        {/* 1. Services Grid */}
        <div>
          <SectionHeader
            eyebrow="Creative Packages"
            title="Design Solutions Tailored to Your Business"
            subtitle="Choose from individual visual assets or end-to-end company branding packages."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {graphicDesignServices.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-600">
                      {service.turnaroundTime}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {service.pricingLabel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {service.shortDescription}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleRequestDesign(service.title)}
                  >
                    Start Project
                  </Button>

                  <Button
                    variant="whatsapp"
                    size="sm"
                    onClick={() => window.open(createWhatsAppUrl(`Hello TK Stationery! I am interested in ${service.title}.`), '_blank')}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Sample Design Portfolio Showcase */}
        <div>
          <SectionHeader
            eyebrow="Recent Work"
            title="Design & Print Portfolio"
            subtitle="A glimpse into custom brand assets, logos, and printed packaging produced for Tanzanian enterprises."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {samplePortfolio.map(item => (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs hover:shadow-lg transition-all"
              >
                <div className="aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};
