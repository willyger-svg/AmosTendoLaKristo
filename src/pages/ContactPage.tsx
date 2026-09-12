import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Container } from '../components/layout/Container';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SectionHeader } from '../components/common/SectionHeader';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { createWhatsAppUrl, TK_PHONE_DISPLAY } from '../utils/whatsapp';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  Building2,
  ShieldCheck
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Vifaa vya Ofisi na Shule');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      showToast({
        type: 'error',
        title: 'Tafadhali Jaza Taarifa Muhimu',
        message: 'Jaza jina lako, namba ya simu, na ujumbe unaotaka kutuma.'
      });
      return;
    }

    setIsSent(true);
    showToast({
      type: 'success',
      title: 'Ujumbe Umetumwa Kikamilifu',
      message: 'Asante sana! Wahudumu wetu watawasiliana nawe haraka iwezekanavyo.'
    });
  };

  return (
    <div className="py-8 space-y-16">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Wasiliana Nasi' }]} />

        {/* Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 text-center max-w-3xl mx-auto space-y-3 mt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Wasiliana na Wahudumu Wetu
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Tembelea Duka Letu au Tuma Ujumbe Moja kwa Moja
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Iwe unahitaji vifaa vya ofisi au shule kwa jumla, uchapishaji mkubwa wa nyaraka, msaada wa mifumo ya serikali ya mtandao, au mifumo ya mauzo ya biashara, tupo tayari kukusaidia.
          </p>
        </div>

        {/* Contact Form & Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Mawasiliano ya Duka Letu
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Mahali Lilipo Duka</span>
                    <span className="text-slate-600 leading-relaxed block mt-0.5">
                      Manzese, Dar es Salaam, Tanzania (Karibia na Kituo cha Mwendokasi cha Bakhresa)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Muda wa Kazi</span>
                    <span className="text-slate-600 block mt-0.5">
                      Jumatatu - Jumamosi: Saa 2:00 Asubuhi – Saa 1:30 Jioni
                    </span>
                    <span className="text-slate-500 block">
                      Jumapili na Sikukuu: Saa 4:00 Asubuhi – Saa 10:00 Jioni
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Simu na Huduma ya WhatsApp</span>
                    <span className="text-slate-600 block mt-0.5 font-mono font-bold">
                      {TK_PHONE_DISPLAY}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Barua Pepe (Email)</span>
                    <span className="text-slate-600 block mt-0.5">
                      info@tkstationery.co.tz
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp CTA Button */}
              <div className="pt-2">
                <Button
                  variant="whatsapp"
                  size="md"
                  fullWidth
                  onClick={() => window.open(createWhatsAppUrl('Habari TK Stationery! Ninahitaji huduma / maelezo zaidi.'), '_blank')}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Ongea Nasi WhatsApp Papo Hapo
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {isSent ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Ujumbe Umepokelewa!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Asante sana ndugu <strong>{name}</strong>. Timu yetu ya idara ya <strong>{department}</strong> itawasiliana nawe kupitia namba <strong>{phone}</strong> haraka iwezekanavyo.
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsSent(false)}>
                  Tuma Ujumbe Mwingine
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                  Tuma Ujumbe au Ombi la Bei
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Jina Kamili"
                    placeholder="Mfano: Flora Minja"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />

                  <Input
                    label="Namba ya Simu (WhatsApp)"
                    placeholder="Mfano: 0712 345 678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Barua Pepe (Si lazima)"
                    type="email"
                    placeholder="Mfano: flora@kampuni.co.tz"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />

                  <Select
                    label="Idara / Huduma Unayohitaji"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    options={[
                      { value: 'Vifaa vya Ofisi na Shule', label: 'Vifaa vya Shule & Ofisi (Rejareja na Jumla)' },
                      { value: 'Huduma za Serikali Mtandaoni', label: 'Msaada wa Mifumo (NIDA, TRA, Polisi, RITA)' },
                      { value: 'Uchapaji na Binding', label: 'Uchapaji (Printing), Photocopy & Binding' },
                      { value: 'Ubunifu wa Graphics', label: 'Ubunifu wa Vipeperushi, Logo & Kadi' },
                      { value: 'Matengenezo ya Kompyuta', label: 'Matengenezo ya Kompyuta na Printer' },
                      { value: 'Mifumo ya Mauzo (POS)', label: 'Mifumo ya Mauzo na Tovuti' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Ujumbe Wako au Maelezo ya Mahitaji
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tueleze kwa ufupi jinsi tunavyoweza kukusaidia..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Send className="w-4 h-4" />}
                >
                  Tuma Ujumbe Huu
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
