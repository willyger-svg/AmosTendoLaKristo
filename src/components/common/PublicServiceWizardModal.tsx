import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { DisclaimerBanner } from './DisclaimerBanner';
import { formatTSh, generateId } from '../../utils/formatters';
import { createWhatsAppUrl } from '../../utils/whatsapp';
import { ServiceTicket } from '../../types';
import { ShieldCheck, CheckCircle2, MessageSquare, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export const PublicServiceWizardModal: React.FC = () => {
  const { activeModal, closeModal, createServiceTicket, showToast } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [applicantNIN, setApplicantNIN] = useState('');
  const [preferredCenter, setPreferredCenter] = useState('TK Center Dar es Salaam');
  const [urgency, setUrgency] = useState('Normal (Same Day)');
  const [notes, setNotes] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<ServiceTicket | null>(null);

  if (!activeModal || activeModal.type !== 'public-service-wizard') return null;

  const { serviceId, title, agency } = activeModal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      showToast({
        type: 'error',
        title: 'Missing Required Information',
        message: 'Please provide your full name and phone number.'
      });
      return;
    }

    const ticketId = generateId('TK-SRV');
    const newTicket: ServiceTicket = {
      id: ticketId,
      serviceType: 'Public Services',
      serviceTitle: `${title} (${agency})`,
      customerName,
      customerPhone,
      customerEmail: customerEmail || 'N/A',
      status: 'Submitted',
      estimatedCost: 10000,
      details: {
        agency,
        applicantNIN: applicantNIN || 'To be scanned in person',
        urgency,
        preferredCenter,
        notes: notes || 'Standard portal assistance requested'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    createServiceTicket(newTicket);
    setSubmittedTicket(newTicket);

    showToast({
      type: 'success',
      title: 'Portal Ticket Created',
      message: `Assistance ticket ${ticketId} registered.`
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={closeModal}
      maxWidth="2xl"
      title={`Assisted Application: ${title}`}
    >
      {submittedTicket ? (
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Assistance Ticket Registered
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
              Ticket ID: {submittedTicket.id}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              Our digital portal desk has queued your assistance request for <strong>{submittedTicket.serviceTitle}</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Applicant Name:</span>
              <span className="font-bold text-slate-900">{submittedTicket.customerName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>WhatsApp Phone:</span>
              <span className="font-bold text-slate-900">{submittedTicket.customerPhone}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Assistance Bureau Fee:</span>
              <span className="font-bold text-amber-600">{formatTSh(submittedTicket.estimatedCost || 10000)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Status:</span>
              <span className="font-bold text-emerald-700">Awaiting Physical Document Verification</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="whatsapp"
              size="md"
              onClick={() => {
                const msg = `Hello TK Stationery! 👋\n\nI registered public service assistance ticket *${submittedTicket.id}* for *${submittedTicket.customerName}*.\nService: ${submittedTicket.serviceTitle}\n\nPlease let me know the best time to bring my original documents.`;
                window.open(createWhatsAppUrl(msg), '_blank');
              }}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Forward Ticket to WhatsApp Bureau
            </Button>

            <Button variant="secondary" size="md" onClick={closeModal}>
              Close Window
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <DisclaimerBanner compact agencyName={agency} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Applicant Full Name"
              placeholder="As written on your Birth Certificate / NIDA"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />

            <Input
              label="Phone Number (WhatsApp Active)"
              placeholder="e.g. 0754 112 233"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="National ID (NIN) if available"
              placeholder="e.g. 19940101-XXXXX-XXXXX-XX"
              value={applicantNIN}
              onChange={e => setApplicantNIN(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. applicant@gmail.com"
              value={customerEmail}
              onChange={e => setCustomerEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assistance Center Location"
              value={preferredCenter}
              onChange={e => setPreferredCenter(e.target.value)}
              options={[
                { value: 'TK Center Dar es Salaam (Main Bureau)', label: 'TK Center Dar es Salaam (Main Bureau)' },
                { value: 'Online Assistance via WhatsApp / Remote', label: 'Online Assistance via WhatsApp / Remote' }
              ]}
            />

            <Select
              label="Urgency Level"
              value={urgency}
              onChange={e => setUrgency(e.target.value)}
              options={[
                { value: 'Normal (Same Day)', label: 'Normal (Same Day)' },
                { value: 'Urgent (Within 1-2 Hours)', label: 'Urgent (Within 1-2 Hours)' }
              ]}
            />
          </div>

          <Input
            label="Additional Notes / Loss Incident Reference"
            placeholder="e.g. Lost national ID at Kariakoo market, need police loss report & re-print"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              <span>* Nominal typing fee payable upon service completion.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Submit Assistance Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
