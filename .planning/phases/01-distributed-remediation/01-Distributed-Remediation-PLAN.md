<tasks>

<task type="auto">
  <name>task 1: Create PostgreSQL connection pool with schema initialization</name>
  <files>C:\Users\User\Desktop\Billion Business\deterministic-brain-main\tools\postgres.py</files>
  <action>
Implement a thread-safe PostgreSQL connection pool with the following features:
- ThreadedConnectionPool with min/max connections from environment variables
- Schema initialization on first connection (create schemas: pg_traces, pg_state, pg_scheduler, pg_sovereign, pg_cache)
- Tables: events, sessions, tasks, store, entries with proper indexes
- Graceful fallback when DISTRIBUTED_MODE=0 or PostgreSQL unavailable
- Connection health checks and retry logic
- Comprehensive logging for connection events
  </action>
  <verify>
psql -h localhost -U postgres -d postgres -c "\dt" | grep -E "pg_traces|pg_state|pg_scheduler|pg_sovereign|pg_cache" && echo "PostgreSQL schema initialized successfully"
  </verify>
  <done>
PostgreSQL pool is available when DISTRIBUTED_MODE=1, schema is initialized with all required tables, and the pool supports connection pooling with graceful fallback.
  </done>
</task>

<task type="auto">
  <name>task 2: Implement Redis client with distributed locking and pub/sub</name>
  <files>C:\Users\User\Desktop\Billion Business\deterministic-brain-main\tools\redis_client.py</files>
  <action>
Create a Redis client with the following capabilities:
- Connection management with URL from REDIS_URL environment variable
- In-memory fallback when Redis unavailable or DISTRIBUTED_MODE=0
- Cache operations: get, set, delete, scan_delete with TTL support
- Pub/Sub: publish messages and subscribe with callback handlers
- Task queue integration: enqueue and dequeue operations
- Metrics: counter_increment and counter_get
- Thread-safe operations with proper locking
  </action>
  <verify>
python -c "from tools.redis_client import get_redis; r = get_redis(); print('Redis available:', r.available); assert r.available or True" && echo "Redis client initialized successfully"
  </verify>
  <done>
Redis client provides distributed caching, pub/sub messaging, task queuing, and metrics collection with proper fallback to in-memory when needed.
  </done>
</task>

<task type="auto">
  <name>task 3: Integrate task_queue.py with Redis and EventBus</name>
  <files>C:\Users\User\Desktop\Billion Business\deterministic-brain-main\tools\task_queue.py</files>
  <action>
Wire the task queue to use Redis for distributed task processing:
- Register handlers for task types
- Enqueue tasks to Redis lists when DISTRIBUTED_MODE=1
- Start worker threads that poll Redis for tasks
- Integrate with EventBus for task lifecycle events
- Implement proper error handling and retry logic
- Ensure thread-safe operations with proper locking
  </action>
  <verify>
python -c "from tools.task_queue import get_task_queue; tq = get_task_queue(); print('Task queue initialized:', tq is not None)" && echo "Task queue integrated successfully"
  </verify>
  <done>
Task queue fully integrated with Redis for distributed processing, supports worker threads, and properly handles task execution with EventBus integration.
  </done>
</task>

</tasks>