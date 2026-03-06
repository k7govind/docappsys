import * as paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

export interface PayPalOrderResult {
  success: boolean;
  orderID?: string;
  approvalURL?: string;
  error?: string;
}

export interface PayPalCaptureResult {
  success: boolean;
  captureID?: string;
  status?: string;
  amount?: number;
  error?: string;
}

export interface PayPalRefundResult {
  success: boolean;
  refundID?: string;
  status?: string;
  amount?: number;
  error?: string;
}

export class PayPalPaymentService {
  private client: paypal.core.PayPalHttpClient;
  private environment: paypal.core.Environment;

  constructor() {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials are required');
    }

    this.environment = process.env.NODE_ENV === 'production'
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  async createOrder(
    amount: number,
    currency: string = 'USD',
    appointmentId: string,
    patientEmail: string
  ): Promise<PayPalOrderResult> {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          custom_id: appointmentId,
          description: `Consultation fee for appointment ${appointmentId}`,
          invoice_id: `INV-${appointmentId}-${Date.now()}`,
        }],
        application_context: {
          brand_name: 'DocApp System',
          locale: 'en-US',
          landing_page: 'BILLING',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
        },
      });

      const response = await this.client.execute(request);
      const order = response.result;

      const approvalURL = order.links?.find(link => link.rel === 'approve')?.href;

      return {
        success: true,
        orderID: order.id,
        approvalURL: approvalURL,
      };
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      return {
        success: false,
        error: `Failed to create PayPal order: ${error}`,
      };
    }
  }

  async capturePayment(orderID: string): Promise<PayPalCaptureResult> {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderID);
      const response = await this.client.execute(request);
      const capture = response.result;

      if (capture.status === 'COMPLETED') {
        const captureData = capture.purchase_units[0]?.payments?.captures[0];
        return {
          success: true,
          captureID: captureData?.id,
          status: capture.status,
          amount: parseFloat(captureData?.amount?.value || '0'),
        };
      }

      return {
        success: false,
        status: capture.status,
        error: 'Payment capture failed',
      };
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      return {
        success: false,
        error: `Failed to capture payment: ${error}`,
      };
    }
  }

  async getOrderDetails(orderID: string): Promise<PayPalOrderResult> {
    try {
      const request = new paypal.orders.OrdersGetRequest(orderID);
      const response = await this.client.execute(request);
      const order = response.result;

      return {
        success: true,
        orderID: order.id,
      };
    } catch (error) {
      console.error('Error getting PayPal order details:', error);
      return {
        success: false,
        error: `Failed to get order details: ${error}`,
      };
    }
  }

  async refundPayment(captureID: string, amount?: number): Promise<PayPalRefundResult> {
    try {
      const request = new paypal.payments.CapturesRefundRequest(captureID);
      
      if (amount) {
        request.requestBody({
          amount: {
            value: amount.toFixed(2),
            currency_code: 'USD',
          },
        });
      }

      const response = await this.client.execute(request);
      const refund = response.result;

      return {
        success: true,
        refundID: refund.id,
        status: refund.status,
        amount: parseFloat(refund.amount?.value || '0'),
      };
    } catch (error) {
      console.error('Error refunding PayPal payment:', error);
      return {
        success: false,
        error: `Failed to refund payment: ${error}`,
      };
    }
  }

  async authorizePayment(orderID: string): Promise<PayPalCaptureResult> {
    try {
      const request = new paypal.orders.OrdersAuthorizeRequest(orderID);
      const response = await this.client.execute(request);
      const order = response.result;

      if (order.status === 'APPROVED') {
        const authorize = order.purchase_units[0]?.payments?.authorizations[0];
        return {
          success: true,
          captureID: authorize?.id,
          status: order.status,
        };
      }

      return {
        success: false,
        status: order.status,
        error: 'Payment authorization failed',
      };
    } catch (error) {
      console.error('Error authorizing PayPal payment:', error);
      return {
        success: false,
        error: `Failed to authorize payment: ${error}`,
      };
    }
  }

  verifyWebhookSignature(
    headers: any,
    body: string,
    webhookId: string
  ): boolean {
    try {
      const verifyRequestBody = {
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      };

      const request = new paypal.notifications.WebhooksVerifyRequest();
      request.requestBody(verifyRequestBody);

      const response = this.client.execute(request);
      return response.result.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('Error verifying PayPal webhook:', error);
      return false;
    }
  }

  isSandbox(): boolean {
    return this.environment instanceof paypal.core.SandboxEnvironment;
  }
}

export default new PayPalPaymentService();