# 04: Priority Phase Transitions & State History

**What to build:** The user can freely transition a Priority between operating modes (`SPARK` ↔ `FIRE` ↔ `COOK`) at any time without artificial state machine restrictions. Each phase change immutably writes a timestamped `PhaseTransition` record with an optional reason note. The Priority detail screen displays the current phase, phase duration metrics (e.g. "Cook for 28 days"), and the historical timeline of all past phase changes.

**Blocked by:** 01: Project Foundation & Priority Definition Tracer Bullet

**Status:** ready-for-agent

- [ ] User can change Priority phase freely via UI selector (`SPARK`, `FIRE`, `COOK`) with an optional note.
- [ ] Transition creates an immutable `PhaseTransition` record storing `from_phase`, `to_phase`, `timestamp`, and `note`.
- [ ] Priority detail view displays current phase, days in current phase, and past phase transition history.
- [ ] Phase transitions are independent of goal completions and do not mutate raw progress event records.
- [ ] Automated integration tests verify unrestricted phase transitions, phase duration calculations, and state timeline queries.
