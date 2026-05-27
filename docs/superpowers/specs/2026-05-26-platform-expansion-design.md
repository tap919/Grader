# Platform Expansion Design: Zoekt, Woodpecker, and GitNexus

## Objective
Accelerate OpenHub's transformation into an AI-native developer platform by integrating global search, CI compatibility, and deep code intelligence.

## Components

### 1. Zoekt (Global Code Search)
- **Integration:** Deploy as a sidecar process within the existing infrastructure.
- **Data Flow:** Repositories are indexed on-push. API endpoint `/api/search/code` interfaces with the local Zoekt instance.
- **User UX:** Fast, type-ahead search bar in the global header with file path, line content, and repo context.

### 2. Woodpecker CI (GitHub Actions Compatibility)
- **Integration:** Service-level integration. OpenHub orchestrator triggers Woodpecker server via internal API instead of internal custom-built pipelines.
- **Data Flow:** Pipeline YAML files (detect `.woodpecker/*.yml` or `.github/workflows/*.yml`) are forwarded to the Woodpecker instance.
- **User UX:** Replaces current pipeline UI with Woodpecker's run-status dashboard.

### 3. GitNexus (Deep Code Intelligence)
- **Integration:** Middleware layer for the IDE view. 
- **Data Flow:** Indexes static analysis data; surfaces Go-to-Definition and References data to the UI.
- **User UX:** Interactive code-navigation overlays in the repository file explorer.

---

## Technical Considerations
- **Architecture:** All three require external service management. We will add these to `docker-compose.yml` to simplify local development and deployment.
- **Dependencies:** Zoekt (Go), Woodpecker (Go), GitNexus (Web-native client-side).
- **Phasing:** 
  1. Zoekt (Global Search) — High immediate UX impact.
  2. GitNexus — Deep integration with IDE.
  3. Woodpecker — Migration of existing CI logic.

---

## Review
Please review this design. If it matches your intent, I will commit it to `docs/superpowers/specs/2026-05-26-platform-expansion-design.md` and then move to the implementation planning phase.
