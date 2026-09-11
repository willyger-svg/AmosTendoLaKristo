import { PaymentMethod, PaymentStatus, PaymentTransaction } from '../../types';

export interface PaymentInitiateRequest {
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  amount: number;
  currency: 'TZS';
  method: PaymentMethod;
  customerMsisdn?: string;
  notes?: string;
}

export interface PaymentInitiateResult {
  success: boolean;
  paymentId: string;
  reference: string;
  status: PaymentStatus;
  provider: string;
  instructions?: string;
  ussdPromptMessage?: string;
  qrCodeUrl?: string;
  paybillNumber?: string;
  accountNumber?: string;
  providerTransactionId?: string;
  errorMessage?: string;
  isSandbox: boolean;
}

export interface PaymentStatusResult {
  paymentId: string;
  status: PaymentStatus;
  providerTransactionId?: string;
  verifiedAt?: string;
  amount: number;
  currency: 'TZS';
  rawResponse?: any;
}

export interface PaymentVerifyResult {
  isValid: boolean;
  paymentId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  providerTransactionId?: string;
  message?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  status: 'refunded' | 'failed' | 'pending';
  errorMessage?: string;
}

export interface PaymentProvider {
  name: string;
  isConfigured: boolean;
  isSandbox: boolean;
  initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResult>;
  checkPaymentStatus(paymentId: string, reference?: string): Promise<PaymentStatusResult>;
  verifyWebhookCallback(payload: any, signatureHeader?: string): Promise<PaymentVerifyResult>;
  refundPayment(paymentId: string, amount: number, reason: string): Promise<PaymentRefundResult>;
}
