import React from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { itSupportServices } from '../data/services';
import { createWhatsAppUrl } from '../utils/whatsapp';
import {
  Cpu,
  Wrench,
  ShieldCheck,
  HardDrive,
  Wifi,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight,
  Server
} from 'lucide-react';

export const ITSupportPage: React.FC = () => {
  const { openModal } = useApp();

  const handleBookIT = (serviceTitle: string) => {
    openModal({ type: 'print-wizard' });
  };

  return (
    <div className="py-8 space-y-16">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'IT Support & PC Repair' }]} />

        {/* Hero Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden mt-4">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Certified Technical Diagnostics & Repairs</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Computer Repair, Windows OS & Office IT Support
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Fast, dependable hardware troubleshooting and software optimization. We service laptops, desktop PCs, POS thermal printers, local network routers, and antivirus security suites.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => openModal({ type: 'print-wizard' })}
                icon={<Wrench className="w-4 h-4" />}
              >
                Book Diagnostic Session
              </Button>

              <Button
                variant="whatsapp"
                size="md"
                onClick={() => window.open(createWhatsAppUrl('Hello TK Stationery! I have an IT support issue with my computer.'), '_blank')}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Chat with Technician
              </Button>
            </div>
          </div>
        </div>

        {/* 1. Services Grid */}
        <div>
          <SectionHeader
            eyebrow="Diagnostic & Support Services"
            title="Computer & Network Solutions"
            subtitle="Walk into our Dar es Salaam center with your device or arrange on-site corporate office maintenance."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itSupportServices.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="brand" size="sm">
                      {service.turnaroundTime}
                    </Badge>
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
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
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
                    onClick={() => handleBookIT(service.title)}
                  >
                    Book Diagnostic
                  </Button>

                  <Button
                    variant="whatsapp"
                    size="sm"
                    onClick={() => window.open(createWhatsAppUrl(`Hello TK Stationery! I need IT support for ${service.title}.`), '_blank')}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. IT Maintenance FAQs & Guarantees */}
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-6">
          <SectionHeader
            eyebrow="Our Commitment"
            title="Data Privacy & Hardware Handling Guarantees"
            subtitle="We understand your files and customer data are confidential."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Strict Data Privacy</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero unauthorized inspection of your personal photos, business spreadsheets, or sensitive credentials during repair.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg w-fit">
                <HardDrive className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Original Spare Parts</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We only install verified SSDs, RAM modules, laptop batteries, and replacement screens with manufacturer warranties.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-lg w-fit">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">Fast 24hr Diagnostic</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get an exact root cause assessment and upfront cost estimate before any repair work commences.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
