const TaskModel = require('../models/taskModel');
const { TASKS_PER_PAGE } = require('../utils/constant');

class TaskController {
    async createTask(req, res) {
        const { title, description, status, deadline } = req.body;

        if (deadline && (typeof deadline !== 'string' || isNaN(Date.parse(deadline)))) {
            return res.status(400).json({ message: 'Invalid deadline format. Must be a valid ISO date string.' });
        }

        try {
            const newTask = await TaskModel.createTask(title, description, status, deadline);
            res.status(201).json(newTask);
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ message: 'Error creating task' });
        }
    }

    async getAllTasks(req, res) {
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
            console.error('Error getting tasks:', error);
            res.status(500).json({ message: 'Error getting tasks' });
        }
    }

    async getTaskById(req, res) {
        const { id } = req.params;
        try {
            const task = await TaskModel.getTaskById(id);
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(200).json(task);
        } catch (error) {
            console.error('Error getting task by ID:', error);
            res.status(500).json({ message: 'Error getting task by ID' });
        }
    }

    async updateTask(req, res) {
        const { id } = req.params;
        const updates = req.body;

        if (updates.deadline && (typeof updates.deadline !== 'string' || isNaN(Date.parse(updates.deadline)))) {
            return res.status(400).json({ message: 'Invalid deadline format. Must be a valid ISO date string.' });
        }

        try {
            const updatedTask = await TaskModel.updateTask(id, updates);
            if (!updatedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(200).json(updatedTask);
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({ message: 'Error updating task' });
        }
    }

    async deleteTask(req, res) {
        const { id } = req.params;
        try {
            const deletedTask = await TaskModel.softDeleteTask(id);
            if (!deletedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(200).json({ message: 'Task marked for deletion successfully' });
        } catch (error) {
            console.error('Error soft deleting task:', error);
            res.status(500).json({ message: 'Error deleting task' });
        }
    }

    async restoreTask(req, res) {
        const { id } = req.params;
        try {
            const restoredTask = await TaskModel.restoreTask(id);
            if (!restoredTask) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(200).json(restoredTask);
        } catch (error) {
            console.error('Error restoring task:', error);
            res.status(500).json({ message: 'Error restoring task' });
        }
    }

    async permanentDeleteTask(req, res) {
        const { id } = req.params;
        try {
            const deletedTask = await TaskModel.permanentDeleteTask(id);
            if (!deletedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(200).json({ message: 'Task permanently deleted successfully' });
        } catch (error) {
            console.error('Error permanently deleting task:', error);
            res.status(500).json({ message: 'Error permanently deleting task' });
        }
    }

    async cleanupDeletedTasks(req, res) {
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
            console.error('Error cleaning up deleted tasks:', error);
            res.status(500).json({ message: 'Error cleaning up deleted tasks' });
        }
    }
}

module.exports = new TaskController();
