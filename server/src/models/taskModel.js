const pool = require('../db/pool');

class TaskModel {
  async getAll() {
    const result = await pool.query(
      `SELECT id, title, description, status, created_at, updated_at
       FROM tasks
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async getById(id) {
    const result = await pool.query(
      `SELECT id, title, description, status, created_at, updated_at
       FROM tasks
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create({ title, description, status }) {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status)
       VALUES ($1, $2, COALESCE($3::task_status, 'TODO'::task_status))
       RETURNING id, title, description, status, created_at, updated_at`,
      [title, description ?? null, status ?? 'TODO']
    );
    return result.rows[0];
  }

  async update(id, { title, description, status }) {
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           status = COALESCE($4::task_status, status),
           updated_at = now()
       WHERE id = $1
       RETURNING id, title, description, status, created_at, updated_at`,
      [id, title ?? null, description ?? null, status ?? null]
    );
    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    return result.rowCount > 0;
  }
}

module.exports = new TaskModel();
