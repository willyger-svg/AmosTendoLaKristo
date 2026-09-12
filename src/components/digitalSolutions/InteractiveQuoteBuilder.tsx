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
      desc: 'Tovuti za kampuni, shule, ofisi za sheria, na maduka ya mtandaoni.',
      baseRange: 'TSh 450,000 - 1,200,000'
    },
    {
      type: 'Business POS & System',
      icon: Store,
      desc: 'Mfumo wa mauzo, stoo, usomaji barcode, na mashine ya risiti.',
      baseRange: 'TSh 800,000 - 2,500,000'
    },
    {
      type: 'Mobile App Development',
      icon: Smartphone,
      desc: 'Programu za Android & iOS zenye malipo ya M-Pesa, Tigo Pesa na Airtel Money.',
      baseRange: 'TSh 1,500,000 - 4,500,000'
    },
    {
      type: 'Monitoring Dashboard',
      icon: BarChart3,
      desc: 'Uchambuzi wa mauzo ya matawi moja kwa moja, faida/hasara na ripoti za matumizi.',
      baseRange: 'TSh 950,000 - 3,000,000'
    },
    {
      type: 'Custom Software',
      icon: Cpu,
      desc: 'Mifumo maalum ya shule, hospitali, usafirishaji na taasisi.',
      baseRange: 'TSh 1,200,000 - 5,000,000'
    }
  ];

  const availableFeaturesMap: Record<string, string[]> = {
    'Website Development': [
      'Muundo unaovutia kwenye simu na kompyuta',
      'Ujumbe wa WhatsApp moja kwa moja kutoka kwenye tovuti',
      'Usajili wa Google Maps na SEO ya ndani',
      'Usajili wa jina la kikoa (.co.tz) na barua pepe za kikazi',
      'Mfumo rahisi wa kuhariri taarifa mwenyewe'
    ],
    'Business POS & System': [
      'Kuskani Barcode & Kuchapa Risiti za Mashine',
      'Ruksa na ngazi tofauti za watumiaji (Cashier/Admin)',
      'Muhtasari wa mauzo ya siku kutumwa WhatsApp kwa mmiliki',
      'Ujumbe wa SMS bidhaa zikikaribia kuisha stoo',
      'Kufanya kazi bila mtandao (Offline mode)'
    ],
    'Mobile App Development': [
      'Muunganisho wa malipo ya M-Pesa / Tigo Pesa',
      'Taarifa za papo hapo kwa wateja (Push Notifications)',
      'Ufuatiliaji wa eneo kwa ramani ya GPS',
      'Kuweka programu Google Play Store',
      'Kuhifadhi data kwenye simu bila intaneti'
    ],
    'Monitoring Dashboard': [
      'Grafu za mapato ya kila tawi moja kwa moja',
      'Ripoti ya PDF ya mauzo ya kila siku WhatsApp',
      'Daftari la uhamisho wa mzigo kati ya matawi',
      'Mahudhurio na zamu za wafanyakazi'
    ],
    'Custom Software': [
      'Hifadhidata iliyosanifiwa kulingana na fomu zako za kazi',
      'Mfumo wa uidhinishaji wa ngazi kadhaa',
      'Ankara (Invoices) na vyeti vya kuchapa kiotomatiki',
      'Daftari la kumbukumbu ya kila kitendo cha mfanyakazi'
    ]
  };

  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  const calculateEstimatedRange = (): string => {
    const selectedObj = projectTypeOptions.find(p => p.type === projectType);
    return selectedObj ? selectedObj.baseRange : 'Inahitaji Kikao cha Kiufundi';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      showToast({
        type: 'error',
        title: 'Taarifa Zinakosekana',
        message: 'Tafadhali weka jina lako na namba yako ya simu.'
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
      customerCompany: customerCompany || 'Mtu Binafsi / Biashara',
      customerPhone,
      customerEmail: customerEmail || 'Hakuna',
      projectNotes: projectNotes || 'Ombi la mazungumzo ya mradi.',
      status: 'New',
      createdAt: new Date().toISOString()
    };

    createQuoteRequest(newQuote);
    setSubmittedQuote(newQuote);

    showToast({
      type: 'success',
      title: 'Makadirio Yamekamilika',
      message: `Makadirio ya mradi wako ${quoteId} yameandaliwa.`
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Kikokotoo cha Mradi wa Kiteknolojia</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Sanidi Mahitaji ya Mradi Wako wa Kidijitali
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Chagua vipengele unavyohitaji ili kupata makadirio ya gharama na kupanga kikao cha kiufundi na wahandisi wa TK.
          </p>
        </div>

        {/* Step Indicator */}
        {!submittedQuote && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl shrink-0">
            <span className="text-xs text-slate-400 font-semibold">Hatua ya {step} kati ya 4</span>
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
                Makadirio Yamekamilika Kikamilifu
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
                Namba ya Makadirio: {submittedQuote.id}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                Asante, <strong>{submittedQuote.customerName}</strong>. Kiongozi wetu wa uhandisi atapitia mradi wako wa <strong>{submittedQuote.projectType}</strong> na kuwasiliana nawe ndani ya saa 24 za kazi.
              </p>
            </div>

            {/* Scope Summary Box */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Aina ya Mradi:</span>
                <span className="font-bold text-slate-900">{submittedQuote.projectType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ukubwa wa Biashara/Taasisi:</span>
                <span className="font-bold text-slate-900">{submittedQuote.businessScale}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Makadirio ya Uwekezaji:</span>
                <span className="font-extrabold text-amber-600 text-sm">
                  {submittedQuote.estimatedRange}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Muda Unaotarajiwa:</span>
                <span className="font-bold text-slate-900">{submittedQuote.timeline}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                * Angalizo: Haya ni makadirio ya awali — bei kamili inathibitishwa baada ya kikao cha kiufundi.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="whatsapp"
                size="md"
                onClick={() => {
                  const msg = `Habari timu ya TK Digital Solutions! 👋\n\nNimetengeneza ombi la makadirio ya mradi *${submittedQuote.id}* kwa ajili ya *${submittedQuote.customerCompany}*.\nAina ya Mradi: ${submittedQuote.projectType}\nMakadirio: ${submittedQuote.estimatedRange}\n\nTafadhali nijulishe lini tunaweza kufanya kikao kifupi cha kiufundi.`;
                  window.open(createWhatsAppUrl(msg), '_blank');
                }}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Tuma Makadirio Haya WhatsApp
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSubmittedQuote(null);
                  setStep(1);
                }}
              >
                Tengeneza Makadirio Mengine
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
                    1. Je, shirika au biashara yako inahitaji mfumo wa aina gani?
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chagua kundi linalolingana vyema na lengo lako kuu la kiufundi.
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
                            Makadirio ya Kawaida
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
                    Endelea kwenye Ukubwa wa Biashara
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Scale & Required Features */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    2. Chagua Ukubwa wa Biashara & Moduli za {projectType}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Weka ukubwa wa mfumo na uchague mifumo ya ziada unayohitaji kuunganisha.
                  </p>
                </div>

                {/* Scale buttons */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Ukubwa wa Shughuli za Kazi
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { scale: 'Solo / Startup', desc: 'Eneo moja, watumiaji 1-3, vipengele muhimu vya msingi' },
                      { scale: 'Growing SME', desc: 'Matawi 1-3, wafanyakazi 5-15, stoo iliyounganishwa na ruksa' },
                      { scale: 'Corporate / Multi-Branch', desc: 'Matawi mengi, miamala mikubwa ya biashara, mfumo kamili wa ERP' }
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
                    Vipengele Muhimu Vinavyohitajika
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
                    Rudi Nyuma
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setStep(3)}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Mbele: Muda wa Kukamilisha
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Timeline & Schedule */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    3. Muda Unaolengwa wa Kukamilisha Mradi
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Je, ungependa mfumo au programu yako iwe tayari kuanza kufanya kazi lini?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Haraka (Wiki 1 - 2)', value: '1 - 2 Weeks', desc: 'Kukamilisha kwa haraka moduli za msingi' },
                    { label: 'Kawaida (Wiki 2 - 4)', value: '2 - 4 Weeks', desc: 'Muda wa kawaida unaojumuisha mafunzo ya watumishi' },
                    { label: 'Mradi Mkubwa (Mwezi 1 - 2)', value: '1 - 2 Months', desc: 'Mifumo mikubwa yenye matawi mengi na uhamishaji wa data' }
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
                    Rudi Nyuma
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setStep(4)}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Mbele: Taarifa za Mawasiliano
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Contact Details & Submit */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    4. Taarifa za Mawasiliano & Muhtasari wa Makadirio
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Weka taarifa zako za mawasiliano ili timu yetu ya TEHAMA iweze kukutumia dondoo kamili ya bei.
                  </p>
                </div>

                {/* Estimate Preview Bar */}
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Makadirio ya Gharama ya Mradi
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
                    label="Jina la Mhusika"
                    placeholder="mfano: Goodluck Mtei"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                  />

                  <Input
                    label="Jina la Kampuni / Shule / Biashara"
                    placeholder="mfano: Mtei Hardware Ltd"
                    value={customerCompany}
                    onChange={e => setCustomerCompany(e.target.value)}
                  />

                  <Input
                    label="Namba ya Simu (Inayotumika WhatsApp)"
                    placeholder="mfano: +255 784 556 778"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    required
                  />

                  <Input
                    label="Barua Pepe (Email)"
                    type="email"
                    placeholder="mfano: info@mteihardware.co.tz"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Maelezo ya Ziada au Mahitaji Maalum
                  </label>
                  <textarea
                    rows={3}
                    value={projectNotes}
                    onChange={e => setProjectNotes(e.target.value)}
                    placeholder="Elezea mahitaji yoyote maalum, mifumo unayotumia sasa, idadi ya matawi, au vifaa unavyohitaji..."
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
                    Rudi Nyuma
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={<CheckCircle2 className="w-5 h-5" />}
                  >
                    Tuma Maombi & Panga Kikao cha Kiufundi
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
