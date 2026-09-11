export interface SendSmsOptions {
  to: string; // e.g. '0784123456' or '255784123456'
  message: string;
  senderId?: string;
}

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  status: 'sent' | 'failed' | 'unconfigured_demo';
  errorMessage?: string;
}

export interface SmsProvider {
  name: string;
  isConfigured: boolean;
  sendSms(options: SendSmsOptions): Promise<SmsSendResult>;
}

export class SmsService implements SmsProvider {
  name = 'Tanzania SMS Gateway (Beem / NextSMS / Africa’s Talking Adapter)';

  private apiKey: string;
  private secretKey: string;
  private apiUrl: string;
  private defaultSenderId: string;

  constructor() {
    const env = (typeof process !== 'undefined' && process.env) ? process.env : {};
    const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};

    this.apiKey = metaEnv.VITE_SMS_API_KEY || env.SMS_API_KEY || '';
    this.secretKey = metaEnv.VITE_SMS_SECRET_KEY || env.SMS_SECRET_KEY || '';
    this.apiUrl = metaEnv.VITE_SMS_PROVIDER_URL || env.SMS_PROVIDER_URL || '';
    this.defaultSenderId = metaEnv.VITE_SMS_SENDER_ID || env.SMS_SENDER_ID || 'TKSTATION';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && (this.secretKey || this.apiUrl));
  }

  async sendSms(options: SendSmsOptions): Promise<SmsSendResult> {
    if (!this.isConfigured) {
      // Clearly reported as unconfigured demo mode
      console.info(
        `[SMS DEMO/AUDIT] SMS PROVIDER NOT CONFIGURED. Message queued for ${options.to}: "${options.message.substring(0, 50)}..."`
      );
      return {
        success: true,
        provider: 'demo_logger',
        status: 'unconfigured_demo',
        messageId: `SMS-DEMO-${Date.now()}`,
        errorMessage: 'SMS PROVIDER NOT CONFIGURED: Set SMS_API_KEY and SMS_PROVIDER_URL in environment for live SMS delivery.'
      };
    }

    try {
      // Normalize Tanzanian MSISDN (255XXXXXXXXX)
      let phone = options.to.replace(/[^0-9]/g, '');
      if (phone.startsWith('0')) {
        phone = '255' + phone.substring(1);
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.apiKey}:${this.secretKey}`)}`
        },
        body: JSON.stringify({
          source_addr: options.senderId || this.defaultSenderId,
          schedule_time: '',
          encoding: 0,
          message: options.message,
          recipients: [{ recipient_id: 1, dest_addr: phone }]
        })
      });

      const data = await response.json();
      return {
        success: response.ok,
        messageId: data.request_id || `SMS-${Date.now()}`,
        provider: 'tanzania_sms_gateway',
        status: response.ok ? 'sent' : 'failed',
        errorMessage: response.ok ? undefined : data.message || 'SMS delivery failed'
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'tanzania_sms_gateway',
        status: 'failed',
        errorMessage: err.message || 'SMS Gateway network error'
      };
    }
  }
}

export const smsService = new SmsService();
