# 10: Event-Sourced Deltas & Unified Heat & Dish Progress Logging

**What to build:** The user records productive sessions through a single unified touchpoint on the Priority card (**`🍳 + Log Heat & Dish Progress`**), eliminating the double-entry tax of separate effort logging and counter adjustments. The unified modal captures both Heat Applied (selecting from 5 Heat Vectors: `MISE_EN_PLACE`, `SEAR`, `DEEP_SIMMER`, `TASTING_NOTE`, `PLATE` with a brief reflection note) and optional Dish Advancement (numeric delta pre-filled with the active milestone's unit). Outcome progress is event-sourced from event deltas, ensuring zero-delta research or prep sessions are celebrated on the timeline without guilt while positive deltas immediately advance the dish. Voiding an entry automatically rolls back its delta from active dish progress while preserving audit history. Priority cards surface Dual Instrumentation: a Station Heat Gauge and a Dish Progress Gauge alongside the station timeline.

**Blocked by:** 03: Rapid Progress Event Logging & Timeline Audit, 08: 3-Tier Hierarchy Simplification & Station Heat Operating States, 09: Universal Quantitative Milestones & Locked Dish Targets

**Status:** ready-for-agent

- [ ] Single primary action on Priority card (`🍳 + Log Heat & Dish Progress`) opens the unified logging modal.
- [ ] Modal captures Heat Vector (`MISE_EN_PLACE`, `SEAR`, `DEEP_SIMMER`, `TASTING_NOTE`, `PLATE`), reflection note, and optional numeric `metric_delta`.
- [ ] Active milestone progress is event-sourced from the sum of non-voided event deltas: `current_value = start_value + sum(metric_delta)`.
- [ ] Zero or empty deltas validate effort on the station timeline as heat without requiring dish progress or inducing guilt.
- [ ] Positive deltas immediately advance the active milestone gauge.
- [ ] Voiding an event rolls back its delta atomically from active milestone progress without mutating historical rows.
- [ ] Priority card displays Dual Instrumentation: Station Heat Gauge (effort cadence/intensity) and Dish Progress Gauge (% to target).
- [ ] Station timeline renders chronological event history with Master Chef heat vector badges and reflection notes.
- [ ] Automated integration tests verify unified logging API, delta calculations, zero-delta heat entries, and transactional voiding rollbacks.
