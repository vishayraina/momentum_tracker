# 07: End-to-End Kitchen Loop Polish, Mobile Fast-Logging & Master Chef Export

**What to build:** The user experiences a polished, responsive, and reliable Master Chef OS. Fast-logging is optimized for sub-second interactions on mobile touch screens for `🍳 + Log Heat & Dish`, keyboard shortcuts allow rapid desktop heat recording, culinary empty states guide users with zero guilt or pressure, and a full JSON export endpoint enables offline data portability and backup across the 3-tier hierarchy, active dishes, the Waste Ledger, and station heat event histories.

**Blocked by:** 06: Kitchen Station Dashboard & Portfolio Heat Instrument Panel, 11: The Chef's Waste Ledger, Scrapped Dish Retrospectives & Order Fulfillment

**Status:** ready-for-agent

- [ ] Mobile-first responsive layout optimization for rapid `🍳 + Log Heat & Dish` recording on touch devices.
- [ ] Global keyboard shortcut (e.g. `Cmd/Ctrl+K` or `L`) to trigger the unified logging modal instantly.
- [ ] Welcoming empty states adhering strictly to zero-guilt culinary philosophy when stations have no recent heat.
- [ ] Workspace data export endpoint (`GET /api/export`) returning full JSON backup of 3-tier hierarchy, quantitative dishes, Waste Ledger, heat events, and station heat transitions.
- [ ] Automated end-to-end acceptance tests validating the complete user loop: Define Station → Fire Dish → Log Heat & Deltas → Plate Deliverable → Fulfill / Scrap to Waste Ledger → View Trajectory & Heat Panel → Export JSON.
