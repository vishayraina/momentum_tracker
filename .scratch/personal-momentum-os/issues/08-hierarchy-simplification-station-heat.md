# 08: 3-Tier Hierarchy Simplification & Station Heat Operating States

**What to build:** The user organizes their life and disciplines directly using a clean 3-tier hierarchy (Life Direction → Priority Station → Active Milestone Dish), eliminating the cognitive overhead and categorization fatigue of intermediate Areas. Priorities directly represent persistent Kitchen Stations attached to Life Directions. Stations operate under Master Chef Station Heat states (`HIGH_HEAT`, `SIMMER`, `PREP`, `PANTRY`) that the user can transition freely at any time with an optional transition note. The dashboard UI presents Priorities grouped directly under Life Direction headers, displays distinct Station Heat status badges, and provides filtering by Life Direction.

**Blocked by:** 01: Project Foundation & Priority Definition Tracer Bullet, 04: Priority Phase Transitions & State History

**Status:** ready-for-agent

- [ ] Priorities link directly to Life Directions without requiring an intermediate Area.
- [ ] Existing priority data and relationships migrate cleanly to reference Life Directions directly, and the legacy intermediate Area tier is fully retired.
- [ ] Priorities support Master Chef Station Heat operating states (`HIGH_HEAT`, `SIMMER`, `PREP`, `PANTRY`).
- [ ] Users can transition a station's heat state freely with an optional transition note, recording state transition history and duration spent in current heat.
- [ ] Dashboard displays Priorities grouped directly under Life Direction sections with Station Heat badges and responsive Life Direction filters.
- [ ] Automated integration tests verify 3-tier hierarchy operations, station heat transitions, cascade deletion from Life Directions, and user data isolation.
