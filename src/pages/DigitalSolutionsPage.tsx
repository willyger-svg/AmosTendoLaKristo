import React from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { InteractiveQuoteBuilder } from '../components/digitalSolutions/InteractiveQuoteBuilder';
import { TechStackGrid } from '../components/digitalSolutions/TechStackGrid';
import { digitalSolutionsData } from '../data/digitalSolutions';
import { createWhatsAppUrl } from '../utils/whatsapp';
import {
  Globe,
  Store,
  Smartphone,
  BarChart3,
  Cpu,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Code2,
  Workflow
} from 'lucide-react';

export const DigitalSolutionsPage: React.FC = () => {
  const { navigateTo } = useApp();

  const handleScrollToBuilder = () => {
    const el = document.getElementById('interactive-scope-builder');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-8 space-y-16">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Digital Solutions & Custom Software' }]} />

        {/* Hero Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden mt-4">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Full-Stack Engineering & Business Systems</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Software Engineering, POS Systems & Web Applications
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We design, build, and deploy production-grade digital solutions for Tanzanian enterprises. From multi-branch POS cashiers and inventory management to custom mobile apps with M-Pesa automated payment reconciliations.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleScrollToBuilder}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Launch Interactive Scope Builder
              </Button>

              <Button
                variant="whatsapp"
                size="md"
                onClick={() => window.open(createWhatsAppUrl('Hello TK Digital Solutions team! I want to discuss a software project.'), '_blank')}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Chat with Solutions Architect
              </Button>
            </div>
          </div>
        </div>

        {/* 1. Core Solutions Pillars */}
        <div>
          <SectionHeader
            eyebrow="Enterprise Capabilities"
            title="Software Pillars Designed for African Business"
            subtitle="Tailored to operate reliably on local networks, low-bandwidth environments, and power cuts."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {digitalSolutionsData.map(sol => (
              <div
                key={sol.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="brand" size="sm">
                      {sol.categoryTag}
                    </Badge>
                    <span className="text-xs text-slate-400 font-semibold">
                      {sol.deliveryTimeline}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {sol.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {sol.shortDescription}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Core Modules & Integrations:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {sol.coreFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Estimated Range
                    </span>
                    <span className="text-xs font-black text-amber-600">
                      {sol.startingEstimate}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScrollToBuilder}
                  >
                    Configure &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Interactive Project Quote Builder */}
        <div id="interactive-scope-builder" className="scroll-mt-28">
          <SectionHeader
            eyebrow="Instant Project Scoping"
            title="Interactive Digital Project Scope Builder"
            subtitle="Select your requirements, features, scale, and timeline to generate an estimated investment range."
          />

          <InteractiveQuoteBuilder />
        </div>

        {/* 3. Tech Stack & Engineering Architecture */}
        <div className="pt-8">
          <SectionHeader
            eyebrow="Modern Standards"
            title="Engineered with Production-Grade Technology"
            subtitle="We build high-performance web, mobile, and cloud architectures built to scale."
          />

          <TechStackGrid />
        </div>
      </Container>
    </div>
  );
};
