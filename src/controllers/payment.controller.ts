import { Request, Response } from 'express';
import Appointment from '../models/appointment.model.js';
import Doctor from '../models/doctor.model.js';
import stripeService from '../services/stripe-payment.service.js';
import paypalService from '../services/paypal-payment.service.js';

export const createStripePaymentIntent = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment already paid" 
      });
    }

    const doctor = await Doctor.findOne({ doctorId: appointment.DocID });
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    const paymentIntent = await stripeService.createPaymentIntent(
      doctor.consultationFee,
      'usd',
      appointment._id.toString(),
      appointment.PatientEmail
    );

    await Appointment.findByIdAndUpdate(appointmentId, {
      stripePaymentIntentId: paymentIntent.paymentIntentId,
      paymentAmount: doctor.consultationFee,
      paymentStatus: 'pending'
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
        amount: doctor.consultationFee,
        currency: 'usd'
      }
    });
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create payment intent" 
    });
  }
};

export const createPayPalOrder = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment already paid" 
      });
    }

    const doctor = await Doctor.findOne({ doctorId: appointment.DocID });
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    const orderResult = await paypalService.createOrder(
      doctor.consultationFee,
      'USD',
      appointment._id.toString(),
      appointment.PatientEmail
    );

    if (!orderResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to create PayPal order",
        error: orderResult.error
      });
    }

    await Appointment.findByIdAndUpdate(appointmentId, {
      paypalOrderId: orderResult.orderID,
      paymentAmount: doctor.consultationFee,
      paymentStatus: 'pending'
    });

    res.json({
      success: true,
      data: {
        orderID: orderResult.orderID,
        approvalURL: orderResult.approvalURL,
        amount: doctor.consultationFee,
        currency: 'USD'
      }
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create PayPal order" 
    });
  }
};

export const capturePayPalPayment = async (req: Request, res: Response) => {
  try {
    const { orderID } = req.body;
    
    const appointment = await Appointment.findOne({ paypalOrderId: orderID });
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found for this PayPal order" 
      });
    }

    const captureResult = await paypalService.capturePayment(orderID);

    if (captureResult.success) {
      await Appointment.findByIdAndUpdate(appointment._id, {
        paymentStatus: 'paid',
        paymentMethod: 'paypal',
        paypalCaptureId: captureResult.captureID,
        transactionId: captureResult.captureID,
        paymentDate: new Date(),
        paymentMetadata: captureResult
      });

      res.json({
        success: true,
        message: "Payment captured successfully",
        data: {
          captureID: captureResult.captureID,
          status: captureResult.status,
          amount: captureResult.amount
        }
      });
    } else {
      await Appointment.findByIdAndUpdate(appointment._id, {
        paymentStatus: 'failed',
        paymentMetadata: { error: captureResult.error }
      });

      res.status(400).json({
        success: false,
        message: "Failed to capture payment",
        error: captureResult.error
      });
    }
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to capture PayPal payment" 
    });
  }
};

export const confirmStripePayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;
    
    const appointment = await Appointment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found for this payment intent" 
      });
    }

    const paymentResult = await stripeService.confirmPayment(paymentIntentId);

    if (paymentResult.success) {
      await Appointment.findByIdAndUpdate(appointment._id, {
        paymentStatus: 'paid',
        paymentMethod: 'stripe',
        transactionId: paymentResult.paymentIntentId,
        paymentDate: new Date(),
        paymentMetadata: paymentResult
      });

      res.json({
        success: true,
        message: "Payment confirmed successfully",
        data: {
          paymentIntentId: paymentResult.paymentIntentId,
          status: paymentResult.status
        }
      });
    } else {
      await Appointment.findByIdAndUpdate(appointment._id, {
        paymentStatus: 'failed',
        paymentMetadata: { error: paymentResult.error }
      });

      res.status(400).json({
        success: false,
        message: "Payment confirmation failed",
        error: paymentResult.error
      });
    }
  } catch (error) {
    console.error('Error confirming Stripe payment:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to confirm payment" 
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .select('paymentStatus paymentMethod paymentAmount paymentCurrency transactionId stripePaymentIntentId paypalOrderId paymentDate refundAmount refundDate refundReason');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        paymentAmount: appointment.paymentAmount,
        paymentCurrency: appointment.paymentCurrency,
        transactionId: appointment.transactionId,
        stripePaymentIntentId: appointment.stripePaymentIntentId,
        paypalOrderId: appointment.paypalOrderId,
        paymentDate: appointment.paymentDate,
        refundAmount: appointment.refundAmount,
        refundDate: appointment.refundDate,
        refundReason: appointment.refundReason
      }
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get payment status" 
    });
  }
};

export const processRefund = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { reason, amount, fullRefund } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    if (appointment.paymentStatus !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot refund unpaid appointment" 
      });
    }

    let refundResult;
    const refundAmount = fullRefund ? appointment.paymentAmount : amount;

    if (appointment.paymentMethod === 'stripe' && appointment.stripePaymentIntentId) {
      refundResult = await stripeService.createRefund(
        appointment.stripePaymentIntentId,
        refundAmount
      );
    } else if (appointment.paymentMethod === 'paypal' && appointment.paypalCaptureId) {
      refundResult = await paypalService.refundPayment(
        appointment.paypalCaptureId,
        refundAmount
      );
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment method for refund" 
      });
    }

    if (refundResult.success) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: refundAmount === appointment.paymentAmount ? 'refunded' : 'paid',
        refundAmount: refundResult.amount,
        refundDate: new Date(),
        refundReason: reason || 'Customer request',
        paymentMetadata: { ...appointment.paymentMetadata, refund: refundResult }
      });

      res.json({
        success: true,
        message: "Refund processed successfully",
        data: {
          refundId: refundResult.refundId,
          amount: refundResult.amount,
          status: refundResult.status
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Refund failed",
        error: refundResult.error
      });
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process refund" 
    });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    
    const filter: any = {};
    if (patientId) {
      filter.PatientID = patientId;
    }

    const appointments = await Appointment.find(filter)
      .select('DocID PatientEmail PatientAppointmentDate paymentStatus paymentMethod paymentAmount paymentDate refundAmount')
      .sort({ paymentDate: -1 })
      .limit(50);

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get payment history" 
    });
  }
};