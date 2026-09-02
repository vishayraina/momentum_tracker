# Specification: Personal Momentum OS (MVP)

## Problem Statement

Modern productivity and habit tracking tools are fundamentally built around daily task lists, arbitrary streaks, rigid scheduling, and guilt-inducing failure metrics ("missed tasks", "broken streaks", "productivity score drops"). When life gets busy, chaotic, or demands a shift in focus, these tools break down: backlogs pile up with overdue items, users feel demotivated, and they abandon the tool altogether.

Furthermore, conventional task managers operate at the wrong level of abstraction—treating individual micro-tasks as the atomic unit of life rather than measuring long-term trajectory, momentum, and meaningful progress across persistent life priorities. Users lack a mirror and measurement layer that lets them see:
- What long-term priorities they are actively carrying.
- What meaningful progress they have actually achieved over time.
- How fast they are moving toward their milestones.
- When their capacity naturally ebbs and flows without treating lower activity as failure.

## Solution

**Personal Momentum OS** is a self-directed progress and momentum tracking system built as an instrument panel, mirror, memory, and measurement layer for long-term priorities (conceptualized as "moons" orbiting the user's life).

The system operates around a simple, non-prescriptive loop:
> **Define → Live → Log → See → Adjust → Continue**

Key solution principles:
1. **User-Defined Meaning**: The user explicitly defines what constitutes meaningful progress for each priority across operating modes:
   - **Spark**: Minimum energy required to maintain baseline continuity.
   - **Fire**: Exceptional, deliberate injection of focused energy/intensity.
   - **Cook**: Sustained, structured deep work / exploration sessions leading to synthesis.
   - **Synthesis**: Free-form reflective extraction and capture of original understanding.
   - **Serve**: External or durable expression of purified insight.
2. **Immutable Event Log as Source of Truth**: Rapid event logging ("+ Log Progress") in seconds without stopwatch tracking or manual timesheets.
3. **Derived Analytics Layer**: Pure, deterministic computation of progress, actual vs. required pace, estimated completion trajectory, session cadence, and portfolio-level momentum from raw event history.
4. **Zero Guilt & Observational Signals**: Gaps in activity or slower periods are treated as valid historical reality and neutral observations, never as moral failures or negative scores.
5. **Full User Sovereignty**: The system never prescribes daily tasks, prioritizes automatically, or acts as an AI mentor in the MVP.

---

## User Stories

### 1. Hierarchy & Priority Definition
1. As a user, I want to define high-level Life Directions (e.g., "Build Wealth", "Become an Excellent Engineer"), so that I can organize the major domains of my life.
2. As a user, I want to create Areas within Life Directions (e.g., "Investments", "Software Engineering"), so that I can group related long-term commitments.
3. As a user, I want to create persistent Priorities within an Area, so that I can track ongoing long-term pursuits as distinct moons in my orbit.
4. As a user, I want to set a custom definition for what qualifies as a "Spark" for each Priority, so that I have clear personal criteria for minimum maintenance.
5. As a user, I want to set a custom definition for what qualifies as a "Fire" for each Priority, so that I know what an exceptional burst of energy looks like.
6. As a user, I want to set a custom definition for what qualifies as a "Cook Session" for each Priority, so that I define what structured deep work means for that domain.
7. As a user, I want to set a custom definition for what qualifies as a "Synthesis" for each Priority, so that I define the bar for extracted understanding and learning.
8. As a user, I want to view and edit these operating definitions at any time, so that my personal contract can evolve with my understanding.
9. As a user, I want to set the initial operating phase of a Priority (Spark, Fire, or Cook), so that the system reflects my current commitment level.
10. As a user, I want to archive or mark a Priority as inactive, so that it leaves my active orbit without deleting historical data.

### 2. Goals & Milestone Management
11. As a user, I want to define exactly one current sequential Goal/Milestone per Priority, so that my activity has concrete direction without overwhelming parallel targets.
12. As a user, I want to configure a quantitative Goal with a starting value, target value, measurement unit, and target date, so that the system can calculate pace and trajectory.
13. As a user, I want to configure qualitative, boolean, or maintenance-based Goals without numerical targets, so that non-quantitative pursuits are first-class citizens.
14. As a user, I want to mark the current Goal as achieved with an optional reflection note, so that milestone completion is preserved as an immutable historical event.
15. As a user, I want to define the next Goal in the sequence after completing or retiring a previous Goal, so that progress history remains contiguous across milestones.
16. As a user, I want to view the complete history of previous Goals for any Priority, so that I can look back on my journey across milestones.

### 3. Rapid Progress Logging
17. As a user, I want to open a quick logging interface ("+ Log Progress") from anywhere in the application, so that recording progress takes only a few seconds.
18. As a user, I want to record a "Spark" event by selecting a Priority and adding an optional note, so that I log baseline maintenance without friction.
19. As a user, I want to record a "Fire" event against a Priority, so that deliberate energy surges are explicitly captured in my history.
20. As a user, I want to record a "Cook Session" event against a Priority, so that my sustained deep-work sessions are logged and counted.
21. As a user, I want to record a "Synthesis" event with rich long-form reflection text, so that I can document what I learned and synthesized from my work.
22. As a user, I want to record a "Serve" event, so that durable external outputs (articles, frameworks, shared artifacts) are anchored to the Priority timeline.
23. As a user, I want progress events to default to the current timestamp while allowing backdated timestamps, so that I can accurately log activities that happened earlier.
24. As a user, I want to void an incorrectly logged event rather than deleting historical audit trails, so that metric integrity is preserved.

### 4. Phase Control & State History
25. As a user, I want to freely transition a Priority between Spark, Fire, and Cook phases at any time, so that my orbit reflects my shifting focus.
26. As a user, I want phase transitions to automatically log a timestamped transition event with an optional reason/note, so that I have a clear historical record of phase changes.
27. As a user, I want to view the chronological timeline of all past phase transitions for a Priority, so that I understand how long I spent in each phase.
28. As a user, I want phase transitions to be independent of goal achievements, so that completing a milestone does not artificially force a phase change.

### 5. Derived Analytics & Trajectory
29. As a user, I want the system to automatically compute my Goal progress percentage for quantitative Goals, so that I see where I stand without manual counter maintenance.
30. As a user, I want the system to calculate my actual pace (units completed per calendar period/week), so that I know my true historical velocity.
31. As a user, I want the system to calculate the required pace (remaining units divided by remaining weeks), so that I see what pace is needed to meet my target date.
32. As a user, I want the system to project estimated completion dates based on actual rolling velocity, so that I can evaluate whether my target date is realistic.
33. As a user, I want clear trajectory statuses (e.g., On-Track, Ahead, Behind, Low Data) displayed without guilt or punitive styling, so that I can objectively assess pace.
34. As a user, I want to see the count of Cook Sessions completed since the last Synthesis, so that I can gauge the rhythm of my deep work and reflection.
35. As a user, I want to filter derived metrics across standardized time windows (7 days, 30 days, 90 days, 12 months, all time), so that I can inspect trends at multiple granularities.

### 6. Portfolio Dashboard (Orbit & Momentum)
36. As a user, I want to view an "Orbit" panel grouping active Priorities by their current phase (Spark, Fire, Cook), so that I can see my active portfolio in under 10 seconds.
37. As a user, I want to see a "Momentum" panel displaying aggregate activity counts across all priorities (Sparks, Fires, Cook Sessions, Syntheses, Goals achieved), so that I understand total forward movement.
38. As a user, I want to view a "Trajectory" summary panel comparing actual vs. required pace across all active quantitative goals, so that I can identify pacing gaps across my portfolio.
39. As a user, I want to see a chronological "Recent Activity" stream of all logged events across all priorities, so that I can review recent actions at a glance.
40. As a user, I want neutral, observational signals (e.g., "8 Cook Sessions since last synthesis", "No activity in 14 days", "Current pace below target pace"), so that I am alerted to patterns without receiving prescriptive commands.

### 7. Priority Deep-Dive View
41. As a user, I want a dedicated detail view for each Priority showing its area, phase, current goal, definitions, and aggregate activity counts, so that I have complete context in one place.
42. As a user, I want to see a unified timeline of all events (Sparks, Fires, Cook Sessions, Syntheses, Serves, Phase Transitions, Goal Achievements) for a Priority, so that the entire historical narrative is visible.
43. As a user, I want to view and read full Synthesis entries linked to the Priority, so that my captured insights are easily retrievable.
44. As a user, I want to see historical goal completions for the Priority, so that I can review sequential milestones that have been achieved.

### 8. System Integrity & Philosophy Safeguards
45. As a user, I want the application to never generate missed tasks, overdue warnings, or streak-failure penalties, so that periods of low activity or rest remain psychologically safe.
46. As a user, I want all derived calculations to be dynamically computed from immutable event logs, so that metrics never drift or become corrupted.
47. As a user, I want my data to be securely isolated to my personal workspace/account, so that my private reflections and life plans remain confidential.

---

## Implementation Decisions

### 1. Architectural Layers & Separation of Concerns
- **Layer 1: User-Defined Semantics**: Stores the declarative hierarchy (`LifeDirection`, `Area`, `Priority`, `Goal`) and the user's plain-text operating definitions (`spark_definition`, `fire_definition`, `cook_definition`, `synthesis_definition`). The system treats these as user context and never performs semantic NLP validation on them in the MVP.
- **Layer 2: Immutable Event Store**: All historical actions and state transitions are stored as append-only records (`ProgressEvent`, `PhaseTransition`, `Synthesis`, `GoalAchievement`). Erroneous logs are marked `VOIDED` rather than hard-deleted to preserve mathematical auditability.
- **Layer 3: Pure Deterministic Analytics Engine**: All derived metrics (progress %, velocity, rolling actual pace, required pace, projected completion date, session cadence, synthesis gaps, phase durations, portfolio momentum counters) are computed via pure functions over raw event logs and database aggregations. No derived counts (e.g., `cook_session_count`) are persisted as standalone mutable counters.

### 2. Core Domain Data Models & Schema
- **LifeDirection**: `id`, `user_id`, `name`, `description`, `sort_order`, `created_at`, `updated_at`.
- **Area**: `id`, `user_id`, `life_direction_id`, `name`, `description`, `sort_order`, `created_at`, `updated_at`.
- **Priority**: `id`, `user_id`, `area_id`, `name`, `description`, `current_phase` (`SPARK` | `FIRE` | `COOK`), `current_goal_id` (nullable foreign key), `spark_definition`, `fire_definition`, `cook_definition`, `synthesis_definition`, `is_active`, `created_at`, `updated_at`.
- **Goal**: `id`, `user_id`, `priority_id`, `title`, `description`, `measurement_type` (`COUNT` | `BOOLEAN` | `QUALITATIVE` | `MAINTENANCE`), `unit` (nullable string), `start_value` (float), `target_value` (float), `current_value` (float), `target_date` (nullable ISO date), `status` (`ACTIVE` | `ACHIEVED` | `RETIRED`), `sequence_number` (integer), `created_at`, `achieved_at`.
- **ProgressEvent**: `id`, `user_id`, `priority_id`, `goal_id` (nullable), `event_type` (`SPARK` | `FIRE` | `COOK_SESSION` | `SYNTHESIS` | `SERVE` | `GOAL_ACHIEVED`), `occurred_at` (ISO timestamp), `note` (text), `status` (`ACTIVE` | `VOIDED`), `created_at`.
- **PhaseTransition**: `id`, `user_id`, `priority_id`, `from_phase`, `to_phase`, `timestamp`, `note`, `created_at`.
- **Synthesis**: `id`, `user_id`, `priority_id`, `goal_id` (nullable), `progress_event_id`, `title`, `content` (Markdown/rich text), `created_at`, `updated_at`.

### 3. Derived Calculation Contracts
- **Goal Progress**:
  $$\text{Progress \%} = \frac{\text{current\_value} - \text{start\_value}}{\text{target\_value} - \text{start\_value}} \times 100$$
- **Actual Pace (Rolling Window)**:
  $$\text{Actual Pace} = \frac{\text{Units Completed in Window}}{\text{Weeks Elapsed in Window}}$$
- **Required Pace**:
  $$\text{Required Pace} = \frac{\text{target\_value} - \text{current\_value}}{\max(1, \text{Weeks Remaining to Target Date})}$$
- **Projected Completion Date**:
  $$\text{Weeks to Completion} = \frac{\text{target\_value} - \text{current\_value}}{\text{Actual Pace}}$$
  $$\text{Projected Date} = \text{Current Date} + (\text{Weeks to Completion} \times 7 \text{ days})$$
  *(Note: Displayed only when $\text{measurement\_type} = \text{COUNT}$, $\text{Actual Pace} > 0$, and sufficient historical data exists. Otherwise displayed as "Projection unavailable".)*
- **Cook Cycle & Synthesis Rhythm**: Calculated as $\text{COUNT}(\text{COOK\_SESSION})$ occurred after the most recent `SYNTHESIS` event timestamp for that Priority.

### 4. API Surface
- `GET /api/life-directions`, `POST /api/life-directions`, `PATCH /api/life-directions/:id`, `DELETE /api/life-directions/:id`
- `GET /api/areas`, `POST /api/areas`, `PATCH /api/areas/:id`, `DELETE /api/areas/:id`
- `GET /api/priorities`, `POST /api/priorities`, `GET /api/priorities/:id`, `PATCH /api/priorities/:id`
- `POST /api/priorities/:id/phase-transitions`
- `GET /api/priorities/:id/goals`, `POST /api/priorities/:id/goals`, `PATCH /api/goals/:id`, `POST /api/goals/:id/achieve`
- `GET /api/events`, `POST /api/events`, `POST /api/events/:id/void`
- `GET /api/syntheses`, `POST /api/syntheses`, `GET /api/syntheses/:id`, `PATCH /api/syntheses/:id`
- `GET /api/analytics/dashboard` (Returns Orbit portfolio, momentum aggregates, trajectory metrics, recent activity stream, and deterministic signals).
- `GET /api/analytics/priority/:id` (Returns detailed cadence, history timeline, phase durations, and pacing stats).

### 5. Frontend & UX Architecture
- **Primary Views**:
  - `Orbit (Dashboard)`: High-level instrument panel (Orbit Phase Matrix, Momentum Counters, Goal Trajectory Cards, Recent Activity Stream, Observational Signals).
  - `Priorities`: Hierarchical tree browser and priority manager.
  - `Priority Detail`: In-depth timeline, operating definitions, synthesis archive, goal progression, and cadence stats.
  - `Log Modal ("+ Log Progress")`: Ultra-fast 3-step action: Select Event Type → Select Priority → Enter Note/Submit (defaulting timestamp to now).
  - `Synthesis Editor`: Dedicated long-form markdown writing surface.
- **Visual Design & Tone**:
  - Clean, dark/modern aesthetic with curated semantic colors (Spark = Amber/Yellow, Fire = Orange/Crimson, Cook = Violet/Indigo, Synthesis = Emerald/Teal, Serve = Sky/Blue).
  - Neutral observational language for all signals; zero red "overdue" or negative alert banners.

---

## Testing Decisions

### What Makes a Good Test
- Tests must exclusively evaluate **external domain behavior and contract guarantees**, never internal implementation details.
- Tests must verify that the raw event log remains immutable and that all derived analytics (progress, velocity, trajectory, momentum, signals) deterministically produce the exact mathematical result across time windows.
- Tests must assert that phase transitions, goal completions, and event voiding preserve complete historical records.

### Proposed Test Seams (Primary Seam)
1. **Primary Seam — API & Domain Integration Seam (Highest Seam)**:
   - Tests execute against the complete API service layer connected to the database (or test database).
   - Test suites simulate real multi-week user journeys:
     - Priority creation with definitions and initial phase.
     - Sequential goal setup and updates.
     - Fast progress event logging (`SPARK`, `FIRE`, `COOK_SESSION`, `SYNTHESIS`, `SERVE`, `GOAL_ACHIEVED`).
     - Event voiding and metric recalculation.
     - Querying `/api/analytics/dashboard` and `/api/analytics/priority/:id` to assert exact trajectory calculations (actual pace, required pace, projection date, Cook-to-Synthesis session count, momentum aggregates, and deterministic signals).
2. **Secondary Seam — UI Component & Fast-Logging Interaction Seam**:
   - Component integration tests verifying the rapid logging workflow (`LogProgressModal`), phase switching interactions (`PhaseSelector`), and dashboard card rendering under empty, sparse, and rich historical states.

---

## Out of Scope (Explicit Exclusions for MVP)

- **No AI Mentorship or Prescriptive Agents**: System does not recommend what the user should work on or provide unsolicited life advice.
- **No Automatic Semantic Classification**: The system does not use NLP to guess if an activity was a Spark vs. Cook; the user explicitly decides.
- **No Daily Task Lists or Checklists**: No "Today's To-Dos" or daily planning routines.
- **No Stopwatch / Time Tracking**: No manual timers, duration fields in minutes/hours, or timesheets.
- **No Gamification or Universal Score**: No arbitrary composite score (e.g. "82/100") or streak-maintenance punishments.
- **No Automatic Phase Shifting**: Phases are only modified upon explicit user transition.
- **No Social or Collaboration Features**: Single-user workspace isolation.

---

## Further Notes

- **Upward Spiral Philosophy**: The entire product lifecycle is modeled around *Maintain (Spark) → Intensify (Fire) → Cook (Deep Work) → Extract Understanding (Synthesis) → Serve (Durable Output) → Continue*.
- **Extensibility for Future AI**: The strict separation between immutable event history and deterministic derived metrics ensures that when an AI layer is added in future phases, it will operate on clean, auditable historical telemetry rather than guessed or corrupted states.
