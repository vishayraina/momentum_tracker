import crypto from 'crypto';

export const VALID_MEASUREMENT_TYPES = ['COUNT', 'BOOLEAN', 'QUALITATIVE', 'MAINTENANCE'];
export const VALID_GOAL_STATUSES = ['ACTIVE', 'ACHIEVED', 'RETIRED'];

export class GoalService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Calculate progress percentage from goal fields
   */
  static computeProgressPercent(goal) {
    if (!goal) return 0;
    if (goal.status === 'ACHIEVED') return 100;
    if (goal.measurement_type === 'BOOLEAN') {
      return Number(goal.current_value) >= Number(goal.target_value) ? 100 : 0;
    }
    if (goal.measurement_type === 'COUNT') {
      const start = Number(goal.start_value) || 0;
      const target = Number(goal.target_value) || 1;
      const current = Number(goal.current_value) || 0;
      if (target === start) return 100;
      const raw = ((current - start) / (target - start)) * 100;
      return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
    }
    return 0;
  }

  /**
   * Format goal with derived fields
   */
  _formatGoal(row) {
    if (!row) return null;
    return {
      ...row,
      progress_percent: GoalService.computeProgressPercent(row)
    };
  }

  /**
   * Create a new sequential milestone for a Priority
   */
  create({
    userId = 'default-user',
    priorityId,
    title,
    description = null,
    measurementType = 'COUNT',
    unit = null,
    startValue = 0,
    targetValue = 1,
    currentValue = null,
    targetDate = null
  }) {
    if (!priorityId) {
      throw new Error('priority_id is required');
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new Error('Goal title is required');
    }

    const normalizedType = (measurementType || 'COUNT').toUpperCase();
    if (!VALID_MEASUREMENT_TYPES.includes(normalizedType)) {
      throw new Error(`Invalid measurement_type: ${measurementType}. Must be one of: ${VALID_MEASUREMENT_TYPES.join(', ')}`);
    }

    // Verify parent priority exists and belongs to user
    const checkPriorityStmt = this.db.prepare(`
      SELECT id, name FROM priorities WHERE id = ? AND user_id = ?
    `);
    const priority = checkPriorityStmt.get(priorityId, userId);
    if (!priority) {
      throw new Error('Priority not found or unauthorized');
    }

    // Strictly enforce single-active-goal invariant
    const activeGoalStmt = this.db.prepare(`
      SELECT id, title FROM goals WHERE priority_id = ? AND user_id = ? AND status = 'ACTIVE'
    `);
    const activeGoal = activeGoalStmt.get(priorityId, userId);
    if (activeGoal) {
      throw new Error(`Priority already has an active goal ("${activeGoal.title}"). Complete or retire current goal before adding a new sequential milestone.`);
    }

    // Determine numerical values and units
    let startVal = Number(startValue) || 0;
    let targetVal = Number(targetValue);
    if (isNaN(targetVal)) targetVal = 1;
    let currentVal = currentValue !== null && currentValue !== undefined ? Number(currentValue) : startVal;
    let unitVal = unit?.trim() || null;

    if (normalizedType === 'COUNT') {
      if (startVal >= targetVal) {
        throw new Error('Target value must be greater than start value for quantitative count goals');
      }
      if (!unitVal) {
        throw new Error('Measurement unit is required for quantitative count goals (e.g. pages, chapters, PRs, sessions)');
      }
    } else if (normalizedType === 'BOOLEAN') {
      startVal = 0;
      targetVal = 1;
      currentVal = currentVal >= 1 ? 1 : 0;
      unitVal = null;
    } else {
      // QUALITATIVE or MAINTENANCE
      startVal = 0;
      targetVal = 1;
      currentVal = 0;
      unitVal = null;
    }

    // Calculate sequence number
    const seqStmt = this.db.prepare(`
      SELECT COALESCE(MAX(sequence_number), 0) + 1 AS next_seq
      FROM goals
      WHERE priority_id = ? AND user_id = ?
    `);
    const { next_seq: sequenceNumber } = seqStmt.get(priorityId, userId);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const insertStmt = this.db.prepare(`
      INSERT INTO goals (
        id, user_id, priority_id, title, description,
        measurement_type, unit, start_value, target_value, current_value,
        target_date, status, sequence_number, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `);

    // Use transaction to insert goal and update priority current_goal_id
    const transaction = this.db.transaction(() => {
      insertStmt.run(
        id,
        userId,
        priorityId,
        title.trim(),
        description?.trim() || null,
        normalizedType,
        unitVal,
        startVal,
        targetVal,
        currentVal,
        targetDate || null,
        sequenceNumber,
        now
      );

      const updatePriorityStmt = this.db.prepare(`
        UPDATE priorities
        SET current_goal_id = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `);
      updatePriorityStmt.run(id, now, priorityId, userId);
    });

    transaction();

    return this.getById({ userId, id });
  }

  /**
   * Get Goal by ID
   */
  getById({ userId = 'default-user', id }) {
    const stmt = this.db.prepare(`
      SELECT 
        g.id, g.user_id, g.priority_id, g.title, g.description,
        g.measurement_type, g.unit, g.start_value, g.target_value, g.current_value,
        g.target_date, g.status, g.sequence_number, g.created_at, g.achieved_at, g.achievement_note,
        p.name AS priority_name, p.current_phase, p.area_id
      FROM goals g
      JOIN priorities p ON p.id = g.priority_id
      WHERE g.id = ? AND g.user_id = ?
    `);

    const row = stmt.get(id, userId);
    return this._formatGoal(row);
  }

  /**
   * Get Active Goal for a Priority
   */
  getActiveByPriorityId({ userId = 'default-user', priorityId }) {
    const stmt = this.db.prepare(`
      SELECT 
        g.id, g.user_id, g.priority_id, g.title, g.description,
        g.measurement_type, g.unit, g.start_value, g.target_value, g.current_value,
        g.target_date, g.status, g.sequence_number, g.created_at, g.achieved_at, g.achievement_note,
        p.name AS priority_name, p.current_phase, p.area_id
      FROM goals g
      JOIN priorities p ON p.id = g.priority_id
      WHERE g.priority_id = ? AND g.user_id = ? AND g.status = 'ACTIVE'
    `);

    const row = stmt.get(priorityId, userId);
    return this._formatGoal(row);
  }

  /**
   * List all goals for a priority (sequential history)
   */
  listByPriorityId({ userId = 'default-user', priorityId, status } = {}) {
    let query = `
      SELECT 
        g.id, g.user_id, g.priority_id, g.title, g.description,
        g.measurement_type, g.unit, g.start_value, g.target_value, g.current_value,
        g.target_date, g.status, g.sequence_number, g.created_at, g.achieved_at, g.achievement_note,
        p.name AS priority_name, p.current_phase, p.area_id
      FROM goals g
      JOIN priorities p ON p.id = g.priority_id
      WHERE g.priority_id = ? AND g.user_id = ?
    `;
    const params = [priorityId, userId];

    if (status) {
      query += ` AND g.status = ?`;
      params.push(status.toUpperCase());
    }

    query += ` ORDER BY g.sequence_number ASC, g.created_at ASC`;

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(r => this._formatGoal(r));
  }

  /**
   * Update goal details (active goal only)
   */
  update({
    userId = 'default-user',
    id,
    title,
    description,
    unit,
    startValue,
    targetValue,
    currentValue,
    targetDate
  }) {
    const existing = this.getById({ userId, id });
    if (!existing) {
      return null;
    }

    if (existing.status !== 'ACTIVE') {
      throw new Error(`Cannot modify a goal that is already ${existing.status.toLowerCase()}`);
    }

    const updatedTitle = title !== undefined ? title?.trim() : existing.title;
    if (!updatedTitle) {
      throw new Error('Goal title cannot be empty');
    }

    const updatedDesc = description !== undefined ? (description?.trim() || null) : existing.description;
    const updatedTargetDate = targetDate !== undefined ? (targetDate || null) : existing.target_date;

    let updatedStart = startValue !== undefined ? Number(startValue) : existing.start_value;
    let updatedTarget = targetValue !== undefined ? Number(targetValue) : existing.target_value;
    let updatedCurrent = currentValue !== undefined ? Number(currentValue) : existing.current_value;
    let updatedUnit = unit !== undefined ? (unit?.trim() || null) : existing.unit;

    if (existing.measurement_type === 'COUNT') {
      if (updatedStart >= updatedTarget) {
        throw new Error('Target value must be greater than start value for quantitative count goals');
      }
      if (!updatedUnit) {
        throw new Error('Measurement unit is required for quantitative count goals');
      }
    }

    const stmt = this.db.prepare(`
      UPDATE goals
      SET 
        title = ?,
        description = ?,
        unit = ?,
        start_value = ?,
        target_value = ?,
        current_value = ?,
        target_date = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      updatedTitle,
      updatedDesc,
      updatedUnit,
      updatedStart,
      updatedTarget,
      updatedCurrent,
      updatedTargetDate,
      id,
      userId
    );

    return this.getById({ userId, id });
  }

  /**
   * Fast progress update for quantitative/boolean goals
   */
  updateProgress({ userId = 'default-user', id, currentValue }) {
    if (currentValue === undefined || isNaN(Number(currentValue))) {
      throw new Error('Valid numeric currentValue is required');
    }

    const existing = this.getById({ userId, id });
    if (!existing) {
      return null;
    }
    if (existing.status !== 'ACTIVE') {
      throw new Error(`Cannot update progress on a goal that is ${existing.status.toLowerCase()}`);
    }

    const newCurrent = Number(currentValue);

    const stmt = this.db.prepare(`
      UPDATE goals
      SET current_value = ?
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(newCurrent, id, userId);

    return this.getById({ userId, id });
  }

  /**
   * Mark a goal as ACHIEVED with an optional reflection note
   * Immutably preserves milestone timestamp and logs a GOAL_ACHIEVED progress event
   */
  achieve({
    userId = 'default-user',
    id,
    note = null,
    achievedAt = null
  }) {
    const existing = this.getById({ userId, id });
    if (!existing) {
      return null;
    }
    if (existing.status !== 'ACTIVE') {
      throw new Error(`Goal is already ${existing.status.toLowerCase()}`);
    }

    const timestamp = achievedAt ? new Date(achievedAt).toISOString() : new Date().toISOString();
    const eventId = crypto.randomUUID();
    const reflectionNote = note?.trim() || null;

    const transaction = this.db.transaction(() => {
      // 1. Mark goal as ACHIEVED
      const updateGoalStmt = this.db.prepare(`
        UPDATE goals
        SET 
          status = 'ACHIEVED',
          achieved_at = ?,
          achievement_note = ?,
          current_value = target_value
        WHERE id = ? AND user_id = ?
      `);
      updateGoalStmt.run(timestamp, reflectionNote, id, userId);

      // 2. Clear current_goal_id on priority if it pointed to this goal
      const clearPriorityStmt = this.db.prepare(`
        UPDATE priorities
        SET current_goal_id = NULL, updated_at = ?
        WHERE id = ? AND user_id = ? AND current_goal_id = ?
      `);
      clearPriorityStmt.run(timestamp, existing.priority_id, userId, id);

      // 3. Log an immutable GOAL_ACHIEVED event in progress_events
      const eventStmt = this.db.prepare(`
        INSERT INTO progress_events (
          id, user_id, priority_id, goal_id, event_type, occurred_at, note, status, created_at
        )
        VALUES (?, ?, ?, ?, 'GOAL_ACHIEVED', ?, ?, 'ACTIVE', ?)
      `);
      eventStmt.run(
        eventId,
        userId,
        existing.priority_id,
        id,
        timestamp,
        reflectionNote ? `Milestone Achieved: ${existing.title} - ${reflectionNote}` : `Milestone Achieved: ${existing.title}`,
        timestamp
      );
    });

    transaction();

    return this.getById({ userId, id });
  }

  /**
   * Retire a goal without marking it achieved
   */
  retire({ userId = 'default-user', id, note = null }) {
    const existing = this.getById({ userId, id });
    if (!existing) {
      return null;
    }
    if (existing.status !== 'ACTIVE') {
      throw new Error(`Goal is already ${existing.status.toLowerCase()}`);
    }

    const now = new Date().toISOString();
    const retirementNote = note?.trim() || null;

    const transaction = this.db.transaction(() => {
      const updateGoalStmt = this.db.prepare(`
        UPDATE goals
        SET 
          status = 'RETIRED',
          achievement_note = ?
        WHERE id = ? AND user_id = ?
      `);
      updateGoalStmt.run(retirementNote, id, userId);

      const clearPriorityStmt = this.db.prepare(`
        UPDATE priorities
        SET current_goal_id = NULL, updated_at = ?
        WHERE id = ? AND user_id = ? AND current_goal_id = ?
      `);
      clearPriorityStmt.run(now, existing.priority_id, userId, id);
    });

    transaction();

    return this.getById({ userId, id });
  }

  /**
   * Delete a goal record
   */
  delete({ userId = 'default-user', id }) {
    const existing = this.getById({ userId, id });
    if (!existing) {
      return false;
    }

    const now = new Date().toISOString();

    const transaction = this.db.transaction(() => {
      // Clear priority current_goal_id if matched
      const clearPriorityStmt = this.db.prepare(`
        UPDATE priorities
        SET current_goal_id = NULL, updated_at = ?
        WHERE id = ? AND user_id = ? AND current_goal_id = ?
      `);
      clearPriorityStmt.run(now, existing.priority_id, userId, id);

      const deleteStmt = this.db.prepare(`
        DELETE FROM goals
        WHERE id = ? AND user_id = ?
      `);
      deleteStmt.run(id, userId);
    });

    transaction();

    return true;
  }
}
