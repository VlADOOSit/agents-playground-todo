jest.mock('../src/models/taskModel', () => ({
	getAll: jest.fn(),
	getTotalCount: jest.fn(),
	getById: jest.fn(),
	getDeletionState: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	undoDelete: jest.fn(),
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

		it('returns 400 for an invalid sort value', async () => {
			const req = { query: { sort: 'DROP TABLE' } };
			const res = createResponse();

			await taskController.listTasks(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Invalid sort value' });
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

			expect(taskModel.getAll).toHaveBeenCalledWith({ limit: 5, offset: 0, status: undefined, sort: 'createdAt' });
			expect(taskModel.getTotalCount).toHaveBeenCalledWith(undefined);
			expect(res.json).toHaveBeenCalledWith({
				tasks,
				page: 1,
				totalPages: 2,
				totalCount: 6,
				limit: 5,
			});
		});

		it('calculates pagination and filtering when page and status are provided', async () => {
			taskModel.getAll.mockResolvedValue([]);
			taskModel.getTotalCount.mockResolvedValue(0);
			const req = { query: { page: '3', status: 'TODO' } };
			const res = createResponse();

			await taskController.listTasks(req, res);

			expect(taskModel.getAll).toHaveBeenCalledWith({ limit: 5, offset: 10, status: 'TODO', sort: 'createdAt' });
			expect(taskModel.getTotalCount).toHaveBeenCalledWith('TODO');
			expect(res.json).toHaveBeenCalledWith({
				tasks: [],
				page: 3,
				totalPages: 1,
				totalCount: 0,
				limit: 5,
			});
		});

		it('passes the requested sort option through', async () => {
			taskModel.getAll.mockResolvedValue([]);
			taskModel.getTotalCount.mockResolvedValue(0);
			const req = { query: { sort: 'deadline' } };
			const res = createResponse();

			await taskController.listTasks(req, res);

			expect(taskModel.getAll).toHaveBeenCalledWith({ limit: 5, offset: 0, status: undefined, sort: 'deadline' });
		});

		it('uses a custom per-page limit when provided', async () => {
			taskModel.getAll.mockResolvedValue([]);
			taskModel.getTotalCount.mockResolvedValue(12);
			const req = { query: { page: '2', limit: '10' } };
			const res = createResponse();

			await taskController.listTasks(req, res);

			expect(taskModel.getAll).toHaveBeenCalledWith({ limit: 10, offset: 10, status: undefined, sort: 'createdAt' });
			expect(res.json).toHaveBeenCalledWith({
				tasks: [],
				page: 2,
				totalPages: 2,
				totalCount: 12,
				limit: 10,
			});
		});

		it('responds with 500 on unexpected errors', async () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
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

		it('rejects invalid deadline format', async () => {
			const req = { body: { title: 'Title', deadline: '2025-01-01 10:00' } };
			const res = createResponse();

			await taskController.createTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Deadline must be an ISO datetime string' });
			expect(taskModel.create).not.toHaveBeenCalled();
		});

		it('creates a task with valid payload', async () => {
			const newTask = { id: 1, title: 'New', status: 'TODO' };
			taskModel.create.mockResolvedValue(newTask);
			const req = { body: { title: 'New', description: 'desc' } };
			const res = createResponse();

			await taskController.createTask(req, res);

			expect(taskModel.create).toHaveBeenCalledWith({
				title: 'New',
				description: 'desc',
				status: undefined,
				deadline: undefined,
			});
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(newTask);
		});

		it('trims and forwards a valid ISO deadline', async () => {
			const newTask = {
				id: 2,
				title: 'With deadline',
				status: 'TODO',
				deadline: '2025-02-01T10:00:00Z',
			};
			taskModel.create.mockResolvedValue(newTask);
			const req = { body: { title: 'With deadline', deadline: ' 2025-02-01T10:00:00Z  ' } };
			const res = createResponse();

			await taskController.createTask(req, res);

			expect(taskModel.create).toHaveBeenCalledWith({
				title: 'With deadline',
				description: undefined,
				status: undefined,
				deadline: '2025-02-01T10:00:00Z',
			});
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

		it('rejects invalid deadline when provided', async () => {
			const req = { params: { id: '1' }, body: { deadline: '2025-01-01 10:00' } };
			const res = createResponse();

			await taskController.updateTask(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: 'Deadline must be an ISO datetime string' });
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
				deadline: undefined,
			});
			expect(res.json).toHaveBeenCalledWith(updatedTask);
		});

		it('clears the deadline when null or empty is provided', async () => {
			const updatedTask = { id: 5, title: 'No deadline', deadline: null };
			taskModel.update.mockResolvedValue(updatedTask);
			const req = { params: { id: '5' }, body: { deadline: '   ' } };
			const res = createResponse();

			await taskController.updateTask(req, res);

			expect(taskModel.update).toHaveBeenCalledWith('5', {
				title: undefined,
				description: undefined,
				status: undefined,
				deadline: null,
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

	describe('undoDelete', () => {
		it('returns 404 when the task does not exist', async () => {
			taskModel.getDeletionState.mockResolvedValue(null);
			const req = { params: { id: '99' } };
			const res = createResponse();

			await taskController.undoDelete(req, res);

			expect(taskModel.getDeletionState).toHaveBeenCalledWith('99');
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Task not found' });
		});

		it('returns 409 when the task is not deleted', async () => {
			taskModel.getDeletionState.mockResolvedValue({ id: '1', deleted_at: null });
			const req = { params: { id: '1' } };
			const res = createResponse();

			await taskController.undoDelete(req, res);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({ error: 'Task is not deleted' });
			expect(taskModel.undoDelete).not.toHaveBeenCalled();
		});

		it('returns 409 when the undo window is expired', async () => {
			const past = new Date(Date.now() - 6000).toISOString();
			taskModel.getDeletionState.mockResolvedValue({ id: '1', deleted_at: past });
			const req = { params: { id: '1' } };
			const res = createResponse();

			await taskController.undoDelete(req, res);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({ error: 'Undo window expired' });
			expect(taskModel.undoDelete).not.toHaveBeenCalled();
		});

		it('restores a task within the allowed window', async () => {
			const recent = new Date(Date.now() - 2000).toISOString();
			const restored = { id: '4', title: 'Restored' };
			taskModel.getDeletionState.mockResolvedValue({ id: '4', deleted_at: recent });
			taskModel.undoDelete.mockResolvedValue(restored);
			const req = { params: { id: '4' } };
			const res = createResponse();

			await taskController.undoDelete(req, res);

			expect(taskModel.undoDelete).toHaveBeenCalledWith('4', 5);
			expect(res.json).toHaveBeenCalledWith(restored);
		});

		it('returns 409 when the model cannot undo the deletion', async () => {
			const recent = new Date(Date.now() - 2000).toISOString();
			taskModel.getDeletionState.mockResolvedValue({ id: '5', deleted_at: recent });
			taskModel.undoDelete.mockResolvedValue(null);
			const req = { params: { id: '5' } };
			const res = createResponse();

			await taskController.undoDelete(req, res);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({ error: 'Undo window expired' });
		});

		it('returns 500 on unexpected errors', async () => {
			const recent = new Date().toISOString();
			taskModel.getDeletionState.mockResolvedValue({ id: '6', deleted_at: recent });
			taskModel.undoDelete.mockRejectedValue(new Error('db error'));
			const req = { params: { id: '6' } };
			const res = createResponse();

			await taskController.undoDelete(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Failed to undo delete' });
		});
	});
});
