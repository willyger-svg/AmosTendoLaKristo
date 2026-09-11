import { paymentService } from '../payments/paymentService';
import { PaymentVerifyResult } from '../payments/paymentProvider';

/**
 * Webhook architecture handler for Tanzania Payment Gateways.
 * Handles incoming webhooks at /api/payments/webhook/:provider
 */
export interface WebhookIncomingPayload {
  provider: 'mpesa' | 'tigopesa' | 'airtelmoney' | 'selcom' | 'dpo' | 'bank' | string;
  headers: Record<string, string | undefined>;
  rawBody: any;
}

export interface WebhookProcessingResult {
  statusCode: number;
  body: {
    success: boolean;
    message: string;
    orderId?: string;
    paymentId?: string;
    isDuplicate?: boolean;
  };
}

// Track processed webhook provider transaction IDs to prevent replay attacks
const processedWebhooksCache = new Set<string>();

export async function handlePaymentWebhook(payload: WebhookIncomingPayload): Promise<WebhookProcessingResult> {
  const { provider, headers, rawBody } = payload;
  const signature = headers['x-signature'] || headers['authorization'] || headers['x-webhook-signature'];

  // 1. Check provider signature & payload
  const verifyResult: PaymentVerifyResult = await paymentService.provider.verifyWebhookCallback(
    rawBody,
    signature
  );

  const providerTxnId = verifyResult.providerTransactionId || rawBody?.trans_id || rawBody?.provider_transaction_id;
  const paymentId = verifyResult.paymentId || rawBody?.paymentId || rawBody?.reference;
  const orderId = verifyResult.orderId || rawBody?.orderId;

  // 2. Idempotency Check: Prevent duplicate webhook execution / replay attacks
  const dedupeKey = `${provider}_${providerTxnId || paymentId}`;
  if (providerTxnId && processedWebhooksCache.has(dedupeKey)) {
    return {
      statusCode: 200,
      body: {
        success: true,
        message: 'Webhook already processed (Idempotency ACK)',
        orderId,
        paymentId,
        isDuplicate: true
      }
    };
  }

  // 3. Process payment status update if valid
  if (!verifyResult.isValid && !paymentService.provider.isSandbox) {
    return {
      statusCode: 401,
      body: {
        success: false,
        message: 'Invalid webhook signature or untrusted payload'
      }
    };
  }

  if (paymentId) {
    const outcome = await paymentService.verifyAndProcessPayment(
      paymentId,
      verifyResult.status || 'successful',
      providerTxnId,
      `webhook_${provider}`
    );

    if (providerTxnId) {
      processedWebhooksCache.add(dedupeKey);
    }

    return {
      statusCode: 200,
      body: {
        success: outcome.success,
        message: outcome.message,
        orderId,
        paymentId
      }
    };
  }

  return {
    statusCode: 400,
    body: {
      success: false,
      message: 'Missing paymentId or reference in webhook payload'
    }
  };
}
