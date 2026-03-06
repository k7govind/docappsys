import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  status?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  status?: string;
  error?: string;
}

export class StripePaymentService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    appointmentId: string,
    patientEmail: string
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        metadata: {
          appointmentId,
          patientEmail,
          type: 'consultation_fee'
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: patientEmail,
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error}`);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: `Failed to confirm payment: ${error}`,
      };
    }
  }

  async retrievePayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Error retrieving payment:', error);
      return {
        success: false,
        error: `Failed to retrieve payment: ${error}`,
      };
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer'
  ): Promise<RefundResult> {
    try {
      const refundParams: any = {
        payment_intent: paymentIntentId,
        reason,
      };

      if (amount) {
        refundParams.amount = amount * 100; // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100, // Convert back to dollars
        status: refund.status,
      };
    } catch (error) {
      console.error('Error creating refund:', error);
      return {
        success: false,
        error: `Failed to create refund: ${error}`,
      };
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Error cancelling payment intent:', error);
      return {
        success: false,
        error: `Failed to cancel payment intent: ${error}`,
      };
    }
  }

  constructWebhookEvent(payload: string, signature: string): Stripe.Event {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }

  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Error retrieving customer payment methods:', error);
      throw new Error(`Failed to retrieve payment methods: ${error}`);
    }
  }

  isTestMode(): boolean {
    return process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || false;
  }
}

export default new StripePaymentService();