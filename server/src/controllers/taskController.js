const taskModel = require('../models/taskModel');

const VALID_STATUSES = new Set(['TODO', 'IN_PROGRESS', 'DONE']);

class TaskController {
  async listTasks(req, res) {
    try {
      const pageParam = Number.parseInt(req.query.page, 10);
      const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
      const limit = 5;
      const offset = (page - 1) * limit;

      const [tasks, totalCount] = await Promise.all([taskModel.getAll({ limit, offset }), taskModel.getTotalCount()]);
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      res.json({
        tasks,
        page,
        totalPages,
        totalCount,
      });
    } catch (error) {
      console.error('Error fetching tasks', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  async getTask(req, res) {
    try {
      const { id } = req.params;
      const task = await taskModel.getById(id);

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error fetching task', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }

  async createTask(req, res) {
    try {
      const { title, description, status } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      if (status && !VALID_STATUSES.has(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const newTask = await taskModel.create({ title, description, status });
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Error creating task', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const { title, description, status } = req.body;

      if (title !== undefined && !title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }

      if (status !== undefined && !VALID_STATUSES.has(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const updatedTask = await taskModel.update(id, { title, description, status });

      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  async deleteTask(req, res) {
    try {
      const { id } = req.params;

      const deleted = await taskModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}

module.exports = new TaskController();
