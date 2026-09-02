import crypto from 'crypto';

export const VALID_PHASES = ['SPARK', 'FIRE', 'COOK'];

export class PriorityService {
  constructor(db) {
    this.db = db;
  }

  create({
    userId = 'default-user',
    areaId,
    name,
    description = null,
    currentPhase = 'SPARK',
    sparkDefinition,
    fireDefinition,
    cookDefinition,
    synthesisDefinition,
    isActive = 1
  }) {
    if (!areaId) {
      throw new Error('area_id is required');
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('Priority name is required');
    }

    const normalizedPhase = (currentPhase || 'SPARK').toUpperCase();
    if (!VALID_PHASES.includes(normalizedPhase)) {
      throw new Error(`Invalid phase: ${currentPhase}. Must be one of: ${VALID_PHASES.join(', ')}`);
    }

    if (!sparkDefinition || typeof sparkDefinition !== 'string' || !sparkDefinition.trim()) {
      throw new Error('spark_definition is required');
    }
    if (!fireDefinition || typeof fireDefinition !== 'string' || !fireDefinition.trim()) {
      throw new Error('fire_definition is required');
    }
    if (!cookDefinition || typeof cookDefinition !== 'string' || !cookDefinition.trim()) {
      throw new Error('cook_definition is required');
    }
    if (!synthesisDefinition || typeof synthesisDefinition !== 'string' || !synthesisDefinition.trim()) {
      throw new Error('synthesis_definition is required');
    }

    // Verify parent area exists
    const checkAreaStmt = this.db.prepare(`SELECT id FROM areas WHERE id = ? AND user_id = ?`);
    const area = checkAreaStmt.get(areaId, userId);
    if (!area) {
      throw new Error('Area not found or unauthorized');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO priorities (
        id, user_id, area_id, name, description, current_phase,
        spark_definition, fire_definition, cook_definition, synthesis_definition,
        is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      areaId,
      name.trim(),
      description?.trim() || null,
      normalizedPhase,
      sparkDefinition.trim(),
      fireDefinition.trim(),
      cookDefinition.trim(),
      synthesisDefinition.trim(),
      isActive ? 1 : 0,
      now,
      now
    );

    return this.getById({ userId, id });
  }

  getById({ userId = 'default-user', id }) {
    const stmt = this.db.prepare(`
      SELECT 
        p.id, p.user_id, p.area_id, p.name, p.description, p.current_phase, p.current_goal_id,
        p.spark_definition, p.fire_definition, p.cook_definition, p.synthesis_definition,
        p.is_active, p.created_at, p.updated_at,
        a.name AS area_name, a.life_direction_id,
        ld.name AS life_direction_name
      FROM priorities p
      JOIN areas a ON a.id = p.area_id
      JOIN life_directions ld ON ld.id = a.life_direction_id
      WHERE p.id = ? AND p.user_id = ?
    `);

    const row = stmt.get(id, userId);
    return row || null;
  }

  list({ userId = 'default-user', areaId, lifeDirectionId, phase, isActive } = {}) {
    let query = `
      SELECT 
        p.id, p.user_id, p.area_id, p.name, p.description, p.current_phase, p.current_goal_id,
        p.spark_definition, p.fire_definition, p.cook_definition, p.synthesis_definition,
        p.is_active, p.created_at, p.updated_at,
        a.name AS area_name, a.life_direction_id,
        ld.name AS life_direction_name
      FROM priorities p
      JOIN areas a ON a.id = p.area_id
      JOIN life_directions ld ON ld.id = a.life_direction_id
      WHERE p.user_id = ?
    `;
    const params = [userId];

    if (areaId) {
      query += ` AND p.area_id = ?`;
      params.push(areaId);
    }

    if (lifeDirectionId) {
      query += ` AND a.life_direction_id = ?`;
      params.push(lifeDirectionId);
    }

    if (phase) {
      query += ` AND p.current_phase = ?`;
      params.push(phase.toUpperCase());
    }

    if (isActive !== undefined) {
      query += ` AND p.is_active = ?`;
      params.push(isActive ? 1 : 0);
    }

    query += ` ORDER BY ld.sort_order ASC, a.sort_order ASC, p.created_at ASC`;

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  listGroupedHierarchy({ userId = 'default-user', isActive = 1 } = {}) {
    // 1. Fetch directions
    const dirStmt = this.db.prepare(`
      SELECT id, user_id, name, description, sort_order, created_at, updated_at
      FROM life_directions
      WHERE user_id = ?
      ORDER BY sort_order ASC, created_at ASC
    `);
    const directions = dirStmt.all(userId);

    // 2. Fetch areas
    const areaStmt = this.db.prepare(`
      SELECT id, user_id, life_direction_id, name, description, sort_order, created_at, updated_at
      FROM areas
      WHERE user_id = ?
      ORDER BY sort_order ASC, created_at ASC
    `);
    const areas = areaStmt.all(userId);

    // 3. Fetch priorities
    const priorities = this.list({ userId, isActive });

    // 4. Assemble hierarchy
    const areaMap = new Map();
    areas.forEach(area => {
      areaMap.set(area.id, { ...area, priorities: [] });
    });

    priorities.forEach(priority => {
      if (areaMap.has(priority.area_id)) {
        areaMap.get(priority.area_id).priorities.push(priority);
      }
    });

    const dirMap = new Map();
    directions.forEach(dir => {
      dirMap.set(dir.id, { ...dir, areas: [] });
    });

    areaMap.forEach(area => {
      if (dirMap.has(area.life_direction_id)) {
        dirMap.get(area.life_direction_id).areas.push(area);
      }
    });

    return Array.from(dirMap.values());
  }

  update({
    userId = 'default-user',
    id,
    areaId,
    name,
    description,
    currentPhase,
    sparkDefinition,
    fireDefinition,
    cookDefinition,
    synthesisDefinition,
    isActive
  }) {
    const existing = this.getById({ userId, id });
    if (!existing) {
      return null;
    }

    let updatedAreaId = existing.area_id;
    if (areaId !== undefined) {
      const checkAreaStmt = this.db.prepare(`SELECT id FROM areas WHERE id = ? AND user_id = ?`);
      const area = checkAreaStmt.get(areaId, userId);
      if (!area) {
        throw new Error('Target Area not found');
      }
      updatedAreaId = areaId;
    }

    const updatedName = name !== undefined ? name?.trim() : existing.name;
    if (!updatedName) {
      throw new Error('Priority name cannot be empty');
    }

    let updatedPhase = existing.current_phase;
    if (currentPhase !== undefined) {
      const normalizedPhase = currentPhase.toUpperCase();
      if (!VALID_PHASES.includes(normalizedPhase)) {
        throw new Error(`Invalid phase: ${currentPhase}. Must be one of: ${VALID_PHASES.join(', ')}`);
      }
      updatedPhase = normalizedPhase;
    }

    const updatedSparkDef = sparkDefinition !== undefined ? sparkDefinition?.trim() : existing.spark_definition;
    const updatedFireDef = fireDefinition !== undefined ? fireDefinition?.trim() : existing.fire_definition;
    const updatedCookDef = cookDefinition !== undefined ? cookDefinition?.trim() : existing.cook_definition;
    const updatedSynthDef = synthesisDefinition !== undefined ? synthesisDefinition?.trim() : existing.synthesis_definition;

    if (!updatedSparkDef || !updatedFireDef || !updatedCookDef || !updatedSynthDef) {
      throw new Error('Operating definitions cannot be empty');
    }

    const updatedDescription = description !== undefined ? (description?.trim() || null) : existing.description;
    const updatedIsActive = isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE priorities
      SET 
        area_id = ?,
        name = ?,
        description = ?,
        current_phase = ?,
        spark_definition = ?,
        fire_definition = ?,
        cook_definition = ?,
        synthesis_definition = ?,
        is_active = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      updatedAreaId,
      updatedName,
      updatedDescription,
      updatedPhase,
      updatedSparkDef,
      updatedFireDef,
      updatedCookDef,
      updatedSynthDef,
      updatedIsActive,
      now,
      id,
      userId
    );

    return this.getById({ userId, id });
  }

  delete({ userId = 'default-user', id }) {
    const stmt = this.db.prepare(`
      DELETE FROM priorities
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}
