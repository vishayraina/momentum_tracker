import crypto from 'crypto';

export class LifeDirectionService {
  constructor(db) {
    this.db = db;
  }

  create({ userId = 'default-user', name, description = null, sortOrder = 0 }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('Life Direction name is required');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO life_directions (id, user_id, name, description, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, name.trim(), description?.trim() || null, sortOrder, now, now);

    return this.getById({ userId, id });
  }

  getById({ userId = 'default-user', id }) {
    const stmt = this.db.prepare(`
      SELECT id, user_id, name, description, sort_order, created_at, updated_at
      FROM life_directions
      WHERE id = ? AND user_id = ?
    `);

    const row = stmt.get(id, userId);
    return row || null;
  }

  list({ userId = 'default-user' } = {}) {
    const stmt = this.db.prepare(`
      SELECT id, user_id, name, description, sort_order, created_at, updated_at
      FROM life_directions
      WHERE user_id = ?
      ORDER BY sort_order ASC, created_at ASC
    `);

    return stmt.all(userId);
  }

  update({ userId = 'default-user', id, name, description, sortOrder }) {
    const existing = this.getById({ userId, id });
    if (!existing) {
      return null;
    }

    const updatedName = name !== undefined ? name?.trim() : existing.name;
    if (!updatedName) {
      throw new Error('Life Direction name cannot be empty');
    }

    const updatedDescription = description !== undefined ? (description?.trim() || null) : existing.description;
    const updatedSortOrder = sortOrder !== undefined ? Number(sortOrder) : existing.sort_order;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE life_directions
      SET name = ?, description = ?, sort_order = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(updatedName, updatedDescription, updatedSortOrder, now, id, userId);

    return this.getById({ userId, id });
  }

  delete({ userId = 'default-user', id }) {
    const stmt = this.db.prepare(`
      DELETE FROM life_directions
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}
