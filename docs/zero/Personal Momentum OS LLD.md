# Personal Momentum OS
## MVP Low-Level / Implementation Design

### 1. Implementation Goal

Build the smallest reliable system that lets a user:

1. Define their life hierarchy.
2. Define persistent priorities.
3. Define the current milestone for each priority.
4. Define what Spark, Fire, Cook Session, and Synthesis mean for that priority.
5. Log meaningful progress in seconds.
6. Change priority phase freely.
7. Preserve every meaningful event and phase transition.
8. Calculate progress, pace, velocity, trajectory, and basic momentum from the history.
9. Review the system at both portfolio and priority level.

The MVP should be intentionally **non-agentic**.

There is no AI interpretation of the user's life, no recommendation engine, and no automatic prioritization.

---

# 2. Architectural Principle

The system has three layers:

### User-defined semantics

The user decides:

- what matters
- what each priority means
- what counts as Spark
- what counts as Fire
- what counts as a Cook Session
- what counts as Synthesis
- what the current milestone is
- what phase the priority is in

### Event history

The application records:

- Sparks
- Fires
- Cook Sessions
- Syntheses
- Serves
- Goal achievements
- phase transitions

### Derived intelligence

The application calculates:

- progress
- cadence
- velocity
- required pace
- projected completion
- activity gaps
- portfolio momentum
- historical trends

This separation is fundamental.

The system **never needs to understand the domain itself**.

For example, it does not need to know what constitutes meaningful real-estate research. It only needs to know:

> The user defines this as a Cook Session.

---

# 3. Domain Model

## 3.1 LifeDirection

Represents a broad direction.

```text
LifeDirection
--------------
id
name
description
sort_order
created_at
updated_at
```

Example:

```text
Build Wealth
Become an Excellent Engineer
Develop Physical Strength
Develop Spiritually
```

---

## 3.2 Area

A subdivision of a Life Direction.

```text
Area
----
id
life_direction_id
name
description
sort_order
created_at
updated_at
```

Example:

```text
Build Wealth
  └── Investments

Become an Excellent Engineer
  └── Software Engineering
```

---

## 3.3 Priority

The persistent “moon” the user is carrying.

```text
Priority
--------
id
area_id
name
description

current_phase
current_goal_id

spark_definition
fire_definition
cook_definition
synthesis_definition

is_active

created_at
updated_at
```

Example:

```text
Area: Investments
Priority: Build a real estate portfolio
Phase: Cook
```

A Priority persists across multiple goals.

---

# 4. Phase Model

The MVP uses three operating modes:

```text
SPARK
FIRE
COOK
```

These are deliberately not implemented as a rigid workflow.

### Spark

Minimum meaningful engagement.

Example:

> Solve/revise 1–2 DSA problems per week.

### Fire

Exceptional injection of attention.

Example:

> Spend an unusually large block of attention researching an investment.

### Cook

Sustained structured engagement.

Example:

> Investigate assumptions behind real-estate rental yield and capital appreciation.

The phase is **state**.

Events are **things that happen**.

Therefore:

```text
Priority phase = COOK

Events may include:
  Spark
  Fire
  Cook Session
  Synthesis
  Serve
```

A Fire can happen without changing the phase to Fire.

A Spark can happen while the priority is in Cook.

A Serve can happen while the priority remains in Cook.

This is intentionally flexible.

---

# 5. Phase Transition Model

Phase changes are user-controlled.

Allowed transitions:

```text
Spark → Fire
Spark → Cook
Fire → Spark
Fire → Cook
Cook → Spark
Cook → Fire
```

There is no enforced state machine.

A phase transition creates a `PhaseTransition` record.

```text
PhaseTransition
---------------
id
priority_id
from_phase
to_phase
timestamp
note
```

This allows historical analysis.

Example:

```text
Jan 01     Spark
Jan 20     Fire
Jan 24     Cook
Feb 18     Spark
Mar 05     Cook
```

The system never deletes this history when the current phase changes.

---

# 6. Goal / Milestone Model

A Goal represents the **current dish being prepared**.

It is a milestone in the journey of a Priority.

```text
Goal
----
id
priority_id

title
description

measurement_type
unit

start_value
target_value
current_value

target_date

status
sequence_number

created_at
achieved_at
```

Possible measurement types:

```text
COUNT
BOOLEAN
QUALITATIVE
MAINTENANCE
```

Examples:

### Quantitative

```text
Goal:
Complete 150 NeetCode problems

start_value: 0
target_value: 150
unit: problems
target_date: 2026-12-01
```

### Qualitative

```text
Goal:
Develop a reliable framework for evaluating real-estate opportunities

measurement_type:
QUALITATIVE
```

### Maintenance

```text
Goal:
Maintain familiarity with DSA
measurement_type:
MAINTENANCE
```

The MVP should support a goal being measurable or qualitative.

---

# 7. Sequential Goal Rule

A Priority has exactly **one current goal**.

Goals form a sequence:

```text
Priority
   │
   ├── Goal 1 ✓
   ├── Goal 2 ✓
   ├── Goal 3 ← current
   └── Goal 4
```

A new goal becomes active only after the previous milestone is achieved or deliberately retired.

Parallel milestones should be represented as separate priorities.

This keeps the meaning of “Priority” intact.

---

# 8. Goal Completion

Goal completion is an event.

When the user decides:

> “This milestone is achieved.”

the system records:

```text
GoalAchievement
---------------
id
goal_id
priority_id
timestamp
note
```

The current goal becomes:

```text
status = ACHIEVED
```

The next goal is not automatically generated.

The user decides what comes next.

Goal completion does not:

- change phase
- create a Fire
- create a Cook Session
- create a Serve
- activate the next goal automatically

---

# 9. User-Defined Definitions

Each Priority owns its own definitions.

Example:

```text
Priority: DSA

Spark:
Solve or revise 1–2 problems per week.

Fire:
Do an unusually large focused push.

Cook:
Structured problem-solving session focused on
understanding new patterns/concepts.

Synthesis:
Capture the original understanding or framework
that emerged from the work.
```

These definitions are stored as plain text.

The system uses them as **context**, not as a semantic classifier.

The MVP does not attempt to infer whether something qualifies.

---

# 10. Progress Event Model

All meaningful activity is stored through a common event model.

```text
ProgressEvent
-------------
id
priority_id
goal_id
event_type

occurred_at

note
metadata

created_at
```

`goal_id` is optional because some events may represent activity toward the priority generally rather than the exact milestone.

### Event types

```text
SPARK
FIRE
COOK_SESSION
SYNTHESIS
SERVE
GOAL_ACHIEVED
```

Phase transitions are stored separately because they represent a state change rather than progress activity.

---

# 11. Event Semantics

## Spark event

Represents one meaningful maintenance action.

Example:

```text
Priority: Real Estate
Event: SPARK
Note:
"Watched Amit Sangwan's micro-market video."
```

---

## Fire event

Represents an exceptional injection of attention.

Example:

```text
Priority: Physical Health
Event: FIRE
Note:
"Two-hour workout and massage."
```

---

## Cook Session

Represents one structured deep-work session.

Example:

```text
Priority: Real Estate
Event: COOK_SESSION
Note:
"Investigated whether 6% rental yield is reasonable."
```

The system increments:

```text
Cook session count += 1
```

There is no manual “cycle complete” operation.

---

## Synthesis

Represents the reflective extraction from cooking.

Unlike other events, Synthesis should support long-form content.

Example:

```text
Priority: Real Estate
Event: SYNTHESIS

"What I now believe about..."
```

The system should preserve the full text.

---

## Serve

Represents meaningful outward expression.

Examples:

- article
- framework
- teaching material
- video
- public explanation
- knowledge-tree contribution

The user records the Serve event.

---

# 12. Cook Cycles

A Cook Cycle is **derived**, not a first-class object in the MVP.

The system observes:

```text
Cook Session 1
Cook Session 2
Cook Session 3
Cook Session 4
Cook Session 5
Synthesis
```

and may display this as:

> 5 Cook Sessions → 1 Synthesis

The user does not explicitly press:

> “Complete Cycle.”

This is important because a cycle is conceptually fuzzy.

A user may synthesize after 3 sessions or 10 sessions.

The application should therefore preserve raw sessions and derive higher-level patterns.

---

# 13. Logging UX

The highest-frequency interaction is:

```text
+ Log Progress
```

The first choice is the event:

```text
Spark
Fire
Cook Session
Synthesis
Serve
Goal Achieved
```

Then:

```text
Priority
Goal
Optional note
```

For common event types, the interface should minimize interaction.

Example:

```text
+ Progress

Spark
[Real Estate]

"Watched a market-analysis webinar."

[Save]
```

The timestamp defaults to now.

No explicit duration is required.

---

# 14. Time Model

The user does **not** manually track time.

No stopwatch.

No time sheet.

No “2 hours 17 minutes” entry.

Time is inferred from:

- timestamps
- event frequency
- calendar intervals
- session definitions
- target dates

A Cook Session can have an implicit standard duration in configuration or remain conceptually unitless.

The MVP should treat the **session count** as the canonical measure rather than manually collected minutes.

---

# 15. Spark Cadence

Spark definitions may imply recurring cadence.

Example:

```text
Spark definition:
At least 2 meaningful DSA engagements per week.
```

The user logs individual Spark events.

The system calculates:

```text
Sparks this week: 1
Expected: 2
```

Important:

The system should not label this as failure.

It simply reports:

> Spark activity is below the user's defined maintenance cadence.

This preserves the no-guilt philosophy.

---

# 16. Derived Metrics

## 16.1 Progress

For measurable goals:

```text
progress =
(current_value - start_value)
/
(target_value - start_value)
```

Example:

```text
38 / 150 = 25.3%
```

For qualitative goals, progress is user-reported rather than automatically inferred.

---

## 16.2 Actual Pace

For a measurable goal:

```text
actual_pace =
units_completed /
weeks_elapsed
```

Example:

```text
38 problems / 5 weeks
= 7.6 problems/week
```

Use rolling windows where appropriate.

---

## 16.3 Required Pace

```text
remaining_units /
weeks_remaining
```

Example:

```text
112 remaining
12 weeks remaining

= 9.33/week
```

---

## 16.4 Projected Completion

Assuming stable recent velocity:

```text
weeks_to_completion =
remaining_units /
actual_velocity
```

Then:

```text
projected_date =
today + weeks_to_completion
```

Projection should be visibly labeled as an estimate.

---

# 17. Velocity

Velocity is domain-specific.

The MVP should avoid attempting to standardize the meaning of output across different priorities.

Instead:

> **Velocity = progress units per calendar period, according to the goal's measurement model.**

Examples:

```text
DSA
7.6 problems/week

Real Estate
1.8 Cook Sessions/week

Writing
0.7 synthesis artifacts/week
```

Velocity is most meaningful when compared with:

- the same priority historically
- the required pace for the current goal
- a user-defined target

It should not primarily be used to rank unrelated priorities against each other.

---

# 18. Momentum

Momentum is a portfolio-level concept.

It answers:

> “How much meaningful movement am I generating while carrying this collection of priorities?”

The MVP should not reduce this to one arbitrary mathematical number.

Instead, show the components:

```text
Active priorities
Priorities receiving Sparks
Priorities receiving Fire
Priorities in Cook
Cook Sessions
Syntheses
Goals achieved
Goals on trajectory
Goals behind trajectory
Recent active priorities
```

A future version can experiment with a composite momentum score once enough evidence exists.

---

# 19. Portfolio Dashboard

The home dashboard should be a high-level instrument panel.

## Section A — Orbit

Visualize all active priorities.

Each priority card shows:

```text
Priority
Area
Current phase
Current goal
Goal progress
Trajectory status
Recent activity
```

Possible visual:

```text
                 MY ORBIT

      Spark          Fire          Cook

      Body           DSA           Real Estate
      Spiritual      Writing       Trading
```

---

## Section B — Momentum

Show:

```text
Active priorities      8
Sparks this month      31
Fires this month        5
Cook Sessions           14
Syntheses                3
Goals achieved           2
```

---

## Section C — Trajectory

Show goals where pacing is meaningful.

Example:

```text
DSA
38 / 150
Actual: 7.6/week
Required: 9.3/week
Projected: Jan 03
Behind

Real Estate
7 / 12
Actual: 1.1/week
Required: 0.8/week
Projected: Nov 12
Ahead
```

---

## Section D — Recent Activity

Chronological stream:

```text
Today
🔥 Fire — Real Estate

Today
Cook Session — DSA

Yesterday
Spark — Physical Health

Sep 30
Synthesis — Real Estate
```

---

## Section E — Signals

Simple deterministic observations only.

Examples:

```text
Real Estate:
8 Cook Sessions since last synthesis.

DSA:
Current pace is below target pace.

Trading:
No meaningful activity in 12 days.
```

These are observations, not recommendations.

---

# 20. Priority Detail Screen

A Priority page should tell the whole story.

## Header

```text
Build a real estate portfolio
Investments
COOK
```

## Current Goal

```text
Build a fundamental framework for evaluating
real-estate investments.

Target: Dec 31
Progress: 7 / 12
Trajectory: Ahead
```

## Definitions

```text
Spark
Watch/revise/meaningful conversation

Fire
Large burst of attention

Cook
Structured investigation

Synthesis
Original understanding
```

## Activity Summary

```text
Sparks          18
Fires            4
Cook Sessions    8
Syntheses        2
Serves           0
```

## Timeline

```text
Sep 02   Spark
Sep 04   Spark
Sep 10   Fire
Sep 11   Phase → Cook
Sep 12   Cook Session
Sep 15   Cook Session
Sep 18   Cook Session
Sep 20   Synthesis
```

## Goal History

```text
Goal 1 ✓
Goal 2 ✓
Goal 3 ← current
```

---

# 21. History Model

History is one of the most important product assets.

Every priority should have a chronological timeline containing:

- phase changes
- Sparks
- Fires
- Cook Sessions
- Syntheses
- Serves
- goal achievements
- goal changes

The user should be able to answer:

> “What actually happened to this priority over the last year?”

without reconstructing it manually.

---

# 22. Inactivity

Inactivity should not be a special event.

No event is generated automatically just because the user did nothing.

Instead:

```text
last_cook_session_at
last_spark_at
last_fire_at
last_synthesis_at
```

and event history naturally reveal gaps.

This preserves factual history without creating fake activity.

The application can derive observations such as:

> No Cook Sessions in 17 days.

---

# 23. Phase / Activity Mismatch

The MVP can calculate a simple mismatch signal.

Example:

```text
Declared phase:
Cook

Observed:
0 Cook Sessions in 21 days
```

Display:

> **Activity is currently below Cook-level engagement.**

The user can then decide whether to:

- stay in Cook
- switch to Spark
- create a Fire
- resume Cook

The system should not change the phase automatically in MVP.

---

# 24. Notifications

MVP notifications should be minimal.

Potential deterministic notifications:

### Goal trajectory changed

> “Your current pace is now below the pace required for this milestone.”

### Long Cook run

> “10 Cook Sessions since your last Synthesis.”

### Long inactivity

Optional:

> “No recent activity recorded for this priority.”

Avoid frequent notifications.

The product should not become another nagging productivity application.

---

# 25. API Design

A REST or RPC API can be organized around the domain entities.

### Life Directions

```http
GET    /life-directions
POST   /life-directions
PATCH  /life-directions/:id
DELETE /life-directions/:id
```

### Areas

```http
GET    /areas
POST   /areas
PATCH  /areas/:id
DELETE /areas/:id
```

### Priorities

```http
GET    /priorities
POST   /priorities
GET    /priorities/:id
PATCH  /priorities/:id
```

### Goals

```http
GET    /priorities/:id/goals
POST   /priorities/:id/goals
PATCH  /goals/:id
POST   /goals/:id/achieve
```

### Progress Events

```http
POST   /events
GET    /events
GET    /priorities/:id/events
```

Example:

```json
{
  "priority_id": "real-estate",
  "event_type": "COOK_SESSION",
  "goal_id": "real-estate-fundamentals",
  "occurred_at": "2026-09-02T19:30:00+05:30",
  "note": "Investigated rental yield assumptions."
}
```

### Phase

```http
POST /priorities/:id/phase-transitions
```

---

# 26. Database Schema

A relational database such as PostgreSQL is appropriate.

Core tables:

```text
users

life_directions
areas
priorities
goals

progress_events
phase_transitions

syntheses
```

Potentially:

```text
goal_metrics
priority_snapshots
```

later, if required for performance or historical analytics.

Indexes:

```text
progress_events(priority_id, occurred_at)
progress_events(goal_id, occurred_at)
phase_transitions(priority_id, timestamp)
goals(priority_id, sequence_number)
```

---

# 27. Synthesis Storage

Synthesis should be stored separately from a generic event if rich editing is required.

```text
Synthesis
---------
id
priority_id
goal_id
progress_event_id

title
content

created_at
updated_at
```

This allows:

- Markdown/rich text
- attachments later
- linking to knowledge nodes later
- version history later

The associated ProgressEvent remains the timeline anchor.

---

# 28. Frontend Information Architecture

Primary navigation:

```text
Orbit
Priorities
Activity
Goals
Insights
```

### Orbit

Portfolio-level dashboard.

### Priorities

Browse and manage all priorities.

### Activity

Chronological event history.

### Goals

Milestones and trajectory.

### Insights

MVP-derived analytics.

No “Tasks” tab.

No “Today” checklist.

No AI mentor tab.

---

# 29. Key Frontend Components

### PriorityCard

Displays:

- phase
- current goal
- progress
- recent event
- trajectory

### LogProgressModal

Fast event recording.

### PhaseSelector

Manual phase transition.

### GoalCard

Shows:

- progress
- target date
- actual pace
- required pace
- projection

### ActivityTimeline

Chronological event history.

### MomentumPanel

Portfolio-level activity metrics.

### TrajectoryPanel

Goal-level projections.

### SynthesisEditor

Rich text reflection.

---

# 30. State Management

The application should treat the database as the source of truth.

Client state needs only:

- current UI state
- selected priority
- current dashboard filters
- optimistic event state where useful

Derived metrics should ideally be computed server-side or through deterministic shared domain functions.

Do not persist derived values unless necessary for performance.

For example:

```text
cook_session_count
```

should normally be:

```sql
COUNT(progress_events WHERE event_type = 'COOK_SESSION')
```

rather than manually incremented counters.

This prevents drift.

---

# 31. Derived Analytics Layer

Create a deterministic analytics service.

Example functions:

```text
getPriorityActivity(priority_id, date_range)

getGoalProgress(goal_id)

getGoalVelocity(goal_id, window)

getRequiredPace(goal_id)

getProjectedCompletion(goal_id)

getPhaseDurations(priority_id)

getRecentActivity(priority_id)

getPortfolioMomentum(date_range)

getActivityGaps(priority_id)

getSynthesisGap(priority_id)
```

All calculations should be reproducible from raw history.

This is especially important because future AI will consume these facts.

---

# 32. Metric Integrity

The raw event log should be treated as immutable history.

If the user accidentally logs an event:

```text
event.status = VOIDED
```

rather than physically deleting it, where practical.

This allows analytics to remain auditable.

Phase history should likewise preserve transitions.

Goal changes should never erase previous milestones.

The system should always be able to reconstruct:

> what the user believed  
> when they believed it  
> what phase they were in  
> what activity occurred  
> what goal was active

---

# 33. MVP Analytics Windows

Use several standard windows:

```text
7 days
30 days
90 days
12 months
All time
```

The dashboard should default to a useful recent window while allowing historical exploration.

Velocity should use a rolling window when enough activity exists.

Very sparse activity should be explicitly marked as low-confidence rather than producing misleading numbers.

---

# 34. Goal Projection Rules

Projection should only be displayed when:

- target is measurable
- sufficient history exists
- current velocity > 0
- target date exists

Otherwise:

```text
Projection unavailable
```

Do not manufacture a completion date.

For qualitative goals, use progress state rather than numeric forecasting.

---

# 35. Automatic Phase Suggestion — Future

Not MVP.

Future deterministic/AI system may observe:

```text
Priority marked COOK
+
very low Cook activity
+
Spark-level activity
```

and propose:

> “Your recent activity resembles Spark-level engagement. Move back to Spark?”

The user must approve.

Likewise:

```text
10 Cook Sessions
+
no Synthesis
```

can become an AI-assisted reflection prompt.

---

# 36. Future AI Architecture

AI should sit above the deterministic system.

```text
             AI LAYER
                 │
      ┌──────────┴──────────┐
      │ pattern recognition │
      │ recommendations     │
      │ goal suggestions    │
      │ synthesis linking   │
      └──────────┬──────────┘
                 │
          DERIVED ANALYTICS
                 │
          EVENT HISTORY
                 │
        USER DEFINED MODEL
```

The AI should never replace the underlying event model.

The structured history is the source material.

---

# 37. Authentication and User Isolation

MVP should support one private workspace per user.

Every domain object is scoped by:

```text user_id
```

Authorization should enforce:

> A user can only access their own life hierarchy and events.

No social layer is required.

---

# 38. Offline / Mobile Considerations

Because logging is the highest-frequency action, the application should be optimized for mobile.

Ideal behavior:

> Open → Log → Done.

A Progressive Web App or mobile-first responsive interface is sufficient for MVP.

A future native app may support:

- widgets
- quick actions
- lock-screen logging
- voice capture
- Apple/Android shortcuts

These are not MVP requirements.

---

# 39. Performance Requirements

The common path should be extremely fast.

Target:

```text
Open log UI
→ select event
→ select priority
→ save
```

within a few seconds.

Dashboard calculations should remain responsive with thousands of historical events.

Use database aggregation rather than loading the entire event history into the client.

---

# 40. MVP Acceptance Scenarios

### Scenario 1 — Spark

User logs:

> Spark → DSA  
> “Revised sliding window.”

Expected:

- event appears in timeline
- Spark count increments
- goal/activity analytics update

### Scenario 2 — Fire

User logs:

> Fire → Real Estate

Expected:

- Fire count increments
- no automatic phase change

### Scenario 3 — Cook Session

User logs:

> Cook Session → Real Estate

Expected:

- session count increments
- current goal receives associated activity
- trajectory can update if goal metric supports it

### Scenario 4 — Synthesis

User writes a synthesis.

Expected:

- long-form content saved
- synthesis count increments
- session-to-synthesis gap resets

### Scenario 5 — Phase change

User moves:

> Real Estate: Spark → Cook

Expected:

- current phase updates
- transition is recorded
- historical timeline preserves previous state

### Scenario 6 — Goal completion

User marks:

> “Fundamentals understood” achieved.

Expected:

- goal becomes historical
- milestone achievement is recorded
- user is prompted to define the next goal only if desired
- phase remains unchanged

### Scenario 7 — Goal trajectory

User has:

> 38 / 150

Expected:

- current pace calculated
- required pace calculated
- projected completion shown when enough data exists

### Scenario 8 — Low activity

User does nothing for two weeks.

Expected:

- no fake events
- no overdue tasks
- no failure score
- activity gap becomes visible

---

# 41. MVP Exclusions

Do not build initially:

- AI mentor
- autonomous agent
- daily planner
- task management
- calendar scheduling
- time tracking
- broad daily journaling
- automatic semantic classification
- automatic phase changes
- productivity gamification
- universal productivity score
- social features
- knowledge graph intelligence
- automatic goal generation

These can emerge after the core system proves useful.

---

# 42. Technical Product Principle

The implementation should always preserve this invariant:

> **Raw user decisions and events are the source of truth; everything else is derived.**

This means:

```text
User logs event
        ↓
Raw event stored
        ↓
Analytics recalculated
        ↓
Dashboard changes
```

Not:

```text
Dashboard score updated
        ↓
Underlying history guessed
```

This makes the system reliable, explainable, and ready for future AI.

---

# 43. The Complete MVP Loop

The implementation ultimately supports this exact loop:

```text
        DEFINE
          ↓
     PRIORITY + GOAL
          ↓
       CHOOSE PHASE
          ↓
       LIVE LIFE
          ↓
   MEANINGFUL EVENT
          ↓
         LOG
          ↓
   EVENT HISTORY GROWS
          ↓
      ANALYTICS UPDATE
          ↓
 ┌───────────────────────────┐
 │ Progress                  │
 │ Velocity                  │
 │ Pace                      │
 │ Projection                │
 │ Momentum                  │
 │ Historical trajectory     │
 └─────────────┬─────────────┘
               ↓
            REVIEW
               ↓
        USER DECIDES
               ↓
   change phase / goal /
   focus / nothing
               ↓
         CONTINUE
```

The product's job is not to determine the next move.

Its job is to make the user's own movement **visible enough that they can determine the next move themselves**.

---

# 44. Recommended MVP Build Order

### Phase 1 — Foundation

- authentication
- Life Directions
- Areas
- Priorities
- Priority definitions
- current phase
- Goals

### Phase 2 — Event Logging

- Spark
- Fire
- Cook Session
- Synthesis
- Serve
- Goal achieved
- phase transitions

### Phase 3 — History

- activity timeline
- priority history
- goal history
- phase history

### Phase 4 — Analytics

- progress
- pace
- velocity
- projections
- activity gaps
- synthesis gaps

### Phase 5 — Dashboard

- Orbit
- Momentum
- Trajectory
- Recent Activity
- Priority detail

### Phase 6 — Quality Layer

- fast logging
- mobile optimization
- empty states
- validation
- analytics correctness
- data export / backup

The first shippable product can therefore be very small:

> **Define priorities → log meaningful events → see your trajectory.**

Everything else builds on that foundation.