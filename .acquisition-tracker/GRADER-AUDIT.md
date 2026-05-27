# Grader — Audit & Fix Plan

## Current State (Pre-Fix)

| Category | Status | Notes |
|----------|--------|-------|
| **Build** | ✅ Passes | Vite + esbuild + tsc --noEmit all pass |
| **Tests** | ❌ NONE | Zero test files, zero test dependencies |
| **Env Config** | ⚠️ Partial | `.env.example` exists, no production config |
| **Docker** | ❌ NONE | No Dockerfile, no docker-compose |
| **CI/CD** | ❌ NONE | No GitHub Actions, no deploy pipeline |
| **Portfolio Tracking** | ❌ NONE | Not listed in PROGRESS.md or tracker |
| **Package Lock** | ❌ NONE | No `package-lock.json` committed |
| **README** | ❌ Generic | AI Studio template, not project-specific |
| **Monitoring/Observability** | ❌ NONE | No logging framework, no error tracking |
| **API Hardening** | ⚠️ Minimal | No rate limiting, no CORS, no Helmet |

## Fix Plan (Ordered Execution)

### Phase 1: Foundation (15 min)
- [x] 1.1 Add Grader to acquisition tracker (PROGRESS.md, DAILY-LOG.md, INSIGHTS.md)
- [ ] 1.2 Rename package from `react-example` → `grader`
- [ ] 1.3 Rewrite README with project-specific docs
- [ ] 1.4 Add `.gitignore` entries for `dist/`, `.env`

### Phase 2: Testing (30 min)
- [ ] 2.1 Install Vitest + React Testing Library
- [ ] 2.2 Unit tests for `parseRepoInput()` in server.ts
- [ ] 2.3 Unit tests for `getGenAI()` edge cases (no key)
- [ ] 2.4 Component smoke tests for top-level components

### Phase 3: Docker & Production Config (20 min)
- [x] 3.1 Create production `Dockerfile` (multi-stage)
- [x] 3.2 Create `docker-compose.yml` with env vars
- [x] 3.3 Add `helmet`, `cors`, rate limiting middleware

### Phase 4: CI/CD & Polish (20 min)
- [x] 4.1 Add GitHub Actions workflow (test + build)
- [x] 4.2 Add health check endpoint
- [x] 4.3 Generate + commit `package-lock.json`

### Phase 5: Code Quality (optional, 30 min)
- [ ] 5.1 Split large App.tsx into smaller modules
- [ ] 5.2 Add persistent scan history (SQLite or file-based)

## SaaS Audit Referenced
A full SaaS product audit is in `GRADER-SAAS-AUDIT.md`. Key findings:
- **Structural pricing advantage**: Grades repos not devs → no per-seat pricing
- **Unique features**: valuation engine, ISO 5055, market benchmarking — no competitor matches
- **Cost per scan**: ~$0.12-0.32 (Gemini API)
- **Pricing**: Free → $9 → $29 → $99/mo
- **Build estimate**: 4-5 weeks to MVP SaaS

## Current State Assessment

**Deployment Infrastructure**: ✅ Ready (Docker, CI/CD, health checks, env config)
**Product Integrity**: ⚠️ Needs Improvement (per code review feedback)

## Target: Production-Ready Product with Integrity

| Category | Target State |
|----------|-------------|
| **Build** | ✅ Passing (already ✅) |
| **Tests** | ✅ Vitest suite, ≥80% coverage |
| **Docker** | ✅ Multi-stage Dockerfile + compose |
| **Env** | ✅ Production .env template + docs |
| **SaaS Features** | ✅ Rate-limited, CORS-secured, health-checked |
| **CI/CD** | ✅ GitHub Actions (test → build → deploy) |
| **Portfolio** | ✅ Tracked in acquisition tracker |
| **Data Honesty** | ✅ No fake/mock data, transparent fallbacks |
| **Type Safety** | ✅ Minimal `any` usage, proper validation |
| **Backend Auth** | ✅ Authenticated GitHub API calls |
| **AI Validation** | ✅ Schema validation for model outputs |
| **UI Integrity** | ✅ No overpromising, clear demo/production boundaries |
| **Compliance Claims** | ✅ Traceable, verifiable logic for certifications |
