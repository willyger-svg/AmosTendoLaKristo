import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatTSh, generateId } from '../../utils/formatters';
import { UploadCloud, CheckCircle2, FileText, Printer, ArrowRight, MessageSquare } from 'lucide-react';
import { ServiceTicket } from '../../types';
import { createWhatsAppUrl } from '../../utils/whatsapp';

export const PrintRequestModal: React.FC = () => {
  const { activeModal, closeModal, createServiceTicket, showToast } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [serviceType, setServiceType] = useState('Document Printing (B&W / Color)');
  const [copies, setCopies] = useState(1);
  const [binding, setBinding] = useState('None');
  const [notes, setNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>('Project_Proposal_Draft_2026.pdf');
  const [submittedTicket, setSubmittedTicket] = useState<ServiceTicket | null>(null);

  if (!activeModal || activeModal.type !== 'print-wizard') return null;

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      showToast({
        type: 'error',
        title: 'Required Fields Missing',
        message: 'Please provide your name and phone number.'
      });
      return;
    }

    const ticketId = generateId('TK-PRT');
    const newTicket: ServiceTicket = {
      id: ticketId,
      serviceType: 'Printing',
      serviceTitle: `${serviceType} (${copies} copies)`,
      customerName,
      customerPhone,
      customerEmail,
      status: 'Submitted',
      estimatedCost: 15000,
      details: {
        binding,
        copies,
        notes: notes || 'Standard print specs',
        pickupTime: 'Today by 5:00 PM'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileName: uploadedFileName || 'Customer_Document.pdf'
    };

    createServiceTicket(newTicket);
    setSubmittedTicket(newTicket);

    showToast({
      type: 'success',
      title: 'Print Request Submitted',
      message: `Your print ticket ${ticketId} has been created.`
    });
  };

  return (
    <Modal isOpen={true} onClose={closeModal} maxWidth="2xl" title="Submit Document Print Job">
      {submittedTicket ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Print Job Registered
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">
              Ticket ID: {submittedTicket.id}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Our print technicians have received your job configuration. We will inspect the page formatting and start printing immediately.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left max-w-md mx-auto text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Customer:</span>
              <span className="font-bold text-slate-900">{submittedTicket.customerName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phone:</span>
              <span className="font-bold text-slate-900">{submittedTicket.customerPhone}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Document File:</span>
              <span className="font-bold text-slate-900">{submittedTicket.fileName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Status:</span>
              <span className="font-bold text-amber-600">Processing in Queue</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="whatsapp"
              size="md"
              onClick={() => {
                const msg = `Hello TK Stationery! 👋\n\nI have submitted print ticket *${submittedTicket.id}* for customer *${submittedTicket.customerName}*.\nDocument: ${submittedTicket.fileName}\n\nPlease confirm queue status.`;
                window.open(createWhatsAppUrl(msg), '_blank');
              }}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Confirm on WhatsApp
            </Button>

            <Button variant="secondary" size="md" onClick={closeModal}>
              Done / Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Simulated File Upload Zone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              1. Upload Your Document (PDF, Word, or Image)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-5 text-center bg-slate-50 hover:bg-amber-50/20 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.jpg,.png"
                onChange={handleSimulatedFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center">
                <UploadCloud className="w-8 h-8 text-amber-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">
                  {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Drag and drop file here or click to browse'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  PDF, DOCX, JPG or PNG (Up to 50MB) — Simulated preview
                </span>
              </div>
            </div>
          </div>

          {/* Job Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Service Type"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              options={[
                { value: 'Black & White Laser Printing', label: 'Black & White Laser Printing' },
                { value: 'Full-Color Digital Printing', label: 'Full-Color Digital Printing' },
                { value: 'Photocopy & Collation', label: 'Photocopy & Collation' },
                { value: 'High-Res Scanning to USB/Email', label: 'High-Res Scanning to USB/Email' },
                { value: 'Passport-Size Photos Set', label: 'Passport-Size Photos Set' },
                { value: 'Thesis Hardcover Binding', label: 'Thesis Hardcover Binding' }
              ]}
            />

            <Select
              label="Finishing & Binding"
              value={binding}
              onChange={e => setBinding(e.target.value)}
              options={[
                { value: 'None', label: 'No Binding (Loose Sheets)' },
                { value: 'Staple', label: 'Corner / Edge Staple' },
                { value: 'Spiral Ring Binding', label: 'Spiral Ring Binding' },
                { value: 'Thermal Tape Binding', label: 'Thermal Tape Binding' },
                { value: 'Lamination', label: 'Lamination (150-micron)' },
                { value: 'Hardcover Gold Lettering', label: 'Hardcover Gold Lettering' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Number of Copies"
              type="number"
              min="1"
              max="500"
              value={copies}
              onChange={e => setCopies(parseInt(e.target.value) || 1)}
              required
            />

            <Input
              label="Special Instructions / Pages"
              placeholder="e.g. Print double-sided, cover in color"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Contact Details */}
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
              2. Your Contact Details (For Pickup / Delivery Notification)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Juma Ramadhani"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                required
              />

              <Input
                label="Phone Number (WhatsApp)"
                placeholder="e.g. 0712 345 678"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500">
              * Payment is made upon store collection or courier dispatch.
            </span>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Printer className="w-4 h-4" />}
            >
              Submit Print Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
