import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TasksPage from '../src/pages/TasksPage/TasksPage';
import tasksApi from '../src/api/tasks';
import { TASKS_PER_PAGE } from '../src/utils/constant';

vi.mock('../src/api/tasks', () => ({
  default: {
    getAllTasks: vi.fn(),
    deleteTask: vi.fn(),
    restoreTask: vi.fn(),
    permanentDeleteTask: vi.fn(),
    cleanupDeletedTasks: vi.fn(),
    updateTask: vi.fn(),
    createTask: vi.fn()
  }
}));

const pageOne = {
  tasks: [
    {
      id: 1,
      title: 'Task A',
      description: 'Alpha',
      status: 'TODO',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      deadline: null
    }
  ],
  pagination: {
    totalPages: 2,
    totalTasks: 2
  }
};

const pageTwo = {
  tasks: [
    {
      id: 2,
      title: 'Task B',
      description: 'Beta',
      status: 'IN_PROGRESS',
      created_at: '2024-01-02T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z',
      deadline: null
    }
  ],
  pagination: {
    totalPages: 2,
    totalTasks: 2
  }
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TasksPage', () => {
  it('loads tasks and paginates', async () => {
    tasksApi.getAllTasks.mockImplementation((page = 1) => {
      return Promise.resolve(page === 1 ? pageOne : pageTwo);
    });
    tasksApi.cleanupDeletedTasks.mockResolvedValue({});

    render(<TasksPage />);

    expect(await screen.findByText('Task A')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Task B')).toBeInTheDocument();
    await waitFor(() => {
      expect(tasksApi.getAllTasks).toHaveBeenCalledWith(2, TASKS_PER_PAGE, 'ALL', 'createdAt');
    });
  });

  it('deletes a task and shows a toast', async () => {
    tasksApi.getAllTasks.mockResolvedValue(pageOne);
    tasksApi.deleteTask.mockResolvedValue({});
    tasksApi.cleanupDeletedTasks.mockResolvedValue({});

    render(<TasksPage />);

    expect(await screen.findByText('Task A')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(tasksApi.deleteTask).toHaveBeenCalledWith(1);
      expect(tasksApi.getAllTasks).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText('Task deleted')).toBeInTheDocument();
  });
});
