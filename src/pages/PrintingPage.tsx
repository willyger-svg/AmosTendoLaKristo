import React from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ServiceGridSkeleton } from '../components/common/Skeleton';
import { PrintPriceEstimator } from '../components/printing/PrintPriceEstimator';
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
  const { openModal, navigateTo, printingServices, isLoadingData } = useApp();

  const handleOrderService = (serviceTitle: string) => {
    openModal({ type: 'print-wizard' });
  };

  const documentServices = printingServices.slice(0, 6);

  return (
    <div className="py-8 space-y-16">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Huduma za Uchapishaji na Nyaraka' }]} />

        {/* Hero Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-semibold">
                <Printer className="w-3.5 h-3.5" />
                <span>Mashine za Kisasa za Kasi Kubwa za Laser</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Kituo cha Uchapishaji Mkubwa, Kufunga Vitabu na Nyaraka
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Tunachapa nyaraka za dharura za mahakama, kufunga tasnifu (thesis) za chuo zenye maandishi ya dhahabu (hardcover), picha za pasipoti za kisasa, na ripoti za ofisi kwa usiri mkubwa na kukamilisha siku hiyo hiyo.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => openModal({ type: 'print-wizard' })}
                  icon={<UploadCloud className="w-4 h-4" />}
                >
                  Pakia Faili & Anza Uchapishaji
                </Button>

                <Button
                  variant="whatsapp"
                  size="md"
                  onClick={() => window.open(createWhatsAppUrl('Habari TK Stationery! Nahitaji huduma ya kuchapa nyaraka zangu.'), '_blank')}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Wasiliana WhatsApp Dawati la Chapa
                </Button>
              </div>
            </div>

            {/* Quick Pricing Pill Matrix */}
            <div className="lg:col-span-5 bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Viwango vya Msingi vya Bei
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Uchapishaji Mweusi & Mweupe</span>
                  <span className="font-bold text-white text-sm">Kuanzia TSh 100 / ukurasa</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Uchapishaji wa Rangi (Color)</span>
                  <span className="font-bold text-amber-400 text-sm">Kuanzia TSh 500 / ukurasa</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Picha za Pasipoti (Seti ya 6)</span>
                  <span className="font-bold text-white text-sm">TSh 5,000</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Kufunga Thesis (Hardcover Dhahabu)</span>
                  <span className="font-bold text-emerald-400 text-sm">TSh 25,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Interactive Print Estimator Calculator */}
        <div className="pt-12">
          <SectionHeader
            eyebrow="Kadirio la Papo Hapo"
            title="Kadiria Gharama ya Uchapishaji Wako"
            subtitle="Chagua aina ya rangi, unene wa karatasi, jalada au aina ya kufunga, na nakala ili kupata hesabu ya haraka ya bei."
          />
          <PrintPriceEstimator />
        </div>

        {/* 2. Core Printing & Copying Services Grid */}
        <div className="pt-16">
          <SectionHeader
            eyebrow="Huduma Zetu za Uchapishaji"
            title="Huduma za Uchapishaji na Kumalizia Nyaraka"
            subtitle="Kuanzia picha binafsi za pasipoti hadi makabrasha ya mamia ya kurasa za mikutano."
          />

          {isLoadingData && printingServices.length === 0 ? (
            <ServiceGridSkeleton count={6} />
          ) : (
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
                      Agiza Huduma Hii
                    </Button>

                    <Button
                      variant="whatsapp"
                      size="sm"
                      onClick={() => window.open(createWhatsAppUrl(`Habari TK Stationery! Nahitaji huduma ya ${service.title}.`), '_blank')}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Document Typing, Formatting & Professional CV Bureau */}
        <div className="pt-16">
          <SectionHeader
            eyebrow="Huduma za Uhazigi na Kuandika"
            title="Kuandika Nyaraka, Kutengeneza CV na Kupanga Miundo"
            subtitle="Wataalamu wetu wa taipu watapangilia tasnifu zako, kuandika mikataba, na kuandaa wasifu wa kazi (CV) wa kitaalamu."
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
                    <span className="text-[10px] text-slate-400 block">Gharama ya Huduma</span>
                    <span className="text-xs font-black text-slate-900">{doc.pricingLabel}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal({ type: 'print-wizard' })}
                  >
                    Pata Huduma Hii &rarr;
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
