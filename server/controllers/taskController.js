const TaskModel = require('../models/taskModel');

class TaskController {
    async createTask(req, res) {
        const { title, description, status } = req.body;
        try {
            const newTask = await TaskModel.createTask(title, description, status);
            res.status(201).json(newTask);
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ message: 'Error creating task' });
        }
    }

    async getAllTasks(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const status = req.query.status || null;

            const tasks = await TaskModel.getAllTasks(page, limit, status);
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
            const deletedTask = await TaskModel.deleteTask(id);
            if (!deletedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).json({ message: 'Error deleting task' });
        }
    }
}

module.exports = new TaskController();
