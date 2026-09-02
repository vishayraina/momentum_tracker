import crypto from 'crypto';

export class AreaService {
  constructor(db) {
    this.db = db;
  }

  create({ userId = 'default-user', lifeDirectionId, name, description = null, sortOrder = 0 }) {
    if (!lifeDirectionId) {
      throw new Error('life_direction_id is required');
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('Area name is required');
    }

    // Verify parent life direction exists for this user
    const checkStmt = this.db.prepare(`
      SELECT id FROM life_directions WHERE id = ? AND user_id = ?
    `);
    const parent = checkStmt.get(lifeDirectionId, userId);
    if (!parent) {
      throw new Error('Life Direction not found or unauthorized');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO areas (id, user_id, life_direction_id, name, description, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, lifeDirectionId, name.trim(), description?.trim() || null, sortOrder, now, now);

    return this.getById({ userId, id });
  }

  getById({ userId = 'default-user', id }) {
    const stmt = this.db.prepare(`
      SELECT a.id, a.user_id, a.life_direction_id, a.name, a.description, a.sort_order, a.created_at, a.updated_at,
             ld.name AS life_direction_name
      FROM areas a
      JOIN life_directions ld ON ld.id = a.life_direction_id
      WHERE a.id = ? AND a.user_id = ?
    `);

    const row = stmt.get(id, userId);
    return row || null;
  }

  list({ userId = 'default-user', lifeDirectionId } = {}) {
    let query = `
      SELECT a.id, a.user_id, a.life_direction_id, a.name, a.description, a.sort_order, a.created_at, a.updated_at,
             ld.name AS life_direction_name
      FROM areas a
      JOIN life_directions ld ON ld.id = a.life_direction_id
      WHERE a.user_id = ?
    `;
    const params = [userId];

    if (lifeDirectionId) {
      query += ` AND a.life_direction_id = ?`;
      params.push(lifeDirectionId);
    }

    query += ` ORDER BY a.sort_order ASC, a.created_at ASC`;

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  update({ userId = 'default-user', id, lifeDirectionId, name, description, sortOrder }) {
    const existing = this.getById({ userId, id });
    if (!existing) {
      return null;
    }

    let updatedDirectionId = existing.life_direction_id;
    if (lifeDirectionId !== undefined) {
      const checkStmt = this.db.prepare(`SELECT id FROM life_directions WHERE id = ? AND user_id = ?`);
      const parent = checkStmt.get(lifeDirectionId, userId);
      if (!parent) {
        throw new Error('Target Life Direction not found');
      }
      updatedDirectionId = lifeDirectionId;
    }

    const updatedName = name !== undefined ? name?.trim() : existing.name;
    if (!updatedName) {
      throw new Error('Area name cannot be empty');
    }

    const updatedDescription = description !== undefined ? (description?.trim() || null) : existing.description;
    const updatedSortOrder = sortOrder !== undefined ? Number(sortOrder) : existing.sort_order;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE areas
      SET life_direction_id = ?, name = ?, description = ?, sort_order = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(updatedDirectionId, updatedName, updatedDescription, updatedSortOrder, now, id, userId);

    return this.getById({ userId, id });
  }

  delete({ userId = 'default-user', id }) {
    const stmt = this.db.prepare(`
      DELETE FROM areas
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}
