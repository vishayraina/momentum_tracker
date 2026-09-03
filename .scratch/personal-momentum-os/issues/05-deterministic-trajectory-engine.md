# 05: Deterministic Trajectory & Dish Pacing Engine

**What to build:** The application calculates and surfaces mathematical progress and trajectory analytics derived purely from raw event delta history and quantitative milestone configuration. For active dishes, the engine computes: dish progress %, rolling actual velocity (units completed per week derived from `progress_events.metric_delta`), required weekly pace to target date, estimated completion date, and trajectory status badges (Ahead, On-Track, Behind, Low Data). If velocity is zero or data is sparse, the system explicitly displays "Projection unavailable" rather than fabricating dates.

**Blocked by:** 09: Universal Quantitative Milestones & Locked Dish Targets, 10: Event-Sourced Deltas & Unified Heat & Dish Progress Logging

**Status:** ready-for-agent

- [ ] Dish progress % correctly computed as `((current_value - start_value) / (target_value - start_value)) * 100`.
- [ ] Actual pace calculated over rolling time windows (e.g. 7d, 30d, all-time) in units/week based on cumulative `metric_delta` sums.
- [ ] Required pace calculated as remaining units divided by remaining weeks to target date.
- [ ] Projected completion date calculated and formatted; gracefully displays "Projection unavailable" when velocity is 0 or data is sparse.
- [ ] Trajectory status badges (Ahead, On-Track, Behind, Low Data) rendered cleanly without punitive styling or guilt-inducing alerts.
- [ ] Comprehensive unit and integration test suite asserting mathematical accuracy across edge cases (0 progress, elapsed deadlines, backdated events, zero-delta sessions).
