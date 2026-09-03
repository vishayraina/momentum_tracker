# 09: Universal Quantitative Milestones & Locked Dish Targets

**What to build:** Every sequential Milestone (Dish) requires an explicit quantitative target value and measurement unit (e.g. `75 problems`, `21 days`, `1 draft`, `100 %`), standardizing all dishes into a uniform numerical finish line and retiring legacy boolean/qualitative branching. To eliminate gamified deadline slippage and enforce radical honesty, confirmed milestone targets, titles, and deadlines are strictly locked against arbitrary editing once active. Active milestone cards render a uniform percentage progress bar and numerical readout with explicit lock status, while preserving the invariant of exactly one active dish per kitchen station.

**Blocked by:** 02: Sequential Goal Configuration & Milestone Lifecycle, 08: 3-Tier Hierarchy Simplification & Station Heat Operating States

**Status:** ready-for-agent

- [ ] Creating a Milestone strictly requires a positive numeric `target_value` and string `unit`.
- [ ] Habit tracking (e.g. `21 days`) and single deliverables (e.g. `1 draft`, `100 %`) seamlessly configure using quantitative units.
- [ ] System strictly rejects mutation attempts to `title`, `target_value`, and `target_date` on active milestones with HTTP 400.
- [ ] Invariant of exactly one active Milestone (Dish) per Priority station is strictly enforced.
- [ ] Active milestone card renders a uniform percentage progress bar, numerical readout (`current_value / target_value unit`), and visual lock indicator.
- [ ] Automated integration tests verify quantitative validation, target lock enforcement, and single-active-dish invariant across users.
