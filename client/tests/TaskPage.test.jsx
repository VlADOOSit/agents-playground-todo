import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TaskPage from '../src/pages/TaskPage/TaskPage';
import { createTask, getTasks } from '../src/api/tasks';

vi.mock('../src/api/tasks', () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  undoDeleteTask: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <TaskPage />
    </MemoryRouter>,
  );

const makeTask = (overrides = {}) => ({
  id: 1,
  title: 'Sample task',
  description: 'Details',
  status: 'TODO',
  created_at: '2024-01-10T10:00:00Z',
  updated_at: '2024-01-10T10:00:00Z',
  deadline: null,
  ...overrides,
});

describe('TaskPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders tasks', async () => {
    getTasks.mockResolvedValueOnce({
      tasks: [makeTask()],
      page: 1,
      totalPages: 1,
      totalCount: 1,
    });

    renderPage();

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    expect(await screen.findByText('Sample task')).toBeInTheDocument();

    expect(getTasks).toHaveBeenCalledWith({ page: 1, status: undefined, sort: 'createdAt', limit: 5 });
  });

  it('changes filters and requests the new status', async () => {
    getTasks
      .mockResolvedValueOnce({
        tasks: [makeTask()],
        page: 1,
        totalPages: 1,
        totalCount: 1,
      })
      .mockResolvedValueOnce({
        tasks: [],
        page: 1,
        totalPages: 1,
        totalCount: 0,
      });

    renderPage();
    await screen.findByText('Sample task');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /done/i }));

    await waitFor(() => expect(getTasks).toHaveBeenLastCalledWith({ page: 1, status: 'DONE', sort: 'createdAt', limit: 5 }));
    expect(screen.getByText(/no tasks match/i)).toBeInTheDocument();
  });

  it('creates a task from the form', async () => {
    getTasks.mockResolvedValueOnce({
      tasks: [],
      page: 1,
      totalPages: 1,
      totalCount: 0,
    });
    createTask.mockResolvedValueOnce({ id: 99 });

    renderPage();
    await screen.findByText(/no tasks yet/i);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /\+ new task/i }));
    await user.type(screen.getByLabelText(/title/i), '  New task  ');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => expect(createTask).toHaveBeenCalledTimes(1));
    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
      }),
    );
  });
});
