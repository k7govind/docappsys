import { Router } from "express";
import {
  createStripePaymentIntent,
  createPayPalOrder,
  capturePayPalPayment,
  confirmStripePayment,
  getPaymentStatus,
  processRefund,
  getPaymentHistory
} from "../controllers/payment.controller.js";

const router: Router = Router();

router.post("/:appointmentId/stripe/create-intent", createStripePaymentIntent);
router.post("/:appointmentId/paypal/create-order", createPayPalOrder);
router.post("/paypal/capture", capturePayPalPayment);
router.post("/stripe/confirm", confirmStripePayment);
router.get("/:appointmentId/status", getPaymentStatus);
router.post("/:appointmentId/refund", processRefund);
router.get("/history", getPaymentHistory);

export default router;