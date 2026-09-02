import crypto from 'crypto';

export const VALID_PHASES = ['SPARK', 'FIRE', 'COOK'];

export class PhaseTransitionService {
  constructor(db) {
    this.db = db;
  }

  _formatPhaseName(phase) {
    if (!phase) return '';
    return phase.charAt(0).toUpperCase() + phase.slice(1).toLowerCase();
  }

  /**
   * Transition a priority to a new phase freely without restrictions.
   * Immutably records the transition and updates the priority's current_phase.
   */
  transition({
    userId = 'default-user',
    priorityId,
    toPhase,
    note = null,
    timestamp = null
  }) {
    if (!priorityId) {
      throw new Error('priority_id is required');
    }
    if (!toPhase) {
      throw new Error('to_phase is required');
    }

    const normalizedToPhase = toPhase.toUpperCase();
    if (!VALID_PHASES.includes(normalizedToPhase)) {
      throw new Error(`Invalid phase: ${toPhase}. Must be one of: ${VALID_PHASES.join(', ')}`);
    }

    // Verify priority exists and belongs to user
    const prioStmt = this.db.prepare(`
      SELECT id, name, current_phase, created_at, updated_at
      FROM priorities
      WHERE id = ? AND user_id = ?
    `);
    const priority = prioStmt.get(priorityId, userId);
    if (!priority) {
      throw new Error('Priority not found or unauthorized');
    }

    const fromPhase = priority.current_phase;

    // Validate and format timestamp
    let effectiveTimestamp;
    if (timestamp) {
      const parsed = new Date(timestamp);
      if (isNaN(parsed.getTime())) {
        throw new Error('Invalid timestamp format');
      }
      effectiveTimestamp = parsed.toISOString();
    } else {
      effectiveTimestamp = new Date().toISOString();
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const trimmedNote = note && typeof note === 'string' && note.trim() ? note.trim() : null;

    // Atomic transaction: Insert immutable phase transition & update priority current_phase
    const runTransaction = this.db.transaction(() => {
      const insertStmt = this.db.prepare(`
        INSERT INTO phase_transitions (
          id, user_id, priority_id, from_phase, to_phase, timestamp, note, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        id,
        userId,
        priorityId,
        fromPhase,
        normalizedToPhase,
        effectiveTimestamp,
        trimmedNote,
        now
      );

      const updatePriorityStmt = this.db.prepare(`
        UPDATE priorities
        SET current_phase = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `);

      updatePriorityStmt.run(
        normalizedToPhase,
        now,
        priorityId,
        userId
      );
    });

    runTransaction();

    const transitionRecord = this.getById({ userId, id });
    return {
      transition: transitionRecord,
      priority: {
        id: priority.id,
        name: priority.name,
        previous_phase: fromPhase,
        current_phase: normalizedToPhase,
        updated_at: now
      }
    };
  }

  /**
   * Get single phase transition by ID
   */
  getById({ userId = 'default-user', id }) {
    const stmt = this.db.prepare(`
      SELECT 
        pt.id, pt.user_id, pt.priority_id, pt.from_phase, pt.to_phase,
        pt.timestamp, pt.note, pt.created_at,
        p.name AS priority_name
      FROM phase_transitions pt
      JOIN priorities p ON p.id = pt.priority_id
      WHERE pt.id = ? AND pt.user_id = ?
    `);

    return stmt.get(id, userId) || null;
  }

  /**
   * List all phase transitions for a priority
   */
  listByPriorityId({ userId = 'default-user', priorityId, sort = 'desc' }) {
    // Verify priority access
    const prioCheck = this.db.prepare(`
      SELECT id FROM priorities WHERE id = ? AND user_id = ?
    `);
    if (!prioCheck.get(priorityId, userId)) {
      throw new Error('Priority not found or unauthorized');
    }

    const isAsc = sort.toLowerCase() === 'asc';
    const orderClause = isAsc ? 'ASC' : 'DESC';

    const stmt = this.db.prepare(`
      SELECT 
        pt.id, pt.user_id, pt.priority_id, pt.from_phase, pt.to_phase,
        pt.timestamp, pt.note, pt.created_at,
        p.name AS priority_name
      FROM phase_transitions pt
      JOIN priorities p ON p.id = pt.priority_id
      WHERE pt.priority_id = ? AND pt.user_id = ?
      ORDER BY pt.timestamp ${orderClause}, pt.created_at ${orderClause}
    `);

    return stmt.all(priorityId, userId);
  }

  /**
   * Calculate deterministic phase durations and current phase tenure metrics
   */
  calculatePhaseDurations({ userId = 'default-user', priorityId, asOf = new Date() }) {
    const prioStmt = this.db.prepare(`
      SELECT id, name, current_phase, created_at
      FROM priorities
      WHERE id = ? AND user_id = ?
    `);
    const priority = prioStmt.get(priorityId, userId);
    if (!priority) {
      throw new Error('Priority not found or unauthorized');
    }

    const asOfDate = asOf instanceof Date ? asOf : new Date(asOf);
    if (isNaN(asOfDate.getTime())) {
      throw new Error('Invalid asOf date');
    }

    // Fetch all transitions sorted chronologically
    const transitionsAsc = this.listByPriorityId({ userId, priorityId, sort: 'asc' });

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDaysByPhase = {
      SPARK: 0,
      FIRE: 0,
      COOK: 0
    };

    let currentPhaseStartTime;
    const historyWithDurations = [];

    let intervalStartTime = new Date(priority.created_at).getTime();

    for (let i = 0; i < transitionsAsc.length; i++) {
      const tr = transitionsAsc[i];
      const transitionTime = new Date(tr.timestamp).getTime();
      const elapsedMs = Math.max(0, transitionTime - intervalStartTime);
      const daysInPreviousPhase = Math.floor(elapsedMs / msPerDay);

      if (totalDaysByPhase[tr.from_phase] !== undefined) {
        totalDaysByPhase[tr.from_phase] += daysInPreviousPhase;
      }

      historyWithDurations.push({
        ...tr,
        days_in_prior_phase: daysInPreviousPhase,
        prior_phase_duration_text: `${this._formatPhaseName(tr.from_phase)} for ${daysInPreviousPhase} day${daysInPreviousPhase === 1 ? '' : 's'}`
      });

      intervalStartTime = transitionTime;
    }

    if (transitionsAsc.length > 0) {
      const latestTransition = transitionsAsc[transitionsAsc.length - 1];
      currentPhaseStartTime = latestTransition.timestamp;
    } else {
      currentPhaseStartTime = priority.created_at;
    }

    const currentPhaseStartMs = new Date(currentPhaseStartTime).getTime();
    const currentTenureMs = Math.max(0, asOfDate.getTime() - currentPhaseStartMs);
    const daysInCurrentPhase = Math.floor(currentTenureMs / msPerDay);

    if (totalDaysByPhase[priority.current_phase] !== undefined) {
      totalDaysByPhase[priority.current_phase] += daysInCurrentPhase;
    }

    const currentPhaseFormatted = this._formatPhaseName(priority.current_phase);
    const currentPhaseDurationText = `${currentPhaseFormatted} for ${daysInCurrentPhase} day${daysInCurrentPhase === 1 ? '' : 's'}`;

    return {
      priority_id: priority.id,
      priority_name: priority.name,
      current_phase: priority.current_phase,
      current_phase_started_at: currentPhaseStartTime,
      days_in_current_phase: daysInCurrentPhase,
      current_phase_duration_text: currentPhaseDurationText,
      total_days_by_phase: totalDaysByPhase,
      transitions_count: transitionsAsc.length,
      history: historyWithDurations.reverse() // Most recent first for history view
    };
  }

  /**
   * Return complete phase details combining priority, durations, and state timeline
   */
  getPhaseDetails({ userId = 'default-user', priorityId, asOf = new Date() }) {
    return this.calculatePhaseDurations({ userId, priorityId, asOf });
  }
}
