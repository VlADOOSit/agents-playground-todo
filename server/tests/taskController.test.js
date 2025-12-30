const TaskController = require('../controllers/taskController');
const TaskModel = require('../models/taskModel');

jest.mock('../models/taskModel');

describe('TaskController', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('createTask', () => {
        test('should create a task and return 201 status', async () => {
            const newTask = {
                id: 1,
                title: 'Test Task',
                description: 'Test Description',
                status: 'pending',
                deadline: '2025-12-31T23:59:59Z'
            };

            mockReq = {
                body: {
                    title: 'Test Task',
                    description: 'Test Description',
                    status: 'pending',
                    deadline: '2025-12-31T23:59:59Z'
                }
            };

            TaskModel.createTask.mockResolvedValue(newTask);

            await TaskController.createTask(mockReq, mockRes);

            expect(TaskModel.createTask).toHaveBeenCalledWith('Test Task', 'Test Description', 'pending', '2025-12-31T23:59:59Z');
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(newTask);
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                body: {
                    title: 'Test Task',
                    description: 'Test Description',
                    status: 'pending',
                    deadline: null
                }
            };

            const error = new Error('Database error');
            TaskModel.createTask.mockRejectedValue(error);

            await TaskController.createTask(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error creating task' });
        });

        test('should return 400 for invalid deadline format', async () => {
            mockReq = {
                body: {
                    title: 'Test Task',
                    description: 'Test Description',
                    status: 'pending',
                    deadline: 'invalid-date'
                }
            };

            await TaskController.createTask(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid deadline format. Must be a valid ISO date string.' });
        });
    });

    describe('getAllTasks', () => {
        test('should get all tasks with default pagination', async () => {
            mockReq = {
                query: {}
            };

            const mockTasks = [
                { id: 1, title: 'Task 1', status: 'pending' },
                { id: 2, title: 'Task 2', status: 'completed' }
            ];

            TaskModel.getAllTasks.mockResolvedValue(mockTasks);
            TaskModel.getTasksCount.mockResolvedValue(10);

            await TaskController.getAllTasks(mockReq, mockRes);

            expect(TaskModel.getAllTasks).toHaveBeenCalledWith(1, 5, null, 'createdAt');
            expect(TaskModel.getTasksCount).toHaveBeenCalledWith(null);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                tasks: mockTasks,
                pagination: {
                    currentPage: 1,
                    totalPages: 2, // Math.ceil(10 / 5) = 2
                    totalTasks: 10,
                    limit: 5
                }
            });
        });

        test('should get tasks with custom pagination and status filter', async () => {
            mockReq = {
                query: {
                    page: '2',
                    limit: '10',
                    status: 'pending'
                }
            };

            const mockTasks = [{ id: 1, title: 'Task 1', status: 'pending' }];

            TaskModel.getAllTasks.mockResolvedValue(mockTasks);
            TaskModel.getTasksCount.mockResolvedValue(25);

            await TaskController.getAllTasks(mockReq, mockRes);

            expect(TaskModel.getAllTasks).toHaveBeenCalledWith(2, 10, 'pending', 'createdAt');
            expect(TaskModel.getTasksCount).toHaveBeenCalledWith('pending');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                tasks: mockTasks,
                pagination: {
                    currentPage: 2,
                    totalPages: 3, // Math.ceil(25 / 10) = 3
                    totalTasks: 25,
                    limit: 10
                }
            });
        });

        test('should handle pagination with exact division', async () => {
            mockReq = {
                query: {
                    page: '1',
                    limit: '5'
                }
            };

            const mockTasks = Array(5).fill().map((_, i) => ({ id: i + 1, title: `Task ${i + 1}` }));

            TaskModel.getAllTasks.mockResolvedValue(mockTasks);
            TaskModel.getTasksCount.mockResolvedValue(10);

            await TaskController.getAllTasks(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                tasks: mockTasks,
                pagination: {
                    currentPage: 1,
                    totalPages: 2, // Math.ceil(10 / 5) = 2
                    totalTasks: 10,
                    limit: 5
                }
            });
        });

        test('should get tasks with deadline sorting', async () => {
            mockReq = {
                query: {
                    sort: 'deadline'
                }
            };

            const mockTasks = [
                { id: 1, title: 'Task 1', status: 'pending', deadline: '2025-01-01T00:00:00Z' },
                { id: 2, title: 'Task 2', status: 'pending' }
            ];

            TaskModel.getAllTasks.mockResolvedValue(mockTasks);
            TaskModel.getTasksCount.mockResolvedValue(10);

            await TaskController.getAllTasks(mockReq, mockRes);

            expect(TaskModel.getAllTasks).toHaveBeenCalledWith(1, 5, null, 'deadline');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                tasks: mockTasks,
                pagination: {
                    currentPage: 1,
                    totalPages: 2,
                    totalTasks: 10,
                    limit: 5
                }
            });
        });

        test('should get tasks with custom pagination, status filter, and deadline sorting', async () => {
            mockReq = {
                query: {
                    page: '2',
                    limit: '10',
                    status: 'pending',
                    sort: 'deadline'
                }
            };

            const mockTasks = [{ id: 1, title: 'Task 1', status: 'pending', deadline: '2025-01-01T00:00:00Z' }];

            TaskModel.getAllTasks.mockResolvedValue(mockTasks);
            TaskModel.getTasksCount.mockResolvedValue(25);

            await TaskController.getAllTasks(mockReq, mockRes);

            expect(TaskModel.getAllTasks).toHaveBeenCalledWith(2, 10, 'pending', 'deadline');
            expect(TaskModel.getTasksCount).toHaveBeenCalledWith('pending');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                tasks: mockTasks,
                pagination: {
                    currentPage: 2,
                    totalPages: 3,
                    totalTasks: 25,
                    limit: 10
                }
            });
        });

        test('should default to createdAt sorting when no sort parameter provided', async () => {
            mockReq = {
                query: {}
            };

            const mockTasks = [
                { id: 1, title: 'Task 1', status: 'pending' },
                { id: 2, title: 'Task 2', status: 'pending' }
            ];

            TaskModel.getAllTasks.mockResolvedValue(mockTasks);
            TaskModel.getTasksCount.mockResolvedValue(10);

            await TaskController.getAllTasks(mockReq, mockRes);

            expect(TaskModel.getAllTasks).toHaveBeenCalledWith(1, 5, null, 'createdAt');
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                query: {}
            };

            const error = new Error('Database error');
            TaskModel.getAllTasks.mockRejectedValue(error);

            await TaskController.getAllTasks(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error getting tasks' });
        });
    });

    describe('getTaskById', () => {
        test('should get a task by id and return 200 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            const mockTask = {
                id: 1,
                title: 'Test Task',
                description: 'Test Description',
                status: 'pending'
            };

            TaskModel.getTaskById.mockResolvedValue(mockTask);

            await TaskController.getTaskById(mockReq, mockRes);

            expect(TaskModel.getTaskById).toHaveBeenCalledWith('1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockTask);
        });

        test('should return 404 when task not found', async () => {
            mockReq = {
                params: { id: '999' }
            };

            TaskModel.getTaskById.mockResolvedValue(null);

            await TaskController.getTaskById(mockReq, mockRes);

            expect(TaskModel.getTaskById).toHaveBeenCalledWith('999');
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task not found' });
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            const error = new Error('Database error');
            TaskModel.getTaskById.mockRejectedValue(error);

            await TaskController.getTaskById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error getting task by ID' });
        });
    });

    describe('updateTask', () => {
        test('should update a task and return 200 status', async () => {
            mockReq = {
                params: { id: '1' },
                body: {
                    title: 'Updated Task',
                    status: 'completed',
                    deadline: '2025-12-31T23:59:59Z'
                }
            };

            const updatedTask = {
                id: 1,
                title: 'Updated Task',
                description: 'Test Description',
                status: 'completed',
                deadline: '2025-12-31T23:59:59Z'
            };

            TaskModel.updateTask.mockResolvedValue(updatedTask);

            await TaskController.updateTask(mockReq, mockRes);

            expect(TaskModel.updateTask).toHaveBeenCalledWith('1', {
                title: 'Updated Task',
                status: 'completed',
                deadline: '2025-12-31T23:59:59Z'
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(updatedTask);
        });

        test('should return 404 when task not found for update', async () => {
            mockReq = {
                params: { id: '999' },
                body: { title: 'Updated Task', deadline: null }
            };

            TaskModel.updateTask.mockResolvedValue(null);

            await TaskController.updateTask(mockReq, mockRes);

            expect(TaskModel.updateTask).toHaveBeenCalledWith('999', { title: 'Updated Task', deadline: null });
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task not found' });
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                params: { id: '1' },
                body: { title: 'Updated Task', deadline: '2025-12-31T23:59:59Z' }
            };

            const error = new Error('Database error');
            TaskModel.updateTask.mockRejectedValue(error);

            await TaskController.updateTask(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error updating task' });
        });

        test('should return 400 for invalid deadline format in update', async () => {
            mockReq = {
                params: { id: '1' },
                body: {
                    title: 'Updated Task',
                    deadline: 'invalid-date-format'
                }
            };

            await TaskController.updateTask(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid deadline format. Must be a valid ISO date string.' });
        });
    });

    describe('deleteTask', () => {
        test('should delete a task and return 200 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            TaskModel.deleteTask.mockResolvedValue({ id: 1 });

            await TaskController.deleteTask(mockReq, mockRes);

            expect(TaskModel.deleteTask).toHaveBeenCalledWith('1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task deleted successfully' });
        });

        test('should return 404 when task not found for deletion', async () => {
            mockReq = {
                params: { id: '999' }
            };

            TaskModel.deleteTask.mockResolvedValue(null);

            await TaskController.deleteTask(mockReq, mockRes);

            expect(TaskModel.deleteTask).toHaveBeenCalledWith('999');
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task not found' });
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            const error = new Error('Database error');
            TaskModel.deleteTask.mockRejectedValue(error);

            await TaskController.deleteTask(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error deleting task' });
        });
    });
});
