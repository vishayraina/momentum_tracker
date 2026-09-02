# Personal Momentum OS
## Product Requirements & High-Level Design Document

### 1. Product Overview

A personal operating system for managing long-term priorities as evolving “moons” around the user’s life.

The product helps a person define what matters, decide how much energy to give each priority, record meaningful progress, and understand their trajectory over time.

It is **not** an AI mentor, daily planner, habit tracker, or conventional task manager.

The fundamental philosophy is:

> **The user is their own mentor. The system is the mirror, memory, map, and measurement layer.**

The product should preserve the user's choices and history without creating guilt around missed tasks or prescribing what they should do.

---

# 2. Core Philosophy

## 2.1 No guilt-based productivity

The system does not primarily ask:

> “What did you fail to complete today?”

Instead it asks:

> “What have you actually done, where are you now, and where are you heading?”

There are no overdue tasks, streak-breaking punishments, or failure scores.

Periods of low activity are valid parts of the user's journey.

A user may deliberately slow down, enter maintenance mode, focus elsewhere, or temporarily deprioritize everything.

The system preserves this history rather than treating it as failure.

---

## 2.2 User defines meaning

The system should not try to understand whether a particular activity is inherently valuable.

The user defines what qualifies as meaningful progress for each priority.

For example:

**Real Estate — Spark**

> Watch one useful webinar, revise an existing concept, or have a conversation that produces useful learning.

**DSA — Spark**

> Solve or revise one or two problems during the week.

**Physical Health — Spark**

> Perform the minimum movement routine.

The software does not judge whether these actions “count.”

The user explicitly records:

> “That was a Spark.”

The application then measures it.

---

## 2.3 Measure trajectories, not activities

The product should operate at a higher level than conventional task management.

It should primarily measure:

- meaningful events
- phase/state
- milestones
- sessions
- synthesis
- velocity
- pace
- projections
- momentum
- historical evolution

Individual tasks are implementation details rather than the fundamental unit of the system.

---

# 3. Core Ontology

The fundamental hierarchy is:

**Life Direction → Area → Priority → Goal**

### Life Direction

A broad direction for the user's life.

Examples:

- Become an excellent engineer
- Build wealth
- Become physically strong
- Develop spiritually

### Area

A broad domain within a life direction.

Examples:

- Software Engineering
- Investments
- Physical Health
- Spirituality

### Priority

A persistent direction that the user is actively carrying.

Examples:

- DSA
- Build a real estate portfolio
- Trading
- Physical fitness

A priority is a “moon” orbiting the user's “planet.”

### Goal / Milestone

The current concrete milestone within a priority.

Goals are sequential.

Example:

**Priority:** DSA

**Goal 1:** Complete NeetCode 150  
→ **Goal 2:** Implement major algorithmic patterns independently  
→ **Goal 3:** Build original problem-solving framework

Only one current goal exists for a priority.

Parallel objectives that genuinely require separate attention should become separate priorities.

A goal is a milestone, not a phase.

Completing a goal does not automatically change the priority's phase.

---

# 4. Priority Phase Model

The product uses three high-level operating modes.

## Spark

The minimum energy required to keep a priority alive.

Spark answers:

> “How do I keep this moon from disappearing from my orbit?”

Examples:

- Solve two DSA problems a week
- Attend a real-estate webinar periodically
- Perform minimum exercise
- Maintain a spiritual practice

Spark is maintenance, continuity, and preservation.

---

## Fire

An exceptional injection of energy.

Fire answers:

> “Where am I deliberately increasing intensity?”

Examples:

- A two-hour workout + massage after normally doing short sessions
- Spending an entire Sunday analyzing a real-estate model
- Doing an unusually large amount of DSA in one sitting
- Making an extra investment in a priority's development

Fire is analogous to an extra SIP: an additional deliberate push.

A Fire is an **event**, not merely a permanent state.

---

## Cook

Sustained, structured engagement.

Cook is where substantial transformation happens.

It includes:

- focused work
- exploration
- investigation
- problem solving
- repeated churning
- digestion
- synthesis
- eventually serving the result

The internal process is not necessarily linear.

A typical pattern may be:

**Cook → Digest → Cook → Digest → Synthesis / Serve**

The important distinction is:

> **Spark and Fire describe energy inputs. Cook describes sustained engagement.**

---

# 5. Cook Sessions

The atomic unit inside Cook is the **Cook Session**.

The user logs individual sessions.

Sessions are not manually grouped into “cycles.”

Instead, cycles are derived from sessions and synthesis.

A typical default structure is:

### Session 1 — Discovery
Understand the problem and determine what matters.

### Session 2 — Investigation
Literature review, decomposition, assumptions, research, goal refinement.

### Sessions 3–4 — Flow
Do the actual work.

### Session 5 — Synthesis
Extract what was learned and formulate the resulting understanding.

This is a guideline, not a rigid workflow.

A priority might require:

- 3 sessions
- 5 sessions
- 8 sessions
- 12 sessions

The system records sessions; the user determines when meaningful synthesis has occurred.

---

# 6. Synthesis

Synthesis is where the reflective/journaling component lives.

The product deliberately avoids having a broad “daily journal” as a core MVP feature.

Instead, reflection happens around meaningful work.

A synthesis may contain:

- What did I learn?
- What changed in my understanding?
- What did I previously believe incorrectly?
- What new model emerged?
- What remains unresolved?
- What is the original insight?
- What could become an article, video, framework, or knowledge-tree contribution?

Synthesis is free writing.

This preserves the distinction between:

> **Tracking** = structured measurement

and

> **Journaling** = reflection and synthesis

---

# 7. Serve

Serve represents the moment when knowledge or insight has been purified sufficiently to contribute externally or enter the user's durable knowledge system.

Examples:

- Original article
- Blog post
- YouTube idea
- Framework
- Knowledge-tree contribution
- Teaching material
- Public explanation

Serve should be treated primarily as a **meaningful output/event**, not necessarily as a permanent state.

A user can serve something and later return the priority to Spark, Fire, or Cook.

---

# 8. Priority Configuration

When creating a priority, the user defines:

### Identity
- Name
- Area

### Current state
- Current phase
- Current goal / milestone
- Target date

### User-defined operating definitions
- What counts as a Spark?
- What counts as a Fire?
- What counts as a Cook Session?
- What counts as a Synthesis / Serve?

These definitions are part of the user's personal operating contract.

Example:

### Real Estate

**Area:** Investments

**Priority:** Build a real estate portfolio

**Current phase:** Cook

**Current goal:** Build a strong framework for evaluating real-estate investments

**Spark definition:**  
Watch/revise useful material or have a conversation that produces meaningful learning.

**Fire definition:**  
A substantial burst of focused attention, such as a long research session or financial model.

**Cook Session definition:**  
A structured investigation into a significant question, e.g. reasonable rental-yield and capital-appreciation assumptions.

**Synthesis definition:**  
Produce a clear original understanding, framework, or written explanation.

---

# 9. Event Model

The MVP is fundamentally an event log.

The user records meaningful events against priorities.

Core event types:

### Spark
A meaningful minimum-maintenance action.

### Fire
An exceptional injection of energy.

### Cook Session
A focused structured work session.

### Synthesis
A reflective extraction of knowledge.

### Serve
An external or durable expression of the resulting insight.

### Goal Achieved
A milestone has been reached.

Each event should record at minimum:

- timestamp
- priority
- event type
- optional one-line note

For example:

> **Spark — Real Estate**  
> “Watched Amit Sangwan's micro-market video.”

> **Fire — Real Estate**  
> “Spent Sunday building rental-yield projections.”

> **Cook Session — Real Estate**  
> “Investigated whether 6% rental yield is reasonable in Whitefield.”

> **Synthesis — Real Estate**  
> Free-form reflection and conclusions.

The one-line note is primarily for future recall and context.

---

# 10. Goals and Milestones

Every priority must have an active goal.

A goal can take many forms.

### Quantitative

> Complete 150 NeetCode problems by December.

### Deadline-based

> Finish two project implementations within three months.

### Understanding-based

> Resolve all major doubts around real-estate valuation.

### Maintenance-based

> Maintain familiarity with DSA.

The goal definition is user-controlled.

A goal may specify:

- title
- description
- metric/unit
- starting value
- target value
- target date

The system then calculates trajectory where a measurable target exists.

Goal completion simply means:

> **Milestone achieved.**

It does not force:

- phase advancement
- Serve
- a new goal
- a new project

The user remains in control.

---

# 11. Velocity

Velocity is the rate at which meaningful progress occurs.

Time should **not** be explicitly logged as a stopwatch.

Time is implicit in:

- calendar duration
- session definitions
- event frequency
- target dates

Velocity should therefore usually be represented as:

> **Meaningful progress per calendar period**

Examples:

**DSA**

> 8 meaningful units/week

**Real Estate**

> 2 Cook Sessions/week

**Physical Health**

> 4 meaningful training events/week

The definition of “meaningful unit” is priority-specific and user-defined.

The system does not attempt to compare DSA velocity directly against real-estate velocity.

Instead, the useful comparison is:

> **Current velocity vs required velocity for this goal.**

---

# 12. Goal Trajectory

For measurable goals, the system should calculate:

**Current progress**  
**Required pace**  
**Actual pace**  
**Projected completion**  
**Target date**  
**On-track / ahead / behind**

Example:

### DSA

Goal:

> 150 problems by December 1

Current:

> 38 / 150

Required pace:

> 8.6 problems/week

Actual pace:

> 7.2 problems/week

Projected completion:

> January 3

Status:

> Behind trajectory

This is significantly more useful than comparing “productivity” across unrelated domains.

---

# 13. Momentum

Velocity is only one part of the system.

The user may be carrying many priorities simultaneously.

The bigger concept is **momentum**:

> **How many meaningful priorities am I carrying, and how much forward movement am I generating across them?**

The system should therefore show:

- number of active priorities
- how many are maintained
- how many are receiving Fire
- how many are in Cook
- Cook activity
- goal progress
- synthesis activity
- recent inactivity
- aggregate movement

A single universal momentum score should **not** be part of the first MVP unless a defensible calculation emerges.

The first version should show the components rather than manufacture precision.

---

# 14. Availability and Planetary Velocity

The system should recognize that the user's overall capacity changes.

During demanding periods:

> Many priorities may return to Spark.

During high-capacity periods:

> Several priorities may receive Fire/Cook attention.

The important principle is:

> **The planet can slow down without the moons becoming failures.**

This makes the system resilient to:

- emergencies
- work pressure
- travel
- family obligations
- illness
- vacations
- intentional rest
- changing priorities

A low-activity period becomes historical context, not debt.

---

# 15. Automatic Signals

The MVP should be mostly observational.

However, simple deterministic signals may be useful.

Examples:

### Cook without synthesis

> 10 Cook Sessions completed since the last synthesis.

Prompt:

> “You've completed 10 Cook Sessions without a synthesis. Does this need a synthesis or reconsideration?”

### Goal trajectory

> Current pace is materially below required pace.

Display:

> “At current pace, this goal will finish after the target date.”

### Phase/activity mismatch

A priority remains marked as Cook but has had no Cook Sessions recently.

Display:

> “This priority has not received recent Cook activity.”

The application should not automatically prescribe an action.

Later versions may allow AI to interpret these patterns.

---

# 16. Phase Changes

Phase transitions are completely user-controlled.

The user may move a priority:

- Spark → Fire
- Fire → Cook
- Cook → Spark
- Cook → Fire
- Serve → Spark
- etc.

The system should preserve the full history.

Example:

> Real Estate  
> Spark: 42 days  
> Fire: 3 days  
> Cook: 28 days  
> Spark again: 17 days

This allows the user to understand how their relationship with a priority evolved.

The system should not automatically change phase in the MVP.

It can surface a suggestion such as:

> “Activity suggests Spark-level engagement.”

But the user decides.

---

# 17. Dashboard

The dashboard should answer the user's most important questions in approximately 10 seconds.

### Where am I?

Show all priorities and their current phases.

Example:

| Priority | Phase | Goal | Progress |
|---|---|---|---|
| DSA | Cook | NeetCode 150 | 38 / 150 |
| Real Estate | Cook | Build evaluation framework | 7 / 12 |
| Trading | Spark | Maintain familiarity | — |
| Physical Health | Spark | Maintain baseline | — |

### How am I progressing?

Show:

- recent events
- goal progress
- completed sessions
- completed syntheses
- goal milestones achieved

### How fast am I moving?

Show:

- Sparks / period
- Fires / period
- Cook Sessions / period
- Syntheses / period
- goal velocity

### Where am I headed?

Show:

- target dates
- required pace
- current pace
- projected completion
- trajectory

### What have I done?

Show the historical activity stream.

### What have I said / learned?

Show Syntheses and their relationships to priorities/goals.

---

# 18. Priority Detail View

Clicking a priority should provide the deeper picture.

Example:

## Real Estate

**Area:** Investments

**Phase:** Cook

**Goal:** Build a fundamental framework for evaluating real estate

**Target Date:** Dec 31

### Activity

- 18 Sparks
- 4 Fires
- 8 Cook Sessions
- 2 Syntheses
- 0 Served

### Current Cook Cycle

Sessions:

1 ✓
2 ✓
3 ✓
4 ✓
5 ✓
6 ✓
7 ✓
8 ✓

**Last synthesis:** 3 sessions ago

### Goal trajectory

Current: 7 / 12  
Required pace: 0.8/week  
Actual pace: 1.1/week  
Projected completion: Nov 12

### History

Timeline of:

- phase changes
- Sparks
- Fires
- Cook Sessions
- Syntheses
- goal completions

---

# 19. Productivity

Productivity should be a derived analytical layer rather than a number the user manually enters.

Possible MVP productivity views:

- meaningful events per week/month
- Cook Sessions completed
- Sparks maintained
- Fires created
- Syntheses generated
- goals advanced
- goals achieved
- percentage of active priorities receiving meaningful attention
- time/period spent in different phases
- activity concentration across priorities

Avoid a simplistic:

> “Productivity score = 82”

unless the methodology becomes genuinely defensible.

The product should favor **inspectable measurements over gamification**.

---

# 20. What the MVP Does Not Do

The MVP should explicitly avoid:

### AI mentorship

It does not tell the user:

> “You should work on real estate today.”

### Automatic prioritization

It does not decide:

> “DSA is more important than trading.”

### Daily planning

It does not generate:

> “Today's three tasks.”

### Conventional task management

Tasks are not the core model.

### Generic journaling

No continuous AI-powered life journal in the first version.

### Automatic interpretation of activities

The user explicitly records:

> “This was a Spark.”

The system does not determine that for them.

### Artificial productivity scores

No fake universal measurement across unrelated domains.

---

# 21. Future AI Layer

AI becomes valuable only after the system has accumulated enough structured historical data.

Potential future capabilities:

### Pattern recognition

> “You tend to abandon priorities after 3–4 Cook Sessions.”

### Stagnation detection

> “Real Estate has accumulated 11 Cook Sessions without synthesis.”

### Goal feasibility

> “Your declared target requires a pace materially higher than your recent trajectory.”

### Phase suggestions

> “Your recent activity resembles Spark rather than Cook.”

### Goal suggestions

> “You have completed this milestone. Based on your history, here are possible next milestones.”

### Cross-priority analysis

> “Your momentum has increased when you reduce active Cook priorities from five to two.”

### Intelligent synthesis linking

AI can eventually connect:

- sessions
- notes
- synthesis
- knowledge tree
- goals
- previous milestones

This is deliberately deferred.

---

# 22. Data Model — High Level

### LifeDirection
- id
- name

### Area
- id
- life_direction_id
- name

### Priority
- id
- area_id
- name
- current_phase
- current_goal_id
- spark_definition
- fire_definition
- cook_definition
- synthesis_definition
- created_at

### Goal
- id
- priority_id
- title
- description
- metric_name
- starting_value
- target_value
- target_date
- status
- achieved_at
- sequence_number

### ProgressEvent
- id
- priority_id
- goal_id
- event_type
- timestamp
- note

Event types:

- SPARK
- FIRE
- COOK_SESSION
- SYNTHESIS
- SERVE
- GOAL_ACHIEVED

### PhaseHistory
- id
- priority_id
- from_phase
- to_phase
- timestamp

### Synthesis
Potentially represented as a richer form of ProgressEvent or its own entity if it requires long-form content.

---

# 23. Core UX Principles

### 1. Logging should take seconds

The fundamental interaction should be:

> **I just did something meaningful → record it.**

### 2. No daily obligation

The application does not create a daily checklist.

### 3. Context is always visible

When recording an event, show:

> Priority → Current goal → Current phase

### 4. History is first-class

Nothing meaningful should disappear.

### 5. Low activity is valid

No punishment for periods of low momentum.

### 6. The system should remain psychologically lightweight

The user should feel:

> “I'm observing my life.”

rather than:

> “I'm maintaining another productivity database.”

---

# 24. Example User Journey

### Setup

User creates:

**Area:** Investments  
**Priority:** Build a real estate portfolio  
**Phase:** Spark  
**Goal:** Build fundamentals for evaluating good property  
**Target:** December 31

Defines:

**Spark:** Watch/revise/useful discussion  
**Fire:** Two-hour focused investment in real estate  
**Cook:** Structured investigation  
**Synthesis:** Produce original understanding

### Week 1

User logs:

- Spark
- Spark
- Fire

### Week 2

User switches priority to Cook.

Logs:

- Cook Session 1
- Cook Session 2

### Week 3

Logs:

- Cook Session 3
- Cook Session 4
- Cook Session 5
- Synthesis

The dashboard now shows:

> 5 Cook Sessions  
> 1 Synthesis  
> 1 Fire  
> 2 Sparks

The user does not have to manually declare:

> “I completed Cycle 1.”

The system can infer that a meaningful sequence occurred.

---

# 25. MVP Success Criteria

The MVP is successful if a user can:

1. Define a hierarchy of life directions, areas, and priorities.
2. Define one current milestone/goal for each priority.
3. Define what Spark, Fire, Cook and Synthesis mean for each priority.
4. Log meaningful events in a few seconds.
5. Change priority phases freely.
6. See the complete history of a priority.
7. See progress toward measurable goals.
8. Understand current velocity and required pace.
9. See projected goal completion.
10. See how their collection of priorities is moving.
11. Reflect on their own journey without being judged by the software.

---

# 26. Product Thesis

The fundamental product thesis can be expressed in one sentence:

> **Help people continuously see the trajectory of everything that matters to them, without turning life into a checklist.**

The system is designed around an upward spiral:

**Maintain → Intensify → Cook → Extract understanding → Synthesize → Serve → Continue**

The user remains the decision-maker.

The software remembers the journey, measures movement, reveals trajectory, and eventually—once enough history exists—can become intelligent enough to help the user see patterns they cannot easily see themselves.

That is the foundation of the product.