# MVP Core User Loop

## 1. Core Loop

The MVP should revolve around one extremely simple loop:

> **Define → Live → Log → See → Adjust → Continue**

The user defines what a priority means and what progress looks like. They then live their life and work on whatever matters. Whenever something meaningful happens, they log it. The system converts those events into a continuously updated picture of progress, pace, velocity, and momentum. The user looks at that picture and decides what to change.

The application never becomes the decision-maker.

---

## 2. Step 1 — Define the Priority

The user creates a Priority inside an Area.

For each Priority, they define:

- Name
- Area
- Current phase
- Current goal / milestone
- Target date
- Spark definition
- Fire definition
- Cook Session definition
- Synthesis / Serve definition

Example:

**Area:** Investments  
**Priority:** Build a real estate portfolio  
**Phase:** Spark  
**Goal:** Build fundamentals for evaluating good property  
**Target:** December 31

**Spark:** Watch/revise useful material or have a useful conversation.

**Fire:** A substantial burst of attention, such as a long research session or financial analysis.

**Cook Session:** Structured investigation into an important question.

**Synthesis:** Produce a clear original understanding.

This is the user's operating contract with themselves.

---

## 3. Step 2 — Live Normally

The user does not receive a daily task list.

There is no requirement to open the application every morning and follow a plan.

The user simply goes about life:

- works
- exercises
- studies
- travels
- rests
- handles emergencies
- focuses on different priorities

The system remains passive.

---

## 4. Step 3 — Log Meaningful Progress

When something meaningful happens, the user records it.

The core interaction should be extremely fast:

> **+ Log Progress**

Choose:

**Priority → Event type → Optional note**

Supported event types:

- Spark
- Fire
- Cook Session
- Synthesis
- Serve
- Goal Achieved

Example:

> **Spark → Real Estate**  
> “Watched Amit Sangwan's micro-market video.”

> **Fire → Real Estate**  
> “Spent a long session building rental-yield projections.”

> **Cook Session → Real Estate**  
> “Investigated whether 6% rental yield is realistic in Whitefield.”

> **Synthesis → Real Estate**  
> Free-form written reflection.

The user explicitly decides that an event qualifies.

The system records it.

---

## 5. Step 4 — Automatically Update the Model

Every event updates the priority's history and derived metrics.

For example:

### Real Estate

Current phase: **Cook**

Current goal:

> Build a fundamental framework for evaluating real estate.

Activity:

- 18 Sparks
- 4 Fires
- 8 Cook Sessions
- 2 Syntheses
- 0 Serves

The system can derive:

- recent activity
- session cadence
- synthesis cadence
- progress toward goal
- goal velocity
- required pace
- projected completion
- time spent at each phase
- historical momentum

The user does not manually maintain these counters.

---

## 6. Step 5 — Review the Dashboard

The user periodically looks at the dashboard to understand:

### Where am I?

Current phase of each Priority.

### What have I done?

Recent Sparks, Fires, Cook Sessions, Syntheses, and milestone achievements.

### How am I progressing?

Goal progress and historical movement.

### How fast am I moving?

Velocity and cadence.

### When will I reach the milestone?

Required pace versus actual pace and projected completion.

### What is my overall momentum?

How many priorities are being carried and how much meaningful movement is occurring across them.

The dashboard is primarily an **instrument panel**, not a command center.

---

## 7. Step 6 — User Adjusts

Based on what they see, the user decides what to change.

For example:

> “I'm carrying too many active priorities.”

They might move several priorities to Spark.

Or:

> “Real Estate is important right now.”

They might move it into Cook.

Or:

> “I have not synthesized anything after 10 Cook Sessions.”

They may decide to synthesize.

Or:

> “This goal is no longer relevant.”

They change the goal.

The system records these decisions.

It does not make them.

---

# 8. The Important Feedback Loop

The most important loop is therefore:

```text
                    ┌──────────────────┐
                    │     PRIORITIES   │
                    │  + current goals │
                    └────────┬─────────┘
                             ↓
                       LIVE YOUR LIFE
                             ↓
                    MEANINGFUL ACTIVITY
                             ↓
                         LOG EVENT
                             ↓
                    ┌──────────────────┐
                    │     SYSTEM       │
                    │    measures      │
                    └────────┬─────────┘
                             ↓
                 PROGRESS / VELOCITY /
                   TRAJECTORY / MOMENTUM
                             ↓
                     USER REFLECTS
                             ↓
                     USER ADJUSTS
                             ↓
                       LIVE YOUR LIFE
```

This loop repeats indefinitely.

There is no “done.”

---

# 9. What Happens on a Bad Week?

Nothing breaks.

Suppose the user normally has:

> 5 Cook Sessions/week

but life becomes chaotic.

They do:

> 0 Cook Sessions  
> 2 Sparks

The system does not generate:

> 5 missed tasks  
> 3 failures  
> Productivity −73%

Instead it simply shows:

> Cook activity declined.

The user may decide:

> “I am temporarily reducing this priority to Spark.”

The phase changes.

The history remains intact.

---

# 10. What Happens During an Acceleration Period?

Suppose the user has more capacity.

They may take several priorities from Spark into Fire/Cook.

For example:

```text
Week 1

DSA             → Fire
Real Estate     → Cook
Writing         → Spark
Exercise        → Fire
Spiritual       → Spark
```

They then log activity normally.

The dashboard reveals increasing activity and changing momentum.

The user can later deliberately slow back down.

This makes **planetary velocity** a property of the overall system rather than a fixed productivity target.

---

# 11. Cook Loop

Inside a Cook priority, the loop becomes:

> **Cook Session → Cook Session → Cook Session → ... → Synthesis**

The system does not require a fixed five-session cycle.

Five sessions are simply a useful default mental container.

The system should deliberately allow situations such as:

> 10 Cook Sessions → no synthesis

At that point it can surface a simple observational signal:

> **“10 Cook Sessions since your last synthesis.”**

The user decides whether to:

- synthesize
- continue cooking
- change the goal
- change phase
- abandon the direction

Again, the system observes rather than commands.

---

# 12. Goal Loop

Goals are sequential milestones:

```text
Priority
   ↓
Goal 1 → achieved
   ↓
Goal 2 → achieved
   ↓
Goal 3 → ...
```

The user defines the next goal.

The system preserves the completed goal as history and measures future progress against the current milestone.

A goal can be:

- quantitative
- deadline-driven
- understanding-driven
- maintenance-driven

The important thing is that the goal gives **direction to the activity**.

---

# 13. Minimum Viable Interaction

The MVP should allow the user to accomplish nearly everything important through three actions:

### 1. Create / edit Priority

Define:

> what this priority is  
> where it is  
> what I'm trying to achieve  
> what Spark / Fire / Cook / Synthesis mean

### 2. Log Progress

Record:

> what meaningful thing just happened

### 3. Review

Understand:

> where I am  
> how I'm moving  
> where I'm headed

Everything else is supporting infrastructure.

---

# 14. MVP North Star

The MVP should make one experience exceptionally good:

> **“I can look at my life at any point and understand what I'm carrying, what I've actually been doing, how fast it is moving, and where it is likely to lead.”**

Without:

- daily guilt
- endless task maintenance
- forced routines
- generic productivity scores
- AI deciding what matters

The product is therefore fundamentally a **self-directed progress and momentum tracking system**.

The eventual AI layer sits on top of this loop rather than being part of the loop itself.