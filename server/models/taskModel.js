const pool = require('../db/pool');
const { TASKS_PER_PAGE } = require('../utils/constant');

class TaskModel {
    async createTask(title, description, status, deadline = null) {
        const result = await pool.query(
            'INSERT INTO tasks (title, description, status, deadline) VALUES ($1, $2, $3, $4) RETURNING id, title, description, status, deadline, created_at, updated_at;',
            [title, description, status, deadline]
        );
        return result.rows[0];
    }

    async getAllTasks(page = 1, limit = TASKS_PER_PAGE, status = null, sort = 'createdAt') {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM tasks WHERE deleted_at IS NULL';
        const queryValues = [limit, offset];
        let paramIndex = 3;

        if (status && status !== 'ALL') {
            query += ' AND status = $' + paramIndex;
            queryValues.push(status);
            paramIndex++;
        }

        if (sort === 'deadline') {
            query += ' ORDER BY deadline IS NULL, deadline ASC LIMIT $1 OFFSET $2;';
        } else {
            query += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2;';
        }

        const result = await pool.query(query, queryValues);
        return result.rows;
    }

    async getTasksCount(status = null) {
        let query = 'SELECT COUNT(*) as total FROM tasks WHERE deleted_at IS NULL';
        const queryValues = [];

        if (status && status !== 'ALL') {
            query += ' AND status = $1';
            queryValues.push(status);
        }

        const result = await pool.query(query, queryValues);
        return parseInt(result.rows[0].total);
    }

    async getTaskById(id) {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL;', [parseInt(id)]);
        return result.rows[0];
    }

    async updateTask(id, updates) {
        const setClauses = [];
        const queryValues = [];
        let paramIndex = 1;

        for (const key in updates) {
            if (Object.hasOwnProperty.call(updates, key)) {
                setClauses.push(`${key} = $${paramIndex}`);
                queryValues.push(updates[key]);
                paramIndex++;
            }
        }

        if (setClauses.length === 0) {
            return null;
        }

        queryValues.push(id);

        const query = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING id, title, description, status, deadline, created_at, updated_at;`;

        const result = await pool.query(query, queryValues);
        return result.rows[0];
    }

    async softDeleteTask(id) {
        const result = await pool.query('UPDATE tasks SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id;', [parseInt(id)]);
        return result.rows[0];
    }

    async restoreTask(id) {
        const result = await pool.query('UPDATE tasks SET deleted_at = NULL WHERE id = $1 RETURNING id, title, description, status, deadline, created_at, updated_at;', [parseInt(id)]);
        return result.rows[0];
    }

    async permanentDeleteTask(id) {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id;', [parseInt(id)]);
        return result.rows[0];
    }

    async getDeletedTasks(olderThanMinutes = 5) {
        const result = await pool.query('SELECT * FROM tasks WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL \'$1 minutes\';', [olderThanMinutes]);
        return result.rows;
    }
}

module.exports = new TaskModel();

