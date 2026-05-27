# Math X Integration Plan

## Overview
Integrate Math X's edge-native AI computation stack into Deterministic Brain, OpenHub, and BB-Tech to achieve estimated 30-60% capability improvements per system.

## Math X Assets to Integrate
- **modelRouter.ts** — Multi-model AI routing (Claude, DeepSeek-R1, Qwen2.5-Math) with mode-based selection
- **schemas** — Zod validation schemas for AI interactions
- **math-core types** — Shared type system for model providers, messages, modes
- **Pyodide/WASM** — Browser-side Python (NumPy, SymPy, SciPy, Pandas, sklearn) 
- **DuckDB-Wasm** — In-browser analytical SQL
- **LanceDB Edge RAG** — Local vector memory for document retrieval

---

## Step 1: Deterministic Brain — Multi-Model Router Integration
**Target file:** `deterministic-brain-main/governor/governor.py`
**Improvement:** +30-40%

### Changes
1. Port Math X's `selectProvider(mode)` and `routeModelStream()` logic to Python
2. Add mode-to-provider mapping to `ProjectRouter`:
   - `formula`/`deep-solve` → Qwen2.5-Math (symbolic)
   - `scientist`/`hypothesis`/`synergy` → DeepSeek-R1 (reasoning)
   - default → Claude (general)
3. Add `checkOllamaHealth()` with fallback to next provider
4. Wire routing decisions into `GovernorDecision` metadata for oversight tracking

## Step 2: OpenHub — Pyodide/WASM + DuckDB-Wasm
**Target files:** `OpenHub-main/src/` and `OpenHub-main/vite.config.ts`
**Improvement:** +25-35%

### Changes
1. Add `pyodide` and `@duckdb/duckdb-wasm` dependencies
2. Create `src/services/PyodideService.ts` — initialize Pyodide kernel, load extra packages on demand
3. Replace Python subprocess spawn for math/analysis in pipeline with WASM computation
4. Add DuckDB query panel to workspace for analytical queries on repo data
5. Integrate LanceDB Edge RAG as alternative to VibeServe MCP RAG

## Step 3: BB-Tech — Full Research Stack
**Target files:** `BB-Tech-main/Analytics Engine/` and `BB-Tech-main/Cancer Treatment/`
**Improvement:** +45-60%

### Changes
1. Integrate Pyodide with NumPy/SciPy/Pandas for browser-side analytics computation
2. Add DuckDB-Wasm for research dataset queries  
3. Implement LanceDB Edge RAG for research paper retrieval
4. Add Monte Carlo / Probability Lab for epidemiological modeling
5. Add Folder Intelligence for research PDF ingestion

## Step 4: Cross-Project Shared Package
1. Extract Math X's `modelRouter.ts`, `schemas`, and core types into a shared `@billion-business/math-x` package
2. Reference as `file:` dependency from each project (like ai-core and venture-ui)

## Verification
- All existing tests pass for each project
- Deterministic Brain routes correctly to Qwen vs DeepSeek vs Claude
- OpenHub Pyodide computes without spawning Python subprocess
- BB-Tech runs analytics in-browser
