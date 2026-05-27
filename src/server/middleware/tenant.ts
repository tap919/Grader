/**
 * Tenant & Rate Limiting Middleware
 * Enforces plan limits and rate limits per organization
 */

import express from "express";
import { query } from "../db/pool.ts";
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

// Plan tier configurations
const PLAN_LIMITS = {
  free: {
    scansPerMonth: 3,
    apiCallsPerHour: 0, // API not available in free tier
    teamMembers: 1,
  },
  starter: {
    scansPerMonth: 30,
    apiCallsPerHour: 60,
    teamMembers: 3,
  },
  professional: {
    scansPerMonth: 150,
    apiCallsPerHour: 300,
    teamMembers: 10,
  },
  enterprise: {
    scansPerMonth: Infinity,
    apiCallsPerHour: Infinity,
    teamMembers: Infinity,
  },
};

const IN_MEMORY_RATE_LIMITS = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if org has reached scan limit for this month
 * Use after authMiddleware
 */
export const scanLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.orgId) {
      return res.status(401).json({ error: "Org ID required" });
    }

    // Get org plan tier
    const { rows: orgRows } = await query(
      `SELECT plan_tier FROM orgs WHERE id = $1`,
      [req.orgId]
    );

    if (!orgRows || orgRows.length === 0) {
      return res.status(404).json({ error: "Org not found" });
    }

    const planTier = orgRows[0].plan_tier || "free";
    const limit = (PLAN_LIMITS as any)[planTier]?.scansPerMonth || 3;

    // Count scans this month
    const { rows: countRows } = await query(
      `SELECT COUNT(*) as count FROM scans 
       WHERE org_id = $1 AND created_at >= date_trunc('month', NOW())`,
      [req.orgId]
    );

    const scansThisMonth = parseInt(countRows[0].count, 10) || 0;

    // Attach limit info to request for response headers
    (req as any).scanLimit = {
      used: scansThisMonth,
      total: limit,
      remaining: Math.max(0, limit - scansThisMonth),
    };

    if (scansThisMonth >= limit && limit !== Infinity) {
      return res.status(429).json({
        error: "Monthly scan limit reached",
        limit,
        used: scansThisMonth,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      });
    }

    next();
  } catch (error) {
    console.error("Scan limit check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Rate limiting: API calls per hour
 * Use for API endpoints
 */
export const apiRateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.orgId) {
      return res.status(401).json({ error: "Org ID required" });
    }

    // Check plan tier for hourly limit
    const { rows: orgRows } = await query(
      `SELECT plan_tier FROM orgs WHERE id = $1`,
      [req.orgId]
    );

    if (!orgRows || orgRows.length === 0) {
      return res.status(404).json({ error: "Org not found" });
    }

    const planTier = orgRows[0].plan_tier || "free";
    const limit = (PLAN_LIMITS as any)[planTier]?.apiCallsPerHour || 0;

    if (limit === 0) {
      return res.status(403).json({
        error: "API access not available in free tier",
        upgradeRequired: true,
      });
    }

    // In-memory rate limiting (could be upgraded to Redis)
    const key = `api_limit:${req.orgId}`;
    const now = Date.now();
    let record = IN_MEMORY_RATE_LIMITS.get(key);

    if (!record || record.resetTime < now) {
      // Reset window
      record = { count: 0, resetTime: now + 60 * 60 * 1000 };
      IN_MEMORY_RATE_LIMITS.set(key, record);
    }

    if (record.count >= limit) {
      const resetDate = new Date(record.resetTime);
      return res.status(429).json({
        error: "API rate limit exceeded",
        limit,
        resetTime: resetDate,
      });
    }

    record.count++;
    next();
  } catch (error) {
    console.error("API rate limit check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Add limit headers to response
 */
export const limitHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    // Add scan limit headers
    if ((req as any).scanLimit) {
      res.setHeader("X-RateLimit-Limit", (req as any).scanLimit.total);
      res.setHeader("X-RateLimit-Used", (req as any).scanLimit.used);
      res.setHeader("X-RateLimit-Remaining", (req as any).scanLimit.remaining);
    }

    return originalJson(body);
  };

  next();
};
