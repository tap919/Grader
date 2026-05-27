# Portfolio Interconnect: Deterministic-Brain × AetherDesk × OpenHub

> **Status:** Design — ready for review
> **Date:** 2026-05-24
> **Acquisition Context:** This spec defines the daily operational loop that makes the portfolio autonomously sell itself, track itself, and improve itself. If acquired, this integration layer is the moat — an acquirer cannot run any single asset without reimplementing the cross-system orchestration.

---

## 1. System Boundaries & Source-of-Truth Rules

| Asset | Owns | Interface | Source of Truth |
|-------|------|-----------|----------------|
| **Deterministic Brain** | Decisions, plans, orchestration, learning | Adapter layer + event bus + scheduler | `.brain_state/` + Executive Kernel goals |
| **AetherDesk** | Call facts (dials, outcomes, recordings, agent usage) | REST API + WebSocket + webhooks | AetherDesk database + call logs |
| **OpenHub** | Development pipeline, project status, code metrics | WebSocket + REST + MCP | OpenHub database + git state |
| **Acquisition Tracker** | Historical operating memory, portfolio pulse | File-based (`.acquisition-tracker/`) | Git-tracked files |

**Hard rule:** No asset reads another asset's database directly. All communication goes through the adapter layer.

### KPI Ownership

| Metric | Owned By | Accessed Via |
|--------|----------|-------------|
| Call facts (dials, outcomes, recordings) | AetherDesk | Adapter → AetherDesk API |
| Decisions, plans, orchestration state | Deterministic Brain | Executive Kernel + State Ledger |
| Historical operating memory | Acquisition Tracker | `.acquisition-tracker/` files |
| Development velocity, pipeline state | OpenHub | Adapter → OpenHub API/WS |

This separation prevents "who is the source of truth?" drift. AetherDesk reports what happened. The Brain logs what it decided. The tracker records what the portfolio looked like.

---

## 2. Canonical Message Contract

Every command and event between systems uses this shape:

```json
{
  "message_type": "command",
  "command": "trigger_campaign",
  "target_system": "aetherdesk",
  "source_system": "deterministic-brain",
  "idempotency_key": "campaign-20260525-001",
  "correlation_id": "exec-goal-MAY-001-3",
  "scheduled_at": "2026-05-25T08:00:00Z",
  "expires_at": "2026-05-25T23:59:59Z",
  "payload": {
    "profile_id": "PROF-META-SALES",
    "max_concurrent": 3,
    "delay_between_calls": 10.0,
    "filter_status": "new",
    "lead_limit": 50
  },
  "expected_effect": {
    "leads_queued": { "gte": 1 }
  },
  "observed_effect": null,
  "status": "scheduled",
  "error": null,
  "stop_conditions": {
    "max_concurrent_campaigns": 3,
    "min_answer_rate": 0.20,
    "max_attempts_per_lead": 3,
    "quiet_hours": { "dow": ["sun"], "start": "21:00", "end": "08:00" }
  }
}
```

**Status values:** `scheduled` → `staged` → `launched` → `running` → `completed` / `failed` / `paused` / `cancelled`

**Idempotency:** Every command has a unique `idempotency_key`. The adapter stores seen keys in the State Ledger (persistent) with an in-memory LRU cache as a fast-path performance layer. This survives brain restarts — on startup, the adapter loads recent idempotency keys from the ledger. Retries with the same key return the cached response, never a duplicate action.

---

**Repository Alignment:** This spec targets the working branch layout at `deterministic-brain-main/` with `agi/`, `adapters/`, and `acquisition_bridge.py`. The public repo structs `brain/`, `orchestration/`, `features/scheduler.py`, and `features/systems_bridge.py` are existing modules; new files in `adapters/` and `agi/` will integrate with them without modifying their internals.

---

## 3. Explicit Event Schema Examples

### Example 1: PlanCampaign Command

```json
{
  "message_type": "command",
  "command": "plan_campaign",
  "target_system": "aetherdesk",
  "source_system": "deterministic-brain",
  "idempotency_key": "plan-20260525-001",
  "correlation_id": "exec-goal-MAY-001-3",
  "scheduled_at": "2026-05-25T00:00:00Z",
  "expires_at": "2026-05-25T01:00:00Z",
  "payload": {
    "profile_id": "PROF-META-SALES",
    "max_concurrent": 3,
    "delay_between_calls": 10.0,
    "filter_status": "new",
    "lead_limit": 50,
    "territory": "us-east"
  },
  "expected_effect": { "leads_queued": { "gte": 1 }, "campaign_id": { "exists": true } },
  "status": "scheduled"
}
```

### Example 2: CallCompleted Event (from AetherDesk → Brain)

AetherDesk sends this via zero-trust webhook on each call completion:

```json
{
  "message_type": "event",
  "event_type": "call_completed",
  "source_system": "aetherdesk",
  "correlation_id": "campaign-20260525-001",
  "timestamp": "2026-05-25T09:15:23Z",
  "payload": {
    "call_id": "CC-A1B2C3D4",
    "lead_id": "LEAD-TEST-001",
    "outcome": "interested",
    "duration_seconds": 187,
    "profile_used": "PROF-META-SALES",
    "answered": true,
    "voicemail": false,
    "call_sid": "CA-abc123"
  },
  "observed_effect": {
    "lead_status": "interested",
    "conversion_probability": 0.4
  }
}
```

### Example 3: DayClosed Reconciled Summary

Generated by the Reconciler at 22:00:

```json
{
  "message_type": "event",
  "event_type": "day_closed",
  "source_system": "deterministic-brain",
  "correlation_id": "exec-goal-MAY-001",
  "timestamp": "2026-05-25T22:00:00Z",
  "payload": {
    "date": "2026-05-25",
    "plan_id": "daily-plans/2026-05-25-plan.json",
    "campaigns_launched": 1,
    "campaigns_completed": 0,
    "calls_attempted": 45,
    "calls_answered": 12,
    "voicemails": 8,
    "interested": 3,
    "converted": 0,
    "total_duration_minutes": 34.2,
    "answer_rate": 0.27,
    "conversion_rate": 0.0,
    "total_cost": 0.51,
    "drift_items": [
      { "field": "calls_attempted", "expected": 50, "observed": 45, "delta": -5 },
      { "field": "interested", "expected": 5, "observed": 3, "delta": -2 }
    ]
  }
}
```

```
                    ┌──────────────┐
                    │  IDLE        │
                    │  (overnight) │
                    └──────┬───────┘
                           │ 23:00
                           ▼
                    ┌──────────────┐
               ────▶│  REVIEW      │◀──── events (failed deploy,
              │     │  (read state)│      new test results)
              │     └──────┬───────┘
              │            │
              │     ┌──────▼───────┐
              │     │  PLAN        │
              │     │  (decide)    │
              │     └──────┬───────┘
              │            │ 01:00
              │     ┌──────▼───────┐
              │     │  STAGE       │
              │     │  (prepare)   │
              │     └──────┬───────┘
              │            │ 08:00
              │     ┌──────▼───────┐
              │     │  LAUNCH      │◀──── events (answer rate ↓
              │     │  (execute)   │      deploy failure, etc.)
              │     └──────┬───────┘
              │            │
              │     ┌──────▼───────┐
              │     │  OBSERVE     │
              │     │  (all day)   │
              │     └──────┬───────┘
              │            │ 22:00
              │     ┌──────▼───────┐
              │     │  RECONCILE   │
              │     │  (verify)    │──▶ drift? → corrective actions
              │     └──────┬───────┘
              │            │
              └────────────┘
```

**Phase details:**

### REVIEW (23:00)
- Read `AGENDA.md`, `PROGRESS.md`, `METRICS.md`, `DAILY-LOG.md` from tracker
- Read AetherDesk `/campaign/stats` (today's call outcomes via adapter)
- Read OpenHub pipeline state (running builds, queued tasks)
- Compute: remaining lead budget, campaign ROI pace, development velocity
- Output: `daily_context` dict for the Decision Engine

### PLAN (00:00)
- Decision Engine produces a versioned daily plan object:
  - Campaigns: which profiles, how many leads, which territories
  - OpenHub priorities: what the dev pipeline should focus on
  - Stop conditions: answer rate floor, max concurrent, quiet hours
  - Expected effects: leads queued, calls completed, outcomes
- Plan is written to State Ledger as `daily-plans/2026-05-25-plan.json`
- Plan has a `plan_id` used as correlation ID prefix for all commands

### STAGE (01:00)
- AetherDesk Adapter pushes leads + campaign configs to AetherDesk
- Validates acceptance response from AetherDesk
- Stores campaign IDs and idempotency tokens in State Ledger
- If staging fails (e.g., API down), defers launch and logs deterministic reason code

### LAUNCH (08:00)
- AetherDesk Adapter triggers only campaigns still marked `staged`
- If lead inventory is 0 or prerequisites failed, defer with reason code
- Trigger sends: `POST /campaign/launch` with idempotency key
- Event bus notifies OpenHub that a sales campaign is live

### OBSERVE (all day)
- Continuously consume events:
  - **AetherDesk → Brain:** Call outcome webhooks + WebSocket events (answered, voicemail, interested, converted)
  - **OpenHub → Brain:** Pipeline completions, deploy successes/failures, test results
- **Event-driven mid-cycle actions:**
  - Answer rate < 20% → auto-pause campaign, notify kernel
  - Lead inventory exhausted → mark campaign completed, alert
  - Deploy failure → bump priority in next plan
- All events appended to State Ledger with correlation IDs

### RECONCILE (22:00)
- Poll AetherDesk `/campaign/stats` for daily summary
- Poll AetherDesk `/api/v1/usage` and `/api/v1/billing` for cost data
- Compare observed vs expected effects from the daily plan
- Compute drift: did we dial what we planned? Did costs match predictions?
- Write reconciled results to State Ledger
- Emit learning inputs: which campaign profiles performed best, which territories converted best
- Self-learning loop records outcomes

### Daily Loop Pseudo-Code

```python
# Kernel entry point — called by the autonomous scheduler on a timer
async def run_daily_loop():
    """Full 24-hour autonomous cycle."""

    # ── REVIEW ──
    state = {
        "tracker": read_acquisition_tracker(),
        "aetherdesk": await adapters.aetherdesk.get_campaign_stats(),
        "openhub": await adapters.openhub.get_pipeline_status(),
    }
    context = decision_engine.review(state)

    # ── PLAN ──
    plan = decision_engine.plan(context)
    plan_id = write_state_ledger("daily-plans", f"{today()}-plan.json", plan.to_dict())
    mark_state("PLANNING")

    # ── STAGE ──
    for campaign in plan.campaigns:
        result = await adapters.aetherdesk.stage_campaign(campaign)
        if result.status == "accepted":
            campaign.status = "staged"
            record_event("campaign_staged", campaign)
        else:
            campaign.status = "deferred"
            record_event("campaign_deferred", {"reason": result.reason})
    mark_state("STAGED")

    # ── LAUNCH (at 08:00 or when stop conditions pass) ──
    if time_now() >= config.launch_time and all_preflight_checks_pass():
        for campaign in plan.campaigns.filter(status="staged"):
            result = await adapters.aetherdesk.launch_campaign(
                campaign, idempotency_key=f"{plan_id}-{campaign.id}"
            )
            record_event("campaign_launched", {"campaign_id": campaign.id, "result": result})
    mark_state("RUNNING")

    # ── OBSERVE (event loop, runs until 22:00 or stop condition) ──
    while not reconcile_due():
        event = await event_bus.next_event(timeout=30.0)
        if event:
            record_event(event.type, event.payload)
            # Mid-cycle stop condition check
            if event.type == "call_completed":
                stats = compute_live_stats(await adapters.aetherdesk.get_campaign_stats())
                if stats.answer_rate < config.min_answer_rate:
                    await adapters.aetherdesk.pause_campaign(campaign.id)
                    record_event("campaign_paused", {"reason": "answer_rate_below_threshold"})

    # ── RECONCILE ──
    actual = {
        "aetherdesk": await adapters.aetherdesk.get_campaign_stats(),
        "usage": await adapters.aetherdesk.get_usage_and_billing(),
        "openhub": await adapters.openhub.get_project_velocity(since=plan.created_at),
    }
    drift = reconciler.compare(plan.to_dict(), actual)
    reconciler.write_drift_report(drift)
    reconciler.emit_learning_inputs(drift, plan)
    mark_state("RECONCILED")
```

---

## 4. Daily State Machine

### 4.1 Decision Engine

Located in `deterministic-brain/agi/decision_engine.py`

```python
class DecisionEngine:
    def review(self, tracker_state: dict, aetherdesk_summary: dict, openhub_summary: dict) -> DailyContext:
        ...
    def plan(self, context: DailyContext) -> DailyPlan:
        ...
```

Inputs are read-only snapshots from the adapter layer and tracker. The engine does NOT call APIs directly — it receives pre-processed state.

### 4.2 Adapter Layer

Located in `deterministic-brain/adapters/`

```
adapters/
├── __init__.py
├── base.py           # BaseAdapter with idempotency, retry, logging
├── aetherdesk.py     # AetherDeskAdapter: campaign, leads, outcomes, webhooks
└── openhub.py        # OpenHubAdapter: pipeline status, projects, velocity
```

**BaseAdapter responsibilities:**
- Idempotency: writes seen idempotency keys to State Ledger on use; in-memory LRU cache as fast path. On startup, hydrates cache from recent ledger entries.
- Retry: exponential backoff for transient failures (3 attempts, 2x backoff)
- Timeout: default 30s per call, configurable per adapter
- Health check: exposes `health()` per adapter for kernel monitoring
- Logging: every call logged to State Ledger with correlation_id

**AetherDeskAdapter (key methods):**

```python
class AetherDeskAdapter(BaseAdapter):
    async def load_leads(self, count: int, territory: str = None, tenant_id: str = "TENANT-001") -> LeadLoadResult:
        """Import fresh leads into AetherDesk. Idempotent batch."""
    async def launch_campaign(self, config: CampaignConfig, idempotency_key: str) -> CampaignStatus:
        """Trigger campaign launch. Duplicate key returns cached result."""
    async def get_campaign_stats(self) -> CampaignStats:
        """Aggregate today's call outcomes from /campaign/stats."""
    async def get_usage_and_billing(self) -> UsageReport:
        """Pull usage and billing for cost tracking."""
    async def get_call_outcomes(self, since: datetime) -> list[CallEvent]:
        """Pull call outcomes since timestamp for reconciliation."""
```

**OpenHubAdapter (key methods):**

```python
class OpenHubAdapter(BaseAdapter):
    async def get_pipeline_status(self) -> PipelineSummary:
        """Current pipeline state, running tasks, queue."""
    async def get_project_velocity(self, since: datetime) -> VelocityReport:
        """Commits, deploys, test results since timestamp."""
    async def trigger_pipeline(self, spec: str, idempotency_key: str) -> PipelineResult:
        """Trigger a development pipeline run."""
```

### 4.3 State Ledger

Append-only log of every action across the portfolio. Stores as JSON files in `.acquisition-tracker/events/`:

```
.acquisition-tracker/
├── AGENDA.md
├── DAILY-LOG.md
├── PROGRESS.md
├── METRICS.md
├── INSIGHTS.md
├── daily-plans/         # Versioned daily plans (from Decision Engine)
│   └── 2026-05-25-plan.json
├── events/              # Append-only event log
│   ├── 2026-05-24-events.jsonl
│   └── 2026-05-25-events.jsonl
├── campaigns/           # Campaign records and outcomes
│   ├── active.json
│   └── 2026-05-25-campaigns.json
└── overrides/           # Manual override flags
    └── manual-pause.flag
```

Each event is a JSON line with:
```json
{"ts": "...", "correlation_id": "...", "type": "campaign_launch", "system": "aetherdesk", "data": {...}}
```

### 4.3.1 Privacy & Data Minimization

The State Ledger stores operational facts, NOT raw lead PII or call recordings.

| Allowed | Forbidden |
|---------|-----------|
| `lead_id`, `call_id`, `campaign_id` identifiers | Lead phone numbers, emails, full names |
| `outcome` values (interested/declined/etc.) | Call transcripts or recordings |
| Redacted summaries | Raw PII from any AetherDesk table |
| Duration, cost, conversion counts | Audio files or transcript text |

The adapter's webhook handler strips PII fields before writing to `.acquisition-tracker/events/`. AetherDesk remains the canonical data store for PII-bearing records.

### 4.3.2 Manual Override Precedence

Manual overrides in `.acquisition-tracker/overrides/` always outrank the scheduler.

| Override File | Effect | Cleared By |
|---------------|--------|------------|
| `manual-pause.flag` | Pause ALL campaigns immediately | Human deletes file or writes `expires_at` |
| `pause-NNN.flag` | Pause specific campaign `NNN` | Human or auto-expiry |
| `excluded-territories.csv` | Skip leads in listed territories | Human edits |
| `max-daily-spend.txt` | Override daily cost cap | Next auto-reconciled plan |

**Rules:**
1. The adapter checks for override files before EVERY launch command — NOT just at scheduled times.
2. Override files can include an `expires_at` timestamp for auto-expiry.
3. The Reconciler can recommend override removal but can NOT auto-delete them.
4. A detected override (active campaign running despite manual pause) logs an alert but does NOT auto-resume.

### 4.3.3 Recovery Bootstrap (Brain Restart)

If the deterministic brain restarts mid-cycle, the adapter layer reconstructs state in order:

1. **Read latest plan** from `daily-plans/latest-plan.json` (symlink to current day's plan)
2. **Read active overrides** from `overrides/` directory
3. **Poll AetherDesk** for currently running campaigns (`GET /campaign/calls?status=running`)
4. **Poll OpenHub** for pipeline state via WebSocket
5. **Rebuild event cursor** from `events/YYYY-MM-DD-events.jsonl` (last known position)
6. **Resume OBSERVE phase** — do NOT re-launch already-launched campaigns
7. **If recovery fails** (no plan, no events, API down): enter `IDLE` and log emergency for human review

### 4.4 Reconciler

Located in `deterministic-brain/agi/reconciler.py`

Runs at 22:00 (or on-demand). Compares:
- Expected effects from `daily-plans/YYYY-MM-DD-plan.json`
- Observed effects from `events/YYYY-MM-DD-events.jsonl`
- Summary from adapter API calls as cross-check

Outputs:
- **Drift report:** what was planned vs what happened
- **Corrective actions:** deferred campaigns, missing data investigations
- **Learning inputs:** for the self-learning loop (which profiles, territories, times performed best)

---

## 5. Kernel Modules

### 5.1 Where Stop Conditions Are Enforced

The system has two enforcement layers:

| Layer | Enforces | Mechanism |
|-------|----------|-----------|
| **Adapter (pre-flight)** | Business guardrails: answer rate floor, quiet hours, max attempts per lead, max concurrent campaigns | Checks before sending `launch` command. If conditions not met, defers with deterministic reason code. |
| **AetherDesk (runtime)** | Technical limits: single campaign lock (`_campaign_lock`), tenant plan limits | Built-in `asyncio.Lock()` in `campaign.py`, config from tenant plan. |

The adapter does NOT rely on AetherDesk to enforce business-level guardrails. AetherDesk only enforces that one campaign runs at a time per tenant. The adapter enforces answer-rate floors, quiet hours, and per-lead attempt caps.

### 5.2 Lead Sourcing

Leads are pre-loaded into AetherDesk via:
- Manual CSV import (existing `POST /campaign/leads/bulk`)
- Individual lead creation (existing `POST /campaign/leads`)
- Future: automated enrichment pipeline (out of scope for this spec)

The adapter does NOT generate or import leads. It only:
1. Reads lead counts to validate campaign prerequisites (`leads_found > 0`)
2. Configures campaign parameters (profile, concurrency, delay)

Lead volume targets are set by the Decision Engine in the daily plan, but actual lead population is a separate operational concern.

---

## 6. Stop Conditions & Lead Sourcing

### 6.1 AetherDesk → Brain (call outcome events)

AetherDesk already has webhook endpoints and WebSocket feeds. The integration:

1. **Fast path (real-time):** AetherDesk calls `POST /api/v1/interop/webhook` (the zero-trust endpoint) on each call completion with outcome data. Brain stores in State Ledger as event.
2. **Slow path (reconciliation):** At 22:00, Reconciler polls AetherDesk `/campaign/stats` to catch missed webhooks and repair drift.

The zero-trust interop endpoint already exists at `aetherdesk/apps/api/main.py:474-495`. No change needed to AetherDesk for the fast path.

### 6.2 Brain → AetherDesk (campaign orchestration)

Brain uses the AetherDeskAdapter to:
1. Validate existing lead inventory and configure campaign launch → AetherDesk `POST /campaign/launch`
2. Get campaign stats → AetherDesk `GET /campaign/stats`
3. Get usage and billing → AetherDesk `GET /api/v1/usage`, `GET /api/v1/billing`

All calls done with `idempotency_key` header in the zero-trust interop format. The adapter does NOT import leads (see Section 5.2).

### 6.3 Brain → OpenHub (project tracking)

Brain uses the OpenHubAdapter to:
1. `get_pipeline_status()` → OpenHub WebSocket `PIPELINE_EVENT` or REST endpoint
2. `get_project_velocity()` → git log + commit frequency
3. Trigger pipelines via OpenHub orchestrator's WebSocket `RUN_PIPELINE` event

### 6.4 OpenHub → Brain (development signals)

OpenHub broadcasts `PIPELINE_EVENT` messages via WebSocket on:
- Pipeline start/complete/fail
- New deploy
- Test results
- Security audit findings

Brain receives these via the OpenHubAdapter's WebSocket listener and writes to State Ledger.

---

## 7. Adapter Integration Details

| Failure | Detection | Response |
|---------|-----------|----------|
| AetherDesk API down | Health check fail | Defer campaign launch, log to State Ledger, retry next window |
| OpenHub pipeline crash | WebSocket disconnect | Flag in state, include in next plan |
| Call outcome webhook lost | Reconciliation found gap | Reconciliation repairs drift by polling stats API |
| Idempotency key collision | Key already in cache | Return cached response, no duplicate action |
| Campaign exhausted | `leads_found = 0` | Mark campaign completed, trigger next batch if planned |
| Stop condition hit | Real-time event evaluation | Auto-pause campaign, continue observing remaining |
| State Ledger write failure | File write error | Log to stderr, email alert, systemd health check fail |

---

## 8. Failure Handling

| Phase | Components | Delivers |
|-------|-----------|----------|
| **1** | `adapters/base.py`, `adapters/aetherdesk.py`, State Ledger event recording, persistent idempotency, health checks | Brain can talk to AetherDesk with safe retry, events flow |
| **2** | Decision Engine, daily plan schema, State Ledger plan storage | Brain can plan and review |
| **3** | `adapters/openhub.py`, OpenHub event consumption | Brain can read development state |
| **4** | Reconciler, drift detection, learning loop integration | Automated feedback cycle |
| **5** | Overnight cron + systemd service, health monitoring | Full autonomous daily loop |

---

## Appendix A: Interface Status

### AetherDesk Endpoints

| Endpoint | Status | Documented | Used By |
|----------|--------|------------|---------|
| `POST /api/v1/interop/webhook` | Public | `main.py:482` | Brain event ingestion |
| `POST /campaign/launch` | Private (code-verified) | `campaign.py:185` | Brain campaign trigger |
| `GET /campaign/stats` | Private (code-verified) | `campaign.py:154` | Reconciler summary |
| `POST /campaign/leads` | Private (code-verified) | `campaign.py:85` | Lead management (manual only) |
| `POST /campaign/leads/bulk` | Private (code-verified) | `campaign.py:98` | Lead management (manual only) |
| `GET /api/v1/usage` | Public | README | Reconciler cost tracking |
| `GET /api/v1/billing` | Public | README | Reconciler cost tracking |
| `POST /api/v1/voice/outbound` | Private (code-verified) | `voice.py` | Campaign dialer (internal) |
| `WS /ws/calls/{tenantId}` | Public | README | Real-time call events |
| `WS /ws/agent/{agentId}` | Public | README | Real-time agent updates |

"Public" = listed in README or OpenAPI schema. "Private" = verified in code but not in public docs.

### Deterministic Brain Modules

| Module | Status | Used By |
|--------|--------|---------|
| `brain/` | Public | Core intelligence (unchanged) |
| `orchestration/` | Public | Swarm dispatch (unchanged) |
| `features/scheduler.py` | Public | Modified: daily loop schedule added |
| `features/systems_bridge.py` | Public | Existing bridge (extended by adapter layer) |
| `agi/executive_kernel.py` | Branch-local | Wired: Decision Engine + Reconciler |
| `agi/decision_engine.py` | **New** | Created by this spec |
| `agi/reconciler.py` | **New** | Created by this spec |
| `adapters/` (package) | **New** | Created by this spec |
| `acquisition_bridge.py` | Branch-local | Modified: consumes State Ledger events |

### OpenHub Interfaces

| Interface | Status | Used By |
|-----------|--------|---------|
| WebSocket `PIPELINE_EVENT` | Public | Brain adapter listens for state changes |
| WebSocket `RUN_PIPELINE` | Public | Brain adapter triggers pipelines |
| REST `/api/health` | Public | Health check |

---

## 9. Implementation Order

| Phase | Components | Delivers |
|-------|-----------|----------|
| **1** | `adapters/base.py`, `adapters/aetherdesk.py`, State Ledger event recording, persistent idempotency, health checks | Brain can talk to AetherDesk with safe retry, events flow |
| **2** | Decision Engine, daily plan schema, State Ledger plan storage | Brain can plan and review |
| **3** | `adapters/openhub.py`, OpenHub event consumption | Brain can read development state |
| **4** | Reconciler, drift detection, learning loop integration | Automated feedback cycle |
| **5** | Overnight cron + systemd service, health monitoring | Full autonomous daily loop |

---

## 10. Files to Create/Modify

### Create:
- `deterministic-brain/adapters/__init__.py`
- `deterministic-brain/adapters/base.py`
- `deterministic-brain/adapters/aetherdesk.py`
- `deterministic-brain/adapters/openhub.py`
- `deterministic-brain/agi/decision_engine.py`
- `deterministic-brain/agi/reconciler.py`
- `deterministic-brain/scripts/start_daily_loop.sh`
- `.acquisition-tracker/events/.gitkeep`
- `.acquisition-tracker/daily-plans/.gitkeep`
- `.acquisition-tracker/campaigns/.gitkeep`

### Modify:
- `deterministic-brain/agi/executive_kernel.py` — wire in Decision Engine + Reconciler
- `deterministic-brain/agi/autonomous_scheduler.py` — add daily loop schedule
- `deterministic-brain/acquisition_bridge.py` — consume State Ledger events for reports
