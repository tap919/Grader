---
phase: 02-code-review
reviewed: 2026-05-26T12:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - Grader-main/src/App.tsx
  - Grader-main/src/main.tsx
  - Grader-main/src/types.ts
  - Grader-main/src/server/auth/github.ts
  - Grader-main/src/server/auth/jwt.ts
  - Grader-main/src/server/db/pool.ts
  - Grader-main/src/components/ScoreGauge.tsx
  - Grader-main/src/components/SecuritySection.tsx
  - Grader-main/src/components/QualitySection.tsx
  - Grader-main/src/components/MarketSection.tsx
  - Grader-main/src/components/QuickWinsList.tsx
  - Grader-main/src/components/ValuationCalculator.tsx
  - Grader-main/src/components/TeaserCongruence.tsx
  - Grader-main/src/components/ScoreBreakdown.tsx
  - Grader-main/src/components/RoadmapBoard.tsx
findings:
  critical: 3
  warning: 3
  info: 2
  total: 8
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-26T12:00:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

The review identified several critical security vulnerabilities, including hardcoded secrets and fragile database abstraction that presents a high risk of SQL injection due to manual query string manipulation. Code quality issues were also prevalent, specifically regarding the "God Component" pattern in `App.tsx` and inconsistent state management in sub-components, which degrades maintainability.

## Critical Issues

### CR-01: Hardcoded JWT Secret
**File:** `Grader-main/src/server/auth/jwt.ts:4`
**Issue:** The JWT secret is hardcoded with a fallback, which is a major security vulnerability in production environments if environment variables are not correctly set.
**Fix:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}
```

### CR-02: Hardcoded Callback URL
**File:** `Grader-main/src/server/auth/github.ts:14`
**Issue:** The GitHub callback URL is hardcoded to `http://localhost:3000`. This will break authentication in any deployed environment and constitutes an insecure configuration.
**Fix:**
Use an environment variable for the callback URL:
```typescript
callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/api/v1/auth/github/callback",
```

### CR-03: Fragile/Insecure SQL Translation
**File:** `Grader-main/src/server/db/pool.ts:121-126`
**Issue:** The `query` function attempts to manually translate PostgreSQL placeholders (`$1`) to SQLite placeholders (`?`) using regex. This is extremely brittle and insecure; it is trivial to bypass or introduce SQL injection vulnerabilities if complex queries are used (e.g., if placeholders appear inside string literals).
**Fix:**
Do not manually translate SQL. Use a robust database abstraction layer (like Knex.js or Prisma) or maintain two distinct query interfaces for PostgreSQL and SQLite that handle parameters correctly according to each driver's requirements.

## Warnings

### WR-01: Local State Management Data Loss
**File:** `Grader-main/src/components/QuickWinsList.tsx:11`
**Issue:** `completedWins` state is stored locally within the component. If the user navigates away and returns, their progress is lost.
**Fix:**
Lift the state up to a parent component (`App.tsx`) or persist it to the server/localStorage.

### WR-02: "God Component" Pattern
**File:** `Grader-main/src/App.tsx`
**Issue:** `App.tsx` handles everything: UI layout, state management, API calls, and complex data transformation/remediation logic. This violates separation of concerns, making the component unmaintainable.
**Fix:**
Refactor `App.tsx`. Extract API logic to services, state management to a context provider or store, and remediation logic to dedicated service functions.

### WR-03: Mixed SQL Dialects in Initialization
**File:** `Grader-main/src/server/db/pool.ts`
**Issue:** Mixing SQLite and PostgreSQL dialect initialization in `initDb` makes the code hard to maintain and prone to errors when schema changes occur.
**Fix:**
Separate the SQL definitions into dialect-specific migration files or use a migration framework (e.g., `db-migrate`).

## Info

### IN-01: Lack of Error Handling in Passport Callback
**File:** `Grader-main/src/server/auth/github.ts:52`
**Issue:** Errors in the passport strategy are caught and passed to `done(err)`, but there is no logging or audit trail of these authentication failures.
**Fix:**
Add logging for authentication errors.

### IN-02: Environmental Variable Dependency
**File:** `Grader-main/src/server/auth/github.ts:6`
**Issue:** The app relies on `process.env` with empty string fallbacks, which might lead to confusing runtime errors if `GITHUB_CLIENT_ID` is missing.
**Fix:**
Validate all required environment variables at application startup and fail fast if they are missing.

---
_Reviewed: 2026-05-26T12:00:00Z_
_Reviewer: OpenCode (gsd-code-reviewer)_
_Depth: standard_
