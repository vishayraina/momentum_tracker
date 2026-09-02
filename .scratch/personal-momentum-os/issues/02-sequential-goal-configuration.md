# 02: Sequential Goal Configuration & Milestone Lifecycle

**What to build:** The user can attach exactly one active sequential Goal/Milestone to any Priority. Goals support multiple measurement types (quantitative count with start value/target value/unit/target date, boolean, qualitative understanding, or maintenance). The user can mark an active milestone as achieved with an optional reflection note, view previous achieved goals in historical sequence, and establish the next sequential milestone.

**Blocked by:** 01: Project Foundation & Priority Definition Tracer Bullet

**Status:** completed

- [x] User can configure an active Goal for a Priority across measurement types (`COUNT`, `BOOLEAN`, `QUALITATIVE`, `MAINTENANCE`).
- [x] Quantitative goals store start value, current value, target value, measurement unit, and optional target date.
- [x] System strictly enforces the sequential goal invariant: only one active Goal per Priority at any time.
- [x] User can mark a Goal as `ACHIEVED` with an optional achievement note, immutably preserving the milestone timestamp.
- [x] User can view the sequence history of previous achieved goals for any Priority.
- [x] Automated integration tests verify single-active-goal enforcement, goal achievement lifecycle, and sequence transitions.
