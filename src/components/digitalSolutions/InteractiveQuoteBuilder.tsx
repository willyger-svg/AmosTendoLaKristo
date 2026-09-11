import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Badge } from '../common/Badge';
import { formatTSh, generateId } from '../../utils/formatters';
import { createWhatsAppUrl } from '../../utils/whatsapp';
import {
  Globe,
  Smartphone,
  Store,
  BarChart3,
  Cpu,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { QuoteRequest } from '../../types';

export const InteractiveQuoteBuilder: React.FC = () => {
  const { createQuoteRequest, showToast, navigateTo } = useApp();

  const [step, setStep] = useState(1);

  // Form State
  const [projectType, setProjectType] = useState<QuoteRequest['projectType']>('Business POS & System');
  const [businessScale, setBusinessScale] = useState<QuoteRequest['businessScale']>('Growing SME');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Barcode Scanning & Thermal Receipt Print',
    'Daily WhatsApp sales summary to owner'
  ]);
  const [timeline, setTimeline] = useState('2 - 4 Weeks');
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [submittedQuote, setSubmittedQuote] = useState<QuoteRequest | null>(null);

  const projectTypeOptions = [
    {
      type: 'Website Development',
      icon: Globe,
      desc: 'Corporate websites, schools, law firms, and online stores.',
      baseRange: 'TSh 450,000 - 1,200,000'
    },
    {
      type: 'Business POS & System',
      icon: Store,
      desc: 'Point-of-Sale, barcode cashiering, and multi-store inventory.',
      baseRange: 'TSh 800,000 - 2,500,000'
    },
    {
      type: 'Mobile App Development',
      icon: Smartphone,
      desc: 'Android & iOS applications with M-Pesa mobile money integration.',
      baseRange: 'TSh 1,500,000 - 4,500,000'
    },
    {
      type: 'Monitoring Dashboard',
      icon: BarChart3,
      desc: 'Real-time multi-branch sales, profit/loss, and expense analytics.',
      baseRange: 'TSh 950,000 - 3,000,000'
    },
    {
      type: 'Custom Software',
      icon: Cpu,
      desc: 'Tailor-made portals for schools, hospitals, or logistics.',
      baseRange: 'TSh 1,200,000 - 5,000,000'
    }
  ];

  const availableFeaturesMap: Record<string, string[]> = {
    'Website Development': [
      'Mobile-first responsive design',
      'Direct WhatsApp inquiry floating chat',
      'Google Maps SEO & local indexing',
      'Custom company domain (.co.tz) & email setup',
      'Content management portal (Self-edit)'
    ],
    'Business POS & System': [
      'Barcode Scanning & Thermal Receipt Print',
      'Multi-cashier permissions & roles',
      'Daily WhatsApp sales summary to owner',
      'Low stock automated SMS alerts',
      'Offline sync mode (Works during outages)'
    ],
    'Mobile App Development': [
      'M-Pesa / Tigo Pesa payment gateway',
      'Push notification alerts',
      'Live GPS map courier tracking',
      'Google Play Store deployment',
      'Offline local data caching'
    ],
    'Monitoring Dashboard': [
      'Live branch revenue graphs & charts',
      'Daily automated PDF sales report to WhatsApp',
      'Multi-branch stock transfer ledger',
      'Staff attendance & shift monitoring'
    ],
    'Custom Software': [
      'Custom database tailored to your paperwork',
      'Multi-tier approval workflows',
      'Automated printable invoices & certificates',
      'Audit log tracking all employee actions'
    ]
  };

  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  const calculateEstimatedRange = (): string => {
    const selectedObj = projectTypeOptions.find(p => p.type === projectType);
    return selectedObj ? selectedObj.baseRange : 'Requires Technical Consultation';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      showToast({
        type: 'error',
        title: 'Missing Contact Details',
        message: 'Please provide your name and phone number.'
      });
      return;
    }

    const quoteId = generateId('TK-QTE');
    const newQuote: QuoteRequest = {
      id: quoteId,
      projectType,
      businessScale,
      features: selectedFeatures,
      timeline,
      estimatedRange: calculateEstimatedRange(),
      customerName,
      customerCompany: customerCompany || 'Individual / Business',
      customerPhone,
      customerEmail: customerEmail || 'N/A',
      projectNotes: projectNotes || 'Standard scope discussion requested.',
      status: 'New',
      createdAt: new Date().toISOString()
    };

    createQuoteRequest(newQuote);
    setSubmittedQuote(newQuote);

    showToast({
      type: 'success',
      title: 'Quote Estimate Generated',
      message: `Your project estimate ${quoteId} has been drafted.`
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Project Estimator</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Build Your Custom Technology Project Scope
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Select your software requirements to generate an estimated investment range and schedule a technical discovery call with TK engineering.
          </p>
        </div>

        {/* Step Indicator */}
        {!submittedQuote && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl shrink-0">
            <span className="text-xs text-slate-400 font-semibold">Step {step} of 4</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full ${
                    step >= s ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8">
        {submittedQuote ? (
          <div className="text-center py-8 space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Estimate Successfully Generated
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
                Project Quote Ref: {submittedQuote.id}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                Thank you, <strong>{submittedQuote.customerName}</strong>. Our engineering lead will review your scope for <strong>{submittedQuote.projectType}</strong> and contact you within 24 business hours.
              </p>
            </div>

            {/* Scope Summary Box */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Project Solution:</span>
                <span className="font-bold text-slate-900">{submittedQuote.projectType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Organization Scale:</span>
                <span className="font-bold text-slate-900">{submittedQuote.businessScale}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Investment Range:</span>
                <span className="font-extrabold text-amber-600 text-sm">
                  {submittedQuote.estimatedRange}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Target Timeline:</span>
                <span className="font-bold text-slate-900">{submittedQuote.timeline}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                * Note: Estimate only — final quotation requires technical consultation.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="whatsapp"
                size="md"
                onClick={() => {
                  const msg = `Hello TK Digital Solutions team! 👋\n\nI have generated quote request *${submittedQuote.id}* for *${submittedQuote.customerCompany}*.\nProject: ${submittedQuote.projectType}\nEstimated: ${submittedQuote.estimatedRange}\n\nPlease let me know when we can arrange a brief technical consultation.`;
                  window.open(createWhatsAppUrl(msg), '_blank');
                }}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Forward Scope to WhatsApp Lead
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSubmittedQuote(null);
                  setStep(1);
                }}
              >
                Create Another Scope
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: Choose Project Type */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    1. What type of digital solution does your organization need?
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select the category that best matches your primary technical objective.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {projectTypeOptions.map(opt => {
                    const isSelected = projectType === opt.type;
                    const IconComp = opt.icon;

                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          setProjectType(opt.type as any);
                          // Reset features to default for that type
                          const defaultFeats = availableFeaturesMap[opt.type] || [];
                          setSelectedFeatures(defaultFeats.slice(0, 2));
                        }}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                          </div>

                          <h5 className="text-xs font-bold text-slate-900">
                            {opt.type}
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Typical Range
                          </span>
                          <span className="text-xs font-black text-amber-700">
                            {opt.baseRange}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setStep(2)}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Continue to Business Scale
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Scale & Required Features */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    2. Select Business Scale & Key Modules for {projectType}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tailor the system capacity and choose key functional integrations.
                  </p>
                </div>

                {/* Scale buttons */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Operational Scale
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { scale: 'Solo / Startup', desc: 'Single location, 1-3 users, focused essential features' },
                      { scale: 'Growing SME', desc: '1-3 branches, 5-15 staff, synchronized inventory & permissions' },
                      { scale: 'Corporate / Multi-Branch', desc: 'Multi-branch enterprise, high transaction volume, custom ERP' }
                    ].map(s => (
                      <button
                        key={s.scale}
                        type="button"
                        onClick={() => setBusinessScale(s.scale as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          businessScale === s.scale
                            ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 block">
                          {s.scale}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                          {s.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features Checkboxes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Key Features Needed
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(availableFeaturesMap[projectType] || []).map(feat => {
                      const isChecked = selectedFeatures.includes(feat);

                      return (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => toggleFeature(feat)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                            isChecked
                              ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-semibold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs">{feat}</span>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-300'}`}>
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setStep(1)}
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setStep(3)}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Next: Timeline & Schedule
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Timeline & Schedule */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    3. Target Launch Timeline
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When do you need the application or system deployed and operational?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Fast Track (1 - 2 Weeks)', value: '1 - 2 Weeks', desc: 'Urgent rollout with core essential modules' },
                    { label: 'Standard (2 - 4 Weeks)', value: '2 - 4 Weeks', desc: 'Balanced timeline with thorough staff testing' },
                    { label: 'Strategic (1 - 2 Months)', value: '1 - 2 Months', desc: 'Complex multi-branch integration & data migration' }
                  ].map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTimeline(t.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        timeline === t.value
                          ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 block">{t.label}</span>
                      <span className="text-[11px] text-slate-500 mt-1 block">{t.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setStep(2)}
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setStep(4)}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Next: Contact Details & Estimate
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Contact Details & Submit */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    4. Contact Details & Preliminary Estimate Summary
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your contact information so our engineering team can send the detailed quotation.
                  </p>
                </div>

                {/* Estimate Preview Bar */}
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Estimated Project Range
                    </span>
                    <span className="text-xl font-black text-amber-950">
                      {calculateEstimatedRange()}
                    </span>
                  </div>
                  <Badge variant="brand" size="sm">
                    {projectType} • {businessScale}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Person Name"
                    placeholder="e.g. Goodluck Mtei"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                  />

                  <Input
                    label="Company / School / Business Name"
                    placeholder="e.g. Mtei Hardware Ltd"
                    value={customerCompany}
                    onChange={e => setCustomerCompany(e.target.value)}
                  />

                  <Input
                    label="Phone Number (WhatsApp Active)"
                    placeholder="e.g. +255 784 556 778"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. info@mteihardware.co.tz"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Specific Workflow Notes / Details
                  </label>
                  <textarea
                    rows={3}
                    value={projectNotes}
                    onChange={e => setProjectNotes(e.target.value)}
                    placeholder="Describe any special requirements, existing paper forms, branch locations, or hardware needs..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setStep(3)}
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={<CheckCircle2 className="w-5 h-5" />}
                  >
                    Submit Scope & Request Technical Call
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
