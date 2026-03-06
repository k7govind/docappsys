import { Request, Response } from 'express';
import stripeService from '../services/stripe-payment.service.js';
import paypalService from '../services/paypal-payment.service.js';
import Appointment from '../models/appointment.model.js';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const payload = req.body;

  if (!sig) {
    return res.status(400).json({ error: 'Stripe signature is required' });
  }

  try {
    const event = stripeService.constructWebhookEvent(payload, sig);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleStripePaymentSucceeded(event.data.object as any);
        break;
      
      case 'payment_intent.payment_failed':
        await handleStripePaymentFailed(event.data.object as any);
        break;
      
      case 'payment_intent.canceled':
        await handleStripePaymentCanceled(event.data.object as any);
        break;
      
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook handler failed' });
  }
};

export const handlePayPalWebhook = async (req: Request, res: Response) => {
  const headers = req.headers;
  const body = JSON.stringify(req.body);

  try {
    const isValid = paypalService.verifyWebhookSignature(
      headers,
      body,
      process.env.PAYPAL_WEBHOOK_ID!
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid PayPal webhook signature' });
    }

    const event = req.body;

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePayPalPaymentCaptured(event);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePayPalPaymentDenied(event);
        break;
      
      case 'PAYMENT.CAPTURE.REVERSED':
        await handlePayPalPaymentReversed(event);
        break;
      
      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(400).json({ error: 'Webhook handler failed' });
  }
};

async function handleStripePaymentSucceeded(paymentIntent: any) {
  try {
    console.log(`Stripe payment succeeded: ${paymentIntent.id}`);
    
    const appointmentId = paymentIntent.metadata?.appointmentId;
    if (!appointmentId) {
      console.error('No appointment ID in payment intent metadata');
      return;
    }

    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'paid',
      paymentMethod: 'stripe',
      transactionId: paymentIntent.id,
      paymentDate: new Date(),
      paymentMetadata: paymentIntent
    });

    console.log(`Appointment ${appointmentId} marked as paid via Stripe`);
  } catch (error) {
    console.error('Error handling Stripe payment success:', error);
  }
}

async function handleStripePaymentFailed(paymentIntent: any) {
  try {
    console.log(`Stripe payment failed: ${paymentIntent.id}`);
    
    const appointmentId = paymentIntent.metadata?.appointmentId;
    if (!appointmentId) {
      console.error('No appointment ID in payment intent metadata');
      return;
    }

    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'failed',
      paymentMetadata: { last_error: paymentIntent.last_payment_error, paymentIntent }
    });

    console.log(`Appointment ${appointmentId} marked as payment failed via Stripe`);
  } catch (error) {
    console.error('Error handling Stripe payment failure:', error);
  }
}

async function handleStripePaymentCanceled(paymentIntent: any) {
  try {
    console.log(`Stripe payment canceled: ${paymentIntent.id}`);
    
    const appointmentId = paymentIntent.metadata?.appointmentId;
    if (!appointmentId) {
      console.error('No appointment ID in payment intent metadata');
      return;
    }

    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'cancelled',
      paymentMetadata: { paymentIntent }
    });

    console.log(`Appointment ${appointmentId} marked as payment canceled via Stripe`);
  } catch (error) {
    console.error('Error handling Stripe payment cancellation:', error);
  }
}

async function handlePayPalPaymentCaptured(event: any) {
  try {
    const capture = event.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    
    console.log(`PayPal payment captured: ${capture.id}`);

    if (!orderId) {
      console.error('No order ID in PayPal capture event');
      return;
    }

    const appointment = await Appointment.findOne({ paypalOrderId: orderId });
    if (!appointment) {
      console.error(`No appointment found for PayPal order: ${orderId}`);
      return;
    }

    await Appointment.findByIdAndUpdate(appointment._id, {
      paymentStatus: 'paid',
      paymentMethod: 'paypal',
      paypalCaptureId: capture.id,
      transactionId: capture.id,
      paymentDate: new Date(),
      paymentMetadata: capture
    });

    console.log(`Appointment ${appointment._id} marked as paid via PayPal`);
  } catch (error) {
    console.error('Error handling PayPal payment capture:', error);
  }
}

async function handlePayPalPaymentDenied(event: any) {
  try {
    const capture = event.resource;
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    
    console.log(`PayPal payment denied: ${capture.id}`);

    if (!orderId) {
      console.error('No order ID in PayPal deny event');
      return;
    }

    const appointment = await Appointment.findOne({ paypalOrderId: orderId });
    if (!appointment) {
      console.error(`No appointment found for PayPal order: ${orderId}`);
      return;
    }

    await Appointment.findByIdAndUpdate(appointment._id, {
      paymentStatus: 'failed',
      paymentMetadata: { capture, error: 'PayPal payment denied' }
    });

    console.log(`Appointment ${appointment._id} marked as payment failed via PayPal`);
  } catch (error) {
    console.error('Error handling PayPal payment denial:', error);
  }
}

async function handlePayPalPaymentReversed(event: any) {
  try {
    const refund = event.resource;
    const captureId = refund.link_payment_id;
    
    console.log(`PayPal payment reversed: ${refund.id}`);

    if (!captureId) {
      console.error('No capture ID in PayPal reversal event');
      return;
    }

    const appointment = await Appointment.findOne({ paypalCaptureId: captureId });
    if (!appointment) {
      console.error(`No appointment found for PayPal capture: ${captureId}`);
      return;
    }

    await Appointment.findByIdAndUpdate(appointment._id, {
      paymentStatus: 'refunded',
      refundAmount: refund.amount.value,
      refundDate: new Date(),
      refundReason: 'PayPal payment reversal',
      paymentMetadata: { refund }
    });

    console.log(`Appointment ${appointment._id} marked as refunded via PayPal`);
  } catch (error) {
    console.error('Error handling PayPal payment reversal:', error);
  }
}