# Roadmap to 100% Deploy Readiness

**Current**: 30% | **Target**: 100%

---

## Phase 1: Foundation (2–3h) — Unblock everything

### 1.1 Supabase RLS + Production DB (45 min)
- Write RLS policies for BB-Tech/Northside Smoke compliance tables
- Create migration scripts
- Seed production DB with test data
- Verify access control with service vs anon keys

### 1.2 BB-Tech ↔ Northside Smoke Integration (30 min)
- Finalize the compliance review bridge (research → compliance UI → approval)
- Wire the Northside Smoke Playwright config with a proper npm test script
- Add `"test": "playwright test"` and `"test:e2e": "playwright test"` to Northside Smoke `package.json`

### 1.3 Governor Integration Wiring (30 min)
- Wire Deterministic-Brain Governor as API backend for Uplift-Venture
- Wire Governor as API backend for OpenHub
- Add health check endpoint to Governor

### 1.4 AetherDesk — Build Verification (30 min)
- Docker compose up — verify all services start
- Test API health endpoint
- Verify agent-ui connects to backend
- This is the riskiest — needs validation before Phase 2

---

## Phase 2: Per-Project Sprint (4–5h) — Ship each

### 2.1 Uplift-Venture — 95% → 100% (30 min)
- Add Firebase config (or stub for local-only mode)
- Add `VITE_GEMINI_API_KEY`, `VITE_OPENAI_API_KEY`, `VITE_DEEPSEEK_API_KEY` to `.env.local`
- `npm run build` — verify production bundle
- `npm run preview` — verify production serve
- **Deploy to Railway/Vercel**

### 2.2 UL2 — 90% → 100% (30 min)
- Lazy-load Firebase, Stripe modules in Vite config
- Verify build chunks < 500KB each
- Add `VITE_GEMINI_API_KEY` for ai-core
- Add `VITE_STRIPE_PUBLISHABLE_KEY`
- **Deploy to Vercel** (already has `vercel.json`)

### 2.3 OpenHub — 90% → 100% (45 min)
- Fix Workspace Terminal (connect to real backend shell)
- Lazy-load Monaco editor and XTerm in `WorkspacePage.tsx`
- Update Dockerfile for non-root user + health checks
- Configure persistent volumes for DB and repos
- **Deploy to Railway**

### 2.4 Deterministic-Brain — 95% → 100% (30 min)
- Create `run_dev.sh` / `run_dev.bat` for quick local start
- Verify `pip install -r requirements.txt` + `python main.py --serve`
- Test Governor routing with sample tasks
- Test policy gate evaluation
- Create Dockerfile + docker-compose
- **Deploy to Railway**

### 2.5 BB-Tech — 65% → 80% (60 min)
- `pip install -r requirements.txt` — verify
- `python run_demo.py` — verify demo runs
- Test Analytics Engine, BioBrief generation, ledger integration
- Complete Volume 1 & 3 Playbooks
- Build CIS interface (patient-facing)
- Create Dockerfile
- **Deploy to Railway**

### 2.6 AetherDesk — 60% → 80% (90 min)
- Copy `.env.example` → `.env` (verify all values for local dev)
- `docker-compose up -d` — verify services start
- Test API health endpoint, tenant creation, agent management
- Implement call routing logic
- Implement recording storage
- Implement billing integration
- Add HIPAA audit logging
- **Deploy to GKE**

---

## Phase 3: Quality Gate (2–3h) — Prove it works

### 3.1 E2E Compliance Flow (60 min)
- Write Playwright tests in Northside Smoke:
  - Create compliance review → route to BB-Tech → receive result → approve/reject
  - Full loop: age gate → login → research review → compliance decision
- Write Playwright tests in Uplift-Venture:
  - Governor route → policy evaluation → approval/rejection
  - Dashboard loads with research data

### 3.2 Integration Smoke Tests (30 min)
- Cross-project test: Uplift-Venture calls Governor, Governor routes to BB-Tech
- Verify all fallback chains (Gemma → Local → Cloud)
- Verify token tracking, cost accounting

### 3.3 Load Test Governor (30 min)
- Verify Governor handles concurrent requests
- Verify rate limiting works
- Verify oversigt mode switching (shadow/checkpoint/recovery)

---

## Phase 4: Polish & Exit Prep (2h) — Acquisition-ready

### 4.1 Documentation (45 min)
- Update all READMEs with deploy instructions
- Update DEPLOYMENT-READINESS.md with verified status
- Create architecture diagram showing all 6 projects, connections, ports
- Create one-page operations runbook (start/stop/health/backup)

### 4.2 Monitoring & Alerting (30 min)
- Add health check endpoints to all services
- Configure uptime monitoring (Upptime or similar)
- Add structured logging (JSON format) to all services

### 4.3 Security Hardening (45 min)
- Review all .env files — remove any hardcoded secrets
- Add CORS policies to all APIs
- Verify Firebase security rules
- Add rate limiting to exposed endpoints

---

## Summary

| Phase | Time | Outcome |
|-------|------|---------|
| 1. Foundation | 2–3h | All projects build, DB configured, Governor wired |
| 2. Per-Project | 4–5h | Every project deployable independently |
| 3. Quality Gate | 2–3h | E2E tests pass, integrations verified |
| 4. Polish | 2h | Docs, monitoring, security — exit-ready |
| **Total** | **10–13h** | **100% deploy readiness** |

Ordered by ROI:
1. Uplift-Venture deploy (fastest path to a live demo)
2. Governor integration (core acquisition asset)
3. OpenHub deploy (developer platform story)
4. E2E tests (proves it works — acquirer requirement)
5. Docs + polish (turns working into presentable)
