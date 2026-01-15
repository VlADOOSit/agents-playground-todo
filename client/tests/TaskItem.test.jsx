import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TaskItem from '../src/components/TaskItem/TaskItem';

const baseTask = {
  id: 7,
  title: 'Initial title',
  description: 'Details go here',
  status: 'TODO',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
  deadline: null
};

describe('TaskItem', () => {
  it('expands to show details and allows delete', async () => {
    const onDelete = vi.fn();

    const { container } = render(
      <TaskItem
        task={baseTask}
        onDelete={onDelete}
        onUpdateStatus={vi.fn()}
        onUpdateTask={vi.fn()}
      />
    );

    expect(screen.getByText('Initial title')).toBeInTheDocument();
    await userEvent.click(container.querySelector('.expand-button'));
    expect(screen.getByText('Details go here')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it('edits a task and calls onUpdateTask with prepared data', async () => {
    const onUpdateTask = vi.fn();

    render(
      <TaskItem
        task={baseTask}
        onDelete={vi.fn()}
        onUpdateStatus={vi.fn()}
        onUpdateTask={onUpdateTask}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const titleInput = screen.getByPlaceholderText('Task Title');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated title');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdateTask).toHaveBeenCalledWith(7, {
      title: 'Updated title',
      description: 'Details go here',
      status: 'TODO',
      deadline: null
    });
  });
});
