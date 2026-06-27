# Grader Upgrade Roadmap — Implementation Checklist

**Total Readiness Goal:** 62% → 100%  
**Timeline:** 8-10 weeks  
**Owner:** Development Team  
**Reference:** See [AUDIT-BENCHMARKING.md](AUDIT-BENCHMARKING.md) for full strategy

---

## Phase 0: Immediate Security Fixes (Week 1)

**Estimated Time:** 3 days  
**Readiness Impact:** +2% (62% → 64%)

### Critical Issues

- [ ] **CR-01: Remove hardcoded JWT secret**
  - **File:** `src/server/auth/jwt.ts:4`
  - **Task:** Require `JWT_SECRET` env var; fail at startup if missing
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **CR-02: Remove hardcoded GitHub callback URL**
  - **File:** `src/server/auth/github.ts:14`
  - **Task:** Use `GITHUB_CALLBACK_URL` env var
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **CR-03: Fix SQL translation fragility**
  - **File:** `src/server/db/pool.ts:121-126`
  - **Task:** Decide: Knex.js vs. separate query builders
  - **PR:** [Link]
  - **Decision:** [Choose One]
  - **Done:** ☐

### Code Quality Improvements (Optional, parallelizable)

- [ ] **WR-02: Refactor App.tsx "God Component"**
  - **Status:** In Progress / Not Started / Done
  - **Target:** < 300 LOC
  - **Subtasks:**
    - [ ] Extract API calls → `services/gradingService.ts`
    - [ ] Extract state → `context/GraderContext.tsx`
    - [ ] Extract remediation logic → `services/remediationEngine.ts`
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **WR-01: Persist QuickWinsList completion state**
  - **File:** `src/components/QuickWinsList.tsx:11`
  - **Task:** Add localStorage persistence
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **WR-03: Separate SQL dialect initialization**
  - **File:** `src/server/db/pool.ts`
  - **Task:** Create `migrations/` folder, separate .sql files
  - **PR:** [Link]
  - **Done:** ☐

---

## Phase 1: SaaS Core (Weeks 2-4)

**Estimated Time:** 2 weeks  
**Readiness Impact:** 62% → 75%  
**Goal:** Multi-tenant, authenticated, persisted, free tier ready

### Databases & Schema

- [ ] **Design PostgreSQL schema**
  - **Tables:** users, orgs, org_members, scans, scan_queue, api_keys, usage_log, rate_limits
  - **File:** `server/db/schema.ts`
  - **PR:** [Link]
  - **Approval:** [Get schema review from DB team]
  - **Done:** ☐

- [ ] **Create migration framework**
  - **Tool:** db-migrate or Knex migrations
  - **Files:**
    - [ ] `migrations/001_init_users.sql`
    - [ ] `migrations/002_init_orgs.sql`
    - [ ] `migrations/003_init_scans.sql`
    - [ ] `migrations/004_init_api_keys.sql`
  - **PR:** [Link]
  - **Tested:** ☐
  - **Done:** ☐

- [ ] **Setup local PostgreSQL dev environment**
  - **Task:** `docker-compose.yml` with Postgres 15
  - **Test:** `npm run db:migrate` works locally
  - **Done:** ☐

### Authentication & Authorization

- [ ] **GitHub OAuth integration**
  - **Endpoint:** `POST /api/v1/auth/github`
  - **File:** `server/routes/auth.ts`
  - **Tasks:**
    - [ ] Passport strategy setup (use GITHUB_CALLBACK_URL env var)
    - [ ] Create/update user in DB on first login
    - [ ] Issue JWT token
    - [ ] Create default org for new users
  - **PR:** [Link]
  - **Tests:** ☐ (test OAuth flow, test JWT issuance)
  - **Done:** ☐

- [ ] **API key management**
  - **Endpoints:**
    - [ ] `POST /api/v1/auth/api-keys` (generate key)
    - [ ] `GET /api/v1/auth/api-keys` (list keys)
    - [ ] `DELETE /api/v1/auth/api-keys/{id}` (revoke)
  - **File:** `server/routes/auth.ts` + `server/auth/apikey.ts`
  - **Security:** Hash keys before storing in DB, return only prefix on creation
  - **PR:** [Link]
  - **Tests:** ☐ (test key creation, verification, revocation)
  - **Done:** ☐

- [ ] **Middleware: JWT & API key validation**
  - **File:** `server/middleware/auth.ts`
  - **Feature:** Validate JWT or API key in request headers
  - **PR:** [Link]
  - **Tests:** ☐ (test valid/invalid tokens, test API key auth)
  - **Done:** ☐

### Scan Persistence & History

- [ ] **Add scan CRUD endpoints**
  - **Endpoints:**
    - [ ] `POST /api/v1/scans` (submit scan, save to DB)
    - [ ] `GET /api/v1/scans` (list scans with pagination, filtering)
    - [ ] `GET /api/v1/scans/{id}` (scan detail)
    - [ ] `DELETE /api/v1/scans/{id}` (delete scan)
  - **File:** `server/routes/scans.ts`
  - **PR:** [Link]
  - **Tests:** ☐ (test CRUD, test pagination, test filtering)
  - **Done:** ☐

- [ ] **Add org management endpoints**
  - **Endpoints:**
    - [ ] `GET /api/v1/orgs` (list user's orgs)
    - [ ] `POST /api/v1/orgs` (create org)
    - [ ] `GET /api/v1/orgs/{id}` (org detail)
    - [ ] `GET /api/v1/orgs/{id}/usage` (usage stats: scans this month, API calls, etc.)
  - **File:** `server/routes/orgs.ts`
  - **PR:** [Link]
  - **Tests:** ☐ (test org CRUD, test usage calculation)
  - **Done:** ☐

### Frontend Integration

- [ ] **Update Dashboard component**
  - **Task:** Connect to `/api/v1/scans` instead of in-memory history
  - **Features:**
    - [ ] Paginated scan list
    - [ ] Sort by date, score, grade
    - [ ] Filter by status (pending, complete, failed)
    - [ ] Delete scan action
    - [ ] Re-grade button (resubmit for new scan)
  - **File:** `src/components/Dashboard.tsx` (NEW) + `src/App.tsx`
  - **PR:** [Link]
  - **Tests:** ☐ (test loading scans, filtering, pagination)
  - **Done:** ☐

- [ ] **Add Auth page**
  - **Features:**
    - [ ] GitHub OAuth button
    - [ ] Redirect to dashboard on success
    - [ ] Logout button
    - [ ] Current user display (avatar, name)
  - **File:** `src/pages/AuthPage.tsx` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test OAuth flow)
  - **Done:** ☐

- [ ] **Add Settings page (Phase 1 MVP)**
  - **Features:**
    - [ ] Org selection
    - [ ] API key list + generate / revoke
    - [ ] Org invite link (placeholder for Phase 2)
  - **File:** `src/pages/SettingsPage.tsx` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test API key generation, revocation)
  - **Done:** ☐

- [ ] **Add Free Tier gating**
  - **Task:** Check monthly scan count from `/api/v1/orgs/{id}/usage`, block if >= 3 scans
  - **File:** `src/App.tsx` + `src/components/SubmitForm.tsx`
  - **UI:** Upsell banner when user hits limit
  - **PR:** [Link]
  - **Tests:** ☐ (test limit enforcement, upsell banner display)
  - **Done:** ☐

### Rate Limiting & Abuse Prevention

- [ ] **Add rate limiting middleware**
  - **File:** `server/middleware/rateLimit.ts`
  - **Limits:**
    - API: 60 scans/hour per API key
    - UI: 10 scans/hour per IP (for abuse prevention)
    - Authentication: 5 login attempts/minute per IP
  - **PR:** [Link]
  - **Tests:** ☐ (test limits are enforced)
  - **Done:** ☐

### Environment & Configuration

- [ ] **Update `.env.example`**
  - **Add vars:**
    - [ ] `GITHUB_CALLBACK_URL`
    - [ ] `JWT_SECRET`
    - [ ] `DATABASE_URL` (PostgreSQL)
    - [ ] `GEMINI_API_KEY` (move from hardcoded)
    - [ ] `NODE_ENV` (development/production)
    - [ ] `PORT` (default 3000)
  - **File:** `.env.example`
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Create `.env.local` template for local dev**
  - **File:** `.env.local` (git-ignored)
  - **Task:** Document setup: "Create .env.local from .env.example and fill in your secrets"
  - **Done:** ☐

### Testing

- [ ] **Add 10+ new tests for SaaS features**
  - **Target:** 40%+ coverage for new server code
  - **Tests:**
    - [ ] Auth flow (GitHub OAuth, JWT issuance)
    - [ ] Scan CRUD (create, read, list, delete)
    - [ ] Rate limiting (verify limits enforced)
    - [ ] Org management (create, list, usage calc)
    - [ ] Free tier gating (verify 3 scan limit)
    - [ ] API key management (create, verify, revoke)
  - **Files:** `tests/integration/auth.test.ts`, etc.
  - **Command:** `npm test`
  - **Coverage Report:** [Link to coverage report]
  - **Done:** ☐

- [ ] **Verify all original tests still pass**
  - **Command:** `npm test`
  - **Expected:** 15/15 tests pass (original + 10 new)
  - **PR:** [Link]
  - **Done:** ☐

### Docker & Local Dev

- [ ] **Update `docker-compose.yml`**
  - **Services:**
    - [ ] `app` (Node.js Grader)
    - [ ] `db` (PostgreSQL 15)
    - [ ] `redis` (optional, for caching)
  - **Features:**
    - [ ] Auto-run migrations on startup
    - [ ] Environment variable passing
    - [ ] Volume mounting for source code (hot reload)
    - [ ] Health checks for each service
  - **File:** `docker-compose.yml`
  - **Test:** `docker-compose up` works, app accessible at `localhost:3000`
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Document local dev setup**
  - **File:** `README.md` → "Local Development" section
  - **Steps:**
    1. Clone repo
    2. `npm install`
    3. Create `.env.local` from `.env.example`, fill in secrets
    4. `docker-compose up` (starts DB)
    5. `npm run db:migrate` (runs migrations)
    6. `npm run dev` (starts server + hot reload)
  - **Done:** ☐

### Acceptance Criteria (Phase 1)

- [ ] User signs in with GitHub
- [ ] User can submit a repo for grading via web UI
- [ ] Grading results persist in PostgreSQL
- [ ] User can view historical scans on dashboard (paginated, filterable)
- [ ] Free tier limited to 3 scans/month
- [ ] API keys can be generated and used for programmatic access
- [ ] Rate limiting enforced (60 scans/hr per key)
- [ ] All original tests pass + 10 new tests added
- [ ] Docker Compose local dev setup works
- [ ] No hardcoded secrets in code
- [ ] Deployment readiness: **75%**

---

## Phase 2: Monetization (Week 5)

**Estimated Time:** 1 week  
**Readiness Impact:** 75% → 85%  
**Goal:** Stripe integration, team management, notifications

### Stripe & Billing

- [ ] **Create Stripe account and test keys**
  - **Task:** Get `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`
  - **Store in:** `.env.local` (dev), environment variables (prod)
  - **Done:** ☐

- [ ] **Add billing endpoints**
  - **Endpoints:**
    - [ ] `GET /api/v1/billing/plans` (return pricing tiers)
    - [ ] `POST /api/v1/billing/checkout` (create Stripe session)
    - [ ] `GET /api/v1/billing/portal` (customer portal link)
    - [ ] `POST /api/v1/billing/webhook` (Stripe webhook handler)
  - **File:** `server/routes/billing.ts`
  - **PR:** [Link]
  - **Tests:** ☐ (test checkout creation, webhook handling)
  - **Done:** ☐

- [ ] **Add stripe-cli for webhook testing**
  - **Task:** `stripe listen --forward-to localhost:3000/api/v1/billing/webhook`
  - **Done:** ☐

- [ ] **Add plan tier enforcement**
  - **File:** `server/middleware/tenant.ts`
  - **Logic:**
    - [ ] Check org's plan tier from DB
    - [ ] Verify scan count this month < tier limit
    - [ ] Block scan submission if exceeded
  - **PR:** [Link]
  - **Tests:** ☐ (test tier limits enforced)
  - **Done:** ☐

### Team Management

- [ ] **Add team member invite endpoints**
  - **Endpoints:**
    - [ ] `POST /api/v1/orgs/{id}/members/invite` (send invite email)
    - [ ] `GET /api/v1/orgs/{id}/members` (list members)
    - [ ] `DELETE /api/v1/orgs/{id}/members/{user_id}` (remove member)
    - [ ] `PATCH /api/v1/orgs/{id}/members/{user_id}` (change role)
  - **Roles:** owner, admin, member, viewer
  - **File:** `server/routes/orgs.ts` (extend)
  - **PR:** [Link]
  - **Tests:** ☐ (test invite, member list, role changes)
  - **Done:** ☐

- [ ] **Add email service for invites**
  - **Tool:** Resend or SendGrid
  - **Task:** Send invite email with link to join
  - **File:** `server/integrations/email.ts` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test email sends)
  - **Done:** ☐

### Notifications

- [ ] **Add Slack integration**
  - **Endpoints:**
    - [ ] `POST /api/v1/orgs/{id}/notifications/slack` (set webhook URL)
    - [ ] `DELETE /api/v1/orgs/{id}/notifications/slack` (remove webhook)
  - **Events:** scan.completed, scan.failed, plan.limit_exceeded
  - **File:** `server/integrations/slack.ts` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test webhook storage, notification sending)
  - **Done:** ☐

- [ ] **Add email notifications**
  - **Events:** scan.completed, plan_limit_exceeded
  - **File:** `server/integrations/email.ts` (extend)
  - **Template:** Handlebars templates in `server/templates/`
  - **PR:** [Link]
  - **Done:** ☐

### Frontend Updates

- [ ] **Add Billing page**
  - **Features:**
    - [ ] Plan comparison table
    - [ ] Current plan indicator
    - [ ] "Upgrade to Starter" / "Manage Subscription" buttons
    - [ ] Payment history
  - **File:** `src/pages/BillingPage.tsx` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test plan display, upgrade flow)
  - **Done:** ☐

- [ ] **Add Team Settings page**
  - **Features:**
    - [ ] Member list with roles
    - [ ] Invite form (enter email)
    - [ ] Remove member action
    - [ ] Role change dropdowns
  - **File:** `src/pages/TeamSettingsPage.tsx` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test invite, member list, role changes)
  - **Done:** ☐

- [ ] **Update Settings page to show usage stats**
  - **Metrics:**
    - [ ] Scans used this month
    - [ ] Scans remaining
    - [ ] API calls used
    - [ ] Team member count
  - **File:** `src/pages/SettingsPage.tsx` (extend)
  - **PR:** [Link]
  - **Done:** ☐

### Database Migrations

- [ ] **Add billing/team schema migrations**
  - **Migrations:**
    - [ ] `005_add_org_stripe_fields.sql` (add stripe_customer_id, plan_tier)
    - [ ] `006_add_org_members_table.sql` (org members)
    - [ ] `007_add_notifications_table.sql` (Slack/email webhooks)
  - **PR:** [Link]
  - **Done:** ☐

### Testing

- [ ] **Add 10+ new tests for billing/team features**
  - **Tests:**
    - [ ] Stripe checkout session creation
    - [ ] Stripe webhook handling (subscription.created, subscription.updated)
    - [ ] Plan tier limits enforced
    - [ ] Team invite email sent
    - [ ] Member removal works
    - [ ] Notifications sent to Slack and email
  - **Coverage:** 50%+ for new billing code
  - **Done:** ☐

### Acceptance Criteria (Phase 2)

- [ ] User can subscribe via Stripe checkout
- [ ] Subscription appears in customer portal
- [ ] Downgrade/upgrade/cancel works
- [ ] Usage limits enforced per plan
- [ ] Org admin can invite team members via email
- [ ] Invitee receives email and can join
- [ ] Member roles (admin, member, viewer) enforced
- [ ] Slack notifications sent on scan complete
- [ ] Email notifications sent on scan complete
- [ ] All Phase 1 tests still pass + 10 new Phase 2 tests
- [ ] Deployment readiness: **85%**

---

## Phase 3: Distribution (Weeks 6-7)

**Estimated Time:** 1.5 weeks  
**Readiness Impact:** 85% → 95%  
**Goal:** GitHub App, shareable reports, public discovery

### GitHub App

- [ ] **Create GitHub App manifest**
  - **Permissions:**
    - [ ] `contents: read`
    - [ ] `checks: write`
    - [ ] `pull_requests: write`
  - **Webhooks:**
    - [ ] `push`
    - [ ] `pull_request` (optional)
  - **File:** `github-app-manifest.json` (NEW)
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Implement GitHub App webhook handler**
  - **Endpoint:** `POST /api/v1/github/webhook`
  - **Logic:**
    - [ ] Verify webhook signature
    - [ ] Parse push event (branch, commit, repo)
    - [ ] Trigger scan for default branch pushes
    - [ ] Create check run with results
  - **File:** `server/routes/github.ts` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test webhook verification, check run creation)
  - **Done:** ☐

- [ ] **Auto-grade on push**
  - **Flow:**
    - 1. User installs GitHub App to repo
    - 2. User pushes to default branch
    - 3. Webhook triggers scan
    - 4. Scan completes → check run created with pass/fail + link to report
  - **PR:** [Link]
  - **Manual Test:** Install app to test repo, make a push, verify check run appears
  - **Done:** ☐

### Public Report Pages

- [ ] **Create shareable report page**
  - **URL:** `https://grader.dev/report/{owner}/{repo}`
  - **Features:**
    - [ ] Full report display (no auth required)
    - [ ] OG meta tags for social sharing
    - [ ] JSON export button
    - [ ] Grade badge with color
  - **File:** `src/pages/ReportPage.tsx` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test OG tags, report display)
  - **Done:** ☐

- [ ] **Add OG image generation**
  - **Tool:** Sharp for dynamic image generation
  - **Endpoint:** `GET /api/v1/reports/{owner}/{repo}/og-image`
  - **Image:** Includes score, grade, owner/repo name, timestamp
  - **File:** `server/routes/reports.ts` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test image generation)
  - **Done:** ☐

- [ ] **Create badge API**
  - **Endpoint:** `GET /badge/{owner}/{repo}.svg`
  - **Output:** SVG badge with score color (A=green, B=blue, C=yellow, D=orange, F=red)
  - **Embed:** Users can add `![Grader Score](https://grader.dev/badge/{owner}/{repo}.svg)` to README
  - **File:** `server/routes/badges.ts` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test SVG generation, color mapping)
  - **Done:** ☐

### Discovery & Trending

- [ ] **Add trending page**
  - **Endpoints:**
    - [ ] `GET /api/v1/trending` (top 20 repos by score)
    - [ ] `GET /api/v1/trending?dimension=security` (filter by dimension)
    - [ ] `GET /api/v1/trending?time=week|month|all` (time period)
  - **File:** `server/routes/trending.ts` (NEW)
  - **Logic:** Query DB for top scans, sort by score, apply filters
  - **PR:** [Link]
  - **Tests:** ☐ (test sorting, filtering)
  - **Done:** ☐

- [ ] **Add explore page**
  - **Features:**
    - [ ] Filter by language (Python, JavaScript, etc.)
    - [ ] Filter by grade (A, B, C, D, F)
    - [ ] Filter by dimension (security, quality, etc.)
    - [ ] Sort by score, date, activity
  - **File:** `src/pages/ExplorePage.tsx` (NEW)
  - **PR:** [Link]
  - **Tests:** ☐ (test filtering, sorting)
  - **Done:** ☐

- [ ] **Setup SEO & indexing**
  - **Sitemap:** `GET /sitemap.xml` → lists top 10K public reports
  - **robots.txt:** Allow crawling of `/report/*` and `/trending`
  - **Schema.org:** Structured data for each report (JSON-LD)
  - **Files:** `server/routes/seo.ts` (NEW), `public/robots.txt`
  - **PR:** [Link]
  - **Tests:** ☐ (test sitemap generation, robots.txt)
  - **Done:** ☐

### Frontend Updates

- [ ] **Create Landing page**
  - **Sections:**
    - [ ] Hero: "Honest code audit in 30 seconds"
    - [ ] Features: Security, quality, valuation, market benchmarking
    - [ ] Pricing tiers
    - [ ] "Grade your repo" CTA (links to sign up)
    - [ ] Trending repos (auto-updated)
  - **File:** `src/pages/LandingPage.tsx` (NEW)
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Update navigation**
  - **Menu:**
    - [ ] Home (landing)
    - [ ] Trending (explore top repos)
    - [ ] Dashboard (if logged in)
    - [ ] Sign In (if not logged in)
    - [ ] Pricing
  - **File:** `src/components/Navigation.tsx` (update)
  - **PR:** [Link]
  - **Done:** ☐

### Testing

- [ ] **Add E2E tests (Playwright)**
  - **Tests:**
    - [ ] GitHub App webhook flow (push → check run)
    - [ ] Public report page loads without auth
    - [ ] OG tags present in report page
    - [ ] Badge API returns SVG
    - [ ] Trending page displays top repos
    - [ ] Explore page filters work
  - **Coverage:** 15+ new E2E tests
  - **File:** `tests/e2e/github-app.e2e.ts`, etc.
  - **Done:** ☐

### Acceptance Criteria (Phase 3)

- [ ] GitHub App installable and auto-grades on push
- [ ] Check run created with pass/fail badge + link to report
- [ ] Public report pages exist and are SEO-friendly
- [ ] OG meta tags render correctly (social sharing preview)
- [ ] Badge API works (embeddable in README)
- [ ] Trending page ranks repos by score
- [ ] Explore page filters by language, grade, dimension
- [ ] Sitemap and robots.txt configured
- [ ] All Phase 2 tests still pass + 15 new Phase 3 E2E tests
- [ ] Deployment readiness: **95%**

---

## Phase 4: Polish & Hardening (Week 8)

**Estimated Time:** 1 week  
**Readiness Impact:** 95% → 100%  
**Goal:** Full production readiness, security, performance, docs

### Security Hardening

- [ ] **OWASP Top 10 audit**
  - **Task:** Run SonarCloud or similar on codebase
  - **Issues to check:**
    - [ ] SQL injection (parameterized queries)
    - [ ] XSS (sanitize report HTML)
    - [ ] CSRF (token validation)
    - [ ] Broken auth (JWT validation)
    - [ ] Sensitive data exposure (no secrets in logs)
  - **Report:** [Link to security audit results]
  - **Fixes:** [PR links]
  - **Done:** ☐

- [ ] **Add HTTPS enforcement**
  - **Config:** `app.use(helmet())` with HSTS header
  - **File:** `server/index.ts` or `server.ts`
  - **Header:** `Strict-Transport-Security: max-age=31536000`
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Secret scanning**
  - **Task:** Ensure no API keys, passwords, or tokens in code/logs
  - **Tool:** `npm audit` + manual review
  - **Done:** ☐

- [ ] **Rate limiting on auth endpoints**
  - **Limits:** 5 login attempts/minute per IP
  - **File:** `server/middleware/rateLimit.ts` (extend)
  - **PR:** [Link]
  - **Done:** ☐

### Performance & Observability

- [ ] **Code splitting for report components**
  - **Task:** Lazy-load report sections (Security, Quality, Valuation, etc.)
  - **Tool:** React.lazy() + Suspense
  - **Benefit:** Faster initial page load
  - **File:** `src/App.tsx`, `src/pages/ReportPage.tsx`
  - **PR:** [Link]
  - **Metric:** Measure LCP (Largest Contentful Paint) before/after
  - **Done:** ☐

- [ ] **Add caching headers**
  - **Strategy:** ETag-based caching for reports, 24-hour TTL
  - **File:** `server/middleware/caching.ts` (NEW)
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Setup Prometheus metrics**
  - **Endpoint:** `GET /metrics`
  - **Metrics:**
    - [ ] `http_requests_total` (by method, path, status)
    - [ ] `http_request_duration_seconds` (histogram)
    - [ ] `db_query_duration_seconds`
    - [ ] `gemini_api_calls_total` (by status)
  - **File:** `server/middleware/metrics.ts` (NEW)
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Structured logging (JSON)**
  - **Tool:** winston or pino
  - **Format:** JSON to stdout (container-friendly)
  - **Levels:** debug, info, warn, error
  - **File:** `server/utils/logger.ts` (NEW)
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Error tracking (Sentry)**
  - **Task:** Send errors to Sentry for monitoring
  - **File:** `server/middleware/errorTracking.ts` (NEW)
  - **Config:** `SENTRY_DSN` env var
  - **PR:** [Link]
  - **Done:** ☐

### Testing & Coverage

- [ ] **Increase test coverage to 60%+**
  - **Target:** 60%+ coverage for server code
  - **Strategy:**
    - [ ] Add unit tests for services (grading, valuation, OSS audit)
    - [ ] Add integration tests for API routes
    - [ ] Add E2E tests for critical user flows
  - **Report:** Coverage report (e.g., `nyc report`)
  - **Command:** `npm test -- --coverage`
  - **Done:** ☐

- [ ] **Load testing**
  - **Tool:** Artillery or K6
  - **Scenario:** 100 concurrent scan submissions
  - **Measure:** Latency, throughput, error rate
  - **Target:** < 5s p95 latency, 0 errors
  - **Report:** [Link to load test results]
  - **Done:** ☐

- [ ] **Performance testing**
  - **Metrics:**
    - [ ] Report page LCP (Largest Contentful Paint) < 2s
    - [ ] Time to Interactive (TTI) < 3s
    - [ ] Cumulative Layout Shift (CLS) < 0.1
  - **Tool:** Lighthouse, WebPageTest
  - **Report:** [Link]
  - **Done:** ☐

### Deployment Preparation

- [ ] **Dockerfile multi-stage build**
  - **Stages:**
    - [ ] Build stage (npm install, npm run build)
    - [ ] Runtime stage (minimal Node.js image, non-root user)
  - **Security:** Run as non-root user (`node:latest` has unprivileged user)
  - **File:** `Dockerfile`
  - **Test:** `docker build -t grader:latest .` succeeds
  - **Done:** ☐

- [ ] **Docker Compose for production**
  - **Services:**
    - [ ] app (Node.js Grader)
    - [ ] db (PostgreSQL 15 with volumes)
    - [ ] nginx (reverse proxy, SSL termination)
    - [ ] redis (caching, optional)
  - **File:** `docker-compose.yml` (extend for prod)
  - **Test:** `docker-compose up` works in prod mode
  - **Done:** ☐

- [ ] **Health checks**
  - **Endpoint:** `GET /health` → returns `{ status: "ok" }`
  - **File:** `server/routes/health.ts` (NEW)
  - **Docker:** Configure health check in `docker-compose.yml`
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Database backups**
  - **Strategy:** Daily snapshots to S3 or similar
  - **Retention:** 30 days
  - **Automation:** Cron job or managed service
  - **Document:** [Link to backup procedure]
  - **Done:** ☐

- [ ] **Environment configuration**
  - **Files:**
    - [ ] `.env.example` (complete template)
    - [ ] `.env.local` (local dev, git-ignored)
    - [ ] `.env.production.example` (production template)
  - **Validation:** Script to validate env vars on startup
  - **Done:** ☐

### Documentation

- [ ] **API documentation (OpenAPI 3.0)**
  - **Tool:** Swagger UI or ReDoc
  - **File:** `docs/openapi.yaml` (NEW)
  - **Endpoints:** All `/api/v1/*` endpoints documented
  - **Hosting:** `/api/docs` (Swagger UI)
  - **PR:** [Link]
  - **Done:** ☐

- [ ] **Deployment guide**
  - **File:** `docs/DEPLOYMENT.md` (NEW)
  - **Sections:**
    - [ ] Prerequisites (Node.js version, PostgreSQL version, etc.)
    - [ ] Environment setup (env vars, database, secrets)
    - [ ] Local development (`npm install`, `npm run dev`)
    - [ ] Production build and deploy (Docker, cloud platform)
    - [ ] Monitoring and observability (Prometheus, Sentry)
    - [ ] Troubleshooting
  - **Done:** ☐

- [ ] **Admin guide**
  - **File:** `docs/ADMIN.md` (NEW)
  - **Topics:**
    - [ ] User management (create/delete orgs, invite members)
    - [ ] Plan tier management (pricing, limits)
    - [ ] Monitoring (health checks, logs, metrics)
    - [ ] Incident response (debugging, rollback)
  - **Done:** ☐

- [ ] **Security policy**
  - **File:** `SECURITY.md` (NEW)
  - **Topics:**
    - [ ] Responsible disclosure process
    - [ ] Reporting security vulnerabilities
    - [ ] Bug bounty (if applicable)
    - [ ] Data privacy (GDPR, CCPA compliance)
    - [ ] Audit logging
  - **Done:** ☐

- [ ] **FAQ**
  - **File:** `docs/FAQ.md` (NEW)
  - **Topics:**
    - [ ] How does Grader score code quality?
    - [ ] What makes Grader different from SonarCloud?
    - [ ] How is my repository data stored?
    - [ ] Can I self-host Grader?
    - [ ] What languages does Grader support?
  - **Done:** ☐

- [ ] **README update**
  - **Sections to update:**
    - [ ] Quick start (now includes "Sign in with GitHub")
    - [ ] Features (updated with SaaS features)
    - [ ] Pricing (link to pricing page)
    - [ ] Architecture (point to ARCHITECTURE.md)
    - [ ] Contributing (if accepting contributors)
  - **File:** `README.md`
  - **PR:** [Link]
  - **Done:** ☐

### CI/CD Pipeline

- [ ] **Add GitHub Actions for testing**
  - **File:** `.github/workflows/test.yml`
  - **Triggers:** On push to main, pull request
  - **Jobs:**
    - [ ] Run tests (`npm test`)
    - [ ] Run linter (`npm run lint`)
    - [ ] Run type check (`npm run lint`)
    - [ ] Report coverage
  - **Done:** ☐

- [ ] **Add GitHub Actions for linting**
  - **File:** `.github/workflows/lint.yml`
  - **Linter:** ESLint + Prettier
  - **Auto-fix:** Option to auto-commit fixes or comment on PR
  - **Done:** ☐

- [ ] **Add GitHub Actions for security scanning**
  - **File:** `.github/workflows/security.yml`
  - **Tools:**
    - [ ] `npm audit` (dependency vulnerabilities)
    - [ ] Snyk (optional, more detailed)
    - [ ] SonarCloud (code quality + security)
  - **Done:** ☐

- [ ] **Add GitHub Actions for deployment**
  - **File:** `.github/workflows/deploy.yml`
  - **Triggers:** On push to main (or manual)
  - **Jobs:**
    - [ ] Build Docker image
    - [ ] Push to registry (DockerHub, ECR, etc.)
    - [ ] Deploy to production (Kubernetes, Railway, etc.)
  - **Done:** ☐

### Acceptance Criteria (Phase 4)

- [ ] Security audit completed, OWASP Top 10 issues addressed
- [ ] HTTPS enforced, HSTS header present
- [ ] Test coverage > 60%
- [ ] Load test: 100 concurrent requests handled
- [ ] Performance: LCP < 2s, TTI < 3s
- [ ] Dockerfile multi-stage build works
- [ ] Health check endpoint responds correctly
- [ ] Database backups configured
- [ ] OpenAPI docs available at /api/docs
- [ ] Deployment guide complete and tested
- [ ] GitHub Actions CI/CD pipeline configured
- [ ] All Phase 3 tests still pass + new Phase 4 tests
- [ ] **Deployment readiness: 100%**

---

## Appendix: Progress Tracking

### Overall Progress

```
Phase 0 (Week 1):    [ ] 0% — Security Fixes
Phase 1 (Weeks 2-4): [ ] 0% — SaaS Core
Phase 2 (Week 5):    [ ] 0% — Monetization
Phase 3 (Weeks 6-7): [ ] 0% — Distribution
Phase 4 (Week 8):    [ ] 0% — Polish & Hardening

Total Readiness: 62% → Target: 100%
```

### Key Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Security fixes complete | Week 1 | ☐ |
| Phase 1 PR review | Week 4 | ☐ |
| Phase 1 merged & deployed to staging | Week 4 | ☐ |
| Phase 2 PR review | Week 5 | ☐ |
| Phase 2 + Phase 3 merged & deployed to production | Week 7 | ☐ |
| Phase 4 testing & docs complete | Week 8 | ☐ |
| Production readiness verified | Week 8 | ☐ |
| **100% Readiness** | **Week 8** | ☐ |

### How to Use This Checklist

1. **Copy to Project Board:** Transfer each task to GitHub Projects or Jira
2. **Assign Owners:** Each task should have an assigned developer
3. **Set Deadlines:** Link each phase to sprint calendar
4. **Track Progress:** Check off items as they complete
5. **Weekly Review:** Discuss blockers and risks in standups
6. **Update AUDIT-BENCHMARKING.md:** Document changes to readiness % as phases complete

---

## Questions? Issues?

- **For technical decisions:** See [AUDIT-BENCHMARKING.md](AUDIT-BENCHMARKING.md) "Strategic Upgrade Roadmap" section
- **For design/architecture:** See AUDIT-BENCHMARKING.md "File Structure Post-Upgrade" appendix
- **For timeline:** Phases are sequential; parallelize sub-tasks within phases to save time

**Good luck! 🚀**
