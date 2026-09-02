# 03: Rapid Progress Event Logging & Timeline Audit

**What to build:** The user can log meaningful progress in seconds through a fast, lightweight modal ("+ Log Progress"). The user selects an event type (`SPARK`, `FIRE`, `COOK_SESSION`, `SERVE`, `GOAL_ACHIEVED`), selects the Priority (and optional active Goal), and enters an optional one-line note, defaulting the timestamp to current time while allowing backdating. The Priority detail view displays a chronological timeline of all recorded events, and users can void erroneous entries (`status: VOIDED`) to maintain metric integrity without destroying audit logs.

**Blocked by:** 01: Project Foundation & Priority Definition Tracer Bullet, 02: Sequential Goal Configuration & Milestone Lifecycle

**Status:** ready-for-agent

- [ ] Fast "+ Log Progress" UI modal accessible globally to record `SPARK`, `FIRE`, `COOK_SESSION`, `SERVE`, and `GOAL_ACHIEVED` events.
- [ ] Events record `user_id`, `priority_id`, optional `goal_id`, `event_type`, `occurred_at`, `note`, and `status`.
- [ ] Priority detail page renders an immutable chronological event timeline.
- [ ] User can void an erroneous event (`status: VOIDED`), immediately excluding it from active metrics while retaining the audit record.
- [ ] Automated tests verify sub-second logging API performance, event storage, timeline sorting, and voiding semantics.
