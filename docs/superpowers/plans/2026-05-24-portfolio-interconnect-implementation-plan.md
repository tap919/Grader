# Portfolio Interconnect — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the daily autonomous operational loop connecting Deterministic Brain, AetherDesk, and OpenHub per the 2026-05-24 spec.

**Architecture:** Executive Kernel orchestrates via adapter layer over AetherDesk/OpenHub APIs. State Ledger provides persistent idempotency, event storage, and recovery. Daily loop follows REVIEW → PLAN → STAGE → LAUNCH → OBSERVE → RECONCILE.

**Tech Stack:** Python 3.10+, FastAPI, httpx, pytest, deterministic-brain (agi/ + adapters/)

---

## Phase 0: Scaffold

**Files:**
- Create: `deterministic-brain/ledger/__init__.py`
- Create: `deterministic-brain/adapters/__init__.py`
- Create: `.acquisition-tracker/events/.gitkeep`
- Create: `.acquisition-tracker/daily-plans/.gitkeep`
- Create: `.acquisition-tracker/campaigns/.gitkeep`
- Create: `.acquisition-tracker/overrides/.gitkeep`

- [ ] **Step 1: Create directory structure**
- [ ] **Step 2: Create `__init__.py` files**
- [ ] **Step 3: Verify with a bare import**

---

## Phase 1: State Ledger

**Files:**
- Create: `deterministic-brain/ledger/core.py`
- Modify: `deterministic-brain/ledger/__init__.py`

- [ ] **Step 1: Write `ledger/core.py`**
  - `write_event()`, `read_events()`
  - `write_daily_plan()`, `read_daily_plan()`
  - `write_active_campaigns()`, `read_active_campaigns()`
  - Idempotency: `get_cached_response()`, `mark_response_seen()`
  - Override: `is_manual_pause_active()`
  - `_to_jsonable()`, `_ensure_dirs()`

- [ ] **Step 2: Write `ledger/__init__.py` re-exports**

- [ ] **Step 3: Write unit tests**
  - Test `write_event` + `read_events` round-trip
  - Test `write_daily_plan` + `read_daily_plan`
  - Test idempotency persistence survives reload
  - Test idempotency file is created correctly

- [ ] **Step 4: Run tests and verify**

---

## Phase 2: BaseAdapter

**Files:**
- Create: `deterministic-brain/adapters/base.py`

- [ ] **Step 1: Write `base.py`**
  - `LRUCache` class
  - `AdapterCallResult` dataclass
  - `BaseAdapter` with `call_with_idempotency()`
  - Idempotency: LRU cache → persistent ledger → outbound call → persist

- [ ] **Step 2: Write unit tests**
  - Test duplicate commands return cached (LRU hit)
  - Test duplicate commands return cached (Ledger hit after restart)
  - Test retries on failure
  - Test LRU eviction

- [ ] **Step 3: Run tests**

---

## Phase 3: AetherDeskAdapter

**Files:**
- Create: `deterministic-brain/adapters/aetherdesk.py`

- [ ] **Step 1: Write `aetherdesk.py`**
  - `CampaignConfig`, `CampaignStatus`, `CallEvent`, `UsageReport`, `CampaignStats` dataclasses
  - `AetherDeskAdapter(BaseAdapter)` with:
    - `health()`
    - `get_campaign_stats()`
    - `get_usage_and_billing()`
    - `get_call_outcomes(since)`
    - `validate_lead_inventory()`
    - `launch_campaign()` with idempotency, emits campaign_launch event

- [ ] **Step 2: Write unit tests with httpx mocked**
  - Test each method returns correct dataclass
  - Test `launch_campaign` idempotency
  - Test `launch_campaign` writes event to Ledger
  - Test health check

- [ ] **Step 3: Run tests**

---

## Phase 4: OpenHubAdapter

- [ ] Create `adapters/openhub.py`
- [ ] Implement `get_pipeline_status()`
- [ ] Implement `get_project_velocity(since)`
- [ ] Implement `trigger_pipeline(spec, idempotency_key)`
- [ ] Write unit tests

---

## Phase 5: Decision Engine

- [ ] Create `agi/decision_engine.py`
- [ ] Implement `review()` — reads tracker + adapters
- [ ] Implement `plan()` — produces DailyPlan
- [ ] Write unit tests

---

## Phase 6: Daily Loop Orchestrator + Reconciler

- [ ] Create `agi/reconciler.py`
- [ ] Create `agi/daily_orchestrator.py`
- [ ] Implement `run_review()`, `run_plan()`, `run_stage()`, `run_launch()`, `run_observe()`, `run_reconcile()`
- [ ] Wire into Executive Kernel
- [ ] Write integration tests

---

## Phase 7: Recovery + Overrides + Scheduler

- [ ] Implement bootstrap routine
- [ ] Implement manual override checking
- [ ] Schedule via autonomous_scheduler
- [ ] Wire cron/systemd
- [ ] Document operator runbook
