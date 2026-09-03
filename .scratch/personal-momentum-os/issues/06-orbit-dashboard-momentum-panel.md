# 06: Orbit Dashboard & Portfolio Momentum Instrument Panel

**What to build:** The user can view the complete portfolio-level dashboard in under 10 seconds. The screen presents 5 primary sections: (A) Orbit View displaying active priorities partitioned into Spark, Fire, and Cook columns; (B) Momentum Panel showing aggregate activity counts (Sparks, Fires, Cook Sessions, Syntheses, Goals Achieved) over selectable windows (7d, 30d, 90d, all-time); (C) Trajectory Summary comparing actual vs required pace for active goals; (D) Chronological Recent Activity feed across all priorities; and (E) Neutral Observational Signals (e.g. "8 Cook Sessions since last synthesis", "Pacing below required trajectory").

**Blocked by:** 04: Priority Phase Transitions & State History, 05: Deterministic Trajectory & Pacing Engine

**Status:** ready-for-agent

- [ ] Section A (Orbit): Visual matrix organizing active priorities by current phase (`SPARK`, `FIRE`, `COOK`).
- [ ] Section B (Momentum): Aggregate event counts with configurable time window filters (7d, 30d, 90d, all-time) derived purely from `progress_events`.
- [ ] Section C (Trajectory): Multi-goal progress and pace comparison cards.
- [ ] Section D (Recent Activity): Global chronological feed of all logged events across priorities.
- [ ] Section E (Signals): Deterministic, non-judgmental observational notices (e.g., Cook sessions since last synthesis progress event, pacing gaps).
- [ ] End-to-end integration tests verify dashboard aggregation performance and signal generation.
