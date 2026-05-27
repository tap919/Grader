# Deploy Readiness Roadmap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Achieve 100% deploy readiness across all 6 portfolio projects — build clean, tests pass, deploy config exists, acquirer-ready.

**Architecture:** Hybrid approach — cross-cutting foundation first (Supabase RLS, BB-Tech/Northside Smoke bridge, Governor wiring, AetherDesk completion), then per-project independent sprints, followed by quality gates and acquisition-ready polish.

**Tech Stack:** TypeScript/React/Vite (frontends), Python/FastAPI (backends), Supabase (DB/auth), Docker (containerization), Playwright (E2E), Railway/Vercel/GKE (hosting)

---

## File Structure

Files to be created or modified across all 6 projects:

### New files
- `docs/compliance/data-flow-diagram.md`
- `docs/compliance/soc2-readiness.md`
- `docs/ops/runbook.md`
- `Northside Smoke/tests/e2e/compliance-flow.spec.ts`
- `Northside Smoke/tests/e2e/compliance-bridge-flow.spec.ts`
- `deterministic-brain-main/run_dev.sh`
- `deterministic-brain-main/run_dev.bat`
- `deterministic-brain-main/Dockerfile`
- `deterministic-brain-main/docker-compose.yml`
- `BB-Tech-main/Dockerfile`
- `Uplift-Venture-main/railway.json` (or vercel.json)
- `OpenHub-main/railway.json`

### Modified files
- Supabase migration files (RLS policies)
- `Northside Smoke/package.json` (add test scripts)
- `Northside Smoke/src/` (compliance review view)
- `deterministic-brain-main/` (health check endpoint)
- `Uplift-Venture-main/src/lib/aiCore.ts` (Governor routing)
- `OpenHub-main/src/` (Governor routing)
- `Uplift-Venture-main/.env.local` (API keys)
- `Uplift-Venture-main/vite.config.ts` (build verification)
- `UL2-main/vite.config.ts` (lazy loading)
- `UL2-main/.env` (API keys)
- `OpenHub-main/Dockerfile` (non-root, health checks)
- `OpenHub-main/docker-compose.yml` (persistent volumes)
- `aetherdesk_scaffold/` (call routing, recording, billing, HIPAA)
- `aetherdesk_scaffold/Dockerfile` (verify)
- All `.env` files (secret audit)

---

## Phase 1: Foundation

### Task 1: Supabase RLS + Production DB

**Files:**
- Create: `supabase/migrations/XXXX_add_rls_policies.sql`
- Modify: Supabase seed data config

- [ ] **Step 1: Write RLS policies for compliance tables**

```sql
-- Enable RLS on compliance tables
ALTER TABLE compliance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenant isolation: users can only see their tenant's data
CREATE POLICY tenant_isolation_compliance ON compliance_reviews
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation_research ON research_results
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation_audit ON audit_logs
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Service role can read/write all
CREATE POLICY service_role_all ON compliance_reviews
  FOR ALL USING (current_user = 'service_role');
```

- [ ] **Step 2: Run migration against local Supabase**

Run: `supabase db push` or execute SQL directly against local Postgres
Expected: All policies created without errors

- [ ] **Step 3: Seed demo data**

```sql
INSERT INTO tenants (id, name, slug) VALUES
  ('gen_uuid_v4_1', 'Demo Hemp Co', 'demo-hemp'),
  ('gen_uuid_v4_2', 'Test Compliance Inc', 'test-compliance');

INSERT INTO compliance_reviews (tenant_id, status, created_at) VALUES
  ('gen_uuid_v4_1', 'pending', NOW()),
  ('gen_uuid_v4_2', 'approved', NOW());
```

- [ ] **Step 4: Verify access control**

Run: Query with anon key → should only see own tenant data
Run: Query with service role key → should see all data
Expected: RLS enforces correctly

- [ ] **Step 5: Commit**

```
git add supabase/
git commit -m "feat: add RLS policies for compliance tables with tenant isolation"
```

---

### Task 2: Northside Smoke — Compliance Review View

**Files:**
- Modify: `Northside Smoke/src/` (create compliance review dashboard view)
- Test: `Northside Smoke/tests/e2e/compliance-bridge-flow.spec.ts`

- [ ] **Step 1: Investigate existing Northside Smoke UI structure**

Run: `ls Northside\ Smoke/src/` to understand component structure

- [ ] **Step 2: Build compliance review view**

Create a page/component that:
- Lists research results from BB-Tech pipeline awaiting compliance review
- Shows status lifecycle: PENDING → REVIEWING → APPROVED/REJECTED
- Provides approve/reject actions with comment field
- Fetches from Governor API or directly from BB-Tech

- [ ] **Step 3: Wire approve/reject to BB-Tech via Governor**

The compliance decision must flow: Northside Smoke UI → Governor API → BB-Tech pipeline

- [ ] **Step 4: Add Playwright npm scripts to package.json**

```json
"scripts": {
  "test": "playwright test",
  "test:e2e": "playwright test",
  "test:smoke": "playwright test --grep smoke"
}
```

- [ ] **Step 5: Commit**

```
git add Northside\ Smoke/
git commit -m "feat: add compliance review view and Playwright test scripts"
```

---

### Task 3: Governor Health Check + Wiring

**Files:**
- Modify: `deterministic-brain-main/api/server.py` (health check endpoint)
- Modify: `Uplift-Venture-main/src/lib/aiCore.ts` (Governor routing)
- Modify: `OpenHub-main/src/` (Governor routing)

- [ ] **Step 1: Add health check endpoint to Governor**

```python
@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
        "uptime_seconds": (datetime.now() - START_TIME).total_seconds(),
        "routes_available": len(router.routes),
    }
```

- [ ] **Step 2: Verify Governor starts and health responds**

Run: `python main.py --serve`
Run: `curl http://localhost:8000/health`
Expected: `{"status": "ok", ...}`

- [ ] **Step 3: Wire Uplift-Venture to route through Governor**

Modify `Uplift-Venture-main/src/lib/aiCore.ts` to call Governor API for routing decisions instead of managing providers independently:
- Add `GOVERNOR_API_URL` env var
- Replace local provider routing with `POST /governor/route` call
- Fall back to local ai-core if Governor unavailable

- [ ] **Step 4: Wire OpenHub to route through Governor**

Same pattern as step 3 for OpenHub's AI pipeline

- [ ] **Step 5: Verify end-to-end**

Run: Start Governor, UV, OpenHub
Run: Send a route request from UV → Governor → verify response
Run: Send a route request from OpenHub → Governor → verify response
Expected: Both projects route through Governor

- [ ] **Step 6: Commit**

```
git add deterministic-brain-main/ Uplift-Venture-main/ OpenHub-main/
git commit -m "feat: add Governor health endpoint, wire UV and OpenHub routing"
```

---

### Task 4: AetherDesk Feature Completion

**Files:**
- Modify: `aetherdesk_scaffold/apps/api/` (call routing, recording, billing, HIPAA)
- Modify: `aetherdesk_scaffold/config/` (feature flags)
- Verify: `aetherdesk_scaffold/Dockerfile`

- [ ] **Step 1: Investigate current AetherDesk architecture**

Read: `aetherdesk_scaffold/BUILD_SUMMARY.md`, `aetherdesk_scaffold/README.md`
Run: `ls aetherdesk_scaffold/apps/api/` to understand API structure

- [ ] **Step 2: Implement call routing logic**

Add endpoint to route incoming calls to available agents based on skills/queue

- [ ] **Step 3: Implement recording storage**

Add call recording capture and S3/local storage

- [ ] **Step 4: Implement billing integration**

Add per-minute billing tracking and invoice generation

- [ ] **Step 5: Add HIPAA audit logging**

Add structured audit log for all patient data access

- [ ] **Step 6: Verify docker-compose up**

Run: `cd aetherdesk_scaffold && docker-compose up -d`
Run: `curl http://localhost:8000/health`
Run: Test tenant creation, agent management endpoints
Expected: All services start, health responds

- [ ] **Step 7: Commit**

```
git add aetherdesk_scaffold/
git commit -m "feat: AetherDesk feature completion — call routing, recording, billing, HIPAA"
```

---

## Phase 2: Per-Project Sprint

### Task 5: Uplift-Venture — Deploy Ready

**Files:**
- Modify: `Uplift-Venture-main/.env.local` (add API keys)
- Modify: `Uplift-Venture-main/vite.config.ts` (verify build config)
- Create: `Uplift-Venture-main/railway.json` or vercel config

- [ ] **Step 1: Add required API keys to .env.local**

```
VITE_GEMINI_API_KEY=your_key_here
VITE_OPENAI_API_KEY=your_key_here
VITE_DEEPSEEK_API_KEY=your_key_here
```

- [ ] **Step 2: Verify production build**

Run: `cd Uplift-Venture-main && npm run build`
Expected: Build succeeds, output in `dist/`

- [ ] **Step 3: Verify production serve**

Run: `cd Uplift-Venture-main && npm run preview`
Run: Open `http://localhost:4173` — verify frontend loads
Expected: App renders without errors

- [ ] **Step 4: Create Railway deploy config**

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "healthCheckPath": "/",
    "restartPolicyType": "on_failure"
  }
}
```

- [ ] **Step 5: Commit**

```
git add Uplift-Venture-main/
git commit -m "feat: Uplift-Venture deploy ready — build verified, Railway config"
```

---

### Task 6: UL2 — Optimization + Deploy Ready

**Files:**
- Modify: `UL2-main/vite.config.ts` (lazy loading)
- Modify: `UL2-main/.env` (add API keys)

- [ ] **Step 1: Add lazy loading for Firebase and Stripe**

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
      },
    },
  },
},
```

- [ ] **Step 2: Verify chunk sizes**

Run: `cd UL2-main && npm run build`
Check: Each chunk < 500KB
Expected: Build succeeds, manageable chunks

- [ ] **Step 3: Add required API keys to .env**

```
VITE_GEMINI_API_KEY=your_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_key_here
```

- [ ] **Step 4: Commit**

```
git add UL2-main/
git commit -m "feat: UL2 deploy ready — lazy loading, chunk optimization, API keys"
```

---

### Task 7: OpenHub — Terminal + Docker

**Files:**
- Modify: `OpenHub-main/src/` (Workspace Terminal fix, lazy load Monaco/XTerm)
- Modify: `OpenHub-main/Dockerfile` (non-root, health checks)
- Modify: `OpenHub-main/docker-compose.yml` (persistent volumes)
- Create: `OpenHub-main/railway.json`

- [ ] **Step 1: Lazy-load Monaco and XTerm**

```typescript
const MonacoEditor = React.lazy(() => import('@monaco-editor/react'));
const XTerm = React.lazy(() => import('./components/Terminal'));
```

Wrap in `<Suspense>` in `WorkspacePage.tsx`

- [ ] **Step 2: Fix Workspace Terminal**

Connect terminal in `src/components/Terminal.tsx` to real backend shell (pty/node-pty or WebSocket to server)

- [ ] **Step 3: Update Dockerfile for non-root + health**

```dockerfile
RUN addgroup --system app && adduser --system --ingroup app app
USER app
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1))"
```

- [ ] **Step 4: Configure persistent volumes in docker-compose**

```yaml
volumes:
  db-data:
  repo-data:

services:
  app:
    volumes:
      - db-data:/app/data
      - repo-data:/app/repos
```

- [ ] **Step 5: Commit**

```
git add OpenHub-main/
git commit -m "feat: OpenHub deploy ready — terminal fix, lazy loading, Docker security"
```

---

### Task 8: Deterministic-Brain — Docker + Deploy Ready

**Files:**
- Create: `deterministic-brain-main/run_dev.sh`
- Create: `deterministic-brain-main/run_dev.bat`
- Create: `deterministic-brain-main/Dockerfile`
- Create: `deterministic-brain-main/docker-compose.yml`

- [ ] **Step 1: Create run_dev.bat**

```batch
@echo off
echo Installing dependencies...
pip install -r requirements.txt
echo Starting Deterministic-Brain server...
python main.py --serve
```

- [ ] **Step 2: Create run_dev.sh**

```bash
#!/bin/bash
pip install -r requirements.txt
python main.py --serve
```

- [ ] **Step 3: Create Dockerfile**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py", "--serve"]
```

- [ ] **Step 4: Create docker-compose.yml**

```yaml
version: '3.8'
services:
  dbrain:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

- [ ] **Step 5: Verify pip install + server start**

Run: `pip install -r requirements.txt`
Run: `python main.py --serve`
Run: `curl http://localhost:8000/health`
Expected: All imports succeed, server starts, health responds

- [ ] **Step 6: Commit**

```
git add deterministic-brain-main/
git commit -m "feat: DBrain deploy ready — Docker, dev scripts, verified startup"
```

---

### Task 9: BB-Tech — Docker + Deploy Ready

**Files:**
- Create: `BB-Tech-main/Dockerfile`

- [ ] **Step 1: Verify pip install + demo runs**

Run: `pip install -r BB-Tech-main/requirements.txt`
Run: `python BB-Tech-main/run_demo.py`
Expected: Demo runs without errors

- [ ] **Step 2: Verify core modules work**

Run: Test Analytics Engine, BioBrief, ledger integration
Expected: No import errors, basic functionality works

- [ ] **Step 3: Create Dockerfile**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8005
CMD ["python", "run_demo.py"]
```

- [ ] **Step 4: Commit**

```
git add BB-Tech-main/
git commit -m "feat: BB-Tech deploy ready — Docker, verified demo"
```

---

### Task 10: AetherDesk — Docker + Deploy Ready

**Files:**
- Verify: `aetherdesk_scaffold/Dockerfile`
- Verify: `aetherdesk_scaffold/docker-compose.yml`

- [ ] **Step 1: Verify Docker build**

Run: `cd aetherdesk_scaffold && docker-compose build`
Expected: All services build without errors

- [ ] **Step 2: Verify all services start**

Run: `cd aetherdesk_scaffold && docker-compose up -d`
Run: `docker-compose ps`
Expected: All containers show "Up" status

- [ ] **Step 3: Verify health endpoint**

Run: `curl http://localhost:8000/health`
Expected: Returns 200 OK

- [ ] **Step 4: Test tenant creation + agent management**

Run: API calls to create tenant, list agents, etc.
Expected: CRUD operations work

- [ ] **Step 5: Commit**

```
git add aetherdesk_scaffold/
git commit -m "feat: AetherDesk deploy ready — Docker verified, services working"
```

---

## Phase 3: Quality Gate

### Task 11: E2E Compliance Flow Tests

**Files:**
- Create: `Northside Smoke/tests/e2e/compliance-flow.spec.ts`
- Modify: `Uplift-Venture-main/e2e/` or create test

- [ ] **Step 1: Write compliance flow test**

```typescript
// Northside Smoke/tests/e2e/compliance-flow.spec.ts
import { test, expect } from '@playwright/test';

test('compliance review full cycle', async ({ page }) => {
  // Age gate
  await page.goto('/');
  await page.fill('[data-testid="age-input"]', '21');
  await page.click('[data-testid="age-verify"]');
  
  // Login
  await page.fill('[data-testid="email"]', 'admin@northside-smoke.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-btn"]');
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  
  // Navigate to compliance review
  await page.click('[data-testid="compliance-tab"]');
  await expect(page.locator('[data-testid="pending-reviews"]')).toBeVisible();
  
  // Approve a review
  await page.click('[data-testid="review-item-1"]');
  await page.click('[data-testid="approve-btn"]');
  await page.fill('[data-testid="comment-input"]', 'Compliance checks passed');
  await page.click('[data-testid="confirm-btn"]');
  await expect(page.locator('[data-testid="status-approved"]')).toBeVisible();
});
```

- [ ] **Step 2: Run the test**

Run: `cd Northside\ Smoke && npx playwright test tests/e2e/compliance-flow.spec.ts`
Expected: Test passes

- [ ] **Step 3: Write Governor routing test**

Test that Uplift-Venture → Governor → BB-Tech routing works end-to-end

- [ ] **Step 4: Run all E2E tests**

Run: `cd Northside\ Smoke && npx playwright test`
Run: `cd Uplift-Venture-main && npm test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```
git add Northside\ Smoke/ Uplift-Venture-main/
git commit -m "test: add E2E compliance flow tests"
```

---

### Task 12: Integration Smoke Tests + Performance Baselines

**Files:**
- Create/modify: test files for cross-project integration

- [ ] **Step 1: Verify fallback chains**

Test that Gemma → Local → Cloud fallback works when Gemma is unavailable

- [ ] **Step 2: Verify token tracking + cost accounting**

Verify `tokensUsed` and `costUsd` are reported correctly across all providers

- [ ] **Step 3: Governor load test**

Run: Concurrent requests to Governor `/route` endpoint
Verify: Rate limiting triggers, responses are correct, no crashes

- [ ] **Step 4: Record performance baselines**

Measure and record: response time per endpoint, throughput, error rate

- [ ] **Step 5: Commit**

```
git commit -m "test: integration smoke tests + performance baselines"
```

---

## Phase 4: Polish & Exit Prep

### Task 13: Documentation

**Files:**
- Modify: All READMEs
- Modify: `DEPLOYMENT-READINESS.md`
- Create: `docs/ops/runbook.md`
- Create: `docs/compliance/data-flow-diagram.md`
- Create: `docs/compliance/soc2-readiness.md`

- [ ] **Step 1: Update all READMEs with deploy instructions**

Each README gets: prereqs, install, run dev, build, deploy, env vars table

- [ ] **Step 2: Update DEPLOYMENT-READINESS.md**

Update status table with verified deploy readiness % for each project

- [ ] **Step 3: Create ops runbook**

One page: how to start/stop/health-check/backup each service

- [ ] **Step 4: Create compliance docs**

Data flow diagrams showing how data moves between projects
SOC2/HIPAA readiness assessment

- [ ] **Step 5: Commit**

```
git add docs/ README.md DEPLOYMENT-READINESS.md
git commit -m "docs: acquisition-ready documentation — runbook, compliance, deploy status"
```

---

### Task 14: Monitoring + Security Hardening

**Files:**
- Modify: All services (health check endpoints)
- Modify: All `.env` files (remove secrets)

- [ ] **Step 1: Add health check endpoints where missing**

Each service should respond to `GET /health` with status, version, uptime

- [ ] **Step 2: Review all .env files for hardcoded secrets**

Remove any API keys, passwords, or secrets hardcoded in `.env` files
Replace with placeholder values and document required env vars

- [ ] **Step 3: Add CORS policies**

Ensure all APIs have explicit CORS configuration

- [ ] **Step 4: Add rate limiting**

Ensure exposed endpoints have rate limiting configured

- [ ] **Step 5: Commit**

```
git commit -m "security: monitoring endpoints, CORS, rate limiting, secret cleanup"
```
