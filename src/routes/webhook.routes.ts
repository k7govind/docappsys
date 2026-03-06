import { Router, response } from "express";
import { handleStripeWebhook, handlePayPalWebhook } from "../controllers/webhook.controller.js";

const router: Router = Router();

router.post("/stripe", (req, res, next) => {
  if (req.headers['content-type']?.includes('application/json')) {
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      req.body = rawBody;
      next();
    });
  } else {
    next();
  }
}, handleStripeWebhook);

router.post("/paypal", handlePayPalWebhook);

export default router;