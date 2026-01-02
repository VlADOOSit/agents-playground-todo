const pool = require('../db/pool');

class TaskModel {
	async getAll({ limit, offset, status, sort }) {
		const filters = ['deleted_at IS NULL'];
		const values = [];
		const orderBy =
			sort === 'deadline'
				? 'ORDER BY deadline IS NULL ASC, deadline ASC, created_at DESC'
				: 'ORDER BY created_at DESC';

		if (status) {
			values.push(status);
			filters.push(`status = $${values.length}`);
		}

		values.push(limit);
		const limitIndex = values.length;
		values.push(offset);
		const offsetIndex = values.length;

		const whereClause = `WHERE ${filters.join(' AND ')}`;
		const result = await pool.query(
			`SELECT id, title, description, status, deadline, created_at, updated_at
			FROM tasks
			${whereClause}
			${orderBy}
			LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
			values
		);
		return result.rows;
	}

	async getTotalCount(status) {
		const filters = ['deleted_at IS NULL'];
		const values = [];

		if (status) {
			values.push(status);
			filters.push(`status = $${values.length}`);
		}

		const whereClause = `WHERE ${filters.join(' AND ')}`;
		const result = await pool.query(`SELECT COUNT(*)::int AS count FROM tasks ${whereClause}`, values);
		return result.rows[0]?.count ?? 0;
	}

	async getById(id) {
		const result = await pool.query(
			`SELECT id, title, description, status, deadline, created_at, updated_at
			FROM tasks
			WHERE id = $1 AND deleted_at IS NULL`,
			[id]
		);
		return result.rows[0] || null;
	}

	async getDeletionState(id) {
		const result = await pool.query(`SELECT id, deleted_at FROM tasks WHERE id = $1`, [id]);
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
       		WHERE id = $1 AND deleted_at IS NULL
       		RETURNING id, title, description, status, deadline, created_at, updated_at`,
			[id, title ?? null, description ?? null, status ?? null, hasDeadline, hasDeadline ? deadline : null]
		);
		return result.rows[0] || null;
	}

	async delete(id) {
		const result = await pool.query(
			`UPDATE tasks
       		SET deleted_at = now(), updated_at = now()
       		WHERE id = $1 AND deleted_at IS NULL
       		RETURNING id`,
			[id]
		);
		return result.rowCount > 0;
	}

	async undoDelete(id, restoreThresholdSeconds) {
		const result = await pool.query(
			`UPDATE tasks
			SET deleted_at = NULL, updated_at = now()
			WHERE id = $1
			AND deleted_at IS NOT NULL
			AND deleted_at >= now() - ($2::int * interval '1 second')
			RETURNING id, title, description, status, deadline, created_at, updated_at`,
			[id, restoreThresholdSeconds]
		);
		return result.rows[0] || null;
	}
}

module.exports = new TaskModel();
