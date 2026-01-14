import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TaskList from '../src/components/TaskList/TaskList';

const tasks = [
  {
    id: 1,
    title: 'First task',
    description: 'First description',
    status: 'TODO',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    deadline: null,
  },
  {
    id: 2,
    title: 'Second task',
    description: '',
    status: 'IN_PROGRESS',
    created_at: '2024-01-11T10:00:00Z',
    updated_at: '2024-01-11T10:00:00Z',
    deadline: null,
  },
];

describe('TaskList', () => {
  it('routes task interactions to callbacks', async () => {
    const onToggleExpand = vi.fn();
    const onDelete = vi.fn();
    const onStatusChange = vi.fn();
    const onEditStart = vi.fn();

    render(
      <TaskList
        tasks={tasks}
        expandedIds={new Set()}
        onToggleExpand={onToggleExpand}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onEditStart={onEditStart}
        editingTask={null}
        onSubmitEdit={vi.fn()}
        onCancelEdit={vi.fn()}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /toggle task details/i })[0]);
    expect(onToggleExpand).toHaveBeenCalledWith(1);

    await user.selectOptions(screen.getAllByRole('combobox')[0], 'DONE');
    expect(onStatusChange).toHaveBeenCalledWith(1, 'DONE');
  });

  it('renders the edit form for the active task', () => {
    render(
      <TaskList
        tasks={tasks}
        expandedIds={new Set([1])}
        onToggleExpand={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onEditStart={vi.fn()}
        editingTask={tasks[0]}
        onSubmitEdit={vi.fn()}
        onCancelEdit={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });
});
