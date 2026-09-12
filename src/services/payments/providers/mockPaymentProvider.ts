import {
  PaymentProvider,
  PaymentInitiateRequest,
  PaymentInitiateResult,
  PaymentStatusResult,
  PaymentVerifyResult,
  PaymentRefundResult
} from '../paymentProvider';
import { generateId, formatTSh } from '../../../utils/formatters';

export class MockPaymentProvider implements PaymentProvider {
  name = 'TK Sandbox Payment Engine (Tanzania)';
  isConfigured = true;
  isSandbox = true;

  async initiatePayment(req: PaymentInitiateRequest): Promise<PaymentInitiateResult> {
    const paymentId = generateId('TK-PAY');
    const reference = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    let instructions = '';
    let ussdPromptMessage = '';
    let paybillNumber = '';
    let accountNumber = '';

    const phoneDisplay = req.customerMsisdn || req.customerPhone || '07XXXXXXXX';

    switch (req.method) {
      case 'mpesa':
        paybillNumber = '555222';
        accountNumber = req.orderId;
        ussdPromptMessage = `M-PESA: Do you want to pay ${formatTSh(req.amount)} to TK STATIONERY (Lipa Namba: 555222, Acc: ${req.orderId})? Enter PIN on phone ${phoneDisplay}.`;
        instructions = `A simulated USSD push prompt has been triggered on ${phoneDisplay}. In this demo sandbox, you can approve the payment instantly.`;
        break;

      case 'tigopesa':
        paybillNumber = '444111';
        accountNumber = req.orderId;
        ussdPromptMessage = `Tigo Pesa: Lipa ${formatTSh(req.amount)} kwenda TK STATIONERY? Ingiza namba ya siri kwenye simu ${phoneDisplay}.`;
        instructions = `Tigo Pesa push notification simulated for ${phoneDisplay}.`;
        break;

      case 'airtelmoney':
        paybillNumber = '888333';
        accountNumber = req.orderId;
        ussdPromptMessage = `Airtel Money: Confirm payment of ${formatTSh(req.amount)} to TK STATIONERY. Enter PIN on ${phoneDisplay}.`;
        instructions = `Airtel Money prompt simulated on ${phoneDisplay}.`;
        break;

      case 'bank':
        paybillNumber = 'CRDB BANK / NMB BANK';
        accountNumber = '0150-8829-1002 (CRDB Bank)';
        instructions = `Please transfer ${formatTSh(req.amount)} to CRDB Bank Account No: 0150-8829-1002 (Account Name: TK Stationery Ltd) with reference "${req.orderId}".`;
        break;

      case 'cash_on_delivery':
        instructions = `Cash will be collected by the courier upon physical delivery at your designated Dar es Salaam address.`;
        break;

      case 'cash_at_store':
      default:
        instructions = `Pay at TK Stationery counter (Manzese — Karibu na kituo cha mwendokasi cha Bakhresa) when collecting your items.`;
        break;
    }

    const isInstantPending = req.method === 'cash_on_delivery' || req.method === 'cash_at_store' || req.method === 'bank';

    return {
      success: true,
      paymentId,
      reference,
      status: isInstantPending ? 'pending' : 'processing',
      provider: `mock_${req.method}`,
      instructions,
      ussdPromptMessage,
      paybillNumber,
      accountNumber,
      providerTransactionId: `TXN-${req.method.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      isSandbox: true
    };
  }

  async checkPaymentStatus(paymentId: string, reference?: string): Promise<PaymentStatusResult> {
    return {
      paymentId,
      status: 'successful',
      providerTransactionId: `TXN-VERIFIED-${Math.floor(100000 + Math.random() * 900000)}`,
      verifiedAt: new Date().toISOString(),
      amount: 0,
      currency: 'TZS'
    };
  }

  async verifyWebhookCallback(payload: any, signatureHeader?: string): Promise<PaymentVerifyResult> {
    // In sandbox, validate payload structure
    const paymentId = payload?.paymentId || payload?.reference;
    const orderId = payload?.orderId;
    const amount = Number(payload?.amount || 0);

    if (!paymentId || !orderId) {
      return {
        isValid: false,
        paymentId: paymentId || '',
        orderId: orderId || '',
        amount,
        status: 'failed',
        message: 'Invalid payload structure in simulated callback'
      };
    }

    return {
      isValid: true,
      paymentId,
      orderId,
      amount,
      status: payload.status === 'failed' ? 'failed' : 'successful',
      providerTransactionId: payload.providerTransactionId || `SIM-TXN-${Date.now()}`
    };
  }

  async refundPayment(paymentId: string, amount: number, reason: string): Promise<PaymentRefundResult> {
    return {
      success: true,
      refundId: `REFUND-${Math.floor(100000 + Math.random() * 900000)}`,
      amount,
      status: 'refunded'
    };
  }
}

export const mockPaymentProvider = new MockPaymentProvider();
