import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TaskForm from '../src/components/TaskForm/TaskForm';
import tasksApi from '../src/api/tasks';

vi.mock('../src/api/tasks', () => ({
  default: {
    createTask: vi.fn()
  }
}));

describe('TaskForm', () => {
  it('submits a new task and notifies the parent', async () => {
    const onTaskCreated = vi.fn();
    const newTask = { id: 101, title: 'Write tests', description: 'Frontend coverage' };

    tasksApi.createTask.mockResolvedValue(newTask);

    render(<TaskForm onTaskCreated={onTaskCreated} />);

    await userEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    await userEvent.type(screen.getByPlaceholderText('Task Title'), 'Write tests');
    await userEvent.type(screen.getByPlaceholderText('Task Description'), 'Frontend coverage');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'IN_PROGRESS');

    await userEvent.click(screen.getByRole('button', { name: 'Add Task' }));

    await waitFor(() => {
      expect(tasksApi.createTask).toHaveBeenCalledWith({
        title: 'Write tests',
        description: 'Frontend coverage',
        status: 'IN_PROGRESS',
        deadline: null
      });
    });

    await waitFor(() => {
      expect(onTaskCreated).toHaveBeenCalledWith(newTask);
    });
  });
});
