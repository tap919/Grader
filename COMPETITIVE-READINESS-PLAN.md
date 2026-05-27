# Grader: 3-Phase Competitive Readiness Plan

**Goal:** Ship a low-cost SaaS competitor that undercuts SonarCloud/Codacy/CodeRabbit by 3-10x while offering unique features (valuation, ISO 5055, market benchmarking) they don't have.

**Principle:** Grade repos, not developers. No per-seat pricing.

---

## Phase 1 — SaaS Core (Week 1-2)

**Target state:** Multi-tenant, persistent, authenticated. Ready for paid users.

### Backend — New Dependencies
```
pg (PostgreSQL), aws-sdk or @aws-sdk/client-s3 (PDF storage),
jsonwebtoken (JWT sessions), bcrypt (key hashing),
node:crypto (API key generation), zod (input validation)
```

### Database (PostgreSQL) — Schema
```sql
-- Auth & Multi-Tenancy
users        (id, email, github_id, display_name, avatar_url, created_at)
orgs         (id, name, slug UNIQUE, stripe_customer_id, plan_tier, created_at)
org_members  (org_id, user_id, role, joined_at)
api_keys     (id, key_hash, prefix, user_id, org_id, name, last_used_at, created_at)

-- Scans & Persistence
scans        (id, org_id, user_id, repo_url, owner, name, score, grade, report JSONB, created_at)
scan_queue   (id, status, org_id, repo_url, created_at, started_at, completed_at, error)

-- Usage & Rate Limiting
usage_log    (id, org_id, user_id, action, resource, created_at)
rate_limits  (org_id, period_start, scan_count, api_call_count)
```

### API Endpoints
```
POST   /api/v1/auth/github            # OAuth login
GET    /api/v1/auth/me                 # Current user + orgs
POST   /api/v1/auth/api-keys          # Create API key
DELETE /api/v1/auth/api-keys/:id      # Revoke API key

POST   /api/v1/scans                  # Submit repo for grading
GET    /api/v1/scans                  # List scans (paginated)
GET    /api/v1/scans/:id              # Scan detail
GET    /api/v1/scans/:id/report       # PDF download

POST   /api/v1/orgs                   # Create org
GET    /api/v1/orgs/:id               # Org detail + usage
```

### Frontend Changes
- **Landing page** — Hero, pricing tiers, "Grade your repo" CTA
- **Auth flow** — GitHub OAuth button, API key management page
- **Dashboard** — Scan history from DB (not in-memory), sort/filter, re-grade
- **Free tier gating** — 3 scans/mo, upsell to paid

### Key Files to Create/Modify
```
src/server/
├── db/
│   ├── schema.sql        # Full PostgreSQL schema
│   ├── pool.ts            # pg Pool singleton
│   └── migrate.ts         # Auto-run migrations
├── auth/
│   ├── github.ts          # GitHub OAuth flow
│   ├── jwt.ts             # JWT issue/verify
│   └── apikey.ts          # API key create/verify
├── routes/
│   ├── auth.ts            # Auth endpoints
│   ├── scans.ts           # Scan CRUD endpoints
│   └── orgs.ts            # Org management
├── middleware/
│   └── tenant.ts          # Rate limit + plan enforcement
└── services/
    ├── gemini.ts          # Grading engine (extracted from server.ts)
    └── github.ts          # GitHub data fetching
```

### Acceptance Criteria
- [ ] User signs in with GitHub → can grade repos
- [ ] Scans persist in PostgreSQL across restarts
- [ ] API keys work for programmatic access
- [ ] Free tier limited to 3 scans/month
- [ ] Landing page explains pricing
- [ ] 15 existing tests still pass + 10 new SaaS tests

---

## Phase 2 — Monetization & Teams (Week 3)

**Target state:** Paying customers with team collaboration.

### Backend — New Dependencies
```
stripe (payment processing), @sendgrid/mail or resend (email),
handlebars or react-email (email templates)
```

### What Ships

**Stripe Billing**
- Checkout session → customer → subscription
- Customer portal for plan changes
- Webhook handler (invoice.paid, subscription.updated, etc.)
- Plan tier enforcement middleware (check scan count, block if exceeded)

**Team Management**
- Org admin can invite members via email
- Members share scan quota
- Role-based access (admin/member/viewer)
- Activity feed per org

**Notifications**
- Email on scan complete (Resend or SendGrid)
- Slack webhook integration (configurable per org)
- Scan failure alerts

### API Endpoints
```
GET    /api/v1/billing/plans          # List available plans
POST   /api/v1/billing/checkout       # Create Stripe checkout
POST   /api/v1/billing/portal         # Customer portal link
POST   /api/v1/billing/webhook        # Stripe event handler

POST   /api/v1/orgs/:id/invite       # Invite member by email
DELETE /api/v1/orgs/:id/members/:uid  # Remove member
PATCH  /api/v1/orgs/:id/members/:uid  # Change role

POST   /api/v1/notifications/slack    # Configure Slack webhook
```

### Frontend Changes
- **Billing page** — Plan comparison, upgrade/downgrade, payment history
- **Team settings** — Member list, invite form, role badges
- **Usage dashboard** — Scan counter, API call stats, remaining quota
- **Plan gating** — Feature access based on tier

### Pricing (Locked In)
```
Free:       3 scans/mo, public repos only, basic report
Starter:    $9/mo, 30 scans, full report, PDF export
Professional: $29/mo, 150 scans, API access, team management, Slack
Enterprise: $99/mo, unlimited, SSO, dedicated, SLA, audit log
```

### Acceptance Criteria
- [ ] User can subscribe via Stripe checkout
- [ ] Usage limits enforced per plan tier
- [ ] Team invites work (email sent, member joins)
- [ ] Slack notification on scan complete
- [ ] Downgrade/upgrade/cancel all work
- [ ] All prior tests still pass + 15 new billing/team tests

---

## Phase 3 — Integration & Distribution (Week 4-5)

**Target state:** SaaS that acquires users through GitHub Marketplace, PR comments, and viral shareability.

### Backend — New Dependencies
```
octokit (GitHub API SDK), probe-image-size or sharp (og:image generation),
marked or similar (report→markdown→PR comment)
```

### What Ships

**GitHub App Integration**
- GitHub App manifest for easy install
- Webhook receiver for push and pull_request events
- Auto-grade on push to default branch
- PR comment with grade summary + link to full report
- Check run status (pass/fail) on quality gate

**Viral Features**
- **Shareable report cards** — Public page at `grader.dev/report/{owner}/{repo}` with SEO meta tags
- **OG image generation** — Dynamic social preview card with score badge
- **Badge API** — `![Grader Score](https://grader.dev/badge/{owner}/{repo}.svg)` — README embed
- **Trending page** — Top-graded repos, most-improved, worst offenders (SEO bait)

**Enterprise Polish**
- SAML/SSO (Okta, Azure AD via passport-saml)
- PDF report generation (puppeteer or PDFKit with proper branding)
- Audit log (all actions logged, searchable)
- Rate limit analytics (usage trends, forecast overages)
- Self-hosted Docker Compose deployment guide
- Prometheus metrics endpoint (`/metrics` for monitoring)

**Testing Expansion**
- Integration tests: full scan → DB → report flow
- E2E: GitHub OAuth → create scan → view report → upgrade → team invite
- Load test: 100 concurrent scans, measure Gemini latency
- Test coverage target: >60%

### Frontend Changes
- **Report page** — Public shareable URL with OG tags
- **Badge page** — Live SVG badge with score color
- **Trending/explore** — Browse public scans, filter by language/score
- **Settings page** — API key management, notification config, SSO config
- **Admin panel** — Org management, usage analytics, audit log viewer

### Acceptance Criteria
- [ ] GitHub App installs, auto-grades on push, posts PR comments
- [ ] Public report page renders with OG tags → shareable on social media
- [ ] SVG badge embeddable in README
- [ ] SSO login works (Okta)
- [ ] PDF report downloads with proper branding
- [ ] Audit log searchable by admin
- [ ] Self-hosted deployment documented and tested
- [ ] All tests pass (existing + 20+ new)
- [ ] Load test: 100 scans in < 5 minutes

---

## Competitive Readiness Scorecard

| Capability | Current | Phase 1 | Phase 2 | Phase 3 |
|-----------|:-------:|:-------:|:-------:|:-------:|
| Multi-Tenant Auth | ❌ | ✅ | ✅ | ✅ |
| Persistent Storage | ❌ | ✅ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ | ✅ |
| Free Tier | ❌ | ✅ | ✅ | ✅ |
| Billing/Subscriptions | ❌ | ❌ | ✅ | ✅ |
| Team Management | ❌ | ❌ | ✅ | ✅ |
| Plan Enforcement | ❌ | ⚠️ | ✅ | ✅ |
| Slack Notifications | ❌ | ❌ | ✅ | ✅ |
| GitHub App / PR Comments | ❌ | ❌ | ❌ | ✅ |
| Shareable Report Cards | ❌ | ❌ | ❌ | ✅ |
| README Badges | ❌ | ❌ | ❌ | ✅ |
| SSO / Enterprise | ❌ | ❌ | ❌ | ✅ |
| Audit Log | ❌ | ❌ | ❌ | ✅ |
| Self-Hosted Option | ❌ | ❌ | ❌ | ✅ |
| Load Tested | ❌ | ❌ | ❌ | ✅ |
| **Overall Readiness** | **25%** | **55%** | **75%** | **100%** |

## Total Effort: 4-5 Weeks

Phase 1: 1-2 weeks (SaaS foundation — auth, DB, persistence, landing)
Phase 2: 1 week (Billing, teams, notifications)
Phase 3: 2 weeks (GitHub integration, viral features, enterprise polish)

**Cost to build:** ~$0 (open-source stack + Stripe + PostgreSQL) + Gemini API costs during development (~$20-50)
**Ongoing infra cost:** ~$30/mo (PostgreSQL + server) for first 100 users at Gemini cost of ~$0.15/scan
