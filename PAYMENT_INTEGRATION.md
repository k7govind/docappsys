# Online Payment Integration

This document explains the online payment integration for consultation fees in the doctor appointment booking system.

## Features

- **Multiple Payment Methods**: Support for both Stripe and PayPal
- **Secure Payment Processing**: PCI-compliant payment handling
- **Automatic Status Updates**: Webhook-based payment status synchronization
- **Refund Management**: Full refund and partial refund capabilities
- **Payment History**: Complete payment transaction tracking
- **Error Handling**: Comprehensive error management and logging

## Supported Payment Providers

### Stripe
- Credit/Debit Card payments
- Apple Pay & Google Pay
- International payment methods
- Strong customer authentication (SCA)

### PayPal
- PayPal account payments
- Credit/Debit Card via PayPal
- Buy Now, Pay Later options
- International payments

## API Endpoints

### Stripe Payment Flow

#### Create Payment Intent
```http
POST /api/payments/:appointmentId/stripe/create-intent
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 150.00,
    "currency": "usd"
  }
}
```

#### Confirm Payment
```http
POST /api/payments/stripe/confirm
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx"
}
```

### PayPal Payment Flow

#### Create Order
```http
POST /api/payments/:appointmentId/paypal/create-order
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderID": "PAY-XXX",
    "approvalURL": "https://www.paypal.com/checkoutnow?token=XXX",
    "amount": 150.00,
    "currency": "USD"
  }
}
```

#### Capture Payment
```http
POST /api/payments/paypal/capture
Content-Type: application/json

{
  "orderID": "PAY-XXX"
}
```

### Payment Management

#### Get Payment Status
```http
GET /api/payments/:appointmentId/status
```

#### Process Refund
```http
POST /api/payments/:appointmentId/refund
Content-Type: application/json

{
  "reason": "Patient request",
  "fullRefund": true,
  "amount": 150.00
}
```

#### Get Payment History
```http
GET /api/payments/history?patientId=PATIENT123
```

## Database Schema Updates

The appointment model now includes comprehensive payment fields:

```typescript
interface IAppointment {
  // ... existing fields
  paymentStatus?: "pending" | "paid" | "refunded" | "failed" | "cancelled";
  paymentMethod?: "stripe" | "paypal" | "cash" | "insurance";
  paymentAmount?: number;
  paymentCurrency?: string;
  transactionId?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paymentDate?: Date;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
  paymentMetadata?: Record<string, any>;
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure the following:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Stripe Setup

1. **Create Stripe Account**: Sign up at https://dashboard.stripe.com/register
2. **Get API Keys**: 
   - Test keys for development
   - Live keys for production
3. **Configure Webhooks**:
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
   - Sign the webhook with a secret

### 4. PayPal Setup

1. **Create PayPal Developer Account**: https://developer.paypal.com
2. **Create Application**:
   - Sandbox app for testing
   - Live app for production
3. **Configure Webhooks**:
   - Webhook URL: `https://yourdomain.com/api/webhooks/paypal`
   - Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REVERSED`

## Payment Flow Examples

### Stripe Integration

1. **Frontend creates payment intent**:
```javascript
const response = await fetch('/api/payments/:appointmentId/stripe/create-intent', {
  method: 'POST'
});
const { clientSecret } = await response.json();
```

2. **Frontend confirms payment**:
```javascript
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Patient Name',
    },
  }
});
```

### PayPal Integration

1. **Frontend creates order**:
```javascript
const response = await fetch('/api/payments/:appointmentId/paypal/create-order', {
  method: 'POST'
});
const { orderID, approvalURL } = await response.json();

// Redirect user to PayPal approval URL
window.location.href = approvalURL;
```

2. **Frontend captures payment** (after PayPal redirect):
```javascript
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const response = await fetch('/api/payments/paypal/capture', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderID: token })
});
```

## Webhook Configuration

### Stripe Webhooks

- **URL**: `https://yourdomain.com/api/webhooks/stripe`
- **Events**:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`

### PayPal Webhooks

- **URL**: `https://yourdomain.com/api/webhooks/paypal`
- **Events**:
  - `PAYMENT.CAPTURE.COMPLETED`
  - `PAYMENT.CAPTURE.DENIED`
  - `PAYMENT.CAPTURE.REVERSED`

## Security Considerations

1. **API Keys**: Never expose secret keys in frontend code
2. **Webhook Verification**: Always verify webhook signatures
3. **HTTPS**: Use HTTPS in production
4. **Rate Limiting**: Implement rate limiting on payment endpoints
5. **Logging**: Log all payment activities for audit trails
6. **Error Handling**: Never expose sensitive error details to clients

## Testing

### Stripe Testing
- Use Stripe test card numbers: https://stripe.com/docs/testing
- Test different scenarios: successful payments, failures, disputes

### PayPal Testing
- Use PayPal sandbox environment
- Test with sandbox accounts: buyer and seller

## Production Considerations

1. **Use Live Credentials**: Switch to production API keys
2. **Monitor Webhooks**: Ensure webhook delivery reliability
3. **Implement Idempotency**: Handle duplicate webhook events
4. **Error Monitoring**: Set up alerts for payment failures
5. **Compliance**: Ensure PCI DSS compliance
6. **Backup Payment Methods**: Consider additional payment providers

## Troubleshooting

### Common Issues

1. **Payment Intent Not Found**: Check appointment ID and payment intent ID
2. **Webhook Verification Failed**: Verify webhook secrets
3. **Refund Failed**: Check refund eligibility and time limits
4. **Currency Mismatch**: Ensure consistent currency codes
5. **Amount Mismatch**: Verify amount format (cents vs dollars)

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
DEBUG=stripe,*
```

## Compliance

- **PCI DSS**: Use Stripe/PayPal to maintain PCI compliance
- **GDPR**: Handle payment data according to privacy regulations
- **SOC 2**: Leverage payment provider compliance certifications
- **Data Retention**: Follow data retention policies for payment records