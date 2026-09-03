# 06: Kitchen Station Dashboard & Portfolio Heat Instrument Panel

**What to build:** The user can view the complete portfolio-level kitchen dashboard in under 10 seconds. The screen presents 5 primary sections: (A) Station View organizing active kitchen priorities partitioned into Station Heat columns (`HIGH_HEAT`, `SIMMER`, `PREP`, `PANTRY`); (B) Portfolio Heat Panel displaying aggregate Heat Vector counts (`MISE_EN_PLACE`, `SEAR`, `DEEP_SIMMER`, `TASTING_NOTE`, `PLATE`, `ORDER_FULFILLED`) over selectable windows (7d, 30d, 90d, all-time); (C) Trajectory Summary comparing actual vs required pace for active dishes across stations; (D) Global Chronological Feed of culinary activity and reflection notes across all stations; and (E) Neutral Observational Signals (e.g. "Simmer station with no heat in 14 days", "Pacing below required trajectory").

**Blocked by:** 05: Deterministic Trajectory & Dish Pacing Engine, 08: 3-Tier Hierarchy Simplification & Station Heat Operating States, 10: Event-Sourced Deltas & Unified Heat & Dish Progress Logging

**Status:** ready-for-agent

- [ ] Section A (Stations): Visual matrix organizing active kitchen priorities by current Station Heat (`HIGH_HEAT`, `SIMMER`, `PREP`, `PANTRY`).
- [ ] Section B (Heat Panel): Aggregate Heat Vector counts (`MISE_EN_PLACE`, `SEAR`, `DEEP_SIMMER`, `TASTING_NOTE`, `PLATE`, `ORDER_FULFILLED`) with configurable time windows (7d, 30d, 90d, all-time).
- [ ] Section C (Trajectory): Multi-station dish progress and pace comparison cards.
- [ ] Section D (Recent Activity): Global chronological feed of all logged heat events and plates across stations.
- [ ] Section E (Signals): Deterministic, non-judgmental observational notices (e.g., simmer stations without heat in 14+ days, dish pacing gaps).
- [ ] Automated integration tests verify dashboard aggregation query performance and signal generation accuracy.
