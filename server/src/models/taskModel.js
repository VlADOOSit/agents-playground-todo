const pool = require('../db/pool');

class TaskModel {
	async getAll({ limit, offset, status, sort }) {
		const values = [limit, offset];
		let whereClause = '';
		const orderBy =
			sort === 'deadline'
				? 'ORDER BY deadline IS NULL ASC, deadline ASC, created_at DESC'
				: 'ORDER BY created_at DESC';

		if (status) {
			values.push(status);
			whereClause = `WHERE status = $${values.length}`;
		}

		const result = await pool.query(
			`SELECT id, title, description, status, deadline, created_at, updated_at
			FROM tasks
			${whereClause}
			${orderBy}
			LIMIT $1 OFFSET $2`,
			values
		);
		return result.rows;
	}

	async getTotalCount(status) {
		const values = [];
		let whereClause = '';

		if (status) {
			values.push(status);
			whereClause = 'WHERE status = $1';
		}

		const result = await pool.query(`SELECT COUNT(*)::int AS count FROM tasks ${whereClause}`, values);
		return result.rows[0]?.count ?? 0;
	}

	async getById(id) {
		const result = await pool.query(
			`SELECT id, title, description, status, deadline, created_at, updated_at FROM tasks WHERE id = $1`,
			[id]
		);
		return result.rows[0] || null;
	}

	async create({ title, description, status, deadline }) {
		const result = await pool.query(
			`INSERT INTO tasks (title, description, status, deadline)
       		VALUES ($1, $2, COALESCE($3::task_status, 'TODO'::task_status), $4)
       		RETURNING id, title, description, status, deadline, created_at, updated_at`,
			[title, description ?? null, status ?? 'TODO', deadline ?? null]
		);
		return result.rows[0];
	}

	async update(id, { title, description, status, deadline }) {
		const hasDeadline = deadline !== undefined;
		const result = await pool.query(
			`UPDATE tasks
      		SET title = COALESCE($2, title),
           	description = COALESCE($3, description),
           	status = COALESCE($4::task_status, status),
           	deadline = CASE WHEN $5 THEN $6 ELSE deadline END,
           	updated_at = now()
       		WHERE id = $1
       		RETURNING id, title, description, status, deadline, created_at, updated_at`,
			[id, title ?? null, description ?? null, status ?? null, hasDeadline, hasDeadline ? deadline : null]
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
