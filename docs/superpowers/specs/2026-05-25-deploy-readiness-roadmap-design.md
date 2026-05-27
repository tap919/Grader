# Deploy Readiness Roadmap — Design

**Date**: 2026-05-25
**Current State**: 30% deploy readiness
**Target**: 100% deploy readiness (deployable on demand)
**Approach**: Hybrid — cross-cutting foundation first, then per-project independently

---

## Phase 1: Foundation

Goal: Unblock shared infrastructure so per-project work can proceed in parallel.

### 1.1 Supabase RLS + Production DB

- Write RLS policies for compliance review tables (tenant isolation)
- Create migration scripts for existing schema
- Seed demo data for development and testing
- Verify service-role key vs anon-key access control

### 1.2 BB-Tech ↔ Northside Smoke Bridge

- Build compliance review view in Northside Smoke dashboard
  - Display research results from BB-Tech pipeline
  - Approve/reject actions for compliance officers
- Wire research completion → compliance UI → approve/reject flow
  - BB-Tech sends webhook or Northside Smoke polls on completion
- Compliance decision flows back to BB-Tech via Governor
- Add Playwright npm scripts to Northside Smoke `package.json`

### 1.3 Governor Integration Wiring

- Add health check endpoint to Deterministic-Brain Governor
- Wire Uplift-Venture to route decisions through Governor instead of managing providers independently
- Wire OpenHub to route through Governor
- Verify end-to-end with curl/Postman across all three services

### 1.4 AetherDesk Feature Completion

- Implement call routing logic
- Implement recording storage
- Implement billing integration
- Add HIPAA audit logging
- `docker-compose up` — verify all services start
- Test API health endpoint, tenant creation, agent management

---

## Phase 2: Per-Project Sprint

Goal: Every project independently deployable with a single command.

### 2.1 Uplift-Venture (Business OS)

- Firebase config (or stub for local-only mode)
- Add `VITE_GEMINI_API_KEY`, `VITE_OPENAI_API_KEY`, `VITE_DEEPSEEK_API_KEY` to `.env.local`
- `npm run build` — verify production bundle
- `npm run preview` — verify production serve
- Create Railway/Vercel deploy config

### 2.2 UL2 (Community Platform)

- Lazy-load Firebase, Stripe modules in `vite.config.ts`
- Verify build chunks < 500KB each
- Add `VITE_GEMINI_API_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`
- Deploy to Vercel (has `vercel.json` already)

### 2.3 OpenHub (Developer OS)

- Fix Workspace Terminal — connect to real backend shell
- Lazy-load Monaco editor and XTerm in `WorkspacePage.tsx`
- Update Dockerfile for non-root user + health checks
- Configure persistent volumes for DB + repos
- Railway deploy config

### 2.4 Deterministic-Brain (Governor)

- Create `run_dev.bat` / `run_dev.sh` for quick start
- Verify `pip install -r requirements.txt` + `python main.py --serve`
- Test Governor routing with sample tasks
- Test policy gate evaluation
- Dockerfile + docker-compose
- Railway deploy config

### 2.5 BB-Tech (THC/Hemp Research)

- `pip install -r requirements.txt` — verify
- `python run_demo.py` — verify demo runs
- Test Analytics Engine, BioBrief, ledger integration
- Focus research pipeline on THC/hemp use cases for Northside Smoke compliance
- Dockerfile
- Railway deploy config

### 2.6 AetherDesk (Call Center)

- Full feature completion: call routing, recording storage, billing, HIPAA logging
- Verify docker-compose starts all services
- Test API health endpoint, tenant creation, agent management
- GKE or Railway deploy config

---

## Phase 3: Quality Gate

Goal: Prove the integrated system works end-to-end.

### 3.1 E2E Compliance Flow

- Northside Smoke: create compliance review → route to BB-Tech → receive result → approve/reject
- Northside Smoke: age gate → login → research review → compliance decision
- Uplift-Venture: Governor route → policy evaluation → approval/rejection

### 3.2 Integration Smoke Tests

- Cross-project: Uplift-Venture calls Governor, Governor routes to BB-Tech
- Verify all fallback chains (Gemma → Local → Cloud)
- Verify token tracking and cost accounting across providers

### 3.3 Governor Load Test

- Verify concurrent request handling under load
- Verify rate limiting works
- Verify mode switching (shadow → checkpoint → recovery)
- Measure and record performance baselines for each service

---

## Phase 4: Polish & Exit Prep

Goal: Acquisition-ready — turns working into presentable.

### 4.1 Documentation

- Update all READMEs with deploy instructions
- Update `DEPLOYMENT-READINESS.md` with verified status
- Architecture diagram showing all 6 projects, connections, ports
- One-page operations runbook (start/stop/health/backup)
- Compliance documentation: SOC2/HIPAA readiness, data flow diagrams

### 4.2 Monitoring & Alerting

- Health check endpoints on all services
- Uptime monitoring config (Upptime or similar)
- Structured JSON logging on all services

### 4.3 Security Hardening

- Review all `.env` files — remove hardcoded secrets
- CORS policies on all APIs
- Firebase security rules review
- Rate limiting on exposed endpoints

---

## Effort Summary

| Phase | Sections | Estimated Time |
|-------|----------|---------------|
| 1. Foundation | 4 sub-sections | 3–4h |
| 2. Per-Project | 6 projects | 5–6h |
| 3. Quality Gate | 3 areas | 2–3h |
| 4. Polish & Exit Prep | 3 areas | 2–3h |
| **Total** | | **12–16h** |

## Key Principles

- **Deployable on demand** — every project builds, tests pass, deploy config exists. Not everything needs a live URL.
- **Foundation first** — shared infrastructure (Supabase, Governor wiring, AetherDesk) blocks per-project work.
- **All projects equal** — no favorites; every project gets to deployable.
- **Acquisition-ready output** — docs, compliance, monitoring are not afterthoughts.
