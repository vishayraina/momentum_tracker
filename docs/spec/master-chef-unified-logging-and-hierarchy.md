# Specification: Master Chef OS — Unified Effort & Outcome Logging, Hierarchy Simplification & Anti-Gamification

## Problem Statement

Users face severe cognitive friction, double-entry overhead, and psychological misalignment under the current tracking model:
1. **Disconnected Effort and Outcomes**: To record a productive session, users must navigate two disjointed actions: `⚡ + Log` to write an activity to the timeline, and `+ Progress` on the milestone card to manually change a number. This creates a "Double-Entry Tax".
2. **The "Silent Progress" Bug**: Directly updating a milestone gauge leaves zero historical record or story on the chronological timeline.
3. **The "Failure Fallacy" of Unlinked Effort**: Deep, grueling study sessions that yield zero immediate numerical output (e.g. 2 hours studying nutrition or debugging architecture) cannot advance the milestone counter, making the session feel unrewarded if effort and outcome are conflated.
4. **Taxonomy Fatigue via Intermediate `Area`**: The 4-tier hierarchy (`Direction -> Area -> Priority -> Milestone`) forces users to categorize priorities under vague intermediate "Areas" that contribute no distinct velocity metrics.
5. **Naked Boolean Inconsistency**: Allowing boolean milestones bifurcates data models and UI views, preventing uniform progress bar calculations.
6. **Gamified Deadline Slippage**: Users can quietly edit deadlines and targets when falling behind, removing accountability and subverting the product's purpose as an honest mirror.

---

## Solution

Transform Personal Momentum OS into an integrated **Master Chef / Kitchen OS** governed by the ubiquitous language in [CONTEXT.md](file:///Users/vishayraina/Desktop/momentum_tracker/CONTEXT.md), [ADR 0001](file:///Users/vishayraina/Desktop/momentum_tracker/docs/adr/0001-unified-effort-and-outcome-logging.md), and [ADR 0002](file:///Users/vishayraina/Desktop/momentum_tracker/docs/adr/0002-master-chef-domain-model.md):

1. **3-Tier Hierarchy (Eliminate `Area`)**:
   - `Life Direction` (Restaurant Menu: Craft, Health, Capital, Spirit)
   - `Priority` (Kitchen Station / Active Burner)
   - `Milestone` (Active Dish / Order Ticket)
2. **Universal Quantitative Milestones**: Every milestone requires a numeric target and unit (`75 questions`, `21 days`, `1 deliverable`, `100 %`).
3. **Unified Single-Touchpoint Logging**:
   - Launched directly from the Priority Card: **`🍳 + Log Heat & Dish Progress`**.
   - Captures **Heat Applied (Effort Profile + Note)** and optional **Dish Advancement (Delta towards target)** in one fast flow.
   - Outcome progress is event-sourced from event deltas. Zero-delta sessions are fully validated and light up station heat.
4. **Clean Decoupling of Intermediate Artifacts vs. Milestone Completion**:
   - Intermediate deliverables (blog posts, RFCs, PRs) are logged as **`Plate`** actions without advancing the main dish ticket.
   - Reaching the full target triggers **`Order Fulfilled`**.
5. **The Chef's Waste Ledger (Anti-Gamification)**:
   - Deadlines and targets are immutable once confirmed.
   - Abandoned or missed dishes must be explicitly sent to the **Waste Ledger** (`Scrapped Dish`) with a mandatory post-mortem reflection before a new dish can be fired on that station.
6. **Harmonized Station Heat States**:
   - `HIGH_HEAT` (Front burner / primary focus)
   - `SIMMER` (Back burner / habit maintenance)
   - `PREP` (Mise en place / research)
   - `PANTRY` (Cold storage / dormant)

---

## User Stories

### 1. 3-Tier Hierarchy & Station Setup
1. As a user, I want to create a Priority directly linked to a Life Direction, so that I do not have to create or manage an intermediate Area.
2. As a user, I want to view my Priorities grouped directly under their parent Life Directions on the dashboard, so that I have a clean 3-level mental model.
3. As a user, I want to filter my dashboard by Life Direction, so that I can focus on a single domain of my life.
4. As a user, I want to assign an initial Heat State (`HIGH_HEAT`, `SIMMER`, `PREP`, `PANTRY`) to a Priority upon creation, so that my active stations accurately reflect their current attention level.
5. As a user, I want to transition a Priority's Heat State at any time with an optional transition note, so that I capture why a station was moved to high flame or the back burner.

### 2. Universal Quantitative Milestones (Dishes)
6. As a user, I want every new Milestone to require a target value and unit, so that all active dishes have a well-defined finish line.
7. As a user, I want to define habit milestones using days as the unit (e.g. 21 days), so that daily practices are tracked with the same mathematical elegance as numerical targets.
8. As a user, I want to define single-artifact deliverables using 1 unit or 100%, so that qualitative deliverables fit seamlessly into the quantitative model.
9. As a user, I want only one active Milestone per Priority at any time, so that each kitchen station stays focused on a single order ticket.
10. As a user, I want to see a consistent percentage progress bar and metric readout on every active milestone card, so that I instantly know where the dish stands.

### 3. Unified Logging: Heat & Dish Progress
11. As a user, I want a single logging button on the Priority card, so that I never have to decide between logging an event or updating a counter.
12. As a user, I want to select from five clear heat profiles (`MISE_EN_PLACE`, `SEAR`, `DEEP_SIMMER`, `TASTING_NOTE`, `PLATE`), so that I can accurately categorize the intensity of my effort.
13. As a user, I want to record a brief reflection note with every effort session, so that my future self understands what was worked on.
14. As a user, I want an optional numeric delta field pre-filled with the active milestone's unit, so that I can advance the dish in the same submission.
15. As a user, I want to submit a log entry with a 0 or empty delta, so that my deep study and research sessions are celebrated on the timeline without feeling like failures.
16. As a user, I want the milestone progress bar to update immediately upon logging a positive delta, so that I see instant visual feedback.
17. As a user, I want progress events to default to the current timestamp while allowing manual backdating, so that I can log activities performed earlier in the day.

### 4. Intermediate Artifacts & Milestone Completion
18. As a user, I want to log a `PLATE` event when I publish an article or document without marking the active milestone as complete, so that intermediate wins are recognized without corrupting the dish's status.
19. As a user, I want the system to automatically flag when cumulative deltas reach or exceed the target value, prompting me to celebrate the dish as `Order Fulfilled`.
20. As a user, I want to record a closing reflection note when fulfilling an order, so that the lessons learned from the completed dish are permanently archived.
21. As a user, I want completing a milestone to clear the active station rail, so that I am ready to fire the next sequential dish.

### 5. Anti-Gamification & The Waste Ledger
22. As a user, I want confirmed milestone targets and deadlines to be locked against arbitrary editing, so that I cannot silently move the goalposts when falling behind.
23. As a user, I want a dedicated `Scrap Dish` action on active milestones, so that I can deliberately abandon a stale or burned target.
24. As a user, I want the system to require a post-mortem reflection when scrapping a dish, so that I examine why the dish burned before starting anew.
25. As a user, I want scrapped dishes to be preserved in an immutable Waste Ledger, so that I maintain a completely honest accounting of my journey.
26. As a user, I want to view historical completed dishes and scrapped dishes in a dedicated station history modal, so that I can review past orders and retrospectives.

### 6. Dual Instrumentation & Station Health
27. As a user, I want to see a Heat Gauge on each Priority card showing recent effort intensity and cadence, so that I know whether the station is hot or growing cold.
28. As a user, I want to see a Dish Gauge showing progress toward the active milestone, so that I know physical distance traveled.
29. As a user, I want to view a unified station timeline containing heat events, plated artifacts, state changes, and order completions, so that I can read the complete narrative of that station.
30. As a user, I want to void an erroneous log entry, so that any associated delta is automatically subtracted from the milestone without mutating historical rows.

---

## Implementation Decisions

### 1. Architectural & Schema Changes
- **Deprecate & Remove `areas` Table**:
  - Add `life_direction_id TEXT NOT NULL` directly to the `priorities` table with a foreign key referencing `life_directions(id) ON DELETE CASCADE`.
  - Migrate existing priority data to reference parent life directions directly and drop the `areas` table and indices.
- **Enhance `goals` Table for Universal Quantification & Waste Tracking**:
  - Enforce `target_value REAL NOT NULL` and `unit TEXT NOT NULL` on all goals. Remove legacy `BOOLEAN` type handling.
  - Add `waste_reason TEXT` and `scrapped_at TEXT` to support the anti-gamification Waste Ledger when status is `RETIRED`.
  - Disallow updates to `title`, `target_value`, and `target_date` on active goals; only `achieve` and `retire` (scrap) transitions are permitted.
- **Event-Sourced Deltas in `events` Table**:
  - Add `metric_delta REAL DEFAULT NULL` to the `events` table.
  - Update `event_type` check constraints / validation to the Master Chef vocabulary:
    `['MISE_EN_PLACE', 'SEAR', 'DEEP_SIMMER', 'TASTING_NOTE', 'PLATE', 'ORDER_FULFILLED', 'SCRAPPED_DISH']`.
  - Update Priority phase states to:
    `['HIGH_HEAT', 'SIMMER', 'PREP', 'PANTRY']`.
  - Derive a goal's current progress dynamically or update transactionally:
    $$\text{current\_value} = \text{start\_value} + \sum_{e \in \text{ActiveEvents}} e.\text{metric\_delta}$$

### 2. Service Layer Refactoring
- **`PriorityService`**:
  - Update CRUD methods to take `life_direction_id` instead of `area_id`.
  - Update phase validation to accept `HIGH_HEAT`, `SIMMER`, `PREP`, `PANTRY`.
- **`GoalService`**:
  - Reject goal creation without numeric `target_value` and string `unit`.
  - Implement `scrapDish({ id, userId, reason, scrappedAt })` which logs a `SCRAPPED_DISH` event and immutably retires the goal.
  - Compute `current_value` by summing `metric_delta` from active linked events for maximum audit integrity.
- **`EventService`**:
  - Accept `metric_delta` in event creation.
  - If `goal_id` and `metric_delta` are provided, atomically update/verify goal progress within a database transaction.
  - When an event is marked `VOIDED`, recalculate the linked goal's `current_value`.

### 3. REST API Contracts
- `POST /api/events`:
  Payload: `{ priorityId, goalId?, eventType, note?, metricDelta?, occurredAt? }`
- `POST /api/goals/:id/scrap`:
  Payload: `{ reason, scrappedAt? }`
- `GET /api/priorities?lifeDirectionId=...`:
  Returns priorities grouped directly by Life Direction, including active dish, heat metrics, and timeline summary.

### 4. Frontend & User Interface
- **Priority Card**:
  - Replace the dual buttons (`+ Progress` and `+ Log`) with a single primary button: **`🍳 + Log Heat & Dish`**.
  - Display dual gauges: **Heat Gauge** (effort intensity) and **Dish Progress Gauge** (% to target).
  - Status badges update to: `HIGH HEAT`, `SIMMER`, `PREP`, `PANTRY`.
- **Unified Log Modal**:
  - Radio selector for the 5 Heat Vectors with intuitive chef icons.
  - One-line reflection note input.
  - Contextual delta stepper: `Advance Dish: [ +0 ] [unit]`.
- **Scrap Dish Flow**:
  - Replaces "Edit Goal" with "Scrap Dish" triggering the post-mortem reason modal.

---

## Testing Decisions

### The Single Highest Seam: End-to-End HTTP API Integration Tests
- Tests are executed through `createTestClient(app)` against an isolated in-memory SQLite database (`tests/test-client.js`).
- Tests verify external HTTP request/response behavior, database persistence, transaction atomicity, derived calculations, and user data isolation without mocking internal service functions.

### Modules Tested
1. **`tests/integration/hierarchy-simplification.test.js`**:
   - Creating, listing, updating, and cascade-deleting priorities directly under Life Directions without an intermediate Area.
   - User data isolation across 3-tier hierarchies.
2. **`tests/integration/unified-logging-and-deltas.test.js`**:
   - Logging effort with positive deltas advances the goal's derived progress.
   - Logging zero-delta effort logs timeline heat while leaving goal progress unchanged.
   - Voiding an event decrements the goal progress atomically.
3. **`tests/integration/waste-ledger-and-anti-gamification.test.js`**:
   - Attempting to mutate locked goal targets or deadlines is rejected with 400.
   - Scrapping a dish requires a reason, logs a `SCRAPPED_DISH` event, and records to the waste ledger.
   - Subsequent goal activation after scrapping succeeds.

### Prior Art
- Existing 54 integration tests in `tests/integration/` (`event-logging.test.js`, `goal-milestone.test.js`, `phase-transition.test.js`, `priority-foundation.test.js`).

---

## Out of Scope

1. Long-form WYSIWYG markdown editor or separate document repository (kept as rapid text notes).
2. Multi-tenant collaborative kitchens or public social feeds.
3. Automated third-party health or git integrations (manual rapid entry only).
4. Audio / kitchen sound effects.

---

## Further Notes

- Governed by [CONTEXT.md](file:///Users/vishayraina/Desktop/momentum_tracker/CONTEXT.md), [ADR 0001](file:///Users/vishayraina/Desktop/momentum_tracker/docs/adr/0001-unified-effort-and-outcome-logging.md), and [ADR 0002](file:///Users/vishayraina/Desktop/momentum_tracker/docs/adr/0002-master-chef-domain-model.md).
- Downstream impact: Updates requirements for Issue #05 (Synthesis), Issue #06 (Pacing Engine), and Issue #07 (Dashboard Panel).
