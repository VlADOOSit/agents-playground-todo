import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTaskForm } from '../src/hooks/useTaskForm';

describe('useTaskForm', () => {
  it('submits prepared data and clears submitting state', async () => {
    const onSubmit = vi.fn();

    const { result } = renderHook(() => useTaskForm(null, { onSubmit }));

    act(() => {
      result.current.setTitle('New task');
      result.current.setDescription('Some details');
      result.current.setStatus('IN_PROGRESS');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New task',
      description: 'Some details',
      status: 'IN_PROGRESS',
      deadline: null
    });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('resets to initial data on cancel and reports changes', () => {
    const onCancel = vi.fn();
    const initialTask = {
      title: 'Seed task',
      description: 'Seed desc',
      status: 'TODO',
      deadline: null
    };

    const { result } = renderHook(() => useTaskForm(initialTask, { onCancel }));

    act(() => {
      result.current.setTitle('Edited title');
    });

    expect(result.current.hasChanges()).toBe(true);

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.title).toBe('Seed task');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
