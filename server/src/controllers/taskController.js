const taskModel = require('../models/taskModel');

const VALID_STATUSES = new Set(['TODO', 'IN_PROGRESS', 'DONE']);
const VALID_SORTS = new Set(['createdAt', 'deadline']);
const isValidDeadline = (deadline) => {
	if (deadline === undefined) {
		return true;
	}

	if (deadline === null) {
		return true;
	}

	if (typeof deadline !== 'string') {
		return false;
	}

	const trimmed = deadline.trim();
	if (!trimmed) {
		return true;
	}

	if (!trimmed.includes('T')) {
		return false;
	}

	const parsed = new Date(trimmed);
	return !Number.isNaN(parsed.getTime());
};

const normalizeDeadline = (deadline) => {
	if (deadline === undefined) {
		return undefined;
	}

	if (deadline === null) {
		return null;
	}

	const trimmed = typeof deadline === 'string' ? deadline.trim() : deadline;
	if (trimmed === '') {
		return null;
	}

	return trimmed;
};

class TaskController {
	async listTasks(req, res) {
		try {
			const pageParam = Number.parseInt(req.query.page, 10);
			const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
			const limit = 5;
			const offset = (page - 1) * limit;
			const status = req.query.status;
			const sortParam = req.query.sort;

			if (sortParam !== undefined && !VALID_SORTS.has(sortParam)) {
				return res.status(400).json({ error: 'Invalid sort value' });
			}

			const sort = sortParam || 'createdAt';

			if (status && !VALID_STATUSES.has(status)) {
				return res.status(400).json({ error: 'Invalid status value' });
			}

			const [tasks, totalCount] = await Promise.all([
				taskModel.getAll({ limit, offset, status, sort }),
				taskModel.getTotalCount(status),
			]);
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
			const { title, description, status, deadline } = req.body;

			if (!title || !title.trim()) {
				return res.status(400).json({ error: 'Title is required' });
			}

			if (status && !VALID_STATUSES.has(status)) {
				return res.status(400).json({ error: 'Invalid status value' });
			}

			const normalizedDeadline = normalizeDeadline(deadline);
			if (!isValidDeadline(normalizedDeadline)) {
				return res.status(400).json({ error: 'Deadline must be an ISO datetime string' });
			}

			const newTask = await taskModel.create({ title, description, status, deadline: normalizedDeadline });
			res.status(201).json(newTask);
		} catch (error) {
			console.error('Error creating task', error);
			res.status(500).json({ error: 'Failed to create task' });
		}
	}

	async updateTask(req, res) {
		try {
			const { id } = req.params;
			const { title, description, status, deadline } = req.body;

			if (title !== undefined && !title.trim()) {
				return res.status(400).json({ error: 'Title cannot be empty' });
			}

			if (status !== undefined && !VALID_STATUSES.has(status)) {
				return res.status(400).json({ error: 'Invalid status value' });
			}

			const normalizedDeadline = normalizeDeadline(deadline);
			if (deadline !== undefined && !isValidDeadline(normalizedDeadline)) {
				return res.status(400).json({ error: 'Deadline must be an ISO datetime string' });
			}

			const updatedTask = await taskModel.update(id, { title, description, status, deadline: normalizedDeadline });

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
