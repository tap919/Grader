<tasks>

<task type="auto">
  <name>task 1: Set up pytest configuration with test discovery and fixtures</name>
  <files>C:\\Users\\User\\Desktop\\Billion Business\\deterministic-brain-main\\pytest.ini, C:\\Users\\User\\Desktop\\Billion Business\\deterministic-brain-main\\tests\\conftest.py</files>
  <action>
Create comprehensive pytest configuration:
- pytest.ini with testpaths, python_files, filterwarnings
- conftest.py with fixtures for:
  - Temporary database setup/teardown
  - Redis mock or test instance
  - Task queue with test handlers
  - Configuration overrides for testing
  - Factory functions for test data
  - Monkeypatches for external dependencies
  </action>
  <verify>
pytest --version && ls tests/*.py | grep -q "conftest" && echo "Pytest infrastructure in place"
  </verify>
  <done>
Pytest is configured with proper test discovery, fixtures, and factories for all critical components.
  </done>
</task>

<task type="auto">
  <name>task 2: Implement PostgreSQL integration tests (auto)</name>
  <files>C:\\Users\\User\\Desktop\\Billion Business\\deterministic-brain-main\\tests\\test_postgres.py</files>
  <action>
Create comprehensive tests for PostgreSQL integration:
- Test connection pool initialization
- Test schema exists with all required tables
- Test basic CRUD operations
- Test connection health and retry logic
- Test distributed locking with multiple workers
- Test transaction handling and rollback
  </action>
  <verify>
pytest tests/test_postgres.py -v 2>&1 | grep "PASSED\|FAILED" | tail -5
  </verify>
  <done>
PostgreSQL integration tests cover connection management, schema operations, and distributed functionality with >80% coverage.
  </done>
</task>

<task type="auto">
  <name>task 3: Create Redis client tests (auto)</name>
  <files>C:\\Users\\User\\Desktop\\Billion Business\\deterministic-brain-main\\tests\\test_redis.py</files>
  <action>
Implement Redis client tests:
- Test connection with real Redis or in-memory fallback
- Test cache operations (get, set, delete, scan_delete with TTL)
- Test pub/sub messaging with callback handlers
- Test task queue integration (enqueue, dequeue)
- Test metrics collection (counter increment/get)
- Test thread safety and locking
  </action>
  <verify>
pytest tests/test_redis.py -v 2>&1 | grep "PASSED\|FAILED" | tail -5
  </verify>
  <done>
Redis client tests cover all functionality with proper mocking or test instance, achieving >80% coverage.
  </done>
</task>

<task type="auto">
  <name>task 4: Test task queue with Redis and EventBus (auto)</name>
  <files>C:\\Users\\User\\Desktop\\Billion Business\\deterministic-brain-main\\tests\\test_task_queue.py</files>
  <action>
Create comprehensive task queue tests:
- Test handler registration and execution
- Test Redis-based enqueue/dequeue in distributed mode
- Test worker thread lifecycle management
- Test task execution with various types
- Test error handling and retry logic
- Test EventBus integration for task events
  </action>
  <verify>
pytest tests/test_task_queue.py -v 2>&1 | grep "PASSED\|FAILED" | tail -5
  </verify>
  <done>
Task queue tests cover distributed processing, worker management, and EventBus integration with >80% coverage.
  </done>
</task>

<task type="auto">
  <name>task 5: Test CircuitHealer unified observability (auto)</name>
  <files>C:\\Users\\User\\Desktop\\Billion Business\\deterministic-brain-main\\tests\\test_circuit_healer.py</files>
  <action>
Implement CircuitHealer tests:
- Test circuit breaker state transitions (closed → open → half_open)
- Test failure counting and cooldown periods
- Test integration with RuntimeHealer learned constraints
- Test thread safety and locking
- Test logging and metrics collection
- Test graceful degradation and recovery
  </action>
  <verify>
pytest tests/test_circuit_healer.py -v 2>&1 | grep "PASSED\|FAILED" | tail -5
  </verify>
  <done>
CircuitHealer tests cover all aspects of unified observability with >80% coverage.
  </done>
</task>

</tasks>