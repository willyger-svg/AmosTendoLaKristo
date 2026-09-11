import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { publicServicesData } from '../data/publicServices';
import { PublicServiceItem } from '../types';
import { createWhatsAppUrl } from '../utils/whatsapp';
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  FileText,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const OnlineServicesPage: React.FC = () => {
  const { openModal } = useApp();

  const [selectedAgency, setSelectedAgency] = useState<string>('ALL');

  // Check URL query parameters for focus
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focus = params.get('focus');
    if (focus) {
      setSelectedAgency(focus.toUpperCase());
    }
  }, []);

  const agencies = [
    { id: 'ALL', label: 'All Public Services' },
    { id: 'NIDA', label: 'NIDA (National ID)' },
    { id: 'TRA', label: 'TRA (TIN & Tax)' },
    { id: 'POLICE', label: 'Police Loss Reports' },
    { id: 'RITA', label: 'RITA Certificates' },
    { id: 'NAPA', label: 'NAPA / Ajira Portal' },
    { id: 'OTHER', label: 'BRELA & HESLB' }
  ];

  const filteredServices = selectedAgency === 'ALL'
    ? publicServicesData
    : publicServicesData.filter(s => {
        if (selectedAgency === 'OTHER') {
          return s.code === 'OTHER';
        }
        return s.code === selectedAgency;
      });

  const handleStartAssistance = (item: PublicServiceItem) => {
    openModal({
      type: 'public-service-request',
      service: item
    });
  };

  return (
    <div className="py-8 space-y-12">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Online Public Services Assistance' }]} />

        {/* Page Hero */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden mt-4">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accredited Private Typing & Internet Portal Assistance</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Government & Public Online Services Bureau
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Navigating online government portals can be complicated. Our trained digital assistants help you fill online forms accurately, scan required identity documents, generate official GePG payment control numbers, and print certificates.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="whatsapp"
                size="md"
                onClick={() => window.open(createWhatsAppUrl('Hello TK Stationery! I need help with an online government application.'), '_blank')}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Inquire via WhatsApp Desk
              </Button>
            </div>
          </div>
        </div>

        {/* MANDATORY LEGAL DISCLAIMER BANNER */}
        <DisclaimerBanner />

        {/* Agency Filter Tabs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {agencies.map(ag => (
              <button
                key={ag.id}
                type="button"
                onClick={() => setSelectedAgency(ag.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedAgency === ag.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ag.label}
              </button>
            ))}
          </div>

          {/* Services List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredServices.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
              >
                {/* Top Title & Agency Tag */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {service.agencyName}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {service.estimatedAssistanceTime}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {service.shortDescription}
                    </p>
                  </div>

                  {/* Required Documents Checklist */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>Required Documents Checklist:</span>
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      {service.typicalRequirements.map((doc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Workflow Steps Preview */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Assistance Scope & Support:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {service.features.map((step, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-slate-700 leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fee Breakdown Notice */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>TK Assistance & Typing Fee:</span>
                      <span className="text-amber-900 font-black">{service.tkAssistanceFeeNote}</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-tight">
                      <strong>Statutory Govt Fees:</strong> {service.officialGovFeeNote}
                    </p>
                  </div>
                </div>

                {/* Card Bottom CTA Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {service.officialPortalUrlPlaceholder && (
                    <a
                      href={service.officialPortalUrlPlaceholder}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold underline"
                    >
                      <span>Visit Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartAssistance(service)}
                      icon={<FileCheck className="w-4 h-4" />}
                    >
                      Start Assisted Application
                    </Button>

                    <Button
                      variant="whatsapp"
                      size="sm"
                      onClick={() => window.open(createWhatsAppUrl(`Hello TK Stationery! I need assistance with ${service.title} (${service.agencyName}).`), '_blank')}
                      icon={<MessageSquare className="w-4 h-4" />}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};
