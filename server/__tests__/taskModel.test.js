const TaskModel = require('../models/taskModel');
const pool = require('../db/pool');

jest.mock('../db/pool');

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
                created_at: '2025-12-26T10:00:00Z',
                updated_at: '2025-12-26T10:00:00Z'
            };

            pool.query.mockResolvedValue({
                rows: [mockTask]
            });

            const result = await TaskModel.createTask('Test Task', 'Test Description', 'pending');

            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING id, title, description, status, created_at, updated_at;',
                ['Test Task', 'Test Description', 'pending']
            );
            expect(result).toEqual(mockTask);
        });

        test('should handle database errors', async () => {
            const error = new Error('Database connection failed');
            pool.query.mockRejectedValue(error);

            await expect(TaskModel.createTask('Test Task', 'Test Description', 'pending'))
                .rejects.toThrow('Database connection failed');
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

            const result = await TaskModel.getAllTasks();

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks ORDER BY created_at DESC LIMIT $1 OFFSET $2;',
                [5, 0] // TASKS_PER_PAGE = 5, offset = 0 for page 1
            );
            expect(result).toEqual(mockTasks);
        });

        test('should get tasks with pagination', async () => {
            const mockTasks = [{ id: 1, title: 'Task 1', status: 'pending' }];

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getAllTasks(2, 10);

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks ORDER BY created_at DESC LIMIT $1 OFFSET $2;',
                [10, 10] // limit = 10, offset = (page-1) * limit = 10
            );
            expect(result).toEqual(mockTasks);
        });

        test('should get tasks filtered by status', async () => {
            const mockTasks = [{ id: 1, title: 'Task 1', status: 'pending' }];

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getAllTasks(1, 5, 'pending');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks WHERE status = $3 ORDER BY created_at DESC LIMIT $1 OFFSET $2;',
                [5, 0, 'pending']
            );
            expect(result).toEqual(mockTasks);
        });

        test('should ignore "ALL" status filter', async () => {
            const mockTasks = [{ id: 1, title: 'Task 1', status: 'pending' }];

            pool.query.mockResolvedValue({
                rows: mockTasks
            });

            const result = await TaskModel.getAllTasks(1, 5, 'ALL');

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM tasks ORDER BY created_at DESC LIMIT $1 OFFSET $2;',
                [5, 0]
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
                'SELECT COUNT(*) as total FROM tasks',
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
                'SELECT COUNT(*) as total FROM tasks WHERE status = $1',
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
                'SELECT COUNT(*) as total FROM tasks',
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
                'SELECT * FROM tasks WHERE id = $1;',
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
                'SELECT * FROM tasks WHERE id = $1;',
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
                'SELECT * FROM tasks WHERE id = $1;',
                [1]
            );
            expect(result).toEqual(mockTask);
        });
    });

    describe('updateTask', () => {
        test('should update a task with single field', async () => {
            const mockUpdatedTask = {
                id: 1,
                title: 'Updated Task',
                description: 'Test Description',
                status: 'pending',
                created_at: '2025-12-26T10:00:00Z',
                updated_at: '2025-12-26T11:00:00Z'
            };

            pool.query.mockResolvedValue({
                rows: [mockUpdatedTask]
            });

            const result = await TaskModel.updateTask(1, { title: 'Updated Task' });

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET title = $1 WHERE id = $2 RETURNING id, title, description, status, created_at, updated_at;',
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
                created_at: '2025-12-26T10:00:00Z',
                updated_at: '2025-12-26T11:00:00Z'
            };

            pool.query.mockResolvedValue({
                rows: [mockUpdatedTask]
            });

            const updates = {
                title: 'Updated Task',
                description: 'Updated Description',
                status: 'completed'
            };

            const result = await TaskModel.updateTask(1, updates);

            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING id, title, description, status, created_at, updated_at;',
                ['Updated Task', 'Updated Description', 'completed', 1]
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

    describe('deleteTask', () => {
        test('should delete a task and return the deleted task id', async () => {
            pool.query.mockResolvedValue({
                rows: [{ id: 1 }]
            });

            const result = await TaskModel.deleteTask(1);

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

            const result = await TaskModel.deleteTask(999);

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

            const result = await TaskModel.deleteTask('1');

            expect(pool.query).toHaveBeenCalledWith(
                'DELETE FROM tasks WHERE id = $1 RETURNING id;',
                [1]
            );
            expect(result).toEqual({ id: 1 });
        });
    });
});
