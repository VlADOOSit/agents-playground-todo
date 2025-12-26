jest.mock('../src/models/taskModel', () => ({
	getAll: jest.fn(),
	getTotalCount: jest.fn(),
	getById: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
}));

const taskModel = require('../src/models/taskModel');
const taskController = require('../src/controllers/taskController');

const createResponse = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	res.send = jest.fn().mockReturnValue(res);
	return res;
};

describe('TaskController', () => {
	describe('listTasks', () => {
		it('returns 400 for an invalid status filter', async () => {
			const req = { query: { status: 'INVALID' } };
			const res = createResponse();

			await taskController.listTasks(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Invalid status value' });
			expect(taskModel.getAll).not.toHaveBeenCalled();
			expect(taskModel.getTotalCount).not.toHaveBeenCalled();
		});

		it('returns paginated tasks with defaults', async () => {
			const tasks = [{ id: 1, title: 'test' }];
			taskModel.getAll.mockResolvedValue(tasks);
			taskModel.getTotalCount.mockResolvedValue(6);
			const req = { query: {} };
			const res = createResponse();

			await taskController.listTasks(req, res);

			expect(taskModel.getAll).toHaveBeenCalledWith({ limit: 5, offset: 0, status: undefined });
			expect(taskModel.getTotalCount).toHaveBeenCalledWith(undefined);
			expect(res.json).toHaveBeenCalledWith({
				tasks,
				page: 1,
				totalPages: 2,
				totalCount: 6,
			});
		});

		it('calculates pagination and filtering when page and status are provided', async () => {
			taskModel.getAll.mockResolvedValue([]);
			taskModel.getTotalCount.mockResolvedValue(0);
			const req = { query: { page: '3', status: 'TODO' } };
			const res = createResponse();

			await taskController.listTasks(req, res);

			expect(taskModel.getAll).toHaveBeenCalledWith({ limit: 5, offset: 10, status: 'TODO' });
			expect(taskModel.getTotalCount).toHaveBeenCalledWith('TODO');
			expect(res.json).toHaveBeenCalledWith({
				tasks: [],
				page: 3,
				totalPages: 1,
				totalCount: 0,
			});
		});

		it('responds with 500 on unexpected errors', async () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
			taskModel.getAll.mockRejectedValue(new Error('boom'));
			const req = { query: {} };
			const res = createResponse();

			await taskController.listTasks(req, res);

			expect(consoleSpy).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch tasks' });
			consoleSpy.mockRestore();
		});
	});

	describe('getTask', () => {
		it('returns 404 when a task is not found', async () => {
			taskModel.getById.mockResolvedValue(null);
			const req = { params: { id: '123' } };
			const res = createResponse();

			await taskController.getTask(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
		});

		it('returns a task when found', async () => {
			const task = { id: 1, title: 'Found task' };
			taskModel.getById.mockResolvedValue(task);
			const req = { params: { id: '1' } };
			const res = createResponse();

			await taskController.getTask(req, res);

			expect(res.json).toHaveBeenCalledWith(task);
		});
	});

	describe('createTask', () => {
		it('requires a non-empty title', async () => {
			const req = { body: { title: '   ' } };
			const res = createResponse();

			await taskController.createTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Title is required' });
			expect(taskModel.create).not.toHaveBeenCalled();
		});

		it('rejects invalid statuses', async () => {
			const req = { body: { title: 'Title', status: 'NOT_REAL' } };
			const res = createResponse();

			await taskController.createTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Invalid status value' });
			expect(taskModel.create).not.toHaveBeenCalled();
		});

		it('creates a task with valid payload', async () => {
			const newTask = { id: 1, title: 'New', status: 'TODO' };
			taskModel.create.mockResolvedValue(newTask);
			const req = { body: { title: 'New', description: 'desc' } };
			const res = createResponse();

			await taskController.createTask(req, res);

			expect(taskModel.create).toHaveBeenCalledWith({ title: 'New', description: 'desc', status: undefined });
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(newTask);
		});
	});

	describe('updateTask', () => {
		it('rejects empty title when provided', async () => {
			const req = { params: { id: '1' }, body: { title: '' } };
			const res = createResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Title cannot be empty' });
			expect(taskModel.update).not.toHaveBeenCalled();
		});

		it('rejects invalid statuses when provided', async () => {
			const req = { params: { id: '1' }, body: { status: '???' } };
			const res = createResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Invalid status value' });
			expect(taskModel.update).not.toHaveBeenCalled();
		});

		it('returns 404 if the model returns nothing', async () => {
			taskModel.update.mockResolvedValue(null);
			const req = { params: { id: '9' }, body: { title: 'Updated' } };
			const res = createResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
		});

		it('returns the updated task on success', async () => {
			const updatedTask = { id: 2, title: 'Updated title' };
			taskModel.update.mockResolvedValue(updatedTask);
			const req = { params: { id: '2' }, body: { title: 'Updated title', status: 'DONE' } };
			const res = createResponse();

			await taskController.updateTask(req, res);

			expect(taskModel.update).toHaveBeenCalledWith('2', {
				title: 'Updated title',
				description: undefined,
				status: 'DONE',
			});
			expect(res.json).toHaveBeenCalledWith(updatedTask);
		});
	});

	describe('deleteTask', () => {
		it('returns 404 when nothing is deleted', async () => {
			taskModel.delete.mockResolvedValue(false);
			const req = { params: { id: '3' } };
			const res = createResponse();

			await taskController.deleteTask(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
		});

		it('returns 204 on successful deletion', async () => {
			taskModel.delete.mockResolvedValue(true);
			const req = { params: { id: '3' } };
			const res = createResponse();

			await taskController.deleteTask(req, res);

			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.send).toHaveBeenCalled();
		});
	});
});
