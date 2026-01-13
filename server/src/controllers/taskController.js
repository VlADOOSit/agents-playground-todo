const taskModel = require('../models/taskModel');
const AppError = require('../utils/AppError');
const { VALID_STATUSES, VALID_SORTS, isValidDeadline, normalizeDeadline } = require('../services/taskValidation');

class TaskController {
	async listTasks(req, res, next) {
		try {
			const pageParam = Number.parseInt(req.query.page, 10);
			const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
			const limitParam = Number.parseInt(req.query.limit, 10);
			const limit = Number.isNaN(limitParam) || limitParam < 1 ? 5 : Math.min(limitParam, 50);
			const offset = (page - 1) * limit;
			const status = req.query.status;
			const sortParam = req.query.sort;

			if (sortParam !== undefined && !VALID_SORTS.has(sortParam)) {
				return next(new AppError('Invalid sort value', 400));
			}

			const sort = sortParam || 'createdAt';

			if (status && !VALID_STATUSES.has(status)) {
				return next(new AppError('Invalid status value', 400));
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
				limit,
			});
		} catch (error) {
			return next(new AppError('Failed to fetch tasks', 500));
		}
	}

	async getTask(req, res, next) {
		try {
			const { id } = req.params;
			const task = await taskModel.getById(id);

			if (!task) {
				return next(new AppError('Task not found', 404));
			}

			res.json(task);
		} catch (error) {
			return next(new AppError('Failed to fetch task', 500));
		}
	}

	async createTask(req, res, next) {
		try {
			const { title, description, status, deadline } = req.body;

			if (!title || !title.trim()) {
				return next(new AppError('Title is required', 400));
			}

			if (status && !VALID_STATUSES.has(status)) {
				return next(new AppError('Invalid status value', 400));
			}

			const normalizedDeadline = normalizeDeadline(deadline);
			if (!isValidDeadline(normalizedDeadline)) {
				return next(new AppError('Deadline must be an ISO datetime string', 400));
			}

			const newTask = await taskModel.create({ title, description, status, deadline: normalizedDeadline });
			res.status(201).json(newTask);
		} catch (error) {
			return next(new AppError('Failed to create task', 500));
		}
	}

	async updateTask(req, res, next) {
		try {
			const { id } = req.params;
			const { title, description, status, deadline } = req.body;

			if (title !== undefined && !title.trim()) {
				return next(new AppError('Title cannot be empty', 400));
			}

			if (status !== undefined && !VALID_STATUSES.has(status)) {
				return next(new AppError('Invalid status value', 400));
			}

			const normalizedDeadline = normalizeDeadline(deadline);
			if (deadline !== undefined && !isValidDeadline(normalizedDeadline)) {
				return next(new AppError('Deadline must be an ISO datetime string', 400));
			}

			const updatedTask = await taskModel.update(id, { title, description, status, deadline: normalizedDeadline });

			if (!updatedTask) {
				return next(new AppError('Task not found', 404));
			}

			res.json(updatedTask);
		} catch (error) {
			return next(new AppError('Failed to update task', 500));
		}
	}

	async deleteTask(req, res, next) {
		try {
			const { id } = req.params;

			const deleted = await taskModel.delete(id);

			if (!deleted) {
				return next(new AppError('Task not found', 404));
			}

			res.status(204).send();
		} catch (error) {
			return next(new AppError('Failed to delete task', 500));
		}
	}

	async undoDelete(req, res, next) {
		const UNDO_WINDOW_SECONDS = 5;

		try {
			const { id } = req.params;
			const deletionState = await taskModel.getDeletionState(id);

			if (!deletionState) {
				return next(new AppError('Task not found', 404));
			}

			if (!deletionState.deleted_at) {
				return next(new AppError('Task is not deleted', 409));
			}

			const deletedAt = new Date(deletionState.deleted_at);
			const cutoff = Date.now() - UNDO_WINDOW_SECONDS * 1000;
			if (Number.isNaN(deletedAt.getTime()) || deletedAt.getTime() < cutoff) {
				return next(new AppError('Undo window expired', 409));
			}

			const restoredTask = await taskModel.undoDelete(id, UNDO_WINDOW_SECONDS);

			if (!restoredTask) {
				return next(new AppError('Undo window expired', 409));
			}

			return res.json(restoredTask);
		} catch (error) {
			return next(new AppError('Failed to undo delete', 500));
		}
	}
}

module.exports = new TaskController();
