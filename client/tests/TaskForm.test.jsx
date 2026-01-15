import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TaskForm from '../src/components/TaskForm/TaskForm';
import { getCreateDraftKey } from '../src/utils/taskDraft';

describe('TaskForm', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('submits trimmed values with a valid deadline', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<TaskForm onSubmit={onSubmit} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/title/i), '  Plan tests  ');
    await user.type(screen.getByLabelText(/description/i), '  Add coverage  ');
    await user.selectOptions(screen.getByLabelText(/status/i), 'IN_PROGRESS');
    await user.type(screen.getByLabelText(/deadline/i), '2024-06-10T12:30');

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const payload = onSubmit.mock.calls[0][0];

    expect(payload.title).toBe('Plan tests');
    expect(payload.description).toBe('Add coverage');
    expect(payload.status).toBe('IN_PROGRESS');
    expect(payload.deadline).not.toBeNull();
    expect(Number.isNaN(new Date(payload.deadline).getTime())).toBe(false);
  });

  it('restores a saved draft when requested', async () => {
    const onSubmit = vi.fn();
    const key = getCreateDraftKey();
    const now = Date.now();

    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        savedAt: now,
        values: {
          title: 'Draft title',
          description: 'Draft description',
          status: 'DONE',
          deadline: '2024-05-10T12:00:00Z',
        },
      }),
    );

    render(<TaskForm onSubmit={onSubmit} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /restore draft/i }));

    expect(screen.getByLabelText(/title/i)).toHaveValue('Draft title');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Draft description');
    expect(screen.getByLabelText(/status/i)).toHaveValue('DONE');
    expect(screen.getByLabelText(/deadline/i)).not.toHaveValue('');
  });
});
