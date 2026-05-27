---
phase: 02-code-review-command
reviewed: 2026-05-27T12:00:00Z
depth: deep
files_reviewed: 18
files_reviewed_list:
  - server.ts
  - src/server/auth/github.ts
  - src/server/auth/jwt.ts
  - src/server/db/pool.ts
  - src/server/db/schema.sql
  - src/server/middleware/auth.ts
  - src/server/middleware/tenant.ts
  - src/server/routes/auth.ts
  - src/server/routes/billing.ts
  - src/server/routes/orgs.ts
  - src/server/routes/scans.ts
  - src/server/routes/cweCatalog.ts
  - src/server/services/gradingService.ts
  - src/server/services/apiKeyService.ts
  - src/server/services/notificationsService.ts
  - src/server/services/compliance/complianceService.ts
  - src/server/services/compliance/cweCatalog.ts
  - src/server/services/compliance/scans/fileTreeScan.ts
  - src/server/services/compliance/scans/manifestScan.ts
  - src/server/services/compliance/scans/readmeScan.ts
  - src/server/services/compliance/scans/metadataScan.ts
  - src/types.ts
findings:
  critical: 10
  high: 12
  medium: 12
  low: 14
  info: 10
  total: 58
status: issues_found
---

# Phase 02: Comprehensive Code Audit Report

**Reviewed:** 2026-05-27T12:00:00Z
**Depth:** deep (18 source files + 4 scan sub-modules + types)
**Files Reviewed:** 18 (6 routes, 3 middleware, 2 auth, 2 db, 4 services, 1 entrypoint + 4 scan modules + types)
**Status:** issues_found — 10 Critical, 12 High, 12 Medium, 14 Low, 10 Info

## Summary

This is a full-stack Node.js/TypeScript SaaS codebase with GitHub OAuth, JWT auth, Stripe billing, PostgreSQL persistence, and an AI-powered GitHub repository grading engine. The codebase shows careful attention to several security patterns (parameterized queries, CSRF origins, API key hashing) but contains **critical defects** in authentication, billing authorization, Stripe webhook handling, database schema-column mismatch, and server startup ordering. Below is every issue identified, ordered by severity.

---

## Critical Issues

### CR-01: JWT `verifyToken` Accepts `alg: "none"` — Authentication Bypass

**File:** `src/server/auth/jwt.ts:19-20`
**Issue:** `jwt.verify(token, JWT_SECRET)` relies on the default algorithm resolution behavior. The `jsonwebtoken` library, when called without the `algorithms` option, accepts the algorithm declared in the JWT header. An attacker can forge a token with `{"alg": "none"}` and any payload — the library will accept it without verifying a signature, bypassing authentication entirely.

**Fix:**
```typescript
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as JwtPayload;
};
```

---

### CR-02: PostgreSQL `ON CONFLICT` References Non-Existent Unique Constraint — Rate Limiter Always Fails

**File:** `src/server/middleware/tenant.ts:134-141`
**File:** `src/server/db/schema.sql:77-78`
**Issue:** The `rate_limits` table has `org_id UUID ... PRIMARY KEY` (single-column PK). The upsert statement uses `ON CONFLICT (org_id, period_start)` which references two columns, but there is no unique constraint on `(org_id, period_start)`. PostgreSQL throws `ERROR: there is no unique or exclusion constraint matching the ON CONFLICT specification` on every API call. The rate limiter can never succeed.

**Fix (schema):**
```sql
CREATE TABLE rate_limits (
  org_id UUID REFERENCES orgs(id),
  period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scan_count INTEGER DEFAULT 0,
  api_call_count INTEGER DEFAULT 0,
  PRIMARY KEY (org_id, period_start)
);
```

**Fix (tenant.ts upsert: either keep ON CONFLICT (org_id, period_start) which now works, or rewrite to use the new PK)**

---

### CR-03: Stripe Webhook Body Already Consumed by Global `express.json()` — Signature Verification Always Fails

**File:** `src/server/routes/billing.ts:102`
**File:** `server.ts:24`
**Issue:** At server startup, `app.use(express.json({ limit: "10kb" }))` is registered globally (server.ts:24). By the time the Stripe webhook route's `express.raw({ type: "application/json" })` middleware runs, the request body has already been parsed and consumed. `req.body` is a JavaScript object, not a Buffer. `stripe.webhooks.constructEvent()` will fail because it expects a raw Buffer to verify the signature. All Stripe webhook processing will fail silently.

**Fix:** Remove `express.raw()` from the route handler. Instead, register a route-specific raw body parser before the route, or use a library like `stripe-middleware` that saves the raw body. Common pattern:
```typescript
// Before registering the global express.json()
app.use("/api/v1/billing/webhook", express.raw({ type: "application/json" }));

// Then register global json parser AFTER
app.use(express.json({ limit: "10kb" }));
```

---

### CR-04: Stripe Webhook Blocked by CSRF Middleware

**File:** `server.ts:41`
**File:** `src/server/middleware/auth.ts:54-56`
**Issue:** The billing router is mounted with `csrfMiddleware` at `server.ts:41`. The webhook endpoint at `POST /api/v1/billing/webhook` receives POST requests from Stripe — which have no `Origin` or `Referer` header. The CSRF middleware checks `const requestOrigin = origin || referer` and returns 403 if both are missing. Stripe will never successfully deliver webhooks.

**Fix:** Exclude the webhook route from CSRF checks:
```typescript
// In billing.ts before the webhook route
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  // no CSRF check needed — Stripe signs the payload
});
```
AND register the webhook route before the CSRF middleware at the router level, OR mount it on a separate path that bypasses CSRF.

---

### CR-05: `dotenv.config()` Called After Module-Scope Env Checks — App Fails to Start With `.env`

**File:** `server.ts:17`
**File:** `src/server/auth/jwt.ts:3-5`, `src/server/services/gradingService.ts:5-7`, `src/server/routes/billing.ts:14-17`
**Issue:** `dotenv.config()` at server.ts:17 executes AFTER all static ES module imports (lines 1-15) have been resolved and their module-scope code has run. This means:
- `jwt.ts` checks `process.env.JWT_SECRET` → `undefined` → throws
- `gradingService.ts` checks `process.env.GEMINI_API_KEY` → `undefined` → throws
- `billing.ts` checks `process.env.STRIPE_SECRET_KEY` → `undefined` → throws

If any of these env vars are stored in `.env` (not injected by the hosting platform), the app crashes on startup.

**Fix:** Call `dotenv.config()` before importing env-dependent modules. Either:
```typescript
// Option A: Load dotenv in a separate preload script
// Option B: Use dynamic imports after dotenv.config()
import dotenv from "dotenv";
dotenv.config();
// Then dynamically import the rest
const { initDb } = await import("./src/server/db/pool.ts");
```
Or, better: configure the runtime with `--import dotenv/config` or pass env vars directly.

---

### CR-06: Authorization Bypass in Billing Checkout & Portal

**File:** `src/server/routes/billing.ts:35-81` (`/checkout`)
**File:** `src/server/routes/billing.ts:83-99` (`/portal`)
**Issue:** Both endpoints accept `orgId` from the request body (`/checkout`, line 36) or query string (`/portal`, line 84) without verifying that the authenticated user belongs to that organization. Any authenticated user can create a Stripe checkout session for **any** org ID, or access any org's billing portal. No `orgAccessMiddleware` is applied.

**Fix:**
```typescript
router.post("/checkout", authMiddleware, async (req: Request, res: Response) => {
  const { planTier, orgId } = req.body;
  
  // Verify user belongs to org
  const { rows: membership } = await query(
    `SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2`,
    [orgId, req.userId]
  );
  if (!membership || membership.length === 0) {
    return res.status(403).json({ error: "Access denied" });
  }
  // ... rest of handler
});
```

---

### CR-07: `updated_at` Column Missing From `scans` and `orgs` Tables — All Queries Referencing It Fail

**File:** `src/server/db/schema.sql:42-53` (no `updated_at` in scans table)
**File:** `schema.sql:13-20` (no `updated_at` in orgs table)
**File:** `src/server/routes/scans.ts:112, 155, 225, 346, 360, 392` — all reference `updated_at`
**File:** `src/server/routes/orgs.ts:102` — references `updated_at` on orgs

**Issue:** The `scans` table and `orgs` table have no `updated_at` column in the schema, but **every** SELECT and UPDATE query across routes and background tasks references `updated_at`. PostgreSQL will throw `column "updated_at" does not exist` on every scan listing, detail, update, and on every org detail fetch. This is a total blocker for all scan and org operations.

**Fix:**
```sql
ALTER TABLE scans ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE orgs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
```

---

### CR-08: Server-Side Request Forgery (SSRF) in Notification Service

**File:** `src/server/services/notificationsService.ts:61-74` (slack webhook)
**File:** `src/server/services/notificationsService.ts:201-220` (custom webhook)
**Issue:** Both `sendSlack` and `sendWebhook` fetch user-supplied URLs (`config.webhookUrl`, `config.url`) from the database with no validation. A user who can configure notifications can make the server issue POST requests to internal services (e.g., `http://169.254.169.254/latest/meta-data/`, `http://localhost:5432`, internal Kubernetes services). No timeout, no IP validation, no URL allowlist.

**Fix:** Add URL validation (block private IPs, require HTTPS, add timeout):
```typescript
const url = new URL(webhookUrl);
if (url.protocol !== "https:") throw new Error("Webhook URL must use HTTPS");
const hostname = url.hostname;
if (hostname === "localhost" || hostname === "127.0.0.1" || isPrivateIP(hostname)) {
  throw new Error("Webhook URL must be a public endpoint");
}
// Add AbortController timeout
```

---

### CR-09: Unauthenticated `/api/grade` Endpoint — Economic Denial of Service

**File:** `server.ts:56-141`
**Issue:** The `POST /api/grade` endpoint has no authentication middleware. Anyone can call it with any public GitHub URL to trigger a full Gemini AI evaluation, which costs money per API call. An attacker can flood this endpoint to rack up significant Gemini API costs with no authentication or rate limiting.

**Fix:** Add `authMiddleware` to this route, or at minimum add IP-based rate limiting and a CAPTCHA:
```typescript
app.post("/api/grade", authMiddleware, async (req, res) => { ... });
```

---

### CR-10: CSRF Origin Check Allows Subdomain Bypass

**File:** `src/server/middleware/auth.ts:58`
**Issue:** `requestOrigin.startsWith(allowed)` matches `http://localhost:5173` against `http://localhost:5173.evil.com` because `startsWith` doesn't check character boundaries. An attacker hosting at `http://localhost:5173.attacker.com` can bypass CSRF protection for any state-changing request. This applies to all POST/PUT/DELETE routes mounted with `csrfMiddleware` (scans, billing, orgs).

**Fix:** Use exact match or URL parsing:
```typescript
const isAllowed = allowedOrigins.some((allowed) => {
  const parsed = new URL(requestOrigin);
  return parsed.origin === allowed;
});
```

---

## High Issues

### HI-01: Unbounded In-Memory Cache — Long-Term Memory Leak

**File:** `src/server/routes/scans.ts:15-16`
**Issue:** `gitHubCache` is an unbounded `Map<string, { data, timestamp }>`. Entries are only removed when `getFromCache` encounters an expired entry. Any entry that is `setInCache` but never `getFromCache` again remains in memory permanently. Over time (thousands of unique repos), this becomes a memory leak. No maximum size, no periodic cleanup.

**Fix:** Use a bounded cache (e.g., `lru-cache` npm package) or add periodic cleanup:
```typescript
// Periodic cleanup every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of gitHubCache) {
    if (now - value.timestamp > CACHE_TTL_MS) gitHubCache.delete(key);
  }
}, 10 * 60 * 1000).unref();
```

---

### HI-02: AbortController Timeout Not Cleared on Cache Hit

**File:** `src/server/routes/scans.ts:242-255`
**Issue:** The `AbortController` timeout (`setTimeout(() => controller.abort(), 60000)`) is created at line 243 but `clearTimeout(timeout)` only runs inside the `if (!metaFetchedFromCache)` block at line 255. If the repo metadata is found in cache, the timeout is never cleared — it fires 60 seconds later and aborts a controller that may still be reachable. While no active fetch uses this signal after the cached path, the leaked timeout wastes resources.

**Fix:** Move `clearTimeout` outside the if-block:
```typescript
if (!metaFetchedFromCache) {
  const metaRes = await fetch(..., { signal: controller.signal });
  repoMeta = metaRes.ok ? await metaRes.json() : null;
  setInCache(metaCacheKey, repoMeta);
}
clearTimeout(timeout); // Always clear
```

---

### HI-03: Subsequent GitHub Fetches Have No Timeout

**File:** `src/server/routes/scans.ts:280-284, 302-306, 324-326`
**Issue:** After the repo metadata fetch (which has a 60s AbortController timeout), the package.json, README, and tree fetches have no timeout at all. If any of these requests hang (e.g., network issue), the entire `gradeRepoAsync` background task hangs indefinitely, consuming resources and never marking the scan as failed.

**Fix:** Add timeouts to all fetches:
```typescript
const pkgController = new AbortController();
const pkgTimeout = setTimeout(() => pkgController.abort(), 30000);
try {
  const pkgRes = await fetch(url, { headers: ghHeaders, signal: pkgController.signal });
  // ...
} finally {
  clearTimeout(pkgTimeout);
}
```

---

### HI-04: Scan Count Timezone Mismatch — Wrong Reset Date

**File:** `src/server/middleware/tenant.ts:64-68` (DB uses `date_trunc('month', NOW())`)
**File:** `src/server/middleware/tenant.ts:84` (JS uses local time for reset date)
**Issue:** The scan count query uses PostgreSQL's `date_trunc('month', NOW())` which operates in the database's timezone. The reset date returned in the response uses `new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)` which uses JavaScript's **local** timezone. If the server and database are in different timezones (common in cloud deployments), the reset date will be incorrect — potentially off by hours.

**Fix:** Either make both use UTC, or fetch the DB timezone and use it:
```typescript
const { rows: tzRows } = await query(`SELECT current_setting('TIMEZONE') as tz`);
// Or return the timestamp from DB in the response
```

---

### HI-05: API Rate Limit Timezone Mismatch

**File:** `src/server/middleware/tenant.ts:131`
**Issue:** `hourStart` is constructed using JavaScript's local `Date` constructor, but the database's `NOW()` and period comparisons use the database timezone. The rate limit window boundary may shift between JS and PG.

**Fix:** Either use `date_trunc('hour', NOW())` in the query itself and let the DB handle time, or always work in UTC on both sides.

---

### HI-06: No Timeout on Outbound Webhook Fetches

**File:** `src/server/services/notificationsService.ts:70-74` (Slack)
**File:** `src/server/services/notificationsService.ts:208-213` (Custom webhook)
**Issue:** Both `sendSlack` and `sendWebhook` call `await fetch(webhookUrl, ...)` with no `AbortController` or timeout. If a webhook URL hangs (malicious or misconfigured), the notification thread hangs indefinitely. Since `sendNotification` is called as part of event handling, this blocks the entire notification pipeline.

**Fix:**
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);
try {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
    signal: controller.signal,
  });
} finally {
  clearTimeout(timeout);
}
```

---

### HI-07: Repo URL Regex Rejects Dots in Repo Name

**File:** `src/server/routes/scans.ts:58`
**Issue:** `github\.com\/([^\/]+)\/([^\/\.]+)` — the second capture group `[^\/\.]+` excludes dots. A repository name containing a dot (e.g., `my-lib.js`, `react-native.core`) would be truncated at the dot. The regex tries to match inside `my-lib.js` and only captures `my-lib` — the actual repo name is `my-lib.js`.

**Fix:**
```typescript
const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/|$)/);
```

---

### HI-08: `/api/grade` URL Sanitization Fails on `.git` With Trailing Slash

**File:** `server.ts:62-65`
**Issue:** Three sequential `.replace()` calls handle different edge cases. If the input URL is `https://github.com/owner/repo.git/`:
1. After removing `github.com/`: `owner/repo.git/`
2. After removing trailing `.git$`: no match (ends with `/`)
3. After removing trailing `/` → `owner/repo.git`
4. Split → `["owner", "repo.git"]` — the "repo.git" will fail in the GitHub API call.

**Fix:**
```typescript
.replace(/\.git\/?$/i, "") // Remove .git followed by optional trailing slash
```

---

### HI-09: Unused Exports — Dead Code (8 Instances)

**File:** `src/server/auth/github.ts:79` — `githubCallback` exported but never imported
**File:** `src/server/auth/github.ts:85` — `setupGitHubStrategy` exported but never imported externally
**File:** `src/server/middleware/tenant.ts:99` — `apiRateLimitMiddleware` exported but never used on any route
**File:** `src/server/middleware/tenant.ts:163` — `limitHeadersMiddleware` exported but never used on any route
**File:** `src/server/services/apiKeyService.ts:41` — `verifyKey` method defined but never called
**File:** `src/server/services/notificationsService.ts` — entire class is defined but never imported or used anywhere
**Issue:** All of these exports inflate the codebase and create maintenance burden. Some (like `notificationsService`) represent unconnected Phase 2 code that may give a false impression of features being active.

**Fix:** Remove dead code or add integration paths. Either wire `notificationsService` into the scan completion path, or strip it.

---

### HI-10: `user_id` Not Inserted When Creating API Key

**File:** `src/server/routes/auth.ts:129-133`
**Issue:** The INSERT query for creating an API key includes `org_id, key_hash, prefix, name, created_at` but omits `user_id`. The `api_keys` table schema allows NULL for `user_id` (line 34 of schema.sql), so the insert succeeds, but the key is not attributed to any specific user. The `req.userId` is available at this point.

**Fix:**
```typescript
const { rows } = await query(
  `INSERT INTO api_keys (org_id, user_id, key_hash, prefix, name, created_at)
   VALUES ($1, $2, $3, $4, $5, NOW())
   RETURNING id, prefix, name, created_at`,
  [req.orgId, req.userId, keyHash, prefix, name]
);
```

---

### HI-11: Scanning Route Has No API Rate Limiting

**File:** `src/server/routes/scans.ts:42-45`
**Issue:** The POST `/` (submit scan) route applies `authMiddleware, scanLimitMiddleware` but does **not** apply `apiRateLimitMiddleware`. Even with the broken rate limiter (CR-02), the infrastructure for per-hour API call counting exists but is not used on the scan submission endpoint. Users on free/starter tiers could submit scans faster than intended.

**Fix:** Add `apiRateLimitMiddleware` to the route:
```typescript
router.post("/", authMiddleware, scanLimitMiddleware, apiRateLimitMiddleware, async (req, res) => { ... });
```

---

### HI-12: Webhook Success Reported Despite DB Query Failure

**File:** `src/server/routes/billing.ts:112-123`
**Issue:** The `switch` block inside the webhook handler runs DB queries (e.g., `UPDATE invoices ...`, `UPDATE subscriptions ...`) with no try-catch. If a DB query fails, the error is swallowed, and `res.json({ received: true })` is still sent (line 123). Stripe interprets a 200 response as "webhook processed successfully" and will not retry. Events like invoice payments or subscription status changes can be permanently lost.

**Fix:**
```typescript
switch (event.type) {
  case "invoice.paid":
    try {
      await query("UPDATE invoices SET status = 'paid' WHERE stripe_invoice_id = $1", [invoice.id]);
    } catch (dbError) {
      console.error("Failed to update invoice:", dbError);
      return res.status(500).json({ error: "Failed to process invoice" });
    }
    break;
  // ... other cases
}
res.json({ received: true });
```

---

## Medium Issues

### MD-01: JWT Verify Doesn't Validate Payload Shape

**File:** `src/server/auth/jwt.ts:19-20`
**Issue:** `verifyToken` casts the decoded JWT to `JwtPayload` without runtime validation. A token with `{ sub: "foo" }` would pass verification (after fixing CR-01) and cast to `{ userId: undefined }`, causing downstream `undefined` access on `req.userId`.

**Fix:** Use Zod to validate the decoded token:
```typescript
const jwtPayloadSchema = z.object({ userId: z.string(), orgId: z.string().optional() });
export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  return jwtPayloadSchema.parse(decoded);
};
```

---

### MD-02: `parseCookies` Can Throw on Malformed Cookie Values

**File:** `src/server/middleware/auth.ts:76-78`
**Issue:** `decodeURIComponent(val)` throws `URIError: URI malformed` if the cookie value contains an invalid percent-encoding sequence (e.g., `token=%GG`). This would crash the entire auth middleware, returning a 500 error instead of a 401.

**Fix:** Wrap in try-catch:
```typescript
try {
  cookies[name] = decodeURIComponent(val);
} catch {
  cookies[name] = val; // Fallback to raw value
}
```

---

### MD-03: `res.json` Monkey-Patching Is Fragile

**File:** `src/server/middleware/tenant.ts:163-182`
**Issue:** `limitHeadersMiddleware` replaces `res.json` with a wrapped version. If this middleware runs multiple times (e.g., on different routes or via middleware stacking), `res.json` gets wrapped repeatedly, creating a call stack that grows with each additional wrap. The original `originalJson` reference is captured once at line 168, but repeated wrapping means the "original" is always one-deep, not the true original.

**Fix:** Use `res.on('finish', ...)` or a response hook instead:
```typescript
export const limitHeadersMiddleware = (req, res, next) => {
  res.on('finish', () => {
    if ((req as any).scanLimit) {
      // Set headers after response is generated
    }
  });
  next();
};
```

---

### MD-04: Cookie Max-Age (24h) Mismatches JWT Expiry (7d)

**File:** `src/server/routes/auth.ts:47`
**File:** `src/server/auth/jwt.ts:16`
**Issue:** The auth cookie is set with `maxAge: 24 * 60 * 60 * 1000` (24 hours), but the JWT token embedded in the cookie is signed with `{ expiresIn: "7d" }`. After 24 hours, the cookie expires and the browser removes it — the user must re-authenticate even though their token is valid for 6 more days. This reduces the effective session lifetime to 24h.

**Fix:** Align both values:
```typescript
maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days to match JWT
```

---

### MD-05: Duplicate `PLAN_LIMITS` Definitions Will Diverge

**File:** `src/server/middleware/tenant.ts:13-34`
**File:** `src/server/routes/orgs.ts:145-150`
**Issue:** Plan limit constants are defined in two places with different shapes and values. The `tenant.ts` version includes `apiCallsPerHour` and `teamMembers`; the `orgs.ts` version only has `scansPerMonth`. If one is updated without the other, behavior diverges between rate limiting and the usage API response.

**Fix:** Extract to a shared config file:
```typescript
// src/server/config/planLimits.ts
export const PLAN_LIMITS = { ... };
```

---

### MD-06: Fragile PostgreSQL Error Message Parsing

**File:** `src/server/routes/orgs.ts:83-86`
**Issue:** Catching slug conflicts by checking `error.message?.includes("unique constraint")` depends on the PostgreSQL client's English error message. If the DB client version changes, or the server runs with a different locale, the string won't match. PostgreSQL error codes are stable and locale-independent.

**Fix:** Check the error code instead:
```typescript
if ((error as any)?.code === "23505") { // unique_violation
  return res.status(409).json({ error: "Organization slug already exists" });
}
```

---

### MD-07: Large RepoData Sent to Gemini Without Size Check

**File:** `src/server/services/gradingService.ts:152-154`
**Issue:** `repoData` is stringified and sent to the Gemini model. For large repos, `fileList`, `readmeStr`, and `packageJsonStr` can be many kilobytes. Combined with the lengthy grading prompt (lines 156-208), the total input may exceed Gemini's context window (typically 128K-2M tokens depending on model). The API would return an error that's caught only at the caller level.

**Fix:** Truncate input fields before building the prompt:
```typescript
const TRUNCATED_DATA = {
  ...repoData,
  readmeStr: repoData.readmeStr?.slice(0, 10000),
  packageJsonStr: repoData.packageJsonStr?.slice(0, 5000),
  fileList: repoData.fileList?.slice(0, 50),
};
```

---

### MD-08: UUID Parameters Not Validated — Could Leak Internal Errors

**File:** `src/server/routes/auth.ts:190` (`DELETE /api-keys/:id`)
**File:** `src/server/routes/orgs.ts:97, 123, 173, 198, 209` (`/orgs/:id/*`)
**File:** `src/server/routes/scans.ts:146, 188, 413` (`/scans/:id/*`)
**Issue:** Route parameters expected to be UUIDs (PostgreSQL `UUID` type) are passed directly to queries without validation. If a non-UUID value is provided (e.g., `DELETE /api-keys/foo`), PostgreSQL throws `invalid input syntax for type uuid`, which is caught by generic catch blocks and returns a 500 "Internal server error". The 500 is technically correct but unhelpful for debugging, and the malformed input could indicate probing.

**Fix:** Validate UUID format:
```typescript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(req.params.id)) {
  return res.status(400).json({ error: "Invalid ID format" });
}
```

---

### MD-09: `emailList` Can Crash on Non-Array Config Values

**File:** `src/server/services/notificationsService.ts:93, 113`
**Issue:** `const emailList = config.emails || []` — if `config.emails` is stored as a string (e.g., `"alice@example.com"` instead of `["alice@example.com"]`) in the JSONB `notifications_config.config` column, `emailList` becomes the string. Then `emailList.join(", ")` (line 113) throws `TypeError: emailList.join is not a function`, even though the Resend email was sent successfully.

**Fix:** Normalize to array:
```typescript
const rawEmails = config.emails || [];
const emailList = Array.isArray(rawEmails) ? rawEmails : [rawEmails];
```

---

### MD-10: Schema Not Idempotent — Re-Init Fails

**File:** `src/server/db/pool.ts:15`
**Issue:** `pgPool.query(schema)` runs all `CREATE TABLE` statements without `IF NOT EXISTS`. If `initDb()` is called more than once (it shouldn't be, but `pool.ts:5-6` has a guard), or if the schema is run against an existing database, all `CREATE TABLE` statements error out. PostgreSQL stops execution at the first error, so nothing after the first failed CREATE TABLE runs.

**Fix:** Add `IF NOT EXISTS` to all CREATE TABLE statements in schema.sql.

---

### MD-11: No Graceful Shutdown — Connections Aborted on Restart

**File:** `server.ts` (no shutdown handler)
**File:** `src/server/db/pool.ts:8-16` (no drain mechanism)
**Issue:** There is no `process.on('SIGTERM')` or `process.on('SIGINT')` handler. The PostgreSQL connection pool is never drained. On container restarts (Kubernetes, Docker), active connections are terminated abruptly, potentially causing `remaining connection slots are reserved` errors on rapid restart cycles.

**Fix:**
```typescript
async function shutdown() {
  console.log("Shutting down gracefully...");
  if (pgPool) await pgPool.end();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

---

### MD-12: API Key Name Accepts Whitespace-Only Values

**File:** `src/server/routes/auth.ts:119-122`
**Issue:** `if (!name)` rejects empty string and null/undefined, but `name = "   "` (whitespace only) passes validation and creates an API key with a visually empty name.

**Fix:**
```typescript
if (!name || !name.trim()) {
  return res.status(400).json({ error: "API key name required" });
}
```

---

## Low Issues

### LW-01: Empty Org Slug Possible When Username Sanitizes to Nothing

**File:** `src/server/auth/github.ts:47-50`
**Issue:** If `profile.username` is empty, null, or contains only characters removed by `[^a-z0-9-]`, the slug becomes an empty string which violates the `NOT NULL` constraint on `orgs.slug`.

**Fix:**
```typescript
const orgSlug = (profile.username ?? `user-${profile.id}`)
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '-')
  .replace(/-+/g, '-') // collapse multiple hyphens
  .replace(/^-|-$/g, '') // trim leading/trailing hyphens
  .substring(0, 63) || `user-${profile.id}`; // fallback if empty
```

---

### LW-02: `readyz` Endpoint Doesn't Check Database

**File:** `server.ts:31-37`
**Issue:** The readiness probe simply returns 200 immediately. It doesn't check if the database pool is connected. Kubernetes could route traffic to the pod before the database is ready, causing every request to fail with "Database not initialized."

**Fix:**
```typescript
app.get("/readyz", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.status(200).json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not ready" });
  }
});
```

---

### LW-03: `scan_count` Column Defined in Schema But Never Used

**File:** `src/server/db/schema.sql:79`
**Issue:** The `rate_limits` table has a `scan_count` column, but the codebase only uses `api_call_count`. Scan limits are calculated from `SELECT COUNT(*) FROM scans WHERE org_id = $1 AND created_at >= date_trunc('month', NOW())` (tenant.ts:64-68). The `scan_count` column is dead weight.

**Fix:** Either remove the column or use it to track scan counts.

---

### LW-04: Import Extension Inconsistency

**File:** `src/server/routes/billing.ts:12` imports from `"../db/pool"` (no `.ts`)
**File:** Most other files import as `"../db/pool.ts"` (with `.ts`)
**Issue:** This inconsistency could cause import resolution failures depending on the runtime configuration (Node ESM vs TypeScript compiler).

**Fix:** Standardize all imports with `.ts` extension.

---

### LW-05: `exp` Claim Not Suppressed in JWT Payload Type

**File:** `src/server/auth/jwt.ts:8-13`
**Issue:** The `JwtPayload` interface includes `iat` and `exp` which are automatically added by `jsonwebtoken`. While not a bug, the interface conflates claims that the application controls (`userId`, `orgId`) with claims controlled by the library (`iat`, `exp`). The `generateToken` function accepts these as optional fields in the input but they'll be overwritten by the library anyway.

**Fix:** Use `Omit<JwtPayload, 'iat' | 'exp'>` for the input type.

---

### LW-06: Cookie Token Can't Be Cleared After Expiry

**File:** `src/server/routes/auth.ts:57-59`
**Issue:** The logout endpoint applies `authMiddleware`, which requires a valid token in the cookie. If the cookie has already expired (24h), the browser may still send it (expired cookies can be sent by browsers), or may not. More importantly, if the JWT expires (7d) but the cookie is still present, `verifyToken` throws, the auth middleware returns 401 before reaching the logout handler, and the cookie is never cleared. The user can't log out without manually clearing cookies.

**Fix:** Add a separate route that clears the cookie without requiring auth:
```typescript
router.post("/logout", (_req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});
```

---

### LW-07: No Validation on `/orgs` Create Slug Length

**File:** `src/server/routes/orgs.ts:57-59`
**Issue:** Slug validation ensures `^[a-z0-9-]+$` but allows arbitrarily long slugs. The schema column type `TEXT` has no length restriction. Very long slugs (1000+ chars) could index poorly or cause UX issues. Compare with `github.ts:50` which has `.substring(0, 63)`.

**Fix:**
```typescript
if (!/^[a-z0-9-]{1,63}$/.test(slug)) {
  return res.status(400).json({ error: "Slug must be 1-63 characters" });
}
```

---

### LW-08: `verifyKey` Method Never Used

**File:** `src/server/services/apiKeyService.ts:41-50`
**Issue:** `ApiKeyService.verifyKey(key, hash)` implements timing-safe comparison but is never called anywhere. The auth middleware (`auth.ts:121-124`) hashes the key and looks it up by hash — it doesn't verify a key against a specific hash. The method is dead code.

**Fix:** Either remove it or refactor the auth middleware to use it:
```typescript
// Instead of SELECT by hash, SELECT the hash and verify in-app
const { rows } = await query(`SELECT key_hash FROM api_keys WHERE ...`);
if (rows.length > 0 && ApiKeyService.verifyKey(apiKey, rows[0].key_hash)) { ... }
```

---

### LW-09: `expand` Type Not Used on ComplianceResponse

**File:** Several compliance scan modules
**Issue:** The `CweFinding` type uses `confidence: number` (0-1) but there are hard-coded values like `0.7, 0.6, 0.3` with no statistical basis. These appear to be arbitrary estimates, not actual confidence scores. This could mislead downstream consumers who interpret them as meaningful metrics.

---

### LW-10: `userRows` Variable Name Shadowing

**File:** `src/server/auth/github.ts:24, 35`
**Issue:** First `userRows` for SELECT, then `newUserRows` for INSERT. Similar shadowing at `orgRows` (line 52). Not a bug, but inconsistent naming adds cognitive load.

---

### LW-11: GitHub Token Leaked Into Error Messages Stored in DB

**File:** `src/server/routes/scans.ts:398-399`
**Issue:** `error.message` is stored verbatim in the scan report JSON stored in the database. If a GitHub API call returns a 403 with the token in the error message (unlikely but possible), the token could be persisted in the database. For production systems, always sanitize error messages before persistence.

---

### LW-12: Magic Number `80` in File List Truncation

**File:** `src/server/routes/scans.ts:330`
**Issue:** `fileList = ...map(f => f.path).slice(0, 80)` — the number 80 should be a named constant.

**Fix:**
```typescript
const MAX_FILE_LIST_LENGTH = 80;
```

---

### LW-13: `stripe-signature` Cast Without Null Check

**File:** `src/server/routes/billing.ts:103`
**Issue:** `const sig = req.headers["stripe-signature"] as string;` — if the header is missing, `sig` is `undefined` cast as `string`. It becomes the string `"undefined"` when used. The `constructEvent` call would then fail with an invalid signature error, returning 400. This is technically a 400 response, but the error message (`err.message`) is leaked to the client on line 109.

**Fix:**
```typescript
const sig = req.headers["stripe-signature"];
if (!sig) {
  return res.status(400).send("Webhook Error: No stripe-signature header");
}
```

---

### LW-14: No Rate Limiting on Auth Routes

**File:** `src/server/routes/auth.ts`
**Issue:** There is no rate limiting on any auth route (`POST /auth/logout`, `POST /auth/api-keys`, `GET /auth/me`). While not immediately exploitable, the API key creation endpoint is a potential abuse vector (an attacker could create thousands of API keys for an org if they compromise a token).

---

## Info Items

### IN-01: `accessToken` and `refreshToken` Parameters Unused in GitHub Strategy

**File:** `src/server/auth/github.ts:21`
**Issue:** The passport GitHub strategy callback receives `accessToken` and `refreshToken` but neither is used. The `accessToken` could be stored for making authenticated GitHub API calls on behalf of the user.

### IN-02: Zod Schema and Prompt Are Duplicated Structures

**File:** `src/server/services/gradingService.ts:14-122` (Zod schema)
**File:** `src/server/services/gradingService.ts:160-208` (Prompt JSON description)
**Issue:** The Zod schema (160 lines) and the prompt schema (50 lines) describe the same HealthReport structure. If fields are added or modified, both must be updated. Consider deriving the prompt schema from the Zod schema at runtime.

### IN-03: CIS Benchmark File Not Found

**File:** `src/server/services/compliance/cisBenchmark.ts` (listed but missing)
**Issue:** The file `cisBenchmark.ts` was requested for review but does not exist on disk. Either it was planned but not implemented, or was removed. All references to it in other files should be checked.

### IN-04: Module-Level Side Effects on Import

**File:** `src/server/auth/github.ts:9-11` — throws on missing env vars
**File:** `src/server/auth/jwt.ts:4-6` — throws on missing env vars
**File:** `src/server/services/gradingService.ts:6-8` — throws on missing env vars
**File:** `src/server/routes/billing.ts:15-17` — throws on missing env vars
**Issue:** These modules throw during import if env vars are missing. While the intent (fail-fast) is valid, this pattern prevents graceful error handling and makes startup failures harder to diagnose. Combine with the dotenv ordering issue (CR-05), and the startup is fragile.

### IN-05: CWE Catalog Has 159 CWEs, Not 138 as Documented

**File:** `src/server/services/compliance/cweCatalog.ts:29-259`
**Issue:** The code comment on line 5 says "138 ISO/IEC 5055 weaknesses" and line 28 says "The 138 ISO/IEC 5055 weaknesses". However, the actual count is 159 entries (34 Reliability + 61 Security + 31 Performance + 33 Maintainability = 159). The discrepancy suggests either the catalog or the comment is wrong.

### IN-06: Security CWE Range (CWE-20 through CWE-161) Includes Non-ISO-5055 CWEs

**File:** `src/server/services/compliance/cweCatalog.ts:66-189`
**Issue:** The Security dimension has 61 entries covering CWE-20 through CWE-161. Many of these (like Struts-related CWEs 102-110) are framework-specific and unlikely to be detected by file-tree scanning. This inflates the Security count but may not reflect actual coverage.

### IN-07: `metadataScan.ts` Detects "JavaScript is not TypeScript" as CWE-252

**File:** `src/server/services/compliance/scans/metadataScan.ts:133-139`
**Issue:** Assigning CWE-252 ("Unchecked Return Value") for a repo being JavaScript instead of TypeScript is a category mismatch. CWE-252 is about unchecked function return values, not language choice. This will confuse users reading the compliance report.

### IN-08: `fileTreeScan.ts` Detects `.env` Files as CWE-140 "Critical"

**File:** `src/server/services/compliance/scans/fileTreeScan.ts:26`
**Issue:** An `.env` file in a repository is flagged as "Hardcoded Credentials" (CWE-140) with Critical severity. While `.env` files can contain secrets, many projects commit `.env.example` files or `.env` with non-sensitive configuration. This generates many false positives.

### IN-09: `package-lock.json` Used as Proxy for Dependency Health

**File:** `src/server/services/compliance/scans/manifestScan.ts:220-230`
**File:** `src/server/services/compliance/scans/fileTreeScan.ts:180-184`
**Issue:** Both manifestScan and fileTreeScan check for lock files and flag missing lock files as HIGH severity. A lock file's presence is not always relevant (e.g., library packages often omit them). This may generate user confusion.

### IN-10: No Tests Exist

**Issue:** The codebase has no test files visible in the reviewed files. There are no unit, integration, or E2E tests for any of these modules. The absence of tests was not explicitly requested as a finding category, but it underlies many of the bugs found (the CR-02 `ON CONFLICT` bug, CR-07 missing columns, CR-03 webhook body issue would all have been caught by integration tests).

---

## Summary of Critical Path Items

| Priority | File | Line | Issue |
|----------|------|------|-------|
| 🔴 Fix immediately | `jwt.ts` | 20 | JWT accepts `alg: "none"` — auth bypass |
| 🔴 Fix immediately | `tenant.ts:137` / `schema.sql:77` | — | `ON CONFLICT` column mismatch — rate limiter broken |
| 🔴 Fix immediately | `billing.ts:102` + `server.ts:24` | — | Webhook body consumed before `express.raw()` — payments broken |
| 🔴 Fix immediately | `server.ts:41` + `auth.ts:54` | — | CSRF blocks Stripe webhooks — payments broken |
| 🔴 Fix immediately | `server.ts:17` | — | `dotenv` runs after imports — app may not start |
| 🔴 Fix immediately | `billing.ts:36,84` | — | Authorization bypass on billing |
| 🔴 Fix immediately | `schema.sql` | 42-53 | `updated_at` column missing — all scan/org queries fail |
| 🔴 Fix immediately | `server.ts:56` | — | Unauthenticated `/api/grade` — DoS/cost vector |
| 🔴 Fix immediately | `auth.ts:58` | — | CSRF `startsWith` allows subdomain bypass |
| 🔴 Fix immediately | `notificationsService.ts:70,209` | — | SSRF via notification webhooks |
| 🟡 Fix this sprint | `scans.ts:15-16` | — | Unbounded cache memory leak |
| 🟡 Fix this sprint | `scans.ts:280-336` | — | No timeouts on subsequent fetches |
| 🟡 Fix this sprint | `scans.ts:58` | — | URL regex truncates dot-containing repo names |
| 🟡 Fix this sprint | `billing.ts:112-123` | — | Webhook errors silently swallowed |

---

_Reviewed: 2026-05-27T12:00:00Z_
_Reviewer: OpenCode (gsd-code-reviewer)_
_Depth: deep (cross-file analysis with call chain tracing)_
