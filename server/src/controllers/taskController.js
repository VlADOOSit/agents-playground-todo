const TaskModel = require('../models/taskModel');
const { TASKS_PER_PAGE } = require('../utils/constant');
const ApiError = require('../utils/ApiError');

class TaskController {
    async createTask(req, res, next) {
        const { title, description, status, deadline } = req.body;

        if (deadline && (typeof deadline !== 'string' || isNaN(Date.parse(deadline)))) {
            return next(new ApiError(400, 'Invalid deadline format. Must be a valid ISO date string.'));
        }

        try {
            const newTask = await TaskModel.createTask(title, description, status, deadline);
            res.status(201).json(newTask);
        } catch (error) {
            next(error);
        }
    }

    async getAllTasks(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || TASKS_PER_PAGE;
            const status = req.query.status || null;
            const sort = req.query.sort || 'createdAt';

            const tasks = await TaskModel.getAllTasks(page, limit, status, sort);
            const totalTasks = await TaskModel.getTasksCount(status);

            res.status(200).json({
                tasks,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalTasks / limit),
                    totalTasks,
                    limit
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getTaskById(req, res, next) {
        const { id } = req.params;
        try {
            const task = await TaskModel.getTaskById(id);
            if (!task) {
                return next(new ApiError(404, 'Task not found'));
            }
            res.status(200).json(task);
        } catch (error) {
            next(error);
        }
    }

    async updateTask(req, res, next) {
        const { id } = req.params;
        const updates = req.body;

        if (updates.deadline && (typeof updates.deadline !== 'string' || isNaN(Date.parse(updates.deadline)))) {
            return next(new ApiError(400, 'Invalid deadline format. Must be a valid ISO date string.'));
        }

        try {
            const updatedTask = await TaskModel.updateTask(id, updates);
            if (!updatedTask) {
                return next(new ApiError(404, 'Task not found'));
            }
            res.status(200).json(updatedTask);
        } catch (error) {
            next(error);
        }
    }

    async deleteTask(req, res, next) {
        const { id } = req.params;
        try {
            const deletedTask = await TaskModel.softDeleteTask(id);
            if (!deletedTask) {
                return next(new ApiError(404, 'Task not found'));
            }
            res.status(200).json({ message: 'Task marked for deletion successfully' });
        } catch (error) {
            next(error);
        }
    }

    async restoreTask(req, res, next) {
        const { id } = req.params;
        try {
            const restoredTask = await TaskModel.restoreTask(id);
            if (!restoredTask) {
                return next(new ApiError(404, 'Task not found'));
            }
            res.status(200).json(restoredTask);
        } catch (error) {
            next(error);
        }
    }

    async permanentDeleteTask(req, res, next) {
        const { id } = req.params;
        try {
            const deletedTask = await TaskModel.permanentDeleteTask(id);
            if (!deletedTask) {
                return next(new ApiError(404, 'Task not found'));
            }
            res.status(200).json({ message: 'Task permanently deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async cleanupDeletedTasks(req, res, next) {
        const { olderThanMinutes = 5 } = req.query;
        try {
            const deletedTasks = await TaskModel.getDeletedTasks(olderThanMinutes);
            let deletedCount = 0;

            for (const task of deletedTasks) {
                await TaskModel.permanentDeleteTask(task.id);
                deletedCount++;
            }

            res.status(200).json({ message: `${deletedCount} old deleted tasks permanently removed` });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TaskController();
