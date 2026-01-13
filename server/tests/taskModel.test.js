const TaskModel = require('../src/models/taskModel');
const pool = require('../src/db/pool');
const ApiError = require('../src/utils/ApiError');

jest.mock('../src/db/pool');

describe('TaskModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        test('should create a task and return the created task data', async () => {
            const mockTask = {
                id: 1,
                title: 'Test Task',
                description: 'Test Description',
                status: 'pending',
                deadline: '2025-12-31T23:59:59Z',
                created_at: '2025-12-26T10:00:00Z',
                updated_at: '2025-12-26T10:00:00Z'
            };

            pool.query.mockResolvedValue({
                rows: [mockTask]
            });

            const result = await TaskModel.createTask('Test Task', 'Test Description', 'pending', '2025-12-31T23:59:59Z');

            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO tasks (title, description, status, deadline) VALUES ($1, $2, $3, $4) RETURNING id, title, description, status, deadline, created_at, updated_at;',
                ['Test Task', 'Test Description', 'pending', '2025-12-31T23:59:59Z']
            );
            expect(result).toEqual(mockTask);
        });

        test('should handle database errors and throw ApiError', async () => {
            const dbError = new Error('Database connection failed');
            pool.query.mockRejectedValue(dbError);

            await expect(TaskModel.createTask('Test Task', 'Test Description', 'pending', null))
                .rejects.toThrow('Database error occurred');
        });
    });

    describe('getAllTasks', () => {
        test('should get all tasks without filters', async () => {
            const mockTasks = [
                { id: 1, title: 'Task 1', status: 'pending' },
                { id: 2, title: 'Task 2', status: 'completed' }
            ];

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getAllTasks(1, 5, null, 'createdAt');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2;',
                [5, 0]
            );
            expect(result).toEqual(mockTasks);
        });

        test('should get tasks with pagination', async () => {
            const mockTasks = [{ id: 1, title: 'Task 1', status: 'pending' }];

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getAllTasks(2, 10, null, 'createdAt');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2;',
                [10, 10]
            );
            expect(result).toEqual(mockTasks);
        });

        test('should get tasks filtered by status', async () => {
            const mockTasks = [{ id: 1, title: 'Task 1', status: 'pending' }];

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getAllTasks(1, 5, 'pending', 'createdAt');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE deleted_at IS NULL AND status = $3 ORDER BY created_at DESC LIMIT $1 OFFSET $2;',
                [5, 0, 'pending']
            );
            expect(result).toEqual(mockTasks);
        });

        test('should ignore "ALL" status filter', async () => {
            const mockTasks = [{ id: 1, title: 'Task 1', status: 'pending' }];

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getAllTasks(1, 5, 'ALL', 'createdAt');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2;',
                [5, 0]
            );
            expect(result).toEqual(mockTasks);
        });

        test('should sort tasks by deadline', async () => {
            const mockTasks = [
                { id: 1, title: 'Task with deadline', deadline: '2025-01-01T00:00:00Z' },
                { id: 2, title: 'Task without deadline' }
            ];

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getAllTasks(1, 5, null, 'deadline');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY deadline IS NULL, deadline ASC LIMIT $1 OFFSET $2;',
                [5, 0]
            );
            expect(result).toEqual(mockTasks);
        });

        test('should sort tasks by deadline with status filter', async () => {
            const mockTasks = [
                { id: 1, title: 'Task with deadline', status: 'pending', deadline: '2025-01-01T00:00:00Z' }
            ];

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getAllTasks(1, 5, 'pending', 'deadline');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE deleted_at IS NULL AND status = $3 ORDER BY deadline IS NULL, deadline ASC LIMIT $1 OFFSET $2;',
                [5, 0, 'pending']
            );
            expect(result).toEqual(mockTasks);
        });
    });

    describe('getTasksCount', () => {
        test('should get total count of all tasks', async () => {
            pool.query.mockResolvedValue({
                rows: [{ total: '10' }]
            });

            const result = await TaskModel.getTasksCount();

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT COUNT(*) as total FROM tasks WHERE deleted_at IS NULL',
                []
            );
            expect(result).toBe(10);
        });

        test('should get count of tasks filtered by status', async () => {
            pool.query.mockResolvedValue({
                rows: [{ total: '5' }]
            });

            const result = await TaskModel.getTasksCount('pending');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT COUNT(*) as total FROM tasks WHERE deleted_at IS NULL AND status = $1',
                ['pending']
            );
            expect(result).toBe(5);
        });

        test('should ignore "ALL" status filter', async () => {
            pool.query.mockResolvedValue({
                rows: [{ total: '8' }]
            });

            const result = await TaskModel.getTasksCount('ALL');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT COUNT(*) as total FROM tasks WHERE deleted_at IS NULL',
                []
            );
            expect(result).toBe(8);
        });
    });

    describe('getTaskById', () => {
        test('should get a task by id', async () => {
            const mockTask = {
                id: 1,
                title: 'Test Task',
                description: 'Test Description',
                status: 'pending'
            };

            pool.query.mockResolvedValue({
                rows: [mockTask]
            });

            const result = await TaskModel.getTaskById(1);

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL;',
                [1]
            );
            expect(result).toEqual(mockTask);
        });

        test('should return undefined when task not found', async () => {
            pool.query.mockResolvedValue({
                rows: []
            });

            const result = await TaskModel.getTaskById(999);

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL;',
                [999]
            );
            expect(result).toBeUndefined();
        });

        test('should parse string id to integer', async () => {
            const mockTask = { id: 1, title: 'Test Task' };

            pool.query.mockResolvedValue({
                rows: [mockTask]
            });

            const result = await TaskModel.getTaskById('1');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL;',
                [1]
            );
            expect(result).toEqual(mockTask);
        });

        test('should throw ApiError for invalid id format', async () => {
            await expect(TaskModel.getTaskById('abc'))
                .rejects.toThrow('Invalid task ID format');
        });
    });

    describe('updateTask', () => {
        test('should update a task with single field', async () => {
            const mockUpdatedTask = {
                id: 1,
                title: 'Updated Task',
                description: 'Test Description',
                status: 'pending',
                deadline: null,
                created_at: '2025-12-26T10:00:00Z',
                updated_at: '2025-12-26T11:00:00Z'
            };

            pool.query.mockResolvedValue({
                rows: [mockUpdatedTask]
            });

            const result = await TaskModel.updateTask(1, { title: 'Updated Task' });

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET title = $1 WHERE id = $2 RETURNING id, title, description, status, deadline, created_at, updated_at;',
                ['Updated Task', 1]
            );
            expect(result).toEqual(mockUpdatedTask);
        });

        test('should update a task with multiple fields', async () => {
            const mockUpdatedTask = {
                id: 1,
                title: 'Updated Task',
                description: 'Updated Description',
                status: 'completed',
                deadline: '2025-12-31T23:59:59Z',
                created_at: '2025-12-26T10:00:00Z',
                updated_at: '2025-12-26T11:00:00Z'
            };

            pool.query.mockResolvedValue({
                rows: [mockUpdatedTask]
            });

            const updates = {
                title: 'Updated Task',
                description: 'Updated Description',
                status: 'completed',
                deadline: '2025-12-31T23:59:59Z'
            };

            const result = await TaskModel.updateTask(1, updates);

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET title = $1, description = $2, status = $3, deadline = $4 WHERE id = $5 RETURNING id, title, description, status, deadline, created_at, updated_at;',
                ['Updated Task', 'Updated Description', 'completed', '2025-12-31T23:59:59Z', 1]
            );
            expect(result).toEqual(mockUpdatedTask);
        });

        test('should return null when no updates provided', async () => {
            const result = await TaskModel.updateTask(1, {});

            expect(pool.query).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        test('should return null when updates object is empty', async () => {
            const result = await TaskModel.updateTask(1, null);

            expect(pool.query).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('softDeleteTask', () => {
        test('should soft delete a task and return the task id', async () => {
            pool.query.mockResolvedValue({
                rows: [{ id: 1 }]
            });

            const result = await TaskModel.softDeleteTask(1);

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id;',
                [1]
            );
            expect(result).toEqual({ id: 1 });
        });

        test('should return undefined when task not found', async () => {
            pool.query.mockResolvedValue({
                rows: []
            });

            const result = await TaskModel.softDeleteTask(999);

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id;',
                [999]
            );
            expect(result).toBeUndefined();
        });

        test('should parse string id to integer', async () => {
            pool.query.mockResolvedValue({
                rows: [{ id: 1 }]
            });

            const result = await TaskModel.softDeleteTask('1');

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id;',
                [1]
            );
            expect(result).toEqual({ id: 1 });
        });

        test('should throw ApiError for invalid id format', async () => {
            await expect(TaskModel.softDeleteTask('abc'))
                .rejects.toThrow('Invalid task ID format');
        });

        test('should handle database errors and throw ApiError', async () => {
            const dbError = new Error('Database error');
            pool.query.mockRejectedValue(dbError);

            await expect(TaskModel.softDeleteTask(1))
                .rejects.toThrow('Database error occurred while deleting task');
        });
    });

    describe('restoreTask', () => {
        test('should restore a task and return the restored task', async () => {
            const mockTask = {
                id: 1,
                title: 'Test Task',
                description: 'Test Description',
                status: 'TODO',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z'
            };

            pool.query.mockResolvedValue({
                rows: [mockTask]
            });

            const result = await TaskModel.restoreTask(1);

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET deleted_at = NULL WHERE id = $1 RETURNING id, title, description, status, deadline, created_at, updated_at;',
                [1]
            );
            expect(result).toEqual(mockTask);
        });

        test('should return undefined when task not found', async () => {
            pool.query.mockResolvedValue({
                rows: []
            });

            const result = await TaskModel.restoreTask(999);

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET deleted_at = NULL WHERE id = $1 RETURNING id, title, description, status, deadline, created_at, updated_at;',
                [999]
            );
            expect(result).toBeUndefined();
        });

        test('should parse string id to integer', async () => {
            const mockTask = {
                id: 1,
                title: 'Test Task',
                description: 'Test Description',
                status: 'TODO',
                created_at: '2025-01-01T00:00:00Z',
                updated_at: '2025-01-01T00:00:00Z'
            };

            pool.query.mockResolvedValue({
                rows: [mockTask]
            });

            const result = await TaskModel.restoreTask('1');

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET deleted_at = NULL WHERE id = $1 RETURNING id, title, description, status, deadline, created_at, updated_at;',
                [1]
            );
            expect(result).toEqual(mockTask);
        });

        test('should throw ApiError for invalid id format', async () => {
            await expect(TaskModel.restoreTask('abc'))
                .rejects.toThrow('Invalid task ID format');
        });

        test('should handle database errors and throw ApiError', async () => {
            const dbError = new Error('Database error');
            pool.query.mockRejectedValue(dbError);

            await expect(TaskModel.restoreTask(1))
                .rejects.toThrow('Database error occurred while restoring task');
        });
    });

    describe('permanentDeleteTask', () => {
        test('should permanently delete a task and return the task id', async () => {
            pool.query.mockResolvedValue({
                rows: [{ id: 1 }]
            });

            const result = await TaskModel.permanentDeleteTask(1);

            expect(pool.query).toHaveBeenCalledWith(
                'DELETE FROM tasks WHERE id = $1 RETURNING id;',
                [1]
            );
            expect(result).toEqual({ id: 1 });
        });

        test('should return undefined when task not found', async () => {
            pool.query.mockResolvedValue({
                rows: []
            });

            const result = await TaskModel.permanentDeleteTask(999);

            expect(pool.query).toHaveBeenCalledWith(
                'DELETE FROM tasks WHERE id = $1 RETURNING id;',
                [999]
            );
            expect(result).toBeUndefined();
        });

        test('should parse string id to integer', async () => {
            pool.query.mockResolvedValue({
                rows: [{ id: 1 }]
            });

            const result = await TaskModel.permanentDeleteTask('1');

            expect(pool.query).toHaveBeenCalledWith(
                'DELETE FROM tasks WHERE id = $1 RETURNING id;',
                [1]
            );
            expect(result).toEqual({ id: 1 });
        });

        test('should throw ApiError for invalid id format', async () => {
            await expect(TaskModel.permanentDeleteTask('abc'))
                .rejects.toThrow('Invalid task ID format');
        });

        test('should handle database errors and throw ApiError', async () => {
            const dbError = new Error('Database error');
            pool.query.mockRejectedValue(dbError);

            await expect(TaskModel.permanentDeleteTask(1))
                .rejects.toThrow('Database error occurred while permanently deleting task');
        });
    });

    describe('getDeletedTasks', () => {
        test('should get deleted tasks older than default 5 minutes', async () => {
            const mockTasks = [
                { id: 1, title: 'Old Task 1', deleted_at: '2025-01-01T00:00:00Z' },
                { id: 2, title: 'Old Task 2', deleted_at: '2025-01-01T00:05:00Z' }
            ];

            const cutoffTime = new Date(Date.now() - 5 * 60 * 1000);

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getDeletedTasks(5);

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE deleted_at IS NOT NULL AND deleted_at < $1',
                [cutoffTime]
            );
            expect(result).toEqual(mockTasks);
        });

        test('should get deleted tasks older than custom minutes', async () => {
            const mockTasks = [{ id: 1, title: 'Old Task', deleted_at: '2025-01-01T00:00:00Z' }];

            const cutoffTime = new Date(Date.now() - 10 * 60 * 1000);

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getDeletedTasks(10);

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE deleted_at IS NOT NULL AND deleted_at < $1',
                [cutoffTime]
            );
            expect(result).toEqual(mockTasks);
        });

        test('should return empty array when no deleted tasks found', async () => {
            const cutoffTime = new Date(Date.now() - 5 * 60 * 1000);

            pool.query.mockResolvedValue({
                rows: []
            });

            const result = await TaskModel.getDeletedTasks(5);

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE deleted_at IS NOT NULL AND deleted_at < $1',
                [cutoffTime]
            );
            expect(result).toEqual([]);
        });

        test('should handle database errors', async () => {
            const error = new Error('Database error');
            pool.query.mockRejectedValue(error);

            await expect(TaskModel.getDeletedTasks(5)).rejects.toThrow('Database error');
        });
    });
});
