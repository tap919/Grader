# Grader SaaS Audit — Roadmap to Leading Low-Cost Platform

## Competitive Landscape

| Competitor | Pricing | Focus | Grader Advantage |
|-----------|---------|-------|-----------------|
| **SonarQube Cloud** | $32/mo Team, LOC-based Enterprise | Static analysis, SAST | AI-native holistic scoring, valuation engine |
| **CodeRabbit** | $12-24/dev/mo | PR-level code review | Broader scope (quality+security+market+valuation+compliance) |
| **Codacy** | $18/dev/mo | Code quality + security | More dimensions (OSS, ISO 5055, market benchmark, valuation) |
| **Code Climate** | Freemium, ~$15/dev/mo | Maintainability GPA | Valuation engine, M&A due diligence focus |
| **Sema** | Custom enterprise ($$$$) | M&A due diligence | **10-100x cheaper**, same target market |
| **Qodo (CodiumAI)** | ~$19/dev/mo | Test generation + review | Automated grading without per-dev pricing |

### Grader's Moat

1. **Single AI call replaces entire toolchain** — Grading is one Gemini prompt, not 15 different linters + databases + rulesets
2. **Unique M&A features** — Valuation engine (replacement cost, relief-from-royalty, productivity debt, interest debt) — **nobody else does this**
3. **ISO 5055 compliance scoring** — Enterprise buyers care about certified standards
4. **No per-developer pricing** — Grader grades repos, not developers. This is a structural pricing advantage over Percy/Codacy/CodeRabbit
5. **Gemini cost structure is absurdly cheap** — ~$0.15/scan vs competitors needing dedicated CI infra

## SaaS Architecture Requirements

### Core Infrastructure
```
┌─────────────────────────────────────────────────┐
│                    Grader SaaS                   │
├─────────────────────────────────────────────────┤
│  Frontend (React/Vite)                          │
│  ├── Public pages (landing, pricing, docs)      │
│  ├── App (grading dashboard, history, reports)  │
│  └── Admin (usage analytics, user mgmt)         │
├─────────────────────────────────────────────────┤
│  API Gateway (Express + middleware)             │
│  ├── /api/v1/auth       (OAuth + API keys)      │
│  ├── /api/v1/scans      (CRUD scans)            │
│  ├── /api/v1/grade      (execute grading)       │
│  ├── /api/v1/orgs       (team management)       │
│  ├── /api/v1/billing    (Stripe portal)         │
│  └── /api/v1/webhooks   (GitHub push events)    │
├─────────────────────────────────────────────────┤
│  Services Layer                                 │
│  ├── Gemini Service     (AI grading engine)     │
│  ├── GitHub Service     (repo data fetching)    │
│  ├── Scan Service       (queue + execution)     │
│  ├── Billing Service    (Stripe integration)    │
│  └── Notification Svc   (email, webhooks)       │
├─────────────────────────────────────────────────┤
│  Data Layer                                     │
│  ├── PostgreSQL (users, orgs, scans, billing)   │
│  ├── Redis (rate limits, caching, queues)       │
│  └── Object Storage (report PDFs, exports)      │
└─────────────────────────────────────────────────┘
```

### Data Model (New Tables Needed)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Auth & profile | id, email, github_id, name, avatar, created_at |
| `orgs` | Team/org accounts | id, name, slug, stripe_customer_id, plan_tier |
| `org_members` | Org membership | user_id, org_id, role (admin/member) |
| `api_keys` | Programmatic access | id, key_hash, user_id, org_id, name, last_used |
| `scans` | Persistent scan history | id, org_id, user_id, repo_url, owner, name, score, grade, full_report(JSONB), created_at |
| `scan_queue` | Async scan jobs | id, status, created_at, started_at, completed_at, error |
| `rate_limits` | Usage tracking | org_id, period_start, scan_count, api_call_count |
| `billing_plans` | Plan definitions | tier, name, price, scans_per_month, features |
| `subscriptions` | Active subscriptions | org_id, plan_id, status, current_period_start/end |

### API Endpoints Needed

```
Auth:
  GET  /api/v1/auth/github     → OAuth redirect
  POST /api/v1/auth/github/callback → token exchange
  POST /api/v1/auth/api-key    → Create API key
  GET  /api/v1/auth/me         → Current user + orgs

Scans:
  POST /api/v1/scans           → Submit repo for grading
  GET  /api/v1/scans           → List scans (paginated, filtered)
  GET  /api/v1/scans/:id       → Get scan detail
  GET  /api/v1/scans/:id/report → Download PDF report
  DELETE /api/v1/scans/:id     → Delete scan

Orgs:
  POST /api/v1/orgs            → Create org
  GET  /api/v1/orgs/:id        → Org detail + usage
  PUT  /api/v1/orgs/:id        → Update org
  POST /api/v1/orgs/:id/members → Invite member
  DELETE /api/v1/orgs/:id/members/:uid → Remove member

Billing:
  GET  /api/v1/billing/plans   → List plans
  POST /api/v1/billing/portal  → Stripe customer portal
  POST /api/v1/billing/webhook → Stripe events

Webhooks:
  POST /api/v1/webhooks/github → GitHub push/PR events
  POST /api/v1/webhooks/slack  → Slack notification config
```

## Pricing Strategy — Low-Cost Leader

The key insight: **Grader grades repos, not developers**. This means:
- A 100-person team pays the same as a 2-person startup for the same repo
- No per-seat pricing (everyone else does per-seat)
- Volume = repos graded, not developers using it

### Proposed Pricing

| Tier | Price | Scans/mo | Features |
|------|-------|----------|----------|
| **Free** | $0 | 3 | Public repos, basic score + summary, 7-day history |
| **Starter** | $9/mo | 30 | Private repos, full report (security/quality/market/valuation), 90-day history, PDF export |
| **Professional** | $29/mo | 150 | Team dashboard, comparison reports, API access, 1-year history, priority queue |
| **Enterprise** | $99/mo | Unlimited | SSO, dedicated instance, custom integrations, SLA, audit log |

### Cost Analysis Per Scan

| Component | Cost |
|-----------|------|
| Gemini 3.5 Flash API | ~$0.10-0.30 (depends on repo size) |
| GitHub API calls | Free (public repos) |
| Compute (Docker) | ~$0.01 |
| Storage + DB | ~$0.005 |
| **Total per scan** | **~$0.12-0.32** |

At $29/mo for 150 scans = $0.19/scan → **65% gross margin at Professional tier**
At $99/mo for unlimited → **90%+ gross margin** at volume

### Competitive Price Comparison

| Tier | Grader | SonarCloud | Codacy | CodeRabbit |
|------|--------|-----------|--------|------------|
| Free | 3 scans/mo | Limited LOC | Open source only | 14-day trial |
| Entry | $9 | $32 (Team) | $18/dev/mo | $12/dev/mo |
| Mid | $29 | — | — | $24/dev/mo |
| Enterprise | $99 | Custom LOC | Custom | Custom |

**Grader's price advantage:** ~3-10x cheaper than competitors for teams of 5+ developers.

## Feature Comparison Matrix

| Feature | Grader (Current) | Grader (SaaS) | SonarCloud | Codacy | CodeRabbit | Sema |
|---------|:-:|:-:|:-:|:-:|:-:|:-:|
| Static Analysis | ❌ (Gemini-based) | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI-Powered Review | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| Security Scanning | ✅ (LLM) | ✅ (LLM+SAST) | ✅ | ✅ | ✅ | ✅ |
| Quality Metrics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Market Benchmarking | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Valuation Engine** | ✅ | ✅ | **❌** | **❌** | **❌** | **❌** |
| **ISO 5055 Compliance** | ✅ | ✅ | **❌** | **❌** | **❌** | **❌** |
| **OSS License Audit** | ✅ | ✅ | ⚠️ | ✅ | ❌ | ✅ |
| **Quick Wins Gen** | ✅ | ✅ | **❌** | **❌** | **❌** | **❌** |
| **Roadmap Gen** | ✅ | ✅ | **❌** | **❌** | **❌** | **❌** |
| CI/CD Integration | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| PR Comments | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Multi-Tenant | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| API Access | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Team Dashboard | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Self-Hosted Option | ❌ | ⚠️ (Future) | ✅ | ✅ | ✅ | ❌ |
| PDF Reports | ⚠️ (print) | ✅ | ✅ | ✅ | ❌ | ✅ |
| M&A Due Diligence Pkg | ⚠️ (partial) | ✅ | ❌ | ❌ | ❌ | ✅ |

## Go-to-Market Strategy — Low-Cost Leader

### Target Audiences
1. **Startups & indie devs** — Free tier gets them hooked, $9/mo is impulse-buy territory
2. **SMB engineering teams** — $29/mo for unlimited repos (vs $18/dev/mo at Codacy)
3. **M&A advisors / VCs** — Enterprise at $99/mo for due diligence (vs Sema's $$$$$ custom pricing)
4. **Open source projects** — Free tier for public repos = word-of-mouth growth

### Distribution Channels
1. **GitHub Marketplace** — "Grade any repo in one click" — free tier drives installs
2. **Hacker News / Product Hunt** — "I graded 50 top GitHub repos — here's what I found" (viral content)
3. **M&A boutique partnerships** — White-label for due diligence firms
4. **Content marketing** — "The State of Open Source Health" annual report (authority play)

### Viral Loop
```
Free user grades repo → Gets shareable report card → Shares on Twitter/LinkedIn
→ Repo owner sees their grade → Signs up to improve score → Re-grades after fixes
→ Shares improvement → Loop repeats
```

## Implementation Roadmap

### Phase 1 — SaaS Foundation (1-2 weeks)
- [ ] PostgreSQL schema (users, orgs, scans, api_keys)
- [ ] GitHub OAuth login
- [ ] API key authentication
- [ ] Persistent scan storage (replace in-memory)
- [ ] User dashboard with history
- [ ] Free tier: 3 scans/mo rate limiting

### Phase 2 — Billing & Teams (1 week)
- [ ] Stripe integration (checkout + customer portal)
- [ ] Plan enforcement (scan limits per tier)
- [ ] Org/team management UI
- [ ] Invite members flow

### Phase 3 — CI/CD Integration (1 week)
- [ ] GitHub App (receive push + PR events)
- [ ] Auto-grade on push
- [ ] PR comment posting
- [ ] Webhook API

### Phase 4 — Enterprise (1 week)
- [ ] SSO/SAML
- [ ] Audit logging
- [ ] Dedicated instance (Docker Compose deploy)
- [ ] Usage analytics dashboard
- [ ] SLA monitoring
- [ ] Custom integrations API

## Summary: Why Grader Wins as Low-Cost SaaS

1. **Structural cost advantage** — One Gemini call per scan vs competitors needing full CI pipeline
2. **No per-seat pricing** — Grades repos, not developers. A 100-person team pays $29/mo not $1,800/mo
3. **Unique M&A feature set** — Valuation engine + ISO 5055 + OSS audit = no direct competitor at this price
4. **Viral distribution** — Shareable report cards drive organic growth
5. **AI-native, not legacy** — Built 2026, not 2011 (SonarQube/Code Climate). Not burdened by 15 years of legacy tooling

**Target: $9 → $29 → $99 monthly, 65-90% margins, zero per-seat friction.**
