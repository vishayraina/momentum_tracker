# 11: The Chef's Waste Ledger, Scrapped Dish Retrospectives & Order Fulfillment

**What to build:** The user experiences a disciplined milestone completion and retirement lifecycle that reinforces anti-gamification and honest self-reflection. When cumulative deltas fulfill an active dish's target, the system prompts the user to celebrate the dish as `Order Fulfilled` with an archived reflection note, clearing the station rail for the next sequential dish. Intermediate tangible deliverables are cleanly logged as `PLATE` artifacts without completing the dish. If an active milestone is abandoned or missed, the user cannot quietly slip deadlines; they must explicitly invoke `Scrap Dish` with a mandatory post-mortem reflection explaining why the dish burned. Scrapped dishes are permanently preserved in the Chef's Waste Ledger with post-mortems, and users can review past fulfilled dishes and the Waste Ledger via a dedicated Station History modal.

**Blocked by:** 10: Event-Sourced Deltas & Unified Heat & Dish Progress Logging

**Status:** ready-for-agent

- [ ] Logging a `PLATE` event records an intermediate deliverable without completing or closing the active dish.
- [ ] System detects when cumulative deltas reach or exceed target value and prompts `Order Fulfilled` completion flow.
- [ ] Completing an order records an `ORDER_FULFILLED` event and an immutable closing reflection note, clearing the station for the next dish.
- [ ] `Scrap Dish` action requires a mandatory post-mortem reflection note and records a `SCRAPPED_DISH` event on the station timeline.
- [ ] Scrapped dishes are immutably archived in the Chef's Waste Ledger (`status: RETIRED`, `waste_reason`, `scrapped_at`).
- [ ] Station History modal allows users to review fulfilled dishes and past entries in the Waste Ledger with their reflections.
- [ ] After fulfilling or scrapping a dish, the user can immediately fire a new sequential dish on that station.
- [ ] Automated integration tests verify order fulfillment, plate decoupling, scrap dish post-mortem validation, Waste Ledger persistence, and station reactivation.
