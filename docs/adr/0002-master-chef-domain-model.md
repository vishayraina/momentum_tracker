# Master Chef Domain Model, 3-Tier Hierarchy, and Mandatory Quantitative Milestones

- **Status**: Accepted
- **Date**: 2026-09-03

We replaced the abstract astrophysics metaphors and the 4-tier hierarchy (`Direction -> Area -> Priority -> Milestone`) with a 3-tier Master Chef Kitchen Model (`Life Direction -> Priority/Station -> Milestone/Dish`) and mandated that every milestone must define a quantitative target and unit. The legacy intermediate `Area` tier caused classification fatigue without contributing distinct momentum metrics, while allowing boolean milestones prevented uniform outcome tracking. We also established an anti-gamification rule where locked milestone deadlines cannot be silently stretched; failed or abandoned milestones must be explicitly logged to the Waste Ledger before firing a new dish.

## Considered Options
- **Astrophysics Metaphor (`Impulse, Booster, Deep Burn`)**: Rejected as overly technical and alienated general intuition.
- **Retaining 4-Tier Hierarchy (`Area`)**: Rejected because users suffered taxonomy paralysis distinguishing an Area from a Priority.
- **Boolean Milestones**: Rejected because habits, deliverables, and targets can all be represented as quantitative pitstops (e.g., `1 draft`, `21 days`, `75 problems`), which standardizes the data model and UI gauges.
