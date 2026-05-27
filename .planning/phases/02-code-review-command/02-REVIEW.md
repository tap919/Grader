---
phase: 02-code-review
reviewed: 2026-05-23T12:00:00Z
depth: deep
files_reviewed: 10
files_reviewed_list:
  - tests/conftest.py
  - tests/test_app.py
  - tests/unit/test_tenants.py
  - tests/unit/test_agents.py
  - tests/unit/test_calls.py
  - tests/unit/test_security.py
  - tests/unit/test_billing.py
  - tests/unit/test_audio.py
  - tests/unit/test_tts.py
  - tests/unit/test_intent.py
findings:
  critical: 4
  warning: 14
  info: 5
  total: 23
status: issues_found
---

# Phase 02: Code Review Report — AetherDesk Test Suite

**Reviewed:** 2026-05-23T12:00:00Z
**Depth:** deep (cross-file analysis with source tracing)
**Files Reviewed:** 10
**Status:** issues_found

## Summary

A deep adversarial review of the AetherDesk test suite (10 files, ~1250 lines) discovered **4 critical defects**, **14 warnings**, and **5 info items**. The most significant finding is that the production `billing.py` module uses `fetchone()[0]` with a `dict` row factory (`_dict_factory`), which will crash with `KeyError` at runtime — and the test suite masks this by using `sqlite3.Row` instead, so the tests pass while production fails.

Three tests are **false positives** — they assert conditions that are always true or structurally impossible to fail, meaning they look like coverage but provide zero verification. The audio buffer tests are fragile and unreliable, using non-deterministic assertions. Test isolation is generally good (autouse `_clear_data` fixture), but global singleton state (`tts_service`) leaks between tests with no `finally` guard on restoration.

---

## Critical Issues

### CR-01: Production `billing.py` will crash with `KeyError` — masked by test row factory mismatch

**File:** `tests/unit/test_billing.py` (implied by conftest row factory) → Root cause in `apps/api/services/db/billing.py:58-59`
**Cross-file:** `tests/conftest.py:84` uses `sqlite3.Row` vs `apps/api/services/db/pool.py:19-20` uses `_dict_factory`
**Issue:** The production `_get_sqlite_conn()` in `pool.py:114-115` sets `conn.row_factory = _dict_factory`, which returns `dict` objects from `fetchone()`. `billing.py` accesses the result with `fetchone()[0]` (line 58, 59), which will raise `KeyError: 0` because dicts don't support integer index access. The conftest replaces `_get_sqlite_conn` with `_shared_get_sqlite_conn` (line 84) which uses `sqlite3.Row` — which supports `row[0]`. All billing tests pass because they use the wrong row factory, while production SQLite code will crash.

**Proof:**
```python
# pool.py:19 — production row factory
def _dict_factory(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

# billing.py:58 — will crash with KeyError: 0 in production
total_calls = conn.execute("SELECT COUNT(*) ...").fetchone()[0]
```

**Fix:** Change `billing.py` to use named key access to match `_dict_factory`, AND fix the conftest to use the same row factory as production so tests catch this:
```python
# billing.py:58-59
row = conn.execute("SELECT COUNT(*) ...").fetchone()
total_calls = row["COUNT(*)"] if row else 0
```

---

### CR-02: `test_get_tenant_by_api_key` is a false positive — always passes

**File:** `tests/unit/test_tenants.py:105-119`
**Issue:** This test calls `get_tenant_by_api_key()` which in SQLite mode always returns `None` (tenants.py:67-71 only works with PostgreSQL). The assertion is `assert tenant is None or tenant["id"] == created["id"]`. When `tenant is None`, the `or` short-circuits and the assertion is `True` — the test **always passes** regardless of whether the API key lookup works. This is a false positive that provides zero coverage.

```python
# tenants.py:67-71 — only works with PG
async def get_tenant_by_api_key(api_key):
    pool = await get_pg_pool()
    if pool:
        return await pool.fetchrow(...)
    return None  # Always returns None in SQLite mode!
```

**Fix:** Either implement SQLite support for `get_tenant_by_api_key`, or skip the test in SQLite mode:
```python
@pytest.mark.skipif(os.getenv("USE_POSTGRES") != "true", reason="API key lookup requires PostgreSQL")
async def test_get_tenant_by_api_key(db_conn):
    ...
```

---

### CR-03: `test_get_available_agents_by_skill` — billing filter check never runs

**File:** `tests/unit/test_agents.py:138-168`
**Issue:** The billing-skills filter test at line 164 starts with `if billing_agents:`, which means if `billing_agents` is empty (the expected/desired behavior — no agents have "billing" skill), the entire assertion block is **skipped**. The test passes vacuously. The `if` guard was presumably added to avoid a failing test, but it voids the assertion entirely.

```python
billing_agents = await get_available_agents(tenant_id, skills=["billing"])
if billing_agents:  # <-- guard prevents assertion when empty (the expected case)
    all_names = [a["name"] for a in billing_agents]
    assert "Billing Agent" not in all_names  # <-- also wrong: checks name, not skill
```

Additionally, even if `billing_agents` were non-empty, it checks that no agent is named "Billing Agent" — but the real question is whether any agent lacks "billing" skill. The name check is a proxy, and the `if` guard makes it a no-op.

**Fix:** Remove the `if` guard and assert emptiness directly:
```python
billing_agents = await get_available_agents(tenant_id, skills=["billing"])
assert len(billing_agents) == 0, f"Expected no billing agents, got {len(billing_agents)}"
```

---

### CR-04: `test_update_agent` uses string containment on JSON instead of array membership

**File:** `tests/unit/test_agents.py:80-102`
**Issue:** Line 101 checks `"sales" in (updated["skills"] if updated and updated["skills"] else "")`. The skills column is stored as a JSON string (`'["sales", "billing"]'`). The `in` operator checks for **string substring** containment, not array membership. This means the test would also pass if skills contained `'["sales_tax", "compliance"]'` because `"sales"` is a substring of `"sales_tax"`.

```python
# What the test does (string containment):
"sales" in '["sales_tax", "compliance"]'  # True — FALSE POSITIVE!

# What the test should do (array membership):
json.loads(updated["skills"])  # ["sales", "billing"]
"sales" in json.loads(updated["skills"])  # True — correct
```

**Fix:**
```python
import json
updated_skills = json.loads(updated["skills"])
assert "sales" in updated_skills
```

---

## Warnings

### WR-01: `test_create_tenant_duplicate_email_fails` overbroad exception catch

**File:** `tests/unit/test_tenants.py:51-56`
**Issue:** `pytest.raises(Exception)` catches any exception — including `AttributeError`, `TypeError`, or `KeyError` from bugs in the test setup itself. The test would pass even if `create_tenant` raises an exception for an unrelated reason (e.g., missing `plan_id` constraint). Should catch a specific DB exception like `sqlite3.IntegrityError` or the ORM-specific error.

**Fix:**
```python
import sqlite3
with pytest.raises((sqlite3.IntegrityError, sqlite3.DatabaseError)):
    await create_tenant(name="Second Corp", email="dupe@example.com", slug="second-corp")
```

---

### WR-02: `test_get_usage_stats_with_data` uses `>=` instead of exact `==`

**File:** `tests/unit/test_billing.py:63-65`
**Issue:** Asserts `active_agents >= 3` and `total_calls >= 1` instead of exact matches `== 3` and `== 1`. The test inserts exactly 3 agents and 1 call. Using `>=` masks bugs where the query returns MORE results than expected (e.g., data leakage between tests, counting soft-deleted records).

**Fix:** Use exact assertions:
```python
assert stats["total_agents"] == 3
assert stats["active_agents"] == 3
assert stats["total_calls"] == 1
assert stats["active_calls"] == 1  # currently untested!
assert stats["total_minutes"] == 2.0
```

---

### WR-03: `test_get_billing_summary` uses `>=` instead of exact `==`

**File:** `tests/unit/test_billing.py:98-99`
**Issue:** Same pattern as WR-02 — `total_calls >= 2` and `total_minutes >= 2.0` when the test inserts exactly 2 calls of 60 seconds each. This masks data contamination between tests.

**Fix:**
```python
assert summary["total_calls"] == 2
assert summary["total_minutes"] == 2.0
```

---

### WR-04: `test_audio_buffer_processing_valid_audio` is non-deterministic

**File:** `tests/unit/test_audio.py:23-54`
**Issue:** The test feeds audio chunks and then uses conditional logic: `if result is None: feed more audio... if result is not None: assert`. This means the test can pass with no assertions actually running (if result is None on every call). The test does not validate that `asr_service.transcribe_streaming` was ever called, nor that the buffer processing logic works correctly. It's written to never fail regardless of implementation.

```python
if result is not None:
    assert isinstance(result, str)  # <-- may never execute
```

**Fix:** Remove the conditionals. Feed a known number of chunks that should trigger transcription, then assert the mock was called:
```python
for _ in range(100):
    await session.process_audio(audio_chunk)
    
# Assert ASR was called at least once
mock_asr.transcribe_streaming.assert_called()
```

---

### WR-05: `test_large_buffer` assertion is vacuously true

**File:** `tests/unit/test_audio.py:89-105`
**Issue:** `assert result is None or isinstance(result, str)` is always true for any possible return type of `process_audio` (None or str). This test can never fail and provides no verification that large buffers are handled correctly.

**Fix:** Assert specific expected behavior:
```python
# After processing a large chunk, buffer should be trimmed
assert len(session.audio_buffer) <= session.MAX_BUFFER_SIZE
```

---

### WR-06: `test_tts_engine_fallback` leaks state on test failure

**File:** `tests/unit/test_tts.py:63-84`
**Issue:** The test modifies `tts_service.engines` (a global singleton) at line 76 and restores it at line 84. If any assertion fails between these two lines, the restoration never runs because there's no `try/finally` block. This corrupts `tts_service` state for all subsequent tests in the session.

```python
tts_service.engines = ["edge", "qwen3"]  # line 76 — modifies global state
result = await tts_service.synthesize("Test text")
assert result == b"fallback audio"  # line 80 — if this fails, line 84 never runs
assert mock_synth.call_count == 2  # line 81 — if this fails, line 84 never runs
tts_service.engines = original_engines  # line 84 — restoration
```

**Fix:** Use try/finally or a fixture:
```python
original_engines = tts_service.engines.copy()
try:
    tts_service.engines = ["edge", "qwen3"]
    ...
finally:
    tts_service.engines = original_engines
```

---

### WR-07: `test_security::test_tenant_isolation` does not test tenant isolation

**File:** `tests/unit/test_security.py:49-67`
**Issue:** The test creates two tenants and verifies they have different IDs and names — this tests that `create_tenant` and `get_tenant_db` work correctly, which is already covered by `test_tenants.py`. Actual tenant isolation testing would verify that Tenant One cannot access Tenant Two's data (e.g., querying agents belonging to another tenant).

**Fix:** Add an actual cross-tenant access attempt:
```python
# Create tenant A, add agent, verify tenant B cannot access it
t1 = await create_tenant(...)
from apps.api.services.db.agents import create_agent, list_agents
await create_agent(tenant_id=t1["id"], name="Secret Agent", ...)
t2_agents = await list_agents(t2["id"])
assert all(a["id"] not in ... for a in t2_agents)
```

---

### WR-08: `test_app.py::EngineTests` uses unvalidated `redis_client=None`

**File:** `tests/test_app.py:74`
**Issue:** `Actions(redis_client=None)` passes `None` as the Redis client. If `Actions` ever calls a method that uses `redis_client` (e.g., `set`, `get`), it will raise `AttributeError: 'NoneType' object has no attribute '...'`. The test has no Redis mock and relies on the `get_prompt` method never using the `Actions` object. This is an undocumented coupling assumption that will silently break.

**Fix:** Provide a mock Redis client:
```python
from unittest.mock import MagicMock
vm = ProtocolVM(
    ProtocolLoader(base_path="config/protocols"),
    Validators(),
    Actions(redis_client=MagicMock())
)
```

---

### WR-09: `test_tenants::test_create_tenant_success` unused import

**File:** `tests/unit/test_tenants.py:17`
**Issue:** `from apps.api.services.db.pool import _get_sqlite_conn` is imported but never referenced in the test body. Dead imports can mask import failures.

**Fix:** Remove unreferenced import.

---

### WR-10: `test_app.py::test_intent_endpoint` uses duck-typed mock instead of `IntentResult`

**File:** `tests/test_app.py:48-53`
**Issue:** The test constructs `type("R", (), {...})()` to mock the classifier return value instead of using `IntentResult`. If `IntentResult` fields change (e.g., `intent` renamed to `intent_name`), the duck-typed mock will not break — the test passes while production code breaks.

**Fix:** Use the actual dataclass:
```python
from apps.api.services.intent_classifier import IntentResult
mock_classify.return_value = IntentResult(
    intent="billing_invoice",
    entities={"invoice_id": "INV123"},
    confidence=0.85,
    reasoning="Matched billing invoice intent"
)
```

---

### WR-11: `test_odd_length_buffer` patches closed before main test action

**File:** `tests/unit/test_audio.py:56-70`
**Issue:** The `with patch(...)` blocks for `_buffer_lock` and `asr_service` are opened at lines 63-65 but close at line 65 (dedented). The actual test action (`await session.process_audio(odd_audio)`) happens at line 70, OUTSIDE the patch context. This means:
- The `asr_service` patch is not active when `process_audio` runs (though it's not needed for this test since ValueError occurs before ASR is called)
- The `_buffer_lock` patch is not active — the real `asyncio.Lock()` is used instead

While the test still works (the ValueError occurs inside the `async with self._buffer_lock` block, which works with the real lock), the patches are misleading and suggest the test relies on them.

**Fix:** Either remove the unnecessary patches or move the test action inside the `with` blocks:
```python
with patch.object(session, "_buffer_lock", new=AsyncMock()):
    with patch("apps.api.services.call_session.asr_service") as mock_asr:
        mock_asr.transcribe_streaming = AsyncMock(return_value="test")
        with pytest.raises(ValueError, match="buffer size must be a multiple of element size"):
            await session.process_audio(odd_audio)
```

---

### WR-12: `test_empty_buffer` uses unnecessary patches for early-return path

**File:** `tests/unit/test_audio.py:73-87`
**Issue:** `process_audio(b"")` hits the early return `if len(audio_chunk) < 320: return None` at line 88 of `call_session.py`, before `_buffer_lock` is acquired or `asr_service` is accessed. The patches for `_buffer_lock` and `asr_service` (lines 80-83) are never exercised and add unnecessary complexity.

**Fix:** Remove the unnecessary patches:
```python
async def test_empty_buffer():
    from apps.api.services.call_session import VoiceSession
    session = VoiceSession(session_id="test-empty", call_sid="test-call-empty")
    result = await session.process_audio(b"")
    assert result is None
```

---

### WR-13: `test_app.py::test_classify_with_ollama_failure_uses_fallback` — fragile side_effect construction

**File:** `tests/test_app.py:99-112`
**Issue:** The `failing_execute` helper (line 104) is defined as `async def failing_execute(func, *args, **kwargs)` and works because AsyncMock returns the coroutine object which is then awaited. This is technically correct but relies on an undocumented behavior of `AsyncMock.side_effect` with coroutine functions. If the Python mock library's behavior changes, this could silently become a no-op where the exception is never raised.

More importantly, the test patches `apps.api.services.intent_classifier.retry_ollama.execute` but `retry_ollama` is imported at module level in `intent_classifier.py` (line 13). The patch target string must exactly match how the reference is bound. Since `retry_ollama` is a MODULE-level attribute of `intent_classifier`, this works — but if the import were `from apps.api.services.retry import retry_ollama` (a local binding), the patch target would need to be different.

This is correct as written but is a maintenance trap — future refactors that change the import style will silently break this test.

---

### WR-14: No coverage for `VoiceSession.speak()` or `VoiceSession.speak_stream()`

**File:** `tests/unit/test_audio.py` (entire file)
**Issue:** `test_audio.py` only tests `process_audio()`. The `VoiceSession` class has two other public async methods — `speak()` and `speak_stream()` — which handle the TTS synthesis path. These are entirely uncovered. The `speak_stream()` method at `call_session.py:145-160` is particularly important as it's the main streaming path used in production WebSocket connections.

---

## Info

### IN-01: `test_app.py::IntentClassifierTests` duplicates `test_intent.py`

**File:** `tests/test_app.py:87-112` vs `tests/unit/test_intent.py:33-75`
**Issue:** The `test_classify_with_keyword_fallback` and `test_classify_with_ollama_failure_uses_fallback` tests in `test_app.py` overlap significantly with `test_intent.py`'s keyword fallback tests. Both test the same `IntentClassifier` with the same mocking approach. This duplication means changes to the classifier behavior must be updated in two places.

---

### IN-02: `test_environment_is_test` tests conftest setup, not production code

**File:** `tests/unit/test_security.py:13-18`
**Issue:** This test checks env vars set in conftest (lines 51-59). It always passes because conftest is loaded before tests. It validates test configuration, not application behavior. Should be in a separate test config validation file.

---

### IN-03: `test_import_db_modules` tautological assertions

**File:** `tests/unit/test_security.py:21-35`
**Issue:** `assert create_tenant is not None` after a successful `from ... import create_tenant` is tautological — if the import failed, Python would raise `ImportError` before reaching the assert. The only non-tautological assertion is `assert USE_POSTGRES is False`.

---

### IN-04: `conftest.py` hardcoded encryption key in test config

**File:** `tests/conftest.py:57`
**Issue:** `os.environ["ENCRYPTION_KEY"] = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="` is a weak, predictable key. While this is test-only code, it could be accidentally copied into production configs or committed to shared repositories. The `JWT_SECRET` and `INTERNAL_API_KEY` have similar issues.

---

### IN-05: `conftest.py` force-patch loop (lines 136-151) is likely redundant

**File:** `tests/conftest.py:136-151`
**Issue:** The loop patches local `_get_sqlite_conn` references in db submodules that were imported before line 125. However, since the conftest patches `pool._get_sqlite_conn` at line 125 BEFORE any test imports the db submodules (tests import lazily inside test functions), all submodule imports will naturally get the replaced version. The force-patch loop only matters if some submodule was imported as a transitive dependency of `_pool_module` (line 69), which `pool.py` does not do. This is dead defensive code.

---

## Detailed Issue Map

| ID | Severity | File | Line(s) | Summary |
|----|----------|------|---------|---------|
| CR-01 | BLOCKER | `apps/api/services/db/billing.py` | 58-59 | `fetchone()[0]` crashes with `_dict_factory`; test masks with `sqlite3.Row` |
| CR-02 | BLOCKER | `tests/unit/test_tenants.py` | 115-119 | False positive — always passes (None or X) |
| CR-03 | BLOCKER | `tests/unit/test_agents.py` | 163-168 | `if billing_agents:` guard voids the assertion |
| CR-04 | BLOCKER | `tests/unit/test_agents.py` | 101 | String containment on JSON, not array membership |
| WR-01 | WARNING | `tests/unit/test_tenants.py` | 51 | Overbroad `pytest.raises(Exception)` |
| WR-02 | WARNING | `tests/unit/test_billing.py` | 63-65 | `>=` instead of exact `==` on known insert counts |
| WR-03 | WARNING | `tests/unit/test_billing.py` | 98-99 | `>=` instead of exact `==` on known insert counts |
| WR-04 | WARNING | `tests/unit/test_audio.py` | 23-54 | Non-deterministic — may pass with no assertions executed |
| WR-05 | WARNING | `tests/unit/test_audio.py` | 105 | Vacuously true assertion (None or str) |
| WR-06 | WARNING | `tests/unit/test_tts.py` | 69-84 | Global state leaks on assertion failure (no try/finally) |
| WR-07 | WARNING | `tests/unit/test_security.py` | 49-67 | Doesn't test tenant isolation; tests basic CRUD |
| WR-08 | WARNING | `tests/test_app.py` | 74 | `redis_client=None` will crash if Actions uses it |
| WR-09 | WARNING | `tests/unit/test_tenants.py` | 17 | Unused import `_get_sqlite_conn` |
| WR-10 | WARNING | `tests/test_app.py` | 48-53 | Duck-typed mock instead of `IntentResult` dataclass |
| WR-11 | WARNING | `tests/unit/test_audio.py` | 63-70 | Patches closed before main test action |
| WR-12 | WARNING | `tests/unit/test_audio.py` | 80-83 | Unnecessary patches for early-return path |
| WR-13 | WARNING | `tests/test_app.py` | 104-108 | Fragile side_effect with coroutine function |
| WR-14 | WARNING | `tests/unit/test_audio.py` | — | `VoiceSession.speak()` and `speak_stream()` untested |
| IN-01 | INFO | `tests/test_app.py` | 87-112 | Duplicates `test_intent.py` keyword fallback tests |
| IN-02 | INFO | `tests/unit/test_security.py` | 13-18 | Tests conftest setup, not production behavior |
| IN-03 | INFO | `tests/unit/test_security.py` | 21-35 | Tautological assertions after successful imports |
| IN-04 | INFO | `tests/conftest.py` | 57 | Weak hardcoded encryption key (test-only) |
| IN-05 | INFO | `tests/conftest.py` | 136-151 | Force-patch loop likely redundant |

---

## Cross-File Analysis Summary

**Import graph traced:** All 10 test files → app source modules → 16 source modules examined.

**Test isolation:** The `_clear_data` autouse fixture (conftest:183) correctly wipes all tables between tests. The `shared_db` session-scoped fixture with `_SharedConnectionWrapper` properly prevents connection closure. **No test order dependencies detected** in the current suite.

**Singleton state leak:** The global `tts_service` singleton (tts.py:253) is mutated by `test_tts.py:76` with `tts_service.engines = [...]` and restored at line 84 — but without `try/finally`, making this a leak if assertions fail.

**Row factory mask:** This is the single most dangerous issue. Conftest line 84 sets `row_factory = sqlite3.Row` but production `pool.py:115` uses `_dict_factory`. Every test that accesses `fetchone()[0]` (billing.py) passes in tests but fails in production. No other db module uses `[0]` access — only billing.py.

**False positive rate:** 3 out of 28 tests identified (CR-02, CR-03, CR-04) are structural false positives that cannot meaningfully fail.

---

*Reviewed: 2026-05-23T12:00:00Z*
*Reviewer: OpenCode (gsd-code-reviewer)*
*Depth: deep*
