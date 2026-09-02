# 06: Deterministic Trajectory & Pacing Engine

**What to build:** The application calculates and surfaces mathematical progress and trajectory analytics derived purely from raw event history and goal configuration. For measurable goals, the engine computes: goal progress %, rolling actual velocity (units completed per week), required weekly pace to target date, estimated completion date, and trajectory status badges (Ahead, On-Track, Behind, Low Data). If velocity is zero or data is sparse, the system explicitly displays "Projection unavailable" rather than fabricating dates.

**Blocked by:** 02: Sequential Goal Configuration & Milestone Lifecycle, 03: Rapid Progress Event Logging & Timeline Audit

**Status:** ready-for-agent

- [ ] Goal progress % correctly computed as `((current_value - start_value) / (target_value - start_value)) * 100`.
- [ ] Actual pace calculated over rolling time windows (e.g. 7d, 30d, all-time) in units/week.
- [ ] Required pace calculated as remaining units divided by remaining weeks to target date.
- [ ] Projected completion date calculated and formatted; gracefully displays "Projection unavailable" when velocity is 0 or data is sparse.
- [ ] Trajectory status badges (Ahead, On-Track, Behind, Neutral) rendered cleanly without punitive styling or guilt-inducing alerts.
- [ ] Comprehensive unit and integration test suite asserting mathematical accuracy across edge cases (0 progress, elapsed deadlines, backdated events, negative start values).
