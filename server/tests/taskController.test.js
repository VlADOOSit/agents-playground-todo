const TaskController = require('../src/controllers/taskController');
const TaskModel = require('../src/models/taskModel');
const ApiError = require('../src/utils/ApiError');

jest.mock('../src/models/taskModel');

describe('TaskController', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();
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

            await TaskController.createTask(mockReq, mockRes, mockNext);

            expect(TaskModel.createTask).toHaveBeenCalledWith('Test Task', 'Test Description', 'pending', '2025-12-31T23:59:59Z');
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(newTask);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should handle errors and call next with error', async () => {
            mockReq = {
                body: {
                    title: 'Test Task',
                    description: 'Test Description',
                    status: 'pending',
                    deadline: null
                }
            };

            const error = new ApiError(500, 'Database error occurred');
            TaskModel.createTask.mockRejectedValue(error);

            await TaskController.createTask(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        test('should call next with ApiError for invalid deadline format', async () => {
            mockReq = {
                body: {
                    title: 'Test Task',
                    description: 'Test Description',
                    status: 'pending',
                    deadline: 'invalid-date'
                }
            };

            await TaskController.createTask(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(new ApiError(400, 'Invalid deadline format. Must be a valid ISO date string.'));
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
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

            await TaskController.getAllTasks(mockReq, mockRes, mockNext);

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
            expect(mockNext).not.toHaveBeenCalled();
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

            await TaskController.getAllTasks(mockReq, mockRes, mockNext);

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
            expect(mockNext).not.toHaveBeenCalled();
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

            await TaskController.getAllTasks(mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith({
                tasks: mockTasks,
                pagination: {
                    currentPage: 1,
                    totalPages: 2, // Math.ceil(10 / 5) = 2
                    totalTasks: 10,
                    limit: 5
                }
            });
            expect(mockNext).not.toHaveBeenCalled();
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

            await TaskController.getAllTasks(mockReq, mockRes, mockNext);

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
            expect(mockNext).not.toHaveBeenCalled();
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

            await TaskController.getAllTasks(mockReq, mockRes, mockNext);

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
            expect(mockNext).not.toHaveBeenCalled();
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

            await TaskController.getAllTasks(mockReq, mockRes, mockNext);

            expect(TaskModel.getAllTasks).toHaveBeenCalledWith(1, 5, null, 'createdAt');
        });

        test('should handle errors and call next with error', async () => {
            mockReq = {
                query: {}
            };

            const error = new ApiError(500, 'Database error occurred while fetching tasks');
            TaskModel.getAllTasks.mockRejectedValue(error);

            await TaskController.getAllTasks(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
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

            await TaskController.getTaskById(mockReq, mockRes, mockNext);

            expect(TaskModel.getTaskById).toHaveBeenCalledWith('1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockTask);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should return 404 when task not found', async () => {
            mockReq = {
                params: { id: '999' }
            };

            TaskModel.getTaskById.mockResolvedValue(null);

            await TaskController.getTaskById(mockReq, mockRes, mockNext);

            expect(TaskModel.getTaskById).toHaveBeenCalledWith('999');
            expect(mockNext).toHaveBeenCalledWith(new ApiError(404, 'Task not found'));
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            const error = new ApiError(500, 'Database error occurred while fetching task');
            TaskModel.getTaskById.mockRejectedValue(error);

            await TaskController.getTaskById(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
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

            await TaskController.updateTask(mockReq, mockRes, mockNext);

            expect(TaskModel.updateTask).toHaveBeenCalledWith('1', {
                title: 'Updated Task',
                status: 'completed',
                deadline: '2025-12-31T23:59:59Z'
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(updatedTask);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should return 404 when task not found for update', async () => {
            mockReq = {
                params: { id: '999' },
                body: { title: 'Updated Task', deadline: null }
            };

            TaskModel.updateTask.mockResolvedValue(null);

            await TaskController.updateTask(mockReq, mockRes, mockNext);

            expect(TaskModel.updateTask).toHaveBeenCalledWith('999', { title: 'Updated Task', deadline: null });
            expect(mockNext).toHaveBeenCalledWith(new ApiError(404, 'Task not found'));
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                params: { id: '1' },
                body: { title: 'Updated Task', deadline: '2025-12-31T23:59:59Z' }
            };

            const error = new ApiError(500, 'Database error occurred while updating task');
            TaskModel.updateTask.mockRejectedValue(error);

            await TaskController.updateTask(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        test('should return 400 for invalid deadline format in update', async () => {
            mockReq = {
                params: { id: '1' },
                body: {
                    title: 'Updated Task',
                    deadline: 'invalid-date-format'
                }
            };

            await TaskController.updateTask(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(new ApiError(400, 'Invalid deadline format. Must be a valid ISO date string.'));
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe('deleteTask', () => {
        test('should delete a task and return 200 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            TaskModel.softDeleteTask.mockResolvedValue({ id: 1 });

            await TaskController.deleteTask(mockReq, mockRes, mockNext);

            expect(TaskModel.softDeleteTask).toHaveBeenCalledWith('1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task marked for deletion successfully' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should return 404 when task not found for deletion', async () => {
            mockReq = {
                params: { id: '999' }
            };

            TaskModel.softDeleteTask.mockResolvedValue(null);

            await TaskController.deleteTask(mockReq, mockRes, mockNext);

            expect(TaskModel.softDeleteTask).toHaveBeenCalledWith('999');
            expect(mockNext).toHaveBeenCalledWith(new ApiError(404, 'Task not found'));
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            const error = new ApiError(500, 'Database error occurred while deleting task');
            TaskModel.softDeleteTask.mockRejectedValue(error);

            await TaskController.deleteTask(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe('restoreTask', () => {
        test('should restore a task and return 200 status', async () => {
            const restoredTask = {
                id: 1,
                title: 'Test Task',
                description: 'Test Description',
                status: 'TODO',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z'
            };

            mockReq = {
                params: { id: '1' }
            };

            TaskModel.restoreTask.mockResolvedValue(restoredTask);

            await TaskController.restoreTask(mockReq, mockRes, mockNext);

            expect(TaskModel.restoreTask).toHaveBeenCalledWith('1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(restoredTask);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should return 404 when task not found for restore', async () => {
            mockReq = {
                params: { id: '999' }
            };

            TaskModel.restoreTask.mockResolvedValue(null);

            await TaskController.restoreTask(mockReq, mockRes, mockNext);

            expect(TaskModel.restoreTask).toHaveBeenCalledWith('999');
            expect(mockNext).toHaveBeenCalledWith(new ApiError(404, 'Task not found'));
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            const error = new ApiError(500, 'Database error occurred while restoring task');
            TaskModel.restoreTask.mockRejectedValue(error);

            await TaskController.restoreTask(mockReq, mockRes, mockNext);

            expect(TaskModel.restoreTask).toHaveBeenCalledWith('1');
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe('permanentDeleteTask', () => {
        test('should permanently delete a task and return 200 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            TaskModel.permanentDeleteTask.mockResolvedValue({ id: 1 });

            await TaskController.permanentDeleteTask(mockReq, mockRes, mockNext);

            expect(TaskModel.permanentDeleteTask).toHaveBeenCalledWith('1');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task permanently deleted successfully' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should return 404 when task not found for permanent deletion', async () => {
            mockReq = {
                params: { id: '999' }
            };

            TaskModel.permanentDeleteTask.mockResolvedValue(null);

            await TaskController.permanentDeleteTask(mockReq, mockRes, mockNext);

            expect(TaskModel.permanentDeleteTask).toHaveBeenCalledWith('999');
            expect(mockNext).toHaveBeenCalledWith(new ApiError(404, 'Task not found'));
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                params: { id: '1' }
            };

            const error = new ApiError(500, 'Database error occurred while permanently deleting task');
            TaskModel.permanentDeleteTask.mockRejectedValue(error);

            await TaskController.permanentDeleteTask(mockReq, mockRes, mockNext);

            expect(TaskModel.permanentDeleteTask).toHaveBeenCalledWith('1');
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe('cleanupDeletedTasks', () => {
        test('should cleanup old deleted tasks with default olderThanMinutes', async () => {
            const deletedTasks = [
                { id: 1, title: 'Old Task 1' },
                { id: 2, title: 'Old Task 2' }
            ];

            mockReq = {
                query: {}
            };

            TaskModel.getDeletedTasks.mockResolvedValue(deletedTasks);
            TaskModel.permanentDeleteTask.mockResolvedValue({ id: 1 });

            await TaskController.cleanupDeletedTasks(mockReq, mockRes, mockNext);

            expect(TaskModel.getDeletedTasks).toHaveBeenCalledWith(5);
            expect(TaskModel.permanentDeleteTask).toHaveBeenCalledTimes(2);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: '2 old deleted tasks permanently removed' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should cleanup old deleted tasks with custom olderThanMinutes', async () => {
            const deletedTasks = [{ id: 1, title: 'Old Task' }];

            mockReq = {
                query: { olderThanMinutes: '10' }
            };

            TaskModel.getDeletedTasks.mockResolvedValue(deletedTasks);
            TaskModel.permanentDeleteTask.mockResolvedValue({ id: 1 });

            await TaskController.cleanupDeletedTasks(mockReq, mockRes);

            expect(TaskModel.getDeletedTasks).toHaveBeenCalledWith('10');
            expect(TaskModel.permanentDeleteTask).toHaveBeenCalledTimes(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: '1 old deleted tasks permanently removed' });
        });

        test('should handle no tasks to cleanup', async () => {
            mockReq = {
                query: {}
            };

            TaskModel.getDeletedTasks.mockResolvedValue([]);

            await TaskController.cleanupDeletedTasks(mockReq, mockRes, mockNext);

            expect(TaskModel.getDeletedTasks).toHaveBeenCalledWith(5);
            expect(TaskModel.permanentDeleteTask).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: '0 old deleted tasks permanently removed' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should handle errors and return 500 status', async () => {
            mockReq = {
                query: {}
            };

            const error = new ApiError(500, 'Database error occurred while fetching deleted tasks');
            TaskModel.getDeletedTasks.mockRejectedValue(error);

            await TaskController.cleanupDeletedTasks(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });
});
