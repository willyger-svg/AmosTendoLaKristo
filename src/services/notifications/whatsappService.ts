import { Order, ServiceTicket, QuoteRequest } from '../../types';
import { formatTSh } from '../../utils/formatters';

const DEFAULT_TK_PHONE = '255762888200'; // 0762 888 200 formatted for international WhatsApp

export interface WhatsAppNotificationPayload {
  to?: string; // e.g. '255712345678'
  templateName:
    | 'order_placed'
    | 'payment_received'
    | 'payment_pending'
    | 'payment_failed'
    | 'order_processing'
    | 'order_ready'
    | 'order_dispatched'
    | 'order_completed'
    | 'service_created'
    | 'service_status_changed'
    | 'quote_received'
    | 'quote_status_changed';
  data: Record<string, any>;
}

export class WhatsAppService {
  private tkWhatsAppNumber: string = DEFAULT_TK_PHONE;
  private cloudApiToken: string;
  private phoneNumberId: string;

  constructor() {
    const env = (typeof process !== 'undefined' && process.env) ? process.env : {};
    const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};

    this.cloudApiToken = metaEnv.VITE_WHATSAPP_ACCESS_TOKEN || env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = metaEnv.VITE_WHATSAPP_PHONE_NUMBER_ID || env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.cloudApiToken && this.phoneNumberId);
  }

  /**
   * Builds concise, professional plain-text message for WhatsApp.
   */
  generateMessage(payload: WhatsAppNotificationPayload): string {
    const { templateName, data } = payload;

    switch (templateName) {
      case 'order_placed':
        return (
          `*TK STATIONERY — AGIZO JIPYA*\n\n` +
          `Habari ${data.customerName || 'Mteja'}! Tumepokea agizo lako.\n\n` +
          `• Namba ya Agizo: *${data.orderId}*\n` +
          `• Jumla: *${formatTSh(data.total || 0)}*\n` +
          `• Njia ya Kuchukua: *${data.deliveryMethod || 'Store Pickup'}*\n\n` +
          `Unaweza kufuatilia agizo lako moja kwa moja kwenye tovuti yetu au kupitia namba hii ya WhatsApp.`
        );

      case 'payment_received':
        return (
          `*TK STATIONERY — MALIPO YAMEPOKELEWA*\n\n` +
          `Malipo yamethibitishwa kikamilifu.\n\n` +
          `• Namba ya Agizo: *${data.orderId}*\n` +
          `• Kiasi Kilicholipwa: *${formatTSh(data.amount || 0)}*\n` +
          `• Rejea ya Malipo: *${data.paymentReference || 'N/A'}*\n` +
          `• Hali: *Inashughulikiwa (Processing)*\n\n` +
          `Tunakushukuru kwa kuchagua TK Stationery!`
        );

      case 'payment_pending':
        return (
          `*TK STATIONERY — MALIPO YANASUBIRIWA*\n\n` +
          `• Agizo: *${data.orderId}*\n` +
          `• Kiasi Kinachotakiwa: *${formatTSh(data.amount || 0)}*\n` +
          `• Njia: *${data.paymentMethod || 'Mobile Money / Cash'}*\n\n` +
          `Tafadhali kamilisha malipo au lipa wakati wa kuchukua bidhaa zako dukani Manzese (karibu na kituo cha mwendokasi cha Bakhresa).`
        );

      case 'payment_failed':
        return (
          `*TK STATIONERY — TAARIFA YA MALIPO*\n\n` +
          `Jaribio la malipo kwa agizo *${data.orderId}* halikufanikiwa.\n` +
          `Tafadhali jaribu tena kupitia M-Pesa/Tigo Pesa au wasiliana na kitengo cha huduma kwa wateja.`
        );

      case 'order_processing':
        return (
          `*TK STATIONERY — AGIZO LINATENGENEZWA*\n\n` +
          `Agizo lako *${data.orderId}* linaandaliwa na timu yetu ya dispatch.\n` +
          `Utapokea taarifa mara litakapokuwa tayari.`
        );

      case 'order_ready':
        return (
          `*TK STATIONERY — AGIZO LIKO TAYARI*\n\n` +
          `Habari! Agizo lako *${data.orderId}* liko tayari kwa ajili ya kuchukuliwa katika kituo cha TK Stationery (Manzese, Dar es Salaam — Karibu na Kituo cha Mwendokasi cha Bakhresa).\n\n` +
          `Karibu sana!`
        );

      case 'order_dispatched':
        return (
          `*TK STATIONERY — AGIZO LIKO NJIANI*\n\n` +
          `Agizo lako *${data.orderId}* limekabidhiwa kwa msafirishaji/courier kuelekea:\n` +
          `📍 *${data.deliveryAddress || 'Dar es Salaam'}*\n\n` +
          `Mhudumu wetu atakupigia simu punde kabla ya kuwasili.`
        );

      case 'order_completed':
        return (
          `*TK STATIONERY — AGIZO LIMEKAMILIKA*\n\n` +
          `Agizo lako *${data.orderId}* limekamilika na kukabidhiwa.\n` +
          `Tunakushukuru kwa kufanya biashara na TK Stationery!`
        );

      case 'service_created':
        return (
          `*TK STATIONERY — TIKETI YA HUDUMA*\n\n` +
          `Tumepokea ombi lako la huduma:\n` +
          `• Tiketi: *${data.ticketId}*\n` +
          `• Aina ya Huduma: *${data.serviceTitle}*\n` +
          `• Mteja: *${data.customerName}*\n\n` +
          `Fundi / Mtaalamu wetu anaikagua na atakujulisha maendeleo hivi punde.`
        );

      case 'service_status_changed':
        return (
          `*TK STATIONERY — MAENDELEO YA TIKETI*\n\n` +
          `Tiketi: *${data.ticketId}* (${data.serviceTitle})\n` +
          `Hali ya Sasa: *${data.status}*\n\n` +
          `Unaweza kuangalia maelezo zaidi mtandaoni.`
        );

      case 'quote_received':
        return (
          `*TK DIGITAL SOLUTIONS — OMBI LA NUKUU*\n\n` +
          `Tumepokea ombi la nukuu ya mradi *${data.projectType}* (Rejea: *${data.quoteId}*).\n` +
          `Makadirio ya Awali: *${data.estimatedRange || 'TSh 500,000 - 1,500,000'}*\n` +
          `Mtaalamu wetu wa tehama atakutumia pendekezo rasmi.`
        );

      case 'quote_status_changed':
        return (
          `*TK DIGITAL SOLUTIONS — MABADILIKO YA NUKUU*\n\n` +
          `Nukuu ya mradi *${data.quoteId}* imeboreshwa kuelekea hali ya: *${data.status}*.\n` +
          `Wasiliana nasi kwa ufafanuzi zaidi.`
        );

      default:
        return `*TK STATIONERY*\n\nTaarifa kuhusu akaunti yako: ${data.message || 'Angalia tovuti yetu kwa maelezo.'}`;
    }
  }

  /**
   * Formats a direct WhatsApp Web / App Click-to-Chat URL
   */
  createClickToChatUrl(text: string, recipientPhone?: string): string {
    const cleanPhone = (recipientPhone || this.tkWhatsAppNumber).replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Direct API send via Meta WhatsApp Business Cloud API if configured.
   * If credentials are unconfigured, safely logs audit trail without crashing.
   */
  async sendCloudApiMessage(payload: WhatsAppNotificationPayload): Promise<{ success: boolean; message: string; isDemo: boolean }> {
    const messageText = this.generateMessage(payload);

    if (!this.isConfigured) {
      // Configuration fallback - logged as demo/audit
      return {
        success: true,
        message: 'WhatsApp Cloud API not configured in environment. Click-to-Chat link generated.',
        isDemo: true
      };
    }

    try {
      const recipient = (payload.to || this.tkWhatsAppNumber).replace(/[^0-9]/g, '');
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cloudApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'text',
          text: { body: messageText }
        })
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: response.ok ? 'WhatsApp Cloud message delivered' : data?.error?.message || 'Delivery error',
        isDemo: false
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'WhatsApp API network error',
        isDemo: false
      };
    }
  }
}

export const whatsappService = new WhatsAppService();
