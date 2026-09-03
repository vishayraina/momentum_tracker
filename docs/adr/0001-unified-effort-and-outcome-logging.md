# Unified Effort (Heat) and Outcome (Dish Progress) Logging

- **Status**: Accepted
- **Date**: 2026-09-03

We unified the separate `+ Log` (effort) and `+ Progress` (metric counter) actions into a single modal on the Priority Card that records both the heat applied (effort profile and reflection note) and the quantitative dish advancement (outcome delta). Previously, updating a metric left zero trace on the activity timeline, while logging an effort session did not advance milestone counters, creating cognitive friction and punishing sessions that produced indirect progress. Every log entry now event-sources outcome deltas, ensuring that spending two hours on deep research without moving the metric is validated as honest effort, while metric advances automatically update the dish gauge.

## Considered Options
- **Separate Intentions (CRUD)**: Keeping `+ Log` for events and `+ Progress` for in-place counter mutations. Rejected because it incurs a double-entry tax and leaves metric updates unrecorded on the timeline.
- **Event-Sourced Unified Log**: One modal capturing heat and delta together. Accepted.
