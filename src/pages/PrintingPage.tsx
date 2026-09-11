import React from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { PrintPriceEstimator } from '../components/printing/PrintPriceEstimator';
import { printingServices, documentServices } from '../data/services';
import { formatTSh } from '../utils/formatters';
import { createWhatsAppUrl } from '../utils/whatsapp';
import {
  Printer,
  FileText,
  Copy,
  Scan,
  Camera,
  Layers,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export const PrintingPage: React.FC = () => {
  const { openModal, navigateTo } = useApp();

  const handleOrderService = (serviceTitle: string) => {
    openModal({ type: 'print-wizard' });
  };

  return (
    <div className="py-8 space-y-16">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Printing & Document Services' }]} />

        {/* Hero Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold">
                <Printer className="w-3.5 h-3.5" />
                <span>High-Speed Laser Production Engines</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                High-Volume Printing, Binding & Document Center
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                We handle urgent court documents, university thesis binding with gold embossing, passport-size photo studio sessions, and corporate report printing with strict privacy and same-day turnaround.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => openModal({ type: 'print-wizard' })}
                  icon={<UploadCloud className="w-4 h-4" />}
                >
                  Upload File & Start Print Job
                </Button>

                <Button
                  variant="whatsapp"
                  size="md"
                  onClick={() => window.open(createWhatsAppUrl('Hello TK Stationery! I need urgent document printing.'), '_blank')}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  WhatsApp Print Desk
                </Button>
              </div>
            </div>

            {/* Quick Pricing Pill Matrix */}
            <div className="lg:col-span-5 bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Standard Base Rates
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">B&W Laser Print</span>
                  <span className="font-bold text-white text-sm">From TSh 100 / pg</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Color Laser Print</span>
                  <span className="font-bold text-amber-400 text-sm">From TSh 500 / pg</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Passport Photos (Set of 6)</span>
                  <span className="font-bold text-white text-sm">TSh 5,000</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Hardcover Thesis Binding</span>
                  <span className="font-bold text-emerald-400 text-sm">TSh 25,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Interactive Print Estimator Calculator */}
        <div className="pt-12">
          <SectionHeader
            eyebrow="Instant Estimation"
            title="Configure Your Print Job"
            subtitle="Select your color mode, paper weight, binding finish, and copies to get an instant cost calculation."
          />
          <PrintPriceEstimator />
        </div>

        {/* 2. Core Printing & Copying Services Grid */}
        <div className="pt-16">
          <SectionHeader
            eyebrow="Specialized Services"
            title="Printing & Document Finishing Services"
            subtitle="From individual passport photography to thousand-page conference packs."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {printingServices.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="brand" size="sm">
                      {service.turnaroundTime}
                    </Badge>
                    <span className="text-xs font-black text-slate-950">
                      {service.pricingLabel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {service.shortDescription}
                  </p>

                  {/* Highlights */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
                    onClick={() => handleOrderService(service.title)}
                    icon={<Printer className="w-3.5 h-3.5" />}
                  >
                    Request Service
                  </Button>

                  <Button
                    variant="whatsapp"
                    size="sm"
                    onClick={() => window.open(createWhatsAppUrl(`Hello TK Stationery! I want to order ${service.title}.`), '_blank')}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Document Typing, Formatting & Professional CV Bureau */}
        <div className="pt-16">
          <SectionHeader
            eyebrow="Secretarial & Typing Bureau"
            title="Typing, CV Preparation & Document Formatting"
            subtitle="Let our expert typists format university dissertations, type contracts, and prepare ATS-friendly professional CVs."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {documentServices.map(doc => (
              <div
                key={doc.id}
                className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                    {doc.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Service Fee</span>
                    <span className="text-xs font-black text-slate-900">{doc.pricingLabel}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal({ type: 'print-wizard' })}
                  >
                    Book Typing &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};
