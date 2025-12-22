const pool = require('../db/pool');

class TaskModel {
    async createTask(title, description, status) {
        const result = await pool.query(
            'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING id, title, description, status, created_at, updated_at;',
            [title, description, status]
        );
        return result.rows[0];
    }

    async getAllTasks() {
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC;');
        return result.rows;
    }

    async getTaskById(id) {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1;', [parseInt(id)]);
        return result.rows[0];
    }

    async updateTask(id, title, description, status) {
        const result = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING id, title, description, status, created_at, updated_at;',
            [title, description, status, parseInt(id)]
        );
        return result.rows[0];
    }

    async deleteTask(id) {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id;', [parseInt(id)]);
        return result.rows[0];
    }
}

module.exports = new TaskModel();

