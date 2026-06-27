import express from "express";
import Stripe from "stripe";
import { authMiddleware } from "../middleware/auth.ts";
import { query } from "../db/pool.ts";
const { Router } = express;
type Request = express.Request;
type Response = express.Response;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

const router = Router();

const STRIPE_PRICES: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

const PRICING_TIERS: Record<string, { name: string; monthlyPrice: number; scansPerMonth: number }> = {
  free: { name: "Free", monthlyPrice: 0, scansPerMonth: 3 },
  starter: { name: "Starter", monthlyPrice: 9, scansPerMonth: 30 },
  professional: { name: "Professional", monthlyPrice: 29, scansPerMonth: 150 },
  enterprise: { name: "Enterprise", monthlyPrice: 299, scansPerMonth: Infinity },
};

router.get("/plans", (_req: Request, res: Response) => {
  res.json(PRICING_TIERS);
});

router.post("/checkout", authMiddleware, async (req: Request, res: Response) => {
  const { planTier, orgId } = req.body;

  if (!orgId || !req.userId) {
    return res.status(400).json({ error: "orgId required" });
  }

  const priceId = STRIPE_PRICES[planTier as string];
  if (!priceId) {
    return res.status(400).json({ error: `Invalid plan tier: ${planTier}. Valid tiers: ${Object.keys(STRIPE_PRICES).join(", ")}` });
  }

  try {
    // Verify user belongs to the requested org
    const { rows: membership } = await query(
      `SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );
    if (!membership || membership.length === 0) {
      return res.status(403).json({ error: "Access denied to this organization" });
    }

    const orgRes = await query("SELECT stripe_customer_id FROM orgs WHERE id = $1", [orgId]);
    let customerId = orgRes.rows[0]?.stripe_customer_id;

    if (!customerId) {
        const customer = await stripe.customers.create({
            metadata: { orgId }
        });
        customerId = customer.id;

        try {
          await query("UPDATE orgs SET stripe_customer_id = $1 WHERE id = $2", [customerId, orgId]);
        } catch (dbError) {
          try {
            await stripe.customers.del(customerId);
          } catch (cleanupError) {
            console.error(`[billing] [orgId:${orgId}] Failed to cleanup Stripe customer ${customerId} after DB error:`, cleanupError);
          }
          throw dbError;
        }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: "subscription",
      subscription_data: {
        metadata: { orgId, planTier },
      },
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(`[billing] [userId:${req.userId}] Checkout error:`, error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.get("/portal", authMiddleware, async (req: Request, res: Response) => {
  const { orgId } = req.query;

  if (!orgId || !req.userId) {
    return res.status(400).json({ error: "orgId required" });
  }

  try {
    // Verify user belongs to the requested org
    const { rows: membership } = await query(
      `SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2`,
      [orgId, req.userId]
    );
    if (!membership || membership.length === 0) {
      return res.status(403).json({ error: "Access denied to this organization" });
    }

    const orgRes = await query("SELECT stripe_customer_id FROM orgs WHERE id = $1", [orgId]);
    const customerId = orgRes.rows[0]?.stripe_customer_id;

    if (!customerId) return res.status(404).json({ error: "No customer found" });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(`[billing] [userId:${req.userId}] Portal error:`, error);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

router.post("/webhook", async (req: Request, res: Response) => {
  const sigHeader = req.headers["stripe-signature"];
  if (!sigHeader) {
    return res.status(400).send("Webhook Error: No stripe-signature header");
  }
  const sig = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object as any;
        await query("UPDATE invoices SET status = 'paid' WHERE stripe_invoice_id = $1", [invoice.id]);
        const subId = invoice.subscription;
        if (subId && invoice.customer) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const planTier = sub.metadata?.planTier || sub.items?.data?.[0]?.price?.metadata?.planTier;
          if (planTier) {
            const customerId = invoice.customer as string;
            await query(
              `UPDATE orgs SET plan_tier = $1, updated_at = NOW() WHERE stripe_customer_id = $2`,
              [planTier, customerId]
            );
          }
          await query(
            `UPDATE subscriptions SET status = $1, plan_tier = $2, current_period_start = $3, current_period_end = $4, updated_at = NOW() WHERE stripe_subscription_id = $5`,
            [sub.status, planTier || sub.items?.data?.[0]?.price?.nickname || "starter",
             new Date((sub as any).current_period_start * 1000).toISOString(),
             new Date((sub as any).current_period_end * 1000).toISOString(),
             sub.id]
          );
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const planTier = sub.metadata?.planTier || sub.items?.data?.[0]?.price?.metadata?.planTier;
        const customerId = sub.customer as string;
        await query(
          `UPDATE subscriptions SET status = $1, plan_tier = $2, current_period_start = $3, current_period_end = $4, updated_at = NOW() WHERE stripe_subscription_id = $5`,
          [sub.status, planTier || sub.items?.data?.[0]?.price?.nickname || "starter",
           new Date((sub as any).current_period_start * 1000).toISOString(),
           new Date((sub as any).current_period_end * 1000).toISOString(),
           sub.id]
        );
        if (planTier && sub.status === "active") {
          await query(
            `UPDATE orgs SET plan_tier = $1, updated_at = NOW() WHERE stripe_customer_id = $2`,
            [planTier, customerId]
          );
        }
        break;
      }
    }
  } catch (dbError) {
    console.error(`[billing] Webhook DB error for event ${event.type}:`, dbError);
    return res.status(500).json({ error: "Failed to process webhook" });
  }

  res.json({ received: true });
});

export default router;