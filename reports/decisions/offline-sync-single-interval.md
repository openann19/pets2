# Offline Sync Interval & Re-Entrancy Policy

## Context

`OfflineSyncService` previously scheduled multiple background intervals during repeated initialisation in tests and provided no coordination across concurrent instances. This caused timer leaks under Jest fake timers and allowed parallel queue drains to compete for the same requests, contributing to flaky behaviour.

## Decision

- Maintain a single background interval per service instance and clear it on every re-initialisation or disposal.
- Introduce an AsyncStorage-backed processing lock (`@pawfectmatch_offline_queue_lock`) so that only one instance drains the queue at a time. Locks automatically expire after 30s and are renewed while a flush is running.
- Guard queue draining with `syncInProgress` plus the distributed lock; subsequent calls schedule a retry with exponential backoff + jitter instead of spinning.
- Expose `dispose()` for predictable teardown in tests; disposal clears intervals, scheduled retries, network subscriptions, and releases the processing lock if held.

## Consequences

- Deterministic timer lifecycle in both real timer and fake timer environments (no orphan intervals, improved Jest stability).
- Queue drains are strictly serialised: race conditions between app tabs or overlapping test instances now yield a lock retry instead of duplicate network traffic.
- Tests and higher level flows must call `dispose()` when manually instantiating the service to keep the lock/interval hygiene guarantees.

