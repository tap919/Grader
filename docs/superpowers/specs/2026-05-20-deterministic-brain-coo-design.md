# Spec: The Deterministic Brain as VentureLab Group Portfolio COO

- **Date:** May 20, 2026
- **Status:** APPROVED / ACTIVE
- **Target Audience:** Internal Developer / Portfolio Principal

---

## 1. Executive Summary

This specification repurposes **Deterministic Brain** (`deterministic-brain-main`) from a generic, marketed autonomous coding agent into a proprietary, internal **Business Operations & Engineering Orchestrator (COO Brain)**. Its primary directive is to manage and maintain the **VentureLab Group** software portfolio.

**OpenHub** and **Claw Protect** will act as the developer-facing acquisition funnel and monetization engine, while the **Deterministic Brain** executes autonomous background operations, alerts on system anomalies, and proposes safe hotfixes directly via **GitHub Issues** as its human-decision interface.

---

## 2. Portfolio Repository Mapping

The following table maps the local directory structures to their verified upstream GitHub repositories and operational tiers:

| Local Directory | Upstream GitHub Repository | Portfolio Tier | Core Role |
|---|---|---|---|
| `deterministic-brain-main/` | [deterministic-brain](https://github.com/ncsound919/deterministic-brain) | **Internal OS** | Executive Control, Event Ingestion, Issue Dispatcher |
| `OpenHub-main/` | [OpenHub-main](https://github.com/ncsound919/OpenHub-main) | **Tier 1 (Value)** | Developer OS (Open Source Acquisition Funnel) |
| `ai-core/` | [VibeServe](https://github.com/ncsound919/VibeServe) | **Tier 1 (Value)** | Standalone LLM Orchestrator / MCP Tool Server |
| `Uplift-Venture-main/` | [claw-protect](https://github.com/ncsound919/claw-protect) | **Tier 1 (Value)** | Standalone Security Framework (Monetization Engine) |
| `UL2-main/` | [UL2-main](https://github.com/ncsound919/UL2-main) | **Tier 2 (Affinity)** | "Uplift Lab" Community, Marketplace, & Learning |
| `aetherdesk_scaffold/` | [Aetherdesk-Call-Center](https://github.com/ncsound919/Aetherdesk-Call-Center) | **Tier 3 (Dormant)** | VoIP Call Center & AI Agent Billing Framework |
| `BB-Tech-main/` | [BB-Tech](https://github.com/ncsound919/BB-Tech) | **Tier 3 (R&D)** | Biotech systems simulation (Lotka-Volterra Engine) |
| `Draymond-Orchestrator-main/` | [Draymond-Orchestrator](https://github.com/ncsound919/Draymond-Orchestrator) | **Internal Engine** | Multi-Agent Coordination & Simulation Daemon |

---

## 3. Architecture: The Living Portfolio Graph

The COO Brain maintains a real-time **Business State Graph** consisting of four distinct telemetry vectors. This data is ingested continuously and stored in a lightweight SQLite database (`sovereign.db`) inside the Brain's runtime folder.

```
                  ┌─────────────────────────────────┐
                  │       State Ingress Bus         │
                  │ (GitHub / Stripe / Sentry APIs) │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │      Venture Health Cache       │
                  │ (Health / Eco / Momentum / Comm)│
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │    Traffic Light Classifier     │
                  │    (Green / Yellow / Red)       │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
   [GREEN ZONE]              [YELLOW ZONE]              [RED ZONE]
  Auto-execute              Propose & Queue            Alert & Halt
  - Restart staging         - Open GitHub Issue        - Exfiltration alert
  - Clear cache             - Draft hotfix PR          - DB connection loss
  - Update lockfile         - Push staging deploy      - PagerDuty notification
```

### 3.1 Telemetry Vectors

1. **Health Vector (`telemetry_health`)**
   - Ingests Sentry exceptions, HTTP uptime logs, build pipeline results.
   - Schema: `(product_id, service_name, status, error_rate, timestamp)`
2. **Economic Vector (`telemetry_economics`)**
   - Ingests Stripe webhooks (subscriptions, cancellations, invoice payments).
   - Schema: `(product_id, mrr, churn_rate, active_customers, daily_runrate, timestamp)`
3. **Momentum Vector (`telemetry_momentum`)**
   - Ingests GitHub actions, open issues, active PR counts, commit frequency.
   - Schema: `(product_id, open_bugs, pending_prs, deployment_status, timestamp)`
4. **Commitment Vector (`telemetry_commitments`)**
   - Managed directly by the User via `.soul.yaml` or a local text configuration.
   - Contains quarterly goals, hard limits, and explicit developer directives.
   - Schema: `(product_id, target_metric, current_value, deadline, timestamp)`

---

## 4. The Decision Loop & Traffic Light Autonomy

The Brain classifies all business and code anomalies into a **Traffic Light Model**. It is architecturally prohibited from performing write operations directly on high-risk files without approval.

### 4.1 Zone Classification Matrix

| Zone | Trigger Event | Brain Action | Human Loop |
|---|---|---|---|
| **Green** | - Failed dev build on branch<br>- Cache bloat > 2GB<br>- Staging down with simple restart | - Auto-execute hotfix/restart<br>- Re-run testing harness<br>- Log to `/audit_log` | None (Daily Digest Only) |
| **Yellow** | - Main build failure<br>- Stripe payment failed<br>- Dependency vulnerability (CVE)<br>- High exception spike in Sentry | - Diagnose exception using MoE<br>- Generate minimal code patch<br>- **Open structured GitHub Issue**<br>- Draft pull request (do not merge) | **Awaiting Close Signal** on GitHub Issue |
| **Red** | - Stripe subscription canceled<br>- Database connection loss<br>- Data exfiltration pattern detected<br>- Prompt injection attempt | - Freeze staging deploys<br>- Revoke suspicious API keys<br>- Alert via Telegram/Slack/Email | **Immediate Escalation** (Halt execution) |

---

## 5. The GitHub Issue human-in-the-Loop Queue

The Human-in-the-Loop (HITL) interface is **entirely text-driven and zero-overhead**, using the GitHub repository's issue tracker as the state manager. 

```
1. Sentry exception triggers Yellow event
   │
   ▼
2. COO Brain diagnoses code and writes a patch
   │
   ▼
3. Brain opens GitHub Issue: [YELLOW] Exception in main.py: line 42
   │
   ├─► Includes: Error trace, Root Cause, Proposed Patch, Impact
   └─► Creates Hotfix Pull Request: #145
   │
4. Developer reviews on mobile/browser
   │
   ├─► Action: COMMENT "approve" or CLOSE issue
   └─► Webhook fires to COO Brain
   │
5. Brain merges PR #145, runs CI verification, deploys, and posts summary
```

### 5.1 Issue Payload Template

When opening a Yellow/Red issue, the Brain uses the following Markdown template:

```markdown
## [YELLOW] Critical Exception in Aetherdesk_Scaffold (Main Server)

### 🚨 Diagnostic Report
- **Impact Score:** 82/100 (High Priority)
- **Error Class:** `redis.exceptions.ConnectionError`
- **Location:** `apps/api/routers/agents.py:42`
- **Occurrences:** 14 within the last 15 minutes

### 🔍 Analysis
The FastAPI API gateway tried to fetch a tenant profile cache, but the local Redis connection dropped. Since there was no try-except fallback to read directly from PostgreSQL, the entire API gateway returned 500 errors.

### 🛠️ Proposed Solution
Wrap the caching layers in a try-except fallback block and trigger a graceful redis client reconnect.

#### Code Change (PR #145)
```python
try:
    tenant_cache = await redis.get(f"tenant:{tenant_id}")
except redis.ConnectionError:
    # Fallback directly to DB
    tenant_cache = await db.fetch_row("SELECT * FROM tenants WHERE id = $1", tenant_id)
    # Log warning to telemetry
    logger.warning("Redis disconnected, falling back to database")
```

### 📥 Instructions to Proceed
1. To **APPROVE** and auto-merge PR #145, simply **CLOSE this issue**.
2. To **REJECT** or revise, comment on this issue or close without merging.
```

---

## 6. System Architecture & Boundaries

The brain's security posture is enforced via **restricted API scopes** and **Constitution validation** inside the Core Decision Engine.

```python
# Execution boundary logic inside brain/permissions.py

PROHIBITED_DIRECTORIES = ["/auth", "/billing", "/legal", "/security"]

def verify_action_permissions(action_type: str, file_path: str) -> bool:
    """Ensure the autonomous engine never touches critical files without explicit 2FA."""
    if action_type in ["write", "modify"]:
        for dir_name in PROHIBITED_DIRECTORIES:
            if dir_name in file_path:
                raise PermissionError(f"Autonomous writes to {dir_name} are strictly prohibited.")
    return True
```

- **Stripe Credentials:** Read-only tokens (`rk_live_...`) limited to listing subscriptions, active counts, and invoice failures. The brain has **no access** to charge cards or issue refunds.
- **GitHub Credentials:** Personal Access Token (PAT) scoped to `repo` (issues, PRs, contents).
- **Hosting Environments:** Scoped to Render/Railway CLI read/write for staging deploys, read-only for production.

---

## 7. Phase 1 Implementation Plan

```
┌────────────────────────────────────────────────────────┐
│                      WEEK 1                            │
│ 1. Set up sqlite state tables in sovereign.db          │
│ 2. Scrape Sentry & GitHub webhook payloads             │
│ 3. Implement traffic light classification loops       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                      WEEK 2                            │
│ 1. Code GitHub issue payload templates                 │
│ 2. Implement webhook listener for Closed Issues        │
│ 3. Hook up automated staging deploy on close           │
└────────────────────────────────────────────────────────┘
```

1. **State Database Setup:** Implement the sqlite DB tables in `deterministic-brain-main/data/sovereign.db`.
2. **Webhook Listener:** Set up a FastAPI service in `api/server.py` to listen for webhook payloads.
3. **Automated Verification:** Use Pytest to confirm the MoE Router matches patterns correctly.

---

*Written by VentureLab COO. Approved for immediate execution.*
