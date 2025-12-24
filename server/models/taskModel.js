const pool = require('../db/pool');

class TaskModel {
    async createTask(title, description, status) {
        const result = await pool.query(
            'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING id, title, description, status, created_at, updated_at;',
            [title, description, status]
        );
        return result.rows[0];
    }

    async getAllTasks(page = 1, limit = 5, status = null) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM tasks';
        const queryValues = [limit, offset];
        let paramIndex = 3;

        if (status && status !== 'ALL') {
            query += ' WHERE status = $' + paramIndex;
            queryValues.push(status);
            paramIndex++;
        }

        query += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2;';

        const result = await pool.query(query, queryValues);
        return result.rows;
    }

    async getTasksCount(status = null) {
        let query = 'SELECT COUNT(*) as total FROM tasks';
        const queryValues = [];

        if (status && status !== 'ALL') {
            query += ' WHERE status = $1';
            queryValues.push(status);
        }

        const result = await pool.query(query, queryValues);
        return parseInt(result.rows[0].total);
    }

    async getTaskById(id) {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1;', [parseInt(id)]);
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
            return null; // No fields to update
        }

        queryValues.push(id); // Add id for the WHERE clause

        const query = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING id, title, description, status, created_at, updated_at;`;

        const result = await pool.query(query, queryValues);
        return result.rows[0];
    }

    async deleteTask(id) {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id;', [parseInt(id)]);
        return result.rows[0];
    }
}

module.exports = new TaskModel();

