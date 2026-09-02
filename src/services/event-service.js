import crypto from 'crypto';

export const VALID_EVENT_TYPES = ['SPARK', 'FIRE', 'COOK_SESSION', 'SYNTHESIS', 'SERVE', 'GOAL_ACHIEVED'];
export const VALID_EVENT_STATUSES = ['ACTIVE', 'VOIDED'];

export class EventService {
  constructor(db) {
    this.db = db;
  }

  _formatEvent(row) {
    if (!row) return null;
    return {
      id: row.id,
      user_id: row.user_id,
      priority_id: row.priority_id,
      priority_name: row.priority_name || null,
      area_id: row.area_id || null,
      area_name: row.area_name || null,
      life_direction_id: row.life_direction_id || null,
      life_direction_name: row.life_direction_name || null,
      goal_id: row.goal_id || null,
      goal_title: row.goal_title || null,
      event_type: row.event_type,
      occurred_at: row.occurred_at,
      note: row.note || null,
      status: row.status,
      created_at: row.created_at
    };
  }

  /**
   * Log a new progress event
   */
  create({
    userId = 'default-user',
    priorityId,
    goalId = null,
    eventType,
    occurredAt = null,
    note = null,
    status = 'ACTIVE'
  }) {
    if (!priorityId) {
      throw new Error('priority_id is required');
    }
    if (!eventType) {
      throw new Error('event_type is required');
    }

    const normalizedType = eventType.toUpperCase();
    if (!VALID_EVENT_TYPES.includes(normalizedType)) {
      throw new Error(`Invalid event_type: ${eventType}. Must be one of: ${VALID_EVENT_TYPES.join(', ')}`);
    }

    const normalizedStatus = (status || 'ACTIVE').toUpperCase();
    if (!VALID_EVENT_STATUSES.includes(normalizedStatus)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${VALID_EVENT_STATUSES.join(', ')}`);
    }

    // Verify parent priority exists and belongs to user
    const checkPriorityStmt = this.db.prepare(`
      SELECT id, name FROM priorities WHERE id = ? AND user_id = ?
    `);
    const priority = checkPriorityStmt.get(priorityId, userId);
    if (!priority) {
      throw new Error('Priority not found or unauthorized');
    }

    // If goalId is provided, verify it exists and belongs to priority & user
    let validGoalId = null;
    if (goalId) {
      const checkGoalStmt = this.db.prepare(`
        SELECT id FROM goals WHERE id = ? AND priority_id = ? AND user_id = ?
      `);
      const goal = checkGoalStmt.get(goalId, priorityId, userId);
      if (!goal) {
        throw new Error('Goal not found or does not belong to this priority');
      }
      validGoalId = goalId;
    }

    // Timestamp validation & default
    let timestamp;
    if (occurredAt) {
      const parsed = new Date(occurredAt);
      if (isNaN(parsed.getTime())) {
        throw new Error('Invalid occurred_at timestamp format');
      }
      timestamp = parsed.toISOString();
    } else {
      timestamp = new Date().toISOString();
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const noteText = note && typeof note === 'string' && note.trim() ? note.trim() : null;

    const insertStmt = this.db.prepare(`
      INSERT INTO progress_events (
        id, user_id, priority_id, goal_id, event_type, occurred_at, note, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      userId,
      priorityId,
      validGoalId,
      normalizedType,
      timestamp,
      noteText,
      normalizedStatus,
      createdAt
    );

    return this.getById({ userId, id });
  }

  /**
   * Get single event by ID
   */
  getById({ userId = 'default-user', id }) {
    const stmt = this.db.prepare(`
      SELECT 
        e.id, e.user_id, e.priority_id, e.goal_id, e.event_type,
        e.occurred_at, e.note, e.status, e.created_at,
        p.name AS priority_name, p.area_id,
        a.name AS area_name, a.life_direction_id,
        ld.name AS life_direction_name,
        g.title AS goal_title
      FROM progress_events e
      JOIN priorities p ON p.id = e.priority_id
      JOIN areas a ON a.id = p.area_id
      JOIN life_directions ld ON ld.id = a.life_direction_id
      LEFT JOIN goals g ON g.id = e.goal_id
      WHERE e.id = ? AND e.user_id = ?
    `);

    const row = stmt.get(id, userId);
    return this._formatEvent(row);
  }

  /**
   * List progress events with filtering and chronological sorting
   */
  list({
    userId = 'default-user',
    priorityId = null,
    goalId = null,
    eventType = null,
    status = null,
    sort = 'desc',
    limit = 100,
    offset = 0
  } = {}) {
    let query = `
      SELECT 
        e.id, e.user_id, e.priority_id, e.goal_id, e.event_type,
        e.occurred_at, e.note, e.status, e.created_at,
        p.name AS priority_name, p.area_id,
        a.name AS area_name, a.life_direction_id,
        ld.name AS life_direction_name,
        g.title AS goal_title
      FROM progress_events e
      JOIN priorities p ON p.id = e.priority_id
      JOIN areas a ON a.id = p.area_id
      JOIN life_directions ld ON ld.id = a.life_direction_id
      LEFT JOIN goals g ON g.id = e.goal_id
      WHERE e.user_id = ?
    `;
    const params = [userId];

    if (priorityId) {
      query += ` AND e.priority_id = ?`;
      params.push(priorityId);
    }

    if (goalId) {
      query += ` AND e.goal_id = ?`;
      params.push(goalId);
    }

    if (eventType) {
      query += ` AND e.event_type = ?`;
      params.push(eventType.toUpperCase());
    }

    if (status) {
      query += ` AND e.status = ?`;
      params.push(status.toUpperCase());
    }

    const direction = sort.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY e.occurred_at ${direction}, e.created_at ${direction}`;

    if (limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(r => this._formatEvent(r));
  }

  /**
   * Void an erroneous event (immutable status change, never deleted)
   */
  voidEvent({ userId = 'default-user', id, reason = null }) {
    const existing = this.getById({ userId, id });
    if (!existing) {
      return null;
    }

    let updatedNote = existing.note;
    if (reason && typeof reason === 'string' && reason.trim()) {
      const reasonText = reason.trim();
      updatedNote = updatedNote 
        ? `${updatedNote} [Void Reason: ${reasonText}]`
        : `[Void Reason: ${reasonText}]`;
    }

    const stmt = this.db.prepare(`
      UPDATE progress_events
      SET status = 'VOIDED', note = ?
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(updatedNote, id, userId);

    return this.getById({ userId, id });
  }

  /**
   * Fetch chronological timeline and active metric aggregations for a Priority
   */
  getPriorityTimeline({ userId = 'default-user', priorityId, includeVoided = true }) {
    const checkPriorityStmt = this.db.prepare(`
      SELECT 
        p.id, p.name, p.current_phase, p.current_goal_id,
        a.name AS area_name, ld.name AS life_direction_name,
        g.title AS current_goal_title
      FROM priorities p
      JOIN areas a ON a.id = p.area_id
      JOIN life_directions ld ON ld.id = a.life_direction_id
      LEFT JOIN goals g ON g.id = p.current_goal_id
      WHERE p.id = ? AND p.user_id = ?
    `);
    const priority = checkPriorityStmt.get(priorityId, userId);
    if (!priority) {
      throw new Error('Priority not found or unauthorized');
    }

    // Query all events for priority
    const events = this.list({
      userId,
      priorityId,
      status: includeVoided ? null : 'ACTIVE',
      sort: 'desc',
      limit: 500
    });

    // Query aggregation counts (active vs voided)
    const countsStmt = this.db.prepare(`
      SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count,
        SUM(CASE WHEN status = 'VOIDED' THEN 1 ELSE 0 END) AS voided_count,
        SUM(CASE WHEN status = 'ACTIVE' AND event_type = 'SPARK' THEN 1 ELSE 0 END) AS spark_count,
        SUM(CASE WHEN status = 'ACTIVE' AND event_type = 'FIRE' THEN 1 ELSE 0 END) AS fire_count,
        SUM(CASE WHEN status = 'ACTIVE' AND event_type = 'COOK_SESSION' THEN 1 ELSE 0 END) AS cook_session_count,
        SUM(CASE WHEN status = 'ACTIVE' AND event_type = 'SERVE' THEN 1 ELSE 0 END) AS serve_count,
        SUM(CASE WHEN status = 'ACTIVE' AND event_type = 'GOAL_ACHIEVED' THEN 1 ELSE 0 END) AS goal_achieved_count,
        SUM(CASE WHEN status = 'ACTIVE' AND event_type = 'SYNTHESIS' THEN 1 ELSE 0 END) AS synthesis_count
      FROM progress_events
      WHERE priority_id = ? AND user_id = ?
    `);

    const rawCounts = countsStmt.get(priorityId, userId) || {};

    const counts = {
      total: rawCounts.total_count || 0,
      active: rawCounts.active_count || 0,
      voided: rawCounts.voided_count || 0,
      spark: rawCounts.spark_count || 0,
      fire: rawCounts.fire_count || 0,
      cook_session: rawCounts.cook_session_count || 0,
      serve: rawCounts.serve_count || 0,
      goal_achieved: rawCounts.goal_achieved_count || 0,
      synthesis: rawCounts.synthesis_count || 0
    };

    return {
      priority,
      events,
      counts
    };
  }
}
